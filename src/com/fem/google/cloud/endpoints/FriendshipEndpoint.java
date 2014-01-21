package com.fem.google.cloud.endpoints;

import com.fem.google.cloud.endpoints.PMF;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
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

@Api(name = "friendshipendpoint", namespace = @ApiNamespace(ownerDomain = "fem.com", ownerName = "fem.com", packagePath = "google.cloud.endpoints"))
public class FriendshipEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listFriendship")
	public CollectionResponse<Friendship> listFriendship(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<Friendship> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(Friendship.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<Friendship>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (Friendship obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<Friendship> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getFriendship")
	public Friendship getFriendship(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		Friendship friendship = null;
		try {
			friendship = mgr.getObjectById(Friendship.class, id);
		} finally {
			mgr.close();
		}
		return friendship;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param friendship the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "insertFriendship")
	public Friendship insertFriendship(Friendship friendship) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (containsFriendship(friendship)) {
				throw new EntityExistsException("Object already exists");
			}
			mgr.makePersistent(friendship);
		} finally {
			mgr.close();
		}
		return friendship;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param friendship the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(name = "updateFriendship")
	public Friendship updateFriendship(Friendship friendship) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsFriendship(friendship)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(friendship);
		} finally {
			mgr.close();
		}
		return friendship;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "removeFriendship")
	public void removeFriendship(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			Friendship friendship = mgr.getObjectById(Friendship.class, id);
			mgr.deletePersistent(friendship);
		} finally {
			mgr.close();
		}
	}

	private boolean containsFriendship(Friendship friendship) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(Friendship.class, friendship.getId());
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
