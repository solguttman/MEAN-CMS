var express = require('express');
var fs = require('fs');
var escape = require("html-escape");
var router = express.Router();
var mongojs = require('mongojs');

var db = mongojs('CMS',['pages']);
var allKeys = function(pages){
	var keys = [];
	pages.forEach(function(page){
		for(var key in page){
			if(keys.indexOf(key) == -1){
				keys.push(key);
			}
		}
	});
	return keys;
};

router.get('/', function(req, res, next) {
			
	db.pages.find(function(err, pages){
		
		res.render('pages/export',{
			keys:allKeys(pages),
			data:pages
		});
		
	});
	
	
});

router.get('/download',function(rqe, res){
	
	db.pages.find(function(err, pages){
		
		var CSV = '',
			file = 'data.csv',
			path = 'downloads/' + file;
		
		CSV = allKeys(pages);
		
		pages.forEach(function(page){ 
			CSV += '\r\n';	
			for(var p in page){
				CSV += '"' + escape(page[p]) + '",';
			}
		});
		
		fs.writeFile(path, CSV, function (err) {
			res.download(path);
		});
		
	});
	
	
});

module.exports = router;