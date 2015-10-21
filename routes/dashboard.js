var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var logged = require('../models/isLogged');

var db = mongojs('CMS',['users','pages','posts']);

router.get('/',logged, function(req, res, next) {
	
	db.users.count(function(err, usersCount){
		db.pages.count(function(err, pagesCount){
			db.posts.count(function(err, postsCount){
				res.render('pages/app', { 
					totalUsers : usersCount,
					totalPages : pagesCount,
					totalPosts : postsCount
				});
			});
		});
	});
	
});

module.exports = router;