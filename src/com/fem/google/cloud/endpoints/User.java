package com.fem.google.cloud.endpoints;

import java.io.Serializable;
import java.util.Date;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class User implements Serializable {
	@Override
	public String toString() {
		return "User [userId=" + userId + ", userName=" + userName
				+ ", firstName=" + firstName + ", lastName=" + lastName
				+ ", fullName=" + fullName + ", password=" + password
				+ ", imgUrl=" + imgUrl + ", facebookId=" + facebookId
				+ ", googleId=" + googleId + ", email=" + email + ", mergeId="
				+ mergeId + ", loginType=" + loginType + ", lastLoggedInAt="
				+ lastLoggedInAt + ", accessToken=" + accessToken + ", phone="
				+ phone + ", facebookEmail=" + facebookEmail + ", userType="
				+ userType + "]";
	}
	private static final long serialVersionUID = 6181797377962410874L;

	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    @Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
    private String userId;
	
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String userName;

	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String firstName;

	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String lastName;
	
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String fullName;
	
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String password;

	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String imgUrl;

	private String facebookId;
	
	private String googleId;

	private String email;
	private String mergeId;

	private String loginType;
	private Date lastLoggedInAt;
	
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String accessToken;
	private String phone;
	
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String facebookEmail;
	
	private String userType="dummy";

	
	
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getFullName() {
		return fullName;
	}
	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getFacebookId() {
		return facebookId;
	}
	public void setFacebookId(String facebookId) {
		this.facebookId = facebookId;
	}
	public String getGoogleId() {
		return googleId;
	}
	public void setGoogleId(String googleId) {
		this.googleId = googleId;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getMergeId() {
		return mergeId;
	}
	public void setMergeId(String mergeId) {
		this.mergeId = mergeId;
	}
	public String getLoginType() {
		return loginType;
	}
	public void setLoginType(String loginType) {
		this.loginType = loginType;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public Date getLastLoggedInAt() {
		return lastLoggedInAt;
	}
	public void setLastLoggedInAt(Date lastLoggedInAt) {
		this.lastLoggedInAt = lastLoggedInAt;
	}
	public String getAccessToken() {
		return accessToken;
	}
	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getFacebookEmail() {
		return facebookEmail;
	}
	public void setFacebookEmail(String facebookEmail) {
		this.facebookEmail = facebookEmail;
	}
	public String getUserType() {
		return userType;
	}
	public void setUserType(String userType) {
		this.userType = userType;
	}
	public String getImgUrl() {
		return imgUrl;
	}
	public void setImgUrl(String imgUrl) {
		this.imgUrl = imgUrl;
	}
	
	
	
}
