define(function(require) {

	var EnvVariables = EnvVariablesGlobal || require('envvariables');

	if(typeof FB!=='undefined'){
		
		// init the Facebook JS SDK
		FB.init( {
			appId : EnvVariables.FB_APP_ID,
			//channelUrl: 'http://localhost:8888/channel.html', // Channel File for x-domain communication
			status: true, // check the login status upon init?
			cookie: true, // set sessions cookies to allow your server to access the session?
			xfbml: true // parse XFBML tags on this page?
		} );
	}

	var FBAuthToken;


	function getUserInfo(options){
		FB.api('/me', function(response) {
            response.authToken = FBAuthToken;
			if(options.callback){
				options.callback.call(options.context || this, {
					loginType:'facebook', 
					facebookId:response.id,
					firstName : response.first_name,
					lastName : response.last_name,
					data : response,
					imgUrl : "http://graph.facebook.com/" + response.id + "/picture?width=43&height=43"
				});
			}
		});
	}
	
	
	function getUserInfoPhoneGap(options){
		/* var url = "https://graph.facebook.com/me?access_token=" + FBAuthToken;
		    var req = new XMLHttpRequest();

		    req.open("get", url, true);
		    req.send(null);
		    req.onerror = function() {
		        alert("Error");
		    };
		    return req;*/
		
		$.ajax({
			url : "https://graph.facebook.com/me?access_token=" + FBAuthToken,
			success : function(response){
				response.authToken = FBAuthToken;
				if(options.callback){
					options.callback.call(options.context || this, {
						loginType:'facebook', 
						facebookId:response.id,
						firstName : response.first_name,
						lastName : response.last_name,
						fullName : response.first_name + " " +  response.last_name,
						data : response,
						email : response.email,
						imgUrl : "http://graph.facebook.com/" + response.id + "/picture?width=43&height=43"
					});
				}
			}
		})
		
	}

	return {
		initialize : function(options) {

		},
		checkAndDoLogin : function(options){


			var redirect_uri = "http://www.facebook.com/connect/login_success.html";
			var client_id = EnvVariables.FB_APP_ID;
			var display;
		    //var authorize_url = "https://graph.facebook.com/oauth/authorize?";
		    var authorize_url = "https://www.facebook.com/dialog/oauth?";
		    authorize_url += "client_id=" + client_id;
		    authorize_url += "&redirect_uri=" + redirect_uri;
		    authorize_url += "&display=" + (display ? display : "touch");
		    authorize_url += "&type=user_agent";
		    
		    var ref = window.open(authorize_url, '_blank', 'location=no');
		    
		    var self = this;
		    
		    
		    ref.addEventListener('loadstart', function(event) {
		    	if(event.url.indexOf(redirect_uri)!==-1){

		    		var access_token = event.url.split("access_token=")[1];
		    		var error_reason = event.url.split("error_reason=")[1];
		    		if(access_token){      
		    			access_token = access_token.split('&')[0];
		    			FBAuthToken = access_token;
		    			getUserInfoPhoneGap(options);
		    			ref.close();
		    		}
		    		if(error_reason){
		    			alert('error occured');
		    			alert(error_reason);
		    			ref.close();
		    		}
		    	}


		    });


		},
		checkAndDoLogout : function(){
			FB.logout(function(response) {
				location.reload();
				// user is now logged out
			});
		},
		getAuthToken : function(){
			return FBAuthToken;
		}
	};

});