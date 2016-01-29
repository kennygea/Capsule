$('.inverted.help.icon').click(function() {
	$('.ui.first.modal').modal('show');
})

$('.coupled.modal')
	.modal({
		allowMultiple: false,
		duration: 300
	})
	.modal('setting', 'transition', 'fade left')

// open second modal on first modal buttons
$('.second.modal')
  .modal('attach events', '.first.modal .button')
;

$('.third.modal').modal('attach events', '.second.modal .button');
