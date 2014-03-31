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
import org.mortbay.util.ajax.JSON;
import org.w3c.dom.UserDataHandler;

import com.fem.util.MailUtil;
import com.fem.util.TemplateUtil;
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
			@Nullable @Named("limit") Integer limit) throws Exception{

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
			new MailUtil().sendToAdmin("Exception occured ", e.getMessage());
			throw e;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<User> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	
	private String getStackTrace (StackTraceElement[] stackTrace){
		String sStackTrace = "";
		for (StackTraceElement ste : stackTrace) {
			sStackTrace += ste +"<br>" ;
		}
		return sStackTrace;
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
			new MailUtil().sendToAdmin("Exception occured while getting user data, userId :" + id , e.getMessage() + "<br><br><br>"+ this.getStackTrace(e.getStackTrace()));
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
	 * @throws Exception 
	 */
	public User insertUser(User user) throws Exception {
		
		log.info(user.toString());
		PersistenceManager mgr = getPersistenceManager();
		try {
			/*if (containsUser(user)) {
				throw new EntityExistsException("Object already exists");
			}*/
			if(StringUtils.isEmpty( user.getFullName())){
				throw new IllegalArgumentException("Full Name not provided");
			}
			
			if(user.getLoginType().equals("google") && StringUtils.isEmpty(user.getEmail())){
				throw new IllegalArgumentException("Using google login but email not provided.");
			}
			
			if(user.getLoginType().equals("facebook") && StringUtils.isEmpty(user.getFacebookId())){
				throw new IllegalArgumentException("Using facebook login but facebook id not provided.");
			}
			
			mgr.makePersistent(user);
		} catch(Exception e) {
			new MailUtil().sendToAdmin("Exception occured ", e.getMessage());
			throw e;
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
			new MailUtil().sendToAdmin("Exception occured ", e.getMessage());
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
			new MailUtil().sendToAdmin("Exception occured ", e.getMessage());
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
			new MailUtil().sendToAdmin("Exception", ex.getStackTrace().toString());
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
	 * @throws Exception 
	 * */
	@SuppressWarnings("unchecked")
	@ApiMethod(
			httpMethod = "GET", 
			name = "user.groups",
			path="user/{id}/group"
			)
	public List<Group> getGroups(@Named("id") String id) throws Exception {
		List<Group> alGroups = new ArrayList<Group>();
		log.info("User Id : " + id);
		try {
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
		} catch (Exception e) {
			new MailUtil().sendToAdmin("Exception occured while getting groups of user, userId :" + id , e.getMessage() + "<br><br><br>"+ this.getStackTrace(e.getStackTrace()) );
			throw e;
		}
		return alGroups;
	}

	/**
	 * This method is supposed to retrieve group information of specific group.
	 * @param userId UserId of the user whose groups to be fetched
	 * @param groupId Group id of which information is to be fetched.
	 * @throws Exception 
	 * */
	@SuppressWarnings("unchecked")
	@ApiMethod(
			httpMethod = "GET", 
			name = "user.groups.group",
			path="user/{userId}/group/{groupId}"
			)
	public Group getGroup(@Named("userId") String userId, @Named("groupId") String groupId) throws Exception {
		Group objGroup = new Group();
		objGroup = new GroupEndpoint().getGroup(groupId);
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
			name = "user.setpassword",
			path="user/setpassword"
			)
	public User setPassword(User user) throws Exception {
		
		PersistenceManager pm = PMF.get().getPersistenceManager();
		User userFromDataStore = getOrInsertUser(pm, user/*, loginDate, UUID.randomUUID().toString()*/);
		
		if(!userFromDataStore.getAccessToken().equals(user.getAccessToken())){
			throw new IllegalAccessError("Trying to set password without verifying from email." + user);
		}
		userFromDataStore.setPassword(user.getPassword());
		userFromDataStore.setAccessToken(null);
		pm.makePersistent(userFromDataStore);
		
		return userFromDataStore;
	}
	
	@ApiMethod(
			httpMethod = "POST", 
			name = "user.register",
			path="user/register"
			)
	public User regsiter(User user) throws Exception {
		
		PersistenceManager pm = PMF.get().getPersistenceManager();
		User userFromDataStore = getOrInsertUser(pm, user/*, loginDate, UUID.randomUUID().toString()*/);
		
		//This accessToken should be used for verifying the user while changing the password.
		String accessToken = UUID.randomUUID().toString();
		String setPassWordURL = "//xpenseshare.com/setpassword.html?email=" + user.getEmail()+ " + &accessToken=" + accessToken;
		//Send email to registered email.
		//TODO : Create email template for this email.
		new MailUtil().sendToOne("Set password for your account", "<a href='" + setPassWordURL + "'>" + setPassWordURL  + "</a>", user.getEmail());
		user.setAccessToken(accessToken);
		pm.makePersistent(user);
		
		return user;
	}
	
	@ApiMethod(
			httpMethod = "POST", 
			name = "user.login",
			path="user/doLogin"
			)
	public User doLogin(User user) throws Exception {

		log.info(user.toString());
		
		try {
			
			PersistenceManager pm = PMF.get().getPersistenceManager();
			user = getOrInsertUser(pm, user/*, loginDate, UUID.randomUUID().toString()*/);
			
			if(user.getLastLoggedInAt()==null && !StringUtils.isEmpty(user.getEmail())){

				log.info("User email " + user.getEmail());

				HashMap<String, String> hmEmailIds = new HashMap<String, String>();
				
				StringBuilder msgContent = null;
				
				msgContent = new StringBuilder(TemplateUtil.getTemplate("USER_CREATED_MAIL_TEMPLATE"));
				
				int index = msgContent.indexOf("??userfirstname??");
				msgContent.replace(index, index + 17, user.getFirstName() == null ? "" : user.getFirstName());
				index = msgContent.indexOf("??userlastname??");
				msgContent.replace(index, index + 16, user.getLastName() == null ? "" : user.getLastName());
				
				if(user.getEmail() != null) {
					hmEmailIds.put(user.getEmail(), user.getFullName());
					new MailUtil().sendToAll("Greetings...", msgContent.toString(), hmEmailIds);
				} else {
					hmEmailIds.put(user.getFacebookEmail(), user.getFullName());
					new MailUtil().sendToAll("Welcome to Xpense Share!!!", msgContent.toString(), hmEmailIds);
				}

			}
			
			Date loginDate = new Date();
			user.setLastLoggedInAt(loginDate);
			user.setAccessToken(UUID.randomUUID().toString());
			pm.makePersistent(user);
			
			
		} catch (Exception e){
			new MailUtil().sendToAdmin(" Exception occured while loggin in." + e.getMessage() , "Exception occured while loggin in. "+"  User : " + user + " \n "+ e.getMessage() + e.getMessage() + "\n\n" + e.getStackTrace());
			throw e;
		}
		

		return user;
	}

	@SuppressWarnings("unchecked")
	@ApiMethod(path="userendpoint/user/getorinsertuser")
	public User getOrInsertUser(PersistenceManager pm, User user/*, 
			@Nullable @Named("lastLoggedIn") Date lastLoggedIn, 
			@Nullable @Named("authToken") String authToken*/) throws Exception{

		String apiId = null;
		String loginType = user.getLoginType();
		String googleId = user.getGoogleId();
		String facebookId = user.getFacebookId();
		List<User> execute = null;
		String email = user.getEmail();

		
		Query q = pm.newQuery(User.class);

		//Client is coming with the email. Either login or friend with email availability (Non facebook)
		if(!StringUtils.isEmpty(email)){
			User userFromDataStore = null;
			q.setFilter("email == emailParam");
			q.declareParameters("String emailParam");
			execute = (List<User>)q.execute(email);

			if(execute.size()>1){
				//TODO : User have got  multiple accounts. How can we merge this shit.
			}

			if(execute.size()>0){
				//User is already in the system. 
				for (int i = 0; i < execute.size(); i++) {
					if(execute.get(i).getLastLoggedInAt()!=null){
						userFromDataStore = execute.get(i);
						break;
					}
				}
				
				if(userFromDataStore==null){
					userFromDataStore = execute.get(0);
				}
				
			} else {
				//User is not in the system. Making the entry for first time.
				user = this.insertUser(user);
			}

			/*//User is logging into application. So update lastLoggedIn timestamp.
			if(lastLoggedIn!= null){
				user.setLastLoggedInAt(lastLoggedIn);
				user.setAccessToken(authToken);
				pm.makePersistent(user);
			}*/
			
			if(userFromDataStore!=null){
				if(userFromDataStore.getFacebookEmail()==null && user.getFacebookEmail()!=null) {
					userFromDataStore.setFacebookEmail(user.getFacebookEmail());
				}
				if(userFromDataStore.getFacebookId()==null && user.getFacebookId()!=null){
					userFromDataStore.setFacebookId(user.getFacebookId());
				}
				if(userFromDataStore.getGoogleId()==null && user.getGoogleId()!=null){
					user.setGoogleId(user.getGoogleId());
				}
				if((userFromDataStore.getEmail()==null && user.getEmail()!=null) ){
					userFromDataStore.setEmail(user.getEmail());
				}
				if(userFromDataStore.getImgUrl()==null && user.getImgUrl()!=null) {
					userFromDataStore.setImgUrl(user.getImgUrl());
				}
				if(userFromDataStore.getPhone()==null &&  user.getPhone()!=null){
					userFromDataStore.setPhone(user.getPhone());
				}
				user = userFromDataStore;
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
			throw new IllegalArgumentException("Neither email provided nor apiId aka facebook id was provided. Front end is having some problems. Go check.\n\nUser info : " + user);
		} else {
			execute = (List<User>)q.execute(apiId);
			if(execute.size()>0){
				user = execute.get(0);
				//I dont know what was I thinking, get the user from datastore and then write it again if it has no email. :D
				/*if(StringUtils.isEmpty(user.getEmail())){
					pm.makePersistent(user);
				}*/
			} else {
				user = this.insertUser(user);
			}
		}

		/*user.setLoginType(loginType);
		user.setGoogleId(googleId);
		user.setFacebookId(facebookId);*/

		/*if(lastLoggedIn!= null){
			
			if(user.getLastLoggedInAt()==null && !StringUtils.isEmpty(user.getEmail())){

				log.info("User email " + user.getEmail());

				HashMap<String, String> hmEmailIds = new HashMap<String, String>();
				
				StringBuilder msgContent = null;
				
				msgContent = new StringBuilder(TemplateUtil.getTemplate("USER_CREATED_MAIL_TEMPLATE"));
				
				int index = msgContent.indexOf("??userfirstname??");
				msgContent.replace(index, index + 17, user.getFirstName() == null ? "" : user.getFirstName());
				index = msgContent.indexOf("??userlastname??");
				msgContent.replace(index, index + 16, user.getLastName() == null ? "" : user.getLastName());
				
				if(user.getEmail() != null) {
					hmEmailIds.put(user.getEmail(), user.getFullName());
					new MailUtil().sendToAll("Greetings...", msgContent.toString(), hmEmailIds);
				} else {
					hmEmailIds.put(user.getFacebookEmail(), user.getFullName());
					new MailUtil().sendToAll("Welcome to Xpense Share!!!", msgContent.toString(), hmEmailIds);
				}

			}
			
			user.setLastLoggedInAt(lastLoggedIn);
			user.setAccessToken(authToken);
			pm.makePersistent(user);
		}*/

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

		log.info("User Id : " + id);
		
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
			
			ExpenseEntity expenseEntity = listExpenseResult.get(0);
			expenseEntity.getIOU(); //Touching to fetch
			hmExpenses.put(expenseEntity.getExpenseEntityId(), expenseEntity);
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



