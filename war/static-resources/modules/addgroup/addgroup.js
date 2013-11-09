define(function(require) {
	
	var FEMAddGroupView = require('./js/views/addgroupview');
	
	return {
		getInstance : function(){
			return {
				initialize : function(options){
					this.view = new FEMAddGroupView(options);
				},
				reInitialize : function(){
					this.view.start();
				} 
			};
		}
	};
	
});