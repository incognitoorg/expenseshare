define(function(require){

	var $ = require('jquery');
	var Backbone = require('backbone');
	var facade = require('facade');
	var SorterUtil = require('libraries/utilities/sorterutil');
	
	var SorterModel = Backbone.Model.extend({
		initialize : function(){
		},
		defaults : {
			'args' : {}
		},
		applySorter : function(){
			var resultModelsArray = this.get('resultCollection').models;
			this.get('resultCollection').reset(SorterUtil.insertionsort(resultModelsArray, this.get('args').path,this.get('args').reversesort));
			var resultSetCount=this.get('resultSetCount');
			facade.publish('resultsSorted'+resultSetCount,this);
		}
	});
	return SorterModel;
});