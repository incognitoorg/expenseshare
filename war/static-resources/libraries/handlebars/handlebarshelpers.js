
define(function(require) {
	"use strict";
	
		Handlebars.registerHelper("formatDuration", function(duration) {
			var value = parseInt(duration,10)==0?"00":parseInt(duration,10);
			var hours = parseInt(duration/60,10)<10?"0"+parseInt(duration/60,10):parseInt(duration/60,10); 
			var minutes = duration%60<10?"0"+duration%60:duration%60; 
			return hours + ":" + minutes;
		});
		
		Handlebars.registerHelper("formatDate", function(arrivalDate) {
			var newArrivalDate = (arrivalDate.substr(0,10)).replace(/\-/g,'/');//arrivalDate.substr(0,4)+'/'+ arrivalDate.substr(4,2) +'/'+arrivalDate.substr(6,4);   
			var finalDate = new Date(newArrivalDate).toString().substr(0,15);
			return finalDate.substr(0,3) +', ' + finalDate.substr(8,3) +' ' + finalDate.substr(4,4) +' ' + finalDate.substr(10,11);
		});
		
		Handlebars.registerHelper("formatPrice", function(totalPrice) {
			return ''+totalPrice.toFixed(2);
		});

		
		return Handlebars;
});
