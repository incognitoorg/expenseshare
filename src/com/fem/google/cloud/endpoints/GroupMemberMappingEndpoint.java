package com.fem.google.cloud.endpoints;

import java.util.HashMap;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityNotFoundException;

import com.fem.util.MailUtil;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

@Api(name = "groupmembermappingendpoint")
public class GroupMemberMappingEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	public CollectionResponse<GroupMemberMapping> listGroupMemberMapping(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<GroupMemberMapping> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(GroupMemberMapping.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<GroupMemberMapping>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (GroupMemberMapping obj : execute)
				;
		} catch(Exception e) {
			new MailUtil().sendToAdmin("Exception occured ", e.getMessage().toString());
		} finally {
			mgr.close();
		}

		return CollectionResponse.<GroupMemberMapping> builder()
				.setItems(execute).setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	public GroupMemberMapping getGroupMemberMapping(@Named("id") String id) {
		PersistenceManager mgr = getPersistenceManager();
		GroupMemberMapping groupmembermapping = null;
		try {
			groupmembermapping = mgr
					.getObjectById(GroupMemberMapping.class, id);
		} catch(Exception e) {
			new MailUtil().sendToAdmin("Exception occured ", e.getMessage().toString());
		} finally {
			mgr.close();
		}
		return groupmembermapping;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param groupmembermapping the entity to be inserted.
	 * @return The inserted entity.
	 */
	public GroupMemberMapping insertGroupMemberMapping(
			GroupMemberMapping groupmembermapping) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			/*if (containsGroupMemberMapping(groupmembermapping)) {
				throw new EntityExistsException("Object already exists");
			}*/
			mgr.makePersistent(groupmembermapping);
		} catch(Exception e) {
			new MailUtil().sendToAdmin("Exception occured ", e.getMessage().toString());
		} finally {
			mgr.close();
		}
		return groupmembermapping;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param groupmembermapping the entity to be updated.
	 * @return The updated entity.
	 */
	public GroupMemberMapping updateGroupMemberMapping(
			GroupMemberMapping groupmembermapping) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsGroupMemberMapping(groupmembermapping)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(groupmembermapping);
		} catch(Exception e) {
			new MailUtil().sendToAdmin("Exception occured ", e.getMessage().toString());
		} finally {
			mgr.close();
		}
		return groupmembermapping;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 * @return The deleted entity.
	 */
	public GroupMemberMapping removeGroupMemberMapping(@Named("id") String id) {
		PersistenceManager mgr = getPersistenceManager();
		GroupMemberMapping groupmembermapping = null;
		try {
			groupmembermapping = mgr
					.getObjectById(GroupMemberMapping.class, id);
			mgr.deletePersistent(groupmembermapping);
		} catch(Exception e) {
			new MailUtil().sendToAdmin("Exception occured ", e.getMessage().toString());
		} finally {
			mgr.close();
		}
		return groupmembermapping;
	}

	private boolean containsGroupMemberMapping(
			GroupMemberMapping groupmembermapping) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(GroupMemberMapping.class,
					groupmembermapping.getMappingId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			new MailUtil().sendToAdmin("Exception", ex.getStackTrace().toString());
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
