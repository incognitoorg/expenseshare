define(function(require) {
	var Sandbox = require('sandbox');

	var ExpenseModel = Sandbox.Model.extend({
		initialize : function(options) {
			
		},
		defaults : {
			name : '',
		    date : '',
		    listPayersInfo : [ {userId:'', amount :''}],
		    listIncludeMemberInfo : [ {userId:'', amount :''}]
		}
	});

	return ExpenseModel;

});