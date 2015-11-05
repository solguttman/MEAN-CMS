var socket,
	modelOpener,
	addImage = function(image,opener){
		
		if(opener.hasAttribute('data-user')){
			
			document.getElementById('userProfileValue').value = image;
			document.getElementById('user-thumbnail').src = image;
			
		}else if(opener.hasAttribute('data-page')){
			
		}else{
			if(typeof CKEDITOR !== 'undefined'){		
				CKEDITOR.instances.editor.insertHtml('<img src="'+image+'">');
			}
		}
		
	},
	addIcon = function(icon){
		document.getElementById('pageIcon').value = icon;
		document.getElementById('choosePageIcon').innerHTML = '<span class="'+ icon +'"></span>';
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
		
		socket = io.connect('/');
	
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
				image = $this.find('img').attr('src'),
				icon = $this.data('icon');
			
			if(image){
				addImage(image,modelOpener);
				return false;
			}else if(link){
				
				$.get(link + '?layer=true',function(data){
					$modalContant.html(data);
				});

				return false;
			}else if(icon){
				addIcon(icon);
			}

		});
	
	if($('.nav-tabs').length){
		if(window.location.hash != "") {
			$('a[href="' + window.location.hash + '"]').click();
		}
	}
	
});





