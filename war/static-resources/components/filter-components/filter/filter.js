define(function(require){
	return {
		initialize : function(){
			return this.model;
		},
		applyFilter : function(){
			this.model.applyFilter();
		},
		resetFilter : function(){
			this.model.reset();
		},
		hide : function(){
			this.view.hide();
		},
		show : function(){
			this.view.show();
		},
		setResultCollection : function(resultCollection){
			this.resultCollection = resultCollection;
			this.model.resultCollection = resultCollection;
		},
		reset : function(){
			this.model.reset();
		}
	};
});