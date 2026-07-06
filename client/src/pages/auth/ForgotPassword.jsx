import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const data = await authService.forgotPassword(email);
      setStatus({ type: 'success', message: data.message });
      setEmail('');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to send reset email. Please try again.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 70px)', padding: 'var(--spacing-lg)' }}>
      <div className="card p-4 p-md-5 fade-in" style={{ maxWidth: '440px', width: '100%', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-center mb-4">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Reset Password</h1>
          <p className="text-muted mb-0">Enter your email and we'll send you a reset link</p>
        </div>

        {status.message && (
          <div
            className="alert py-2 px-3 mb-3"
            style={{
              backgroundColor: status.type === 'error' ? 'rgba(229, 62, 62, 0.15)' : 'rgba(45, 158, 95, 0.15)',
              border: `1px solid ${status.type === 'error' ? 'rgba(229, 62, 62, 0.3)' : 'rgba(45, 158, 95, 0.3)'}`,
              color: status.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
            }}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reset-email" className="form-label text-light" style={{ fontSize: '0.9rem' }}>
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              id="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
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
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--color-accent-purple)', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
