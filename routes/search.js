var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var logged = require('../models/isLogged');

var db = mongojs('CMS',['users','pages','posts']);

router.use(logged);

router.post('/',function(req,res){
	res.redirect('/app/search/'+req.body.search );
});

router.get('/:term', function(req, res, next) {
	var term = req.params.term,
		results = [],
		test = [];
	
	
 	db.users.find({
		$or:[
			{'username': new RegExp( term , 'g' )}
		]
	},function(err,users){
		
		users.forEach(function(user){
			results.push(user);
		});
		
		db.pages.find({
			$or:[
				{'pageName': new RegExp( term , 'g' )},
				{'pageSlug': new RegExp( term , 'g' )}
			]
		},function(err,pages){
			
			pages.forEach(function(page){
				results.push(page);
			});
			
			db.posts.find({
				$or:[
					{'auther': new RegExp( term , 'g' )}
				]
			},function(err,posts){
				
				posts.forEach(function(post){
					results.push(post);
				});
				
				res.render('pages/search', {
					searchTerm:term,
					results:results
				});
				
			});
			
		});
		
	}); 
	
});

module.exports = router;