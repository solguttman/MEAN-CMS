var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var async = require("async");

var db = mongojs('CMS',['users','pages','posts']);

router.get('/',function(req,res){
	res.redirect( 'back' );
});

router.post('/',function(req,res){
	res.redirect('/app/search/'+req.body.search );
});

router.get('/:term', function(req, res, next) {
	var term = req.params.term,
		results = [],
		searchUsers = function(callback){
			db.users.find({
				
				$or:[
					{'username': new RegExp( term , 'i' )}
				]
				
			},function(err,users){
				if(err) return callback(err);
				users.forEach(function(user){
					results.push(user);
				});
				callback();
			});
		},
		searchPages = function(callback){
			db.pages.find({
				
				$or:[
					{'name': new RegExp( term , 'i' )},
					{'slug': new RegExp( term , 'i' )}
				]
				
			},function(err,pages){
				if(err) return callback(err);
				pages.forEach(function(page){
					results.push(page);
				});
				callback();
			});
		};
	
	async.parallel([ searchUsers, searchPages ], function(err) { 
        if (err) return next(err); 
        res.render('pages/search', {
			searchTerm:term,
			results:results
		});
    });
	
	
});

module.exports = router;