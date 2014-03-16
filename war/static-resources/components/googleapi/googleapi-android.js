define(function(require){


	EnvVariables = EnvVariablesGlobal || require('envvariables');
	
	var clientId = EnvVariables.GOOGLE_CLIENT_ID;;
	var apiKey = EnvVariables.GOOGLE_API_KEY;
	var scopes = EnvVariables.GOOGLE_API_SCOPE;;

	var authToken= '';

	function handleClientLoad() {
		// Step 2: Reference the API key
		gapi.client.setApiKey(apiKey);
		window.setTimeout(checkAuth,1);
	}

	function checkAuth(options) {
		gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, function(authResult){
			authToken = authResult.access_token;
			makeApiCall(options);
		});
	}
	
	function checkAuthPhoneGap(options){
		var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
		    client_id: clientId,
		    redirect_uri: "http://localhost:8888/",
		    response_type: 'code',
		    scope: scopes
		});

		var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');
		
		 var deferred = $.Deferred();
		
		authWindow.addEventListener('loadstart', function(e) {
			if(e.url.indexOf("localhost:8888")!==-1){
				try {
					var url = e.url;


					var code = /\?code=(.+)$/.exec(url);
					var error = /\?error=(.+)$/.exec(url);
					if (code || error) {
						//Always close the browser when match is found
						authWindow.close();
					}

					if (code) {

						//Exchange the authorization code for an access token
						$.post('https://accounts.google.com/o/oauth2/token', {
							code: code[1],
							client_id: clientId,
							client_secret: EnvVariables.GOOGLE_CLIENT_SECRET,
							redirect_uri: "http://localhost:8888/",
							grant_type: 'authorization_code'
						}).done(function(data) {
							authToken = data.access_token;
							makeApiCall(options);
						}).fail(function(response) {
							alert('Error Occured. Token failure : ' + JSON.stringify(response));
							deferred.reject(response.responseJSON);
						});

					} else if (error) {
						//The user denied access to the app
						deferred.reject({
							error: error[1]
						});
					}
				} catch (error){
					alert(error)
				}
			}
        });
	}
	

	function handleAuthResult(authResult) {
		makeApiCall();
	}

	function handleAuthClick(event) {
		// Step 3: get authorization to use private data
		gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
		return false;
	}

//	Load the API and make an API call.  Display the results on the screen.
	function makeApiCall(options) {
		$.ajax({
			url: "https://www.googleapis.com/oauth2/v1/userinfo",
		    dataType: "jsonp",
		    headers: "GData-Version: 3.0",
		    data:{access_token:  authToken},
			success: function(resp){
				
				console.log('Google API response' + JSON.stringify(resp));
				
				if(options.callback){
					console.log('Google response' +  JSON.stringify(resp));
					resp.authToken = authToken;
					options.callback.call(options.context||this, {
						loginType : 'google', googleId : resp.id, data : resp, email : resp.email,
						firstName : resp.given_name,
						lastName : resp.family_name
					});
				}
			}, 
			error : function(xhr, errorText, error){
			   alert('error occurred' + errorText);
			}
		});
		
		
		
		// Step 4: Load the Google+ API
		/*gapi.client.load('plus', 'v1', function() {
			// Step 5: Assemble the API request
			var request = gapi.client.plus.people.get({
				'userId': 'me'
			});
			// Step 6: Execute the API request
			request.execute(function(resp) {
				if(options.callback){
					resp.authToken = authToken;
					alert('User data from google api ' + JSON.stringify(resp));
					options.callback.call(options.context||this, {loginType : 'google', googleId : resp.id, data : resp});
				}
			});
		});*/




	}







	var contactsService;

	function getMyContacts() {
		var contactsFeedUri = 'https://www.google.com/m8/feeds/contacts/default/full';
		var query = new google.gdata.contacts.ContactQuery(contactsFeedUri);

		// Set the maximum of the result set to be 5
		query.setMaxResults(5);

		contactsService.getContactFeed(query, handleContactsFeed, handleError);
	}

	var handleContactsFeed = function(result) {
		var entries = result.feed.entry;

		for (var i = 0; i < entries.length; i++) {
			var contactEntry = entries[i];
			var emailAddresses = contactEntry.getEmailAddresses();

			for (var j = 0; j < emailAddresses.length; j++) {
				var emailAddress = emailAddresses[j].getAddress();
			}    
		}
	};

	function handleError(e) {
		alert("There was an error!");
		alert(e.cause ? e.cause.statusText : e.message);
	}


	function setupContactsService() {
	  contactsService = new google.gdata.contacts.ContactsService('exampleCo-exampleApp-1.0');
	}

	function logMeIn() {
	  var scope = 'https://www.google.com/m8/feeds';
	  var token = google.accounts.user.login(scope);
	}

	function getContacts() {
	  setupContactsService();
	  logMeIn();
	  getMyContacts();
	}
	
	









	return {
/*		checkAndDoLogin : checkAuth,*/
		checkAndDoLogin : checkAuthPhoneGap,
		getContacts : getContacts,
		getAuthToken :  function(){
			return authToken;
		}
	};

});