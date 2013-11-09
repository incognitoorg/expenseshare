define(function(require) {
	"use strict";
	
	var FEMFriendCollection = require('./js/collection/friendcollection');
	var FEMFriendModel = require('./js/model/friendmodel');
	var FEMFriendTemplate = Handlebars.compile(require('text!./templates/friendtemplate.html'));
	
	return {
		getInstance : function(){
			return {
				initialize : function(){
					return {
						'friendModel' 		: 	FEMFriendModel,
						'friendCollection'	: 	FEMFriendCollection,
						'friendTemplate'	:	FEMFriendTemplate
					};
				}
			};
		}
	};
	
});