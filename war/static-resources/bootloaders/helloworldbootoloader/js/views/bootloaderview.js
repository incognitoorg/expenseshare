define(function(require) {
	"use strict";
	var Backbone = require('backbone');
	var Handlebars = require('handlebars');
	
	
	var HelloWorld = require('modules/helloworld/helloworld');
	
	var BootloaderView = Backbone.View.extend({
		initialize : function(options){
			this.render(options);
			HelloWorld.getInstance().initialize({el:this.$('.js-hello-world-container')});			
		},
		template : Handlebars.compile(require('text!./../../templates/bootloadertemplate.html')),
		render : function(data){
			$(this.el).html(this.template(data));
		}
	});
	
	return BootloaderView;
});