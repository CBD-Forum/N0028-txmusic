function generateStringByTemplate(obj){
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
}
