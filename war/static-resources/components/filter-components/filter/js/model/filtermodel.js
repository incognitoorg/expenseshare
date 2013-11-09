"use strict";

define(function(require){
	
	var $ = require('jquery');
	var Backbone = require('backbone');
	var facade = require('facade');
	
	var FilterModel = Backbone.Model.extend({
		
		initialize : function(options){
			this.bind('change:args', this.applyFilter);
		},
		defaults : {
			'ResultSets' : [{'ResultList':[{},{},{},{}]},{'ResultList':[{},{},{},{}]}]
			
		},
		applyFilter : function(){
			this.reinitializeFilter();
			
		},
		reinitializeFilter : function(){
			var reultCollection = this.resultCollection;
			
			var resultModels = reultCollection.models;
			
			var filterfn = this.filterfn;
			var args = this.get('args'); 
			var filterName=this.get('name');
			
			_.each(resultModels, function(resultModel){
				var resultElement = resultModel.get('singleResult');
				var isResultFitsCriteria = filterfn(resultElement, args);
				
				resultElement['renderer']=resultElement['renderer'] || {};
				
				resultElement['renderer']['filtersApplied']=resultElement['renderer']['filtersApplied'] || [];
				
				var filtersApplied = resultElement['renderer']['filtersApplied'];
				
				
				var thisFilterAppliedIndex = filtersApplied.indexOf(filterName);
				var isFilterAlreadyApplied = thisFilterAppliedIndex!==-1;
				
				if(isFilterAlreadyApplied && isResultFitsCriteria){
					filtersApplied.splice(thisFilterAppliedIndex, 1);
				} else if(!isFilterAlreadyApplied && !isResultFitsCriteria) {
					filtersApplied.push(filterName);
				}
			});
			this.set('formattedarguments', this.getFormattedArguments());
			
			facade.publish('filterStatePushed'+this.resultSetCount, this);
			
		},
		reset : function(){
			this.set('args',this.get('initialargs'));
			this.applyFilter();
			facade.publish('filter-reset',this);
		}
	});
	return FilterModel;
});