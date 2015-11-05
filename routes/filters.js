var express = require('express');
var router = express.Router();

var mongojs = require('mongojs');
var db = mongojs('CMS',['filters']);

var getAllTypes = function(docs){
	var types = [];
	docs.forEach(function(type){
		var name = type.name[0] === '_' ? type.name.replace('_','') : type.name ;
		types.push(name);
	});
	return types;
};	

router.get('/',function(req,res){
	
	db.filters.find().sort({name:1},function(err,docs){
		
		res.render('pages/filters',{
			types:getAllTypes(docs),
			filters:docs
		});
	});
	
});

router.post('/',function(req,res){
	db.filters.update({name:req.body.type},{ $addToSet: { list: {name:req.body.filter} } },function(err,docs){
		if(err)res.send(err);
		res.redirect('back');
	});
});

router.get('/new',function(req,res){
	db.filters.find().sort({name:1},function(err,docs){
		
		res.render('pages/filter-form',{
			types:getAllTypes(docs)
		});
		
	});
}); 

router.get('/delete/:type/:filter',function(req,res){
	db.filters.update({name:req.params.type},{ $pull: { list: {name:req.params.filter} } },function(err,docs){
		if(err)res.send(err);
		res.redirect('back');
	});
});



module.exports = router;