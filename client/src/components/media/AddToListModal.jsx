import React, { useState, useEffect } from 'react';
import listService from '../../services/listService';
import toast from 'react-hot-toast';

const AddToListModal = ({ isOpen, onClose, mediaType, mediaId, mediaTitle }) => {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchLists();
    }
  }, [isOpen]);

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listService.getLists();
      setLists(data);
    } catch (err) {
      setError(err.message || 'Failed to load lists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToList = async (listId) => {
    try {
      setIsSubmitting(true);
      await listService.addListItem(listId, mediaType, mediaId);
      setIsSubmitting(false);
      toast.success('Added to list successfully!');
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      if (err.message && err.message.toLowerCase().includes('already')) {
        toast.error('Item is already in this list.');
      } else {
        toast.error(err.message || 'Failed to add to list');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid #2c2c3e' }}>
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title" style={{ fontFamily: 'var(--font-display)' }}>
                Add to List
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body py-1">
              <p className="text-muted small mb-3">Adding "{mediaTitle}" to a custom list.</p>
              
              {isLoading ? (
                <div className="text-center py-4">Loading lists...</div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : lists.length === 0 ? (
                <div className="text-center text-muted py-3">
                  You don't have any custom lists yet. <br/>
                  <a href="/lists" onClick={(e) => { e.preventDefault(); onClose(); window.location.href='/lists'; }} className="text-accent-blue text-decoration-none mt-2 d-inline-block">Create a List</a>
                </div>
              ) : (
                <div className="list-group list-group-flush mb-3">
                  {lists.map(list => (
                    <button
                      key={list.id}
                      type="button"
                      className="list-group-item list-group-item-action bg-dark text-light border-secondary"
                      onClick={() => handleAddToList(list.id)}
                      disabled={isSubmitting}
                      style={{ transition: 'background-color 0.2s ease' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2c2c3e'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-deep)'}
                    >
                      {list.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer border-top-0">
              <button type="button" className="btn btn-secondary w-100" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddToListModal;
