define(function(require) {
	var Sandbox = require('sandbox');
	var user = require('components/login/login');
	var expenseTemplate = Handlebars.compile(require('text!./../../templates/expense.html'));
	var expenseDeatailTemplate = Handlebars.compile(require('text!./../../templates/detailexpenseview.html'));
	var NewExpenseFactory = require('modules/newexpense/newexpense');
	var ExpenseUtility = require('modules/expenseutiliy/expenseutility');
	
//	var strolljs = require('plugins/jquery/stroll/js/stroll.min');
//	var strollcss = require('css!plugins/jquery/stroll/css/stroll-stripped.css');

	var css = require('css!./../../css/expensehistory.css');
	
	function normalizeExpense(expense, allMembers, groupMap){
		//var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		for ( var i = 0; i < expense.listIncludeMemberInfo.length; i++) {
			var memberInfo = expense.listIncludeMemberInfo[i];
			memberInfo.userInfo = allMembers[memberInfo.userId];
			if(memberInfo.userId== user.getInfo().userId){
				expense.userExpenseAmount=parseInt(memberInfo.amount);
			}
		}
		expense.userExpenseAmount = expense.userExpenseAmount || 0;
		
		if(!expense.userExpenseAmount){
			expense.extendedType = 'payeronly';
		}
		
		for ( var i = 0; i < expense.listPayersInfo.length; i++) {
			var memberInfo = expense.listPayersInfo[i];
			memberInfo.userInfo = allMembers[memberInfo.userId];
		}
		expense.day = new Date(expense.date).toDateString();
		//expense.date = new Date(expense.date);
		expense.group = expense.groupId && groupMap[expense.groupId];
		return expense;
	}

	//TODO : This function has been moved to ExpenseUtility
	function updatedIOUForDelete(expenseModel, group){
		
		var calculatedIOU = {};
		
		var listPayersInfo = expenseModel.listPayersInfo;
		var listIncludeMemberInfo = expenseModel.listIncludeMemberInfo;
		
		
		var gainerLosers = {};
		var payersInfoObject = {};
		var includedMembersInfoObject = {};
		
		for ( var i = 0; i < listPayersInfo.length; i++) {
			gainerLosers[listPayersInfo[i].userId] = {};
			payersInfoObject[listPayersInfo[i].userId] = listPayersInfo[i];
		}
		
		for ( var i = 0; i < listIncludeMemberInfo.length; i++) {
			gainerLosers[listIncludeMemberInfo[i].userId] = {};
			includedMembersInfoObject[listIncludeMemberInfo[i].userId] = listIncludeMemberInfo[i];
		}
		
		
		var gainers = {};
		var losers = {};
		var gainerArray = [];
		var loserArray = [];
		var gainerCount = 0;
		var loserCount = 0;
		
		for(var index in gainerLosers){
			var credit = payersInfoObject[index] && payersInfoObject[index].amount || 0;
			var debit = includedMembersInfoObject[index] && includedMembersInfoObject[index].amount || 0;
			var diff = credit - debit;
			
			gainerLosers[index] = {amount : diff};

			diff>0?gainers[index]={amount : diff} : losers[index]={amount : diff} ;
			diff>0?gainerArray[gainerCount++]={amount : diff, userId : index} : loserArray[loserCount++]={amount : Math.abs(diff), userId : index} ;
			
		}
		
		//Swapping for delete
		var tempArray = gainerArray ;
		gainerArray = loserArray;
		loserArray = tempArray;
		
		for ( var i = 0,j=0; i < gainerArray.length; i++) {
			var payer = gainerArray[i];
			
			var amountToDistribute = payer.amount;
			while(amountToDistribute>0){
				var member = loserArray[j++];
				//TODO : This is put when amount to distribute is not summing up with member amounts
				//Need to put better approach here
				if(!member){
				    break;
				}
				var amountToDeduct = member.amount;
				
				if(amountToDistribute<amountToDeduct){
					amountToDeduct = amountToDistribute;
					//TODO : To check on the round approach for more correctness
					member.amount -= Math.round(amountToDistribute);
					amountToDistribute = 0;
					j--;
				} else {
					amountToDistribute -= amountToDeduct;
				}
				calculatedIOU[member.userId +"-"+ payer.userId]={amount:amountToDeduct};
			}
		}
		
		var iouList = group.iouList;
		for ( var i = 0; i < iouList.length; i++) {
			var iou = iouList[i];
			
			var forwardKey = iou.fromUserId + "-" +iou.toUserId;
			var forwardObj = calculatedIOU[forwardKey];
			
			if(forwardObj){
				iou.amount +=forwardObj.amount;
			} else {
				var backwardKey = iou.toUserId + "-" +iou.fromUserId;
				var backwardObj = calculatedIOU[backwardKey];
				if(backwardObj){
					iou.amount -=backwardObj.amount;
				}
				
			}
			
		}
		
		return group;
	};
	
	
	
	
	
	
	var ExpenseHistoryView = Sandbox.View.extend({
		initialize : function(options) {
			this.options = _.extend({
			//defaults here
			}, options);
			this.expenses=[];
			this.expenseHitoryMap = {};
			this.render();
			this.getExpenses(options.argumentsProvided);
		},
		reInitialize : function(argumentsProvided){
			this.getExpenses(argumentsProvided);
		},
		template : Handlebars
				.compile(require('text!./../../templates/expensehistory.html')),
		render : function(data) {
			$(this.el).html(this.template(data));
			this.$('.js-expenses-container').height($('body').height()-(45+45));
		},
		events : {
			'click .js-expense' : 'showExpenseDetail',
			'click .delete-expense' : 'deleteExpense',
			'click .js-edit-expense' : 'editExpense',
			'change .js-type-filter-select' :  'showFilteredExpenses',
			'change .js-user-filter-select' :  'showFilteredExpenses',
			'change .js-group-filter-select' :  'showFilteredExpenses'
		},
		getExpenses : function(argumentsProvided){
			var self = this;
			this.$('.js-expense-history-container').show();
			this.$('.js-edit-expense-form-container').hide();
			var data = {
				url : '_ah/api/userendpoint/v1/user/' + user.getInfo().userId + '/expenses',
				callback : function(response){
					this.showExpenseHistory.call(self, response, argumentsProvided);
				},
				context : this,
				cached : true,
				loaderContainer : this.$('.js-expenses-container')
			};
			Sandbox.doGet(data);
		},
		renderFilterOptions : function(){
			var groupSelect = this.$('.js-group-filter-select');
			groupSelect.html('').append($('<option>').val('select').text('Select'));
			var groupMap = this.groupMap;
			for(var index in groupMap){
				groupSelect.append($('<option>').val(groupMap[index].groupId).text(groupMap[index].groupName));
			}
			var groupSelect = this.$('.js-user-filter-select');
			groupSelect.html('').append($('<option>').val('select').text('Select'));
			var allMembers = this.allMembers;
			for(var index in allMembers){
				groupSelect.append($('<option>').val(allMembers[index].userId).text(allMembers[index].fullName));
			}
			//TODO : If you really dont have anything else to do. Generate the types dynamically rather than hardcoded.
			/*var typeSelect = this.$('.js-type-filter-select');
			typeSelect.html('').append($('<option>').val('select').text('Select'));
			var allMembers = this.allMembers;
			for(var index in allMembers){
				typeSelect.append($('<option>').val(allMembers[index].userId).text(allMembers[index].fullName));
			}*/
		},
		showExpenseHistory : function(response, extraParams){
			if(!response.items || response.items.length==0){
				this.$('.js-no-expense-error').show();
				this.$('.js-expenses-container').hide();
				return;
			}
			this.$('.js-expenses-container').show();
			var expenses = response.items;
			
			
			this.expenses = expenses;
			var userInfo = user.getInfo();
			var groups = userInfo.group.items;
			var allMembers = {};
			this.allMembers = allMembers;
			var groupMap = {};
			for(var groupIndex in groups){
				var groupInfo = groups[groupIndex];
				for(var memberIndex in groupInfo.members ){
					allMembers[groupInfo.members[memberIndex].userId] = groupInfo.members[memberIndex];
				}
				groupMap[groupInfo.groupId] = groupInfo;
				
			}
			this.groupMap = groupMap;
			
			
			this.renderFilterOptions();
			expenses = expenses.sort(function(a,b){
				 return a.date<b.date?1:a.date>b.date?-1:0;
			});
			
			if(extraParams){
				var key = extraParams[0];
				var value = extraParams[1];
				var filterOptions = {};
				filterOptions[key] = value;
				this.showFilteredExpenses(filterOptions);
			} else {
				this.renderExpenses(expenses);
			}
		},
		renderExpenses : function(expenses){
			expenses = expenses || this.expenses;
			var expensesContainer = this.$('.js-expenses-container').html('');
			
			for ( var i = 0; i < expenses.length; i++) {
				var expense = expenses[i];
				this.expenseHitoryMap[expense.expenseEntityId] = expense;
				//TODO : Convert this into view
				var html = expenseTemplate(normalizeExpense(expense, this.allMembers, this.groupMap));
				expensesContainer.append(html);
				
			}
		},
		showFilteredExpenses : function(options){
			var typeFilter = options.type || $('.js-type-filter-select').val();
			var userFilter = options.user || $('.js-user-filter-select').val();
			var groupFilter = options.group || $('.js-group-filter-select').val();
			
			var filteredExpenses = [];
			var expenses = this.expenses;
			
			for(var i=0; i<expenses.length; i++){
				var toPush = true;
				//TODO : Travel backward in time kill past yourself for this coding redundancy. Can be designed better with filter functions
				var expense = expenses[i];
				
				/*if(typeFilter!=="select"){
					if(expense.type!==typeFilter){
						toPush = false;
						continue;
					} 
				}
				if(groupFilter!=="select"){
					if(expense.groupId!==groupFilter){
						toPush = false;
						continue;
					} 
				}*/
/*				if(userFilter!=="select"){*/
				if(true){
					toPush = (function(){
						var listIncludeMemberInfo = expense.listIncludeMemberInfo;
						var pushed = false;
						for(var j=0; j<listIncludeMemberInfo.length; j++){
							if(listIncludeMemberInfo[j].userId===userFilter){
								return true;
							}
						}
						var listPayersInfo = expense.listPayersInfo;
						for(var j=0; j<listPayersInfo.length; j++){
							if(listPayersInfo[j].userId===userFilter){
								return true;
							}
						}
					}());
					
				}
				
				toPush && filteredExpenses.push(expense);
				
			}
			this.renderExpenses(filteredExpenses);
			
		},
		//TODO : Remove all code of separate detail expense.
		showExpenseDetail : function(event){
			var self = this;
			var expense = this.expenseHitoryMap[$(event.currentTarget).data('expense-id')];
			var detailHTML = expenseDeatailTemplate(expense);
			//this.$('.js-detail-expnese-container').html(detailHTML);
			//TODO : Convert expense entity in a view.
			var $detailContainer=this.$(event.currentTarget).parents('li').find('.js-expense-detail-container');
			$detailContainer.html(detailHTML);
			/*$detailContainer.slideToggle(function(){
				//TODO : Review this interaction. User might not like their divs swinging like that 
				self.$('.js-expenses-container').animate({scrollTop:event.currentTarget.offsetTop}, '500', 'swing', function() {});
			});*/
			$detailContainer.toggle();//.animate({height : $detailContainer.height()});
			
		},
		groupDataObtained : function(response, expense){
			var group = response;
			var updatedGroup = ExpenseUtility.updateIOU(expense, group, 'delete');
			
			expense.group = updatedGroup;
			
			Sandbox.doDelete({
				url : '_ah/api/expenseentityendpoint/v1/expenseentity/deleteandupdateiou', 
				data : expense,
				type : 'POST',
				dataType: 'json',
				contentType: 'application/json',
				callback : function(response){
					$('.li-' + expense.expenseEntityId).slideUp('slow', function(){
						this.remove();
					});
				}, 
				errorCallback : function(err){
					console.log('error occured');
				}
			});
		},
		deleteExpense : function(event){
			var expense = this.expenseHitoryMap[$(event.currentTarget).data('expense-id')];
			var confirmation = confirm('Are you sure you want to delete this expense, ' + expense.name + ' ?');
			
			if(!confirmation){
				return;
			}
			
			
			var group = this.groupMap[expense.groupId];
			
			var data = {
				url : '_ah/api/userendpoint/v1/user/' + user.getInfo().userId + '/group/' + group.groupId,
				context : this,
				callback : function(response){
					this.groupDataObtained(response, expense);
				},
				dataType: 'json',
				loaderContainer : this.$('.groups-container')
			};
			Sandbox.doGet(data);
			
				
			
			
			/*Sandbox.publish('FEM:NAVIGATE', '#expensedetail');*/
		},
		editExpense : function(){
			var newExpense = NewExpenseFactory.getInstance();
			newExpense.initialize({ el : this.$('.js-edit-expense-form-container').show()});
			var expense = this.expenseHitoryMap[$(event.target).data('expense-id')];
			var group = this.groupMap[expense.groupId];
			this.$('.js-expense-history-container').hide();
			newExpense.view.mode='edit';
			newExpense.view.showNewExpenseForm(group, expense);
		}
	});

	return ExpenseHistoryView;

});