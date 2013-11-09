define(function(require){
	var FEMView = require('./js/views/femview');
	return {
		getInstance : function(){
			return {
				initialize : function(options){
					this.view = new FEMView(options);
				}
			};
		}
	};
});