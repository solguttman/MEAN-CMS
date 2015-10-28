var addImage = function(image){
	if(typeof CKEDITOR !== 'undefined'){		
		CKEDITOR.instances.editor.insertHtml('<img src="'+image+'">');
	}
};

window.onload = function(){
	var pageName = document.getElementById('pageName'),
		pageSlug = document.getElementById('pageSlug');
	
	if(pageName){
		pageName.onblur = function(){
		
			pageSlug.value = pageName.value.toLowerCase().replace(/ /g,'-');

		};
	}
	
	if(typeof CKEDITOR !== 'undefined'){
		
		CKEDITOR.replace( 'editor', {
			height: 400
		});
	}
	
};

$(document).ready(function(){
	
	if($('.percentage').length){
		$('.percentage').easyPieChart({
			//barColor: "#ef1e25",
			//trackColor: "#eee",
			//lineCap: 'square',
			scaleColor: "#222",
			lineWidth: 8,
			size: 200,
			animate: 1000,
			onStep: function(value) {
				$(this.el).find('span').text(Math.round(value));
			},
			onStop: function(value, to) {
				$(this.el).find('span').text(Math.round(to));
			}
		});
	}
	
});

$(document).on('click','.modal a', function(){
	var $this = $(this),
		$modalContant = $('.modal-content'),
		link = $this.attr('href'),
		image = $this.find('img').attr('src');
	
	if(image){
		addImage(image);
		return false;
	}
	
});





