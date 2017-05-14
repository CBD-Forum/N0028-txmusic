pragma solidity ^0.4.10;
contract Log {
    string public constant contractVersion = "v1.0";

    event listen(address indexed owner, address indexed buyer, address work, address indexed license, uint money, uint purpose, uint nowTime);
    event share(address indexed sharer, address indexed work, uint money, uint nowTime);

    event workReleased(address indexed owner, string title, string artist, uint nowTime);
    event licenseReleased(address indexed owner, address work, address indexed lisence, bytes32 indexed title, bytes32 artist, uint nowTime);
    event licenseUpdate(address sender, uint version, uint nowTime);

    modifier noCoins {
        if (msg.value > 0) throw;
        _;
    }

    function Log() noCoins {

    }

    function listenEvent(address owner, address buyer, address work, address license, uint money, uint purpose) noCoins {
        listen(owner, buyer, work, license, money, purpose, now);
    }

    function shareEvent(address buyer, address work, uint money) noCoins {
        share(buyer, work, money, now);
    }

    function licenseUpdateEvent(uint version) noCoins {
        licenseUpdate(msg.sender, version, now);
    }

    function workReleasedEvent(address owner, string title, string artist) noCoins {
        workReleased(owner, title, artist, now);
    }

    function licenseReleasedEvent(address owner, address work, address lisence, bytes32 title, bytes32 artist) noCoins {
        licenseReleased(owner,  work, lisence,title, artist, now);
    }

    function() {
        throw;
    }
}

contract Work {
    string public constant contractVersion = "v1.0";

    Log public log;
    string public title;
    string public artist;
    string public metadataUrl;
    string public imageUrl;
    uint public authTime;

    function Work(
        address _logAddress,
        string _title,
        string _artist,
        string _imageUrl,
        string _metadataUrl
    ) {
        log = Log(_logAddress);
        title = _title;
        artist = _artist;
        metadataUrl = _metadataUrl;
        imageUrl = _imageUrl;
        authTime = now;
        log.workReleasedEvent(msg.sender, _title, _artist);
    }

    function stringToBytes32(string memory source) returns (bytes32 result) {
        assembly {
            result := mload(add(source, 32))
        }
    }

    function getTitle() public returns (bytes32) {
        return stringToBytes32(title);
    }

    function getArtist() public returns (bytes32) {
        return stringToBytes32(artist);
    }

    function getAuthTime() returns (uint) {
        return authTime;
    }
}

contract License {
    string public constant contractVersion = "v1.0";

    address public owner;
    address public workAddress;
    string public resourceUrl;
    string public metadataUrl;

    uint public playPrice;
    uint public buyPrice;
    mapping(address => address[]) buyers;// 购买版权人 licenseAddress => userAddress[]

    bool[] public isParent;
    bool[] public hasParent;
    uint[] public parents;
    address[] public contributors;
    uint[] public shares;
    bytes32[] public benefitTypes;

    Log private log;

    uint public playCount;
    uint public buyCount;
    uint public totalEarned;
    uint public licenseVersion;
    uint public metadataVersion;
    mapping(address => string) private url;

    Work private work;

    event listenEvent(address indexed owner, address indexed buyer, address work, address indexed license, uint money, uint purpose);
    event shareEvent(address indexed sharer, address indexed work, uint money);
    event licenseUpdateEvent(uint version);

    function License (
        address _logAddress,
        address _workAddress,
        uint _playPrice,
        uint _buyPrice,
        string _resourceUrl,
        string _metadataUrl,
        bool[] _isParent,
        bool[] _hasParent,
        uint[] _parents,
        address[] _contributors,
        uint[] _shares,
        bytes32[] _benefitTypes
    ) {
        log = Log(_logAddress);
        workAddress = _workAddress;
        owner = msg.sender;
        resourceUrl = _resourceUrl;
        metadataUrl = _metadataUrl;

        validate(
            _isParent,
            _hasParent,
            _parents,
            _contributors,
            _shares,
            _benefitTypes
        );
        set(
            _playPrice,
            _buyPrice,
            _isParent,
            _hasParent,
            _parents,
            _contributors,
            _shares,
            _benefitTypes
        );

        work = Work(_workAddress);
        bytes32 title = work.getTitle();
        bytes32 artist = work.getArtist();
        log.licenseReleasedEvent(owner, workAddress, this, title, artist);
    }

    modifier adminOnly {
        if (msg.sender != owner) throw;
        if (msg.value > 0) throw;
        _;
    }

    modifier noCoins {
        if (msg.value > 0) throw;
        _;
    }

    function() payable {

    }

    function play(uint8 purpose) payable {
        uint money;
        uint count;
        if(purpose == 1) {
            money = playPrice * 1 ether;
        } else if(purpose == 2) {
            money = buyPrice * 1 ether;
        } else {
            money = this.balance;
        }
        if(msg.value < money) throw;
        uint refund = msg.value - money;
        if(refund>0) {
            msg.sender.transfer(refund);
        }
        if(purpose == 1) {
            playCount += 1;
        } else {
            buyCount += 1;
            buyers[this].push(msg.sender);
        }
        url[msg.sender] = resourceUrl;
        pay(money);
        totalEarned += money;

        listenEvent(owner, msg.sender, workAddress, this, money, purpose);
        log.listenEvent(owner, msg.sender, workAddress, this, money, purpose);
    }

    function pay(uint money) payable {
        for (uint i=0; i<shares.length; i++){
            if (isParent[i] == false) {
                uint value;
                if (hasParent[i] == true) {
                    value = money * shares[i] * shares[parents[i]] / 10000;
                } else {
                    value = money * shares[i] / 100;
                }
                contributors[i].transfer(value);
                shareEvent(contributors[i], workAddress, value);
                log.shareEvent(contributors[i], workAddress, value);
            }
        }
    }

    function isBuyer(address licenseAddr, address buyerAddr) constant returns(bool) {
        address[] tmps = buyers[licenseAddr];
        for(uint k=0; k<tmps.length; k++) {
            if(buyerAddr == tmps[k]) {
                return true;
            }
        }
        return false;
    }

    function getPlayInfo() constant returns (address[], uint[], bytes32[]){
        uint length = 0;
        for (uint j=0; j<isParent.length; j++){
            if (isParent[j] == false) {
                length += 1;
            }
        }
        address[] memory contributorsInfo = new address[](length);
        uint[] memory sharesInfo = new uint[](length);
        bytes32[] memory benefitTypesInfo = new bytes32[](length);

        uint m = 0;
        for (uint i=0; i<shares.length; i++){
            if (isParent[i] == false) {
                if (hasParent[i] == true) {
                    sharesInfo[m] = shares[i] * shares[parents[i]] / 100;
                } else {
                    sharesInfo[m] = shares[i];
                }
                contributorsInfo[m] = contributors[i];
                benefitTypesInfo[m] = benefitTypes[i];
                m += 1;
            }
        }
        return (contributorsInfo, sharesInfo, benefitTypesInfo);
    }

    function getURL() constant returns(string, bytes32, bytes32, uint) {
        bytes32 title = work.getTitle();
        bytes32 artist = work.getArtist();
        uint authTime = work.getAuthTime();
        return (url[msg.sender], title, artist, authTime);
    }

    function validate(
        bool[] _isParent,
        bool[] _hasParent,
        uint[] _parents,
        address[] _contributors,
        uint[] _shares,
        bytes32[] _benefitTypes
    ) internal {
        if (
            _isParent.length != _hasParent.length ||
            _hasParent.length != _parents.length ||
            _parents.length != _contributors.length ||
            _contributors.length != _shares.length ||
            _shares.length != _benefitTypes.length
        ) {
            throw;
        }

        uint total;
        for (uint i=0; i<_parents.length; i++) {
            if (_isParent[i] == true){
                total += _shares[i];
            } else if (_hasParent[i] == false) {
                total += _shares[i];
            }
        }
        if (total != 100) throw;

        for (uint j=0; j<_parents.length; j++) {
            if (_isParent[j] == true){
                uint parent_total = 0;
                for (uint m=0; m<_parents.length; m++) {
                    if (_parents[m] == j && _hasParent[m] == true) {
                        parent_total += _shares[m];
                    }
                }
                if (parent_total != 100) throw;
            }
        }
    }

    function set(
        uint _playPrice,
        uint _buyPrice,
        bool[] _isParent,
        bool[] _hasParent,
        uint[] _parents,
        address[] _contributors,
        uint[] _shares,
        bytes32[] _benefitTypes
    ) internal {
        playPrice = _playPrice;
        buyPrice = _buyPrice;
        isParent = _isParent;
        hasParent = _hasParent;
        parents = _parents;
        contributors = _contributors;
        shares = _shares;
        benefitTypes = _benefitTypes;
    }


    function updateLicense(
        uint _playPrice,
        uint _buyPrice,
        bool[] _isParent,
        bool[] _hasParent,
        uint[] _parents,
        address[] _contributors,
        uint[] _shares,
        bytes32[] _benefitTypes
    ) adminOnly {
        validate(
            _isParent,
            _hasParent,
            _parents,
            _contributors,
            _shares,
            _benefitTypes
        );
        set(
            _playPrice,
            _buyPrice,
            _isParent,
            _hasParent,
            _parents,
            _contributors,
            _shares,
            _benefitTypes
        );
    }

    function kill() adminOnly {
        if (this.balance > 0) {
            play(3);
        }
        selfdestruct(owner);
    }
}

// "0x43c19E3B271C3837d3657cB66aeE0E65FF55322A","0x39300AA9deC409F570F776624D475A0EcEA84aB0",100,100,"qq","dd",[true,false,false,false],[false,true,true,false],[0,0,0,0],["0x0","0x4972160fDc51F51f50c0429512e716bDE934c0A4","0x6Cd89eF00282b4a23da80A91Bd395Cd39c9f722D","0xefFf2bA576d3421AA91c27A6F0f6DBAE8079cd2B"],[50,50,50,50],["producer","singer","writer","artist"]

// [true,false,false,false]
// [false,true,true,false]
// [0,0,0,0]
// ["0x0","0x4972160fDc51F51f50c0429512e716bDE934c0A4","0x6Cd89eF00282b4a23da80A91Bd395Cd39c9f722D","0xefFf2bA576d3421AA91c27A6F0f6DBAE8079cd2B"]
// [50,50,50,50]
// ["producer","singer","writer","artist"]

