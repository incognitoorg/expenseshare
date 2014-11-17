package com.fem.google.cloud.endpoints;

import java.util.ArrayList;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.datanucleus.annotations.Unowned;
@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class Friendship {
	
	@Override
	public String toString() {
		return "Friendship [id=" + id + ", alGroupIds=" + alGroupIds
				+ ", iouList=" + iouList + "]";
	}

	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private String id;
	
	
	/*@Persistent(defaultFetchGroup = "false")
	private ArrayList<Group> alGroups;*/
	
	
	private ArrayList<String> alGroupIds;

	@Unowned
	private ArrayList<IOU> iouList;
	
	
	/*public ArrayList<Group> getGroups() {
		return alGroups;
	}

	public void setGroups(ArrayList<Group> alGroups) {
		this.alGroups = alGroups;
	}*/


	public ArrayList<String> getGroupIds() {
		return alGroupIds;
	}

	public void setGroupIds(ArrayList<String> alGroupIds) {
		this.alGroupIds = alGroupIds;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public ArrayList<IOU> getIouList() {
		return iouList;
	}

	public void setIouList(ArrayList<IOU> iouList) {
		this.iouList = iouList;
	}
}
