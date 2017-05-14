var ace = require('brace');
var $ = require('jquery');
var Web3 = require('web3');
var web3;
require("brace/mode/solidity");
require('brace/theme/monokai');

var editor = ace.edit('javascript-editor');
editor.getSession().setMode('ace/mode/javascript');
editor.setTheme('ace/theme/monokai');
editor.setFontSize(20);
editor.setShowPrintMargin(false);
editor.getSession().setUseWrapMode(true);
editor.getSession().setTabSize(4);
editor.getSession().setUseSoftTabs(true);
editor.resize();
editor.clearSelection();
editor.gotoLine(0);
editor.scrollToLine(0);
editor.scrollToRow(0);

window.editor = editor;

var bytecode = '';
var contractMethods;

$(document).on('keyup', "#javascript-editor textarea", function(){
    set();
    // var selector = createSelect(contractMethods);
    // document.getElementById('methods').innerHTML = selector;
})
function set(){
    var changedSource = editor.getValue();
    var changedData = compile(changedSource);
    bytecode = changedData[1]['<stdin>:'+changedData[0]]['code'];
    contractMethods = changedData[1]['<stdin>:'+changedData[0]]['info']['abiDefinition'];
}

function compile(_source){
    var host = document.getElementById('host').value;
    var port = document.getElementById('port').value;
    var URL = 'http://' + host + ":" +port;
    web3 = new Web3(new Web3.providers.HttpProvider(URL));
    console.log(web3);
    var craw_1 = _source.lastIndexOf("contract");
    var craw_2 = _source.indexOf("{", craw_1);
    var craw_3 = _source.substr(craw_1 + 8, craw_2 - craw_1);
    var craw_4 = craw_3.trim().split(" ");
    var contractName = craw_4[0].trim();
    var compileJson = web3.eth.compile.solidity(_source);
    return [contractName, compileJson];
}

document.getElementById("contract_address").value = '';
document.getElementById('deploy').onclick = function(){
    if(!contractMethods){
        set();
    }
    var contract = web3.eth.contract(contractMethods);
    var gasEstimate = web3.eth.estimateGas({data: bytecode});
    web3.personal.unlockAccount(web3.eth.accounts[0],'12345');
    var init = {from: web3.eth.accounts[0], data: bytecode, gas:gasEstimate};
    var myContractReturned = contract.new(init, function(err, myContract){
        if(!err){
            if(!myContract.address){
                console.log(myContract.transactionHash);
            }else{
                console.log(myContract.address);
                document.getElementById("contract_address").value = myContract.address;
                // $.ajax({
                //     url: 'http://localhost:8000/save',
                //     type: 'POST',
                //     data: {
                //         Address: myContract.address,
                //         ABI: JSON.stringify(contractMethods),
                //         Code: editor.getValue(),
                //         ByteCode: bytecode
                //     },
                //     success: function (msg) {
                //         alert('发布成功');
                //     },
                //     error: function (e) {
                //         console.log(e);
                //         alert('发布失败');
                //     }
                // })
            }
        }else{
            console.log(err);
        }
    });
}


$(document).on('change',"#json-editor select", function() {
    var opt = $(this).children('option:selected').val();
    for (var i = 0; i < contractMethods.length; i++) {
        document.getElementById('inputs').innerHTML = '';
        var obj = contractMethods[i];
        if ((obj.name == opt || obj.type == opt) && obj.inputs.length > 0) {
            var inputs = '<h6>Inputs:</h6></br>';
            obj.inputs.map(function (o) {
                inputs += '<input type="text" class="form-control" placeholder="' + o.type + '"/>'
            })

            document.getElementById('inputs').innerHTML = inputs;
            break;
        }
    }
})

function createSelect(data){
    var selector = "<select>'<option value='blank'>Method</option>";
    data.map(function(d){
        if(d.inputs.length>0) {
            if (d.type == 'function') {
                selector += '<option value="' + d.name + '">' + d.name + '</option>';
            } else {
                selector += '<option value="' + d.type + '">' + d.type + '</option>';
            }
        }
    })
    selector += '</select>';
    return selector;
}
