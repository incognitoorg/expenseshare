package com.fem.google.cloud.endpoints;

import java.util.ArrayList;

public class Friendship {
	
	
	private String friendshipId;
	private ArrayList<Group> alGroups;
	private ArrayList<String> alGroupIds;

	
	
	public ArrayList<Group> getGroups() {
		return alGroups;
	}

	public void setGroups(ArrayList<Group> alGroups) {
		this.alGroups = alGroups;
	}

	public String getFriendshipId() {
		return friendshipId;
	}

	public void setFriendshipId(String friendshipId) {
		this.friendshipId = friendshipId;
	}

	public ArrayList<String> getGroupIds() {
		return alGroupIds;
	}

	public void setGroupIds(ArrayList<String> alGroupIds) {
		this.alGroupIds = alGroupIds;
	}
}
