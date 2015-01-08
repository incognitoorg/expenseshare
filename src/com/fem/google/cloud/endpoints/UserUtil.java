package com.fem.google.cloud.endpoints;

import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import org.datanucleus.util.StringUtils;

public class UserUtil {
	
	public static User getOrInsertUser(PersistenceManager pm, User user) throws Exception{

		String apiId = null;
		String loginType = user.getLoginType();
		String googleId = user.getGoogleId();
		String facebookId = user.getFacebookId();
		List<User> execute = null;
		String email = user.getEmail();
		String userId = user.getUserId();
		
		//Client is coming with userId. Check if user already available if yes return it.
		if(userId!=null){
			User userFromDataStore = (User)pm.getObjectById(userId);
			if(userFromDataStore!=null){
				return userFromDataStore;
			}
		}

		
		Query q = pm.newQuery(User.class);
		
		/*
		 * Following block works for cases
		 * 1. Facebook login by user
		 * 2. Friend added using facebook.
		 * */
		if("facebook".equalsIgnoreCase(loginType)) {
			apiId = user.getFacebookId();
			q.setFilter("facebookId == facebookIdParam");
			q.declareParameters("String facebookIdParam");
			
			execute = (List<User>)q.execute(apiId);
			if(execute.size()>0){
				user = execute.get(0);
			} else {
				user = new UserEndpoint().insertUser(user);
			}
			return user;
			
		} 
		
		
		/*
		 * Following block works for cases
		 * 1. Friend added from textbox with or without email
		 * */
		else if("offline".equalsIgnoreCase(loginType)){
			user = new UserEndpoint().insertUser(user);
			return user;
		}


		/*
		 * Following block works for cases
		 * 1. Google login
		 * 2. Email and password login.
		 * 3. Friend added using google contacts.
		 * */
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
				
				//User is not in the system. And is trying email login. Must return error.
				if(user.getLoginType().equals("email")){
					return null;
				}
				
				//User is not in the system. Making the entry for first time.
				user = new UserEndpoint().insertUser(user);
			}

			/*//User is logging into application. So update lastLoggedIn timestamp.
			*/
			
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
		return null;
	}
}
