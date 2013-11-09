define(function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var sorterCSS = require('css!./../../css/sorter.css');
	var BaseView = require('components/baseview/view/baseview');

	var SorterView = BaseView.extend({
		initialize : function(options){
			this.el = options.el;
			this.model = options.sorter;
			this.sorterKeyMap = options.sorterKeyMap;
			this.template = options.template;
			this.render(this.template);
		},
		render : function(template){
			var outputHTML = Handlebars.compile(template)();
			$(this.el).append(outputHTML);
		},
		events : {
			'click .js-theme-sorter' : 'eventDoSort'
		},
		eventDoSort : function(event){
			if(event.currentTarget){
				var sorterDirection = this.$(event.currentTarget).hasClass('js-theme-upward');
				this.$('.js-theme-sorter').removeClass('js-theme-selected').removeClass('js-theme-downward').addClass('js-theme-upward');
				this.$(event.currentTarget).addClass('js-theme-selected').removeClass('js-theme-upward').addClass(sorterDirection?'js-theme-downward':'js-theme-upward');
				var sorterType = this.$(event.currentTarget).data('sorter');
			}else{
				var sorterType = event;
			}
			var sorterTypePath = this.sorterKeyMap[sorterType];
			this.model.set('args',{'path':sorterTypePath, reversesort:!sorterDirection});
			this.model.applySorter();
		}
	});
	return SorterView;
});