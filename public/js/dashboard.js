var socket;
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