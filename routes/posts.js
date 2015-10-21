var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var logged = require('../models/isLogged');

var db = mongojs('CMS',['posts']);

var isActiveDate = function(post){
	var now = Date.now();
	
	if(post.postStart && post.postEnd){
		return  (now > Date.parse(post.postStart) && now < Date.parse(post.postEnd));
	}else if(post.postStart && !post.postEnd){
		return  now > Date.parse(post.postStart);
	}else if(!post.postStart && post.postEnd){
		return  now < Date.parse(post.postEnd);
	}else{
		return  true;	
	}
};

router.use(logged);

/* GET posts listing. */
router.get('/', function(req, res, next) {
	db.posts.find(function (err, posts) {
		
		posts.forEach(function(post){
			post.active = isActiveDate(post);
		});
		
		res.render('pages/posts', {
			posts:posts
		});
	});
});

router.get('/new',function(req, res){
	res.render('pages/post-form', {
		title:'New Post',
		post: {}
	});
});

router.post('/new',function(req, res){
	var posts = req.body;
	console.log(posts);
	db.posts.insert(posts,function(){
		res.redirect('/app/posts');
	});
});

router.get('/edit/:id', function(req, res){
	var id = req.params.id;
	if(mongojs.ObjectId.isValid(id)){
		db.posts.findOne({_id:mongojs.ObjectId(id)},function(err,doc){
			if(err) return err;
			if(doc){
				
				res.render('pages/post-form', {
					post:doc,
					title: 'Edit ' + doc.postName,
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
		post = req.body;
	
	db.posts.findAndModify({
		query:{_id:mongojs.ObjectId(id)},
		update:{$set:post},
		new:true
	},function(err,doc){
		req.flash('message', 'Success');
		res.redirect('back');
	});	
});

router.get('/delete/:id',function(req, res){
	var id = req.params.id;
	if(mongojs.ObjectId.isValid(id)){
		db.posts.remove({_id:mongojs.ObjectId(id)},function(err,doc){
			res.redirect('back');
		});
	}else{
		res.redirect('back');
	}
});

router.get('/preview/*',function(req,res){
	
	var url = req.url.split('/'),
		name = url.pop();
	
	if(name !== ''){
	
		db.posts.findOne({postSlug:name},function(err,doc){
			if(doc && isActiveDate(doc)){
				res.render('pages/post-preview',{
					post:doc
				});
			}else{
				res.send('Post not found');
			}
		});
		
	}else{
		res.send('Prieview not available');
	}
});

module.exports = router;