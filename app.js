var express=require('express');
var session = require('express-session');
var favicon = require('serve-favicon');
var path=require('path');
var app=express();
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
var http=require('http').Server(app);
var io=require('socket.io')(http);


var sm = {};
var onlineuser = [];
var num = 0;
io.on('connection',function(socket){
	//注册用户
	socket.on('chat-reg',function(data){
     console.log("chat-reg:" + JSON.stringify(data));
	  sm[data.user] = socket;
	  socket.emit('chat-reg',{code:200,msg:"reg success"});
	  
	  socket.name = data.user;
	  var index = onlineuser.indexOf(data.user);
	   if(index == -1){
            num++;
            onlineuser.push(data.user);
           //欢迎用户
            io.sockets.emit("loginnum", {existName:data.user,num:num,onlineuser:onlineuser});//用户信息
        } else {
        	
            console.log("existName:"+data.user);
           io.sockets.emit("existname",{existName:data.user,num:num,onlineuser:onlineuser});
        }
	  
 	});
 	//监听客户端的消息
	socket.on('liaotian',function(msg){
		if(msg.name){
		 socket.emit('liaotian',{msg:msg});
		 console.log(msg);
		var user = msg.name;
		sm[user].emit('liaotian',{msg:msg});
	 }else{
	 	io.sockets.emit('liaotian',{msg:msg});
	 }
	})
	//
	socket.on('disconnect',function(data){
	   //io.sockets.emit('disconnect',data);
	   var isindex = onlineuser.indexOf(socket.name);
        //console.log("isindex:"+isindex);
        if(isindex != -1){
            onlineuser.splice(isindex,1);
            num--;
            io.sockets.emit('disconnect',{logoutuser:socket.name,num:num,onlineuser:onlineuser});//用户信息
        }
	 })
  })
app.use(session({
  secret:'keyboard cat',
  resave:false,
  saveUninitialized:true,
}))
var router=require('./router/router.js');
//app.set('views',path.join(__dirname,'views'));

app.set('view engine','ejs');
app.use(express.static('./public'));
app.use('/avatar',express.static('./avatar'));
app.use('/upload',express.static('./upload'));
app.get('/',router.showindex);
app.get('/regist',router.showregist);
app.get('/login',router.login);
app.post('/doregist',router.doregist);
app.post('/dologin',router.dologin);
app.get('/setavater',router.setavater);
app.post('/dosetavater',router.dosetavater);
//app.get('/qie',router.doqie);
//app.get('/docut',router.docut);
app.post('/fbpost',router.fbpost);
app.get('/getallshuoshuo',router.getallshuoshuo);
app.get('/getusersinfo',router.getusersinfo);
app.get('/shuoshuoamount',router.shuoshuoamount);
app.get('/user/:user',router.user);
app.get('/userlist',router.userlist);
app.get('/wordye/:id',router.wordye);
app.get('/shanchu/:id',router.shanchu);
app.get('/goout',router.goout);
app.get('/shanchuwz/:id',router.shanchuwz);
app.get('/shougaiwz/:id',router.shougaiwz);
app.post('/dogaiwz',router.dogaiwz);
app.post('/doliuyan',router.doliuyan);
app.post('/doshanliuyan',router.doshanliuyan);
app.get('/dofenlei',router.dofenlei);
app.post('/dohuiliuyan',router.dohuiliuyan);
app.get('/shoucang/:user',router.usershoucang);
app.post('/doshoucang',router.doshoucang);
app.get('/doursexiaoxi',router.doursexiaoxi);
app.post('/doshanhuiliuyan',router.doshanhuiliuyan);
app.post('/dockursexiaoxi',router.dockursexiaoxi);//查看个人消息
app.get('/shezhixinxi',router.shezhixinxi);//设置个人信息
app.post('/baocunxinxi',router.baocunxinxi);
app.get('/setpassword',router.setpassword);//设置密码
app.post('/dzan',router.dzan);//点赞
app.get('/forget',router.forget);//忘记密码
app.post('/doforget',router.doforget);
app.post('/dodoforget',router.dodoforget);
app.get('/doserch',router.doserch);
app.get('/liaotian',router.liaotian);
app.get('/userxinxi',router.userxinxi);//个人信息
app.post('/dopasword',router.dopasword);
app.get('/xiangce',router.xiangce);
app.post('/doxiangce',router.doxiangce);
app.get('/doshanxiangce/:id',router.doshanxiangce);
app.get('/zhaopian',router.zhaopian);
app.get('/guanzhu/:user',router.userguanzhu);
app.get('/doguanzhu/:user',router.userdoguanzhu);
app.get('*',router.errner);
http.listen(8888);



