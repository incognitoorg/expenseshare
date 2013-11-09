define(function(require){
	
	var $ = require('jquery');
	var Backbone = require('backbone');
	var BaseView = require('components/baseview/view/baseview');
	
	var FilterView=BaseView.extend({
		initialize : function(options){
			
		},
		show : function(){
			$(this.el).show();
		},
		hide :function(){
			$(this.el).hide();
		},
		applyFilter : function(){
			
			
		},
		reset : function(){
			
		},
		applyPaginator : function(){

		}
		
	});
	
	return FilterView;	
	
});