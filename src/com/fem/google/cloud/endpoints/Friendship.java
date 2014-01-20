package com.fem.google.cloud.endpoints;

import java.util.ArrayList;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;
@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class Friendship {
	
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    @Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
	private String id;
	private ArrayList<Group> alGroups;
	private ArrayList<String> alGroupIds;

	
	
	
	public ArrayList<Group> getGroups() {
		return alGroups;
	}

	public void setGroups(ArrayList<Group> alGroups) {
		this.alGroups = alGroups;
	}


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
}
