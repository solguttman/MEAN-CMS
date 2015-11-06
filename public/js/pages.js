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

$(document).on('click','.btn-add-filter', function(){
	var input = $(this).parent().prev(),
		adding = false,
		data = {
			type:input.data('type'),
			filter:input.val()
		};
	
	if(!adding){
		adding = true;
		
		$.post('/app/filters', data, function(respons){
			if(respons.ok){
				input.closest('.panel-body').find('.filters-wrapper').append('<div><label><input type="checkbox" name="'+data.type+'[]" value="'+data.filter+'"/>'+ data.filter +'</label></div>');
				input.val('');
			}
			adding = false;
		});
		
	}
	
});