package com.fem.google.cloud.endpoints;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityNotFoundException;

import com.fem.util.MailUtil;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

@Api(name = "groupendpoint")
public class GroupEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	public CollectionResponse<Group> listGroup(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Group> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(Group.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<Group>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Group obj : execute)
				;
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage(), null);
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Group> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 * @throws Exception 
	 */
	public Group getGroup(@Named("id") String id) throws Exception {
		PersistenceManager mgr = getPersistenceManager();
		Group group = null;
		ArrayList<User> alMembers = null;
		try {
			group = mgr.getObjectById(Group.class, id);
			
			alMembers = (ArrayList<User>)group.getMembers().clone();
			
			//TODO : Instead of using for loop, use a select query with in clause if available.
			for (Iterator iterator = group.getMembersIdList().iterator(); iterator.hasNext();) {
				String userId = (String) iterator.next();
				
				//TODO : To put this in transaction
				User objMember = new UserEndpoint().getUser(userId);
				alMembers.add(objMember);
				
			}
			for(IOU objIOU : group.getIouList()){
				objIOU.getFromUserId();//Cause The datastore does not support joins and therefore cannot honor requests to place related objects in the default fetch group. 
			}
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured while getting group data, group Id :" + id , e.getMessage() + "<br><br><br>"+ MailUtil.getStackTrace(e.getStackTrace()) , null);
			throw e;
		} finally {
			mgr.close();
		}
		group.setMembers(alMembers);
		return group;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param group the entity to be inserted.
	 * @return The inserted entity.
	 */
	public Group insertGroup(Group group) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			ArrayList<User> alMembersFromClient = group.getMembers();
			HashMap<String, String> hmUserEmails = new HashMap<String, String>();
			
			ArrayList<User> alTotalMembers = new ArrayList<User>();
			UserEndpoint userEndpoint = new UserEndpoint();
			for (Iterator<User> iterator = alMembersFromClient.iterator(); iterator.hasNext();) {
				User user = (User) iterator.next();
				if(user.getUserId()==null){
					//TODO : To put this in transaction
					user = userEndpoint.getOrInsertUser(user, null, null);
				}
				alTotalMembers.add(user);
			}
			
			
			ArrayList<String> alMembersIdList = new ArrayList<String>();
			group.setMembers(null);
			for (Iterator<User> iterator = alTotalMembers.iterator(); iterator.hasNext();) {
				User user = (User) iterator.next();
				alMembersIdList.add(user.getUserId());
			}
			//Pushing to database since needs group id
			group.setGroupId(UUID.randomUUID().toString());
			group = mgr.makePersistent(group);
			
			for (Iterator<User> iterator = alTotalMembers.iterator(); iterator.hasNext();) {
				User user = (User) iterator.next();
				
				if(user.getEmail() != null) {
					hmUserEmails.put(user.getEmail(), user.getFullName());
				} else {
					hmUserEmails.put(user.getFacebookEmail(), user.getFullName());
				}
				
				GroupMemberMapping objGroupMemberMapping = new GroupMemberMapping();
				objGroupMemberMapping.setGroupId(group.getGroupId());
				objGroupMemberMapping.setUserId(user.getUserId());
				mgr.makePersistent(objGroupMemberMapping);
			}
			
			ArrayList<IOU> alIOU = this.generateIOUEntries(alTotalMembers, group);
			group.setIouList(alIOU);
			
			
			String msgContent = "";
			msgContent = "<table width='700px' border='0px' cellspacing='0px' cellpadding='0px' align='center'>"
					+ "<tbody><tr>"
					+ "<td width='700px' height='12px'>"
					+ "<img src='http://www.expenseshare.in/static-resources/images/email/top.jpg' width='700px' height='12px' align='center' border='0px'>"
					+ "</td>"
					+ "</tr>"
					+ "<tr>"
					+ "<td width='700px' height='100px' style='border-left:1px;border-right:1px;border-style:solid;border-color:#cccccc' align='center'>"
					+ "<a href='http://www.expenseshare.in/' target='_blank'>"
					+ "<img src='http://www.expenseshare.in/static-resources/images/email/incognito_buck_logo.jpg' alt='xpenseshare.in' border='0px' align='center'>"
					+ "</a>"
					+ "</td>"
					+ "</tr>"
					+ "<tr>"
					+ "<td style='padding-left:15px;padding-right:15px;padding-top:none;letter-spacing:normal;border-right-style:solid;padding-bottom:15px;line-height:18px;border-left-color:#cccccc;border-left-style:solid;border-right-color:#cccccc;font-size:13px;border-right-width:1px;font-family:verdana,arial,helvetica,sans-serif;border-left-width:1px'>"
					+ "Hi All,"
					+ "<br><br>"
					+ "<b>"
					+ "Welcome to <span class='il'>XpenseShare</span>.com!"
					+ "</b>"
					+ "<br>"
					+ "<p>"
					+ "You have been added to the " + group.getGroupName() + " by " + group.getCreatedBy() + "."
					+ "</p>"
					+ "<p>"
					+ "Streamline your expense tracking & settlement and forget keeping mental notes."
					+ "</p>"
					+ "<p>"
					+ "If you wish to view your expenses, you may do so <a href='http://www.expenseshare.in/#dashboard' target='_blank'>here</a>."
					+ "</p>"
					+ "<p>"
					+ "You can start your xpense sharing experience right <a href='http://www.expenseshare.in/' target='_blank'>now</a>."
					+ "</p>"
					+ "<p>"
					+ "We hope to see you soon!"
					+ "</p>"
					+ "<br><br>"
					+ "<b>Thank You For Choosing <span class='il'>XpenseShare</span>.com!</b>"
					+ "<br>"
					+ "</td>"
					+ "</tr>"
					+ "<tr>"
					+ "<td background='http://www.expenseshare.in/static-resources/images/email/btm_bg.jpg' height='37px' width='700px' style='font-size:11px;font-family:verdana,arial,helvetica,sans-serif;color:#fff;padding:0px 10px' valign='middle'>"
					+ "<b>Follow Us On</b> &nbsp;"
					+ "<img src='http://www.expenseshare.in/static-resources/images/email/social_icon.png' alt='Facebook / Twitter / Blog' width='48px' height='21px' border='0px' align='absmiddle' usemap='#1404dc1a58831188_Map2'>"
					+ "</span>"
					+ "Copyright © 2013 <span class='il'>XpenseShare</span>.com and Affiliates"
					+ "</td>"
					+ "</tr>"
					+ "</tbody></table>";

			new MailUtil().sendMail("Bingo...", msgContent, hmUserEmails);
			
			group = mgr.makePersistent(group);
			group.setMembersIdList(alMembersIdList);
			
		} catch(Exception e) {
			e.printStackTrace();
			new MailUtil().sendMail("Exception occured ", e.getMessage(), null);
		} finally {
			mgr.close();
		}
		return group;
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
				//pm.makePersistent(objIOU);
			}
		}
		return alIOU;
		
	}
	
	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param group the entity to be updated.
	 * @return The updated entity.
	 */
	public Group updateGroup(Group group) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsGroup(group)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			
			Group earlierGroup = mgr.getObjectById(Group.class, group.getGroupId());
			ArrayList<User> alMembersFromClient = group.getMembers();
			ArrayList<User> alTotalMembers = new ArrayList<User>();
			UserEndpoint userEndpoint = new UserEndpoint();
			for (Iterator<User> iterator = alMembersFromClient.iterator(); iterator.hasNext();) {
				User user = (User) iterator.next();
				if(user.getUserId()==null){
					//TODO : To put this in transaction
					user = userEndpoint.getOrInsertUser(user, null, null);
				}
				alTotalMembers.add(user);
			}
			
			
			ArrayList<String> alMembersIdList = new ArrayList<String>();
			group.setMembers(null);
			for (Iterator<User> iterator = alTotalMembers.iterator(); iterator.hasNext();) {
				User user = (User) iterator.next();
				alMembersIdList.add(user.getUserId());
			}
			group.setMembersIdList(alMembersIdList);

			ArrayList<String> mewlyAddedMembersIdList = (ArrayList<String>)alMembersIdList.clone();
			
			mewlyAddedMembersIdList.removeAll(earlierGroup.getMembersIdList());
			//Pushing to databse since needs group id
			//group = mgr.makePersistent(group);
			
			for (Iterator<String> iterator = mewlyAddedMembersIdList.iterator(); iterator.hasNext();) {
				String userId = (String) iterator.next();
				GroupMemberMapping objGroupMemberMapping = new GroupMemberMapping();
				objGroupMemberMapping.setGroupId(group.getGroupId());
				objGroupMemberMapping.setUserId(userId);
				mgr.makePersistent(objGroupMemberMapping);
			}
			
			
			group.setMembers(null);//Removing members as they are not embedded.
			
			ArrayList<IOU> alAddedIOU =  this.addIOU(earlierGroup.getMembersIdList(), mewlyAddedMembersIdList, group);
			ArrayList<IOU> iouList = group.getIouList();
			iouList.addAll(alAddedIOU);
			
			group.setIouList(iouList);
			mgr.makePersistent(group);
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage(), null);
		} finally {
			mgr.close();
		}
		return group;
	}

	
	private ArrayList<IOU> addIOU(ArrayList<String> oldMembersIdList,
			ArrayList<String> mewlyAddedMembersIdList, Group group) {
		// TODO Auto-generated method stub
		
		ArrayList<IOU> alIOU = new ArrayList<IOU>();
		
		for (int i = 0; i < mewlyAddedMembersIdList.size(); i++) {

			String fromUserId = mewlyAddedMembersIdList.get(i);
			
			for (int j = 0; j < oldMembersIdList.size(); j++) {
				String toUserId = oldMembersIdList.get(j);
				
				IOU objIOU = new IOU();
				objIOU.setGroupId(group.getGroupId());
				objIOU.setFromUserId(fromUserId);
				objIOU.setToUserId(toUserId);
				objIOU.setAmount(0);
				alIOU.add(objIOU);
				//pm.makePersistent(objIOU);
			}
			oldMembersIdList.add(fromUserId);
		}
		
		
		return alIOU;
	}

	
	
	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @return The deleted entity.
	 */
	public Group removeGroup(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		Group group = null;
		try {
			group = mgr.getObjectById(Group.class, id);
			mgr.deletePersistent(group);
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage(), null);
		} finally {
			mgr.close();
		}
		return group;
	}

	private boolean containsGroup(Group group) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Group.class, group.getGroupId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			new MailUtil().sendMail("Exception", ex.getStackTrace().toString(), null);
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
