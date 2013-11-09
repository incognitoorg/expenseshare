define(function(require) {
	"use strict";
	
	var Backbone = require('backbone');
	
	var FEMUserModel = Backbone.Model.extend({
		defaults : {
			/*'userId' : '',*/
			'userName' 	: 		'',
			'firstName'	:		'',
			'lastName' : ''
		}
	});
	return FEMUserModel;
});