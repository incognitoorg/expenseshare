define(function(require) {

	var BootloaderView = require('./js/views/bootloaderview');
	var debugMode = require('debugmode');
	var analytics = require('analytics');
	var errorlogger = require('errorlogger');

	return {
		start : function() {
			this.view = new BootloaderView({el:$('body')});
		}
	};
});