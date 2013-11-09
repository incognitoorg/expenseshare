define(function(require) {
	var ProfileView = require('./js/views/profileview');

	return {
		getInstance : function() {
			return {
				initialize : function(options) {
					this.view = new ProfileView(options);
				}
			};
		}
	};
});