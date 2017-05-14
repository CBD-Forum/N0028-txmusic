$(function(){
	/*发现歌曲,购买歌曲,认证歌曲页面切换*/
	var pagearr = ['authSongs.html', 'findMusic.html','purchaseRecord.html'];
	$('#pageCon').load(pagearr[0]);
	$("#loadPage li").click(function(){
		var ind=$(this).index();
//		console.log(ind);
		$("#loadPage li").eq(ind).addClass('active').siblings().removeClass('active');
		$('#pageCon').load(pagearr[ind]);
	})
	/*账户中心点击跳转账户中心页面*/
	$("#accountCenter").click(function(){
		$('#pageCon').load("accountCenter.html");
	})
	
})
