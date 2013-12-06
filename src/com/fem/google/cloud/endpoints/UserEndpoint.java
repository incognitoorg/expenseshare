package com.fem.google.cloud.endpoints;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityNotFoundException;

import org.datanucleus.util.StringUtils;

import com.fem.util.MailUtil;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

@Api(name = "userendpoint")
public class UserEndpoint {
	private static final Logger log = Logger.getLogger(UserEndpoint.class.getName());
	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	public CollectionResponse<User> listUser(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<User> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(User.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<User>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (User obj : execute)
				;
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage(), null);
		} finally {
			mgr.close();
		}

		return CollectionResponse.<User> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	public User getUser(@Named("id") String id) {

		PersistenceManager mgr = getPersistenceManager();
		User user = null;
		try {
			user = mgr.getObjectById(User.class, id);
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured while getting user data", e.getMessage() + "\n\n\n"+ e.getStackTrace() , null);
		} finally {
			mgr.close();
		}
		return user;

	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param user the entity to be inserted.
	 * @return The inserted entity.
	 */
	public User insertUser(User user) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			/*if (containsUser(user)) {
				throw new EntityExistsException("Object already exists");
			}*/
			mgr.makePersistent(user);
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage(), null);
		} finally {
			mgr.close();
		}
		return user;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param user the entity to be updated.
	 * @return The updated entity.
	 */
	public User updateUser(User user) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsUser(user)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(user);
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage(), null);
		} finally {
			mgr.close();
		}
		return user;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @return The deleted entity.
	 */
	public User removeUser(@Named("id") String id) {
		PersistenceManager mgr = getPersistenceManager();
		User user = null;
		try {
			user = mgr.getObjectById(User.class, id);
			mgr.deletePersistent(user);
		} catch(Exception e) {
			new MailUtil().sendMail("Exception occured ", e.getMessage(), null);
		} finally {
			mgr.close();
		}
		return user;
	}

	private boolean containsUser(User user) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(User.class, user.getUserId());
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


	/***************** Automatic code generation end  ***************/


	/***************** Custom endpoint methods start ****************/


	/**
	 * This method is supposed to retrieve all the groups of a user with id.
	 * @param id UserId of the user whose groups to be fetched
	 * */
	@SuppressWarnings("unchecked")
	@ApiMethod(
			httpMethod = "GET", 
			name = "user.groups",
			path="user/{id}/group"
			)
	public List<Group> getGroups(@Named("id") String id) {
		
		List<Group> alGroups = new ArrayList<Group>();
		GroupMemberMapping groupMemberMapping = null;
		int iCounter = 0;

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query q = pm.newQuery(GroupMemberMapping.class);

		q.setFilter("userId == userIdParam");
		q.declareParameters("String userIdParam");

		List<GroupMemberMapping> execute = null;

		execute = (List<GroupMemberMapping>)q.execute(id);

		while(iCounter < execute.size()){
			groupMemberMapping = execute.get(iCounter++);

			q = pm.newQuery(Group.class);

			q.setFilter("groupId == groupIdParam");
			q.declareParameters("String groupIdParam");
			//alGroups.addAll((List<Group>) q.execute(groupMemberMapping.getGroupId()));
			//TODO : Doing too many queries here, Need to put in transaction and optimize using single query
			alGroups.add(new GroupEndpoint().getGroup(groupMemberMapping.getGroupId()));

		}
		return alGroups;
	}

	/**
	 * This method is supposed to retrieve group information of specific group.
	 * @param userId UserId of the user whose groups to be fetched
	 * @param groupId Group id of which information is to be fetched.
	 * */
	@SuppressWarnings("unchecked")
	@ApiMethod(
			httpMethod = "GET", 
			name = "user.groups.group",
			path="user/{userId}/group/{groupId}"
			)
	public Group getGroup(@Named("userId") String userId, @Named("groupId") String groupId) {
		Group objGroup = new Group();

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query q = pm.newQuery(Group.class);

		q.setFilter("groupId == groupIdParam");
		q.declareParameters("String groupIdParam");

		List<Group> groups = (List<Group>) q.execute(groupId);

		objGroup = groups.get(0);

		return objGroup;
	}




	/**
	 * Test method which shows what will be protocol for implementing search method
	 * */
	@ApiMethod(
			httpMethod = "GET", 
			name = "user.search",
			path = "user/search/{queryString}")
	public List<User> search(@Named("queryString") String queryString) 
			throws Exception {
		/* if (guser == null) {
		      throw new UnauthorizedException(CustomErrors.MUST_LOG_IN.toString());
		    }
		 */
		List<User> returnList = new ArrayList<User>();
		/*Results<ScoredDocument> searchResults = INDEX.search(queryString);

		    for (ScoredDocument scoredDoc : searchResults) {
		      Field fieldId = scoredDoc.getOnlyField("id");
		      if (fieldId == null || fieldId.getText() == null)
		        continue;

		      long userId = Long.parseLong(fieldId.getText());
		      if (userId != -1) {
		        User p = getUser(userId, guser);
		        returnList.add(p);
		      }
		    }*/
		return returnList;
	}

	@ApiMethod(
			httpMethod = "POST", 
			name = "user.login",
			path="user/doLogin"
			)
	public User doLogin(User user) {

		Date loginDate = new Date();
		
		user = getOrInsertUser(user, loginDate, UUID.randomUUID().toString());

		boolean isNewUser = false;

		if(!loginDate.after(user.getLastLoggedInAt())) {
			isNewUser = true;
		}


		/*if(isNewUser && !StringUtils.isEmpty(user.getEmail())){

			log.info("User email " + user.getEmail());

			String msgContent = "<table width='700px' border='0px' cellspacing='0px' cellpadding='0px' align='center'>"
					+ "<tbody><tr>"
					+ "<td width='700px' height='12px'>"
					+ "<img src='http://www.infibeam.com/assets/skins/common/images/email/top.jpg' width='700px' height='12px' align='center' border='0px'>"
					+ "</td>"
					+ "</tr>"
					+ "<tr>"
					+ "<td width='700px' height='100px' style='border-left:1px;border-right:1px;border-style:solid;border-color:#cccccc' align='center'>"
					+ "<a href='http://www.infibeam.com/' target='_blank'>"
					+ "<img src='http://www.hollywoodreporter.com/sites/default/files/2012/01/incognito_buck_logo_a_l.jpg' alt='xpenseshare.in' border='0px' align='center'>"
					+ "</a>"
					+ "</td>"
					+ "</tr>"
					+ "<tr>"
					+ "<td style='padding-left:15px;padding-right:15px;padding-top:none;letter-spacing:normal;border-right-style:solid;padding-bottom:15px;line-height:18px;border-left-color:#cccccc;border-left-style:solid;border-right-color:#cccccc;font-size:13px;border-right-width:1px;font-family:verdana,arial,helvetica,sans-serif;border-left-width:1px'>"
					+ "Hi " + user.getFirstName() + " " + user.getLastName() + ","
					+ "<br><br>"
					+ "<b>"
					+ "Welcome to <span class='il'>XpenseShare</span>.com - its good to have you on board!"
					+ "</b>"
					+ "<br>"
					+ "<p>"
					+ "Streamline your expense tracking & settlement and forget keeping mental notes."
					+ "</p>"
					+ "<p>"
					+ "If you wish to update your profile, you may do so <a href='http://fem.expenseshare.in/#profile' target='_blank'>here</a>."
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
					+ "<td background='http://www.infibeam.com/assets/skins/common/images/email/btm_bg.jpg' height='37px' width='700px' style='font-size:11px;font-family:verdana,arial,helvetica,sans-serif;color:#fff;padding:0px 10px' valign='middle'>"
					+ "<b>Follow Us On</b> &nbsp;"
					+ "<img src='http://www.infibeam.com/assets/skins/common/images/email/social_icon.png' alt='Facebook / Twitter / Blog' width='48px' height='21px' border='0px' align='absmiddle' usemap='#1404dc1a58831188_Map2'>"
					+ "</span>"
					+ "Copyright � 2013 <span class='il'>XpenseShare</span>.com and Affiliates"
					+ "</td>"
					+ "</tr>"
					+ "</tbody></table>";
			HashMap<String, String> hmEmailIds = new HashMap<String, String>();
			hmEmailIds.put(user.getEmail(), user.getFullName());

			new MailUtil().sendMail("Greetings...", msgContent, hmEmailIds);
		}*/

		return user;
	}

	//TODO : I will kill myself in past for writing this bad code.
	@SuppressWarnings("unchecked")
	@ApiMethod(path="userendpoint/user/getorinsertuser")
	public User getOrInsertUser(User user, 
			@Nullable @Named("lastLoggedIn") Date lastLoggedIn, 
			@Nullable @Named("authToken") String authToken){

		String apiId = null;
		String loginType = user.getLoginType();
		String googleId = user.getGoogleId();
		String facebookId = user.getFacebookId();
		List<User> execute = null;

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query q = pm.newQuery(User.class);

		String email = user.getEmail();




		if(!StringUtils.isEmpty(email)){
			q.setFilter("email == emailParam");
			q.declareParameters("String emailParam");
			execute = (List<User>)q.execute(email);


			if(execute.size()>1){
				//TODO : User have got  multiple accounts. How can we merge this shit.
			}

			if(execute.size()>0){
				user = execute.get(0);
			} else {
				user = this.insertUser(user);
			}

			if(lastLoggedIn!= null){
				user.setLastLoggedInAt(lastLoggedIn);
				user.setAccessToken(authToken);
				pm.makePersistent(user);
			}
			user.setLoginType(loginType);
			user.setGoogleId(googleId);
			user.setFacebookId(facebookId);
			return user;
		}




		/*if("google".equalsIgnoreCase(user.getLoginType())) {
			apiId = user.getGoogleId();
			q.setFilter("googleId == googleIdParam");
			q.declareParameters("String googleIdParam");
		} else */
		if("facebook".equalsIgnoreCase(loginType)) {
			apiId = user.getFacebookId();
			q.setFilter("facebookId == facebookIdParam");
			q.declareParameters("String facebookIdParam");
		} else {
			/*apiId = user.getEmail();
			q.setFilter("email == emailIdParam");
			q.declareParameters("String emailIdParam");*/

			//TODO : In google contacts, you may get entity which might have only phone
			//This presents opportunity to present user to login with phone.
			/*String phone = user.getPhone();
			q.setFilter("phone == phoneParam");
			q.declareParameters("String phoneParam");*/

		}



		if(apiId==null){
			user = this.insertUser(user);
		} else {
			execute = (List<User>)q.execute(apiId);
			if(execute.size()>0){
				user = execute.get(0);
				if(StringUtils.isEmpty(user.getEmail())){
					pm.makePersistent(user);
				}
			} else {
				user = this.insertUser(user);
			}
		}


		System.out.println("Logged in successfully");

		user.setLoginType(loginType);
		user.setGoogleId(googleId);
		user.setFacebookId(facebookId);


		if(lastLoggedIn!= null){
			
			if(user.getLastLoggedInAt()==null && !StringUtils.isEmpty(user.getEmail())){

				log.info("User email " + user.getEmail());

				String msgContent = "";
				HashMap<String, String> hmEmailIds = new HashMap<String, String>();
				
				if(user.getEmail() != null) {
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
							+ "Hi " + user.getFirstName() + " " + user.getLastName() + ","
							+ "<br><br>"
							+ "<b>"
							+ "Welcome to <span class='il'>XpenseShare</span>.com - its good to have you on board!"
							+ "</b>"
							+ "<br>"
							+ "<p>"
							+ "Streamline your expense tracking & settlement and forget keeping mental notes."
							+ "</p>"
							+ "<p>"
							+ "If you wish to update your profile, you may do so <a href='http://www.expenseshare.in/#profile' target='_blank'>here</a>."
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
							+ "Copyright � 2013 <span class='il'>XpenseShare</span>.com and Affiliates"
							+ "</td>"
							+ "</tr>"
							+ "</tbody></table>";
					hmEmailIds.put(user.getEmail(), user.getFullName());
					new MailUtil().sendMail("Greetings...", msgContent, hmEmailIds);
				} else {
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
							+ "Hi " + user.getFirstName() + " " + user.getLastName() + ","
							+ "<br><br>"
							+ "<b>"
							+ "Welcome to <span class='il'>XpenseShare</span>.com - its good to have you on board!"
							+ "</b>"
							+ "<br>"
							+ "<p>"
							+ "Streamline your expense tracking & settlement and forget keeping mental notes."
							+ "</p>"
							+ "<p>"
							+ "One of your friend has added you on <span class='il'>XpenseShare</span>.com to share your expenses. Please <a href='http://www.expenseshare.in/#dashboard' target='_blank'>login</a> to view the expenses shared with you."
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
							+ "Copyright � 2013 <span class='il'>XpenseShare</span>.com and Affiliates"
							+ "</td>"
							+ "</tr>"
							+ "</tbody></table>";
					hmEmailIds.put(user.getFacebookEmail(), user.getFullName());
					new MailUtil().sendMail("Welcome to Xpense Share!!!", msgContent, hmEmailIds);
				}

			}
			
			user.setLastLoggedInAt(lastLoggedIn);
			user.setAccessToken(authToken);
			pm.makePersistent(user);
		}

		return user;
	}


	/**
	 * This method is supposed to retrieve all the expenses of a user with id.
	 * @param id UserId of the user whose expenses to be fetched
	 * */
	@SuppressWarnings("unchecked")
	@ApiMethod(
			httpMethod = "GET", 
			name = "user.expenses",
			path="user/{id}/expenses"
			)
	public List<ExpenseEntity> getExpenses(@Named("id") String id) {

		List<ExpenseEntity> alExpenses = null;

		HashMap<String, ExpenseEntity> hmExpenses = new HashMap<String, ExpenseEntity>();

		ExpenseInfo objExpenseInfo = null;
		int iCounter = 0;

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query q = pm.newQuery(ExpenseInfo.class);

		q.setFilter("userId == userIdParam");
		q.declareParameters("String userIdParam");

		List<ExpenseInfo> execute = null;

		execute = (List<ExpenseInfo>)q.execute(id);

		while(iCounter < execute.size()){
			objExpenseInfo = execute.get(iCounter++);

			q = pm.newQuery(ExpenseEntity.class);

			q.setFilter("expenseEntityId == expenseIdParam");
			q.declareParameters("String expenseIdParam");

			List<ExpenseEntity> listExpenseResult = (List<ExpenseEntity>)q.execute(objExpenseInfo.getExpenseId());
			hmExpenses.put(listExpenseResult.get(0).getExpenseEntityId(), listExpenseResult.get(0));
		}

		alExpenses = new ArrayList<ExpenseEntity>(hmExpenses.values());

		return alExpenses;
	}


	/**
	 * This method is supposed to retrieve all the expenses of a user with id.
	 * @param id UserId of the user whose expenses to be fetched
	 * */
	@SuppressWarnings("unchecked")
	@ApiMethod(
			httpMethod = "GET", 
			name = "user.iou",
			path="user/{id}/iou"
			)
	public List<IOU> getIOU(@Named("id") String id) {

		/*		List<IOU> alIOU = null;

		HashMap<String, ExpenseEntity> hmExpenses = new HashMap<String, ExpenseEntity>();*/


		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query q = pm.newQuery(IOU.class);

		q.setFilter("fromUserId == userIdParam");
		q.setFilter("toUserId == userIdParam");
		q.declareParameters("String userIdParam");
		q.declareParameters("String userIdParam");

		List<IOU> execute = null;
		execute = (List<IOU>)q.execute(id);

		/*while(iCounter < execute.size()){
			objIOU = execute.get(iCounter++);

			q = pm.newQuery(ExpenseEntity.class);

			q.setFilter("expenseEntityId == expenseIdParam");
			q.declareParameters("String expenseIdParam");

			List<ExpenseEntity> listExpenseResult = (List<ExpenseEntity>)q.execute(objExpenseInfo.getExpenseId());
			hmExpenses.put(listExpenseResult.get(0).getExpenseEntityId(), listExpenseResult.get(0));
		}

		alExpenses = new ArrayList<ExpenseEntity>(hmExpenses.values());
		 */
		return execute;
	}

}



