module.exports = function(req,res,next){
	if(req.session.logged){
		return next();
	}else{
		res.redirect('/');
	}
};