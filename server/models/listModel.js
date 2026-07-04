const pool = require('../config/db');

// List CRUD
const createList = async (userId, name, description = null) => {
  const result = await pool.query(
    `INSERT INTO custom_lists (user_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, name, description]
  );
  return result.rows[0];
};

const getUserLists = async (userId) => {
  const result = await pool.query(
    `SELECT cl.*, COUNT(li.id) as item_count
     FROM custom_lists cl
     LEFT JOIN list_items li ON cl.id = li.list_id
     WHERE cl.user_id = $1
     GROUP BY cl.id
     ORDER BY cl.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const getListById = async (userId, listId) => {
  const result = await pool.query(
    `SELECT * FROM custom_lists WHERE id = $1 AND user_id = $2`,
    [listId, userId]
  );
  return result.rows[0];
};

const updateList = async (userId, listId, fields) => {
  const allowed = ['name', 'description'];
  const updates = [];
  const values = [];
  let i = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${i}`);
      values.push(fields[key]);
      i++;
    }
  }

  if (updates.length === 0) return null;

  values.push(listId, userId);
  const result = await pool.query(
    `UPDATE custom_lists
     SET ${updates.join(', ')}
     WHERE id = $${i} AND user_id = $${i + 1}
     RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deleteList = async (userId, listId) => {
  const result = await pool.query(
    `DELETE FROM custom_lists WHERE id = $1 AND user_id = $2 RETURNING *`,
    [listId, userId]
  );
  return result.rows[0] || null;
};

// List Items CRUD
const addListItem = async (listId, mediaType, mediaId) => {
  const result = await pool.query(
    `INSERT INTO list_items (list_id, media_type, media_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [listId, mediaType, mediaId]
  );
  return result.rows[0];
};

const removeListItem = async (listId, mediaType, mediaId) => {
  const result = await pool.query(
    `DELETE FROM list_items 
     WHERE list_id = $1 AND media_type = $2 AND media_id = $3 
     RETURNING *`,
    [listId, mediaType, mediaId]
  );
  return result.rows[0] || null;
};

const getListItems = async (listId) => {
  const result = await pool.query(
    `SELECT * FROM list_items WHERE list_id = $1 ORDER BY added_at DESC`,
    [listId]
  );
  return result.rows;
};

// Check if user owns list
const checkListOwnership = async (userId, listId) => {
  const result = await pool.query(
    `SELECT id FROM custom_lists WHERE id = $1 AND user_id = $2`,
    [listId, userId]
  );
  return result.rowCount > 0;
};

module.exports = {
  createList,
  getUserLists,
  getListById,
  updateList,
  deleteList,
  addListItem,
  removeListItem,
  getListItems,
  checkListOwnership
};
