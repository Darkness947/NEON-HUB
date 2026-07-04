const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { validationResult } = require('express-validator');
const listModel = require('../models/listModel');
const hydrateItem = require('../utils/hydrateItem');

const createList = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400, 'VALIDATION_ERROR');
  }

  const { name, description } = req.body;
  const userId = req.user.id;

  const newList = await listModel.createList(userId, name, description);

  res.status(201).json({
    success: true,
    data: newList
  });
});

const getLists = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const lists = await listModel.getUserLists(userId);

  res.status(200).json({
    success: true,
    data: lists
  });
});

const getList = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const listId = req.params.id;

  const list = await listModel.getListById(userId, listId);
  if (!list) {
    throw new AppError('List not found', 404, 'NOT_FOUND');
  }

  const items = await listModel.getListItems(listId);
  
  // Hydrate items
  const hydratedItems = await Promise.all(
    items.map(item => hydrateItem(item, item.media_type))
  );

  res.status(200).json({
    success: true,
    data: {
      ...list,
      items: hydratedItems
    }
  });
});

const updateList = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400, 'VALIDATION_ERROR');
  }

  const userId = req.user.id;
  const listId = req.params.id;
  const fields = req.body;

  const updatedList = await listModel.updateList(userId, listId, fields);
  
  if (!updatedList) {
    throw new AppError('List not found', 404, 'NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: updatedList
  });
});

const deleteList = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const listId = req.params.id;

  const deletedList = await listModel.deleteList(userId, listId);

  if (!deletedList) {
    throw new AppError('List not found', 404, 'NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: { message: 'List deleted' }
  });
});

const addListItem = asyncHandler(async (req, res) => {
  const { media_type, media_id } = req.body;
  if (!media_type || !media_id) {
    throw new AppError('media_type and media_id are required', 400, 'VALIDATION_ERROR');
  }

  const userId = req.user.id;
  const listId = req.params.id;

  // Check ownership
  const ownsList = await listModel.checkListOwnership(userId, listId);
  if (!ownsList) {
    throw new AppError('List not found', 404, 'NOT_FOUND');
  }

  let newItem;
  try {
    newItem = await listModel.addListItem(listId, media_type, media_id);
  } catch (err) {
    if (err.code === '23505') { // unique violation
      throw new AppError('Item already in list', 409, 'DUPLICATE_ENTRY');
    }
    throw err;
  }

  res.status(201).json({
    success: true,
    data: newItem
  });
});

const removeListItem = asyncHandler(async (req, res) => {
  const { media_type, media_id } = req.body;
  if (!media_type || !media_id) {
    throw new AppError('media_type and media_id are required', 400, 'VALIDATION_ERROR');
  }

  const userId = req.user.id;
  const listId = req.params.id;

  // Check ownership
  const ownsList = await listModel.checkListOwnership(userId, listId);
  if (!ownsList) {
    throw new AppError('List not found', 404, 'NOT_FOUND');
  }

  const removedItem = await listModel.removeListItem(listId, media_type, media_id);
  
  if (!removedItem) {
    throw new AppError('Item not found in list', 404, 'NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: { message: 'Item removed from list' }
  });
});

module.exports = {
  createList,
  getLists,
  getList,
  updateList,
  deleteList,
  addListItem,
  removeListItem
};
