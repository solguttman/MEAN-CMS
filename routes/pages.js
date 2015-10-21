var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var logged = require('../models/isLogged');

var db = mongojs('CMS',['pages']);

var isActiveDate = function(page){
	var now = Date.now();
	
	if(page.pageStart && page.pageEnd){
		return  (now > Date.parse(page.pageStart) && now < Date.parse(page.pageEnd));
	}else if(page.pageStart && !page.pageEnd){
		return  now > Date.parse(page.pageStart);
	}else if(!page.pageStart && page.pageEnd){
		return  now < Date.parse(page.pageEnd);
	}else{
		return  true;	
	}
};

router.use(logged);

/* GET pages listing. */
router.get('/', function(req, res, next) {
	db.pages.find(function (err, pages) {
		
		pages.forEach(function(page){
			page.active = isActiveDate(page);
		});
		
		res.render('pages/pages', {
			pages:pages
		});
	});
});

router.get('/new',function(req, res){
	res.render('pages/page-form', {
		title:'New Page',
		message:req.flash('message'),
		page: {}
	});
});

router.post('/new',function(req, res){
	var page = req.body;
	
	db.pages.insert(page,function(){
		res.redirect('/app/pages');
	});
});

router.get('/edit/:id', function(req, res){
	var id = req.params.id;
	if(mongojs.ObjectId.isValid(id)){
		db.pages.findOne({_id:mongojs.ObjectId(id)},function(err,doc){
			if(err) return err;
			if(doc){
				
				res.render('pages/page-form', {
					page:doc,
					title: 'Edit ' + doc.pageName,
					message : req.flash('message')
				});
			}else{
				res.redirect('back');
			}
		});
	}else{
		res.redirect('back');
	}
	
});

router.post('/update',function(req,res){
	var id = req.body.id,
		page = req.body;
	
	db.pages.findAndModify({
		query:{_id:mongojs.ObjectId(id)},
		update:{$set:page},
		new:true
	},function(err,doc){
		req.flash('message', 'Success');
		res.redirect('back');
	});	
});

router.get('/delete/:id',function(req, res){
	var id = req.params.id;
	if(mongojs.ObjectId.isValid(id)){
		db.pages.remove({_id:mongojs.ObjectId(id)},function(err,doc){
			res.redirect('back');
		});
	}else{
		res.redirect('back');
	}
});

router.get('/preview/*',function(req,res){
	
	var url = req.url.split('/')[2];
	
	if(url !== ''){
	
		db.pages.findOne({pageSlug:url},function(err,doc){
			if(doc && isActiveDate(doc)){
				res.render('pages/page-preview',{
					page:doc
				});
			}else{
				res.send('Page not found');
			}
		});
		
	}else{
		res.send('Prieview not available');
	}
});

module.exports = router;