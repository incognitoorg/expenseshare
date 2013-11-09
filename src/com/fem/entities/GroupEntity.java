package com.fem.entities;

import java.util.List;

public class GroupEntity {
	
	private String groupId;
	private String groupName;
	private String groupType;
	private String groupOwerId;
	private List<ExpenseEntity> expenses;
	private List<IOUEntity> iouInfo;
	
}