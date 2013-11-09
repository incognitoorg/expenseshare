define(function(require) {
	"use strict";
	require('jquery');
	var Backbone = require('backbone');
	var Handlebars = require('handlebars');
	var Login = require('components/login/login');
	var FEM = require('modules/fem/fem');
	
	var BootloaderView = Backbone.View.extend({
		initialize : function(options){
			this.render(options);
			FEM.getInstance().initialize({el:this.$('.js-fem-container')});
			Login.initialize({el:this.$('.js-login-container')});
		},
		render : function(data){
		}
	});
	
	return BootloaderView;
});


