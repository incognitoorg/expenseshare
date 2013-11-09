define(function(require) {

	var LoginView = require('./js/views/loginview');


	return {
		initialize : function(options) {
			this.view = new LoginView(options);
		},
		getInfo : function(){
			return this.view.getUserInfo();
		},
		doFacebookLogin : function(options){
			this.view.eventDoFacebookLogin(options);
		}, 
		doGoogleLogin : function(options){
			this.view.eventDoGoogleLogin(options);
		}
	};

});

