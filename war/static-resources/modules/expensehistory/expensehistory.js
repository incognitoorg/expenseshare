define(function(require) {
	var ExpenseHistoryView = require('./js/views/expensehistoryview');

	return {
		getInstance : function() {
			return {
				initialize : function(options) {
					this.view = new ExpenseHistoryView(options);
				},
				reInitialize : function(options){
					this.view.reInitialize(options);
				}
			};
		}
	};
});