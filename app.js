var express=require('express');
var session = require('express-session');
var app=express();
app.use(session({
  secret:'keyboard cat',
  resave:false,
  saveUninitialized:true,
}))
var router=require('./router/router.js')
app.set('view engine','ejs');
app.use(express.static('./public'));
app.use('/avatar',express.static('./avatar'));
app.get('/',router.showindex);
app.get('/regist',router.showregist);
app.get('/login',router.login);
app.post('/doregist',router.doregist);
app.post('/dologin',router.dologin);
app.get('/setavater',router.setavater);
app.post('/dosetavater',router.dosetavater);
app.get('/qie',router.doqie);
app.get('/docut',router.docut);
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
app.listen(3000);