var http = require("http");
var url = require("url");
var querystring = require("querystring");
var fs=require("fs");
var path = require("path");
var messages = {};//储存信息所用到的全局变量
var server = http.createServer(function(request, response) {
  // response.writeHead(200, {"Content-Type": "text/html"});
  if (request.method == "POST") {//若请求方式为post，提供注册页面
    register(request, response);
  }
  else {
    send_message(request, response);//否则发送信息
  }
  // response.end();
});

function send_message(request, response) {
  var name = get_name(request);
  if ((!name)|| messages[name] === undefined) {//如果用户名为空或者是未注册
    signup(request,response);
  }
  else {
    show_message(response, name);
  }
}

function get_name(request) {
  return querystring.parse(url.parse(request.url).query).username;
}

function signup(request, response) {
  /*一开始试图在这里直接写一个注册页面
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write("<!DOCTYPE html>");
  response.write("<html>");
  response.write("<head>");
  response.write("<meta charset='UTF-8'>");
  response.write("<title>注册</title>");
  // response.write("<link href='register.css' type='text/css' rel='stylesheet' />")
  response.write("</head>");
  response.write("<body>");
  response.write("<<h1>欢迎注册</h1>");
  response.write("<form method = 'post'>");
  response.write("<label for='name'>姓名： <input type='text' name ='name'></label><br/>");
  response.write("<label for='number'>学号： <input type='text' name ='number'></label><br/>");
  response.write("<label for='phone'>电话： <input type='text' name='phone'></label><br/>");
  response.write("<label for='email'>邮箱： <input type='text' name='email'></label><br/>");
  response.write("<input type='submit' value = '提交'><input type='reset' value = '重置'>")
  response.write("</form>");
  response.write("</body>");
  response.write("</html>");
  // response.writeHead(200, {"Content-Type": "text/css"});
  // response.write("body {color: red;}");*/
  var pathname=__dirname+url.parse(request.url).pathname;//——dirname获取当前文件的目录路径
  if (path.extname(pathname)=="") {
        pathname+="/";
  }
  if (pathname.charAt(pathname.length-1)=="/"){
      pathname+="sign.html";
  }
  fs.exists(pathname,function(exists){
      if(exists){
          switch(path.extname(pathname)){//分析文件的类型
              case ".html":
                  response.writeHead(200, {"Content-Type": "text/html"});
                  break;
              case ".js":
                  response.writeHead(200, {"Content-Type": "text/javascript"});
                  break;
              case ".css":
                  response.writeHead(200, {"Content-Type": "text/css"});
                  break;
              case ".gif":
                  response.writeHead(200, {"Content-Type": "image/gif"});
                  break;
              case ".jpg":
                  response.writeHead(200, {"Content-Type": "image/jpeg"});
                  break;
              case ".png":
                  response.writeHead(200, {"Content-Type": "image/png"});
                  break;
              default:
                  response.writeHead(200, {"Content-Type": "application/octet-stream"});
          }
          fs.readFile(pathname,function (err,data){//读取文件并加载
              // console.log(pathname);
              response.end(data);
          });
      } 
      else {
          response.writeHead(404, {"Content-Type": "text/html"});
          response.end("<h1>404 Not Found</h1>");
      }
  });
  // response.end()
}

function register(request, response) {
  // var U = "";
  request.on('data', function(chunk) {
     var U = chunk.toString();
     console.log(U);
     U = querystring.parse(U);
     // console.log(U);
     var e = is_new(U);//判断用户信息是否为全新内容
     if (!e) {
      messages[U.name] = {//若是则记录并显示信息
        "number": U.number,
        "phone": U.phone,
        "email": U.email,
      }
      show_message(response, U.name);
     }
     else {
      show_error(e, response);//否则给出提示信息
     }
  });
  /*U = querystring.parse(U);  //将一个字符串反序列化为一个对象
  if (U) {
    console.log(U);
    messages[U.name] = {
      "number": U.number,
      "phone": U.phone,
      "email": U.email,
    }
    show_message(response, U.name);
  }*/
}

function show_message(response, name) {
  // 用表格形式表现用户信息
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write("<!DOCTYPE html>");
  response.write("<html>");
  response.write("<head>");
  response.write("<meta charset='UTF-8'>");
  response.write("<title>用户信息</title>");
  response.write("</head>");
  response.write("<body>");
  response.write("<<h1>用户信息</h1>");
  response.write("<table border='1'>"+
  "<tr>"+
    "<td>姓名</td>"+
    "<td>"+name+"</td>"+
  "</tr>"+
  "<tr>"+
    "<td>学号</td>"+
    "<td>"+messages[name].number+"</td>"+
  "</tr>"+
  "<tr>"+
    "<td>电话</td>"+
    "<td>"+messages[name].phone+"</td>"+
  "</tr>"+
  "<tr>"+
    "<td>邮箱</td>"+
    "<td>"+messages[name].email+"</td>"+
  "</tr>"+
  "</table>")
  response.write("</body>");
  response.write("</html>");
  response.end();
}

function is_new(U) {
  var m = "";
  // 遍历对象数组查看是否已经被注册
  Object.keys(messages).forEach(function(key){
    if (U.name == key) {
      m += "用户名 "+key+" 已被使用！请重新注册</br>";
    }
    if (U.number == messages[key].number) {
      m += "学号 "+messages[key].number+" 已被使用！请重新注册</br>";
    }
    if (U.phone == messages[key].phone) {
      m += "电话 "+messages[key].phone+" 已被使用！请重新注册</br>";
    }
    if (U.email == messages[key].email) {
      m += "邮箱 "+messages[key].email+" 已被使用！请重新注册</br>";
    }
  });
  return m;
}

function show_error(m, response) {
  // 直接给出错误信息
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write("<!DOCTYPE html>");
  response.write("<html>");
  response.write("<head>");
  response.write("<meta charset='UTF-8'>");
  response.write("<title>出错啦</title>");
  response.write("</head>");
  response.write("<body>");
  response.write("<<h1>错误提示</h1>");
  response.write(m);
  response.write("</body>");
  response.write("</html>");
  response.end();
}

server.listen(8000);//监听端口
console.log("Server is listening");

