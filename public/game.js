var number;
var players;
var roles;
var online;
var flag = true;
var online_id;
var day_vote = false;
var night_vate = false;
var day_votes;
var night_votes;
var words;
var lives;
var result;
$(document).ready(function() {
	// $('#send').hide();
	var addr = GetQueryString("name");
	//发送本地地址，获取初始化信息
	post(addr);
	//发送天气状况查询
	setInterval("change_day('ask')", 111);
	//发送上线状况查询
	online_id = setInterval("update_online(flag)", 799);
	//发送游戏状态查询
	// setInterval("update_states(flag)", 979);
	//白天黑夜转换键
	update_states(flag)
	$("#control").click(function() {
		if (roles[number] != "judge") {
			alert("您不是法官， 无此权限！");
			return;
		}
		if (typeof(online) == 'undefined' || sum(online) < players.length) {
			alert("玩家尚未全部登录！");
			return;
		}
		// alert(number+"\n"+addr+"\n"+players.join(',')+"\n"+roles.join(','));
	    change_day("click");
	});
	//点击头像投票
	$("#all").on('click', '.head',function() {
		if (roles[number] == "judge") {
			alert("您是法官，无法投票！");
			return;
		}
		if (typeof(online) == 'undefined' || sum(online) < players.length) {
			alert("玩家尚未全部登录！");
			return;
		}
		if (!lives[number]) {
			alert("您已死， 无法投票！");
			return;
		}
		if (flag && day_vote) {
			alert("您已在白天投过票！");
			return;
		}
		if (!flag && night_vate) {
			alert("您已在夜晚投过票！");
			return;
		}
		if (!flag && roles[number] != "werewolf") {
			alert("您不是狼人，无法投票！");
			return;
		}
		var votednumber = parseInt(this.id.substring(4))
		if (number == votednumber) {
			alert("您不能给自己投票！");
			return;
		}
		var voted = players[votednumber]
	 // alert(voted);
	    var newvote = 1+parseInt($('#votes'+votednumber).text());
	    $('#votes'+votednumber).text(newvote);
	    if (flag) {
	    	day_vote = true;
	    }
	    else {
	    	night_vate = true;
	    }
	    votehere(addr, voted, flag);
	});
	//点击按钮发言
	$("#sendword").on('click', function() {
		if (typeof(online) == 'undefined' || sum(online) < players.length) {
			alert("玩家尚未全部登录！");
			return;
		}
		if (roles[number] == "judge") {
			alert("您是法官，无法发言！");
			return;
		}
		if (!lives[number]) {
			alert("您已死， 无法发言！");
			return;
		}
		if ($("#word").val() == "") {
			alert("发言不能为空");
			return;
		}
		$('#say'+number).text($("#word").val());
		sayhere(addr, $("#word").val());
		$("#word").val("");
	});
});

//解析本地url中的条目
function GetQueryString(name) { 
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
    var context = ""; 
    if (r != null) {
    	context = r[2]; 
    }
    reg = null; 
    r = null; 
    return context == null || context == "" || context == "undefined" ? "" : context; 
}

//向服务端异步发送询问
function Ajax(json) {
	var url=json.url;
	var method=json.method;
	var success=json.success;
	var obj=json.obj;
	var request=null;
	if(window.XMLHttpRequest){
		request=new XMLHttpRequest();
	}else{
		try{
			request=new ActiveObject('Microsoft.XMLHTTP');
		}
		catch(faild){
			alert('Error:Ajax request faild');
		}
	}
	if(request!=null){      
		request.onreadystatechange=function(){
			if(request.readyState==4&&request.status==200){
				var text=request.responseText;
				success(text);
			}else{      
			}       
		}
		request.open(method,url,true);
		request.send(JSON.stringify(obj));  
	}
}

//按地址询问信息
function post(addr) {
	obj={
		address: addr
	};
	Ajax({
		url:'/game',
		method:'POST',
		success:function(text){
			// console.log(text)
			text = JSON.parse(text)
			number = parseInt(text.number);
			players = text.players;
			roles = text.roles;
			online = text.online;
			// console.log(online)
			create_element(players.length, number);
			// $("#hint").text("666");
			// alert("666")
			//console.log(players);
		},
		obj:obj
	})
}

//询问白天/黑夜是否变更
function change_day(act) {
	obj={
		action: act
	};
	Ajax({
		url:'/day',
		method:'POST',
		success:function(text) {
			if ((flag == true && text == "night") || (flag == false && text == "day") || act == "click") {
				day_and_night();
			}
		},
		obj:obj
	})
}

//转换白天/黑夜
function day_and_night() {
	$('#send').toggle(2000);
	if (flag == true) {
		if ($("#whole").hasClass("day_night") == false) {
			day_vote = false;
			night_vate = false;
			$("#whole").toggleClass("day_night")
			$("#all").toggleClass("body1")
			$("h2").toggleClass("f1")
			$("#whole").toggleClass("night_day")
			$("#all").toggleClass("body2")
			$("h2").toggleClass("f2")
		}
		$("#whole").css("animation", "sun_moon 4s linear 1 alternate forwards");
		$("#all").css("animation", "colorchange 4s linear 1 alternate forwards");
		$("h2").css("animation", "foot 4s linear 1  alternate forwards")
		setTimeout("$('#hint').html('天亮请睁眼')",4000)
		setTimeout("$('#hint').css('color','white')",4000)
		setTimeout("$('#control').attr('src','eye2.png')",4000)
		setTimeout("$('.anonymous').attr('src', 'nightanonymous.png')",4000)
		setTimeout("$('.villager').attr('src', 'nightvillager.png')",4000)
		setTimeout("$('.werewolf').attr('src', 'nightwerewolf.png')",4000)
		setTimeout("$('.ghost').attr('src', 'nightghost.png')",4000)
		setTimeout("$('.voting').text('0')",4000)
	}
	else {
		$("#whole").toggleClass("day_night")
		$("#all").toggleClass("body1")
		$("h2").toggleClass("f1")
		$("#whole").toggleClass("night_day")
		$("#all").toggleClass("body2")
		$("h2").toggleClass("f2")
		$("#whole").css("animation", "moon_sun 4s linear 1 alternate forwards");
		$("#all").css("animation", "colorchange2 4s linear 1 alternate forwards");
		$("h2").css("animation", "foot2 4s linear 1  alternate forwards")
		$("#whole").toggleClass("day_night")
		setTimeout("$('#hint').html('天黑请闭眼')",4000)
		setTimeout("$('#hint').css('color','black')",4000)
		setTimeout("$('#control').attr('src','eye.png')",4000)
		setTimeout("$('.anonymous').attr('src', 'anonymous.png')",4000)
		setTimeout("$('.villager').attr('src', 'villager.png')",4000)
		setTimeout("$('.werewolf').attr('src', 'werewolf.png')",4000)
		setTimeout("$('.ghost').attr('src', 'ghost.png')",4000)
		setTimeout("$('.voting').text('0')",4000)
	}
	flag = !flag;
	update_states(flag)
}

//动态生成头像
function create_element(total, number) {
	var df = document.createDocumentFragment();
	for (i = 1; i < total; i++) {
		var mydiv = document.createElement("div");
		mydiv.className = "one";
		var img = document.createElement("img");
		img.id = "head"+i;
		img.className = "head";
		img.src = roles[i]+'.png';
		if (roles[number] == "villager" && i != number) {
			img.src = "anonymous.png";
			img.className += " anonymous";
		}
		else {
			img.className += ' '+roles[i];
		}
		if (online[i] == 0) {
			img.className += ' notcome';
		}
		mydiv.appendChild(img);
		var votes = document.createElement("span");
		votes.innerHTML = "0";	
		votes.id = "votes"+i;
		votes.className = "voting";
		mydiv.appendChild(votes);
		var says = document.createElement("span");
		// says.innerHTML = "大家好";	
		says.id = "say"+i;
		says.className = "saying";
		mydiv.appendChild(says);
		df.appendChild(mydiv);
	}
	document.body.appendChild(df);
}

//数组求和
function sum(arr) {
    return eval(arr.join("+"));
};

//更新玩家在线数量
function update_online(flag) {
	if (typeof(players) == 'undefined') {
		return;
	}
	if (typeof(online) != 'undefined' && sum(online) == players.length) {
		if (typeof(online_id) != 'undefined') {
			clearInterval(online_id);
			//alert(666);
		}
		return;
	}
	obj={
		
	};
	Ajax({
		url:'/online',
		method:'POST',
		success:function(text){
			online = parseArray(text)
			for (i = 1; i < players.length; i++) {
				if (online[i] == 1 && $("#head"+i).hasClass("notcome")) {
					$("#head"+i).toggleClass("notcome")
				}
			}
		},
		obj:obj
	})
}

//更新各项状态
function update_states(flag) {
	obj = {
		is_day: flag
	};
	Ajax({
		url:'/askstates',
		method:'POST',
		success:function(text) {
			text = JSON.parse(text);
			lives = text.lives;
			result = text.result;
			if (result != "") {
				alert(result);
				//如果游戏已经分出高下，直接关闭页面
				window.opener=null;
				window.open('','_self');
				window.close();
			}
			if (flag) {
				day_votes = text.day_votes;
				words = text.words;
				// console.log(words);
				for (i = 1; i < players.length; i++) {
					if (!lives[i] && !$('#head'+i).hasClass("ghost")) {
						$('#head'+i).removeClass();
						$('#head'+i).toggleClass("ghost");
						$('#head'+i).attr('src', 'ghost.png');
					}
					if (lives[i]) {
						if ($('#say'+i).text() != words[i]) {
							$('#say'+i).text(words[i]);
						}
						if ($('#votes'+i).text() != day_votes[i]+"") {
							$('#votes'+i).text(day_votes[i]+"");
						}
					}
				}
			}
			else {
				night_votes = text.night_votes;
				for (i = 1; i < players.length; i++) {
					if (!lives[i] && !$('#head'+i).hasClass("ghost")) {
						$('#head'+i).removeClass();
						$('#head'+i).toggleClass("ghost");
						$('#head'+i).attr('src', 'ghost.png');
					}
					if (lives[i]) {
						if ($('#votes'+i).text() != night_votes[i]+"") {
							$('#votes'+i).text(night_votes[i]+"");
						}
					}
				}
			}
		},
		obj:obj
	})
}

//向服务器发送投票信息
function votehere(from, to, flag) {
	obj={
		from: from, 
		to: to,
		if_day: flag
	};
	Ajax({
		url:'/vote',
		method:'POST',
		success:function(text) {
		},
		obj:obj
	})
}

//向服务器发送发言信息
function sayhere(from, words) {
	obj={
		from: from, 
		words: words
	};
	Ajax({
		url:'/say',
		method:'POST',
		success:function(text) {
		},
		obj:obj
	})
}

//解析数组字符串
function parseArray(arrStr) {  
    var tempKey = 'arr23' + new Date().getTime();//arr231432350056527  
    var arrayJsonStr = '{"' + tempKey + '":' + arrStr + '}';  
    var arrayJson;  
    if (JSON && JSON.parse) {  
    arrayJson = JSON.parse(arrayJsonStr);  
    } else {  
    arrayJson = eval('(' + arrayJsonStr + ')');  
    }  
    return arrayJson[tempKey];  
}
