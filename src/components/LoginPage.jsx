import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';

const API_BASE = 'http://localhost:8080';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1085818274151-placeholder.apps.googleusercontent.com';

export default function LoginPage({ onLoginSuccess, setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize and render Google Login button
  useEffect(() => {
    /* global google */
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'filled_blue', size: 'large', type: 'standard', width: '380' }
      );
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { message: text || 'Google Sign-in failed' };
      }

      if (!res.ok) {
        throw new Error(data.message || 'Google Sign-in failed');
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { message: text || 'Invalid email or password' };
      }

      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Login to save and manage your shortened links</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Logging In...' : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <LogIn size={18} />
                Sign In
              </span>
            )}
          </button>
        </form>

        <div className="divider">or continue with</div>

        <div className="google-btn-container">
          <div id="google-signin-btn"></div>
        </div>

        <p className="auth-footer-text">
          Don't have an account?{' '}
          <span className="auth-link" onClick={() => setView('register')}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
