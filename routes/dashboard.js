var express = require('express');
var fs = require('fs');
var router = express.Router();
var mongojs = require('mongojs');
var logged = require('../models/isLogged');

var db = mongojs('CMS',['users','pages']);

router.get('/',logged, function(req, res, next) {
	
	var totalImages = fs.readdirSync('public/uploads');
	
	db.users.count(function(err, usersCount){
			
			db.pages.aggregate({
				
				$group : {
					_id : '$type',
					total : {$sum : 1}
				}
				
			},function(err,pages){
				res.render('pages/dashboard', { 
					pages : pages,
					totalUsers : usersCount,
					totalImages : totalImages.length
				});
			});
			
	});
	
});

module.exports = router;