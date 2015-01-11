define(function(require) {
	var Sandbox = require('sandbox');

	var login = require('components/login/login');
	var css = require('css!./../../css/dashboard.css');
	var RowTemplate = Handlebars.compile(require('text!./../../templates/dashboardrow.html'))
	var user = login.getInfo();
	
	var DashboardView = Sandbox.View.extend({
		initialize : function(options) {
			this.options = _.extend({
			//defaults here
			}, options);
			this.render();
			this.getDashboardData();
		},
		template : Handlebars
				.compile(require('text!./../../templates/dashboardtemplate.html')),
		render : function(data) {
			$(this.el).html(this.template(data));
		},
		events : {
			'change select' : 'changeUser'
		},
		getDashboardData : function(){
			var self = this;
			Sandbox.doGet({
				url : '_ah/api/userendpoint/v1/user/' + user.userId +'/group',
				callback : function(response){
					self.renderDashboard.call(self, response);
				},
				loaderContainer : this.$('.js-owers,.js-payers'),
				cached : true
			});
		},
		renderDashboard : function(response){
			var self = this;
			var groups = response.items;
			
			if(groups){
				
				var userId = user.userId;
				
				var allMembers = {};
				
				
				var oweInformation = {};
				
				for ( var i = 0; i < groups.length; i++) {
					var group = groups[i];
					var members = group.members;
					var iouList = group.iouList;
					
					var groupMembersMap = {};
					
					if(!iouList){
						continue;
					}
					
					for ( var j = 0; j < iouList.length; j++) {
						var iou = iouList[j];
						if(iou.fromUserId===userId){
							oweInformation[iou.toUserId] = oweInformation[iou.toUserId] || {amount : 0};
							oweInformation[iou.toUserId].amount -= iou.amount;
						} else if(iou.toUserId===userId){
							oweInformation[iou.fromUserId] = oweInformation[iou.fromUserId] || {amount : 0};
							oweInformation[iou.fromUserId].amount += iou.amount;
						}
					}
					
					for ( var memberCount = 0; memberCount < members.length; memberCount++) {
						var member = members[memberCount];
						groupMembersMap[member.userId] = member;
					}
					
					_.extend(allMembers, groupMembersMap);
					
				}
				
				
			
				function filterZeros(members){
					for(var index in members){
						var member = members[index];
						if(parseInt(member.amount)===0){
							delete members[index];
						}
					}
				}
				
				
				function sort(objectToSort){
					var sortedResult = _.sortBy(objectToSort, function(val, key, object) {
					    // return an number to index it by. then it is sorted from smallest to largest number
					    console.log('val', val, 'key', key, 'object',object);
					    val.key = key;
					    return -(Math.abs(val.amount));
					});
					var result = {};
					for(var index in sortedResult){
						result[sortedResult[index].key] = sortedResult[index];
					}
					return result;
					
				}
				
				
				oweInformation =  sort(oweInformation);
				
				var debt = {};
				var credit = {};
				
				for(var index in oweInformation){
					if(oweInformation[index].amount<0){
						debt[index] = oweInformation[index];
					} else {
						credit[index] = oweInformation[index];
					}
				}
				
				
				filterZeros(debt);
				filterZeros(credit);
		
				this.$('.js-owers').html('');
				var totalCredit = 0;
				for(owerIndex in credit){
					var ower = credit[owerIndex];
					var memberInfo = allMembers[owerIndex];
					this.$('.js-owers').append(RowTemplate({fullName : memberInfo.fullName, amount : Math.abs(parseInt(ower.amount)), userId : memberInfo.userId}));
					totalCredit += ower.amount;
				}
				this.$('.total-credit').html(totalCredit);
				
				this.$('.js-payers').html('');
				var totalDebit = 0;
				for(payerIndex in debt){
					var payer = debt[payerIndex];
					var memberInfo = allMembers[payerIndex];
					this.$('.js-payers').append(RowTemplate({fullName : memberInfo.fullName, amount : parseInt(payer.amount), userId : memberInfo.userId}));
					totalDebit += payer.amount;
				}
				this.$('.total-debit').html(totalDebit);
				
				
				var $selectForUsers = $('<select class="user-selector">');
				this.$('.js-user-selector-container').html('').append($selectForUsers);
				this.$('.js-user-selector-container').append('Current User : ' + user.fullName);
				
				var option = $('<option>').text('Select').val('Select');
				$selectForUsers.append(option);
				for ( var memberId in allMembers) {
					var member = allMembers[memberId];
					var option = $('<option>').text(member.fullName).val(member.userId);
					$selectForUsers.append(option);
				}
				$selectForUsers.hide();
				self.allMembers = allMembers;
			}
			if(this.$('.js-owers').html().trim()===''){
				this.$('.js-owers').html('Nobody owes you.');
			}
			if(this.$('.js-payers').html().trim()===''){
				this.$('.js-payers').html('Hurray, you owe no one.');
			}
			
		},
		reInitialize : function(){
			this.getDashboardData();
		},
		changeUser : function(event){
			var selectedUserId = $(event.currentTarget).val();
			if(selectedUser==='Select'){
				return false;
			} else {
				var selectedUser = this.allMembers[selectedUserId];
				localStorage.setItem('loggedInUser', JSON.stringify(selectedUser));
				location.reload();
			}
			console.log('User changed');
		}
	});
	return DashboardView;

});
