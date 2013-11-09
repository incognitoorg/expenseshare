define(function(require){
	return {
		initialize : function(){
			return this.model;
		},
		sortResults : function(){
			this.model.applySorter();
		}
	};
	
});