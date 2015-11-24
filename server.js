var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');

var app = express();

var mongojs = require('mongojs');
var db = mongojs('CMS',['users','pages']);


global.settings = JSON.parse(fs.readFileSync('settings.json'));
global.socket = require('socket.io').listen(app.listen(8080));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
	secret: "shhhhhhhh",
	store: new MongoStore({db: 'CMS'})
}));

app.use(flash());

app.use(function(req,res,next){
	if(req.session.logged || req.originalUrl === '/' || !settings.needLogin){
		next();
	}else{
		res.redirect('/');
	}
});

app.use(function(req,res,next){
	var activePath = req.query.type ? req.query.type :  req.path.split('/')[2];
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	global.pageTypes = req.session.pageTypes || [];
	global.profile = req.session.user;
	global.path = activePath || 'dashboard';
	next();
}); 

var routes = fs.readdirSync('routes');

var login = require('./routes/login');
var dashboard = require('./routes/dashboard');

app.use('/', login);
app.use('/app', dashboard);     

routes.forEach(function(r){
	var route = r.split('.')[0];
	if(route !== 'login' && route !== 'dashboard'){
		app.use('/app/'+route, require('./routes/'+route));
	}
});

console.log('server running on port 80');
