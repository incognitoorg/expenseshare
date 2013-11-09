define(function(require){
	var Backbone = require('backbone');
	var handlebars = require('handlebars');
	var sliderfiltertemplate = require('text!./../../template/sliderfiltertemplate.html');
	var FilterView = require('components/filter-components/filter/js/view/filterview');
	var JqueryUI = require('libraries/jquery-ui/jquery-ui');
	var SliderFilterCSS = require('css!./../../css/sliderfilter.css');
	
	function getSelectedValue(value){
		var value = parseInt(value,10)===0?"00":parseInt(value,10);
		return value;
	};
	
	var SliderFilterView = FilterView.extend({
		initialize : function(options){
			_.bindAll(this, 'argumentsChanged');
			this.model.bind('change', this.argumentsChanged);
		},
		render : function(data){
			var outputHTML = Handlebars.compile(sliderfiltertemplate)(data);
			$(this.el).append(outputHTML);

			var that = this;
			this.pluginSlider(this.$(".js-sliderComponent"),{
				range: true,
				min: that.model.get('initialargs').min,
				max: that.model.get('initialargs').max,
				values: [ 1, 1000],
				slide: function( event, ui ) {
					var selectedMinValue= parseInt(getSelectedValue(ui.values[ 0 ]));
					var selectedMaxValue=parseInt(getSelectedValue(ui.values[ 1 ]));
					that.$(".js-theme-sliderCurrntValueText").html(that.formatValue(selectedMinValue) + " - " + that.formatValue(selectedMaxValue));
					that.model.attributes.args = {min : selectedMinValue, max :selectedMaxValue};
					
				},
				stop:function(event, ui){
					that.model.applyFilter(ui.values);					
				}
			});				
		},
		reInitialize : function(options){
			var that = this;
			var appliedMinValue = this.model.get('args').min>this.model.get('initialargs').min?this.model.get('args').min:this.model.get('initialargs').min;
			var appliedMaxValue =  this.model.get('args').max<this.model.get('initialargs').max?this.model.get('args').max:this.model.get('initialargs').max;
			this.model.attributes.args.min = appliedMinValue;
			this.model.attributes.args.max = appliedMaxValue;
			
			var minValue = this.model.get('initialargs').min;
			var maxValue = this.model.get('initialargs').max;
			var sliderValues = [appliedMinValue, appliedMaxValue];
			
			var sliderOptions={range:true,min:minValue,max:maxValue,values:sliderValues};
			
			this.pluginSlider(that.$('.js-sliderComponent'),'option',sliderOptions);
			
			this.$(".js-theme-sliderCurrntValueText" ).html( that.formatValue(appliedMinValue) + " - " + that.formatValue(appliedMaxValue));
			this.$(".js-startValue").html(that.formatValue(that.model.get('initialargs').min));
			this.$(".js-endValue").html(that.formatValue(that.model.get('initialargs').max));
			that.model.reinitializeFilter();		
		},
		argumentsChanged : function(){
			this.reInitialize();
		},
		pluginSlider : function(){
			this.delegatePlugin('slider',arguments);
		}
	});
	return SliderFilterView;                  
});