define(function(require) {

	require('jquery');
	var Sandbox = require('sandbox');
	var FBAPI = require('fbapioauth');
	var GoogleAPi = require('googleapioauth');
	var login = require('components/login/login');
	var FormValidator = require("./../validator/addgroupvalidator");
	var FEMFriendManager = require('modules/friendmanager/friendmanager');
	require('libraries/jquery-ui/jquery.ui.autocomplete-amd');
	require('css!libraries/jquery-ui/css/themes/base/jquery.ui.autocomplete.css');
	require('css!../../css/addgroup.css');
	var userInfo = login.getInfo();
	
	
	function getAutosuggestOptions(data, query, allMembers, loginType){
		var formatted = [];
		for(var i = 0; i< data.length; i++) {
			if (loginType=="facebook" && data[i].name.toLowerCase().indexOf(query.toLowerCase()) >= 0){
				formatted.push({
					label: data[i].name,
					value: data[i]
				});
			}
			
			if (loginType=="google" &&data[i].title.$t.toLowerCase().indexOf(query.toLowerCase()) >= 0)
				formatted.push({
					label: data[i].title.$t + "(" + data[i].email+ ")",
					value: data[i]
			});
			
		}
		
		//TODO : Uncomment for adding support for adding members already available.
		/*if(allMembers){
			for(var index in allMembers){
				if(allMembers[index].fullName.toLowerCase().indexOf(query.toLowerCase()) >= 0){
					formatted.splice(0, 0, {
							label: allMembers[index].fullName + " : APP",
							value: allMembers[index],
							type : 'app'
					});
				}
			}
		}*/
		
		return formatted;
	}
	
	
	var FEMAddGroupView = Sandbox.View.extend({
		initialize : function(options){
			this.start(options);
			this.getGroups();
		},
		start : function(options){
			this.initializeSubComponents();
			this.render(userInfo, options.group);
			this.pluginInitializer();
			this.registerValidator();
		},
		template : Handlebars.compile(require('text!./../../templates/addgrouptemplate.html')),
		render : function(userInfo, group){
			
			$(this.el).html(this.template());
			var loginType = userInfo.loginType;
			var userInfo = login.getInfo();
			
			this.$('.js-facebook-autocomplete').css('display', userInfo.facebook?'':'none');
			this.$('.js-facebook-login').css('display', !userInfo.facebook?'':'none');
			this.$('.js-google-autocomplete').css('display', userInfo.google?'':'none' );
			this.$('.js-google-login').css('display',  !userInfo.google?'':'none');
			
			if(group){
				this.renderGroupData(group);
				this.group = group;
				this.mode = 'edit';
			} else {
				userInfo.imgUrl = userInfo.loginType==="facebook"?"http://graph.facebook.com/" + userInfo.facebookId + "/picture?width=43&height=43" : "https://plus.google.com/s2/photos/profile/" + userInfo.googleId + "?sz=45" 
				this.addFriendToGroup(userInfo);
				this.mode = 'add';
				this.group = {};
			}
		},
		renderGroupData : function(group){
			this.$('.js-group-name').val(group.groupName);
			for(var i=0; i<group.members.length;i++){
				var member = group.members[i];
				member.name = member.fullName;
				this.addFriendToGroup(member);
			}
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
									var formatted = getAutosuggestOptions(results.data, $(element).val(), self.allMembers, "facebook");
									add(formatted);
								}
							});
						} else {
							var formatted = getAutosuggestOptions(dataObtained, $(element).val(), self.allMembers, "facebook");
							add(formatted);
						}
					};
				}()),
				select: function(event, ui) {
					// Fill in the input fields
					//self.$('.js-friend-selector').val(ui.item.label);
					self.$('.js-facebook-friend-selector').val('').focus();
					var friendInfo = ui.item.value;
					
					
					if(friendInfo.userId){
						normalizedFriendInfo = friendInfo;
						self.addFriendToGroup(normalizedFriendInfo);
					} else {
						$.ajax({
							url: 'https://graph.facebook.com/' + friendInfo.id +'?method=get&access_token=' + login.getInfo().facebook.authToken + '&pretty=0&sdk=joey',
							dataType: "jsonp",
							success : function(response){
								var normalizedFriendInfo = {
										'fullName' : friendInfo.name,
										'name' : friendInfo.name,
										facebookId : friendInfo.id,
										loginType : 'facebook',
										facebookEmail : response.username + "@facebook.com",
										firstName : response.first_name,
										lastName : response.last_name,
										imgUrl : "http://graph.facebook.com/" + friendInfo.id + "/picture?width=43&height=43" 
									};
									self.addFriendToGroup(normalizedFriendInfo);
									self.$('.js-add-group-form').valid();
							}
						});
					}
					return false;
				},
				minLength:1,
				focus : function(event, ui){
					this.value = ui.item.label;
					event.preventDefault();
				}
			});
			
			
			var googleAccessToken =  userInfo.google && userInfo.google.authToken;
			this.$('.js-google-friend-selector').autocomplete({
				source: (function(){
					var isGoogleDataObtained = false;
					var googleDataObtained = [];
					return function(request, add) {
						$this = $(this);
						var element = this.element;
						
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
									var formatted = getAutosuggestOptions(googleDataObtained, $(element).val(), self.allMembers,  "google");
									add(formatted);
								}, 
								error : function(xhr, errorText, error){
								    self.doGoogleLogin();
								    console.log(error);
								    console.log(errorText);
								}
							});
						} else {
							var formatted = getAutosuggestOptions(googleDataObtained, $(element).val(), self.allMembers, "google");
							add(formatted);
						}
					};
				}()),
				select: function(event, ui) {
					// Fill in the input fields
					//self.$('.js-friend-selector').val(ui.item.label);
					self.$('.js-google-friend-selector').val('').focus();
					
					var friendInfo = ui.item.value;
					var normalizedFriendInfo = null;
					if(friendInfo.userId){
						normalizedFriendInfo = friendInfo;
					} else {
						//var probableImageURL = friendInfo.email.substr(0, friendInfo.email.indexOf("@"))
						normalizedFriendInfo = {
							fullName : friendInfo.title.$t,
							name : friendInfo.title.$t,
							googleId : '',
							loginType : 'google',
							email : friendInfo.email/*,
							imgUrl : "https://plus.google.com/s2/photos/profile/" +probableImageURL + "?sz=45" */
						};
					}
					
					self.addFriendToGroup(normalizedFriendInfo);
					self.$('.js-add-group-form').valid();
					return false;
				},
				minLength:1,
				focus : function(event, ui){
					this.value = ui.item.label;
					event.preventDefault();
				}
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
			var isDuplicate = _.find(this.friendCollection.models, function(friend){
				return (friendInfo.loginType=="facebook" && friendInfo.facebookId==friend.attributes.facebookId )||(friendInfo.loginType=="google" && friendInfo.email==friend.attributes.email);
			});
			
			if(isDuplicate){
				alert('This member is already in the list.');
				return;
			}
			
			this.$('.js-selected-friends').show();
			this.friendModel = new this.friendManager.friendModel(friendInfo);
			this.friendCollection.add(this.friendModel);
			this.renderSelectedFriends(this.friendModel);
			
			if(this.friendCollection.size()>1){
				this.$('.min2members').val('OK');
			} else {
				this.$('.min2members').val('');
			}
			
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
			
			var groupData = null;
			/*if(this.mode==='add'){*/
				groupData = {
						'members'	:	(function(){
							var membersArray = [];
							_.each(self.friendCollection.models, function(el){
								membersArray.push(el.attributes); 
							});
							return membersArray;
						})(),
						'ownerId' : userInfo.userId,
						groupType : 'room'
				};
				_.extend(this.group, groupData);
			/*}*/ /*else {
				groupData = 
			}*/
			
			_.extend(this.group, {'groupName' : this.$('.js-group-name').val()});
			
			
			console.log('this.collection',this.collection);
			var addAjaxOptions = {
				url : '_ah/api/groupendpoint/v1/group',
				callback : this.groupAddedSuccessFully, 
				errorCallback : this.somethingBadHappend,
				context : this,
				data : this.group
			};
			showMask('Creating group...');
			if(this.mode=='edit'){
				Sandbox.doUpdate(addAjaxOptions);
			} else {
				Sandbox.doAdd(addAjaxOptions);
			}
		},
		groupAddedSuccessFully : function(data){
			this.$('.js-success-message').show();
			this.$('.js-add-group-form').hide();
			this.newAddedGroupInfo = data;
			hideMask();
			
		},
		showNewExpenseForm : function(){
			Sandbox.publish('GROUP:SELECTED:NEW-EXPENSE', this.newAddedGroupInfo);
			//Sandbox.publish('FEM:DESTROY:COMPONENT',{name : 'js-create-group'});
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
		},
		getGroups : function(){
			var self = this;
			var data = {
				url : '_ah/api/userendpoint/v1/user/' + userInfo.userId + '/group/',
				callback : function(response){
					
					var groups = response.items;
					self.groups = response;
					var allMembers = {};
					self.allMembers = allMembers;
					var groupMap = self.groupMap = {};
					for(var groupIndex in groups){
						var groupInfo = groups[groupIndex];
						for(var memberIndex in groupInfo.members ){
							allMembers[groupInfo.members[memberIndex].userId] = groupInfo.members[memberIndex];
						}
						groupMap[groupInfo.groupId] = groupInfo;
					}
					
				},
				context : this,
				dataType: 'json'
			};
			
			Sandbox.doGet(data);
		}
		
	});
	return FEMAddGroupView;
});