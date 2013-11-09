"use strict";

define(function(require){
	
	var FilterModel=require('components/filter-components/filter/js/model/filtermodel');
	
	var TextboxFilterModel = FilterModel.extend({
		initialize : function(options){
			
		},
		defaults : {
		},
		getFormattedArguments : function(){
			var selectedValue = this.get('args');
			if(selectedValue.length===0){
				return "No "+ this.get('name') + ' selected.';
			}
			var selectedFilterString = '';
			for ( var i = 0; i < selectedValue.length; i++) {
				selectedFilterString += selectedValue[i];
			} 
			return selectedFilterString;
		}
	});
	
	return TextboxFilterModel;
});