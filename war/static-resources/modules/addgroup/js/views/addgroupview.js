define(function(require) {

	require('jquery');
	var Sandbox = require('sandbox');
	var FBAPI = require('fbapi');
	var GoogleAPi = require('googleapi');
	var login = require('components/login/login');
	var FormValidator = require("./../validator/addgroupvalidator");
	var FEMFriendManager = require('modules/friendmanager/friendmanager');
	require('http://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js');
	require('css!libraries/jquery-ui/css/themes/base/jquery.ui.autocomplete.css');
	require('css!../../css/addgroup.css');
	var userInfo = login.getInfo();

	var FEMAddGroupView = Sandbox.View.extend({
		initialize : function(options){
			this.start();
		},
		start : function(){
			this.render(userInfo);
			this.pluginInitializer();
			this.registerValidator();
			this.initializeSubComponents();
		},
		template : Handlebars.compile(require('text!./../../templates/addgrouptemplate.html')),
		render : function(userInfo){
			console.log('userInfo',userInfo);
			
			$(this.el).html(this.template());
			
			
			
			var loginType = userInfo.loginType;
			
			var userInfo = login.getInfo();
			
			
			
			this.$('.js-facebook-autocomplete').css('display', userInfo.facebook?'':'none');
			this.$('.js-facebook-login').css('display', !userInfo.facebook?'':'none');
			this.$('.js-google-autocomplete').css('display', userInfo.google?'':'none' );
			this.$('.js-google-login').css('display',  !userInfo.google?'':'none');
			
		},
		pluginInitializer : function(){
			var self=this;
			this.FBAuthToken=userInfo.facebook && userInfo.facebook.authToken;
			this.$('.js-facebook-friend-selector').autocomplete({
				source: (function(){
					var isDataObtained = false;
					var dataObtained = [];
					return function(request, add) {
						$this = $(this);
						var element = this.element;
						
						function filterData(data, query){
							var formatted = [];
							for(var i = 0; i< data.length; i++) {
								console.log(data[i]);
								console.log(data[i].name);
								if (data[i].name.toLowerCase().indexOf($(element).val().toLowerCase()) >= 0){
									formatted.push({
										label: data[i].name,
										value: data[i]
									});
								}
							}
							return formatted;
						}
					
						
						
						
						if(!isDataObtained){
							// Call out to the Graph API for the friends list
							$.ajax({
								url: 'https://graph.facebook.com/me/friends?method=get&access_token=' + login.getInfo().facebook.authToken + '&pretty=0&sdk=joey',
								dataType: "jsonp",
								success: function(response){
								    if(response.error && response.error.type==="OAuthException"){
								        self.doFacebookLogin();
								        return;
								    }
									var results = response;
									isDataObtained = true;
									dataObtained = results.data;
									// Filter the results and return a label/value object array  
									var formatted = filterData(results.data);
									add(formatted);
								}
							});
						} else {
							var formatted = filterData(dataObtained);
							add(formatted);
						}
					};
				}()),
				select: function(event, ui) {
					// Fill in the input fields
					//self.$('.js-friend-selector').val(ui.item.label);
					self.$('.js-facebook-friend-selector').val('').focus();
					var friendInfo = ui.item.value;
					var normalizedFriendInfo = {
						'fullName' : friendInfo.name,
						'name' : friendInfo.name,
						facebookId : friendInfo.id,
						loginType : 'facebook'
					};
					self.addFriendToGroup(normalizedFriendInfo);
					return false;
				},
				minLength:1
			});
			
			
			var googleAccessToken =  userInfo.google && userInfo.google.authToken;
			this.$('.js-google-friend-selector').autocomplete({
				source: (function(){
					var isGoogleDataObtained = false;
					var googleDataObtained = [];
					return function(request, add) {
						$this = $(this);
						var element = this.element;
						
						function filterData(data, query){
							var formatted = [];
							for(var i = 0; i< data.length; i++) {
								console.log(data[i]);
								console.log(data[i].name);
								if (data[i].title.$t.toLowerCase().indexOf($(element).val().toLowerCase()) >= 0)
									formatted.push({
										label: data[i].title.$t + "(" + data[i].email+ ")",
										value: data[i]
									});
							}
							return formatted;
						}
					
						
						if(!isGoogleDataObtained){
							// Call out to the Graph API for the friends list
							$.ajax({
								url: "https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=9999",
				                dataType: "jsonp",
				                headers: "GData-Version: 3.0",
				                data:{access_token:  login.getInfo().google.authToken},
								success: function(results){
									isGoogleDataObtained = true;
									googleDataObtained = _.filter(results.feed.entry, function(item){
										var returnValue = false;
										if(item.gd$email){
											for(var i = 0; i<item.gd$email.length; i++){
												if(item.gd$email[i].address.indexOf("gmail")!==-1){
													item.email = item.gd$email[i].address;
													return true;
												}
												
											}
										}
										return  returnValue
									});
									// Filter the results and return a label/value object array  
									var formatted = filterData(googleDataObtained);
									add(formatted);
								}, 
								error : function(xhr, errorText, error){
								    self.doGoogleLogin();
								    console.log(error);
								    console.log(errorText);
								}
							});
						} else {
							var formatted = filterData(googleDataObtained);
							add(formatted);
						}
					};
				}()),
				select: function(event, ui) {
					// Fill in the input fields
					//self.$('.js-friend-selector').val(ui.item.label);
					self.$('.js-google-friend-selector').val('').focus();
					
					var friendInfo = ui.item.value;
					var normalizedFriendInfo = {
						fullName : friendInfo.title.$t,
						name : friendInfo.title.$t,
						googleId : '',
						loginType : 'google',
						email : friendInfo.email,
					};
					
					self.addFriendToGroup(normalizedFriendInfo);
					return false;
				},
				minLength:1
			});
			this.$('span.ui-helper-hidden-accessible').hide();
		},
		initializeSubComponents : function(){
			var self=this;
			self.friendManager = FEMFriendManager.getInstance().initialize();
			self.friendCollection = new self.friendManager.friendCollection();
		},
		events : {
			'click .js-add-friend'						:	'eventAddFriend',
			'click .js-invite-friend'					:	'eventInviteFriend',
			'click .js-selected-friend-item-remove'		:	'eventRemoveSelectedFriend',
			'click .js-selected-friend-item-invite'		:	'eventInviteSelectedFriend',
			'click .js-save-group'						:	'eventSaveGroup',
			'click .new-expense-button'					: 	'showNewExpenseForm',
			'click .zocial.facebook'                    :   'doFacebookLogin',
			'click .zocial.google'                      :   'doGoogleLogin'
		},
		registerValidator : function(){
			FormValidator.initialize({'element':this.$(".js-add-group-form"),'errorWidth':'86%'});
		},
		renderSelectedFriends : function(friendModel){
			this.$('.js-selected-friends-list').append(this.friendManager.friendTemplate(friendModel));
		},
		addFriendToGroup : function(friendInfo){
			
			
			console.log('friendInfo',friendInfo);
			
			var info = {'fullName':friendInfo.fullName, 'name' :friendInfo.name,  facebookId : friendInfo.facebookId, loginType : friendInfo.loginType};
			
			this.$('.js-selected-friends').show();
			this.friendModel = new this.friendManager.friendModel(info);
			this.friendCollection.add(this.friendModel);
			this.renderSelectedFriends(this.friendModel);
		},
		eventInviteFriend : function(event){
			this.addFriendToGroup(this.$('.js-invite-friend-mail').val());
			this.$('.js-invite-friend-mail').val('');
		},
		eventRemoveSelectedFriend : function(event){
			var removeFriend=$(event.currentTarget).parent('.js-selected-friend-remove-container').find('.js-selected-friend-remove-name').html();
			$(event.currentTarget).parents('.js-selected-friend-item').remove();
			this.friendCollection.remove(this.friendCollection.where({name : removeFriend}));
		},
		eventInviteSelectedFriend : function(event){
			var removeFriend=$(event.currentTarget).parent('.js-selected-friend-remove-container').find('.js-selected-friend-remove-name').html();
			$(event.currentTarget).parents('.js-selected-friend-item').remove();
			//this.friendCollection.remove(this.friendCollection.where({name : removeFriend}));
		},
		eventSaveGroup : function(){
			var self = this;
			if(!$('.js-add-group-form').valid()){
				return;
			}
			this.model = new self.friendManager.friendModel({
				'groupName' 		: 	this.$('.js-group-name').val(),
				'members'	:	(function(){
				    var membersArray = [];
				    _.each(self.friendCollection.models, function(el){
				    	membersArray.push(el.attributes); 
				    });
				    membersArray.push(userInfo);
				    return membersArray;
				})(),
				'ownerId' : userInfo.userId
			});
			console.log('this.collection',this.collection);
			var addAjaxOptions = {
				url : '_ah/api/groupendpoint/v1/group',
				callback : this.groupAddedSuccessFully, 
				errorCallback : this.somethingBadHappend,
				context : this,
				data : this.model.attributes
			};
			showMask('Creating group...');
			Sandbox.doAdd(addAjaxOptions);
		},
		groupAddedSuccessFully : function(data){
			this.$('.js-success-message').show();
			this.$('.js-add-group-form').hide();
			this.newAddedGroupInfo = data;
			hideMask();
			
		},
		showNewExpenseForm : function(){
			Sandbox.publish('GROUP:SELECTED:NEW-EXPENSE', this.newAddedGroupInfo.groupId);
			Sandbox.publish('FEM:DESTROY:COMPONENT',{name : 'js-create-group'});
		},
		doFacebookLogin : function(){
			login.doFacebookLogin({userInfo : userInfo,context : this,  callback : this.reInitialize});
		},
		doGoogleLogin : function(){
			login.doGoogleLogin({userInfo : userInfo, context : this, callback : this.reInitialize});
		},
		reInitialize : function(userData){
			console.log('reinitialize create group view');
			
			var loginType = userData.loginType;
			
			
			this.$('.js-' + loginType + '-autocomplete').css('display', '');
			this.$('.js-' + loginType +'-login').css('display', 'none');
		}
		
	});
	return FEMAddGroupView;
});