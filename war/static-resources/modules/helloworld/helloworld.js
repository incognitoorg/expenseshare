define(function(require) {

	var HelloWorldView = require('./js/views/helloworldview');
	
	return {
		getInstance : function() {

			return {
				initialize : function(options) {
					this.view = new HelloWorldView(options);
				}
			};
		}
	};
	
});