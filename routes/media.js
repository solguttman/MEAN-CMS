var express = require('express');
var fs = require('fs');
var multer = require('multer');
var lwip = require("lwip");
var router = express.Router();
var logged = require('../models/isLogged');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() +'-'+ file.originalname);
	}
});

var upload = multer({ storage: storage });

router.use(logged);

router.get('/', function(req, res, next) {
	
	var images = [],
		path = 'public/uploads';
	
	fs.readdir(path,function(err,files){
		
		for(var file in files){
			var currentFile = path + '/' + files[file];
			var stats = fs.statSync(currentFile);
			if(stats.isFile()){
				images.push(files[file]);
			}
		}
		
		res.render('pages/media',{
			images:images
		});
		
	});
	
});

router.get('/new',upload.single('newImage'),function(req,res){
	res.render('pages/media-form',{
		imageData:{
			new:true
		}
	});
});

router.get('/:img',function(req, res){
	
	var img = req.params.img,
		path = './public/uploads/' + img,
		name = img.split('-'), 
		imageData = {
			image:img
		};

	name.shift();
	name = name.join('');
	name = name.split('.');
	name.pop();
	name.join('');
	
	imageData.name = name;	
	
	lwip.open(path,function(err,image){
		if(err) console.log(err);
		
		imageData.width = image.width();
		imageData.height = image.height();
		
		res.render('pages/media-form',{
			imageData:imageData,
		});
	}); 
	
});

router.post('/',upload.single('newImage'),function(req, res){
	
	if(req.file){
		res.redirect('/app/media/'+req.file.filename);
	}else{    
	
	 	var img = req.body.fullImageName,
			ext = img.split('.').pop(),
			path = './public/uploads/' + img,
			newPath = './public/uploads/' + Date.now() +'-'+ req.body.name +'.'+ ext,
			imageData = {
				image:img
			};


		lwip.open(path,function(err, image){

			image.batch()
				.resize(Number(req.body.width), Number(req.body.height))
				.rotate(Number(req.body.rotate), 'white')
				.writeFile(path,function(err,image){
					if(err)console.log(err);
					if(req.body.origName !== req.body.name){
						fs.renameSync(path,newPath);
					}

					res.redirect('/app/media');
				});

		}); 
	}
}); 

router.get('/delete/:img',function(req, res){
	
	var img = req.params.img;
		path = './public/uploads/' + img;
	
	fs.unlink(path,function(){
		res.redirect('/app/media');
	});
	
});

module.exports = router;