var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var logged = require('../models/isLogged');

var db = mongojs('CMS',['users','pages','posts']);

router.use(logged);

router.get('/',function(req,res){
	res.redirect( 'back' );
});

router.post('/',function(req,res){
	res.redirect('/app/search/'+req.body.search );
});

router.get('/:term', function(req, res, next) {
	var term = req.params.term,
		results = [];
	
	
 	db.users.find({
		$or:[
			{'username': new RegExp( term , 'i' )}
		]
	},function(err,users){
		
		users.forEach(function(user){
			results.push(user);
		});
		
		db.pages.find({
			$or:[
				{'name': new RegExp( term , 'i' )},
				{'slug': new RegExp( term , 'i' )}
			]
		},function(err,pages){
			
			pages.forEach(function(page){
				results.push(page);
			});
			
				
			res.render('pages/search', {
				searchTerm:term,
				results:results
			});
			
		});
		
	}); 
	
});

module.exports = router;