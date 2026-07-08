import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import listService from '../../services/listService';
import FullPageLoader from '../../components/common/Loader';
import MediaCard from '../../components/media/MediaCard';
import GameCard from '../../components/media/GameCard';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleteData, setDeleteData] = useState({ isOpen: false, mediaType: null, mediaId: null });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchList();
  }, [id]);

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const data = await listService.getList(id);
      setList(data);
      setEditName(data.name);
      setEditDesc(data.description || '');
    } catch (err) {
      setError(err.message || 'Failed to fetch list details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    try {
      setIsSaving(true);
      const updatedList = await listService.updateList(id, { name: editName, description: editDesc });
      setList(prev => ({ ...prev, name: updatedList.name, description: updatedList.description }));
      setIsEditing(false);
      toast.success('List updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update list');
    } finally {
      setIsSaving(false);
    }
  };

  const requestRemove = (mediaType, mediaId) => {
    setDeleteData({ isOpen: true, mediaType, mediaId });
  };

  const confirmRemove = async () => {
    const { mediaType, mediaId } = deleteData;
    try {
      await listService.removeListItem(id, mediaType, mediaId);
      setList(prev => ({
        ...prev,
        items: prev.items.filter(item => !(item.media_type === mediaType && item.id === mediaId))
      }));
      toast.success('Item removed from list');
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
    } finally {
      setDeleteData({ isOpen: false, mediaType: null, mediaId: null });
    }
  };

  if (isLoading) return <FullPageLoader />;

  if (error) {
    return (
      <div className="page-container fade-in">
        <div className="alert alert-danger mb-4">{error}</div>
        <Link to="/lists" className="btn btn-outline-secondary">{t('lists.backToLists')}</Link>
      </div>
    );
  }

  if (!list) return null;

  return (
    <div className="page-container fade-in">
      <div className="mb-4">
        <Link to="/lists" className="text-muted text-decoration-none mb-3 d-inline-block">{t('lists.backToLists')}</Link>
        
        {isEditing ? (
          <div className="card p-4 bg-surface mt-2 border-0">
            <div className="mb-3">
              <label className="form-label text-muted">{t('lists.listName')}</label>
              <input 
                type="text" 
                className="form-control bg-dark text-light border-0" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted">{t('lists.description')}</label>
              <textarea 
                className="form-control bg-dark text-light border-0" 
                rows="3"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              ></textarea>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : t('lists.saveChanges')}
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setIsEditing(false);
                setEditName(list.name);
                setEditDesc(list.description || '');
              }}>
                {t('settings.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-start mt-2">
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {list.name}
              </h1>
              <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '800px', whiteSpace: 'pre-line' }}>
                {list.description || 'No description provided.'}
              </p>
            </div>
            <button className="btn btn-outline-secondary" onClick={() => setIsEditing(true)}>
              {t('lists.editInfo')}
            </button>
          </div>
        )}
      </div>

      <hr className="border-secondary my-4" />

      {list.items.length === 0 ? (
        <div className="card p-5 text-center bg-surface border-0">
          <h3 className="mb-3">{t('lists.emptyListTitle')}</h3>
          <p className="text-muted mb-4">{t('lists.emptyListMessage')}</p>
          <div>
            <Link to="/discover" className="btn btn-primary">{t('library.discoverMedia')}</Link>
          </div>
        </div>
      ) : (
        <div className="media-grid">
          {list.items.map(item => (
            <div key={`${item.media_type}-${item.id}`} className="position-relative">
              {item.media_type === 'game' ? (
                <GameCard {...item} />
              ) : (
                <MediaCard {...item} />
              )}
              
              <button 
                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                style={{ zIndex: 10, borderRadius: '50%', width: '30px', height: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => requestRemove(item.media_type, item.id)}
                title="Remove from list"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteData.isOpen}
        onClose={() => setDeleteData({ isOpen: false, mediaType: null, mediaId: null })}
        onConfirm={confirmRemove}
        title={t('lists.removeItem')}
        message={t('lists.removeItemConfirm')}
        confirmText={t('lists.removeItem')}
        confirmStyle="danger"
      />
    </div>
  );
};

export default ListDetail;
