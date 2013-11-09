define( function(require){
	"use strict";
	var $ = require('jquery');
	var FormValidator = require("plugins/jquery/formvalidation/formvalidation");

	return {
		rules : {
			expenseInput :{
				"expenseInputValidator":true
			}
		},
		initialize : function(options){
			
			
			options.rules = this.rules;//TODO Need to find better way of this
			options.messages = this.messages;//TODO Need to find better way of this
			FormValidator.registertestValidator(options);
			$("[name^=expenseInput]").each(function () {
				$(this).rules("add", {
					expenseInputValidator: true
				});
			});
		}
	};
});