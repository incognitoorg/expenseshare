define(function(require) {

	var Sandbox = require('sandbox');
	var SelectGroup = require('modules/selectgroup/selectgroup');
	var CSS = require('css!./../../css/newexpense.css');
	var JqueryTouch = require('libraries/jquery-mobile/jquery.mobile.touch.min');
	var memberPayTemplate = require('text!./../../templates/member-pay.html');
	var memberExpenseTemplate = require('text!./../../templates/member-expense.html');
	var ExpenseModel = require('./../models/expensemodel');
	var FormValidator = require("./../validator/newexpensevalidator");
	var user = require('components/login/login');
	var ExpenseUtility = require('modules/expenseutiliy/expenseutility');


	var expenseInputCounter = 0;
	
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
		template : Handlebars.compile(require('text!./../../templates/newexpense.html')),
		render : function(data) {
			$(this.el).html(this.template(data));
		},
		events : {
			'keyup input.js-pay-input' : 'divideExpense',
			'keyup input.js-contribution-input' : 'adjustExpenses',
			'keyup input.js-current-user-pay-input' : 'divideExpenseCurrentUser',
			'click .js-more-payers' : 'eventShowMorePayers',
			'click .js-lock-button' : 'eventLockExpense',
			'click .js-select-expense' : 'toggleExpense',
			'click .js-save-expense' : 'eventSaveExpense',
			'change .js-division-type' : 'eventShowMembersToDivide',
			'click .js-allmembers' : 'toggleAllMembers'
		},
		registerValidator : function(){
			FormValidator.initialize({'element':this.$(".js-add-expense-form"),'errorWidth':'86%'});
		},
		reInitialize : function(){
			this.$('.js-select-group').show();
			this.$('.js-new-expense-form').hide();
			this.$('.js-success-message').hide();
			this.objSelectGroup.reInitialize();
			
		},
		start : function(){
			if(this.objSelectGroup){
				Sandbox.destroy(this.objSelectGroup);
			} else {
				this.objSelectGroup = SelectGroup.getInstance();
			}
			
			this.$('.js-select-group').show();
			this.$('.js-new-expense-form').hide();
			this.$('.js-success-message').hide();
			this.objSelectGroup.initialize({el:this.$('.js-select-group'), 'owner':'NEW-EXPENSE'});
		},
		registerSubscribers : function(){
			Sandbox.subscribe('GROUP:SELECTED:NEW-EXPENSE', this.showNewExpenseForm, this);
			                   
		},
		dataRefresh : function(response){
			this.group = response;
		},
		showNewExpenseForm : function(group, expense){
			//TODO : Global variable from femview.js. If you are reading this. Go kill Vishwanath.
			AppRouterInstance.navigate('#newexpenseform');
			
			
			var data = {
				url : '_ah/api/userendpoint/v1/user/' + user.getInfo().userId + '/group/' + group.groupId,
				callback : this.dataRefresh,
				context : this,
				dataType: 'json',
				loaderContainer : this.$('.groups-container')
			};
			this.groupDataObtained = Sandbox.doGet(data);
			
			this.group = group;
			
		    var self = this;
			this.$('.js-select-group').hide();
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
				

			
			this.$('.js-all-payers').show();
			this.$('.js-included-members').show();

			this.$('.js-current-user-pay-input').show().val('');
			this.$('.js-more-payers').show();
			this.$('.user-paid-row').show();
			
			
			this.createPayersSection(group.members);
			this.createMembersSection(group.members);
			
			
			this.$('.carousel').each(function(index, el){
				self.setCarousel(self.$(el));
			});
			
			this.$('.js-all-payers').hide();
			this.$('.js-included-members').hide();
			
			this.registerValidator();
			
			
			if(expense){
				this.populateExpenseData(expense);
				this.oldObjExpenseModel = new ExpenseModel(expense);
				this.eventShowMorePayers();
			}
			
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
			
			var remaniningAmount = totalPayment;
			contributionInputs.each(function(index, el){
				$(el).val(dividedShare);
				remaniningAmount-=dividedShare;
			});
			
			if(remaniningAmount>0){
				contributionInputs.last().val(parseFloat(dividedShare)+parseFloat(remaniningAmount));
			} else {
				contributionInputs.last().val(parseFloat(dividedShare)-parseFloat(remaniningAmount));
			}
			
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
			this.$(event.currentTarget).parent('.js-expense-div').
			addClass('locked').
			find('input').
			addClass('locked');
			console.timeEnd('adjustExpenses');
		},
		eventLockExpense : function(event){
			this.$(event.currentTarget).parent('.js-expense-div').
			toggleClass('locked').
			find('input').
			toggleClass('locked');
			this.divideExpense();
		},
		toggleExpense : function(event){
			if(!$(event.currentTarget).is(':checked')){
				this.$(event.currentTarget).parents('.js-expense-div')
				.addClass('locked').addClass('selected')
				.find('input.js-contribution-input')
				.addClass('locked')
				.attr('disabled', true)
				.val(0);
			} else {
				this.$(event.currentTarget).parents('.js-expense-div')
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
				
				payersInputs.each(function(index, el){
					if(parseFloat($(el).val())>0){
						payersInfo.push({userId : $(el).data('userd'), amount:parseFloat($(el).val())});
					}
				});
				
				var includedMembersInputs = self.$('.js-contribution-input[disabled!="disabled"]');
				includedMembersInputs.each(function(index, el){
					if(parseFloat($(el).val())>0){
						includeMemberInfo.push({userId : $(el).data('userd'), amount:parseFloat($(el).val())});
					}
				});
				
				var objExpenseModel = new ExpenseModel({
					name : self.$('.js-expense-name').val()!=""?self.$('.js-expense-name').val() : "Untitled",
					date : self.$('.js-expense-date').val(),
					listPayersInfo : payersInfo,
					listIncludeMemberInfo : includeMemberInfo,
					groupId : self.group.groupId,
					group : self.group,
					type : self.$('.js-expense-type').val(),
					expenseEntityId : self.oldObjExpenseModel && self.oldObjExpenseModel.get('expenseEntityId')
				});
				
				if(self.mode && self.mode=='edit'){
					ExpenseUtility.updateIOU(self.oldObjExpenseModel.attributes, objExpenseModel.attributes.group, 'delete');
				}
				ExpenseUtility.updateIOU(objExpenseModel.attributes, objExpenseModel.attributes.group);
				//updatedIOU(objExpenseModel.attributes, objExpenseModel.attributes.group);
				
				
				
				
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
		}
		
	});
	
	return NewExpenseView;

});