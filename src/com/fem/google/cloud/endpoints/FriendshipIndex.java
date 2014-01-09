package com.fem.google.cloud.endpoints;

public class FriendshipIndex {
	private String friendshipIndexId;
	private int indexNo;
	private String friendshipId;
	
	public String getFriendshipIndexId() {
		return friendshipIndexId;
	}
	public int getIndexNo() {
		return indexNo;
	}
	public void setIndexNo(int indexNo) {
		this.indexNo = indexNo;
	}
	public String getFriendshipId() {
		return friendshipId;
	}
	public void setFriendshipId(String friendshipId) {
		this.friendshipId = friendshipId;
	}
	public void setFriendshipIndexId(String friendshipIndexId) {
		this.friendshipIndexId = friendshipIndexId;
	}
}
