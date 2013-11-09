define(function(require) {
	var NewExpenseView = require('./js/views/newexpenseview');

	return {
		getInstance : function() {
			return {
				initialize : function(options) {
					this.view = new NewExpenseView(options);
				},
				reInitialize: function(){
					this.view.reInitialize();
				}
			};
		}
	};
});