var rg_adr = /^0x([0-9a-f]){40}$/;
var rg_number = /^[4-7]{1}$/;
var message = "";
var id = 0
// rg开头的变量为正则表达式，message为提示信息
window.onload = function() {
	document.getElementById("name").addEventListener("input", check);
	document.getElementById("submit").addEventListener("click", submit);
	document.getElementById("number").addEventListener("input", choose);
}

function check() {
	var addr = document.getElementById("name").value;
	if (addr) {
		if (!rg_adr.test(addr)) {
			document.getElementById("name_message").className = "wrong";
        	document.getElementById("name_message").innerHTML = "地址不合法！";
			message += "地址不合法！\n";
		}
		else {
		    document.getElementById("name_message").className = "right";
        	document.getElementById("name_message").innerHTML = "√√√";			
		}
	}
	else {
		document.getElementById("name_message").className = "wrong";
        document.getElementById("name_message").innerHTML = "地址不能为空！";
		message += "地址不能为空！\n";
	}
}

function choose(event) {
	var nb = document.getElementById("number").value;
	if (nb) {
	    if (!rg_number.test(nb)) {
	    	message += "人数不合法！\n"
	    	document.getElementById("num_message").className = "wrong";
        	document.getElementById("num_message").innerHTML = "人数不合法！";
        	var key = document.getElementById("key");
        	for (id; id > 0; id--) {
        		var m = document.getElementById("add_"+id);
        		key.removeChild(m)
        	}
        	id = 0
	    }
	    else {
	    	document.getElementById("num_message").className = "right";
        	document.getElementById("num_message").innerHTML = "√√√";	
        	add(parseInt(nb))
	    }
	}
	else {
	    message += "人数不能为空！\n";
	    document.getElementById("num_message").className = "wrong";
      	document.getElementById("num_message").innerHTML = "人数不能为空！";
      	var key = document.getElementById("key");
        for (id; id > 0; id--) {
        	var m = document.getElementById("add_"+id);
        	key.removeChild(m)
        }
        id = 0
	}
}

function submit(event) {
	if (message) {
		alert(message+"请重新填写");
		message = "";
		return false;
	}
	else {
		this.type = "submit";//如果通过表单验证将类型设置为提交
		return true;
	}
	//document.getElementById("name").value = document.getElementById("number").value;
}


function add(length) {
	var key = document.getElementById("key");
	var button = document.getElementById("submit");
	for (id = 1; id <= length; id++) {
		var input=document.createElement("input");
		input.type="text";
		input.className="add";
		input.id="add_"+id;
		input.name = "add";
		input.placeholder="add the "+id+"th player";
		input.autocomplete="off";
		key.insertBefore(input,button);
	}
	id--;
}
