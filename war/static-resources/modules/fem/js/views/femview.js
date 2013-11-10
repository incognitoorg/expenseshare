define(function(require){
	
	require('css!libraries/foundation/css/normalize.css');
	require('css!./../../css/fem.css');
	require('css!./../../css/fonts/fonts.css');
	require('animate');
	var Backbone = require('backbone');
	var AppRouter = require('./../router/femrouter');
	var Sandbox = require('sandbox');
	
	//Module path mapper for requiring module dynamically
	var componentPathMapper = {
		'js-create-group'		:		'modules/addgroup/addgroup',
		'js-edit-group'			:		'modules/editgroup/editgroup', //TODO : Edit group implementation pending
		'js-new-expense'		:		'modules/newexpense/newexpense',
		'js-expense-history'	:		'modules/expensehistory/expensehistory',
		'js-dashboard'			:		'modules/dashboard/dashboard',
		'js-profile'			:		'modules/profile/profile'
	};
	
	//Module instance mapper for identifying component
	var componentMapper = {
		'js-create-group'		:	{module :this.femCreateGroup, 'name' : 'Create Group'},
		'js-edit-group'			:	{module :this.femEditGroup, 'name' : 'Edit Group'},
		'js-new-expense'		:	{module :this.femCreateExpense, 'name' : 'Add Expense'},
		'js-expense-history'	:	{module :this.femEditExpense, 'name' : 'Expense History'},
		'js-dashboard'			:	{module :this.femDashboard, 'name' : 'Dashboard'},
		'js-profile'			:	{module :this.femProfile, 'name' : 'Profile'}
	};
	
	
	var menuHeight = 0;
	var is_mobile = null;
	var appstarted = false;
	
	var FEMView = Sandbox.View.extend({
		initialize : function(options){
			this.registerSubscribers();
			
		},
		registerSubscribers : function(){
			Sandbox.subscribe('LOGIN:SUCCESS',this.start,this);
			Sandbox.subscribe('fem-newGroupCreated',this.redirectView,this);
			Sandbox.subscribe('FEM:MENU:CLICK',this.showFEMComponent,this);
			Sandbox.subscribe('FEM:DESTROY:COMPONENT',this.destroyFEMComponent,this);
			Sandbox.subscribe('FEM:NAVIGATE',this.navigate,this);
		},
		template : Handlebars.compile(require('text!../../templates/femtemplate.html')),
		render : function(){
			$(this.el).html(this.template());
		},
		events : {
			'click .js-menu' : 'eventShowView',
			'click .js-back-to-menu' : 'eventShowMenu',
			'click .js-show-menu' : 'showMenu',
			'click .js-hide-menu' : 'hideMenu',
		},
		eventShowView : function(event){
			var self = this;
			var clickedMenu = (event.currentTarget && $(event.currentTarget).data('menu')) ||event;
			this.$('.js-view-item').hide();
			self.$('.' + clickedMenu).fadeIn(1500);
			/*this.$('.js-left-side-menu').addClass('hide-for-small');
			this.$('.js-right-panel').removeClass('hide-for-small');*/
			var navLink = clickedMenu.toLowerCase().split('-').join('');
			this.router.navigate("#"+navLink.substring(2,navLink.length));

			var componentElement = this.$('.'+clickedMenu);
			var dataToPublish = {
					'clickedMenu' : clickedMenu,
					'element' : componentElement
			};
			
			Sandbox.publish('FEM:MENU:CLICK',dataToPublish);
		},
		eventShowMenu : function(){
			/*this.$('.js-left-side-menu').removeClass('hide-for-small');
			this.$('.js-right-panel').addClass('hide-for-small');*/
			this.router.navigate("#menu");
		},
		makeResponsive : function(){
			this.$('.js-left-side-menu p').height(parseInt(this.$('.js-left-side-menu').height()/this.menulength)-1);
		},
		navigate : function(url){
			this.router.navigate(url);
		},
		start : function(userdata){
			var redirectURL = location.href.substr(location.href.indexOf('#'));
			if(!appstarted){
				this.render();
				appstarted = true;
			}
			
			//TODO : Put this in some common place
			if( $('.is-mobile').css('display') == 'none' ) {
		        is_mobile = true;      
		    }
			
			menuHeight = this.$('.js-fixed-section').height();
			menuWidth = this.$('.js-fixed-section').width();
			
			if(is_mobile){
				this.$('.js-left-side-menu').css({ left:-$(window).width()});
			}
			
			
			
			this.menulength = this.$('.js-menu').length;
			//Trying to make height responsive. Experimental. May need to throw this away.
			//this.makeResponsive();
			if(!this.router){
				this.router = new AppRouter({view : this});
				Backbone.history.start();
			}
			this.router.navigate('#menu');

			if(redirectURL.length>1){
				this.router.navigate(redirectURL);
			} else {
				this.eventShowView('js-dashboard');
			}
			
			Sandbox.publish('APP:START', userdata.data);
			hideMask();
					
		},
		redirectView : function(data){
			this.eventShowView('js-dashboard');
		},
		showFEMComponent : function(publishedData){
			this.$('.js-currently-showing').html(componentMapper[publishedData.clickedMenu].name);
			if(!componentMapper[publishedData.clickedMenu].module){
				require([componentPathMapper[publishedData.clickedMenu]],function(FEMComponent){
					componentMapper[publishedData.clickedMenu]=componentMapper[publishedData.clickedMenu];
					componentMapper[publishedData.clickedMenu].module =FEMComponent.getInstance();
					componentMapper[publishedData.clickedMenu].module.initialize({'moduleName':publishedData.clickedMenu,'el':publishedData['element']});
				});
			}else {
				$(publishedData['element']).show();
				if(componentMapper[publishedData.clickedMenu].module.reInitialize){
					componentMapper[publishedData.clickedMenu].module.reInitialize.apply(componentMapper[publishedData.clickedMenu].module);
				}
			}
			this.hideMenu();
		},
		destroyFEMComponent : function(data){
			Sandbox.destroy(componentMapper[data.name]);
			componentMapper[data.name]=null;
		},
		showMenu : function(event){
			
			var self = this;
			if(is_mobile){
				this.$('.js-show-menu').removeClass('js-show-menu').addClass('js-hide-menu');
				self.$('.app-container').animate({
					left: $(window).width(),
				}, 300, function() {
					window.scrollTo(0,0);
					// Animation complete.
				});
				
				
			}
		},
		hideMenu : function(event){
			var self = this;
			if(is_mobile){
				self.$('.js-hide-menu').removeClass('js-hide-menu').addClass('js-show-menu');

				self.$('.app-container').animate({
					left: 0,
				}, 300, function() {
					// Animation complete.
				});
				
			}
		}
	});
	return FEMView;
});
