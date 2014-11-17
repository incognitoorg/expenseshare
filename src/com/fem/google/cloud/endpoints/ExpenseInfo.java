package com.fem.google.cloud.endpoints;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class ExpenseInfo {
	
	@Override
	public String toString() {
		return "ExpenseInfo [expenseInfoId=" + expenseInfoId + ", userId="
				+ userId + ", expenseId=" + expenseId + ", amount=" + amount
				+ "]";
	}
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    @Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
    private String expenseInfoId;
	
	private String userId;
	private String expenseId;
	
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private double amount;
	
	
	public String getExpenseInfoId() {
		return expenseInfoId;
	}
	public void setExpenseInfoId(String expenseInfoId) {
		this.expenseInfoId = expenseInfoId;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public double getAmount() {
		return amount;
	}
	public void setAmount(double amount) {
		this.amount = amount;
	}
	public String getExpenseId() {
		return expenseId;
	}
	public void setExpenseId(String expenseId) {
		this.expenseId = expenseId;
	}

}