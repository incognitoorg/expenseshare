package com.fem.google.cloud.endpoints;

import java.util.ArrayList;

import javax.jdo.annotations.Embedded;
import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class Group {

	
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    @Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
    private String groupId;

	
	private String groupName;
	private String groupType;
	private String ownerId;
	
	private ArrayList<User> members;
	private ArrayList<String> membersIdList;
	
	@Persistent
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
	
	public String getGroupId() {
		return groupId;
	}
	public void setGroupId(String groupId) {
		this.groupId = groupId;
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
	
	

	
	
	
}
