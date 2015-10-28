var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');


router.get('/',function(req,res){
	
	res.send('done');
});


module.exports = router;