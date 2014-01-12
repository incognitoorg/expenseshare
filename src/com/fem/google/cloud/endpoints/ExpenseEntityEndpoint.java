package com.fem.google.cloud.endpoints;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityNotFoundException;

import com.fem.temp.GainerLoserInfo;
import com.fem.util.MailUtil;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

@Api(name = "expenseentityendpoint")
public class ExpenseEntityEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 * @throws Exception 
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	public CollectionResponse<ExpenseEntity> listExpenseEntity(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) throws Exception {

		
		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<ExpenseEntity> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(ExpenseEntity.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<ExpenseEntity>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (ExpenseEntity obj : execute)
				;
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage() + e.getStackTrace().toString(), null);
			throw e;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<ExpenseEntity> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws Exception 
	 */
	public ExpenseEntity getExpenseEntity(@Named("id") String id) throws Exception {
		PersistenceManager mgr = getPersistenceManager();
		ExpenseEntity expenseentity = null;
		try {
			expenseentity = mgr.getObjectById(ExpenseEntity.class, id);
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage() + e.getStackTrace().toString(), null);
			throw e;
		} finally {
			mgr.close();
		}
		return expenseentity;
	}

	
	private String getHashId(ArrayList<String> alStrings) throws NoSuchAlgorithmException{
		String mergedString = "";
		for (Iterator iterator = alStrings.iterator(); iterator.hasNext();) {
			String memberId = (String) iterator.next();
			mergedString = mergedString.concat(memberId);
			
		}
		
		MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
		messageDigest.update(mergedString.getBytes());
		String encryptedString = new String(messageDigest.digest());
		
		return encryptedString;
	}
	
	private Group getFrienshipGroup(){
		return null;
	}
	
	
	private ArrayList<IOU> generateIOUEntries(ArrayList<User> allMembers, Group objGroup){
		
		ArrayList<IOU> alIOU = new ArrayList<IOU>();
		for (int i = 0; i < allMembers.size(); i++) {

			User fromUser = allMembers.get(i);
			
			for (int j = i+1; j < allMembers.size(); j++) {
				User toUser = allMembers.get(j);
				
				IOU objIOU = new IOU();
				objIOU.setGroupId(objGroup.getGroupId());
				objIOU.setFromUserId(fromUser.getUserId());
				objIOU.setToUserId(toUser.getUserId());
				objIOU.setAmount(0);
				alIOU.add(objIOU);
			}
		}
		return alIOU;
	}
	
	
	
	
	private Group createFriendshipGroup(String fromMemberId, String toMemberId){
		return null;
	}
	
	
	
	private Friendship createFriendship(PersistenceManager mgr ,ArrayList<User> memmbers) throws NoSuchAlgorithmException{
		
		Friendship objFriendship = new Friendship();
		
		ArrayList<String> alGroupIds = new ArrayList<String>(); 
		
		for (int i = 0; i < memmbers.size(); i++) {

			User fromUser = memmbers.get(i);
			
			for (int j = i+1; j < memmbers.size(); j++) {
				User toUser = memmbers.get(j);
				Group objGroup = this.getOrGenerateGroup(mgr, fromUser, toUser);
				alGroupIds.add(objGroup.getGroupId());
			}
		}
		objFriendship.setGroupIds(alGroupIds);
		
		mgr.makePersistent(objFriendship);
		
		return objFriendship;
	}
	
	
	private Group getOrGenerateGroup(PersistenceManager mgr , User fromUser, User toUser) throws NoSuchAlgorithmException {
		ArrayList<String> alString = new ArrayList<String>();
		
		alString.add(fromUser.getUserId() + toUser.getUserId());
		String encryptedfirstPassGroupId = this.getHashId(alString);
		
		//TODO : Get group which includes two users and is of type dummy
		Group objGroup = null;//mgr.getObjectById(Group.class, encryptedfirstPassGroupId);
		
		if(objGroup==null){
			ArrayList<String> alString2 = new ArrayList<String>();
			alString2.add(fromUser.getUserId() + toUser.getUserId());
			String encryptedSecondPassGroupId = this.getHashId(alString2);
			objGroup = mgr.getObjectById(Group.class, encryptedSecondPassGroupId);
			
			if(objGroup==null){
				Group objGroupToWrite = new Group();
				objGroupToWrite.setGroupName("Dummy between " + fromUser.getUserId() + " and " + toUser);
				objGroupToWrite.setGroupType("dummy");
				ArrayList<String> membersIdList = new ArrayList<String>();
				membersIdList.add(fromUser.getUserId());
				membersIdList.add(toUser.getUserId());
				
				objGroupToWrite.setMembersIdList(membersIdList);
				
				ArrayList<User> alMembers = new ArrayList<User>();
				alMembers.add(fromUser);
				alMembers.add(toUser);
				objGroupToWrite.setIouList(this.generateIOUEntries(alMembers, objGroupToWrite));
				
				mgr.makePersistent(objGroupToWrite);
			}
		}
		
		
		return objGroup;
	}

	private Friendship getFriendship(PersistenceManager mgr , ArrayList<User> alMembers) throws NoSuchAlgorithmException{
		
		
		boolean allUserPresent = true;
		
		ArrayList<User> realUsers = new ArrayList<User>();
		
		ArrayList<String> alMemberIds = new ArrayList<String>();
		
		for (Iterator iterator = alMembers.iterator(); iterator.hasNext();) {
			User user = (User) iterator.next();
			if(user.getUserId()==null){
				allUserPresent = false;
				user = new UserEndpoint().getOrInsertUser(user, null, null) ;
				break;
			}
			realUsers.add(user);
			alMemberIds.add(user.getUserId());
		}
		
		Friendship objFriendShip = null;
		if(!allUserPresent){
			objFriendShip = this.createFriendship(mgr, realUsers);
		} else {
			
			String uniqueId = getHashId(alMemberIds);
			
			Query q  = mgr.newQuery(FriendshipIndex.class);
			
			q.setFilter("indexNo == indexNoParam");
			q.declareParameters("String indexNoParam");
			List<FriendshipIndex> alFriendshipIndex = (List<FriendshipIndex>) q.execute(uniqueId);
			
			if(alFriendshipIndex.size()>0){
				objFriendShip = mgr.getObjectById(Friendship.class, alFriendshipIndex.get(0));
			} else {
				objFriendShip = this.createFriendship(mgr, realUsers);
			}
		}
		
		
		
		
		return objFriendShip;
	}
	
	
	
	private void updateIOU(ExpenseEntity objExpenseEntity, ArrayList<IOU> alIOU, String mode){
		
		HashMap<String, Double> calculatedIOU = new HashMap<String, Double>();
		
		List<ExpenseInfo> listPayersInfo = objExpenseEntity.getListPayersInfo();
		List<ExpenseInfo> listIncludeMemberInfo =  objExpenseEntity.getListIncludeMemberInfo();
		
		
		HashMap<String, Double> gainerLosers = new HashMap<String, Double>();
		HashMap<String, ExpenseInfo> payersInfoMap = new HashMap<String, ExpenseInfo>();
		HashMap<String, ExpenseInfo> includedMembersInfoMap = new HashMap<String, ExpenseInfo>();
		
		for ( int i = 0; i < listPayersInfo.size(); i++) {
			gainerLosers.put(listPayersInfo.get(i).getUserId(), 0.0);
			payersInfoMap.put(listPayersInfo.get(i).getUserId(), listPayersInfo.get(i));
		}
		
		for ( int i = 0; i < listIncludeMemberInfo.size(); i++) {
			gainerLosers.put(listIncludeMemberInfo.get(i).getUserId(), 0.0);
			includedMembersInfoMap.put(listIncludeMemberInfo.get(i).getUserId(), listIncludeMemberInfo.get(i));
		}
		
		
		HashMap<String, Double> gainersMap = new HashMap<String, Double>();
		HashMap<String, Double> losersMap = new HashMap<String, Double>();
		
		ArrayList<GainerLoserInfo> alGainers = new ArrayList<GainerLoserInfo>();
		ArrayList<GainerLoserInfo> alLosers = new ArrayList<GainerLoserInfo>();
		
		int gainerCount = 0;
		int loserCount = 0;
		
		Set<String> gainerLoserKeys = gainerLosers.keySet(); 
		
		for (String index : gainerLoserKeys) {
			double credit = 0.0;
			ExpenseInfo objExpenseInfoCredit =  payersInfoMap.get(index);
			if(objExpenseInfoCredit!=null){
				credit = objExpenseInfoCredit.getAmount();
			}
			
			double debit = 0.0;
			ExpenseInfo objExpenseInfoDebit =  includedMembersInfoMap.get(index);
			if(objExpenseInfoDebit!=null){
				debit = objExpenseInfoDebit.getAmount();
			}
			
			double diff = credit - debit;
			
			gainerLosers.put(index, diff);
			
			if(diff>0){
				gainersMap.put(index, diff);
				alGainers.add(new GainerLoserInfo(diff, index));
			} else {
				losersMap.put(index, diff);
				alLosers.add(new GainerLoserInfo(Math.abs(diff), index));
			}
		}
		
		if(mode.equals("delete")){
			//Swapping for delete
			ArrayList<GainerLoserInfo> alTemp = alGainers ;
			alGainers = alLosers;
			alLosers = alTemp;
		}
		
		
		for ( int i = 0,j=0; i < alGainers.size(); i++) {
			GainerLoserInfo payer = alGainers.get(i);
			
			double amountToDistribute = payer.getAmount();
			while(amountToDistribute>0){
				//This will throw indexOutOfBounds if something wrong happens.
				GainerLoserInfo member = alLosers.get(j++);
				//TODO : This is put when amount to distribute is not summing up with member amounts
				//Need to put better approach here
				/*if(!member){
				    break;
				}*/
				double amountToDeduct = member.getAmount();
				
				if(amountToDistribute<amountToDeduct){
					amountToDeduct = amountToDistribute;
					//TODO : To check on the round approach for more correctness
					//member.amount -= Math.round(amountToDistribute);
					member.setAmount(member.getAmount()-amountToDistribute);
					amountToDistribute = 0;
					j--;
				} else {
					amountToDistribute -= amountToDeduct;
				}
				//calculatedIOU[member.userId +"-"+ payer.userId]={amount:amountToDeduct};
				calculatedIOU.put(member.getUserId() +"-"+ payer.getUserId(), amountToDeduct);
			}
		}
		
		for (IOU iou : alIOU) {
			String forwardKey = iou.getFromUserId() + "-" +iou.getToUserId();
			Double forwardAmount = calculatedIOU.get(forwardKey);
			
			if(forwardAmount!=null){
				iou.setAmount(iou.getAmount() + forwardAmount);;
			} else {
				String backwardKey = iou.getToUserId() + "-" +iou.getFromUserId();
				Double backwardAmount = calculatedIOU.get(backwardKey);
				if(backwardAmount!=null){
					iou.setAmount(iou.getAmount() - backwardAmount); ;
				}
				
			}
		}
		
		
	}
	
	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param expenseentity the entity to be inserted.
	 * @return The inserted entity.
	 * @throws Exception 
	 */
	public ExpenseEntity insertExpenseEntity(ExpenseEntity expenseentity) throws Exception {
		PersistenceManager mgr = getPersistenceManager();
		try {
/*			if (containsExpenseEntity(expenseentity)) {
				throw new EntityExistsException("Object already exists");
			}*/
			
			Group objGroup = expenseentity.getGroup();
			
			//Experiemental stuff for adding expense without group
			//This is an expense without group
			/*if(StringUtils.isEmpty(objGroup.getGroupId())){
				Friendship objFriendship = this.getFriendship(mgr, objGroup.getMembers());
				
			}*/
			
			
			expenseentity.setGroup(null);
			
			String expenseEntityId = KeyFactory.createKeyString("ExpenseEntity", new Date().getTime());
			expenseentity.setExpenseEntityId(expenseEntityId);
			
			
			for (Iterator iterator = expenseentity.getListIncludeMemberInfo().iterator(); iterator.hasNext();) {
				ExpenseInfo objExpenseInfo = (ExpenseInfo) iterator.next();
				objExpenseInfo.setExpenseId(expenseEntityId);
			}
			
			for (Iterator iterator = expenseentity.getListPayersInfo().iterator(); iterator.hasNext();) {
				ExpenseInfo objExpenseInfo = (ExpenseInfo) iterator.next();
				objExpenseInfo.setExpenseId(expenseEntityId);
			}
			
			mgr.makePersistent(expenseentity);
			
			objGroup.setMembers(null);//Removing members as they are not embedded.
			
			
			this.updateIOU(expenseentity, objGroup.getIouList(), "add");
			
			mgr.makePersistent(objGroup);
			
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage() + e.getStackTrace().toString(), null);
			throw e;
		} finally {
			mgr.close();
		}
		return expenseentity;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param expenseentity the entity to be updated.
	 * @return The updated entity.
	 * @throws Exception 
	 */
	public ExpenseEntity updateExpenseEntity(ExpenseEntity expenseentity) throws Exception {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsExpenseEntity(expenseentity)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			Group objGroup = expenseentity.getGroup();
			expenseentity.setGroup(null);
			
			ExpenseEntity oldExpenseentity = mgr.getObjectById(ExpenseEntity.class, expenseentity.getExpenseEntityId());
			
			this.updateIOU(oldExpenseentity, objGroup.getIouList(), "delete");
			this.updateIOU(expenseentity, objGroup.getIouList(), "edit");
			
			
			//Removing related expenseinfo
			for (Iterator iterator = oldExpenseentity.getListIncludeMemberInfo().iterator(); iterator.hasNext();) {
				ExpenseInfo objExpenseInfo = (ExpenseInfo) iterator.next();
				mgr.deletePersistent(objExpenseInfo);
				
			}
			
			for (Iterator iterator = oldExpenseentity.getListPayersInfo().iterator(); iterator.hasNext();) {
				ExpenseInfo objExpenseInfo = (ExpenseInfo) iterator.next();
				mgr.deletePersistent(objExpenseInfo);
			}
			
			
			//Updating new expenseInfo
			for (Iterator iterator = expenseentity.getListIncludeMemberInfo().iterator(); iterator.hasNext();) {
				ExpenseInfo objExpenseInfo = (ExpenseInfo) iterator.next();
				objExpenseInfo.setExpenseId(expenseentity.getExpenseEntityId());
			}
			
			for (Iterator iterator = expenseentity.getListPayersInfo().iterator(); iterator.hasNext();) {
				ExpenseInfo objExpenseInfo = (ExpenseInfo) iterator.next();
				objExpenseInfo.setExpenseId(expenseentity.getExpenseEntityId());
			}
			
			mgr.makePersistent(expenseentity);
			
			
			
			objGroup.setMembers(null);//Removing members as they are not embedded.
			
			
			mgr.makePersistent(objGroup);
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage() + e.getStackTrace().toString(), null);
			throw e;
		} finally {
			mgr.close();
		}
		return expenseentity;
	}
	
	
	
	@SuppressWarnings("unchecked")
	@ApiMethod(
 			httpMethod = "POST", 
 			name = "expense.deleteupdateiou",
			path="expenseentity/deleteandupdateiou"
			)
	public ExpenseEntity deleteupdateiou(ExpenseEntity expenseentity) throws Exception {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsExpenseEntity(expenseentity)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			
			
			Group objGroup = expenseentity.getGroup();
			expenseentity.setGroup(null);
			
			//Attaching to JDO
			expenseentity = mgr.getObjectById(ExpenseEntity.class, expenseentity.getExpenseEntityId());
			
			this.updateIOU(expenseentity, objGroup.getIouList(), "delete");

			//Removing related expenseinfo
			for (Iterator iterator = expenseentity.getListIncludeMemberInfo().iterator(); iterator.hasNext();) {
				ExpenseInfo objExpenseInfo = (ExpenseInfo) iterator.next();
				mgr.deletePersistent(objExpenseInfo);
				
			}
			
			for (Iterator iterator = expenseentity.getListPayersInfo().iterator(); iterator.hasNext();) {
				ExpenseInfo objExpenseInfo = (ExpenseInfo) iterator.next();
				mgr.deletePersistent(objExpenseInfo);
			}
			
			objGroup.setMembers(null);//Removing members as they are not embedded.
			
			
			mgr.makePersistent(objGroup);
			
			
			mgr.deletePersistent(expenseentity);
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage() + e.getStackTrace().toString() , null);
			throw e;
		} finally {
			mgr.close();
		}
		return null;
	}
	
	

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @return The deleted entity.
	 * @throws Exception 
	 */
	public ExpenseEntity removeExpenseEntity(@Named("id") String id) throws Exception {
		PersistenceManager mgr = getPersistenceManager();
		ExpenseEntity expenseentity = null;
		try {
			expenseentity = mgr.getObjectById(ExpenseEntity.class, id);
			mgr.deletePersistent(expenseentity);
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage() + e.getStackTrace().toString(), null);
			throw e;
		} finally {
			mgr.close();
		}
		return expenseentity;
	}

	private boolean containsExpenseEntity(ExpenseEntity expenseentity) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(ExpenseEntity.class,
					expenseentity.getExpenseEntityId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			new MailUtil().sendMail("Exception", ex.getStackTrace().toString(), null);
			contains = false;
			throw ex;
		} finally {
			mgr.close();
		}
		return contains;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
