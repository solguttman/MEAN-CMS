$(document).on('click','.nav-tabs a',function(){
	window.location.hash = $(this).attr('href');
}).on('click','.btn-edit',function(){
	var $this = $(this),
		value = $this.data('value'),
		name = $this.data('name');
	
	$.each(document.forms[name].elements, function(index, elem){
		if(elem.name){
			elem.value = value[elem.name];
		}
	});
	
	if(value.pageIcon){
		$('#choosePageIcon').html('<span class="'+ value.pageIcon +'"></span>');
	}
	
});

if(window.location.hash !== "") {
	$('a[href="' + window.location.hash + '"]').click();
}