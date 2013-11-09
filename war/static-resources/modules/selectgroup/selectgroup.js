define(function(require) {
	var SelectGroupView = require('./js/views/selectgroupview');

	return {
		getInstance : function() {
			return {
				initialize : function(options) {
					this.view = new SelectGroupView(options);
				},
				reInitialize : function(){
					this.view.reInitialize();
				}
			};
		}
	};
});