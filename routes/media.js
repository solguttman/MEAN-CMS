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

var fileExists = function(filePath){
    try{
        return fs.statSync(filePath).isFile();
    }catch (err){
        return false;
    }
};

var getImageName = function(img){
	var name = img.split('-');
	name.shift();
	name = name.join('');
	name = name.split('.');
	name.pop();
	name = name.join('');
	return name;
};

var upload = multer({ storage: storage });

router.use(logged);

router.use(function(req,res,next){
	global.layer = req.query.layer;
	next();
});

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
		isFile = fileExists(path), 
		imageData = {
			image:img
		};
	
	imageData.name = getImageName(img);	
	
	if(!isFile){
		return res.redirect('back');
	}
	
	lwip.open(path,function(err,image){
		if(err){
			console.log(err);
			return res.redirect('back');
		} 
		 
		imageData.width = image.width();
		imageData.height = image.height();
		
		res.render('pages/media-form',{
			imageData:imageData,
		});
	}); 
	
});

router.post('/',upload.single('newImage'),function(req, res){
	
	if(!req.body.fullImageName && !req.file){
		return res.redirect('back');
	}
	
	var img = req.body.fullImageName || req.file.filename,
		path = './public/uploads/' + img,
		ext = img.split('.').pop(),
		newImageName = Date.now() +'-'+ req.body.name +'.'+ ext,
		newPath = './public/uploads/' + newImageName,
		width,
		height;
	
	lwip.open(path,function(err, image){
		if(err){
			console.log(err);
			return res.redirect('back');
		} 
		
		
		width = req.body.width ? req.body.width : image.width();
		height = req.body.height ? req.body.height : image.height();

		image.batch()
			.resize(Number(width),Number(height))
			.rotate(Number( req.body.rotate ), 'white')
			.writeFile(path, function(err, image){
			
				if(err)console.log(err);
				
				if(req.file){
					var socket = req.app.get('socket');
					socket.emit('new','images');
				}
				if(req.body.isLayer){
					if(req.body.name  && req.body.name !== getImageName(img)){
						fs.renameSync(path,newPath);
					}
					res.redirect(req.headers.referer);
				}else{
					if(req.body.name  && req.body.name !== getImageName(img)){
						fs.renameSync(path,newPath);
						res.redirect('/app/media/'+newImageName);
					}else{
						res.redirect('/app/media/'+img);
					}
				}
				
                 
			});

	});
	
}); 

router.get('/delete/:img',function(req, res){
	
	var img = req.params.img;
		path = './public/uploads/' + img;
	
	fs.unlink(path,function(){
		var socket = req.app.get('socket');
		socket.emit('delete','images');
		res.redirect('/app/media');
	});
	
});

module.exports = router;