var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');

var db = mongojs('CMS',['pages','filters']);

var isActiveDate = function(page){
	var now = Date.now();
	
	if(page.start && page.end){
		return  (now > Date.parse(page.start) && now < Date.parse(page.end));
	}else if(page.start && !page.end){
		return  now > Date.parse(page.start);
	}else if(!page.start && page.end){
		return  now < Date.parse(page.end);
	}else{
		return  true;	
	}
};

router.use(function(req,res,next){
	global.type = req.query.type || req.body.type;
	
	if(!global.type){
		return res.redirect('/app');
	}
	
	next();
	
});

/* GET pages listing. */
router.get('/', function(req, res, next) {
	
	var offset = req.query.offset,
		sort = req.query.sort,
		limit = 5,
		total;//req.query.limit;
	
	db.pages.count({type:type},function(err, data){
		total = data;
		
		db.pages.find({type:type}).limit(limit).skip(offset,function (err, pages) {
			
			pages.forEach(function(page){
				page.active = isActiveDate(page);
			});
			
			res.render('pages/pages', {
				pages:pages,
				total:total,
				totalPages:Math.ceil(total/limit),
				limit:Number(limit) || 0,
				offset:Number(offset) || 0,
				sort:sort
			});
		});
	});
	
});

router.get('/new',function(req, res){

	db.filters.find(function(err,doc){
		res.render('pages/page-form', {
			title:'New '+ global.type,
			filters:doc,
			message:req.flash('message'),
			page: {}
		});
	});
	
});

router.post('/new',function(req, res){
	var page = req.body;
	
	db.pages.insert(page,function(err,doc){
		socket.emit('new',doc.type);
		res.redirect('/app/pages/edit/' + doc._id + '?type=' + global.type);
	});
	
});

router.get('/edit/:id', function(req, res){
	var id = req.params.id;
	
	if(mongojs.ObjectId.isValid(id)){
		db.pages.findOne({_id:mongojs.ObjectId(id)},function(err,page){
			if(err) return err;
			if(page){
				
				db.filters.find(function(err,doc){
					res.render('pages/page-form', {
						page:page,
						filters:doc,
						title: 'Edit ' + page.name,
						message : req.flash('message')
					});
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
		db.pages.findOne({_id:mongojs.ObjectId(id)},function(err,doc){	
			
			db.pages.remove({_id:mongojs.ObjectId(id)},function(err,status){
				socket.emit('delete',doc.type);
				res.redirect('back');
			});
			
		});
	}else{
		res.redirect('back');
	}
});

router.get('/preview/*',function(req,res){
	
	var url = req.path.split('/').pop();
	
	if(url !== ''){
	
		db.pages.findOne({slug:url},function(err,doc){
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