var modelOpener,
	addImage = function(image,opener){
		
		if(opener.hasAttribute('data-user')){
			
			var profile = document.getElementById('user-thumbnail');
			
			document.getElementById('userProfileValue').value = image;
			
			if(profile){
				profile.src = image;
			}else{
				opener.innerHTML = '<img src="'+image+'" id="user-thumbnail" class="img-responsive img-thumbnail">';
			}
			
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
	
});





