import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 70px)' }}>
        <div className="text-center">
          <h2 className="text-danger">Invalid Link</h2>
          <p className="text-muted">The password reset link is invalid or missing the token.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsSubmitting(true);
    setError('');

    try {
      const data = await authService.resetPassword(token, formData.newPassword);
      toast.success(data.message);
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to reset password. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 70px)', padding: 'var(--spacing-lg)' }}>
      <div className="card p-4 p-md-5 fade-in" style={{ maxWidth: '440px', width: '100%', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-center mb-4">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Create New Password</h1>
          <p className="text-muted mb-0">Please enter your new password below.</p>
        </div>

        {error && (
          <div
            className="alert py-2 px-3 mb-3"
            style={{
              backgroundColor: 'rgba(229, 62, 62, 0.15)',
              border: '1px solid rgba(229, 62, 62, 0.3)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="reset-new-password" className="form-label text-light" style={{ fontSize: '0.9rem' }}>
              New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="reset-new-password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
              minLength="8"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="reset-confirm-password" className="form-label text-light" style={{ fontSize: '0.9rem' }}>
              Confirm Password
            </label>
            <input
              type="password"
              className="form-control"
              id="reset-confirm-password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
              minLength="8"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
            disabled={isSubmitting}
            style={{ fontSize: '1rem' }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
