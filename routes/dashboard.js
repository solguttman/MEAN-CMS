var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var logged = require('../models/isLogged');

var db = mongojs('CMS',['users','pages']);

router.get('/',logged, function(req, res, next) {
	
	db.users.count(function(err, usersCount){
			
			db.pages.aggregate({
				
				$group : {
					_id : '$type',
					total : {$sum : 1}
				}
				
			},function(err,pages){
				res.render('pages/dashboard', { 
					pages : pages,
					totalUsers : usersCount
				});
			});
			
	});
	
});

module.exports = router;