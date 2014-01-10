package com.fem.temp;

public class GainerLoserInfo {
	private double amount;
	private String userId;
	
	public GainerLoserInfo(double amount, String userId) {
		this.amount = amount;
		this.userId = userId;
	}
	
	public double getAmount() {
		return amount;
	}
	public void setAmount(double amount) {
		this.amount = amount;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
}
