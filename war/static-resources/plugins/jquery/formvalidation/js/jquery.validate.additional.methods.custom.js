require(['jquery', 'plugins/jquery/formvalidation/js/jquery.validate'], function(jQuery){
	jQuery.validator.addMethod("require_from_group", function(value, element, options) {
		var selector = options[1];
		var validOrNot = $(selector, element.form).filter(function() {
			return $(this).val().trim();
		}).length >= options[0];
		
		if(!$(element).data('being_validated')) {
			var fields = $(selector, element.form);
			fields.data('being_validated', true);
			fields.valid();
			fields.data('being_validated', false);
		}
		return validOrNot;
	}, jQuery.format("Please enter amount to be paid."));
});