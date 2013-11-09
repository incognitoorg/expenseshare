"use strict";

define(function(require) {

	var $ = require('jquery');

	return {
		doAjax : function(options){
			var url = options.url;
			var type = options.type;
			var contentType = options.contentType;
			var dataType = options.dataType;
			var callback = options.callback;
			var errorCallback = options.errorCallback;
			var context = options.context;
			
			$.ajax({
			  'url':url,
			  'type': type, 
			  'contentType':contentType,
			  'dataType': dataType,
			  'success': function(response){
				  
				  if(response.data){
					  var data = response.data;
					 if(response.status==="success"){
						 callback.call(context, data);
					 }else if(response.status==="fail"){
						 errorCallback.call(context, data);
					 }else if(response.status==="error"){
						 errorCallback.call(context, response.message);
					 } 
				  }else{
					  callback.call(context, response);
				  }
				  
			  },
			  'error': function(response){
				  errorCallback.call(context, response);
				  
			  }
			});
		}
	};
});