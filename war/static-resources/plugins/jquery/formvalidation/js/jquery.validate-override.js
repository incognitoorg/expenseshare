define(function(require){
	var jqueryValidate = require('./jquery.validate');

	$.extend($.validator.prototype, {
		form: function() {
			if(!debugMode){
				this.checkForm();
				$.extend(this.submitted, this.errorMap);
				this.invalid = $.extend({}, this.errorMap);
				if (!this.valid())
					$(this.currentForm).triggerHandler("invalid-form", [this]);
				this.showErrors();
				$(this.currentForm).find('.alert-error').css('width',this.settings.errorWidth);
				return this.valid();
			}else{
				return true;
			}
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
				if (this.findByName( elements[i].name ).length != undefined && this.findByName( elements[i].name ).length > 1) {
					for (var cnt = 0; cnt < this.findByName( elements[i].name ).length; cnt++) {
						this.check( this.findByName( elements[i].name )[cnt] );
					}
				} else {
					this.check( elements[i] );
				}
			}
			return this.valid();
		}
	});
});