define(function(require) {

	var jquery = require('jquery');
	var jqueryValidateOverride = require('./js/jquery.validate');
	var jqueryValidateOverride = require('./js/jquery.validate-override');
	var jqueryValidateOverride = require('./js/jquery.validate.additional.methods.custom');

	require('css!./css/formvalidation.css');
	
	var formvalidation = {
			parseDate : function(str) {
				var arr = str.split('/');
				return new Date(arr[2], arr[1]-1, arr[0]);
			},
			daydiff : function(first, second) {
				return (second-first)/(1000*60*60*24);
			},
			registertestValidator : function(options){
				var that = this;
				jQuery.validator.addMethod("customDate-dd/mm/yy",function(value, element) {
					return value.match(/^\d\d?\/\d\d?\/\d\d$/);
				},"Please enter a date in the format dd/mm/yy");

				jQuery.validator.addMethod("customDate-dd/mm/yyyy",function(value, element) {
					return value.match(/^\d\d?\/\d\d?\/\d\d\d\d$/);
				},"Please enter a date in the format dd/mm/yyyy");

				jQuery.validator.addMethod("alpha", function(value, element) {
					return this.optional(element) || value == value.match(/^[a-zA-Z]+$/);
				},"Only Characters Allowed.");

				jQuery.validator.addMethod("alphanumericspecial", function(value, element) {
					return this.optional(element) || value == value.match(/^[-a-zA-Z0-9_ ]+$/) && value.length<15 ;
				}, "Only  letters, Numbers & Space/underscore Allowed.");

				jQuery.validator.addMethod("customNumber", function(value, element) {
					return this.optional(element) || value == value.match(/^[0-9+()-]+$/) && value.length<15;
				}, "Only Numbers & +,-,(,) Allowed.");
				
				jQuery.validator.addMethod("expenseInputValidator", function(value, element) {
					return this.optional(element) || value.trim() == value.trim().match(/^\d+\.?\d*$/) && value.trim().length<15;
				}, "Enter valid amount...");


				jQuery.validator.addMethod("customDate-pastDate",function(value, element) {
					var today = new Date();
					today.setHours(0);
					today.setMinutes(0);
					today.setSeconds(-1);
					today.setMilliseconds(0);

					return (that.daydiff(that.parseDate(value), today) < 0);
				},"Date is passed");

				
				var customizations = {

						/*errorClass: "help-inline",*/
						/*errorElement: "div",*/
						/*ignore: '',*/

						/*unhighlight: function(element) {
							$(element)
							.closest('.control-group').addClass('success')
							.closest('.control-group').removeClass('error');
							$(element).focus(function(){
								$(element).parent().find('div.alert-error').remove();
							});
						},

						highlight: function(element) {	
							$(element)
							.closest('.control-group').removeClass('success')
							.closest('.control-group').addClass('error');
						},

						success: function(label) {
							label
							.closest('.control-group').removeClass('error')
							.closest('.control-group').addClass('success');
						},

						errorWidth: width,*/

						/*rules : rules,
						errorPlacement: function(error, element) {
						     error.insertAfter(element);
						}*/
					};
				
				$.extend(customizations, options);
				
				var testvalidator= $(options.element).validate(customizations);
				return testvalidator;
			}
	};
	$(document).on('submit', 'form',function() {
		  return false;
	});
	return formvalidation;
});
