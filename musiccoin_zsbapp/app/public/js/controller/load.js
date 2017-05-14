$(function(){

	/*发现歌曲,购买歌曲,认证歌曲页面切换*/
// 	var pagearr = ['findMusic.html','purchaseRecord.html','authSongs.html'];
// 	$('#pageCon').load('views/'+pagearr[0],function(){
// 		//console.log(this)
// 	});
// 	$("#loadPage li").click(function(){
// 		var ind=$(this).index();
// //		console.log(ind);
// 		$("#loadPage li").eq(ind).addClass('active').siblings().removeClass('active');
// 		$('#pageCon').load('views/'+pagearr[ind],function(){
//
// 		});
// 	})
	/*账户中心点击跳转账户中心页面*/
	$("#accountCenter").click(function(){
		// $('#pageCon').load("views/accountCenter.html");
		window.location.href='views/accountCenter.html';
	})

})
