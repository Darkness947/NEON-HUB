import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import defaultAvatar from '../../assets/images/default_avatar.png';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const { t, i18n } = useTranslation();

  // Avatar State
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Password State
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Bio State
  const [bio, setBio] = useState(user?.bio || '');
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Avatar Handlers ─────────────────────────────────────────────────────────

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('File size must be less than 2MB');
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const data = await authService.uploadAvatar(formData);
      updateUser(data.user);
      toast.success('Avatar updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to upload avatar';
      toast.error(msg);
      setPreviewUrl(null); // Revert preview on failure
    } finally {
      setIsUploading(false);
    }
  };

  const handleBioSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingBio(true);
    try {
      const data = await authService.updateBio(bio);
      updateUser(data.user);
      toast.success('Bio updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update bio';
      toast.error(msg);
    } finally {
      setIsUpdatingBio(false);
    }
  };

  // ─── Password Handlers ───────────────────────────────────────────────────────

  const handlePassChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error('New passwords do not match');
    }

    setIsChangingPass(true);
    try {
      await authService.changePassword(passData.oldPassword, passData.newPassword);
      toast.success('Password changed successfully! You may need to log in again on other devices.');
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  // ─── Danger Zone Handlers ────────────────────────────────────────────────────

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authService.deleteAccount();
      // Clear user state and force a reload to clear all in-memory data
      updateUser(null);
      window.location.href = '/login';
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to delete account';
      toast.error(msg);
      setIsDeleting(false);
    }
  };

  const currentAvatar = previewUrl || user?.avatar_url || defaultAvatar;

  return (
    <div className="page-container fade-in">
      <h1 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>{t('settings.title')}</h1>

      <div className="row g-4">
        {/* Profile Info & Avatar */}
        <div className="col-12 col-lg-5">
          <div className="card p-4 h-100" style={{ border: '1px solid var(--border-neon)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{t('settings.profile')}</h3>
            
            <div className="d-flex align-items-center mb-4">
              <div 
                className="position-relative" 
                style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-accent-blue)', flexShrink: 0 }}
              >
                {isUploading ? (
                  <div className="w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'var(--color-bg-deep)' }}>
                    <span className="spinner-border text-info" />
                  </div>
                ) : (
                  <img src={currentAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }} />
                )}
              </div>
              
              <div className="ms-4">
                <p className="mb-1 fw-bold fs-5 text-light">{user?.username}</p>
                <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>{user?.email}</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/jpeg, image/png, image/webp" 
                  style={{ display: 'none' }} 
                />
                <button 
                  className="btn btn-outline-info btn-sm"
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUploading}
                >
                  {t('settings.changeAvatar')}
                </button>
                <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.8rem' }}>{t('settings.avatarHint')}</p>
              </div>
            </div>

            <hr className="border-secondary my-4" />

            <form onSubmit={handleBioSubmit}>
              <div className="mb-3">
                <label className="form-label text-light" style={{ fontSize: '0.9rem' }}>{t('settings.bio')}</label>
                <textarea
                  className="form-control"
                  rows="3"
                  maxLength="500"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('settings.bioPlaceholder')}
                ></textarea>
                <div className="text-end text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                  {bio.length}/500
                </div>
              </div>
              <div className="d-flex justify-content-end mb-4">
                <button 
                  type="submit" 
                  className="btn btn-outline-primary btn-sm px-4"
                  disabled={isUpdatingBio || bio === (user?.bio || '')}
                >
                  {isUpdatingBio ? <span className="spinner-border spinner-border-sm" /> : t('settings.saveBio')}
                </button>
              </div>
            </form>
            
            <hr className="border-secondary my-2 mb-4" />

            <div className="mb-3">
              <label className="form-label text-light" style={{ fontSize: '0.9rem' }}>{t('settings.language')}</label>
              <select 
                className="form-select" 
                value={i18n.language} 
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                style={{ backgroundColor: 'var(--color-bg-deep)', color: 'var(--color-text-primary)', border: '1px solid var(--border-neon)' }}
              >
                <option value="en">English</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="col-12 col-lg-7 d-flex flex-column">
          <div className="card p-4 flex-grow-1" style={{ border: '1px solid var(--border-neon)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{t('settings.changePassword')}</h3>
            
            <form onSubmit={handlePassSubmit}>
              <div className="mb-3">
                <label className="form-label text-light" style={{ fontSize: '0.9rem' }}>{t('settings.currentPassword')}</label>
                <input 
                  type="password" 
                  className="form-control" 
                  name="oldPassword"
                  value={passData.oldPassword}
                  onChange={handlePassChange}
                  required
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label text-light" style={{ fontSize: '0.9rem' }}>{t('settings.newPassword')}</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    name="newPassword"
                    value={passData.newPassword}
                    onChange={handlePassChange}
                    required
                    minLength="8"
                  />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label text-light" style={{ fontSize: '0.9rem' }}>{t('settings.confirmPassword')}</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    name="confirmPassword"
                    value={passData.confirmPassword}
                    onChange={handlePassChange}
                    required
                    minLength="8"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button 
                  type="submit" 
                  className="btn btn-primary px-4"
                  disabled={isChangingPass}
                >
                  {isChangingPass ? (
                    <><span className="spinner-border spinner-border-sm me-2" /> {t('settings.updating')}</>
                  ) : (
                    t('settings.updatePassword')
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="card p-4 mt-4" style={{ border: '1px solid #E53E3E', flexShrink: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem', color: '#E53E3E' }}>{t('settings.accountDeletion')}</h3>
            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
              {t('settings.dangerHint')}
            </p>
            <div>
              <button 
                className="btn btn-outline-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                {t('settings.deleteAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteModal && (
        <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      )}
      <div 
        className={`modal fade ${showDeleteModal ? 'show' : ''}`} 
        style={{ display: showDeleteModal ? 'block' : 'none', zIndex: 1050 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid #E53E3E' }}>
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title text-danger fw-bold">{t('settings.confirmDeletion')}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
            </div>
            <div className="modal-body">
              <p className="text-light">
                {t('settings.deleteWarning')}
              </p>
            </div>
            <div className="modal-footer border-top-0">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>{t('settings.cancel')}</button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteAccount} disabled={isDeleting}>
                {isDeleting ? <span className="spinner-border spinner-border-sm" /> : t('settings.deleteMyAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
