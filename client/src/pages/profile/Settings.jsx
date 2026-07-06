import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import defaultAvatar from '../../assets/images/default_avatar.png';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // Avatar State
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Password State
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);

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

  const currentAvatar = previewUrl || user?.avatar_url || defaultAvatar;

  return (
    <div className="page-container fade-in">
      <h1 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Account Settings</h1>

      <div className="row g-4">
        {/* Profile Info & Avatar */}
        <div className="col-12 col-lg-5">
          <div className="card p-4 h-100" style={{ border: '1px solid var(--border-neon)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Public Profile</h3>
            
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
                  Change Avatar
                </button>
                <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.8rem' }}>Max size: 2MB. Formats: JPG, PNG, WEBP.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="col-12 col-lg-7">
          <div className="card p-4 h-100" style={{ border: '1px solid var(--border-neon)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Change Password</h3>
            
            <form onSubmit={handlePassSubmit}>
              <div className="mb-3">
                <label className="form-label text-light" style={{ fontSize: '0.9rem' }}>Current Password</label>
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
                  <label className="form-label text-light" style={{ fontSize: '0.9rem' }}>New Password</label>
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
                  <label className="form-label text-light" style={{ fontSize: '0.9rem' }}>Confirm New Password</label>
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
                    <><span className="spinner-border spinner-border-sm me-2" /> Updating...</>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
