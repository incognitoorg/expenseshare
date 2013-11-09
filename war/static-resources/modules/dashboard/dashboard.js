define(function(require) {
	var DashboardView = require('./js/views/dashboardview');

	return {
		getInstance : function() {
			return {
				initialize : function(options) {
					this.view = new DashboardView(options);
				},
				reInitialize : function(){
					this.view.reInitialize();
				}
			};
		}
	};
});
