requirejs.config({
	baseUrl : '/static-resources/',
	paths : {
		backbone : 'libraries/backbone/backbone',
		jquery : 'libraries/jquery/jquery',
		underscore : 'libraries/underscore/underscore',
		handlebars : 'libraries/handlebars/handlebarshelpers',
		handlebarshelpers : 'libraries/handlebars/handlebars',
		css : 'libraries/require/css',
		normalize : 'libraries/require/normalize',
		async : 'libraries/require/async',
		text : 'libraries/require/text',
		facade : 'libraries/core/facade',
		mediator : 'libraries/core/mediator',
		debugmode : 'libraries/debugmode/debugmode',
		errorlogger : 'libraries/errorlogger/errorlogger',
		persistence : 'libraries/lawnchair/lawnchair',
		fbgraphinitializer : 'components/fbgraph-initializer/fbgraph-initializer'
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
		}
	},
	waitSeconds : 60
});

//TODO : This module can be used in case we need to implement a rediect login which will require separate page for only login.
require(['bootloaders/loginbootloader/loginbootloader'], function(bootoloader) {
	bootoloader.start(/*{'debugMode':true,'analytics':true,'errorlogger':true}*/);
});