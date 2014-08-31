define(function(require) {

	var Sandbox = require('sandbox');
	var SelectGroup = require('modules/selectgroup/selectgroup');
	var CSS = require('css!./../../css/newexpense.css');
	var JqueryTouch = require('libraries/jquery-mobile/jquery.mobile.touch.min');
	var memberPayTemplate = require('text!./../../templates/member-pay.html');
	var friendRowTemplate = require('text!./../../templates/friendrow.html');
	var memberExpenseTemplate = require('text!./../../templates/member-expense.html');
	var ExpenseModel = require('./../models/expensemodel');
	var FormValidator = require("./../validator/newexpensevalidator");
	var user = login = require('components/login/login');
	var ExpenseUtility = require('modules/expenseutiliy/expenseutility');
	require('libraries/jquery-ui/jquery.ui.autocomplete-amd');
	require('css!libraries/jquery-ui/css/themes/base/jquery.ui.autocomplete.css');


	var expenseInputCounter = 0;
	var dummyIdCounter = 0;
	
	//TODO : If miraculously user is able to proceed to form enter details and  sends the add expense withuot this request getting completed this user will not have the facebook email.
	function updateFriendInfo(friendInfo){
		if(friendInfo.loginType=="facebook"){
			$.ajax({
				url: 'https://graph.facebook.com/' + friendInfo.facebookId +'?method=get&access_token=' + login.getInfo().facebook.authToken + '&pretty=0&sdk=joey',
				dataType: "jsonp",
				success : function(response){
					
					friendInfo.facebookEmail = response.username + "@facebook.com";
					
					/*var normalizedFriendInfo = {
							'fullName' : friendInfo.name,
							'name' : friendInfo.name,
							facebookId : friendInfo.id,
							loginType : 'facebook',
							facebookEmail : response.username + "@facebook.com",
							firstName : response.first_name,
							lastName : response.last_name,
							imgUrl : "http://graph.facebook.com/" + friendInfo.id + "/picture?width=43&height=43" 
					};*/
				}
			});
		}
	}
	
	function getAutosuggestOptions(data, query){
		var formatted = [];
		for(var i = 0; i< data.length; i++) {
			if(data[i].fullName.toLowerCase().indexOf(query.term.trim().toLowerCase())!=-1){
				formatted.push({
					label: data[i].fullName,
					value: data[i]
				});
			}
			
		}
		
		formatted.sort(function(a, b){
			var orderA = a.label.toLowerCase().indexOf(query.term.toLowerCase())==0 && 1;
			var orderB = b.label.toLowerCase().indexOf(query.term.toLowerCase())==0 && 1;
			return orderB - orderA;
		});
		
		if(query.term.trim()!=""){
			formatted.push({
				label : 'Add "' + query.term.trim()  +'" as non social friend.',
				value : {
					fullName : query.term.trim(),
					loginType : 'non-social'
				}
			});
		}
		
		return formatted;
	}
	
	
	function normalizeGoogleUserData(googleData){
		var googleDataObtained = _.filter(googleData.feed.entry, function(item){
			var returnValue = false;
			if(item.gd$email){
				for(var i = 0; i<item.gd$email.length; i++){
					if(item.gd$email[i].address.indexOf("gmail")!==-1){
						item.email = item.gd$email[i].address;
						return true;
					}
					
				}
			}
			return  returnValue;
		});
		
		var retArray = [];
		for(var i = 0; i<googleDataObtained.length; i++){
			var friendInfo = googleDataObtained[i];
			var probableImageURL = friendInfo.email.substr(0, friendInfo.email.indexOf("@"));
			var normalizedFriendInfo = {
				fullName : friendInfo.title.$t || friendInfo.email,
				name : friendInfo.title.$t,
				googleId : '',
				loginType : 'google',
				email : friendInfo.email,
				imgUrl : "https://plus.google.com/s2/photos/profile/" +probableImageURL + "?sz=45" ,
				userId :'dummy-' + dummyIdCounter++
			};
			
			retArray.push(normalizedFriendInfo);
			
		}
		return retArray;
		
		
	}
	
	function normalizeFacebookUserData(facebookData){

		var facebookDataObtained = facebookData.data;
		var retArray = [];
		for(var i = 0; i<facebookDataObtained.length; i++){
			var friendInfo = facebookDataObtained[i];
			var normalizedFriendInfo = {
					fullName : friendInfo.name,
					name : friendInfo.name,
					facebookId : friendInfo.id,
					loginType : 'facebook',
					/*facebookEmail : friendInfo.id + "@facebook.com",*/
					firstName : friendInfo.first_name,
					lastName : friendInfo.last_name,
					imgUrl : "http://graph.facebook.com/" + friendInfo.id + "/picture?width=43&height=43" ,
					userId :'dummy-' + dummyIdCounter++
			};

			retArray.push(normalizedFriendInfo);

		}
		return retArray;
	}
	
	var NewExpenseView = Sandbox.View.extend({
		initialize : function(options) {
			this.options = _.extend({
			//defaults here
			}, options);
			this.render();
			this.registerSubscribers();
			this.start();
			
		},
		selectedFriends : [user.getInfo()],
		friendArr : [],
		totalExpense : 0,
		template : Handlebars.compile(require('text!./../../templates/newexpense.html')),
		render : function(data) {
			$(this.el).html(this.template(data));
		},
		events : {
			'keyup input.js-pay-input' : 'divideExpense',
			'keyup input.js-contribution-input' : 'adjustExpenses',
			'keyup input.js-current-user-pay-input' : 'divideExpenseCurrentUser',
			'keyup input.js-between-two-input' : 'populatePayAndContribInputs',
			'blur input.js-pay-input' : 'divideExpense',
			'blur input.js-contribution-input' : 'adjustExpenses',
			'blur input.js-current-user-pay-input' : 'divideExpenseCurrentUser',
			'blur input.js-between-two-input' : 'populatePayAndContribInputs',
			'input input.js-pay-input' : 'divideExpense',
			'input input.js-contribution-input' : 'adjustExpenses',
			'input input.js-current-user-pay-input' : 'divideExpenseCurrentUser',
			'input input.js-between-two-input' : 'populatePayAndContribInputs',
			'click .js-more-payers' : 'eventShowMorePayers',
			'click .js-lock-button' : 'eventLockExpense',
			'click .js-select-expense' : 'toggleExpense',
			'click .js-save-expense' : 'eventSaveExpense',
			'change .js-division-type' : 'eventShowMembersToDivide',
			'click .js-allmembers' : 'toggleAllMembers',
			'click .next-button' : 'showExpenseWithoutGroupForm',
			'click .add-group-button' : 'showSelectGroup',
			'click .back-to-without-group' : 'showNonGroupForm',
			'focus input' : 'makeInputVisible',
			'click .facebook-button' : 'doFacebookLogin',
			'click .google-button' : 'doGoogleLogin',
			'click .add-friend' : 'doAddFriend',
			'click .cancel-add-friend' : 'cancelAddFriend',
/*			'change .select-between-two' : 'showFormForTwo',*/
			'change .select-between-two' : 'populatePayAndContribInputs'
			
		},
		registerValidator : function(){
			FormValidator.initialize({'element':this.$(".js-add-expense-form"),'errorWidth':'86%'});
		},
		reInitialize : function(){
			this.$('.js-new-expense-form').hide();
			this.$('.js-success-message').hide();
			this.objSelectGroup.reInitialize();
			this.$('.js-select-group-container').show().css({top : -this.$('.js-select-group-container').height()}).hide();
			this.$('.js-friend-selector-container').show().css({top:0});
			
			this.$('.js-friend-selector-container').show();
			this.selectedFriends = [user.getInfo()];
			this.renderFriendsSelected();
		},
		start : function(){
			if(this.objSelectGroup){
				Sandbox.destroy(this.objSelectGroup);
			} else {
				this.objSelectGroup = SelectGroup.getInstance();
			}
			
			this.$('.new-friend').removeClass('show-modal');
			this.$('.js-new-expense-form').hide();
			this.$('.js-success-message').hide();
			
			this.populateFriends();
			
			
			this.objSelectGroup.initialize({el:this.$('.js-select-group'), 'owner':'NEW-EXPENSE'});
			this.$('.js-friend-selector-container').show().css({top:0});
			this.$('.js-select-group-container').show().css({top : -this.$('.js-select-group-container').height()}).hide();


			this.renderFriendsSelected();
		},
		populateFriends : function(){
			var self = this;
			this.populateGoogleFriends();
			this.populateFacebookFriends();
			this.populateAppFriends();
			
			this.$('.js-friends-autocomplete').autocomplete({
				source : function(request, response){
					response(getAutosuggestOptions(self.friendArr, request));
				}, 
				select: function(event, ui) {
					
					var friendInfo = ui.item.value;
					
					if(friendInfo.loginType==='non-social'){
						self.$('.new-friend').find('.full-name').val(friendInfo.fullName);
						self.$('.new-friend').addClass('show-modal');
						event.preventDefault();
						return;
					}
					
					this.value='';
					if(self.selectedFriends.indexOf(friendInfo)==-1){
						self.selectedFriends.push(friendInfo);
						updateFriendInfo(friendInfo);
					}
					self.renderFriendsSelected();
					event.preventDefault();
				},
				autoFocus: true,
				minLength:0,
				focus : function(event, ui){
					event.preventDefault();
				}
			}).focus(function() {
    				$(this).autocomplete("search", $(this).val());
			}).data("ui-autocomplete")._renderItem = function (ul, item) {
				//ul.addClass(item.loginType);
    			return $("<li></li>")
				.addClass(item.value.loginType || "")
    				.append("<a href='#'>" + item.label + "</a>")
    				.data("ui-autocomplete-item", item)
    				.appendTo(ul);
			};
			
		},
		cancelAddFriend : function(event){
			
		},
		doAddFriend :  function(event){
			var friendName = this.$('.full-name').val().trim();
			var email = this.$('.email').val().trim();
			var loginType = null; 
			if(email){
				loginType = "email";
			} else {
				loginType = "offline";
			}
			var friendInfo = {
					fullName : friendName,
					email :  email,
					loginType :loginType,
					userId :'dummy-' + dummyIdCounter++
			}
			this.selectedFriends.push(friendInfo);
			this.renderFriendsSelected();
			
			this.$('.js-friends-autocomplete').val('');
		},
		populateFacebookFriends : function(){
			var self = this;
			if(login.getInfo().facebook){
				
				$.ajax({
					url: 'https://graph.facebook.com/me/friends?method=get&access_token=' + login.getInfo().facebook.authToken + '&pretty=0&sdk=joey',
					dataType: "jsonp",
					success: function(response){
						
						if(response.error && response.error.type==="OAuthException"){
							self.doFacebookLogin();
							return;
						}
						self.renderFacebookData(response);
						
						console.log(response);
					}
				});
				self.$('.facebook-button').hide();
				self.updateInputPlaceholder();
			}
		},
		populateGoogleFriends : function(){
			var self = this;
			if(login.getInfo().google){
				
				$.ajax({
					url: "https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=9999",
					dataType: "jsonp",
					headers: "GData-Version: 3.0",
					data:{access_token:  login.getInfo().google.authToken},
					success: function(results){
						self.renderGoogleData(results);
					}, 
					error : function(xhr, errorText, error){
						self.doGoogleLogin();
					}
				});
				self.$('.google-button').hide();
				self.updateInputPlaceholder();

			}
		},
		populateAppFriends : function(){
			var self = this;
			Sandbox.doGet({
				url : '_ah/api/userendpoint/v1/user/' + login.getInfo().userId +'/group',
				callback : function(response){
					self.renderAppData.call(self, response);
				},
				loaderContainer : this.$('.js-owers,.js-payers'),
				cached : false 
			});
		},
		renderAppData : function(response){
			var groups = response.items;
			
			if(groups){
				var allMembers = {};
				var membersArray = [];
				for ( var i = 0; i < groups.length; i++) {
					var group = groups[i];
					var members = group.members;
					var groupMembersMap = {};
					
					for ( var memberCount = 0; memberCount < members.length; memberCount++) {
						var member = members[memberCount];
						groupMembersMap[member.userId] = member;
					}
					_.extend(allMembers, groupMembersMap);
				}
				
				for ( var memberId in allMembers) {
					membersArray.push(allMembers[memberId]);
				}
				//console.log('allMembers', membersArray);
				this.addFriends(membersArray);
			}
		},
		updateInputPlaceholder : function(){
			var loginAvailable = [];
			login.getInfo().google?loginAvailable.push(' Google'):'';
			login.getInfo().facebook?loginAvailable.push(' Facebook'):'';
			this.$('.js-friends-autocomplete').attr('placeholder', 'Select friends from' + loginAvailable.join(','));
		},
		renderFriendsSelected : function (){
			var self = this;
			var htmlContain= '';
			var friendRowTemplateFn = Handlebars.compile(friendRowTemplate);
			for(var i=0;i<self.selectedFriends.length;i++){
				var friendInfo		= self.selectedFriends[i];
				var html = friendRowTemplateFn(friendInfo);
				htmlContain+=html;
			}	
			this.$('.js-friend-selector').html(htmlContain);	
		},
		doFacebookLogin : function(){
			login.doFacebookLogin({userInfo : login.getInfo(),context : this,  callback : this.populateFacebookFriends});
		},
		doGoogleLogin : function(){
			login.doGoogleLogin({userInfo : login.getInfo(), context : this, callback : this.populateGoogleFriends});
		},
		renderGoogleData : function(response){
			var friendArr = normalizeGoogleUserData(response);
			this.addFriends(friendArr);
		}, 
		renderFacebookData : function(response){
			var friendArr = normalizeFacebookUserData(response);
			this.addFriends(friendArr);
		},
		addFriends : function(friendArr){
			Array.prototype.push.apply(this.friendArr, friendArr);
			this.friendArr.sort(function(a, b){
				return a.fullName > b.fullName;
			});
			/*this.renderFriends();*/
		},
		/*renderFriends : function(){
			for (var i = 0; i < this.friendArr.length; i++) {
				var friendInfo = this.friendArr[i];
				this.$('.js-friend-selector').append($('<div class="small-12 large-3 medium-4 columns" >').html(friendInfo.fullName));
			}
		},*/
		registerSubscribers : function(){
			Sandbox.subscribe('GROUP:SELECTED:NEW-EXPENSE', this.showNewExpenseForm, this);
			                   
		},
		//TODO : This function can be deprecated. Latest data is available at back end.
		dataRefresh : function(response){
			this.group = response;
		},
		showNewExpenseForm : function(group, expense){
				
			var currentAction = "New Xpense";
			
			if(group.groupId){
				var data = {
						url : '_ah/api/userendpoint/v1/user/' + user.getInfo().userId + '/group/' + group.groupId,
						callback : this.dataRefresh,
						context : this,
						dataType: 'json',
						loaderContainer : this.$('.groups-container')
				};
				this.groupDataObtained = Sandbox.doGet(data);
				currentAction += " in " + group.groupName + " group";
				//TODO : Global variable from femview.js. If you are reading this. Go kill Vishwanath.
				AppRouterInstance.navigate('#newexpenseform/group');

			} else {
				currentAction += " with "
				for(var index in group.members){
					currentAction += ((group.members[index].firstName || group.members[index].fullName) + ", "); 
				}
				this.groupDataObtained = $.Deferred();
				this.groupDataObtained.resolve();
				AppRouterInstance.navigate('#newexpenseform/withoutgroup');
			}
			Sandbox.publish('FEM:CURRENT_ACTION_CHANGED', currentAction);
			this.group = group;
			
		    var self = this;
			this.$('.js-select-group-container').hide();
			this.$('.js-friend-selector-container').hide();
			this.$('.js-new-expense-form').show();
			
			
			var today = new Date();
			var dateStr = 1900+today.getYear() + '-' + ((today.getMonth()+1)>=10?today.getMonth()+1 : '0' +(today.getMonth()+1)) +'-' + (today.getDate()>=10?today.getDate() : '0' +today.getDate());
			this.$('.js-expense-date').attr('max', dateStr).val(dateStr);
			
			function normalize(data){
				for ( var i = 0; i < data.members.length; i++) {
					var d = data.members[i];
					d.fullName = d.fullName || (d.firstName && d.lastName && d.firstName + ' ' + d.lastName) || '';
				}
				return data;
			}
			
			group = normalize(group);
			
			//Sorting and splicing user to the first index
			group.members = _.sortBy(group.members, function(member){ return member.fullName.toLowerCase(); });
			var userList = $.grep(group.members , function(member){
				return member.userId == user.getInfo().userId;
			});
			var userIndex = group.members.indexOf(userList[0]);
			group.members.splice(userIndex, 1);
			group.members.splice(0, 0, userList[0]);
				
			this.$('.select-between-two').val('split');
			this.$('.between-two-ip-container').hide();
			this.$('.between-two-options').hide();
			this.$('.split-form').show();
			this.$('.js-between-two-input').val('');
			
			this.$('.js-all-payers').show();
			this.$('.js-included-members').show();

			this.$('.js-current-user-pay-input').show().val('');
			this.$('.js-more-payers').show();
			this.$('.user-paid-row').show();
			
			this.$('.js-division-type').val('all');
			
			
			this.createPayersSection(group.members);
			this.createMembersSection(group.members);
			
			
			this.$('.carousel').each(function(index, el){
				self.setCarousel(self.$(el));
			});
			
			this.$('.js-all-payers').hide();
			this.$('.js-included-members').hide();
			
			
			
			
			if(group.members.length===2){
				this.populateBetweenTwoOptions(group.members);
				this.$('.between-two-options').show();
				this.$('.between-two-ip-container').show();
				this.$('.split-form').hide();
			}

			if(expense){
				this.populateExpenseData(expense);
				this.oldObjExpenseModel = new ExpenseModel(expense);
				this.eventShowMorePayers();
			}
			
			this.registerValidator();
		},
		populateBetweenTwoOptions : function(members){
			var currentUser = user.getInfo();
			var otherUser = members[0].userId==currentUser.userId?members[1]:members[0];
			this.$('.other-owe').text(otherUser.fullName + " owes You");
			this.otherUser = otherUser;
			this.user = currentUser;
			this.$('.user-owe').text("You owe "+ otherUser.fullName);
			
			this.$('.select-between-two').val('other-owe');
			this.$('.select-between-two').trigger('click');
		},
		/*showFormForTwo : function(){
			var $payInputs = this.$('.js-pay-input').not('.js-current-user-pay-input');
			var $contributionInputs = this.$('.js-contribution-input').val(0);
			var value = this.$('.js-between-two-input').val();
			
			var selectedOption = this.$('.select-between-two').val();
			if("split"!==selectedOption){
				$payInputs.val(0);
				$contributionInputs.val(0);
				this.$('.between-two-ip-container').show();
				this.$('.split-form').hide();
				if("other-owe"==selectedOption){
					$($payInputs[0]).val(value);
					$($contributionInputs[1]).val(value);
				} else if("user-owe"==selectedOption){
					$($payInputs[1]).val(value)
					$($contributionInputs[0]).val(value);
				} 
			} else {
				this.$('.between-two-ip-container').hide();
				this.$('.split-form').show();
				this.divideExpense();
			}
		},*/
		populateBetweenTwoInput : function(){
			var selectedOption = this.$('.select-between-two').val();
			var placeholderText = selectedOption=="other-owe"?"Amount paid by You"  : "Amount paid by " + this.otherUser.fullName;
			this.$('.js-between-two-input').attr('placeholder', placeholderText);
		},
		populateExpenseData : function(expense){
			var payersSection = this.$('.js-payers');
			var includedMembersSection = this.$('.js-included-members');
			
			var listPayersInfo = expense.listPayersInfo;
			for(var i=0; i<listPayersInfo.length; i++){
				payersSection.find('.' + listPayersInfo[i].userId).val(listPayersInfo[i].amount);
			}
			var listIncludeMemberInfo = expense.listIncludeMemberInfo;
			for(var i=0; i<listIncludeMemberInfo.length; i++){
				includedMembersSection.find('.' + listIncludeMemberInfo[i].userId).val( listIncludeMemberInfo[i].amount);
			}
			
			
			this.$('.js-expense-name').val(expense.name);
			var expenseDate = new Date(expense.date);
			var year = expenseDate.getYear()+1900;
			var month = expenseDate.getMonth()+1>9?expenseDate.getMonth()+1 : "0" + (expenseDate.getMonth()+1);
			var day =  expenseDate.getDate()>9?expenseDate.getDate() : "0" + (expenseDate.getDate());
			var date = year +"-" + month +"-" + day; 
			this.$('.js-expense-date').val(date);
			this.$('.js-expense-type').val(expense.type);
			
			if(listPayersInfo.length==1 && listIncludeMemberInfo.length==1 && expense.iou.length==1){
				var currentUser = user.getInfo();
				var type = null;
				if(listPayersInfo[0].userId===currentUser.userId){
					type = "other-owe";
				} else {
					type = "user-owe"
				}
				this.$('.select-between-two').val(type)
				this.$('.js-between-two-input').val(listPayersInfo[0].amount)
				
			} else {
				this.$('.between-two-options').hide()
				this.$('.split-form').show();
				
				
			}
			
			
		},
		createPayersSection : function(groupMembers){
			var payersContainer = this.$('.js-payers').html('');
			var payerContentTemplate = Handlebars.compile(memberPayTemplate);
			
			var itemContainer = null;
			for ( var i = 0; i < groupMembers.length; i++) {
				if(i%5==0){
					itemContainer = $('<div class=item>');
					payersContainer.append(itemContainer);
				}
				
				
				var groupMember = groupMembers[i];
				groupMember.inputNumber = expenseInputCounter++;
				
				itemContainer.append(payerContentTemplate(groupMember));

			}
			
			var pages = payersContainer.find('.item');
			if(pages.length>1){
				var navigator = $('<div class="row js-navigator">');
				navigator.append($('<div class="small-12 columns next text-right"><span class=" button tiny radius navigation">Next</span></div>'));
				$(pages[0]).append(navigator);
				
				pages.filter(function(index){return index !=0 && index!=pages.size()-1;}).each(function(index, el){
					var navigator = $('<div class="row js-navigator">');
					navigator.append($('<div class="small-6 columns previous"><span class=" button tiny radius navigation">Previous</span></div>'));
					navigator.append($('<div class="small-6 columns next text-right"><span class=" button tiny radius navigation">Next</span></div>'));
					$(el).append(navigator);
				});
				
				var navigator = $('<div class="row js-navigator">');
				navigator.append($('<div class="small-12 columns previous"><span class=" button tiny radius navigation">Previous</span></div>'));
				$(pages[pages.size()-1]).append(navigator);
				
			}
		},
		createMembersSection : function(groupMembers){
			var payersContainer = this.$('.js-included-members').html('');
			var payerContentTemplate = Handlebars.compile(memberExpenseTemplate);
			
			var itemContainer = null;
			for ( var i = 0; i < groupMembers.length; i++) {
				if(i%5==0){
					itemContainer = $('<div class=item>');
					payersContainer.append(itemContainer);
				}
				var groupMember = groupMembers[i];
				groupMember.inputNumber = expenseInputCounter++;
				
				itemContainer.append(payerContentTemplate(groupMember));
				
			}
			
			var pages = payersContainer.find('.item');
			if(pages.length>1){
				var navigator = $('<div class="row js-navigator">');
				navigator.append($('<div class="small-12 columns next text-right"><span class=" button tiny radius navigation">Next</span></div>'));
				$(pages[0]).append(navigator);
				
				pages.filter(function(index){return index !=0 && index!=pages.size()-1;}).each(function(index, el){
					var navigator = $('<div class="row js-navigator">');
					navigator.append($('<div class="small-6 columns previous"><span class=" button tiny radius navigation">Previous</span></div>'));
					navigator.append($('<div class="small-6 columns next text-right"><span class=" button tiny radius navigation">Next</span></div>'));
					$(el).append(navigator);
				});
				
				var navigator = $('<div class="row js-navigator">');
				navigator.append($('<div class="small-12 columns previous"><span class=" button tiny radius navigation">Previous</span></div>'));
				$(pages[pages.size()-1]).append(navigator);
				
			}
		},
		//TODO : To put this in jquery plugin or component
		setCarousel : function(element){
			var isMobile = false;
			//TODO : Put this in some common place
			if( $('.is-mobile').css('display') == 'none' ) {
		        isMobile = true;      
		    }
			
			var parts = !isMobile?2:1;
			$(element).children().width(($(element).width()/parts)-20);
			$(element).children().each(function(index, el){
			     $(el).css({'margin-left':$(el).width()*index});
			});
			
			var showNextPage = function(){
				var pageIndex = $.makeArray($(element).children()).indexOf($(this).parents('.item')[0]);
				pageIndex +=1;
				$(element).children().each(function(index, el){
				     $(el).animate({'margin-left':$(el).width()*index - pageIndex*$(el).width()});
				});
			};
			$(element).find('.next').click(showNextPage);
			
			var showPreviousPage = function(){
				var pageIndex = $.makeArray($(element).children()).indexOf($(this).parents('.item')[0]);
				pageIndex -=1;
				$(element).children().each(function(index, el){
				     $(el).animate({'margin-left':$(el).width()*index - pageIndex*$(el).width()});
				});
			};
			$(element).find('.previous').click(showPreviousPage);
			
			$(element).height(function(){
				var totalHeight = 0;
				$($(element).find('.item')[0]).children().each(function(index, el){
					totalHeight += $(el).height();
				});
				return totalHeight;
			}());
			
			
			$(element).find('.item')
			.swipeleft(function(event){
				var pageIndex = $.makeArray($(element).children()).indexOf(this);
				pageIndex=pageIndex+1!=$(element).children().size()?pageIndex+1:pageIndex;
				$(element).children().each(function(index, el){
				     $(el).animate({'margin-left':$(el).width()*index - pageIndex*$(el).width()});
				});
				event.stopPropagation();
			})
			.swiperight(function(event){
				var pageIndex = $.makeArray($(element).children()).indexOf(this);
				pageIndex =pageIndex!=0?pageIndex-1:pageIndex;
				$(element).children().each(function(index, el){
				     $(el).animate({'margin-left':$(el).width()*index - pageIndex*$(el).width()});
				});
				event.stopPropagation();
			});
			
		},
		divideExpenseCurrentUser : function(event){
			this.$('.js-payers').find('input').first().val($(event.currentTarget).val());
			this.divideExpense();
		},
		divideExpense : function(){
			console.time('divideExpense');
			var self = this;
			this.setDynamicHeight();
			
			//Commenting realtime validation as it hampers performance.
			/*if(!self.$('.js-add-expense-form').valid()){
				return;
			}*/
			
			
			
			var payInputs =  this.$('.js-payers').find('input.js-pay-input');
			var totalPayment = 0;
			
			payInputs.each(function(index, el){
				totalPayment += Math.abs($(el).val());
			});
			this.totalExpense = totalPayment;
			
			
			var $includedMembers=this.$('.js-included-members');
			var lockedInputs = $includedMembers.find('input.js-contribution-input.locked');
			var lockedExpense = 0;
			
			lockedInputs.each(function(index, el){
				lockedExpense += Math.abs($(el).val());
			});
			
			var expenseToDivide = totalPayment - lockedExpense;
			var contributionInputs = $includedMembers.find('input.js-contribution-input:not(.locked)');
			var dividedShare = (expenseToDivide/contributionInputs.length).toFixed(2);
			//contributionInputs.val(dividedShare!=="NaN"?dividedShare : '');
			
			var remaniningAmount = expenseToDivide;
			contributionInputs.each(function(index, el){
				$(el).val(dividedShare);
				remaniningAmount-=dividedShare;
			});
			
			contributionInputs.last().val((parseFloat(dividedShare)+parseFloat(remaniningAmount)).toFixed(2));
			
			
			console.timeEnd('divideExpense');
		},
		adjustExpenses : function(event){
			console.time('adjustExpenses');
			var self = this;
			
			
			this.setDynamicHeight();
			
			var $includedMembers=this.$('.js-included-members');
			var contributionInputs = $includedMembers.find('input.js-contribution-input:not(.locked)').not(event.currentTarget);
			var lockedInputs = $includedMembers.find('input.js-contribution-input.locked').not(event.currentTarget);
			var lockedExpense = 0;
			lockedInputs.each(function(index, el){
				lockedExpense += Math.abs($(el).val());
			});
			
			var totalPayment = 0;
			
			var payInputs =  this.$('.js-payers').find('input.js-pay-input');
			payInputs.each(function(index, el){
				totalPayment += Math.abs($(el).val());
			});
			this.totalExpense = totalPayment;
			
			var expenseToDivide = this.totalExpense - lockedExpense - $(event.currentTarget).val();
			
			
			var dividedShare = (expenseToDivide/contributionInputs.length).toFixed(2);
			contributionInputs.val(dividedShare!=="NaN"?dividedShare : '');
			
			//Commenting realtime validation as it hampers performance.
			/*var valid= true;//;
			if(!self.$('.js-add-expense-form').valid()){
				this.setDynamicHeight();
				return;
			}*/
			
			
			var remaniningAmount = expenseToDivide;
			contributionInputs.each(function(index, el){
				$(el).val(dividedShare);
				remaniningAmount-=dividedShare;
			});
			
			contributionInputs.last().val((parseFloat(dividedShare)+parseFloat(remaniningAmount)).toFixed(2));
			
			this.$(event.currentTarget).
			parents('.js-expense-div').
			addClass('locked').
			find('input').
			addClass('locked').
			parents('.js-expense-div').
			find('.js-lock-button').
			removeClass('foundicon-lock').
			addClass('foundicon-unlock');
			console.timeEnd('adjustExpenses');
		},
		eventLockExpense : function(event){
			if(this.$(event.currentTarget).parents('.js-expense-div').hasClass('selected')){
				return;
			}
			
			this.$(event.currentTarget).
			toggleClass('foundicon-lock').
			toggleClass('foundicon-unlock').
			parents('.js-expense-div').
			toggleClass('locked').
			find('input').
			toggleClass('locked');
			this.divideExpense();
		},
		toggleExpense : function(event){
			
			if(!$(event.currentTarget).is(':checked')){
				this.$(event.currentTarget).
				
				parents('.js-expense-div').
				find('.js-lock-button').
				removeClass('foundicon-unlock').
				addClass('foundicon-lock')
				.parents('.js-expense-div')
				.addClass('locked').addClass('selected')
				.find('input.js-contribution-input')
				.addClass('locked')
				.attr('disabled', true)
				.val('');
			} else {
				this.$(event.currentTarget).
				parents('.js-expense-div').
				find('.js-lock-button').
				removeClass('foundicon-unlock').
				addClass('foundicon-lock')
				.parents('.js-expense-div')
				.removeClass('locked').removeClass('selected')
				.find('input.js-contribution-input')
				.removeClass('locked')
				.attr('disabled', false);
			}
			this.divideExpense();
		},
		setDynamicHeight : function(){
			console.time('setDynamicHeight');
			var self = this;
			var $allPayers=this.$('.js-all-payers');
			var payersState = $allPayers.is(":visible");
			var $includedMembers=this.$('.js-included-members');
			var incMemberState = $includedMembers.is(":visible");
			
			$allPayers.show();
			$includedMembers.show();
			self.$('.carousel').each(function(index, carouselEl){
				var totalHeight = 0;
				$(carouselEl).height(function(){
					$($(carouselEl).find('.item')[0]).children().each(function(index, el){
						totalHeight += $(el).height();
					});
					return totalHeight;
				});
			});
			payersState?$allPayers.show() : $allPayers.hide();
			incMemberState?$includedMembers.show():$includedMembers.hide();
			console.timeEnd('setDynamicHeight');
		},
		eventSaveExpense : function(){
			var self = this;
			if(!self.$('.js-add-expense-form').valid()){
				this.setDynamicHeight();
				return;
			}
			
			var self = this;
			/*
			if(!this.dataRefreshed){
			alert('Latest data is not available, please save after few seconds');
			return;
			}
			 */			
			showMask('Saving expense...');
			
			
			$.when(self.groupDataObtained).then(function(){
				var payersInfo = [];
				var includeMemberInfo = [];
				
				var payersInputs = self.$('.js-payers .js-pay-input');
				
				var totalPayment = 0;
				
				payersInputs.each(function(index, el){
					if(parseFloat($(el).val())>0){
						totalPayment+=parseFloat($(el).val());
						payersInfo.push({userId : $(el).data('userd'), amount:parseFloat($(el).val())});
					}
				});
				
				var totalExpense = 0;
				var includedMembersInputs = self.$('.js-contribution-input[disabled!="disabled"]');
				includedMembersInputs.each(function(index, el){
					if(parseFloat($(el).val())>0){
						totalExpense+=parseFloat($(el).val());
						includeMemberInfo.push({userId : $(el).data('userd'), amount:parseFloat($(el).val())});
					}
				});
				
				if(Math.abs(totalPayment-totalExpense) > 0.001){
					alert("Total expense doesnt match total payment");
					hideMask();
					return;
				}
				
				
				var expenseData = $.extend({}, {
					name : self.$('.js-expense-name').val()!=""?self.$('.js-expense-name').val() : "Untitled",
					date : self.$('.js-expense-date').val(),
					listPayersInfo : payersInfo,
					listIncludeMemberInfo : includeMemberInfo,
					groupId : self.group.groupId,
					group : self.group,
					type : self.$('.js-expense-type').val(),
					expenseEntityId : self.oldObjExpenseModel && self.oldObjExpenseModel.get('expenseEntityId'),
					friendshipId : self.oldObjExpenseModel && self.oldObjExpenseModel.get('friendshipId')
				});
				
				if(self.mode && self.mode=='edit'){
					$.extend(expenseData, {
						editedBy : user.getInfo().userId,
						editedAt : new Date()
					});
				} else {
					$.extend(expenseData, {
						createdBy : user.getInfo().userId,
						createdAt : new Date()
					});
				}
				
				var objExpenseModel = new ExpenseModel(expenseData);
				
				//TODO : This calculation has been moved to back end ExpenseEntityEndpoint.updateIOU(). Can be deleted when confident of correct working.
				/*if(self.mode && self.mode=='edit'){
					ExpenseUtility.updateIOU(self.oldObjExpenseModel.attributes, objExpenseModel.attributes.group, 'delete');
				}
				ExpenseUtility.updateIOU(objExpenseModel.attributes, objExpenseModel.attributes.group);*/
				
				var ajaxData = {
					url :'_ah/api/expenseentityendpoint/v1/expenseentity',
					callback : function(response){
						self.expenseSaved(objExpenseModel);
					},
					data : objExpenseModel.attributes,
					contex : self
				};
				
				if(self.mode=='edit'){
					Sandbox.doUpdate(ajaxData);
				} else {
					Sandbox.doPost(ajaxData);
				}
			});
			

			
		},
		expenseSaved : function(objExpenseModel){
			this.groupSaved(objExpenseModel);
		}, 
		groupSaved : function(objExpenseModel){
			this.$('.js-new-expense-form').hide();
			this.$('.js-success-message').show();
			hideMask();
		},
		toggleAllMembers : function(event){
			var selectAll = $(event.currentTarget).is(':checked');
			this.$('.js-select-expense').prop('checked', !selectAll).click();
			this.divideExpense();
		},
		eventShowMorePayers : function(event){
			this.$('.js-all-payers').show('slow');
			this.$('.js-current-user-pay-input').hide('slow');
			this.$('.js-more-payers').hide('slow');
			this.$('.user-paid-row').hide('slow');
		},
		eventShowMembersToDivide : function(event){
			var type = $(event.currentTarget).val();
			if(type=="selected"){
				this.$('.js-included-members').show('slow');
			} else {
				this.$('.js-included-members').hide('slow');
			}
		},
		showExpenseWithoutGroupForm : function(){
			
			var memberIdList = [];
			for(var index in this.selectedFriends){
				memberIdList.push(this.selectedFriends[index].userId);
			}
			
					var dummyGroup = {
						"groupId" : "",
						"groupName" : "",
						"ownerId" : "",
						"members" : this.selectedFriends,
						"membersIdList" : memberIdList,
						"active" : true
					};
					
			if(memberIdList.length<2){
				alert("Please select at least one friend.");
				return;
			}
			this.showNewExpenseForm(dummyGroup);
		},
		showSelectGroup : function(){
			var $friendSelector =this.$('.js-friend-selector-container');
			var $seletGroupContainer=this.$('.js-select-group-container');
			$friendSelector .animate({top : -$friendSelector .height()}, function(){
				$(this).hide();
				//$seletGroupContainer.show('slow');
				$seletGroupContainer.show().animate({top : 0});
			});
		},
		showNonGroupForm : function(){
			var $friendSelector =this.$('.js-friend-selector-container');
			var $seletGroupContainer=this.$('.js-select-group-container');
			/*$seletGroupContainer.hide('slow', function(){
				$friendSelector.show().animate({top : 0}, function(){
				});
			});*/
			$seletGroupContainer.animate({top : -$seletGroupContainer.height()}, function(){
				$(this).hide();
				$friendSelector.show().animate({top : 0}, function(){
				});
			});
		},
		makeInputVisible : function(event){
			var isMobile = false;
			//TODO : Put this in some common place
			if( $('.is-mobile').css('display') == 'none' ) {
		        isMobile = true;      
		    }
			if(isMobile){
				setTimeout(function(){
					var scrollTop = $('.scrollable-right-section').scrollTop();
					var inputPosition = $(event.currentTarget).offset().top;
					var bottomPaddingAdjust = parseInt($('.scrollable-right-section').css('padding-bottom'));
					
					if(scrollTop < inputPosition){
						//$('.scrollable-right-section').scrollTop(inputPosition - bottomPaddingAdjust);
						$('.scrollable-right-section').animate({'scrollTop' : (inputPosition - bottomPaddingAdjust)}, 1000);
					}
				}, 2000);
			}
		},
		populatePayAndContribInputs : function(){
			
			var $payInputs = this.$('.js-pay-input').not('.js-current-user-pay-input');
			var $contributionInputs = this.$('.js-contribution-input').val(0);
			var value = this.$('.js-between-two-input').val();
			
			var selectedOption = this.$('.select-between-two').val();
			if("split"!==selectedOption){
				$payInputs.val(0);
				$contributionInputs.val(0);
				this.$('.between-two-ip-container').show();
				this.$('.split-form').hide();
				if("other-owe"==selectedOption){
					$($payInputs[0]).val(value);
					$($contributionInputs[1]).val(value);
				} else if("user-owe"==selectedOption){
					$($payInputs[1]).val(value)
					$($contributionInputs[0]).val(value);
				} 
			} else {
				this.$('.between-two-ip-container').hide();
				this.$('.split-form').show();
				this.divideExpense();
			}
			
		}
		
		
	});
	
	return NewExpenseView;

});
