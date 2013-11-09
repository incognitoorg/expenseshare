define(function(require) {

	var Backbone = require('backbone');
	
	var GroupModel = Backbone.Model.extend({
		
		defaults : {
			'name' : 'Default Group',
			'members' : {}
		}
	});
	
	return GroupModel;
});