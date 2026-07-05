import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import listService from '../../services/listService';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatDate';

const CustomLists = () => {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [listName, setListName] = useState('');
  const [listDesc, setListDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteData, setDeleteData] = useState({ isOpen: false, listId: null });

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      const data = await listService.getLists();
      setLists(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch lists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!listName.trim()) return;

    try {
      setIsSubmitting(true);
      const newList = await listService.createList(listName, listDesc);
      setLists(prev => [newList, ...prev]);
      setShowModal(false);
      setListName('');
      setListDesc('');
      toast.success('List created successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to create list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (listId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteData({ isOpen: true, listId });
  };

  const confirmDelete = async () => {
    const { listId } = deleteData;
    try {
      await listService.deleteList(listId);
      setLists(prev => prev.filter(list => list.id !== listId));
      toast.success('List deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete list');
    } finally {
      setDeleteData({ isOpen: false, listId: null });
    }
  };

  if (isLoading) {
    return (
      <div className="page-container fade-in">
        <h1 className="mb-4 section-title">My <span className="text-accent-purple">Lists</span></h1>
        <div className="row g-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="col-12 col-md-6 col-lg-4" key={i}>
              <div className="skeleton-shimmer" style={{
                height: '180px',
                backgroundColor: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-neon)',
              }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>
          My <span className="text-accent-purple">Lists</span>
        </h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Create List
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {lists.length === 0 && !error ? (
        <EmptyState
          icon="📋"
          title="No lists yet"
          message="You haven't created any custom lists. Curate your favorite movies, series, and games!"
          actionText="Create Your First List"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="row g-4">
          {lists.map(list => (
            <div className="col-12 col-md-6 col-lg-4" key={list.id}>
              <Link to={`/lists/${list.id}`} className="text-decoration-none">
                <div 
                  className="card h-100 p-4 custom-list-card"
                  style={{ 
                    backgroundColor: 'var(--color-bg-elevated)', 
                    border: '1px solid #2c2c3e',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--color-accent-purple)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#2c2c3e';
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h3 className="text-light mb-0" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                      {list.name}
                    </h3>
                    <button 
                      className="btn btn-sm text-muted px-2 py-0" 
                      onClick={(e) => requestDelete(list.id, e)}
                      title="Delete List"
                    >
                      ×
                    </button>
                  </div>
                  
                  <p className="text-muted small mb-4 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {list.description || 'No description provided.'}
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mt-auto border-top pt-3" style={{ borderColor: '#2c2c3e' }}>
                    <span className="badge bg-secondary">
                      {list.item_count || 0} items
                    </span>
                    <span className="text-muted small">
                      {formatDate(list.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create List Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid #2c2c3e' }}>
                <div className="modal-header border-bottom-0">
                  <h5 className="modal-title" style={{ fontFamily: 'var(--font-display)' }}>Create New List</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleCreateList}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label text-muted">List Name</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark text-light border-0" 
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        placeholder="e.g. My Top 10 RPGs"
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Description (Optional)</label>
                      <textarea 
                        className="form-control bg-dark text-light border-0" 
                        rows="3"
                        value={listDesc}
                        onChange={(e) => setListDesc(e.target.value)}
                        placeholder="What is this list about?"
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-top-0">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={!listName.trim() || isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create List'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
      
      <ConfirmModal 
        isOpen={deleteData.isOpen}
        onClose={() => setDeleteData({ isOpen: false, listId: null })}
        onConfirm={confirmDelete}
        title="Delete List"
        message="Are you sure you want to delete this list? This will not remove the items from your library, only from this list."
        confirmText="Delete List"
        confirmStyle="danger"
      />
    </div>
  );
};

export default CustomLists;
