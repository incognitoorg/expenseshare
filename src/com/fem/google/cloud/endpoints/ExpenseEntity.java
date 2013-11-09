package com.fem.google.cloud.endpoints;

import java.util.Date;
import java.util.List;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class ExpenseEntity {

	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    @Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
    private String expenseEntityId;
	
	private String name; 
	private Date date;
	private String type;
	
	@Persistent(defaultFetchGroup = "true")
	private List<ExpenseInfo> listPayersInfo;
	
	@Persistent(defaultFetchGroup = "true")
	private List<ExpenseInfo> listIncludeMemberInfo;
	
	//This element is only for expense addition serialization
	private Group objGroup;
	
	private String groupId;
	
	public String getExpenseEntityId() {
		return expenseEntityId;
	}
	public void setExpenseEntityId(String expenseEntityId) {
		this.expenseEntityId = expenseEntityId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	public List<ExpenseInfo> getListPayersInfo() {
		return listPayersInfo;
	}
	public void setListPayersInfo(List<ExpenseInfo> listPayersInfo) {
		this.listPayersInfo = listPayersInfo;
	}
	public List<ExpenseInfo> getListIncludeMemberInfo() {
		return listIncludeMemberInfo;
	}
	public void setListIncludeMemberInfo(List<ExpenseInfo> listIncludeMemberInfo) {
		this.listIncludeMemberInfo = listIncludeMemberInfo;
	}
	public String getGroupId() {
		return groupId;
	}
	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public Group getGroup() {
		return objGroup;
	}
	public void setGroup(Group objGroup) {
		this.objGroup = objGroup;
	}
}
