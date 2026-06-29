import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
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

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.error?.message || 'Login failed. Please try again.';
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
            Welcome Back
          </h1>
          <p className="text-muted mb-0">Sign in to your Neon Hub account</p>
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
            <label htmlFor="login-email" className="form-label" style={{ fontSize: '0.9rem' }}>
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="login-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="login-password" className="form-label" style={{ fontSize: '0.9rem' }}>
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="login-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-accent-purple)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
