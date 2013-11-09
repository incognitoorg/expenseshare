package com.fem.google.cloud.endpoints;

import com.fem.google.cloud.endpoints.PMF;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import java.util.HashMap;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

@Api(name = "expenseinfoendpoint")
public class ExpenseInfoEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	public CollectionResponse<ExpenseInfo> listExpenseInfo(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		
		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<ExpenseInfo> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(ExpenseInfo.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<ExpenseInfo>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (ExpenseInfo obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<ExpenseInfo> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	public ExpenseInfo getExpenseInfo(@Named("id") String id) {
		PersistenceManager mgr = getPersistenceManager();
		ExpenseInfo expenseinfo = null;
		try {
			expenseinfo = mgr.getObjectById(ExpenseInfo.class, id);
		} finally {
			mgr.close();
		}
		return expenseinfo;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param expenseinfo the entity to be inserted.
	 * @return The inserted entity.
	 */
	public ExpenseInfo insertExpenseInfo(ExpenseInfo expenseinfo) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (containsExpenseInfo(expenseinfo)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(expenseinfo);
		} finally {
			mgr.close();
		}
		return expenseinfo;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param expenseinfo the entity to be updated.
	 * @return The updated entity.
	 */
	public ExpenseInfo updateExpenseInfo(ExpenseInfo expenseinfo) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsExpenseInfo(expenseinfo)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(expenseinfo);
		} finally {
			mgr.close();
		}
		return expenseinfo;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @return The deleted entity.
	 */
	public ExpenseInfo removeExpenseInfo(@Named("id") String id) {
		PersistenceManager mgr = getPersistenceManager();
		ExpenseInfo expenseinfo = null;
		try {
			expenseinfo = mgr.getObjectById(ExpenseInfo.class, id);
			mgr.deletePersistent(expenseinfo);
		} finally {
			mgr.close();
		}
		return expenseinfo;
	}

	private boolean containsExpenseInfo(ExpenseInfo expenseinfo) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(ExpenseInfo.class, expenseinfo.getExpenseInfoId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}

	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
