var socket,
	modelOpener,
	addImage = function(image,opener){
		
		if(opener.hasAttribute('data-user')){
			
			document.getElementById('userProfileValue').value = image;
			document.getElementById('user-thumbnail').src = image;
			
		}else if(oopener.hasAttribute('data-page')){
			
		}else{
			if(typeof CKEDITOR !== 'undefined'){		
				CKEDITOR.instances.editor.insertHtml('<img src="'+image+'">');
			}
		}
		
	};

$(document).ready(function(){
	
	if($('.percentage').length){
		$('.percentage').easyPieChart({
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
	
	try{
		
		socket = io.connect('http://104.236.10.215/');
	
		socket.on('new',function(data){
			var $id = $('#' + data),
				total = $id.data('percent') + 1;
			$id.data('percent',total);
			$id.data('easyPieChart').update(total);
		});
		
		socket.on('delete',function(data){
			var $id = $('#' + data),
				total = $id.data('percent') - 1;
			$id.data('percent',total);
			$id.data('easyPieChart').update(total);
		});
		
	}catch(e){}
	
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
	
	$(this)
		.on('click','[data-toggle="modal"]',function(){
			modelOpener = this;
		})
		.on('click','.modal a', function(){
			var $this = $(this),
				$modalContant = $('.modal-content'),
				link = $this.attr('href'),
				image = $this.find('img').attr('src');
			
			if(image){
				addImage(image,modelOpener);
				return false;
			}else{
				$.get(link + '?layer=true',function(data){
					$modalContant.html(data);
				});

				return false;
			}

		});
	
});





