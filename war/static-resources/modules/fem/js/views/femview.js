var AppRouterInstance = null;
define(function(require){
	
	require('css!libraries/foundation/5.0.2/css/normalize.css');
	require('css!./../../css/fem.css');
	require('css!./../../css/fonts/fonts.css');
	require('animate');
	var Backbone = require('backbone');
	var AppRouter = require('./../router/femrouter');
	var Sandbox = require('sandbox');
	var JqueryTouch = require('libraries/jquery-mobile/jquery.mobile.touch.min');
	
	//Module path mapper for requiring module dynamically
	var componentPathMapper = {
		'js-create-group'		:		'modules/addgroup/addgroup',
		'js-edit-group'			:		'modules/editgroup/editgroup', 
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
			
			if(($('.is-mobile').css('display') !== 'none')) {
				this.$('.scrollable-right-section').height($('body').height()-(45));
			}
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
			var navLink = clickedMenu.toLowerCase().split('-').join('');
			this.router.navigate("#"+navLink.substring(2,navLink.length));

			var argumentsProvided = Array.prototype.slice.call(arguments, 0).splice(1);
			var componentElement = this.$('.'+clickedMenu);
			var dataToPublish = {
					'clickedMenu' : clickedMenu,
					'element' : componentElement
			};
			argumentsProvided.length>0?dataToPublish['argumentsProvided']=argumentsProvided : ''; 
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
			var self = this;
			if(!appstarted){
				$('.js-fem-container').show();
				$('.xpenseshare-footer').css('visibility', 'hidden');
				this.render();
				appstarted = true;
				
				$(this.el)
				.swipeleft(function(event){
					self.hideMenu(event);
				})
				.swiperight(function(event){
					self.showMenu(event);
				});
				
				if(!($('.is-mobile').css('display') !== 'none')) {
			        is_mobile = true;   
			        var menuBarHeight = $('.js-show-menu').height();
			        
			     /*   var lastScroll = 0;
			        $('.scrollable-right-section').scroll(function(event){
			            
			            var st = $(this).scrollTop();
			  		  
			            if (st > lastScroll){ //down
			               $('.js-show-menu').stop().animate({
								height: 0,
							}, 1000);
			            }
			            else { //up
			               $('.js-show-menu').stop().animate({
								height: menuBarHeight,
							}, 1000);
			            }
			            lastScroll = st;
			          });
			        
			        
			        
			        
			        */
			        
			       var menuBarHeight = $('.js-show-menu').height();
			    
			        $('.scrollable-right-section').on('scroll', function(){
			        	
			        	var $menuBar = $('.js-show-menu');
			        	if($('.scrollable-right-section').scrollTop()>100){
			        		if($menuBar.height()!==0){
			        			$menuBar.animate({
									height: 0,
								}, 1000, function() {
									// Animation complete.
								});
			        		}
			        		
			        	} else if($('.scrollable-right-section').scrollTop()<50) {
			        		if($menuBar.height()!==menuBarHeight){
			        			$menuBar.animate({
			        				height: menuBarHeight,
			        			}, 1000, function() {
			        				// Animation complete.
			        			});
			        		}
			        		
			        	}
			        });
				}
			}
			
			//TODO : Put this in some common place
			if(!($('.is-mobile').css('display') !== 'none')) {
		        is_mobile = true;      
		        $(document).on('focus', 'input', function(event){
		        	$("body").animate({ scrollTop: $(event.currentTarget)[0].getBoundingClientRect().top+document.body.scrollTop }, "slow");
		        });
		    }
			
			
			
			var imageURL = userdata.data.loginType=="facebook"?'http://graph.facebook.com/' + userdata.data.facebookId + '/picture?width=43&height=43' : 'https://plus.google.com/s2/photos/profile/' + userdata.data.googleId + "?sz=45";  
			document.getElementById("js-user-link").innerHTML = userdata.data.fullName;
			$('#js-user-link').append($('<img>').attr('src', imageURL));
			
			document.getElementById("js-user-link").setAttribute('style', 'display:"";');
			document.getElementById("login-dropdown-menu").setAttribute('style', 'display:"";');
			document.getElementById("js-login-link").setAttribute('style', 'display:none;');
			
			
			menuHeight = this.$('.js-fixed-section').height();
			menuWidth = this.$('.js-fixed-section').width();
			
			if(is_mobile){
				this.$('.js-left-side-menu').css({ left:- this.$('.js-left-side-menu').width()});
			}
			
			
			
			this.menulength = this.$('.js-menu').length;
			//Trying to make height responsive. Experimental. May need to throw this away.
			//this.makeResponsive();
			if(!this.router){
				this.router = AppRouterInstance = new AppRouter({view : this});
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
					
					var constructorArguments = {'moduleName':publishedData.clickedMenu,'el':publishedData['element']};
					constructorArguments['argumentsProvided'] = publishedData.argumentsProvided
					componentMapper[publishedData.clickedMenu].module.initialize(constructorArguments);
				});
			}else {
				$(publishedData['element']).show();
				if(componentMapper[publishedData.clickedMenu].module.reInitialize){
					var argumenstsProvided = publishedData.argumentsProvided;
					componentMapper[publishedData.clickedMenu].module.reInitialize.call(componentMapper[publishedData.clickedMenu].module, argumenstsProvided);
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
					/*left: $(window).width(),*/
					left: $('.js-left-side-menu').width(),
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
