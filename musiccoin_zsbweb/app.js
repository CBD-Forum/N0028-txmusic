var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Web3 = require("web3");
var abi = require('./public/js/json/abi.json');
var LOGADDR = abi.logAddr;
var LOGABI = abi.logAbi;
var WORKABI = abi.workAbi;
var WORKBIN = abi.workBin;
var LICENSEABI = abi.licenseAbi;
var LICENSEBIN = abi.licenseBin;
app.use(express.static('public'));
app.use(express.static('public/views'));
//解决跨域问题
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    next();
});
app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  // web3 = new Web3(new Web3.providers.HttpProvider("http://10.168.195.51:8545"));
  // web3 = new Web3(new Web3.providers.HttpProvider("http://10.168.195.224:8545"));
}
//查看账户
//console.log(web3.eth.coinbase);
// console.log(web3.eth.accounts)
// http://10.168.195.224:8545
// 0xf599b54145d676adb93a65ad9fc60f5156184c31
// 0x87cdbee2dbbc60b4476ca146b3164ab206ea7cde
// 0x16899A2536d94b49324932e3aE66B2d8418dA55B
// 0x215571459c798770394888feA1A5eA4dBE775DFE

// http://10.168.120.121:8545
// 0xed6f4e8a38fdf92170b826315eaafdbd793c7d37
// 0x327192220b13cfafba6c205a079836df94c7d28e
// 0xe3fe086096f35da9a6303a9fbb01d2de4e0c4d49
// 0xd576f094083772a0318dd579efd1670146164042

// http://10.168.195.51:8545
// 0x1fa95eec0ac7c84ca0e6d141571164b27c194145
// 0xffdaec7c3072b1d5f6a18527dc1a1969b989e322
// 0xf682a5a672c0286b2f54259d3180183a08bb2d3c
// 0x9390b697ae5d9adaf1288b8fb98abedd462608fa
// 0x91be687e626c0afb19d4e9966b1aab97f058e8a1

// web3.eth.accounts[2]:0x0ab2bdd4e423d6be7cf6cd9ee1e5276e1dabfe36
// web3.eth.accounts[3]:0xff27c4c5376d2524279a2f3e634e18ea85cfc885
// web3.eth.accounts[4]:0xcd37a81ced709487d14d3d649fc394e2abb0eb2e


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// 调取workReleased事件，显示已认证歌曲列表
app.post('/songsList', function(req, res){
  //console.log(req.body.authsong);
  var authsong = req.body.authsong;
  //合约部署成功后，myContract调取主链，监听刚部署上的Work合约中的event
  if(req.body.authsong){
    var sender = {
      // sender:LOGADDR,
      owner:web3.eth.accounts[0]
    }
  }else{
    var sender = {
      // sender:LOGADDR
    }
  }
  var _arr = [];
  var myContract1 = web3.eth.contract(LOGABI).at(LOGADDR);
  var event = myContract1.licenseReleased(sender,{fromBlock:0, toBlock:'latest'});
  event.get(function(err,result){
    for(var i=0,len=result.length;i<len;i++){
      if(result[i].args.title){
        // var workAddr = result[i].args.work;
        // var workContract = web3.eth.contract(WORKABI).at(workAddr);
        // var title = workContract.title.call();
        // var artist = workContract.artist.call();
        //web3.toUtf8 编译bytes32
        var artist = web3.toUtf8(result[i].args.artist);
        var title = web3.toUtf8(result[i].args.title);
        var lisence = result[i].args.lisence;
        //用于列表排序的时间戳
        var time = web3.toDecimal(result[i].args.nowTime)
        if(authsong){
          var lisenceContract = web3.eth.contract(LICENSEABI).at(lisence);
          var playCount = lisenceContract.playCount.call().toNumber();
          var buyCount = lisenceContract.buyCount.call().toNumber();
          _arr.push({title:title,artist:artist, lis:lisence,time:time,playCount:playCount,buyCount:buyCount})
        }else{
          _arr.push({title:title,artist:artist, lis:lisence,time:time});
        }
      }
    }
    //根据时间戳，将歌曲列表进行排序
    var newarr =  _arr.sort(function(a,b){
      return a.time - b.time;
    }).reverse();
    //console.log(newarr)

    res.send({success:10,data:newarr});
  })
  //获取账户钱数的方法
  //console.log(web3.fromWei(web3.eth.getBalance(web3.eth.coinbase), 'ether').toNumber());
});

/***
  发现歌曲页面:点击播放/购买版权按钮,调取licenseReleased事件,显示歌曲所需费用
***/
app.post('/broadcastSong', function(req,res){
  var _arr = [];
  //console.log(req.body.addr);
  var licenseAddr = req.body.addr;
  var number = parseInt(req.body.num);
  var action = req.body.action;
  //实例化lisenceContract合约
  var lisenceContract = web3.eth.contract(LICENSEABI).at(licenseAddr);
  //账户总金额
  var coinbaseM = web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]), 'ether').toNumber();
  var perPlay,perBuy;
  // console.log(number);
  // console.log(typeof number);
  var result = lisenceContract.isBuyer(licenseAddr,web3.eth.accounts[0]);
  //console.log(result);
  if(!result){
    if(number === 1){
      perPlay = lisenceContract.playPrice.call().toNumber();
      _arr.push({per:perPlay,coinbaseM:coinbaseM,licenseAddr:licenseAddr,number:number,action:action});
    }else{
      perBuy = lisenceContract.buyPrice.call().toNumber();
      _arr.push({per:perBuy,coinbaseM:coinbaseM,licenseAddr:licenseAddr,number:number,action:action});
    }
    res.send({success:1,data:_arr});
  }else{
    res.send({success:2,data:'您已购买过歌曲'});
  }
  // console.log(_arr);

});
/***
  发现歌曲页面:输入密码，点击确认支付按钮接口
***/
app.post('/confirmPay', function(req,res){
  var licenseAddr = req.body.addr;
  var playVal = req.body.playVal;
  var password = req.body.password;
  var number = parseInt(req.body.num);
  var action = req.body.action;
  // console.log(number);
  // console.log(action);
  // console.log(licenseAddr);
  // console.log(typeof licenseAddr);
  // console.log(web3.isAddress(licenseAddr));

  web3.personal.unlockAccount(web3.eth.accounts[0],password);
  var lisenceContract = web3.eth.contract(LICENSEABI).at(licenseAddr);
  var hash;
  hash = lisenceContract.play.sendTransaction(number,{from:web3.eth.accounts[0], gas:3000000, value:web3.toWei(playVal,'ether')});
  //var hash = lisenceContract.play.sendTransaction(number,{from:web3.eth.coinbase, gas:3000000, value:web3.toWei(playVal,'ether')});
  // console.log(6767);
  // console.log(hash);
  var filter = web3.eth.filter("latest");
  filter.watch(function(err, result) {
      if(err) {
          //console.log(err);
      } else {
          //console.log("Block hash is " + result);
          var block = web3.eth.getBlock(result, true);
          // console.log(block);
          var transactions = block.transactions;
          for(var i=0; i<transactions.length; i++) {
              if(hash == transactions[i].hash) {
                  //console.log('Transaction has mined!');
                  filter.stopWatching();
                  var obj_arr;
                  var new_arr = [];
                  obj_arr = lisenceContract.getURL();
                  new_arr.push(web3.toUtf8(obj_arr[1]));
                  new_arr.push(web3.toUtf8(obj_arr[2]));
                  new_arr.push(obj_arr[3].toNumber());
                  new_arr.push(action);
                  new_arr.push(licenseAddr);
                  //console.log(new_arr)
                  res.send({"success":1,data:new_arr});
              }
          }
      }
   });
});
/***
  发现歌曲页面：点击详情按钮，调取接口显示新页面
  认证歌曲页面：点击查看按钮，调取接口显示新页面
***/
app.post('/detailMess',function(req,res){
  var licenseAddr = req.body.addr;
  var action = req.body.action;
  var lisenceContract = web3.eth.contract(LICENSEABI).at(licenseAddr);
  var new_arr = [];
  // console.log(licenseAddr)
  // console.log(action)
  var result = lisenceContract.isBuyer(licenseAddr,web3.eth.accounts[0]);
  //console.log(result);
  if(req.body.page){
    var obj_arr = lisenceContract.getURL();
    new_arr.push(web3.toUtf8(obj_arr[1]));
    new_arr.push(web3.toUtf8(obj_arr[2]));
    new_arr.push(obj_arr[3].toNumber());
    new_arr.push(action);
    new_arr.push(licenseAddr);
    res.send({"success":1,data:new_arr});
  }else{
    if(!result){
      var obj_arr = lisenceContract.getURL();
      new_arr.push(web3.toUtf8(obj_arr[1]));
      new_arr.push(web3.toUtf8(obj_arr[2]));
      new_arr.push(obj_arr[3].toNumber());
      new_arr.push(action);
      new_arr.push(licenseAddr);
      res.send({"success":1,data:new_arr});
    }else{
      res.send({success:2,data:'您已购买过歌曲'});
    }
  }
});
//购买记录
app.post('/purchaseRecord',function(req,res){
  var Client=web3.eth.contract(LOGABI).at(LOGADDR);
   		var event=Client.listen({
				// sender:LOGADDR,
				buyer:web3.eth.accounts[0]
			},{fromBlock:0,toBlock:'latest'});
			event.get(function(error,result){
				// console.log(web3.eth.accounts[4]);
				// console.log(typeof(web3.eth.accounts[4]));
				// console.log(result);
				var arr=[];
				for (var i=0;i<result.length;i++) {
					var workAddr=result[i].args.work;
					var workContract=web3.eth.contract(WORKABI).at(workAddr);
					var title=workContract.title.call();
					var artist=workContract.artist.call();
					var lisence=result[i].args.license;
					var itstime=result[i].args.nowTime.toNumber();
					var purpose=result[i].args.purpose.toNumber();
					//console.log(lisence);
					arr.push({title:title,artist:artist,lisence:lisence,itstime:itstime,purpose:purpose});
				}
				// console.log(arr);
        var new_arr = arr.sort(function(a,b){
          return a.itstime - b.itstime;
        }).reverse();
				res.send({success:1,data:new_arr});
 })

});
/***
  歌曲播放页面，区块链记录table表单信息接口
***/
app.post('/blockRecord',function(req,res){
  var new_arr = [];
  var myContract1 = web3.eth.contract(LOGABI).at(LOGADDR);
  var event = myContract1.listen({
    // sender:LOGADDR
  },{fromBlock:0, toBlock:'latest'});
  event.get(function(err,result){
    // console.log(result);
    for(var i = 0; i < result.length; i++){
      if(result[i].address){
        var buyer = result[i].args.buyer;
        var time = result[i].args.nowTime.toNumber();
        var purpose = result[i].args.purpose;
        new_arr.push({buyer:buyer,time:time,purpose:purpose})
      }
    }
    var newarr =  new_arr.sort(function(a,b){
      return a.time - b.time;
    }).reverse();
    // console.log(new_arr);
    res.send({success:10,data:newarr});
  });
});
/***
  歌曲播放页面，版权信息table表单信息接口
***/
app.post('/coprMess',function(req,res){
  var lisence = req.body.lisence;
  //console.log(lisence);
  var lisenceContract = web3.eth.contract(LICENSEABI).at(lisence);
  var playPrice = lisenceContract.playPrice.call().toNumber();
  var buyPrice = lisenceContract.buyPrice.call().toNumber();
  var shares_newArr = [],benefit_newArr = [];
  var obj_arr = lisenceContract.getPlayInfo();
  // console.log(obj_arr);
  var contributors_arr = obj_arr[0];
  var shares_arr = obj_arr[1];
  var benefit_arr = obj_arr[2];
  //对getPlayInfo方法中的数据进行处理
  for(var i = 0; i < shares_arr.length; i++){
    shares_newArr.push(shares_arr[i].toNumber());
  }
  for(var i = 0; i < benefit_arr.length; i++){
    //console.log(benefit_arr[i]);
    benefit_newArr.push(web3.toUtf8(benefit_arr[i]));
  }
  var new_arr = [];
  new_arr.push(contributors_arr);
  new_arr.push(shares_newArr);
  new_arr.push(benefit_newArr);
  // console.log(new_arr);
  //二维数组纵向取值并重组成新的二维数组
  var newArr = new_arr[0].map(function(col,i){
    return new_arr.map(function(row){
      return row[i];
    })
  });
  // console.log(newArr);
  //将对象转换成对象数组，便于页面取值
  var array1 = [],array2 = [];
  for(var i = 0; i < newArr.length; i++){
    array1.push({owner:newArr[i][0],right:newArr[i][1],type:newArr[i][2]});
  }
  array2.push({playPrice:playPrice,buyPrice:buyPrice});
  // console.log(array);
  res.send({"success":1,data1:array1,data2:array2});
});

//账户明细调用listen
app.post('/accountDetailList', function(req, res){
  //合约部署成功后，myContract调取主链，监听刚部署上的Work合约中的event
  //获取账户余额
  var balance = web3.eth.getBalance(web3.eth.accounts[0]).toNumber();
  // console.log(web3.fromWei(balance,"ether"))
  //转换单位
  var Obalance = web3.fromWei(balance,"ether");
  var _arr = [];
  var _count = [];
  var myContract1 = web3.eth.contract(LOGABI).at(LOGADDR);
  if(req.body.a ==1){
    event = myContract1.listen({
      sender:LOGADDR,
      buyer:web3.eth.coinbase
    },{fromBlock:0, toBlock:'latest'});
    event.get(function(err,result){
      var i = 0;
      var j = 0;
      _count = [];
      for(var x in result){
        var _purpose = result[x].args.purpose.toNumber();
        if(_purpose==1){
          i++;
        }
        if(_purpose==2){
          j++;
        }
      }
      _count.push({ptimes:i,buySongs:j,balance:Obalance})
      res.send({data_1:_count})
    })

  }
  else{
    event = myContract1.listen({
      sender:LOGADDR
    },{fromBlock:0, toBlock:'latest'});
    event.get(function(err,result){
        _arr = [];
       // var i = 0;
        //var j = 0;
      for(var i in result){
        var _data = result[i].args;
        var _purpose = result[i].args.purpose.toNumber();
        //处理money数据 使之成为数字而不是一串
        var coinbaseM = web3.fromWei(result[i].args.money, 'ether').toNumber();
        _arr.push({work:_data.work,money:coinbaseM,buyer:_data.buyer,nowTime:_data.nowTime,purpose:_purpose,balance:Obalance});

      }

      res.send({success:10,data:_arr});
    })
  }
});

//账户明细页面调用share
app.post('/accountDetailList1', function(req, res){
  //合约部署成功后，myContract调取主链，监听刚部署上的Work合约中的event
  var _arr = [];
  var myContract1 = web3.eth.contract(LOGABI).at(LOGADDR);
  var event = myContract1.share({
    sender:LOGADDR
  },{fromBlock:0, toBlock:'latest'});
  event.get(function(err,result){
    _arr = [];
    for(var i in result){
      var _data = result[i].args;
      //处理money数据 使之成为数字而不是一串
      var coinbaseM = web3.fromWei(result[i].args.money, 'ether').toNumber();
        _arr.push({work:_data.work,money:coinbaseM,sharer:_data.sharer,nowTime:_data.nowTime});
    }
    res.send({success:10,data:_arr});
  })
  //获取账户钱数的方法
  // console.log(web3.fromWei(web3.eth.getBalance(web3.eth.coinbase), 'ether').toNumber());
});

//账户中心数据调用
app.post('/accountCenter', function(req, res){
  //合约部署成功后，myContract调取主链，监听刚部署上的Work合约中的event
  var _arr = [];
  var myContract1 = web3.eth.contract(LOGABI).at(LOGADDR);
  var event = myContract1.workReleased({
    sender:LOGADDR,
    owner:web3.eth.coinbase
  },{fromBlock:0, toBlock:'latest'});
  event.get(function(err,result){
    _arr = [];
    var j = 0;
    for(var i in result){
      j++
    }
    _arr.push({Csongs:j})
    // console.log(j)
    res.send({success:10,data:_arr});
  })
});

app.post('/attestSong',function(req,res){
  var _body = req.body;
  var isP_arr = [], hasP_arr = [];
  var logAddress = LOGADDR,
      title = _body.title,
      artist = _body.artist,
      imageUrl = _body.imageUrl,
      metadataUrl = _body.metadataUrl,
      playPrice = _body.playPrice,
      buyPrice = _body.buyPrice,
      password = _body.password,
      //前台传过来的是一个字符串，后台需要的是数组，用split方法将字符串变成数组
      isParent = _body.isParent.split(','),
      hasParent = _body.hasParent.split(','),
      parents = _body.parents.split(','),
      contributors = _body.contributors.split(','),
      shares = _body.shares.split(','),
      benefitTypes = _body.benefitTypes.split(',');
  //console.log(typeof password);
  //split()方法将boolean类型的字符串分割成string类型的字符串，在这里
  //需要重新遍历赋值
  var benefitTypes_arr = [];
  for(var i = 0; i < isParent.length; i++){
    benefitTypes_arr.push(web3.fromUtf8(benefitTypes[i]));
    if(isParent[i] == 'true'){
      isP_arr.push(true);
    }else{
      isP_arr.push(false);
    }

  }

  for(var i = 0; i < hasParent.length; i++){
    if(hasParent[i] == 'true'){
      hasP_arr.push(true);
    }else{
      hasP_arr.push(false);
    }
  }

  //支付密码验证
  web3.personal.unlockAccount(web3.eth.coinbase,password);
  // console.log(password);
  // web3.personal.unlockAccount(web3.eth.coinbase,'12345');
  var workContract = web3.eth.contract(WORKABI);
  var work = workContract.new(
      logAddress,
      title,
      artist,
      imageUrl,
      metadataUrl,
   {
     from: web3.eth.coinbase,
     data: WORKBIN,
     gas: '4700000'
   }, function (e, contract){
      //console.log(web3.eth.getBlock("latest").gasLimit);
      // console.log(work);
      if(contract.address){
        var _logAddress = LOGADDR;
        var _workAddress = contract.address;
        var _playPrice = playPrice;
        var _buyPrice = buyPrice;
        var _resourceUrl = imageUrl;
        var _metadataUrl = metadataUrl;
        var _isParent = isP_arr;
        var _hasParent = hasP_arr;
        var _parents = parents;
        var _contributors = contributors;
        var _shares = shares;
        var _benefitTypes = benefitTypes_arr;
        var args = [];
        args.push(_logAddress);
        args.push(_workAddress);
        args.push(_playPrice);
        args.push(_buyPrice);
        args.push(_resourceUrl);
        args.push(_metadataUrl);
        args.push(_isParent);
        args.push(_hasParent);
        args.push(_parents);
        args.push(_contributors);
        args.push(_shares);
        args.push(_benefitTypes);
        // console.log(args);
        // var arr = args.concat(_logAddress,_workAddress,_perPlay,_perBuy,_resourceUrl,_metadataUrl,_royalties,_royaltyAmounts,_contributors,_contributorShares);
        var licenseContract = web3.eth.contract(LICENSEABI);
        var contractData = licenseContract.new.getData.apply(licenseContract, args.concat({
            from: web3.eth.coinbase, data: LICENSEBIN
        }))
        var gasEstimate = web3.eth.estimateGas({data: contractData});
        console.log(gasEstimate);
        console.log(args);
        var license = licenseContract.new(
          _logAddress,
          _workAddress,
          _playPrice,
          _buyPrice,
          _resourceUrl,
          _metadataUrl,
          _isParent,
          _hasParent,
          _parents,
          _contributors,
          _shares,
          _benefitTypes,
           {
             from: web3.eth.coinbase,
             data: LICENSEBIN,
             gas: gasEstimate * 2
           }, function (e, contractLicense){
            console.log('5');
            if (contractLicense.address) {
              console.log(11);
              console.log(contractLicense.address);
              //0x9d012fafa349a02cb587e559eed283e97a967fb4

              res.send({success:1});
            }else{
              console.log(22);
            }
         })
         // return;
      }
  });
});

app.post('/login',function(req,res){
	console.log(req.body)
	var _body = req.body,
		login_arr = [
			{
				'userName' : 'admin',
				'password' : 123
			},
			{
				'userName' : 'haiyun',
				'password' : 7115
			}
		],
		flag = false;
	for(var i=0,len=login_arr.length;i<len;i++){
		var element = login_arr[i];
		if(element.userName === _body.userName && element.password == _body.password){
			flag = true;
			break;
		}
	}

	if(flag){
		res.send({success : 1});
	}else{
		res.send({success : 0,data:'用户名或密码错误！'});
	}
});


var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("http://%s:%s", host, port);

})
