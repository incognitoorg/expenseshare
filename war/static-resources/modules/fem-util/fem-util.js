define(function(){

	function filterZeros(members){
		for(var index in members){
			var member = members[index];
			if(parseInt(member.amount)===0){
				delete members[index];
			}
		}
	}

	function updateIOU(expenseModel, group, isDelete){

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

		if(isDelete){
			//Swapping for delete
			var tempArray = gainerArray ;
			gainerArray = loserArray;
			loserArray = tempArray;
		}

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





	function calculateCreditDebt(groups){
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

		return {
			debt : debt,
			credit : credit
		};

	}


	return {
		updateIOU : updateIOU,
		calculateCreditDebt : calculateCreditDebt
	};
});