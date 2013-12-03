package com.fem.google.cloud.endpoints;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class IOU{
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    @Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
	private String iouId;
	
	@Persistent
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String groupId;
	
	@Persistent
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String fromUserId;
	
	@Persistent
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private String toUserId;
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	@Persistent
	private double amount; 

	
	
	public String getGroupId() {
		return groupId;
	}
	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}
	public String getFromUserId() {
		return fromUserId;
	}
	public void setFromUserId(String fromUserId) {
		this.fromUserId = fromUserId;
	}
	public String getToUserId() {
		return toUserId;
	}
	public void setToUserId(String toUserId) {
		this.toUserId = toUserId;
	}
	public double getAmount() {
		return amount;
	}
	public void setAmount(double amount) {
		this.amount = amount;
	}

}
