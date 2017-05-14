
var Web3 = require("web3");
var abi = require('../public/js/json/abi.json');
var $ = require('jquery');
var LOGADDR = abi.logAddr;
var LOGABI = abi.logAbi;
var WORKABI = abi.workAbi;
var WORKBIN = abi.workBin;
var LICENSEABI = abi.licenseAbi;
var LICENSEBIN = abi.licenseBin;

var __music = function(obj){
  var func = function(){};
  func.prototype = obj;
  func.constructor = func;
  return new func();
}

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  //web3 = new Web3(new Web3.providers.HttpProvider("http://10.168.120.121:8545"));
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  //web3 = new Web3(new Web3.providers.HttpProvider("http://10.168.195.224:8545"));
}
//查看账户
//console.log(web3.eth.coinbase);
// console.log(web3.eth.accounts)
// 0xf599b54145d676adb93a65ad9fc60f5156184c31
// 0x87cdbee2dbbc60b4476ca146b3164ab206ea7cde
// 0x16899A2536d94b49324932e3aE66B2d8418dA55B
// 0x215571459c798770394888feA1A5eA4dBE775DFE

// web3.eth.accounts[2]:0x0ab2bdd4e423d6be7cf6cd9ee1e5276e1dabfe36
// web3.eth.accounts[3]:0xff27c4c5376d2524279a2f3e634e18ea85cfc885
// web3.eth.accounts[4]:0xcd37a81ced709487d14d3d649fc394e2abb0eb2e



var _instance = __music($.extend({},{
  songsList : function(authsong,s){console.log(arguments)
    authsong = authsong || (document.body.id === 'authSongs' ? 1 : 0);
    if(s){
      authsong = 1;
    }
    var self = this;
    var sender;
    if(authsong){
      $("#authSongsList").find("tbody tr th").show();
      $("#authSongsList").find("tbody tr td").remove();
        sender = {
          sender:LOGADDR,
          owner:web3.eth.accounts[0]
        }
    }else{
       sender = {
        sender:LOGADDR
      }
    }
    var _arr = [],arr = []
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
      if(!s){
        if(authsong){

  				for(var i = 0; i < newarr.length; i++){
  					var title = newarr[i].title,
  							artist = newarr[i].artist,
  							timer = newarr[i].time,
  							playCount = newarr[i].playCount,
  							buyCount = newarr[i].buyCount,
  							lis = newarr[i].lis;
  					arr.push({title:title,artist:artist,time:self.changeByReg(timer),playCount:playCount,buyCount:buyCount,lis:lis});
  				}

  				$("#authSongsList").find("tbody").append(self.generateStringByTemplate({
  					id:"auth_songs_list",
  					params:{"%s":"title","%n":"artist","%t":"time","%p":"playCount","%b":"buyCount","%l":"lis"},
  					data:arr
  				}));
  				// var text = $("#numSong").text();
  				$("#numSong").find("span").text(arr.length);
        }else{
          $("#findSongsList").prepend(self.generateStringByTemplate({
              id:"songs_list",
              params:{"%s":"title","%n":"artist","%v":"lis"},
              data:newarr
            }));
        }
      }else{
          self['callback'][s].call(self,newarr);
      }


    })
  },//songsList end
  changeByReg : function(num){
    num = num || 1493103810;
		var newDate = new Date();
		newDate.setTime(num * 1000);
		var str = newDate.toLocaleString()
		var reg_a = /[\u4e00-\u9fa5]|[/]/g

		var newstr = str.replace(reg_a,function(t){
			if(t === '/'){
				return '-';
			}
			if(/[\u4e00-\u9fa5]/.test(t)){
				return '';
			}
		})
		return newstr;
  },
  detailMess : function(target){
    var licenseAddr = $(target).attr("data-val");
    var action = $(target).attr("data-action");

    var lisenceContract = web3.eth.contract(LICENSEABI).at(licenseAddr);
    var new_arr = [];
    // console.log(licenseAddr)
    // console.log(action)
    obj_arr = lisenceContract.getURL();
    new_arr.push(web3.toUtf8(obj_arr[1]));
    new_arr.push(web3.toUtf8(obj_arr[2]));
    new_arr.push(obj_arr[3].toNumber());
    new_arr.push(action);
    new_arr.push(licenseAddr);
    var time = this.changeByReg(new_arr[2]),
        action = new_arr[3],
        lis = new_arr[4];
    window.open("../views/broadcastPage.html?title="+new_arr[0] +"&artist="+ new_arr[1] +"&time="+ time +"&action="+ action +"&lis="+ lis +"");
  },//detailMess end

  broadcastSong : function(target){
    var _arr = [];
    //console.log(req.body.addr);
    var licenseAddr = $(target).attr("data-val");
    var number = +$(target).attr("data-num");
    var action = $(target).attr("data-action");
    //实例化lisenceContract合约
    var lisenceContract = web3.eth.contract(LICENSEABI).at(licenseAddr);
    //账户总金额
    var coinbaseM = web3.fromWei(web3.eth.getBalance(web3.eth.coinbase), 'ether').toNumber();
    var perPlay,perBuy;
    // console.log(number);
    // console.log(typeof number);
    if(number == 1){
      perPlay = lisenceContract.playPrice.call().toNumber();
      _arr.push({per:perPlay,coinbaseM:coinbaseM,licenseAddr:licenseAddr,number:number,action:action});
    }else{
      perBuy = lisenceContract.buyPrice.call().toNumber();
      _arr.push({per:perBuy,coinbaseM:coinbaseM,licenseAddr:licenseAddr,number:number,action:action});

    }

    if(_arr[0].number == 1){
        $("#musicPlay").append(this.generateStringByTemplate({
          id:"songs_play",
          params:{"%s":"per","%a":"coinbaseM","%l":"licenseAddr","%n":"number","%c":"action"},
          data:_arr
        }));
      }else{
        $("#buyCopy").append(this.generateStringByTemplate({
          id:"songs_buy",
          params:{"%s":"per","%a":"coinbaseM","%l":"licenseAddr","%n":"number","%c":"action"},
          data:_arr
        }));
      }
  },//broadcastSong

  confirmPay : function(target){
    var licenseAddr = $(target).attr("data-value");
    var playVal = $(target).parent().siblings("div.index_pad").find("h3 span").text();
    var password = $(target).parent().siblings("div.index_pad").find("p input").val();
    var number = +$(target).attr("data-num");
    var action = $(target).attr("data-action");
    var self = this;
console.log(target)
    web3.personal.unlockAccount(web3.eth.coinbase,password);
    var lisenceContract = web3.eth.contract(LICENSEABI).at(licenseAddr);
    var hash;
    hash = lisenceContract.play.sendTransaction(number,{from:web3.eth.coinbase, gas:3000000, value:web3.toWei(playVal,'ether')});
    //var hash = lisenceContract.play.sendTransaction(number,{from:web3.eth.coinbase, gas:3000000, value:web3.toWei(playVal,'ether')});
    // console.log(6767);
    // console.log(hash);
    var filter = web3.eth.filter("latest");console.log(filter);
    filter.watch(function(err, result) {console.log(err)
        if(err) {
            //console.log(err);
        } else {
            console.log("Block hash is " + result);
            var block = web3.eth.getBlock(result, true);
            action = $(target).attr("data-action");
            //console.log(block);
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
                    var time = self.changeByReg(new_arr[2]),
                        action = new_arr[3],
                        lis = new_arr[4];
                    if(action == 'play'){
                      window.open("/views/broadcastPage.html?title="+new_arr[0] +"&artist="+ new_arr[1] +"&time="+ time +"&action="+ action +"&lis="+ lis +"");
                    }
                }
            }
        }
     });
  },//confirmPay

  blockRecord : function(){
    var arr = [],new_arr=[],self = this;
    var myContract1 = web3.eth.contract(LOGABI).at(LOGADDR);
    var event = myContract1.listen({
      sender:LOGADDR
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
      for(var i = 0; i < new_arr.length; i++){
        var time = new_arr[i].time;
        var purpose = parseInt(new_arr[i].purpose);
        var pur;
        if(purpose == 1){
          pur = '播放歌曲'
        }else{
          pur = '购买歌曲'
        }
        arr.push({buyer:new_arr[i].buyer,time:self.changeByReg(time),pur:pur})
      }
      // console.log(arr);
      $("#bdcast_block").find("tbody").append(self.generateStringByTemplate({
        id:"block_record",
        params:{"%h":"buyer","%t":"time","%a":"pur"},
        data:arr
      }));
    });
  },//blockRecord
  coprMess : function(){
    var lisence = $("#message").find("h4").attr("data-val");
   //console.log(lisence);
   var lisenceContract = web3.eth.contract(LICENSEABI).at(lisence);
   var playPrice = lisenceContract.playPrice.call().toNumber();
   var buyPrice = lisenceContract.buyPrice.call().toNumber();
   var shares_newArr = [],benefit_newArr = [];
   var obj_arr = lisenceContract.getPlayInfo();
    console.log(obj_arr);
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

    $("#bdcast_copr").find("tbody").find("tr.bacast_table_tr").before(generateStringByTemplate({
       id:"copr_mess",
       params:{"%o":"owner","%r":"right","%y":"type"},
       data:array1
     }));
     $("#bdcast_copr").find("tbody").find("tr.bacast_table_tr").append(generateStringByTemplate({
       id:"playBuy_tem",
       params:{"%p":"playPrice","%b":"buyPrice"},
       data:array2
     }));
  },//coprMess
  broadcastPage : {
    local : function(){
      var str = window.location.search.substring(1);
        console.log(str);
        var reg = /[^&]{1,}=[^&]{1,}/g;
        var _obj = {};
        var self = this;
        str.replace(reg,function(t){
          var _arr = t.split("=");
          _obj[_arr[0]] = decodeURIComponent(_arr[1])//对象的key value，_obj[1]=value
        })
        console.log(_obj);
        $("#message").append(self.generateStringByTemplate({
          id:"message_tem",
          params:{"%t":"title","%a":"artist","%s":"time","%l":"lis"},
          data:_obj
        }));
        var lisence = $("#message").find("h4").attr("data-val");
        console.log(lisence);
        if(_obj.action === 'play'){
          $("#download").css("background-color","#ccc");
        }else if(_obj.action === 'buy'){
          $("#download").css("background-color","#ed061a");
        }else if(_obj.action === 'selfAuth'){
          $("#download").css("background-color","#ed061a");
        }else{
          $("#playpause").attr("data-val","noPlay");
          $("#playpause").css("background-color","#ccc");
          $("#download").css("background-color","#ccc");
        }

        $(".tab li").click(function(){
          $(".tab li").eq($(this).index()).addClass("cur").siblings().removeClass('cur');
          $("div.tab_con").hide().eq($(this).index()).show();
      });
      },
        hover_move : function(){console.log(this)
            $('#bacast_tab').mouseover(function(e){
            var target = e.target,
                offset,
                _height,
                _top,
                _left;console.log(target)
            if(target.nodeName === 'SPAN'){
              offset = $(target).offset(),
              _height = $(target).height(),
              _top = offset.top+_height,
              _left = offset.left;
              $('#pop_div').css({top:_top,left:_left}).text($(target).attr('value')).show();
            }
          });
          $('#bacast_tab').mouseout(function(e){
            var relatedTarget = e.relatedTarget;
            if(!$(relatedTarget).hasClass('__pop')){
              $('#pop_div').hide();
            }
          });

          $('#pop_div').mouseout(function(e){
            $(this).hide();
          });
        }


  },//broadcastPage
  attestSong : function(){
    var self = this;
    $("#passwordCheckBtn").click(function(){
    		var title = $("#sname").val(),
            artist = $("#sauthor").val(),
            metadataUrl = $("#saddress").val(),
            imageUrl = $("#spicaddr").val(),
    				playPrice = $("#splayPay").val(),
    				buyPrice = $("#sbuyPay").val(),
    				password = $("#payPwd").val();
    		var $stableTr = $("#table_view").find("tr");
        var logAddress = LOGADDR;
    		var isP_arr = [],
    				hasP_arr = [],
    				parents_arr = [],
    				con_arr = [], //版权所有者
    				shares_arr = [],//版权权益
    				benefit_arr = []; //版权类型
    		for(var i = 1,len = $stableTr.length; i < len; i++){
    			var j;
    			var td_eq0 = $($stableTr[i]).find("td").eq(0),
    					$benefit = $(td_eq0).find("input").val(),
    					td_con = $($stableTr[i]).find("td").eq(1),
    					$con1 = $(td_con).find("input").val(),
    					$con2 = $(td_eq0).find('dl dd').eq(2).find("input").val(),
    					td_shares = $($stableTr[i]).find("td").eq(2),
    					$shares1 = $(td_shares).find("input").val(),
    					$shares2 = $(td_eq0).find('dl dd').eq(3).find("input").val();
    			var data_pval = $($stableTr[i]).attr("data-parent");

    			if(data_pval == 'true'){
    				j = i-1;
    				isP_arr.push(false);
    				hasP_arr.push(false);
    				parents_arr.push(0);
    				con_arr.push($con1);
    				shares_arr.push($shares1);
    			}else{
    				isP_arr.push(false);
    				isP_arr[j] = true;
    				hasP_arr.push(true);
    				parents_arr.push(j);
    				con_arr[j] = '';
    				con_arr.push($con2);
    				shares_arr.push($shares2);
    			}
    			benefit_arr.push(isP_arr);
    		}
        console.log(isP_arr.join(','),isP_arr)
        var isParent = isP_arr.join(','),
            hasParent = hasP_arr.join(','),
            parents = parents_arr.join(','),
            contributors = con_arr.join(','),
            shares = shares_arr.join(','),
            benefitTypes = benefit_arr.join(',');
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
      //var result = '00000';
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
         console.log(contract.address);
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
                if (contractLicense.address) {
                  console.log(11);
                  console.log(contractLicense.address);
                  //0x9d012fafa349a02cb587e559eed283e97a967fb4

                  $("#myModal1").find("input").val("");
          				$("#myModal2").find("input").val("");
          				$(".fade").hide();
          				$("#myModal2").hide();
          				$('.tapWin').hide();
          				self.songsList(1);
                }else{
                  console.log(22);
                }
             })
             return;
          }
      });
    	});
  },
  purchaseRecord : function(s){
    var self = this;
    var Client=web3.eth.contract(LOGABI).at(LOGADDR);
     		var event=Client.listen({
  				// sender:LOGADDR,
  				buyer:web3.eth.accounts[0]
  			},{fromBlock:0,toBlock:'latest'});
  			event.get(function(error,result){
  				// console.log(web3.eth.coinbase);
  				// console.log(typeof(web3.eth.coinbase));
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
          if (new_arr.length<1) {
					var htmlblock="<tr><td colspan='7'>暂无购买记录</td></tr>";
					$('#songtable').append(htmlblock);
				} else{
					var initarr=new_arr;
					var newarr=[];
					var boughtarr=[];
					for (var i=0;i<initarr.length;i++) {
						if(initarr[i].title&&initarr[i].artist){
							var d=initarr[i].itstime;
							initarr[i].disable='';
							initarr[i].toggle='modal';
							initarr[i].datatime=self.changeByReg(d);
							if (initarr[i].purpose==1) {
								initarr[i].purposeType='播放';
							}
							if(initarr[i].purpose==2){
								initarr[i].purposeType='购买版权';
								boughtarr.push(initarr[i].lisence);
							}
							newarr.push(initarr[i]);
						}
					}
          if(!s){
            for (var i = 0; i < newarr.length; i++) {
  						for(var j=0;j<boughtarr.length;j++){
  							if (newarr[i].lisence==boughtarr[j]) {
  								newarr[i].isbought='bought';
  								initarr[i].toggle='';
  								initarr[i].disable='disabled="disabled"';
  							}
  						}
  					}
  					console.log(newarr);
  					var htmlblock=self.generateStringByTemplate({
  						id:'recordTemp',
  						params:{
  							'%na':'title',
  							'%au':'artist',
  							'%ti':'datatime',
  							'%pt':'purposeType',
  							'%dis':'disable',
  							'%addr':'lisence',
  							'%isb':'isbought',
  							'%tog':'toggle',
  							'%st':'itstime'
  						},
  						data:newarr
  					});
  					$('#songtable').html(htmlblock);
  					$('#searchBtn').click(function(){
  						var regstr=$('#regstr').val();
  						var regarr=[];
  	//					console.log(newarr);
  						for (var j=0;j<newarr.length;j++) {
  							var title=newarr[j].title;
  							if(title.match(regstr)){
  								regarr.push(newarr[j]);
  							}
  						}
  //						console.log(regarr);
  						if(regarr.length>0){
  							var newone=self.generateStringByTemplate({
  								id:'recordTemp',
  								params:{
  									'%na':'title',
  									'%au':'artist',
  									'%ti':'datatime',
  									'%pt':'purposeType',
  									'%dis':'disable',
  									'%addr':'lisence',
  									'%isb':'isbought',
  									'%tog':'toggle',
  									'%st':'itstime'
  								},
  								data:regarr
  							});

  						}else{
  							var newone="<tr><td colspan='7'>没有符合条件的搜索记录</td></tr>";
  						}
  						$('#songtable').html(newone);
  					});
          }else{
            self['callback'][s].call(self,newarr);
          }

				}
  				//res.send({success:1,data:new_arr});
   })
  },
  generateStringByTemplate : function(obj){
    var id = obj.id,
        params = obj.params,
        data = obj.data;
    var arr = [];
    var new_arr = [];
    var txt = $("#"+ id).text();
    for(var index in params){
      arr.push(index);
    }
    var arrReg = arr.join("|");
    var reg = new RegExp(arrReg, "g");
    $(data).each(function(key, value){
      new_arr.push(txt.replace(reg, function(t){
        return value[params[t]];
      }));
    });
    return new_arr;
  },
  //委托代理通用方法
  delegate : function(obj){
    var $obj = obj.obj,
        callback = obj.callback,
        type = obj.type || 'click';
    $obj[type](function(e){
      callback.call($obj,e.target);
    });
  },
  //所有的委托代理都放在这里
  delegate_methods : function(){
      var self = this;
      //findSongsList
      this.delegate({
        obj : $('body'),
        callback : function(target){
          $("#musicPlay").empty();
          $("#buyCopy").empty();
          if(target.nodeName === 'BUTTON'){
            if($(target).hasClass('per')){
              var value = $(target).attr("data-val");
              var num = $(target).attr("data-num");
              var action = $(target).attr("data-action");
              // console.log(value)
              // console.log(num)
              if(action == "mess"){
                self.detailMess(target);
              }else{
                self.broadcastSong(target);
              }//end
            }
            if($(target).hasClass("indexBuySure")){
              self.confirmPay(target);
            }//
            if($(target).hasClass("moz")){
              self.confirmPay(target);
            }
            if(target.id && target.id === 'indexBuyMusic'){
              $(".modal-backdrop").hide();
          		$(".index_buy_record").addClass('active').siblings().removeClass('active');
              window.location.href = '/views/purchaseRecord.html';
            }
            if($(target).hasClass('btnModify')){
              self.operate_purchase(target);
            }
          }
          if(target.nodeName === 'A'){
            if($(target).hasClass("authsongCheck")){
              self.detailMess(target);
            }
          }
        }//callback end
      });
  },

  operate_purchase : function(target){
    if($(target).attr('isbought')=='bought'){
    		var t=$(target).attr('data-title');
    		var a=$(target).attr('data-artist');
    		var time=$(target).attr('data-time');
    		var l=$(target).attr('data-val');
    		window.open("../views/broadcastPage.html?title="+t+"&artist="+a +"&time="+ time +"&action=buy&lis="+l);
    	}else{
	      if($(target).hasClass('pers')){
	        var value = $(target).attr("data-val");
	        var num = $(target).attr("data-num");
	        var action = $(target).attr("data-action");
	        // console.log(value)
	        // console.log(num)
          console.log(action)
	        if(action == "mess"){
            this.detailMess(target);
	        }else{
            this.broadcastSong(target);
					}
	      }
	    }
  },
  accountDetailList : function(a,s){console.log(s)
    a = a || 1;
    var self = this;
    //合约部署成功后，myContract调取主链，监听刚部署上的Work合约中的event
    //获取账户余额
    var balance = web3.eth.getBalance("0xdfb3c5346e96a919d376fa12faa0919f62ccf6df").toNumber();
    // console.log(web3.fromWei(balance,"ether"))
    //转换单位
    var Obalance = web3.fromWei(balance,"ether");
    var _arr = [];
    var _count = [];
    var myContract1 = web3.eth.contract(LOGABI).at(LOGADDR);
    if(a ==1){
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
        var Odata = _count[0];
          Obalance = Odata.balance;
         $('.Omoney').text(parseInt(Obalance).toFixed(2));
         $('.pTimes').text(parseInt(Odata.ptimes));
         $('.buySongs').text(parseInt(Odata.buySongs));
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
        console.log(self['callback'],s)
          self['callback'][s].call(self,_arr);
      })
    }
  },
  _accountCenter : function(){
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
      var Odata = _arr[0];
     //  console.log(Odata.Csongs)
       $('.Csongs').text(parseInt(Odata.Csongs));
    })
  },
  accountDetailList1 : function(){
     var _arr = [];
     var self = this;
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
       //res.send({success:10,data:_arr});
        var _Odata = _arr;
        var __arr = [];
       // var newArr = Odata.concat(_Odata)
       // console.log(newArr,_Odata)
       for(var i in _Odata){
         //console.log(newArr[i]);
         __arr.push("<tr><td>"+self.changeByReg(_Odata[i].nowTime)+"</td><td>收入</td><td>"+_Odata[i].money+"</td><td>"+_Odata[i].work+"</td><td>"+_Odata[i].sharer+"</td><td>作曲</td><td>--</td></tr>")
       }
       //console.log(arr)
        $('.Otbody').append(__arr.join(''));
     })
  },
  callback : {
    accountCenter_func : function(Odata){console.log(Odata)
      var Oarr = [];
      if(Odata.length>=4){
        for(var i=0; i<4; i++){
          Oarr.push("<tr><td>"+Odata[i].title+"</td><td>"+Odata[i].artist+"</td><td>"+Odata[i].playCount+"</td><td>"+Odata[i].buyCount+"</td></tr>")
        }
      }
      if(Odata.length<4){
        for(var i=0; i<Odata.length; i++){
          Oarr.push("<tr><td>"+Odata[i].title+"</td><td>"+Odata[i].artist+"</td><td>"+Odata[i].playCount+"</td><td>"+Odata[i].buyCount+"</td></tr>")
        }
      }

       $('.cSnglist').append(Oarr.join(''));
    },
    accountCenter_buy : function(Odata){
      var _arr = [];
        // console.log(Odata)
        if(Odata.length>=4){
          for(var i=0; i<4; i++){
            if(Odata[i].purpose==1){
              text='播放'
            }if(Odata[i].purpose==2){
              text='购买版权'
            }
           _arr.push("<tr><td>"+Odata[i].title+"</td><td>"+Odata[i].artist+"</td><td>"+this.changeByReg(Odata[i].itstime)+"</td><td>"+text+"</td></tr>")
          }
        }else{
          for(var i=0; i<Odata.length; i++){
            if(Odata[i].purpose==1){
              text='播放'
            }if(Odata[i].purpose==2){
              text='购买版权'
            }
           _arr.push("<tr><td>"+Odata[i].title+"</td><td>"+Odata[i].artist+"</td><td>"+this.changeByReg(Odata[i].itstime)+"</td><td>"+text+"</td></tr>")
          }
        }

         $('.buySonglist').append(_arr.join(''));
    },
    accountDetailList_func : function(Odata){
          var arr = [];
          var Obalance = Odata[0].balance;
				  for(var i in Odata){
  				 	arr.push("<tr><td>"+this.changeByReg(Odata[i].nowTime)+"</td><td>支出</td><td>"+Odata[i].money+"</td><td>"+Odata[i].work+"</td><td>"+Odata[i].buyer+"</td><td>--</td><td>"+Odata[i].purpose+"</td></tr>")
  				 }
				  $('.Otbody').append(arr.join(''));
				 $('.balance').text(parseInt(Obalance).toFixed(2));
				 this.accountDetailList1();
    }
  },
  body_id_list : {//accountCenter
    findMusic : {
      id : 'findMusic',
      api : 'songsList'
    },
    purchaseRecord : {
      id : 'purchaseRecord',
      api : 'purchaseRecord'
    },
    authSongs : {
      id : 'authSongs',
      api : 'songsList'
    },
    accountCenter : {
      id : 'accountCenter',
      api : [
        {name:'accountDetailList',callback:''},
        {name:'_accountCenter',callback:''},
        {name:'purchaseRecord',callback:'accountCenter_buy'},
        {name:'songsList',callback:'1,accountCenter_func'}
      ]
    },
    accountDetailList : {
      id : 'accountDetailList',
      api : [
        {name:'accountDetailList',callback:'2,accountDetailList_func'}
      ]
    }
  },
  accountCenter : function(){
      var $account = !!$('#accountCenter_a')[0] ? $('#accountCenter_a') : $('span[id=accountCenter]');
        $account.click(function(){
          window.location.href = '../views/accountCenter.html';
      });
      // if(!!$('#accountCenter_a')[0]||!!$('span[id=accountCenter]')[0]){
    //
    //     $('#accountCenter_a').click(function(){
    //       window.location.href = '../views/accountCenter.html';
    //   });
    // }

  },
  //初始化
  init : function(){
    var _api,self = this;
    if(location.search){
      if(location.pathname.indexOf('broadcastPage') !== -1){
        this.blockRecord();
        this.coprMess();
        this.broadcastPage.local.call(this);
        this.broadcastPage.hover_move.call(this);
      }
    }else{
      this.accountCenter();console.log(this,document.body,$('body').attr('id'))
      _api = this['body_id_list'][document.body.id]['api']
      console.log(this['body_id_list'],document.body.id,_api)
      if(_api){
        if(typeof _api === 'string'){
          this[_api]();
        }else{
          $(_api).each(function(index,element){//console.log(element)
            var _callback;//console.log(_callback)
            if(element.callback){//console.log(self[element.name])
              _callback = self['callback'][element.callback];console.log(element.name,element.callback.split(','))
              self[element.name].apply(self,element.callback.split(','));
            }else{
              self[element.name]();
            }

          });
        }

      }
      if(document.body.id === 'authSongs'){
          this.attestSong();
      }
      //this.songsList();
      this.delegate_methods();
    }

  }
}))


// setTimeout(function () {
//     _instance.init();
// },500);
_instance.init();


