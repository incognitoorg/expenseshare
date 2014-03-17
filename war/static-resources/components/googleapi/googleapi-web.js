define(function(require){

	var googleClient = require('https://apis.google.com/js/client.js'), 

	EnvVariables = EnvVariablesGlobal || require('envvariables');

	
	
	
	var clientId = EnvVariables.GOOGLE_CLIENT_ID;//'935658127321.apps.googleusercontent.com';
	var apiKey = EnvVariables.GOOGLE_API_KEY;//'AIzaSyAdjHPT5Pb7Nu56WJ_nlrMGOAgUAtKjiPM';
	var scopes = EnvVariables.GOOGLE_API_SCOPE;//'https://www.googleapis.com/auth/plus.me';

	var authToken= '';

	function handleClientLoad() {
		// Step 2: Reference the API key
		gapi.client.setApiKey(apiKey);
		window.setTimeout(checkAuth,1);
	}

	function checkAuth(options) {
		//showMask && showMask('Connecting with google...')
		gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, function(authResult){
			authToken = authResult.access_token;
			makeApiCall(options);
		}, function(){
			hideMask();
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
		// Step 4: Load the Google+ API
		gapi.client.load('plus', 'v1', function() {
			// Step 5: Assemble the API request
			var request = gapi.client.plus.people.get({
				'userId': 'me'
			});
			// Step 6: Execute the API request
			request.execute(function(resp) {
				
				gapi.client.load('oauth2', 'v2', function() {
					gapi.client.oauth2.userinfo.get().execute(function(emailResp) {
						console.log(resp.email);
						if(options.callback){
							resp.authToken = authToken;
							resp.email = emailResp.email;
							options.callback.call(options.context||this, {
								loginType : 'google', 
								googleId : resp.id, 
								data : resp, 
								email : resp.email,
								firstName : resp.name.givenName,
								lastName : resp.name.familyName,
								imgUrl : "https://plus.google.com/s2/photos/profile/" +resp.id + "?sz=45" 
							});
							hideMask();
						}
					});

				});

				
				
			});
		});




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
				alert('email = ' + emailAddress);
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
		checkAndDoLogin : checkAuth,
		getContacts : getContacts,
		getAuthToken :  function(){
			return authToken;
		}
	};

});