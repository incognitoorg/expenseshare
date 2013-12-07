{
	baseUrl: "./../../war/static-resources",
	include: '../page-js/fem.js',
	optimize: "uglify2",
	uglify: {
        toplevel: true,
        ascii_only: true,
        beautify: true,
        max_line_length: 1000,

        //How to pass uglifyjs defined symbols for AST symbol replacement,
        //see "defines" options for ast_mangle in the uglifys docs.
        defines: {
            DEBUG: ['name', 'false']
        },

        //Custom value supported by r.js but done differently
        //in uglifyjs directly:
        //Skip the processor.ast_mangle() part of the uglify call (r.js 2.0.5+)
        no_mangle: true
    },

    //If using UglifyJS for script optimization, these config options can be
    //used to pass configuration values to UglifyJS.
    //For possible values see:
    //http://lisperator.net/uglifyjs/codegen
    //http://lisperator.net/uglifyjs/compress
    uglify2: {
        //Example of a specialized config. If you are fine
        //with the default options, no need to specify
        //any of these properties.
        output: {
            beautify: false
        },
        compress: {
            sequences: true,
            join_vars: true,
            if_return: true,
            properties    : true,  // optimize property access a["Foo"] to a.foo
            conditionals  : true,  // optimize if-s and conditional expressions
            comparisons   : true,  // optimize comparisons
            evaluate      : true,  // evaluate constant expressions
            booleans      : true,  // optimize boolean expressions
            loops         : true,  // optimize loops
            drop_debugger : true,  // discard “debugger” statements
            dead_code     : true,  // discard unreachable code
        },
        warnings: true,
        mangle: false
    },

    //If using Closure Compiler for script optimization, these config options
    //can be used to configure Closure Compiler. See the documentation for
    //Closure compiler for more information.
    closure: {
        CompilerOptions: {},
        CompilationLevel: 'SIMPLE_OPTIMIZATIONS',
        loggingLevel: 'WARNING'
    },
    skipModuleInsertion: false,
	paths : {
		backbone : 'libraries/backbone/backbone.min',// ['http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min', 'libraries/backbone/backbone'],
		jquery : 'libraries/jquery/jquery-2.0.0.min',//['http://cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min', 'libraries/jquery/jquery'],
		underscore : 'libraries/underscore/underscore.min',//['http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min','libraries/underscore/underscore'],
		handlebars : 'libraries/handlebars/handlebarshelpers',
		handlebarshelpers :'libraries/handlebars/handlebars',// ['http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.0.0-rc.3/handlebars.min','libraries/handlebars/handlebars'],
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
		},
	},
	 //Inlines the text for any text! dependencies, to avoid the separate
    //async XMLHttpRequest calls to load those dependencies.
    inlineText: true,
    /*fileExclusionRegExp: //.css/,*/
	/*include: '../page-js/home.js',*/
    //appDir: '../www',
    /*mainConfigFile: '../www/js/common.js',*/
    /*dir: '../www-built',*/
    
    /*skipCSS : true,*/
    
    dir : './../../war/built-static-resources',
    modules: [
        //First set up the common build layer.
       /* {
        	//module names are relative to baseUrl
        	name: 'libraries/jquery/jquery',
        	//List common dependencies here. Only need to list
        	//top level dependencies, "include" will find
        	//nested dependencies.
        	include : [ 'libraries/backbone/backbone', 
        	            'libraries/jquery/jquery', 
        	            'libraries/underscore/underscore',
        	            'libraries/handlebars/handlebarshelpers',
        	            'libraries/handlebars/handlebars',
        	            'libraries/require-jquery/css',
        	            'libraries/require-jquery/normalize',
        	            'libraries/require-jquery/async',
        	            'libraries/require-jquery/text',
        	            'libraries/core/facade',
        	            'libraries/core/mediator',
        	            'libraries/debugmode/debugmode',
        	            'libraries/errorlogger/errorlogger'
        	            ]

        },*/

        //Now set up a build layer for each main layer, but exclude
        //the common one. "exclude" will exclude nested
        //the nested, built dependencies from "common". Any
        //"exclude" that includes built modules should be
        //listed before the build layer that wants to exclude it.
        //The "page1" and "page2" modules are **not** the targets of
        //the optimization, because shim config is in play, and
        //shimmed dependencies need to maintain their load order.
        //In this example, common.js will hold jquery, so backbone
        //needs to be delayed from loading until common.js finishes.
        //That loading sequence is controlled in page1.js.
        /*{
        	name :'envvariables',
            include: ['core/envvariables'],
        	exclude: []
        },*/
        {
        	name :'bootloaders/fembootloader/fembootloader',
            include: ['bootloaders/fembootloader/fembootloader'],
        	exclude: []
        },
        {
        	name :'plugins/jquery/formvalidation/formvalidation',
        	include: ['plugins/jquery/formvalidation/formvalidation'],
        	exclude: ['backbone','handlebars','underscore','jquery', 'bootloaders/fembootloader/fembootloader']
        },
        {
        	name :'components/login/login',
            include: ['components/login/login'],
        	exclude: ['backbone','handlebars','underscore','jquery', 'bootloaders/fembootloader/fembootloader']
        },
        {
        	name :'modules/fem/fem',
            include: ['modules/fem/fem'],
        	exclude: ['backbone','handlebars','underscore','jquery', 'bootloaders/fembootloader/fembootloader','components/login/login']
        },
        {
        	name :'modules/addgroup/addgroup',
            include: ['modules/addgroup/addgroup'],
        	exclude: ['backbone','handlebars','underscore','jquery', 'bootloaders/fembootloader/fembootloader','components/login/login', 'modules/fem/fem', 'plugins/jquery/formvalidation/formvalidation']
        },
        {
        	name :'modules/selectgroup/selectgroup',
            include: ['modules/selectgroup/selectgroup'],
        	exclude: ['backbone','handlebars','underscore','jquery', 'bootloaders/fembootloader/fembootloader','components/login/login', 'modules/fem/fem','modules/addgroup/addgroup']
        },
        {
        	name :'modules/newexpense/newexpense',
            include: ['modules/newexpense/newexpense'],
        	exclude: ['backbone','handlebars','underscore','jquery', 'bootloaders/fembootloader/fembootloader','components/login/login', 'modules/fem/fem','modules/addgroup/addgroup','modules/selectgroup/selectgroup', 'plugins/jquery/formvalidation/formvalidation']
        },
        {
        	name :'modules/expensehistory/expensehistory',
            include: ['modules/expensehistory/expensehistory'],
        	exclude: ['backbone','handlebars','underscore','jquery', 'bootloaders/fembootloader/fembootloader','components/login/login', 'modules/fem/fem','modules/addgroup/addgroup','modules/selectgroup/selectgroup', 'modules/newexpense/newexpense']
        },
        {
        	name :' modules/editgroup/editgroup',
            include: ['modules/expensehistory/expensehistory'],
        	exclude: ['backbone','handlebars','underscore','jquery', 'bootloaders/fembootloader/fembootloader','components/login/login', 'modules/fem/fem','modules/addgroup/addgroup','modules/selectgroup/selectgroup', 'modules/newexpense/newexpense']
        },
        {
        	name :'modules/dashboard/dashboard',
            include: ['modules/dashboard/dashboard'],
        	exclude: ['backbone','handlebars','underscore','jquery', 'bootloaders/fembootloader/fembootloader','components/login/login', 'modules/fem/fem','modules/addgroup/addgroup','modules/selectgroup/selectgroup', 'modules/newexpense/newexpense', 'modules/expensehistory/expensehistory']
        },
        {
        	name :'modules/profile/profile',
            include: ['modules/profile/profile'],
        	exclude: ['backbone','handlebars','underscore','jquery', 'bootloaders/fembootloader/fembootloader','components/login/login', 'modules/fem/fem','modules/addgroup/addgroup','modules/selectgroup/selectgroup', 'modules/newexpense/newexpense', 'modules/expensehistory/expensehistory','modules/dashboard/dashboard']
        }
    ]
}
