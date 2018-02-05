var formidable=require('formidable');
var db=require('../models/db.js');
var md5=require('../models/md5.js');
var path=require('path');
var fs=require('fs');
//var gm = require('gm');
var cookieparser=require('cookie-parser');
var moment = require('moment');
var objectid=require('mongodb').ObjectID;
var nodemailer=require('nodemailer');
var multer=require('multer');
var uploads='./upload/';
var upload = multer({dest:uploads}).array("file",2);
//首页

exports.showindex=function(req,res,next){
	console.log(req.session.login);
	//检索数据库查头像
	if(req.session.login=='1'){
		db.find('users',{username:req.session.username},function(err,result){
			db.getAllCount('posts',{'shoucang.username':req.session.username},function(resultb){
			db.find('liuyan',{"liuyan.type":req.session.username},function(err,resulta){
			var avatar=result[0].avatar || '0.png';
			req.session.scgs=resultb;//个人收藏数量
			req.session.userxiaoxi=resulta.length;//个人消息数量
			res.render('index',{
				"login":req.session.login=='1'?true:false,
				"username":req.session.login=='1'?req.session.username:'',
				"active":'首页',
				"avatar":avatar,
				
			  })
			 })
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
		var useremail=fields.useremail;
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
				'useremail':useremail,
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
	res.redirect('/shezhixinxi');
}
//切
// exports.doqie=function(req,res,next){
// 	db.find('users',{'username':req.session.username},function(err,resuu){
// 			req.session.imghz=resuu[0].avatar;
// 			res.render('cut',{
// 				"avatar":req.session.imghz,
// 			});
// 		})
// }
// exports.docut=function(req,res,next){
// 			var filename=req.session.imghz;
// 			var w=req.query.w;
// 			var h=req.query.h;
// 			var x=req.query.x;
// 			var y=req.query.y;
// 			//裁切图片
// 			gm("./avatar/"+filename).crop(w,h,x,y).resize(100,100,'!').write("./avatar/"+filename,function(err){
// 				if(err){
// 					res.send('-1');
// 					return;
// 				}
// 				res.send('1');
// 		})
// }
//发表文章
exports.fbpost=function(req,res,next){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var content=fields.content;
		var title=fields.title;
		var classification=fields.classification;
			db.insertOne('posts',{
				'title':title,
				'username':req.session.username,
				'content':content,
				'time':new Date(),
				'look':'0',//访问量
				'ts':'0',//留言条数
				'type':'0',//收藏
				'classification':classification,//类别

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
	db.getAllCount('posts',{},function(count){
		res.json(count);
	})
}
//个人主页
exports.user=function(req,res,next){
	var user=req.params['user'];
	console.log(user);
	db.find('posts',{'username':user},function(err,result){
		
		db.find('users',{'username':user},function(err,resulta){
			
			db.getAllCount('users',{'username':req.session.username,'guanzhu.username':user},function(resultb){
				db.getAllCount('posts',{'shoucang.username':user},function(resultc){
				
				res.render('user',{
					"username":req.session.username,
					'user':user,
					"active":'我的主页',
					"xiaoxi":req.session.userxiaoxi,
					"cerenshuo":result,
					"avatar":resulta[0].avatar,
					"scgs":req.session.scgs,
					"admin":"admin",
					"resulta":resulta,
					"login":req.session.login=='1'?true:false,
					"resultb":resultb,
					"scgs":resultc,


				})
			})
			
			})
		})
		
		
	})
	
}
//个人收藏
exports.usershoucang=function(req,res,next){
	var user=req.params['user'];
		var username=user;
	db.find('posts',{'shoucang.username':user},function(err,result){
		
		db.find('users',{'username':user},function(err,resulta){

			db.getAllCount('users',{'username':req.session.username,'guanzhu.username':user},function(resultb){

				db.getAllCount('posts',{'shoucang.username':user},function(resultc){
				res.render('user',{
					"username":req.session.username,
					'user':user,
					"active":'我的收藏',
					"cerenshuo":result,
					"xiaoxi":req.session.userxiaoxi,
					"avatar":resulta[0].avatar,
					"resulta":resulta,
					"resultb":resultb,
					"admin":"admin",
					"login":req.session.login=='1'?true:false,
					"scgs":resultc,
				})
				})
			
			})
		})
		
	})
	
}
//关注
exports.userguanzhu=function(req,res,next){
	if(req.session.login){
	var username=req.params['user'];
	db.getAllCount('users',{"username":req.session.username,'guanzhu.username':username},function(resultb){
			//console.log(resultb+'数量');
			db.find('users',{'username':username},function(err,resulta){
				if(resultb){
				db.update('users',{"username":req.session.username},
					{$pull:{"guanzhu":{"username":username}}},
					function(err,result){
						if(err){
						console.log(err)
					}
					
					res.send('成功');

				})
			       }else{
						db.update('users',{"username":req.session.username},
						{$push:{"guanzhu":{"username":username,"avatar":resulta[0].avatar}}},
						function(err,result){
						if(err){
							console.log(err)
						}

						res.send('成功');
						
					})
				}
				})
		})
}else{

	res.redirect('/login');
}

}
//显示关注的页面
exports.userdoguanzhu=function(req,res,next){
	var user=req.params['user'];
	var username=user;
	db.find('posts',{'shoucang.username':user},function(err,result){
		db.find('users',{'username':user},function(err,resulta){
			db.getAllCount('users',{'username':req.session.username,'guanzhu.username':user},function(resultb){
				db.getAllCount('posts',{'shoucang.username':user},function(resultc){
				res.render('user',{
					"username":req.session.username,
					'user':user,
					"active":'我的关注',
					"cerenshuo":result,
					"xiaoxi":req.session.userxiaoxi,
					"avatar":resulta[0].avatar,
					"resulta":resulta,
					"resultb":resultb,
					"admin":"admin",
					"login":req.session.login=='1'?true:false,
					"scgs":resultc,
				  })
				})
			
			})
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

			'suoyouchengyuan':result,

		})
		
	})
}
//文章页
exports.wordye=function(req,res,next){
	var id=req.params['id'];
	db.find('posts',{'_id':objectid(id)},function(err,result){

		db.getAllCount('posts',{'shoucang.username':req.session.username,'_id':objectid(id)},function(resultsl){

		console.log(resultsl);

		db.updateMany('posts',{'_id':objectid(id)},{
			$set:{
				'look':parseInt(result[0].look+1),
					}},function(err,result){
					if(err){
						console.log(err)
					}
		    })
		db.find('users',{'username':result[0].username},function(err,resulta){
			db.find('liuyan',{'wzid':result[0].wzid},function(err,resultb){
				
						
							res.render('wordye',{
							"login":req.session.login=='1'?true:false,
							"username":req.session.login=='1'?req.session.username:'',
							"active":'',
							'title':result[0].title,
							'content':result[0].content,
							'user':result[0].username,
							"avatar":resulta[0].avatar,
							"_id":result[0]._id,
							"type":resultsl,
							"liuyan":resultb,
							"classification":result[0].classification,
							"ts":resultb.length,
							"look":result[0].look,

						})
					
					
						
				
		})
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
		//文章
		db.find('posts',{'username':result[0].username},function(err,resultab){
			if(resultab[0]){


			if(resultab[0].wzid){
				db.deleteMany('liuyan',{'wzid':resultab[0].wzid},function(err,result){
						if(err){
								res.send('失败');
							}
							
					})
			 }
			 if(resultab[0].username){
				db.deleteMany('posts',{'username':result[0].username},function(err,resulta){
					if(err){
						res.send('失败');
					}
				})
			  }
			}
			
		})
		//图片
		db.deleteMany('imagesa',{'username':result[0].username},function(err,resultc){

								if(err){
									res.send('失败');
								}
								var dz=path.join(__dirname,'../upload/'+result[0].username+'/');
								deleteall(dz);
							})
		//留言
		db.deleteMany('liuyan',{'username':result[0].username},function(err,result){
						if(err){
								res.send('失败');
							}
							
							
					})
		//删除人
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
			db.deleteMany('liuyan',{'wzid':result[0].wzid},function(err,result){
						if(err){
								res.send('失败');
							}
							
					})
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
	delete req.session.login;
	delete req.session.username;
	res.redirect('/');
}
//显示改文章
exports.shougaiwz=function(req,res,next){
	var id=req.params['id'];
	if(req.session.login){
		db.find('posts',{'_id':objectid(id)},function(err,result){
			console.log(result[0].content);
			if(result[0].username==req.session.username || req.session.username=='admin'){
				res.render('shougaiwz',{
					"login":req.session.login=='1'?true:false,
					"username":req.session.login=='1'?req.session.username:'',

					"title":result[0].title,
					"content":result[0].content,
					"id":result[0]._id,
					"active":'',
				})
			}else{
				res.send('没有权限');
			}
			
		})
	}else{
		res.send('错误');
	}
	
}
//做更改文章
exports.dogaiwz=function(req,res,next){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var content=fields.content;
		var title=fields.title;
		var id=fields.id;
			db.updateMany('posts',{'_id':objectid(id)},{
			$set:{
				'title':title,
				'content':content,
				'time':new Date(),


			}},function(err,result){
				if(err){
					res.send('-3');
					return;
				}
				res.send('1');
			})
	})
}
//发留言
exports.doliuyan=function(req,res,next){
	var form = new formidable.IncomingForm();
	if(req.session.login){
		form.parse(req, function(err, fields, files){
		var content=fields.content;
		var id=fields.wzid;
		
			db.insertOne('liuyan',{
					'username':req.session.username,
					'content':content,
					'wzid':id,
					'time':moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
					
				},function(err,result){
				if(err){
					res.send('-3');
					return;
				}
				
			})
			db.find('liuyan',{'wzid':id},function(err,resultb){
				db.updateMany('posts',{'_id':objectid(id)},{
				$set:{
					'wzid':id,
					'ts':resultb.length,
						}},function(err,result){
						if(err){
							console.log(err)
						}
						res.send('1');
			    })
			})
			
	})
	}else{
		res.send('请登录');
	}
	
}
//删除留言
exports.doshanliuyan=function(req,res,next){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var wzid=fields.wzid;
		var lyid=fields.lyid;
		db.find('liuyan',{'_id':objectid(lyid)},function(err,result){
		if(result[0].username==req.session.username || req.session.username=='admin'){
			db.deleteMany('liuyan',{'_id':objectid(lyid)},function(err,result){
				if(err){
						res.send('失败');
					}	
			})
			db.find('liuyan',{'wzid':wzid},function(err,resultb){
				db.updateMany('posts',{'wzid':wzid},{
				$set:{
					'ts':resultb.length,
						}},function(err,result){
						if(err){
							console.log(err)
						}
						res.send('1');
			    })
			})
		}else{
			res.send('没有权限');
		}
	 })
	})
}
//更改分类
exports.dofenlei=function(req,res,next){
	var page=req.query.page;
	var fication=req.query.tion;
	
		db.find('posts',{'classification':fication},{'pageamount':4,page:page,'sort':{'time':-1}},function(err,result){
		
				res.json({'r':result});
		
		
	 })
}
//回复留言
exports.dohuiliuyan=function(req,res,next){
	if(req.session.username){


	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var wzid=fields.wzid;
		var user=fields.user;
		var lyid=fields.lyid;
		var content=fields.content;
		var wztitle=fields.wztitle;
		db.update('liuyan',
		{"_id" : objectid(lyid)},
		{$push:{liuyan:{$each:[
			{
				'username':req.session.username,
				'user':user,
				'wztitle':wztitle,
				'type':user,
				'content':content,
				'wzid':wzid,
				'time':moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
			}]}}},
		function(err,result){
			if(err){
				console.log(err)
			}
			res.send('1');
		})
	})
}else{
	res.send('没有权限');
}
	
	
}
//删除回复
exports.doshanhuiliuyan=function(req,res,next){
	if(req.session.username){


	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var index=fields.index;
		var lyid=fields.lyid;
		db.update('liuyan',{"_id" : objectid(lyid)},{$pop:{"liuyan":index}},function(err,result){
			if(err){
				console.log(err)
			}
			res.send('1');
		})
	})
}else{
	res.send('没有权限');
}
}

//收藏
exports.doshoucang=function(req,res,next){
	if(req.session.username){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var wzid=fields.wzid;
		db.getAllCount('posts',{'shoucang.username':req.session.username,"_id":objectid(wzid)},function(resultb){
			//console.log(resultb+'数量');
				if(resultb){
				db.update('posts',{"_id":objectid(wzid)},
					{$pull:{"shoucang":{"username":req.session.username}}},
					function(err,result){
						if(err){
						console.log(err)
					}
					res.send('1');

				})
			       }else{
						db.update('posts',{'_id':objectid(wzid)},
						{$push:{"shoucang":{"username":req.session.username}}},
						function(err,result){
						if(err){
							console.log(err)
						}
						res.send('1');
					})
				}
		})
	})
}else{
	res.send('请登录');
}
}

//个人消息
exports.doursexiaoxi=function(req,res,next){
	if(req.session.login=='1'){
	    var username=req.session.username;
	db.find('liuyan',{"liuyan.type":username},function(err,resultc){
		db.find('users',{'username':username},function(err,resulta){
			
			db.find('liuyan',{},function(err,resultc){
		res.render('user',{
					"login":true,
					"username":req.session.username,
					'user':username,
					"active":'我的消息',
					"liuyan":resultc,
					"resulta":resulta,
					"xiaoxi":req.session.userxiaoxi,
					"avatar":resulta[0].avatar,
					"ts":'0',
					"scgs":req.session.scgs,
				
		      })
		     })
		   })
		})

	
}else{
	res.send('错误')
}
}
//查看个人消息
exports.dockursexiaoxi=function(req,res,next){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		db.updateMany('liuyan',{"liuyan.type":req.session.username},{
				$set:{
					"liuyan.$.type":"0",
						}},function(err,result){
						if(err){
							console.log(err)
						}
						
			    })
	})
}
//个人信息
exports.userxinxi=function(req,res,next){
	db.find('users',{'username':req.session.username},function(err,resulta){
	res.render('user/userxinxi',{
					"login":true,
					"username":req.session.username,
					"active":'个人信息',
					"avatar":resulta[0].avatar,
					"resulta":resulta[0],

	});
	});
}
//设置个人信息
exports.shezhixinxi=function(req,res,next){
	db.find('users',{'username':req.session.username},function(err,resulta){
	res.render('user/shezhixinxi',{
					"login":true,
					"username":req.session.username,
					"active":'修改信息',
					"avatar":resulta[0].avatar,
					"resulta":resulta[0],
	});
	});
}
//保存个人信息
exports.baocunxinxi=function(req,res,next){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var name=fields.name;
		var sex=fields.sex;
		var shengri=fields.shengri;
		var email=fields.email;
		var desc=fields.desc;
	db.find('users',{'username':req.session.username},function(err,resulta){
		if(resulta){
			db.updateMany('users',{'username':req.session.username},{
				$set:{
					"xiangxi.name":name,
					"xiangxi.sex":sex,
					"xiangxi.shengri":shengri,
					"xiangxi.email":email,
					"xiangxi.desc":desc,
						}},function(err,result){
						if(err){
							console.log(err)
						}
						res.send('1');
						
			    })
		}else{
			res.send('错误');
		}
			});
		
		
	
	});
	
}
//设置个人密码
exports.setpassword=function(req,res,next){
	db.find('users',{'username':req.session.username},function(err,resulta){
	res.render('user/setpassword',{
					"login":true,
					"username":req.session.username,
					"active":'修改密码',
					"avatar":resulta[0].avatar,
	});
	});
}

//点赞
exports.dzan=function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var lyid=fields.lyid;
		db.getAllCount('liuyan',{'dzan.username':req.session.username,"_id":objectid(lyid)},function(resulta){
			if(resulta){
				db.update('liuyan',{'_id':objectid(lyid)},
						{$pull:{"dzan":{"username":req.session.username}}},

						function(err,result){
						if(err){
							console.log(err)
						}
						res.send('1');
					})
				
			}else{
				db.update('liuyan',{'_id':objectid(lyid)},
						{$push:{"dzan":{"username":req.session.username}}},

						function(err,result){
						if(err){
							console.log(err)
						}
						res.send('1');
					})

			}
		})
			
		
	})
	
}
//设置密码的页面
exports.forget=function(req,res){
res.render('userlogn/forget',{
	"active":'',
	"login":false,
	"username":req.session.username,
});
}
//忘记密码
exports.doforget=function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
	var email = fields.useremail;
	var username=fields.username;
	console.log(username);
	db.find('users',{'useremail':email,'username':username},function(err,resulta){
		console.log(resulta[0]+'11111');
		if(resulta[0]){


			//配置自己的邮箱
			var transporter = nodemailer.createTransport({  
			  host: "smtp.sina.cn", // 主机
			  secureConnection: true, // 使用 SSL
			  service: 'sina',
			  port: 465, // SMTP 端口 
			  auth: {  
			    user: 'qxyqc@sina.cn',  
			    pass: 'q1x3y1l4x' //授权码,通过QQ获取  
			  }  
			  });  
			var newusession = randomString(6);
			req.session.newusession=newusession;
			db.updateMany('users',{'username':fields.username},{
				$set:{
					"newyzm":newusession
						}},function(err,result){
						if(err){
							console.log(err)
						}

			    })
			//接受者的邮箱
			var mailOptions = {  
			    from: 'qxyqc@sina.cn', // 发送者  
			    to: email, // 接受者,可以同时发送多个,以逗号隔开  
			    subject: '博客验证码', // 标题  
			    //text: 'Hello world', // 文本  
			    html : "尊敬的用户您好,您本次的验证码是:"+req.session.newusession
			  };	
			  transporter.sendMail(mailOptions, function (err, info) {  
			    if (err) {  
			      console.log(err);  
			      return;  
			    }  
			  
			    console.log('发送成功'); 
			    res.send('0'); 
               })

              
	            }else{
	            	console.log('未注册');
	            	res.send('-1');
	            }
			   })
	 })


}
//忘记密码更改密码
exports.dodoforget=function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var username=fields.username;
		var password=fields.password;
		var yzm=fields.useryzm;
		
		db.find('users',{'username':fields.username},function(err,resulta){
			if(resulta[0].newyzm==yzm){
				password=md5(password);
				db.updateMany('users',{'username':fields.username},{
				$set:{
					"password":password,
						}},function(err,result){
						if(err){
							console.log(err)
						}

						
						res.send('1');
						
			    })
			}else{
				res.send('-1');
			}
			
		  })
		
	})
	
}
function randomString(size) { 
	size=size;
    var code_string = '0123456789';  
    var max_num = code_string.length + 1;  
    var new_pass = '';  
    while (size > 0) {  
        new_pass += code_string.charAt(Math.floor(Math.random() * max_num));  
        size--;  
    }  
    return new_pass;  
};  
//修改密码
exports.dopasword=function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var password=fields.password;
		db.find('users',{'username':req.session.username},function(err,resulta){
			if(resulta){
				password=md5(password);
				db.updateMany('users',{'username':req.session.username},{
				$set:{
					"password":password,
						}},function(err,result){
						if(err){
							console.log(err)
						}

						
						res.send('1');
						
			    })
			}else{
				res.send('错误');
			}
			
		  })
		
	})
	
}

//搜索文章

exports.doserch=function(req,res,next){
	    var serch=req.query.serch;
		var rezhen=eval('/'+serch+'.*/i');
		db.find('posts',{'title':rezhen},function(err,result){
				if(err){
					console.log(err)
				}
				res.json({'r':result});
		
		
	 })
	
	
}
//聊天
exports.liaotian=function(req,res,next){
	db.find('users',{},function(err,resulta){
		res.render('home/liaotian',{
			"username":req.session.login=='1'?req.session.username:'',
			"avatar":resulta[0].avatar,
			"resulta":resulta,
			"active":'聊天',
			"login":true,


		})
	})
	
}
//多图上传
exports.xiangce=function(req,res,next){
	db.find('users',{"username":req.session.username},function(err,resulta){
		db.find('imagesa',{"username":req.session.username},function(err,result){
		res.render('home/xiangce',{
			"username":req.session.login=='1'?req.session.username:'',
			"avatar":resulta[0].avatar,
			"resulta":resulta,
			"result":result,
			"active":'聊天',
			"login":true,


		})
		})
	})
}
exports.doxiangce=function(req,res,next){



upload(req, res, function (err) {
    if (err) {
      res.send('一次只能传2个文件');
      return
    }

    if(req.files==undefined){
        res.send("请选择要上传的图片...");
    }else{
    	var dz=path.join(__dirname,'../upload/');
    	//查找是否有这个文件夹
    	fs.exists(dz+req.body.name, function(exists){ 
			 if(!exists){ 
			 	//没有新建这个文件夹
				   fs.mkdir(dz+req.body.name, function(err){ 
					 if(err){ 
					    console.log("失败！");  
					 }
							 
					});
			 }
			 for(var i=0;i<req.files.length;i++){
		        	var fileFormat = (req.files[i].originalname).split(".");
		          	var newpathz=Date.now()+"."+fileFormat[fileFormat.length - 1];
		            var filepath = __dirname + "/../upload/"+req.body.name+"/"+newpathz;
		            console.log(filepath);
		            fs.renameSync(req.files[i].path,filepath);
		            db.insertOne('imagesa',{
		            		'username':req.body.name,
							'url':newpathz,
							'time':moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
							
						},function(err,result){
						if(err){
							res.send('-3');
							return;
						}
						
					})
		        }
		        res.redirect('/xiangce');
			});
    	
    	
        
        
    }
  })



}


//删除图片
exports.doshanxiangce=function(req,res,next){
var id=req.params['id'];
db.find('imagesa',{'_id':objectid(id)},function(err,resulta){
	db.deleteMany('imagesa',{'_id':objectid(id)},function(err,result){
		var dz=path.join(__dirname,'../upload/'+resulta[0].username+'/');//图片的路径
							if(err){
									res.send('失败');
								}
								//删除文件
								fs.unlink(dz+resulta[0].url, function(err){ 
									 if(err){ 
									    console.log("删除失败！"); 
									     return;
									 }else{ 
									    console.log("删除成功！");
									    res.redirect('/xiangce');
									    return;
									 } 
									});
								
						})
		})
}
//照片墙
exports.zhaopian=function(req,res,next){
	
		db.find('imagesa',{},function(err,result){
		res.render('home/zhaopian',{
			"username":req.session.login=='1'?req.session.username:'',
			"result":result,
			"active":'照片墙',
			"login":req.session.login=='1'?true:false,


		})
		
	})
}
//删除文件夹和下面文件
function deleteall(path) {  
    var files = [];  
    if(fs.existsSync(path)) {  
        files = fs.readdirSync(path);  
        files.forEach(function(file, index) {  
            var curPath = path + "/" + file;  
            if(fs.statSync(curPath).isDirectory()) { // recurse  
                deleteall(curPath);  
            } else { // delete file  
                fs.unlinkSync(curPath);  
            }  
        });  
        fs.rmdirSync(path);  
    }  
};  
//404页面
exports.errner=function(req, res, next) {
  res.render('404');
  next();
}