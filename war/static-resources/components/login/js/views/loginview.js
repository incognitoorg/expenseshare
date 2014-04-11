define(function(require){
	var Normalize = require('css!libraries/foundation/5.0.2/css/normalize.css');
	
	var Sandbox = require('sandbox');
	
	var GoogleAPI = require('googleapioauth');
	var FBAPI = require('fbapioauth');
	
	var APIMapper = {
			facebook : FBAPI,
			google : GoogleAPI
	};
	
	var formContainers = {
			"show-signin": "app-signin",
			"show-signup": "app-signup",
			"show-forgot-password": "app-forgot-password"
	};

	function validateEmail(email) {
		var regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return regEx.test(email);
	}

	var LoginView = Backbone.View.extend({
		initialize : function(options){
			$('#mask').html('Checking if logged in....');
			var userInfo = this.getFromSession();
			if(userInfo && JSON.parse(userInfo)){
				$('#mask').html('Logging in....');
				this.userInfo = JSON.parse(userInfo);
				this.startApp(userInfo);
				this.hide();
				return;
			}
			this.options = _.extend({
				//defaults here
			}, options);
			this.render();
			this.show();
			hideMask();
			initializationComplete = true;
		},
		template: Handlebars.compile(require("text!./../../templates/loginform.html")),
		render : function(){
			//$(this.el).html(this.template());
		},
		events : {
			'click .facebook' : 'eventDoFacebookLogin',
			'click .google' : 'eventDoGoogleLogin',
			'click .email-signin' : 'eventDoEmailLogin',
			'click .email-signup' : 'eventDoEmailSignup',
			'click .retrieve-password' : 'eventDoForgotPassword',
			'click .show-signup' : 'eventShowForm',
			'click .show-forgot-password' : 'eventShowForm',
			'click .show-signin' : 'eventShowForm'
			
		},
		eventDoFacebookLogin : function(options){
			var self = this;
			FBAPI.checkAndDoLogin({callback : function(data){
				self.addToUser({facebook:data.data});
				if(options && options.userInfo){
					data.userId = options.userInfo.userId;
				}
				if(options && options.callback){
					options.callback.call(options.context, {loginType : 'facebook', data : data});
				} else {
					this.doActualLogin.call(this, data);
				}
			}, context : this});
		},
		eventDoGoogleLogin : function(options){
		    var self = this;
			GoogleAPI.checkAndDoLogin({callback : function(data){
			    self.addToUser({google:data.data});
				if(options && options.userInfo){
					data.userId = options.userInfo.userId;
				}

				if(options && options.callback){
					options.callback.call(options.context,  {loginType : 'google', data : data});
				} else {
					this.doActualLogin.call(this, data);
				}
			}, context : this});
		},
		getUserAccessInfo : function (userControl, passControl) {
			/*using the form controls provided to get the values*/
			var useremail = this.$("#" + userControl).val(),
				/*creating the object to send to the back-end*/
				userControl = {};
			if(passControl) {
				var userpass = this.$("#" + passControl).val();
			}

			if (useremail !== "" && validateEmail(useremail)) {
				userControl["email"] = useremail;
				if (userpass) {
					/*adding password identifier only if password form control has been sent*/
					userControl["password"] = userpass;
				}
			}
			return userControl;
		},
		eventDoEmailLogin: function (event) {
			if (this.$("#app-access-control")[0].checkValidity()) {
				/*preventing form submit event*/
				event.preventDefault();
			}
			/*getting the form controls and obtaining values to send data*/
			var userInfo = this.getUserAccessInfo("username", "password");
			console.log("userInfo", userInfo);
		},
		eventDoEmailSignup: function (event) {
			if (this.$("#app-access-control")[0].checkValidity()) {
				event.preventDefault();
			}
			/*getting the form controls and obtaining values to send data*/
			var userInfo = this.getUserAccessInfo("signup-username");
			
			var ajaxOptions = {
				url : '_ah/api/userendpoint/v1/user/register',
				callback : function(response){
					
				}, 
				errorCallback : this.somethingBadHappend,
				context : this,
				dataType: 'json',
				contentType: 'application/json',
				type : 'POST',
				data : userInfo
			}
			Sandbox.doPost(ajaxOptions);
			console.log("userInfo", userInfo);
		},
		eventDoForgotPassword: function (event) {
			if (this.$("#app-access-control")[0].checkValidity()) {
				event.preventDefault();
			}
			/*getting the form controls and obtaining values to send data*/
			var userInfo = this.getUserAccessInfo("forgot-pass-username");
			console.log("userInfo", userInfo);
		},
		eventShowForm: function (event) {
			var currentTarget = event.currentTarget.className;
			/*removing the form validation controls, since while submitting form, hidden controls are also validated.*/
			this.$(".form-container").find(".required-inputs").prop("autofocus", false);
			this.$(".form-container").find(".required-inputs").prop("required", false);
			this.$(".form-container").hide();
			this.$("#" + formContainers[currentTarget]).show();
			/*applying form validation controls to only the currently visible form elements*/
			this.$("#" + formContainers[currentTarget]).find(".required-inputs").prop("autofocus", true);
			this.$("#" + formContainers[currentTarget]).find(".required-inputs").prop("required", true);
		},
		doActualLogin : function(data){
			showMask('Getting your information...');
			document.getElementById('logincontainer').setAttribute('style', 'display:none;');

			this.normalizeUserData(data);
			
			var ajaxOptions = {
				url : '_ah/api/userendpoint/v1/user/doLogin',
				callback : function(response){
					_.extend(response, data);
					if(data.callback){
						data.callback.call(this, response);
					} else {
						this.loginSucceded.call(this, response);
					}
				}, 
				errorCallback : this.somethingBadHappend,
				context : this,
				dataType: 'json',
				contentType: 'application/json',
				type : 'POST',
				data : data
				
			};
			Sandbox.doPost(ajaxOptions);
		},
		loginSucceded : function(response){
			
			this.userInfo = this.normalizeUserData(response);
			this.userInfo[response.loginType]=this.userInfo[response.loginType] || {}; 
			this.userInfo[response.loginType].authToken = APIMapper[response.loginType].getAuthToken();
			this.hide();
			this.addInSession();
			hideMask();
			this.startApp();
		},
		startApp : function(){
			Sandbox.publish('LOGIN:SUCCESS', {data : this.userInfo});
		},
		somethingBadHappend : function(xhr, ajaxOptions, thrownError){
			//console.log('Something bad happened, find out who did that and kill them' + error.errorText);
			console.log(xhr.status);
	        console.log(thrownError);
		},
		hide : function(){
			$(this.el).hide();
		},
		show : function(){
			$(this.el).show();
		},
		normalizeUserData : function(data){
			console.log('Normalize user data' + JSON.stringify(data));
			/*if(data.loginType==='facebook'){*/
				data.fullName = data.fullName || (data.firstName + ' ' + data.lastName);
			/*} else if(data.loginType==='google'){*/
				/*data.fullName = data.fullName || (data.firstName + ' ' + data.lastName);*/
			/*}*/
			return data;
		},
		addInSession : function(){
			localStorage.setItem('loggedInUser',JSON.stringify( this.userInfo));
		},
		getFromSession : function(){
			var loggedInUser = localStorage.getItem('loggedInUser');
			
			return loggedInUser;
		},
		addToUser : function(data){
		    var userInfo = JSON.parse(this.getFromSession());
		    this.userInfo = $.extend(userInfo, data);
		    this.addInSession(userInfo);
		},
		getUserInfo : function(){
			var userObject = JSON.parse(this.getFromSession());
			if(userObject && userObject.userId && localStorage.getItem('user')){
				var userData = JSON.parse(localStorage.getItem('user'))[userObject.userId];
				_.extend(userObject, userData);
			}
			//userObject.imgUrl = userObject.loginType==="facebook"?"http://graph.facebook.com/" + userObject.facebookId + "/picture?width=43&height=43" : "https://plus.google.com/s2/photos/profile/" + userObject.googleId + "?sz=45" 
			return userObject;
		}
	});
	
	return LoginView;
	
});

