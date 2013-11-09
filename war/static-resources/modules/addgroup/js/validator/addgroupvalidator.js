define( function(require){
	"use strict";
	var $ = require('jquery');
	var FormValidator = require("plugins/jquery/formvalidation/formvalidation");

	return {
		rules : {
			groupname :{
				"required":true,
			}
			
		},
		messages: {
            groupname: { required: 'Its better if you put group name here, will be good for you when you come back again' },
        },
		initialize : function(options){
			options.rules = this.rules;//TODO Need to find better way of this
			options.messages = this.messages;//TODO Need to find better way of this
			FormValidator.registertestValidator(options);
		}
	};
});