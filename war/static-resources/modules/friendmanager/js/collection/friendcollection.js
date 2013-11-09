define(function(require) {
	
	var Backbone=require('backbone');
	var FEMFriendModel = require('./../model/friendmodel');
	
	var FEMFriendCollection = Backbone.Collection.extend({
		model : FEMFriendModel
	});
	return FEMFriendCollection;
});