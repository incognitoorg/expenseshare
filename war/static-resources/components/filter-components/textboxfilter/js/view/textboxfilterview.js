define(function(require){
	var Backbone = require('backbone');
	var handlebars = require('handlebars');
	var textboxfiltertemplate = require('text!./../../template/textboxfiltertemplate.html');
	var FilterView = require('components/filter-components/filter/js/view/filterview');
	var facade = require('facade');
	
	var TextboxFilterView = FilterView.extend({
		initialize : function(){
			this.registerSubscribers();
		},
		registerSubscribers : function(){
			facade.subscribe('filter-reset',this.clearTextBox,this);
		},
		render : function(data){
			var outputHTML = Handlebars.compile(textboxfiltertemplate)(data);
			$(this.el).append(outputHTML);
		},
		events:{
			'keyup .js-textfilterinput' : 'eventFilterResults'
		},
		eventFilterResults : function(){
			var filterArgs = this.$('.js-textfilterinput').val();
			this.model.set('args',filterArgs);
			this.model.applyFilter();
		},
		clearTextBox : function(model){
			this.$('.js-textfilterinput').val('');
		}
	});
	return TextboxFilterView;
});