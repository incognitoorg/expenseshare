define(function(require) {

	return {
		doUpdate : function(){

		},
		doAdd : function(){

		},
		doDelete : function(){

		}, 
		doGet : function(options){

			var URL = options.url;
			var endPointURL = URL.substr(URL.indexOf('endpoint'));

			var splits = endPointURL.split('/');
			var returnData = null;
			var splits = splits.splice(2);

			var endPointType = splits[0];

			var typeOfEndPointObject = returnData = (localStorage.getItem(endPointType) && JSON.parse(localStorage.getItem(endPointType))) || {};
			if(splits[1]){
				var thisEndPoint = returnData = typeOfEndPointObject[splits[1]] = typeOfEndPointObject[splits[1]] || {};
			}
			if(splits[2]){
				var thisEndPointInfo = returnData = thisEndPoint[splits[2]];
			}
			options.callback.call(options.context, returnData );
		},
		doSync : function(){

		},
		doPost : function(options){
			var URL = options.url;
			var endPointURL = URL.substr(URL.indexOf('endpoint'));

			var splits = endPointURL.split('/');
			var returnData = null;
			var splits = splits.splice(2);

			var endPointType = splits[0];

			var typeOfEndPointObject = returnData = (localStorage.getItem(endPointType) && JSON.parse(localStorage.getItem(endPointType))) || {};
			if(splits[1]){
				var thisEndPoint = returnData = typeOfEndPointObject[splits[1]] = typeOfEndPointObject[splits[1]] || {};
			}
			if(splits[2]){
				var thisEndPointInfo = returnData = thisEndPoint[splits[2]];
			}
			
			console.log(typeOfEndPointObject);
			
		}
	};
});