var express = require('express');
var bCrypt = require('bcrypt-nodejs');

var router = express.Router();

var mongojs = require('mongojs');
var db = mongojs('CMS',['users','pageTypes']);

var hash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
};

router.get('/',function(req, res){
	res.render('pages/index', {
		message:req.flash('message'),
		title: 'Admin Login' 
	});
});

router.post('/',function(req,res){
	var username = req.body.username,
		password = req.body.password;
	
 	db.users.findOne({
		username:username
	},function(err,doc){
		
		if(doc){
		
			if(isValidPassword(doc,password)){
				
				db.users.findAndModify({
					query:{_id:mongojs.ObjectId(doc._id)},
					update:{$set:{logged:'logged'}},
					new:true
				},function(){
					
					db.pageTypes.find(function(err,docs){
						req.session.pageTypes = docs;
						req.session.logged = true;
						req.session.user = doc;
						res.redirect('/app');
					});
					
					
				});
				
				
			}else{
				req.flash('message','User and Pass Dose not Match');
				res.redirect('back');
			}
			
		}else{
			req.flash('message','User not found');
			res.redirect('back');
		}
	}); 
	
});

router.get('/logout',function(req, res){
	db.users.findAndModify({
		query:{_id:mongojs.ObjectId(req.session.user._id)},
		update:{$set:{logged:''}},
		new:true
	},function(){
		req.session.destroy(function(){
			res.redirect('/');
		});
	});
	
});

module.exports = router;