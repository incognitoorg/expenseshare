define(function(require) {
	var Sandbox = require('sandbox');
	var Underscore = require('underscore');
	var user = require('components/login/login');
	var expenseTemplate = Handlebars.compile(require('text!./../../templates/expense.html'));
	var expenseDeatailTemplate = Handlebars.compile(require('text!./../../templates/detailexpenseview.html'));
	var NewExpenseFactory = require('modules/newexpense/newexpense');
	var ExpenseUtility = require('modules/expenseutiliy/expenseutility');

	var css = require('css!./../../css/expensehistory.css');
	
	Handlebars.registerHelper("transition", function(transition) {
		if(!(transition.typeLabel=='owes')){
			return "You owe " +  transition.amount + " to " + transition.user.fullName + ".";
		} else {
			return transition.user.fullName+ " " + 'owe' + transition.amount + " to you.";
		}
	});
	
	function normalizeExpense(expense, allMembers, groupMap){
		var totalAmountPaid = 0;
		var userTransaction = 0;
		var tableMap = {};
		
		expense.userPaid  = 0;
		expense.userExpenseAmount = 0;
		
		for ( var i = 0; i < expense.listIncludeMemberInfo.length; i++) {
			var memberInfo = expense.listIncludeMemberInfo[i];
			memberInfo.userInfo = allMembers[memberInfo.userId];
			if(memberInfo.userId == user.getInfo().userId){
				expense.userExpenseAmount = parseInt(memberInfo.amount);
			}
			tableMap[memberInfo.userId] = tableMap[memberInfo.userId] || {};
			tableMap[memberInfo.userId].share = memberInfo.amount;
		}
		
		for ( var i = 0; i < expense.listPayersInfo.length; i++) {
			var memberInfo = expense.listPayersInfo[i];
			memberInfo.userInfo = allMembers[memberInfo.userId];
			totalAmountPaid+= memberInfo.amount;
			if(memberInfo.userId== user.getInfo().userId){
				expense.userPaid=parseInt(memberInfo.amount);
			}
			tableMap[memberInfo.userId] = tableMap[memberInfo.userId] || {};
			tableMap[memberInfo.userId].paid = memberInfo.amount;
		}
		
		var tableArray = [];
		for(var index in tableMap){
			tableArray.push({user : allMembers[index], paid : tableMap[index].paid, share : tableMap[index].share});
		}
		expense.tableArray = tableArray;
		
		
		if(expense.listPayersInfo.length>1){
			expense.whoPaid = expense.listPayersInfo.length + " People";
		} else {
			expense.whoPaid = expense.listPayersInfo[0].userInfo.firstName;
		}
		
		
		userTransaction = expense.userTransaction = expense.userPaid - expense.userExpenseAmount;
		
		if(userTransaction>0){
			expense.transactionType = "lent";
		} else if(userTransaction<0){
			expense.transactionType = "borrowed";
		}
		
		_.each(expense.iou, function (element, index) {
			element.fromUser = allMembers[element.fromUserId];
			element.toUser = allMembers[element.toUserId];
		});
		
		expense.userTransaction = Math.abs(expense.userTransaction);
		expense.createdBy ? expense.whoCreated = allMembers[expense.createdBy] : (expense.editedBy ? expense.whoEdited = allMembers[expense.editedBy] : {});
		expense.day = new Date(expense.date).toDateString();
		expense.group = expense.groupId && groupMap[expense.groupId];
		expense.totalAmountPaid = totalAmountPaid;
		console.log("expense", expense);
		
		var iou = expense.iou ;
		
		var currentUser = user.getInfo()
		
		var transitionData = {};
		var transitions = [];
		var type = null;
		for (var i = 0; i < iou.length; i++) {
			var transition = {};
			if(iou[i].fromUserId==currentUser.userId){
				type = 'debit';
				transition['userId'] = iou[i].toUserId;
				transition['amount'] = iou[i].amount;
				transition['user'] =  allMembers[iou[i].toUserId];
				transition['typeLabel'] = 'you owe';
				
				transitions.push(transition)
			} else if(iou[i].toUserId==currentUser.userId){
				type = 'credit';
				transition['userId'] = iou[i].fromUserId;
				transition['amount'] = iou[i].amount;
				transition['user'] =  allMembers[iou[i].fromUserId];
				transition['typeLabel'] = 'owes';
				transitions.push(transition)
			}
			
		}
		
		transitionData['type'] = type;
		transitionData['transitions'] = transitions;
		expense.transitionData = transitionData;
		
		console.log('expense.transitionData', expense.transitionData);
		
		
		
		
		return expense;
	}

	
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
		},
		showExpenseHistory : function(response, extraParams){
			console.log("response", response);
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
					groupInfo.members[memberIndex].firstName = groupInfo.members[memberIndex].fullName.split(' ')[0];
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
				var htmlNode = $(html)
				expensesContainer.append(htmlNode);
				
				
				
			}
		},
		renderExpenseTransition : function(transitionData, htmlNode){
			
			
			function getPoints(points){
				var pointsStr = '';
				for (var i = 0; i < points.length; i++) {
					pointsStr+=points[i].join(',');
					pointsStr+=' ';
				}
				return pointsStr;
			}
			
			var lineColor = 'black';
			var amountColor = transitionData.type=='credit'?'green' : 'red';
			var othersMarker = transitionData.type=='credit'?'url(#markerCircle)' : 'url(#markerRightArrow)';
			var userMarker = transitionData.type=='credit'?'url(#markerLeftArrow)': 'url(#markerCircle)' ;
			
			var svg =  $(htmlNode).find('svg')[0]; //document.createElementNS("http://www.w3.org/2000/svg", "svg");
			var parent = $(htmlNode).find('.transition');
			var width = parent.width();
			var height = transitionData.transitions.length*80;
			
			svg.setAttribute('width', width);
			svg.setAttribute('height', height);
			
			var userName = "You";//user.getInfo().firstName || user.getInfo().fullName.split(' ')[0];
			
			var svgText = document.createElementNS("http://www.w3.org/2000/svg", "text");//document.createElement("text")
			svgText.setAttribute('x', 0);
			svgText.setAttribute('y', (height/2)+5);
			svgText.innerHTML = (userName);
			svg.appendChild(svgText);
			
			//Horizontal line from user to middle
			var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
			//polyline.setAttribute('points', "20,100 40,60 70,80 100,20");
			polyline.setAttribute('stroke', lineColor);
			polyline.setAttribute('fill', 'none');
			var innerlineWidth = width -80;
			var amountPosition = transitionData.transitions.length==1?innerlineWidth/2:(innerlineWidth-40 +width/2)/2;

			var points = [[40, height/2], [innerlineWidth/2, height/2]];
			polyline.setAttribute('points', getPoints(points));
			$(polyline).css('marker-start', userMarker);
			svg.appendChild(polyline);
			
			
			
			//Vertical line
			var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
			polyline.setAttribute('stroke', lineColor);
			polyline.setAttribute('fill', 'none');
			var innerlineWidth = width -80;
			var points = [[innerlineWidth/2, 40], [innerlineWidth/2, height-40]];
			polyline.setAttribute('points', getPoints(points));
			svg.appendChild(polyline);
			
			
			
			for (var i = 0; i < transitionData.transitions.length; i++) {
				var userId =  transitionData.transitions[i].userId;
				var allMembers = this.allMembers;
				var userName = allMembers[userId].firstName || allMembers[userId].fullName.split(' ')[0];

				var svgText = document.createElementNS("http://www.w3.org/2000/svg", "text");
				svgText.setAttribute('x', width-60);
				svgText.setAttribute('y', i*80 + 40+5);
				svgText.innerHTML = (userName);
				svg.appendChild(svgText);
				
				
				var svgText = document.createElementNS("http://www.w3.org/2000/svg", "text");
				svgText.setAttribute('x', amountPosition);
				svgText.setAttribute('y', i*80 + 30);
				svgText.setAttribute('fill', amountColor);
				svgText.innerHTML = (transitionData.transitions[i].amount);
				svg.appendChild(svgText);
				
				var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
				polyline.setAttribute('stroke', lineColor);
				polyline.setAttribute('fill', 'none');
				points = [];
				points.push([innerlineWidth/2, i*80 + 40]);
				points.push([innerlineWidth, i*80 + 40]);
				polyline.setAttribute('points', getPoints(points));
				
				$(polyline).css('marker-end', othersMarker);
				svg.appendChild(polyline);
				
				
			}
			
			polyline.setAttribute('points', getPoints(points));
			svg.appendChild(polyline);
			
			parent.append(svg);
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
		//TODO : Remove all code of separate detail expense. Or maybe use this for phone layout
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
			$detailContainer.parents(".detail-expense-container").toggle();//.animate({height : $detailContainer.height()});
			
			this.renderExpenseTransition(expense.transitionData, $detailContainer);
			
		},
		deleteExpense : function(event){
			var expense = this.expenseHitoryMap[$(event.currentTarget).data('expense-id')];
			var confirmation = confirm('Are you sure you want to delete this expense, ' + expense.name + ' ?');
			
			if(!confirmation){
				return;
			}
			
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
		editExpense : function(event){
			if(this.newExpense){
				Sandbox.destroy(this.newExpense);
			} else {
			}
			
			
			
			this.newExpense = NewExpenseFactory.getInstance();
			this.newExpense.initialize({ el : this.$('.js-edit-expense-form-container').show()});
			var expense = this.expenseHitoryMap[$(event.target).data('expense-id')];
			var group = this.groupMap[expense.groupId];
			
			
			var selectedFriends = [];
			
			selectedFriends = _.union(_.pluck(expense.listPayersInfo, "userInfo"), _.pluck(expense.listIncludeMemberInfo, "userInfo"))
			
			if(!group){
				var memberIdList = [];
				for(var index in selectedFriends){
					memberIdList.push(selectedFriends[index].userId);
				}
			
				group = {
					"groupId" : "",
					"groupName" : "",
					"ownerId" : "",
					"members" : selectedFriends,
					"membersIdList" : memberIdList,
					"active" : true
				};
			}
			
			this.$('.js-expense-history-container').hide();
			this.newExpense.view.mode='edit';
			this.newExpense.view.showNewExpenseForm(group, expense);
		}
	});

	return ExpenseHistoryView;

});