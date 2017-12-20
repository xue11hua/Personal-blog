var crypto=require('crypto');
module.exports=function(min){
	
	var md5=crypto.createHash('md5');
	var password=md5.update(min).digest('base64');
	return password;
}