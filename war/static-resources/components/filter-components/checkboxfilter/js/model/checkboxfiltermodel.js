"use strict";

define(function(require){
	
	var FilterModel=require('components/filter-components/filter/js/model/filtermodel');
	
	var CheckboxFilterModel = FilterModel.extend({
		initialize : function(){
			
		},
		defaults : {
			'checkboxesArray' : ''
		},
		getFormattedArguments : function(){
			var selectedValuesArray = this.get('args');
			if(selectedValuesArray.length===0){
				return "No "+ this.get('name') + ' selected.';
			}
			
			var selectedFilterString = '';
			for ( var i = 0; i < selectedValuesArray.length; i++) {
				selectedFilterString += selectedValuesArray[i] + ', ';
			} 
			selectedFilterString = selectedFilterString.substr(0, selectedFilterString.length-2);
			if(selectedFilterString.length > 18){
				selectedFilterString=selectedFilterString.substring(0,18)+'..';
			}
			
			return selectedFilterString;
		}
	});
	
	return CheckboxFilterModel;
});