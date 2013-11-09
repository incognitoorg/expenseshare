"use strict";
define(['mediator'], function (mediator) {

	var Sandbox = {};

	// * **param:** {string} subscriber Module name
	// * **param:** {string} channel Event name
	// * **param:** {object} callback Module
	Sandbox.subscribe = function (channel, /*subscriber,*/ callback, context) {
		return mediator.subscribe(channel, /*subscriber,*/ callback, context || this);
	};

	// * **param:** {string} channel Event name
	Sandbox.publish = function (channel) {
		mediator.publish.apply(mediator, arguments);
	};

	
	Sandbox.registerChildren = function(children, parent){
		mediator.registerChildren.apply(mediator, arguments);
	};
	
	
	Sandbox.destroy = function(component){
		mediator.destroy.apply(mediator, arguments);
	};
	
	Sandbox.decorate = function(baseObject, decorations){
		
		if(debugMode){

			var overridden = [];

			for ( var index in baseObject) {
				if(decorations[index]){
					overridden.push(index);
				}
			}

			if(overridden.length>0){
				//console.error('Protocol breach, using decorate for overriding');
				console.warn('Protocol breach, using decorate for overriding, You should be arrested for this.');
				console.log('Overridden properties');
				console.log(overridden.join());
			}
		}
		
		if(baseObject.prototype instanceof Backbone.View){
			if(decorations.extendedEvents){
				_.extend(baseObject.prototype.events, decorations.extendedEvents);
			}
			return baseObject.extend(decorations);
		}
		
		if(baseObject.getInstance){
			return _.extend(baseObject.getInstance(), decorations);
		}
		
		if(decorations.extendedRules){
			_.extend(baseObject.rules, decorations.extendedRules);
		}
		return _.extend(baseObject, decorations);
	};
	
	Sandbox.override = function(baseObject,overriddens){
		
		if(debugMode){
			
			var baseObjectForSize = baseObject;
			
			if(baseObject.prototype instanceof Backbone.View){
				baseObjectForSize = baseObject.prototype;
			} else if(baseObjectForSize.getInstance) {
				baseObjectForSize = baseObjectForSize.getInstance();
			}
			
			
			var baseObjectSize = _.size(baseObjectForSize);
			var overriddensize = _.size(overriddens);
			var overrideRatio = overriddensize/baseObjectSize;
			
			if(overrideRatio>=0.5){
				console.warn('You are overriding just too much, consider excluding base file and copy all properties/functions in extension');
				console.log('Properties/functions to copy');
				console.log(_.difference(_.keys(baseObjectForSize), _.keys(overriddens)));
			}
			
		}
		
		
		
		if(baseObject.prototype instanceof Backbone.View){
			if(overriddens.extendedEvents){
				_.extend(baseObject.prototype.events, overriddens.extendedEvents);
			}
			return baseObject.extend(overriddens);
		}
		
		if(baseObject.getInstance){
			return _.extend(baseObject.getInstance(), overriddens);
		}
		
		if(overriddens.extendedRules){
			_.extend(baseObject.rules, overriddens.extendedRules);
		}
		
		return _.extend(baseObject, overriddens);
	};
	
	

	return Sandbox;

});