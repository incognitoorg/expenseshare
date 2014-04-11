var require = {
		baseUrl : '/static-resources/',
		paths : {
			backbone : 'libraries/backbone/backbone.min',
			jquery : 'libraries/jquery/jquery-2.0.0.min',
			underscore : 'libraries/underscore/underscore.min',
			handlebars : 'libraries/handlebars/handlebarshelpers',
			handlebarshelpers :'libraries/handlebars/handlebars',
			css : 'libraries/require/css',
			normalize : 'libraries/require/normalize',
			async : 'libraries/require/async',
			text : 'libraries/require/text',
			facade : 'core/facade',
			envvariables : 'core/envvariables',
			sandbox : 'core/sandbox',
			locallayer : 'core/locallayer',
			mediator : 'core/mediator',
			debugmode : 'libraries/debugmode/debugmode',
			errorlogger : 'libraries/errorlogger/errorlogger',
			persistence : 'libraries/lawnchair/lawnchair',
			fbapioauth : 'components/fbapi/fbapi-web',
			googleapioauth : 'components/googleapi/googleapi-web',
			formvalidationwrapper : 'plugins/jquery/formvalidation/formvalidation',
			"autocomplete-amd" : 'libraries/jquery-ui/jquery.ui.autocomplete-amd',
			autocomplete : 'libraries/jquery-ui/js/ui/minified/jquery.ui.autocomplete.min',
			uicore : 'libraries/jquery-ui/js/ui/minified/jquery.ui.core.min',
			uiwidget : 'libraries/jquery-ui/js/ui/minified/jquery.ui.widget.min',
			uimenu : 'libraries/jquery-ui/js/ui/minified/jquery.ui.menu.min',
			uiposition : 'libraries/jquery-ui/js/ui/minified/jquery.ui.position.min',
			animate : 'plugins/jquery/animate-enhanced/jquery.animate-enhanced.min'
		},
		shim : {
			'backbone' : {
				deps : [ 'underscore', 'jquery' ],
				exports : 'Backbone'
			},
			'handlebars' : {
				deps : [ 'handlebarshelpers' ]
			},
			'persistence' : {
				exports : 'Lawnchair'
			},
			'animate' : {
				deps : [ 'jquery' ],
			},
			'autocomplete' : {
				deps : [ 'jquery', 'uicore' , 'uiwidget', 'uimenu', 'uiposition'],
			},
			'uimenu' : {
				deps : [ 'uiwidget'],
			}
		},
		waitSeconds : 60,
		/* urlArgs: "v=0.25",  */
		deps : ['page-js/fem']
};
//TODO : Move this to better place
window.applicationCache.addEventListener('updateready', function(e) {
	if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
		// Browser downloaded a new app cache.
		// Swap it in and reload the page to get the new hotness.
		window.applicationCache.swapCache();
		//TODO : To add beutiful confirm dialogue here
		if (confirm('A new version of this site is available. Load it?')) {
			window.location.reload();
		}
	} else {
		// Manifest didn't changed. Nothing new to server.
	}
}, false);