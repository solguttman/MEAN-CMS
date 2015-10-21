var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var bCrypt = require('bcrypt-nodejs');
var logged = require('../models/isLogged');
var multer  = require('multer');
var upload = multer({ dest: 'public/uploads/' });

var db = mongojs('CMS',['users']);

// Generates hash using bCrypt
var hash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

router.use(logged);
/* GET users listing. */
router.get('/', function(req, res, next) {
	db.users.find(function (err, docs) {
		res.render('pages/users', {
			logged : req.session.logged,
			users:docs
		});
	});
});

router.get('/new', function(req, res){
	res.render('pages/user-form', { 
		title:'New User',
		message:req.flash('message'),
		user: {}
	});
});

router.get('/edit/:id', function(req, res){
	var id = req.params.id;
	if(mongojs.ObjectId.isValid(id)){
		db.users.findOne({_id:mongojs.ObjectId(id)},function(err,doc){
			if(err) return err;
			if(doc){
				res.render('pages/user-form', {
					user:doc,
					title: 'Edit ' + doc.username,
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

router.get('/delete/:id',function(req, res){
	var id = req.params.id;
	if(mongojs.ObjectId.isValid(id)){
		db.users.remove({_id:mongojs.ObjectId(id)},function(err,doc){
			res.redirect('back');
		});
	}else{
		res.redirect('back');
	}
});

router.post('/new', upload.single('profile'),function(req, res){
	var user = req.body;
		user.profile = req.file !== undefined ? req.file.filename : '';
		user.password = hash(user.password);
	
	db.users.insert(user,function(){
		res.redirect('/app');
	});
});

router.post('/update', upload.single('profile'),function(req,res){
	var id = req.body.id,
		user = req.body;
		user.profile = req.file !== undefined ? req.file.filename : req.body.profileName;
	
	if(user.password !== ''){
		user.password = hash(user.password);
	}else{
		delete user.password;
	}
	
	db.users.findAndModify({
		query:{_id:mongojs.ObjectId(id)},
		update:{$set:user},
		new:true
	},function(err,doc){
		req.flash('message', 'Success');
		res.redirect('back');
	});	
});


module.exports = router;
