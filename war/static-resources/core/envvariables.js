define(function(require) {
	
	var mode='local';
	
	if(mode=="production"){
		return {
			API_URL : "https://xpenseshareapp.appspot.com/",
			FB_APP_ID : '295620837229600', 
			GOOGLE_CLIENT_ID : '684896938909.apps.googleusercontent.com',
			GOOGLE_API_KEY : 'AIzaSyDlmVOo6XaTWCvcLRVgHUVeEkN05BpD99I',
			GOOGLE_API_SCOPE : 'https://www.googleapis.com/auth/plus.me https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email'
				                                                      
		};
	} else if(mode==='dev'){
		return {
			API_URL : "https://fem-dev.appspot.com/",
			FB_APP_ID : '605170889512500', 
			GOOGLE_CLIENT_ID : '675356629669.apps.googleusercontent.com',
			GOOGLE_API_KEY : 'AIzaSyCxvFWYp8uk3RxCSEaVEo_FLYeqQVUelpg',
			GOOGLE_API_SCOPE : 'https://www.googleapis.com/auth/plus.me https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email'
				                                                      
		};
	} else if(mode==='local'){
		return {
			API_URL : "",
			FB_APP_ID : '503776339657462',
			GOOGLE_CLIENT_ID : '675356629669.apps.googleusercontent.com',
			GOOGLE_API_KEY : 'AIzaSyCxvFWYp8uk3RxCSEaVEo_FLYeqQVUelpg',
			GOOGLE_API_SCOPE : 'https://www.googleapis.com/auth/plus.me https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email'
		};
	} else if(mode==="qa"){
		return {
			API_URL : "https://fem-qa.appspot.com/",
			FB_APP_ID : '610955545604534',
			GOOGLE_CLIENT_ID : '675356629669.apps.googleusercontent.com',
			GOOGLE_API_KEY : 'AIzaSyCxvFWYp8uk3RxCSEaVEo_FLYeqQVUelpg',
			GOOGLE_API_SCOPE : 'https://www.googleapis.com/auth/plus.me https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email'
		};
	}
});


