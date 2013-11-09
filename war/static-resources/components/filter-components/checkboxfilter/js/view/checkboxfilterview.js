define(function(require){
	var Backbone = require('backbone');
	var handlebars = require('handlebars');
	var checkboxfiltertemplate = require('text!./../../template/checkboxfiltertemplate.html');
	var FilterView = require('components/filter-components/filter/js/view/filterview');
	var CheckboxFilterCss = require('css!./../../css/checkboxfilter.css');
	
	var CheckboxFilterView = FilterView.extend({
		initialize : function(){
			_.bindAll(this, 'argumentsChanged');
			this.model.bind('change:args', this.argumentsChanged);
		},
		render : function(){
			var data = this.getDataForView();
			var outputHTML = Handlebars.compile(checkboxfiltertemplate)(data);
			$(this.el).html(outputHTML);
			var checkedAll = true;
			var checkboxes = this.$(".js-cb");

			for ( var int = 0; int <=checkboxes.length; int++) {
				var checkbox = checkboxes[int];
				if($(checkbox).hasClass("js-theme-uncheck")){
					checkedAll = false;
					break;
				}
			}
			
			this.addRemoveCheckboxClasses(checkedAll);
			
			this.$('.layout-show-airline-name-tooltip').mouseenter(function(){
				$(this).parents('.layout-single-airline').find('.theme-airlineName-tooltip').show();
			});
			
			this.$('.layout-show-airline-name-tooltip').mouseleave(function(){
				$(this).parents('.layout-single-airline').find('.theme-airlineName-tooltip').hide();
			});
		},
		events : {
			"click .js-cb" : "eventApplyFilter",
			"click .js-select-all" : "eventSelectAllBoxes"
		},
		addRemoveCheckboxClasses : function(value){
			var classToApply = value?"js-theme-check":"js-theme-uncheck";
			var classToRemove = value?"js-theme-uncheck":"js-theme-check";
			this.$(".js-select-all").addClass(classToApply).removeClass(classToRemove);
		},
		applyCheckboxFilter : function(){
			var selectedValues = [];
			var allSelected = true;
			this.$('.js-cb').each(function(index, el){
				if($(el).hasClass("js-theme-check")){
					selectedValues.push($(el).data('checkbox'));
				} else {
					allSelected = false;
				}
			});
			this.addRemoveCheckboxClasses(allSelected);
			
			this.model.attributes.args = selectedValues;
		
		},
		eventApplyFilter : function(event){
			$(event.currentTarget).toggleClass("js-theme-check").toggleClass("js-theme-uncheck");
			var checked = this.$("js-select-all").hasClass("js-theme-check");
			if(checked){
				this.$('.js-select-all').addClass("js-theme-uncheck").removeClass("js-theme-check");
				this.$('.js-select-all-txt').html('Select All');
			}else if(this.$('.js-cb').hasClass('js-theme-uncheck')){
					this.$('.js-select-all-txt').html('Select All');
			}else{
					this.$('.js-select-all-txt').html('Clear All');
			}
			this.applyCheckboxFilter();
			this.model.applyFilter();
		},
		eventSelectAllBoxes : function(event){
			$(event.currentTarget).toggleClass("js-theme-check").toggleClass("js-theme-uncheck");
			var checked = this.$(event.currentTarget).hasClass("js-theme-check");
			if(checked){
				this.$('.js-cb').addClass("js-theme-check").removeClass("js-theme-uncheck");
				this.$('.js-select-all-txt').html('Clear All');
			} else {
				this.$('.cb').addClass("js-theme-uncheck").removeClass("js-theme-check");
				this.$('.js-select-all-txt').html('Select All');
			}
			this.applyCheckboxFilter();
			this.model.applyFilter();
			
		},
		reInitialize : function(options){
			this.render();
			this.model.reinitializeFilter();
		},
		argumentsChanged : function(){
			this.reInitialize();
		},
		checkAllAirlines : function(){
			this.$('.js-cb').addClass("js-theme-check").removeClass("js-theme-uncheck");
		},
		uncheckBoxes : function(airlineArray){
			var that = this;
			_.each(airlineArray,function(arrayElement){
				that.$('.'+arrayElement).removeClass('js-theme-check').addClass('js-theme-uncheck');
			});
		}
	});
	return CheckboxFilterView;
});