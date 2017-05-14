/*
 * @description 此库是为nodeJS环境下开发的
*/
;!function(){
	var _obj = {},
		_array = [],
		toString = _obj.toString,
		slice = _array.slice;
	var version = '1.0.0',
		_Class = function(selector){
		return new _Class.fn.init(selector);
	};

	_Class.fn = _Class.prototype = {
		constructor : _Class,
		/*
		 * @description 循环
		*/
		each : function(callback){
			var selector = this.selector;
			if(selector){
				if(toString.call(selector) === '[object Array]'){
					for(var i=0,len=selector.length;i<len;i++){
						(function(index){
							callback.call(selector[index],index,selector[index]);
						})(i);
					}
				}
				if(toString.call(selector) === '[object Object]'){
					for(var i in selector){
						(function(index){
							callback.call(selector[i],i,selector[i]);
						})(i);
					}
				}
			}
		}
	}
	/*
	 * @description 复制方法和属性给对象
	*/
	_Class.extend = function(){
		var obj = arguments[0] || {},
			i = 1,
			len = arguments.length;
		if(arguments.length == i){
			obj = this;
			i--;
		}

		for(;i<len;i++){
			var args = arguments[i];
			for(var index in args){
				obj[index] = args[index];
			}
		}
		return obj;
	};
	/*
	 * @description 给构造函数添加方法和属性
	*/
	_Class.extend({
		/*
		 * @description 循环
		*/
		each : function(el,callback){
			if(!callback){
				console.log('缺少回调函数！');
				return false;
			}
			var selector = el;
			if(selector){
				if(toString.call(selector) === '[object Array]'){
					for(var i=0,len=selector.length;i<len;i++){
						(function(index){
							callback.call(selector[index],index,selector[index]);
						})(i);
					}
				}
				if(toString.call(selector) === '[object Object]'){
					for(var i in selector){
						(function(index){
							callback.call(selector[i],i,selector[i]);
						})(i);
					}
				}
			}
		},
		/*
		 * @description 区块链专属方法
		*/
		blockChain : {},
		/*
		 * @description 委托代理
		 * @params obj 里面的参数包括：type(代表事件类型，默认为click)
		 * $obj 代表页面元素，jquery对象
		 * callback 代表函数
		 */
		delegate : function(obj){
			var type = obj && obj.type ? obj.type : 'click',
				$obj = obj.$obj,
				callback = obj.callback;
			$obj.bind(type,function(e){
				callback.call($obj,e);
			})
		},
		/*
		 * @description 随机生成一串数字
		*/
		randomNumber : function(){
			var _time = new Date().getTime(),
				_random = (Math.random() * 10000).toFixed(0);
			return _time+_random;
		},
		/*
		 * @description 根据模板和参数生成html串
		 * @params obj {id:id,params : {'%s':'id','%t':'name'},data:[{id:'aaa',name:'bbb'},{id:'ccc',name:'ddd'}]}id表示模板的id,
		 * params表示模板里面的参数 eg:%s可以取到数组每一项里面的key
		 * data表示数据
		 */
		generateStringByTemplate : function(obj){
			var id = obj.id,
				params = obj.params,
				data = obj.data,
				$script = $('#'+id),
				txt = $script.text(),
				param_arr = [],
				param_str = '',
				reg = null,
				_arr = [];
			for(var index in params){
				param_arr.push(index);
			}

			param_str = param_arr.join('|');
			reg = new RegExp(param_str,'g');
			$(data).each(function(index,element){
				_arr.push(txt.replace(reg,function(a,b){
					return element[params[a]];
				}));
			});
			return _arr.join('');

		}
	});

	/*
	 * @description 给区块链添加方法和属性
	*/

	_Class.extend(_Class.blockChain,{
		json : {
		    "name":"Test",
		    "is":"",
		    "attributes":[

		    ],
		    "structs":[

		    ],
		    "mappings":[

		    ],
		    "methods":[

		    ]
		},
		/*
		 * @description tab页签切换
		 * @param $parent 父元素jquery对象
		 * @param $current 当前jquery对象
		 * @param tab 页签
		 * @param c class 默认为on
		*/
		switchTap : function($parent,$current,tab,c){
			var c = c || 'on',
				current_related = $current.attr('for'),
				$prior = $parent.find(tab+'.'+c),
				prior_ralated = $prior.attr('for');
			$(current_related).show();
			$(prior_ralated).hide();
			$prior.removeClass(c);
			$current.addClass(c);
		},
		/*
		 * @description 增加元素
		 * @param id 模板id
		 * @param current 当前元素
		 * @param c 需要添加到容器的class,默认为box_temp
		*/
		appendElement : function(id,current,c){
			var $template = $('#'+id),
				$current = $(current),
				txt = $template.text(),
				c = c || 'box_temp';
			//$($template.attr('for')).find('div.'+c).append(txt);
			$current.closest('div.'+c).append(txt);
		},
		/*
		 * @description 给json添加内容
		 * @param id 模板id
		 * @param field 需要给哪个字段添加
		 * @param $box 容器jquery对象
		 * @param c class
		*/
		addToJson : function(id,field,$box,c){
			c = c || 'input_box';
			var $blocks = $box.find('div.'+c),
				self = this,
				arr = [];
			self.json[field] = [];
			if(field === 'attributes'){
				$blocks.each(function(index,element){
					var desc = $(element).find('input[type=text][name=desc]').val(),
						name = $(element).find('input[type=text][name=name]').val();
					self.json[field].push(JSON.parse(_Class.generateStringByTemplate({
						id : id,
						params : {'%desc':'desc','%name':'name'},
						data : [{'desc':desc,'name':name}]
					})));
				});
			}
			if(field === 'methods'){
				$blocks.each(function(index,element){
					var $obj = $(element),
						name = $obj.find('input[type=text][name=func]').val(),
						$chk_in = $obj.find('input[type=checkbox][name=input]'),
						$chk_out = $obj.find('input[type=checkbox][name=output]'),
						$chk_in_next = $chk_in.next(),
						$chk_out_next = $chk_out.next(),
						parameters = [],
						returnType = [];
					if($chk_in[0].checked){//输入
						$chk_in_next.find('input[type=text]').each(function(index,element){
							parameters.push(JSON.parse(_Class.generateStringByTemplate({
								id : 'template_json_methods_param',
								params : {'%name':'name','%type':'type'},
								data : [{'name':'param_'+index,'type':element.value}]
							})));
						});
					}
					if($chk_out[0].checked){
						$chk_out_next.find('input[type=text]').each(function(index,element){
							returnType.push(element.value);
						});
					}

					self.json[field].push(JSON.parse(_Class.generateStringByTemplate({
						id : 'template_json_methods',
						params : {'%name':'name','%parameters':'parameters','%returnType':'returnType'},
						data : [{
							'name' : !!name ? name : 'func_'+index,
							'parameters' : JSON.stringify(parameters),
							'returnType' : returnType.join(',')
						}]
					})));
				});
			}

		},
		/*
		 * @description 显示合约内容
		 * @param box 容器
		 * @param pub 全局变量
		 * @param func 函数
		*/
		showJson : function(box,pub,func){
			var $box = $(box),
				$pub = $box.find(pub),
				$func = $box.find(func),
				pub_template = $pub.attr('template'),
				func_template = $func.attr('template'),
				pub_template_header = pub_template+'_header',
				func_template_header = func_template+'_header',
				pub_template_header_txt = $('#'+pub_template_header).text(),
				func_template_header_txt = $('#'+func_template_header).text(),
				attributes = this.json.attributes,
				methods = this.json.methods,
				attr_arr = [],
				method_arr = [];

			$(attributes).each(function(index,element){
				attr_arr.push(_Class.generateStringByTemplate({
					id : pub_template,
					params : {'%desc':'desc','%name':'name','%type':'type'},
					data : [{'desc':element.desc,'name':element.name,'type':element.type}]
				}));
			});
			$pub.find('.__content').html(pub_template_header_txt+attr_arr.join(''))
			$(methods).each(function(index,element){
				var parameters = [];
				$(element.parameters).each(function(p,obj){
					parameters.push(obj.type+' '+obj.name);
				});

				method_arr.push(_Class.generateStringByTemplate({
					id : func_template,
					params : {'%parameters':'parameters','%name':'name','%returnType':'returnType'},
					data : [{'parameters':parameters.join(','),'name':element.name,'returnType':element.returnType}]
				}));
			});
			$func.find('.__content').html(func_template_header_txt+method_arr.join(''))


		},

		/*
		 * @description 显示与隐藏切换
		 * @param $obj jquery对象
		 * @param switch 隐藏的class
		*/
		switchDisplay : function($obj,c){
			if($obj.hasClass(c)){
				$obj.removeClass(c);
			}else{
				$obj.addClass(c);
			}
		}
	});

	/*
	 * @description 给原型添加方法和属性
	*/
	_Class.extend(_Class.fn,{

	});

	var init = _Class.fn.init = function(selector){
		if(arguments.length == 0){
			this.selector = null;
		}else{
			this.selector = selector;
		}
		return this;
	}

	init.prototype = _Class.fn;

	this.hmd = _Class;
}();
