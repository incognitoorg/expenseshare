"use strict";
define(function (require) {

	var mediator = require('mediator'), 
	//Mz = require('http://cdnjs.cloudflare.com/ajax/libs/modernizr/2.6.2/modernizr.min.js'),
	EnvVariables = require('envvariables'),
	locallayer = require('locallayer');
	
	
	var isOffline = false;
	
	var Sandbox = {};
	Sandbox.subscribe = function (channel, /*subscriber,*/ callback, context) {
		return mediator.subscribe(channel, /*subscriber,*/ callback, context || this);
	};

	Sandbox.publish = function (channel) {
		mediator.publish.apply(mediator, arguments);
	};

	Sandbox.registerChildren = function(children, parent){
		mediator.registerChildren.apply(mediator, arguments);
	};
	
	Sandbox.destroy = function(component){
		mediator.destroy.apply(mediator, arguments);
	};
	
	Sandbox.doAjax = function(options){
		var prefix = EnvVariables.API_URL;
		console.log('url',options.url);
		
		var url = prefix+options.url;
		var type = options.type;
		var contentType = options.contentType;
		var dataType = options.dataType;
		var callback = options.callback;
		var errorCallback = options.errorCallback;
		var context = options.context;
		var data = options.data;
		var loader = options.loader;
		
		return $.ajax({
		  'url':url,
		  'type': type, 
		  'contentType':contentType,
		  'dataType': dataType,
		  'data' : JSON.stringify(data),
		  'beforeSend' : function(){
			  loader && loader.addClass('js-loader');
		  },
		  'success': function(response){
				  callback.call(context, response);
				  loader && loader.removeClass('js-loader');
		  },
		  'error': function(response){
			  if(errorCallback){
				  errorCallback.call(context, response);
			  } else {
				  errorFallback.call(response, data);
			  }
			  loader && loader.removeClass('js-loader');
			  
		  }
		});
	};
	
	
	
	function errorFallback(response, data){
		console.log('Something bad happened while communicating with back end, you are on your own. Here is what I have for you.', response, data);
	}
	
	Sandbox.View = Backbone.View;
	Sandbox.Model = Backbone.Model;
	Sandbox.Collection = Backbone.Collection;
	Sandbox.Router = Backbone.Router;
	Sandbox.History = Backbone.History;
	

	Sandbox.doUpdate= function(data){
		data.type="PUT";
		data.dataType='json';
		data.contentType='application/json';
		/*if(Modernizr.localstorage && !navigator.onLine){
			locallayer.doUpdate(data);
		} else */{
			return this.doAjax(data);
		}
	};
	
	Sandbox.doGet = function(options){
	    var callback = options.callback;
	    
	    var URL = options.url;
	    var endPointURL = URL.substr(URL.indexOf('endpoint'));

	    var splits = endPointURL.split('/');

	    splits = splits.splice(2);

	    var endPointType = splits[0];
	    var thisEndPoint = {};

	    var typeOfEndPointObject = (localStorage.getItem(endPointType) && JSON.parse(localStorage.getItem(endPointType))) || {};
	    if(splits[1]){
	    	thisEndPoint = typeOfEndPointObject[splits[1]] = typeOfEndPointObject[splits[1]] || {};
	    }
	    
		/*if(Modernizr.localstorage && !navigator.onLine){
			locallayer.doGet(options);
		} else */{
			options.loaderContainer && options.loaderContainer.addClass('global-loader');
			var extendedData = _.extend(options, {
				dataType: 'json',
				contentType: 'application/json',
				type : 'GET',
				callback : function(response){
					  /*var URL = data.url;
					  var endPointURL = URL.substr(URL.indexOf('endpoint'));
					  
					  var splits = endPointURL.split('/');
					  
					  var splits = splits.splice(2);
					  
					  var endPointType = splits[0];
					  
					  var typeOfEndPointObject = (localStorage.getItem(endPointType) && JSON.parse(localStorage.getItem(endPointType))) || {};
					  if(splits[1]){
						  var thisEndPoint = typeOfEndPointObject[splits[1]] = typeOfEndPointObject[splits[1]] || {};
					  }*/
					  if(splits[2]){
						  thisEndPoint[splits[2]] = response;
					  }
					  localStorage.setItem(endPointType, JSON.stringify(typeOfEndPointObject));
					  
					  options.loaderContainer && options.loaderContainer.removeClass('global-loader');
					  callback.call(options.context, response);
				}
			});

			var promise = this.doAjax(extendedData);
			if(options.cached){
				var cachedData = thisEndPoint[splits[2]];
				//cachedData && callback.call(options.context, cachedData);// && options.loaderContainer && options.loaderContainer.removeClass('global-loader');;
			}
			return promise;
		}
	};
	
	Sandbox.doDelete = function(data){
		/*if(Modernizr.localstorage && !navigator.onLine){
			locallayer.doDelete(data);
		} else */{
			return this.doAjax(data);
		}
	};
	
	Sandbox.doAdd = function(data){
		var callback = data.callback;
		
		
		var storedAllUserData;
		/*if(Modernizr.localstorage && !navigator.onLine){
			var URL = data.url;
			var endPointURL = URL.substr(URL.indexOf('endpoint'));
			
			var splits = endPointURL.split('/');
			
			var splits = splits.splice(2);
			
			var endPointType = splits[0];
			var dataToSend = data.data;
			var userId = dataToSend.ownerId;
			
			var storedAllUserData = JSON.parse(localStorage.getItem('user'));
			
			if(storedAllUserData){
				var storedUserData = storedAllUserData[userId];
				storedUserData[endPointType].items.push(dataToSend);
				localStorage.setItem('user', JSON.stringify(storedAllUserData));
			}
			callback.call(data.context, data.data);
			//locallayer.doAdd(data);
		} else */{
			
			var data = _.extend(data, {
					dataType: 'json',
					contentType: 'application/json',
					type : 'POST',
					data : data.data,
					callback : function(response){
						  var URL = data.url;
						  var endPointURL = URL.substr(URL.indexOf('endpoint'));
						  
						  var splits = endPointURL.split('/');
						  
						  var splits = splits.splice(2);
						  
						  var endPointType = splits[0];
						  var dataToSend = data.data;
						  var userId = dataToSend.ownerId;
						  
						  if(storedAllUserData){
								var storedUserData = storedAllUserData[userId];
								storedUserData[endPointType].items.push(dataToSend);
								localStorage.setItem('user', JSON.stringify(storedAllUserData));
						  }
						  callback.call(data.context, response);
					}
			});
			
			return this.doAjax(data);
		}
	};
	
	Sandbox.doPost = function(data){
		/*if(Modernizr.localstorage && !navigator.onLine){
			locallayer.doPost(data);
		} else */{
			
			var data = _.extend(data, {
					dataType: 'json',
					contentType: 'application/json',
					type : 'POST'
			});
			
			return this.doAjax(data);
		}
	};
	
	Sandbox.doSync = function(){
		
	};
	
	
	return Sandbox;

});
//I dont like doing this, but this helps
var debugMode = false;