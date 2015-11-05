var express = require('express');
var fs = require('fs');
var router = express.Router();
var mongojs = require('mongojs');
var async = require("async");

var db = mongojs('CMS',['users','pages']);

var getTotalImages,
	getTotalUsers,
	getPages;

router.get('/', function(req, res, next) {
	
	var locals = {};
	
	getTotalImages = function(callback){
		fs.readdir('public/uploads',function(err,images){
			if (err) return callback(err);
			locals.totalImages = images.length;
			callback();
		});
	};
	
	getTotalUsers = function(callback){
		db.users.count(function(err,totalUsers){
			if (err) return callback(err);
			locals.totalUsers = totalUsers;
			callback();
		});
	};
	
	getPages = function(callback){
		db.pages.aggregate({

			$group : {
				_id : '$type',
				total : {$sum : 1}
			}

		},function(err,pages){
			if (err) return callback(err);
			locals.pages = pages;
			callback();
		});
	};
	
	async.parallel([ getTotalImages, getTotalUsers, getPages ], function(err) { 
			if (err) return next(err); 
			res.render('pages/dashboard', locals);
	});
	
});

module.exports = router;