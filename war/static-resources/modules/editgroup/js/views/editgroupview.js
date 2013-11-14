define(function(require) {

	var Sandbox = require('sandbox');
	var SelectGroup = require('modules/selectgroup/selectgroup');
	var EditGroupFactory = require('modules/addgroup/addgroup');
	
	
	var NewExpenseView = Sandbox.View.extend({
		initialize : function(options) {
			this.options = _.extend({
			//defaults here
			}, options);
			this.render();
			this.registerSubscribers();
			this.start();
			
		},
		totalExpense : 0,
		template : Handlebars.compile(require('text!./../../templates/editgroup.html')),
		render : function(data) {
			$(this.el).html(this.template(data));
		},
		events : {
			
		},
		registerValidator : function(){
			FormValidator.initialize({'element':this.$(".js-add-expense-form"),'errorWidth':'86%'});
		},
		reInitialize : function(){
			this.$('.js-select-group').show();
			this.$('.js-edit-group-form').hide();
			this.$('.js-select-group').show();

			this.objSelectGroup.reInitialize();
		},
		start : function(){
			if(this.objSelectGroup){
				Sandbox.destroy(this.objSelectGroup);
			} else {
				this.objSelectGroup = SelectGroup.getInstance();
			}
			
			this.$('.js-select-group').show();
			this.$('.js-edit-group-form').hide();
			this.$('.js-select-group').show();
			
			this.objSelectGroup.initialize({el:this.$('.js-select-group'), 'owner':'EDIT-GROUP'});
		},
		registerSubscribers : function(){
			Sandbox.subscribe('GROUP:SELECTED:EDIT-GROUP', this.showEditGroupForm, this);
			                   
		},
		showEditGroupForm : function(group){
			this.$('.js-select-group').hide();
			this.$('.js-edit-group-form').show();
			
			if(this.editGroup){
				Sandbox.destroy(this.editGroup);
			}
			this.editGroup = EditGroupFactory.getInstance();
			this.editGroup.initialize({el : this.$('.js-edit-group-form'), group : group});
		}
	});
	
	return NewExpenseView;

});