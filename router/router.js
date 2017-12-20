var formidable=require('formidable');
var db=require('../models/db.js');
var md5=require('../models/md5.js');
var path=require('path');
var fs=require('fs');
var gm = require('gm');
var cookieparser=require('cookie-parser');
var objectid=require('mongodb').ObjectID;
//首页

exports.showindex=function(req,res,next){
	console.log(req.session.login);
	//检索数据库查头像
	if(req.session.login=='1'){
		db.find('users',{username:req.session.username},function(err,result){
			var avatar=result[0].avatar || '0.png';
			res.render('index',{
				"login":req.session.login=='1'?true:false,
				"username":req.session.login=='1'?req.session.username:'',
				"active":'首页',
				"avatar":avatar
			})
			
		})
		
	}else{
		res.render('index',{
				"login":req.session.login=='1'?true:false,
				"username":req.session.login=='1'?req.session.username:'',
				"active":'首页',

			})
	}
}
//注册
exports.showregist=function(req,res,next){
	res.render('regist',{
		"login":req.session.login=='1'?true:false,
		"username":req.session.login=='1'?req.session.username:'',
		"active":'注册',
		"avatar":req.session.avatar
	})
}

exports.doregist=function(req,res,next){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		//得到表单
		var username=fields.username;
		var password=fields.password;
		db.find('users',{'username':username},function(err,result){
			console.log(result.length);
			if(err){
				res.send('-3');
				return;
			}
			if(result.length!=0){

				res.send('-1');
				return;
			}
			password=md5(password);
			db.insertOne('users',{
				'username':username,
				'password':password,
				'avatar':'0.png'

			},function(err,result){
				if(err){
					res.send('-3');
					return;
				}
				
				req.session.login='1';
				req.session.username=username;
				res.send('1');

			})

		})
　　  });
}
//登陆
exports.login=function(req,res,next){
	res.render('login',{
		"login":req.session.login=='1'?true:false,
		"username":req.session.login=='1'?req.session.username:'',
		"active":'登陆'
	})
}
exports.dologin=function(req,res,next){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var username=fields.username;
		var password=fields.password;
		db.find('users',{'username':username},function(err,resulta){
			if(err){
				res.send('-3');
				return;
			}
			if(resulta.length==0){

				res.send('-1');
				return;
			}
			var jmpassword=md5(password);
			if(jmpassword==resulta[0].password){
				req.session.login='1';
				req.session.username=username;
				res.send('1');
				return;
			}else{
				res.send('-2');
				return;
			}
			
		})
	})
}
//设置头像
exports.setavater=function(req,res,next){
		if(req.session.login=='1'){
				res.render('settouxing',{
				"login":req.session.login=='1'?true:false,
				"username":req.session.login=='1'?req.session.username:'',
				"active":'修改头像'
			})
		}else{
			res.send('错误')
		}
		
	
	
}
exports.dosetavater=function(req,res,next){
	var form = new formidable.IncomingForm();
	var extname='';
	form.uploadDir=path.normalize(__dirname+'/../avatar');
	form.parse(req, function(err, fields, files){
		//取出名字的后.jpg
		extname=path.extname(files.touxiang.name);
		var oldPath=files.touxiang.path;
		var imgdz=req.session.username+extname;
  		var newPath=path.normalize(__dirname+'/../avatar')+'/'+imgdz;
  		
		fs.rename(oldPath,newPath,function(err){
  		   	if(err){
  		   		res.send('改名失败');
  		   		return;
  		   	}
  		   });
		db.updateMany('users',{'username':req.session.username},{
			$set:{'avatar':imgdz}},function(err,results){
				
		});	
		return;
	})
	//跳转到切
	res.redirect('/qie');
}
//切
exports.doqie=function(req,res,next){
	db.find('users',{'username':req.session.username},function(err,resuu){
			req.session.imghz=resuu[0].avatar;
			res.render('cut',{
				"avatar":req.session.imghz,
			});
		})
}
exports.docut=function(req,res,next){
			var filename=req.session.imghz;
			var w=req.query.w;
			var h=req.query.h;
			var x=req.query.x;
			var y=req.query.y;
			//裁切图片
			gm("./avatar/"+filename).crop(w,h,x,y).resize(100,100,'!').write("./avatar/"+filename,function(err){
				if(err){
					res.send('-1');
					return;
				}
				res.send('1');
		})
}
//发表文章
exports.fbpost=function(req,res,next){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var content=fields.content;
		var title=fields.title;
			db.insertOne('posts',{
				'title':title,
				'username':req.session.username,
				'content':content,
				'time':new Date()

			},function(err,result){
				if(err){
					res.send('-3');
					return;
				}
				res.send('1');
			})
	})

}
//列出所有说说
exports.getallshuoshuo=function(req,res,next){
	var page=req.query.page;
	db.find('posts',{},{'pageamount':4,page:page,'sort':{'time':-1}},function(err,result){
		
		res.json({'r':result});
	})
}
//列出个人说说
exports.getusersinfo=function(req,res,next){
	var username=req.query.username;
	db.find('users',{'username':username},function(err,result){
		var obj={
			avatar:result[0].avatar
		}
		res.json({'r':obj});
	})
}
//总数

exports.shuoshuoamount=function(req,res,next){
	db.getAllCount('posts',function(count){
		res.json(count);
	})
}
//个人主页
exports.user=function(req,res,next){
	var user=req.params['user'];
	console.log(user);
	db.find('posts',{'username':user},function(err,result){
		db.find('users',{'username':user},function(err,resulta){
			if(req.session.login=='1'){
				res.render('user',{
					"login":true,
					"username":user,
					'user':user,
					"active":'我的',
					"cerenshuo":result,
					"avatar":resulta[0].avatar,
				})
			}else{
				res.send('错误');
			}
		})
		
	})
	
}
//所有用户
exports.userlist=function(req,res,next){
	db.find('users',{},function(err,result){
		res.render('userlist',{
			"login":req.session.login=='1'?true:false,
					"username":req.session.login=='1'?req.session.username:'',
					"active":'成员',

			'suoyouchengyuan':result
		})
	})
}
//文章页
exports.wordye=function(req,res,next){
	var id=req.params['id'];
	db.find('posts',{'_id':objectid(id)},function(err,result){
		db.find('users',{'username':result[0].username},function(err,resulta){
				res.render('wordye',{
				"login":req.session.login=='1'?true:false,
				"username":req.session.login=='1'?req.session.username:'',
				"active":'',
				'title':result[0].title,
				'content':result[0].content,
				'user':result[0].username,
				"avatar":resulta[0].avatar,
				"_id":result[0]._id,
			})
		})
		
		
	})
}
//删除用户
exports.shanchu=function(req,res,next){
	var id=req.params['id'];
	console.log(id);
	if(req.session.username=="admin"){
		db.find('users',{'_id':objectid(id)},function(err,result){

		if(result[0].username=="admin"){
			res.send('不能删除管理员');
			return;
		}
		db.find('posts',{'username':result[0].username},function(err,resulta){
			if(resulta[0].username){
				db.deleteMany('posts',{'username':result[0].username},function(err,resulta){
					if(err){
						res.send('失败');
					}
				})
			}
		})
		db.deleteMany('users',{'_id':objectid(id)},function(err,resultb){

			if(err){
				res.send('失败');
			}
			res.send('成功');
		})

	  })
	}else{
		res.send('没有权限');
		return;
	}
	
	
}
//删除文章
exports.shanchuwz=function(req,res,next){
	var id=req.params['id'];
	db.find('posts',{'_id':objectid(id)},function(err,result){
		if(result[0].username==req.session.username || req.session.username=='admin'){
			db.deleteMany('posts',{'_id':objectid(id)},function(err,result){
				if(err){
						res.send('失败');
					}
					
					res.send('成功');
			})
		}else{
			res.send('没有权限');
			return;
		}
	})
	
}
//退出
exports.goout=function(req,res,next){
	req.session.login='0';
	res.send('成功');
}