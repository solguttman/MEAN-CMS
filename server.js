var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bCrypt = require('bcrypt-nodejs');
var flash = require('express-flash');

var app = express();

var mongojs = require('mongojs');
var db = mongojs('CMS',['users','posts','pages']);

var dashboard = require('./routes/dashboard');
var users = require('./routes/users');
var pages = require('./routes/pages');
var posts = require('./routes/posts');
var search = require('./routes/search');

var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "34731430728456089243",
	store: new MongoStore({db: 'CMS'})
}));

app.use(flash());

app.use(function(req,res,next){
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
});

app.use('/app', dashboard);
app.use('/app/users', users);
app.use('/app/pages', pages);
app.use('/app/posts', posts);
app.use('/app/search', search);

app.get('/',function(req, res){
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	res.render('pages/index', {
		message:req.flash('message'),
		title: 'Admin Login' 
	});
});

app.post('/',function(req,res){
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
					req.session.logged = true;
					req.session.user = doc;
					res.redirect('/app');
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

app.get('/logout',function(req, res){
	
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

app.listen(8080);

console.log('server running on port 8080');