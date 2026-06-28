import { useState } from 'react';

function AuthPage({ onAuthSuccess, googleBtnRef }) {
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
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="auth-brand-name">Elevate</span>
        </div>
        <p className="eyebrow">Secure access</p>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-copy">
          Sign in to keep your tasks private and synced across devices.
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

          {error ? <div className="auth-error" role="alert">{error}</div> : null}

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="divider">or</div>

        {/*
          Overlay pattern: the custom button is purely decorative.
          The real Google-rendered iframe sits on top of it (opacity ~0, full size),
          so the user sees our styled button but actually clicks Google's iframe.
          This is the only approach that works cross-browser and on Render production
          — querying inside cross-origin iframes is blocked by the browser.
        */}
        <div className="google-btn-wrapper">
          <button
            type="button"
            className="secondary-btn auth-google-btn"
            aria-hidden="true"
            tabIndex={-1}
            style={{ pointerEvents: 'none' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 8, flexShrink: 0 }} aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>
          {/* Real Google button iframe — invisible overlay, captures the actual click */}
          <div ref={googleBtnRef} className="google-btn-overlay" aria-label="Sign in with Google" />
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
