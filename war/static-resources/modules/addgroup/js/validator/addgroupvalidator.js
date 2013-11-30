define( function(require){
	"use strict";
	var $ = require('jquery');
	var FormValidator = require("plugins/jquery/formvalidation/formvalidation");

	return {
		rules : {
			groupname :{
				"required":true,
			},
			min2members : {
				required : true
				/*min2mebersrequired : true*/
			}
			
		},
		messages: {
            groupname: { required: 'Please enter group name.' },
            min2members : { required: 'Please select at least two members......' }
        },
		initialize : function(options){
			options.rules = this.rules;//TODO Need to find better way of this
			options.messages = this.messages;//TODO Need to find better way of this
			FormValidator.registertestValidator(options);
		}
	};
});