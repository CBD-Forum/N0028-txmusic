;!function(){
	var blockChain = hmd.blockChain;
	/*
	 * @description 委托代理
	*/
	hmd.delegate({
		$obj : $(document.body),
		callback : function(e){
			var target = e.target,
				_template,box_class;
			if(target.nodeName === 'LI'){
				if($(target).closest('ul').hasClass('tab')){//切换
					blockChain.switchTap($(this),$(target),'li','cur');
				}
			}
			if(target.nodeName === 'DIV'){
				if($(target).hasClass('cut')){//删除
					$(target).parent().remove();
				}
				if($(target).hasClass('add')){//增加
					_template = $(target).attr('template');
					box_class = $(target).attr('box_class');
					blockChain.appendElement(_template,target,box_class);
				}
			}
			if(target.nodeName === 'A'){
				if($(target).hasClass('confirm')){
					if($(target).attr('name') === 'global_filed_add'){//全局确定按钮
						blockChain.addToJson('template_json_attributes','attributes',$('div.global_filed'));
						blockChain.switchTap($('#tab_list'),$('#tab_list').find('li').eq(1),'li','cur');
					}
					if($(target).attr('name') === 'fun_add'){//函数添加
						_template = $(target).attr('template');
						$('div.fun').find('div.box_temp').append($('#'+_template).text())
					}
					if($(target).attr('name') === 'fun_confirm'){//函数确定
						blockChain.addToJson('template_json_methods','methods',$('div.fun'),'fun_box');
						blockChain.switchTap($('#tab_list'),$('#tab_list').find('li').eq(2),'li','cur');
						blockChain.showJson('div.contract','div.__public','div.__func');
					}
				}
				if($(target).attr('name') === 'submit'){
					$.ajax({
						url : 'http://localhost:8000/getjson',
						type : 'post',
						data : {
							data : JSON.stringify(blockChain.json)
						},
						success : function(msg){
							$('#views_box').html('');
							// $('#javascript-editor').find('textarea')[0].value = msg.result;
							editor.setValue(msg.result);
							$('#wrapper').show();
						},
						error : function(e){
							console.log(e)
						}
					});
				}
				if($(target).hasClass('__menu')){
					if(!!$(target).attr('for')){
						$('#views_box').load('views/'+$(target).attr('for'));
						$('#wrapper').hide();
					}else{
						$('#views_box').html('');
						$('#wrapper').show();
					}
				}
			}
			if(target.nodeName === 'INPUT'){
				if(target.type === 'checkbox'){
					if($(target).hasClass('func_chk')){
						blockChain.switchDisplay($(target).next(),'off');
					}
				}
			}
		}
	});


}();
