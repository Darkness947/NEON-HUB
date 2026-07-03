import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/login', {
        state: { message: 'Account created successfully! Please sign in.' },
      });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: 'calc(100vh - 70px)', padding: 'var(--spacing-lg)' }}
    >
      <div
        className="card p-4 p-md-5 fade-in"
        style={{
          maxWidth: '440px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="text-center mb-4">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
            Create Account
          </h1>
          <p className="text-muted mb-0">Join Neon Hub and start tracking your media</p>
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
            <label htmlFor="reg-username" className="form-label text-light" style={{ fontSize: '0.9rem' }}>
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="reg-username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              minLength={3}
              maxLength={50}
              autoComplete="username"
            />
            <small className="text-muted" style={{ fontSize: '0.78rem' }}>
              3–50 characters, letters, numbers, and underscores only
            </small>
          </div>

          <div className="mb-3">
            <label htmlFor="reg-email" className="form-label text-light" style={{ fontSize: '0.9rem' }}>
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="reg-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="reg-password" className="form-label text-light" style={{ fontSize: '0.9rem' }}>
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="reg-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <small className="text-muted" style={{ fontSize: '0.78rem' }}>
              Min 8 characters, include uppercase, lowercase, and a number
            </small>
          </div>

          <div className="mb-4">
            <label htmlFor="reg-confirm" className="form-label text-light" style={{ fontSize: '0.9rem' }}>
              Confirm Password
            </label>
            <input
              type="password"
              className="form-control"
              id="reg-confirm"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-accent-purple)', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
