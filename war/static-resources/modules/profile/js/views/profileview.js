define(function(require) {
	var Backbone = require('backbone');

	var ProfileView = Backbone.View.extend({
		initialize : function(options) {
			this.options = _.extend({
			//defaults here
			}, options);
			this.render();
		},
		template : Handlebars.compile(require('text!./../../templates/profiletemplate.html')),
		render : function(data) {
			$(this.el).html(this.template(data));
		},
		logout : function(){
			localStorage.removeItem('loggedInUser');
			location.reload();
		},
		events : {
			'click .js-logout' : 'logout'
		}
	});
	return ProfileView;

});