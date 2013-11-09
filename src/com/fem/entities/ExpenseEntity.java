package com.fem.entities;

import java.util.Date;
import java.util.List;

public class ExpenseEntity {
	
	private String name; 
	private Date date;
	private List<ExpenseInfo> listPayersInfo;
	private List<ExpenseInfo> listIncludeMemberInfo;
	
}