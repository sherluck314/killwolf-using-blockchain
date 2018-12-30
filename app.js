var express = require('express')
var fs = require('fs')
var app = express()
var Web3 = require("web3")
var web3 = new Web3()
var daystate = "day"
var online = [0, 0, 0, 0, 0, 0, 0, 0]
web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"))
var killwolf
fs.readFile('./build/contracts/KillWolf.json', 'utf-8', function(err, data) {
	if (err) {
		console.log('文件读取失败');
	} else {
		//从本地读取编译结果以动态创建合约
		//console.log(JSON.parse(data).abi);
		var abi = JSON.parse(data)["abi"]
		var address = JSON.parse(data).networks
		var tl = Object.keys(address).length-1
		address = address[Object.keys(address)[tl]].address
		//console.log(address)
		killwolf = web3.eth.contract(abi).at(address)
		console.log(killwolf.judge.call())
		//打印合约中的event事件
		var event = killwolf.transfer(function(error, result){
			console.log("Event are as following:-------");
			
			for(let key in result) {
				//console.log(key + " : " + result[key]);
				if (key == "args") {
					console.log(JSON.stringify(result[key]))
				}
			}
			console.log("Event ending-------");
		});
		//分析8080的情况
		app.use(express.static(__dirname + '/public'));
		app.get('/', function (req, res) {
			//res.send(web3.eth.accounts);
			// res.send('hhh')
			//游戏如果尚未开始就显示开始游戏的界面
			if (killwolf.game_is_on.call() == false) {
				if (killwolf.day_of_game.call() > 1) {
					res.send('本轮游戏已结束，'+killwolf.get_result());
					return;
				}
				console.log(web3.eth.accounts)
				res.sendFile( __dirname + "/public/start.html");
				console.log(killwolf.judge.call())
			}
			//否则显示登录界面
			else {
				res.sendFile( __dirname + "/public/signin.html");
			}
		})
		//添加玩家加入游戏
		app.get('/address', function (req, res) {
			// 输出 JSON 格式
			var response = {
				"address":req.query.name,
				"number":req.query.number,
				"players":req.query.add
			};
			console.log(response)
			for (i = 0; i < response.number; i++) {
				console.log(response.address, response.players[i])
				killwolf.add_players.sendTransaction(response.players[i], {from: response.address, gas: 300000});
			}
			console.log(killwolf.game_is_on.call())
			killwolf.start_game.sendTransaction({from: response.address});
			console.log(killwolf.game_is_on.call())
			res.sendFile( __dirname + "/public/game.html");
		})
		//玩家登陆游戏
		app.get('/newplayer', function (req, res) {
			// 输出 JSON 格式
			var response = {
				"address":req.query.name
			};
			console.log(response)
			res.sendFile( __dirname + "/public/game.html");
		})
		//接收在登录界面填写表单时发送来的信息
		app.post('/',function(req,res) {
			req.on('data',function(data){
				obj=JSON.parse(data);
				var taddr = obj.address
				console.log(taddr);
				res.send(killwolf.query_role(taddr));
			})
		})
		//接收登陆游戏时发送来的信息
		app.post('/game',function(req,res) {
			req.on('data',function(data){
				obj=JSON.parse(data);
				var taddr = obj.address
				console.log("game", taddr);
				var roles = []
				var players = []
				var total = killwolf.query_total()
				for(i = 0; i < total; i++) {
					players.push(killwolf.query_address(i))
					roles.push(killwolf.query_role(players[i]))
				}
				var number = killwolf.query_number(taddr)
				online[number] = 1
				var rres = {
					"number": number,
					"roles": roles,
					"players": players,
					"online": online
				}
				console.log(rres)
				res.send(rres);
			})
		})
		//接收白天还是黑夜的信息
		app.post('/day',function(req,res) {
			req.on('data',function(data){
				obj=JSON.parse(data);
				var act = obj.action
				//console.log("day", act);
				if (act == "click") {
					console.log("day_change!")
					if (daystate == "day") {
						if (killwolf.day_of_game.call() > 1) {
							killwolf.Day_over.sendTransaction({from: killwolf.judge.call(), gas: 300000});
						}
						daystate = "night";
					}
					else {
						daystate = "day";
						killwolf.Day_breaks.sendTransaction({from: killwolf.judge.call(), gas: 300000});
					}
				}
				res.send(daystate);
			})
		})
		//接收是否在线的信息
		app.post('/online',function(req,res) {
			req.on('data',function(data){
				res.send(online);
			})
		})
		//接收对各项状态的询问
		app.post('/askstates',function(req,res) {
			req.on('data',function(data){
				obj=JSON.parse(data);
				var is_day = obj.is_day;
				// console.log("game", taddr);
				var total = killwolf.query_total()
				var lives = []
				var result = killwolf.get_result();
				var rres
				for (i = 0; i < total; i++) {
					lives.push(killwolf.query_lives(i));
				}
				if (is_day) {
					var day_votes = []
					var words = []
					for (i = 0; i < total; i++) {
						day_votes.push(killwolf.query_dvote(i));
						words.push(killwolf.query_word(i));
					}
					rres = {
						"lives": lives, 
						"result": result, 
						"day_votes": day_votes, 
						"words": words
					}
				}
				else {
					var night_votes = []
					for (i = 0; i < total; i++) {
						night_votes.push(killwolf.query_nvote(i));
					}
					rres = {
						"lives": lives, 
						"result": result, 
						"night_votes": night_votes
					}
				}
				console.log(rres)
				res.send(rres);
			})
		})
		//接收投票信息
		app.post('/vote',function(req,res) {
			req.on('data',function(data){
				obj=JSON.parse(data);
				if (obj.if_day) {
					killwolf.vote_for_wolf.sendTransaction(obj.to, {from: obj.from, gas: 300000});
				}
				else {
					killwolf.vote_for_man.sendTransaction(obj.to, {from: obj.from, gas: 300000});
				}
				res.send("ok");
				console.log("vote completed!");
			})
		})
		//接收发言信息
		app.post('/say',function(req,res) {
			req.on('data',function(data){
				obj=JSON.parse(data);
				killwolf.player_saying.sendTransaction(obj.words, {from: obj.from, gas: 300000});
				res.send("ok");
				console.log("say completed!");
			})
		})
		var server = app.listen(8080, function () {
			var host = server.address().address
			var port = server.address().port
			console.log("应用实例，访问地址为 http://%s:%s", host, port)
		})

	}
})