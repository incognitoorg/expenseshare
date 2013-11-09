define(function(require) {
	"use strict";
	var Backbone = require('backbone');
	var Handlebars = require('handlebars');
	
	var BootloaderView = Backbone.View.extend({
		initialize : function(){
			this.render();
		},
		template : Handlebars.compile(require('text!./../../templates/bootloadertemplate.html')),
		render : function(data){
			$(this.el).html(this.template(data));
		}
	});
	
	
	return BootloaderView;
});