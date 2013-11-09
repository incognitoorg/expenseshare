define(function(require) {
	
	var Backbone=require('backbone');
	var FEMGroupModel = require('./../model/groupmodel');
	var FEMGroupCollection = Backbone.Collection.extend({
		model : FEMGroupModel
	});
	return FEMGroupCollection;
});