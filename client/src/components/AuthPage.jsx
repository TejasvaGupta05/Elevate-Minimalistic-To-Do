import { useState } from 'react';

function AuthPage({ onAuthSuccess, onGoogleSignIn, googleBtnRef }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onAuthSuccess(mode, form);
    } catch (err) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Secure access</p>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-copy">
          Sign in to keep your personal tasks private and synced with your account.
        </p>

        <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
          <button type="button" className={mode === 'login' ? 'status-toggle active' : 'status-toggle'} onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className={mode === 'register' ? 'status-toggle active' : 'status-toggle'} onClick={() => setMode('register')}>
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' ? (
            <div className="field-group">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
            </div>
          ) : null}

          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="divider">or</div>

        {/* Hidden container where the real Google button is rendered — clicked programmatically */}
        <div ref={googleBtnRef} aria-hidden="true" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden' }} />

        <button type="button" className="secondary-btn auth-google-btn" onClick={onGoogleSignIn}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
