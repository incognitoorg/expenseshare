define(function(require){
	
	var $ = require('jquery');
	var FilterModel=require('components/filter-components/filter/js/model/filtermodel');
	
	var SliderFilterModel = FilterModel.extend({
		initialize : function(options){
			
		},
		defaults : {
			'min' : '',
			'max' : ''
		},
		getFormattedArguments : function(){
			var that = this;
			var selectedMinValue = this.get('args').min;
			var selectedMaxValue = this.get('args').max;
			return that.selectedfilterselector, that.formatValue(selectedMinValue) + " - " + that.formatValue(selectedMaxValue);
		}
		
	});
	
	return SliderFilterModel;
});