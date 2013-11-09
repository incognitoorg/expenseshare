define(function(require){

	var Filter=require('components/filter-components/filter/filter');
	var underscore = require('underscore');

	return _.extend(_.clone(Filter), {
		checkall : function(){
		},
		clearall : function(){
		}
		
	});
});