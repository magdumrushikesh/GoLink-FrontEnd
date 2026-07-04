import React, { useState, useEffect } from 'react';
import { Link2, Copy, Check, QrCode, ExternalLink, Calendar, History, Sparkles } from 'lucide-react';

const API_BASE = 'http://localhost:8080';

export default function LandingPage({ user, onLinkShortened }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [guestHistory, setGuestHistory] = useState([]);

  // Load guest history from localStorage on mount
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem('golink_guest_history');
      if (stored) {
        try {
          setGuestHistory(JSON.parse(stored));
        } catch (e) {
          localStorage.removeItem('golink_guest_history');
        }
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    setLoading(true);
    setError('');
    setResult(null);
    setShowQr(false);

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(`${API_BASE}/api/shorten`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ originalUrl }),
      });

      let data = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || 'Server returned an empty or invalid response' };
      }

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setResult(data);
      setOriginalUrl('');

      // Save to localStorage if guest
      if (!user) {
        const updatedHistory = [data, ...guestHistory].slice(0, 10);
        setGuestHistory(updatedHistory);
        localStorage.setItem('golink_guest_history', JSON.stringify(updatedHistory));
      } else {
        // Trigger dashboard data refresh if applicable
        if (onLinkShortened) {
          onLinkShortened();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to shorten URL. Make sure it starts with http:// or https://');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code) => {
    const fullUrl = `${API_BASE}/${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <main className="main-content">
      <h1 className="hero-title">
        Simplify Your Links. <br />
        <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Track and Manage Them Easily.
        </span>
      </h1>
      <p className="hero-subtitle">
        An elegant, secure, and fast URL shortener. Sign up to save your links permanently, view click analytics, and generate beautiful custom QR codes.
      </p>

      <div className="shortener-card">
        <form onSubmit={handleSubmit} className="shortener-form">
          <div className="shortener-input-wrapper">
            <Link2 className="shortener-icon" size={20} />
            <input
              type="text"
              className="shortener-input"
              placeholder="Paste your long URL here (starts with https:// or http://)..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button type="submit" className="btn-shorten" disabled={loading}>
            {loading ? 'Processing...' : (
              <>
                <Sparkles size={18} />
                Shorten Link
              </>
            )}
          </button>
        </form>

        {error && <div className="alert alert-danger" style={{ marginTop: '1.25rem' }}>{error}</div>}

        {result && (
          <div className="result-card">
            <div className="result-main">
              <div className="result-urls">
                <span className="original-url-label">Original URL: {result.originalUrl}</span>
                <a
                  href={`${API_BASE}/${result.shortCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="short-url-link"
                >
                  {API_BASE.replace('http://', '').replace('https://', '')}/{result.shortCode}
                </a>
              </div>
              <div className="result-actions">
                <button className="btn-action" onClick={() => handleCopy(result.shortCode)}>
                  {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button className="btn-action" onClick={() => setShowQr(!showQr)}>
                  <QrCode size={16} />
                  {showQr ? 'Hide QR' : 'QR Code'}
                </button>
              </div>
            </div>

            {showQr && (
              <div className="qr-section">
                <img
                  className="qr-image"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${API_BASE}/${result.shortCode}`)}`}
                  alt="QR Code"
                  width="150"
                  height="150"
                />
                <div className="qr-details">
                  <h4>Scan this QR Code</h4>
                  <p>Instantly access the shortened URL on mobile devices.</p>
                </div>
              </div>
            )}

            {user && (
              <div className="alert alert-success" style={{ margin: 0, padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                Link successfully saved to your dashboard!
              </div>
            )}
          </div>
        )}
      </div>

      {!user && guestHistory.length > 0 && (
        <div className="history-section">
          <h2 className="section-title">
            <History size={22} style={{ color: 'var(--primary)' }} />
            Recent shortened links
          </h2>
          <div className="links-list">
            {guestHistory.map((item) => (
              <div className="link-card" key={item.shortCode}>
                <div className="link-info">
                  <a
                    href={`${API_BASE}/${item.shortCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link-short-url"
                  >
                    {API_BASE.replace('http://', '').replace('https://', '')}/{item.shortCode}
                  </a>
                  <span className="link-original-url">{item.originalUrl}</span>
                  <div className="link-meta">
                    <span className="meta-item">
                      <Calendar size={12} />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="link-actions">
                  <button className="btn-action" onClick={() => handleCopy(item.shortCode)}>
                    <Copy size={16} />
                  </button>
                  <a
                    className="btn-action"
                    href={`${API_BASE}/${item.shortCode}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
