var MongoClient = require('mongodb').MongoClient;
var settings=require('../setting.js');
function _connectDB(callback){
	var url=settings.dburl;
	MongoClient.connect(url,function(err,db){
		console.log('连接成功');
		callback(err,db);

	})
}
//插入数据
exports.insertOne=function(collectionName,json,callback){
	_connectDB(function(err,db){
		if(err){
			callback(err,db);
			return;
		}
		db.collection(collectionName).insertOne(json,function(err,result){
			callback(err,result);
			db.close();
		})
	})
}
//查找数据  args是个对象
exports.find=function(collectionName,json,c,d){
	var result=[];
	
	if(arguments.length == 3){
		var callback=c;
		var skipnumber=0;
		var limit=0;
	}else if(arguments.length = 4){
		var callback=d;
		var args=c;
		//省略的条数
		var skipnumber=args.pageamount*args.page||0;
		//数目限制
		var limit=args.pageamount||0;
		//排序方式
		var sort=args.sort||{};

	}else{
		throw new Error('find函数参数必须是三个或四个');
		return;
	}
	_connectDB(function(err,db){
		var cursor=db.collection(collectionName).find(json).skip(skipnumber).limit(limit).sort(sort);
		cursor.each(function(err,doc){
			if(err){
				callback(err,null);
				return;
			}
			if(doc != null){
				result.push(doc);
			}else{
				callback(null,result);
				db.close();
			}
		})
	})
}
//删除数据
exports.deleteMany=function(collectionName,json,callback){
	_connectDB(function(err,db){
		db.collection(collectionName).deleteMany(
			json,
			function(err,results){
				
				callback(err,results);
				db.close();
				}
			)

	})
}
//修改
exports.updateMany=function(collectionName,json1,json2,callback){
	_connectDB(function(err,db){
		db.collection(collectionName).updateMany(
			json1,
			json2,
			function(err,results){
				callback(err,results);
			})
	})
}

//push插入数组
exports.update=function(collectionName,whereStr,updateStr,callback) {  
		    //连接到表  
		    //var collection = db.collection('liuyan');
		    //更新数据
		    //var whereStr = {"username" : "11"};
		    //var updateStr = {$push:{liuyan:{$each:[{"wk":1,"score":10},{"wk":1,"score":10}]}}};
		    _connectDB(function(err,db){
		       db.collection(collectionName).update(whereStr,updateStr, function(err, result) {
		          callback(err,result);
		       });
		    })
		}


//差总数据数量
exports.getAllCount=function(collectionName,json,callback){
	_connectDB(function(err,db){
		console.log('aa');
		db.collection(collectionName).count(json).then(function(count){
			console.log(count);
			callback(count);
			db.close();
		})
	})

}




//创建索引
// init();
// function init(){
// 	//对数据进行初始化
// 	_connectDB(function(err,db){
// 		if(err){
// 			connsole.log(err);
// 			return;
// 		}
//restaurants表名字
// 		db.collection('restaurants').createIndex(
//cuisine设置谁为索引
// 			{'cuisine':1},
// 			null,
// 			function(err,results){
// 				if(err){
// 					connsole.log(err);
// 					return;
// 				}
// 				console.log('索引创建成功');
// 			 }
// 			)
// 	})
// }




// db.posts.update({"username":"11")},{$pull:{"shoucang.username":"11"}})

// db.posts.update({"username":"11"},{$pop:{"shoucang":0}})
// db.posts.update({"username":"11"},{$pop:{"shoucang":"0"}})
// db.posts.update({"shoucang":{"$exists":true}},{"$unset":{"shoucang",""}},{multi:true});

// db.posts.find( { "shoucang.username": { $exists: true } } )
// db.posts.update({"username":"11"},{$unset:{"shoucang.username":""}},{multi:true})

//db.posts.update({"_id" : ObjectId("5a45f3f25f81ec102c1b3291")},{$pull:{"shoucang":{"username":"11"}}});
