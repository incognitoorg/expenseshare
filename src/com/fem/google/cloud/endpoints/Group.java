package com.fem.google.cloud.endpoints;

import java.sql.Date;
import java.util.ArrayList;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.datanucleus.annotations.Unowned;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class Group {

	
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private String groupId;
	
	private String createdBy;
	
	private String editedBy;
	
	private Date createdAt;
	
	private Date editedAt;
	
	
	private boolean isActive=true;
	
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String groupName;
	
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String groupType;

	private String ownerId;
	
	private ArrayList<User> members;
	private ArrayList<String> membersIdList;
	
	
	@Persistent
	@Unowned
	private ArrayList<IOU> iouList;
	
	public String getGroupName() {
		return groupName;
	}
	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}
	public String getGroupType() {
		return groupType;
	}
	public void setGroupType(String groupType) {
		this.groupType = groupType;
	}
	public String getOwnerId() {
		return ownerId;
	}
	public void setOwnerId(String ownerId) {
		this.ownerId = ownerId;
	}
	public ArrayList<User> getMembers() {
		return members;
	}
	public void setMembers(ArrayList<User> members) {
		this.members = members;
	}
	
	
	public ArrayList<String> getMembersIdList() {
		return membersIdList;
	}
	public void setMembersIdList(ArrayList<String> membersIdList) {
		this.membersIdList = membersIdList;
	}
	public ArrayList<IOU> getIouList() {
		return iouList;
	}
	public void setIouList(ArrayList<IOU> iouList) {
		this.iouList = iouList;
	}
	public boolean isActive() {
		return isActive;
	}
	public void setActive(boolean isActive) {
		this.isActive = isActive;
	}
	public String getCreatedBy() {
		return createdBy;
	}
	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}
	public String getEditedBy() {
		return editedBy;
	}
	public void setEditedBy(String editedBy) {
		this.editedBy = editedBy;
	}
	public Date getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}
	public Date getEditedAt() {
		return editedAt;
	}
	public void setEditedAt(Date editedAt) {
		this.editedAt = editedAt;
	}
	public String getGroupId() {
		return groupId;
	}
	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}
	
	

	
	
	
}
