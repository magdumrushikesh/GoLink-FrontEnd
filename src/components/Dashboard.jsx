import React, { useState, useEffect } from 'react';
import { 
  Link2, Copy, Check, QrCode, ExternalLink, Calendar, 
  Trash2, BarChart3, Link, TrendingUp, Search, Compass 
} from 'lucide-react';

const API_BASE = 'http://localhost:8080';

export default function Dashboard({ user, refreshTrigger, setView }) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeQrCode, setActiveQrCode] = useState(null);

  useEffect(() => {
    fetchUrls();
  }, [user, refreshTrigger]);

  const fetchUrls = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/urls`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { message: text || 'Failed to fetch links' };
      }
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch links');
      }
      setUrls(data);
    } catch (err) {
      setError(err.message || 'Could not load your links');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this short URL?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/urls/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { message: text || 'Failed to delete' };
      }
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete');
      }
      // Remove from state
      setUrls(urls.filter(url => url.id !== id));
      if (activeQrCode === id) setActiveQrCode(null);
    } catch (err) {
      alert(err.message || 'Failed to delete link');
    }
  };

  const handleCopy = (code) => {
    const fullUrl = `${API_BASE}/${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Analytics helper calculations
  const totalLinks = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
  const topLink = urls.length > 0 
    ? [...urls].sort((a, b) => b.clicks - a.clicks)[0] 
    : null;

  const filteredUrls = urls.filter(url => 
    url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    url.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="dashboard-container">
      {/* Analytics widgets */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Link size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{totalLinks}</span>
            <span className="stat-label">Total Links</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <BarChart3 size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-value">{totalClicks}</span>
            <span className="stat-label">Total Clicks</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-details" style={{ minWidth: 0, flex: 1 }}>
            <span className="stat-value" style={{ fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {topLink ? `${API_BASE.replace('http://', '').replace('https://', '')}/${topLink.shortCode}` : 'N/A'}
            </span>
            <span className="stat-label">Most Active ({topLink ? topLink.clicks : 0} clicks)</span>
          </div>
        </div>
      </div>

      {/* Dashboard header & search */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">My Shortened Links</h2>
        <div className="shortener-input-wrapper" style={{ maxWidth: '300px', flex: 'none' }}>
          <Search className="shortener-icon" size={16} />
          <input
            type="text"
            className="shortener-input"
            style={{ padding: '0.6rem 1rem 0.6rem 2.4rem', fontSize: '0.9rem' }}
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <p>Loading your shortened links...</p>
        </div>
      ) : filteredUrls.length === 0 ? (
        <div className="empty-state">
          <Compass className="empty-icon" size={48} />
          <h3>No links found</h3>
          <p>
            {searchQuery 
              ? "No links match your search query." 
              : "You haven't shortened any links yet under this account."}
          </p>
          {!searchQuery && (
            <button className="nav-btn-primary" onClick={() => setView('landing')}>
              Shorten your first link
            </button>
          )}
        </div>
      ) : (
        <div className="links-list">
          {filteredUrls.map((item) => (
            <div className="link-card-container" key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="link-card">
                <div className="link-info">
                  <a
                    href={`${API_BASE}/${item.shortCode}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link-short-url"
                  >
                    {API_BASE.replace('http://', '').replace('https://', '')}/{item.shortCode}
                  </a>
                  <span className="link-original-url" title={item.originalUrl}>{item.originalUrl}</span>
                  <div className="link-meta">
                    <span className="meta-item">
                      <Calendar size={12} />
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="meta-item" style={{ marginLeft: '1rem', color: 'var(--accent)' }}>
                      <BarChart3 size={12} />
                      {item.clicks} {item.clicks === 1 ? 'click' : 'clicks'}
                    </span>
                  </div>
                </div>
                <div className="link-actions">
                  <button className="btn-action" onClick={() => handleCopy(item.shortCode)}>
                    {copiedCode === item.shortCode ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                    {copiedCode === item.shortCode ? 'Copied' : 'Copy'}
                  </button>
                  <button className="btn-action" onClick={() => setActiveQrCode(activeQrCode === item.id ? null : item.id)}>
                    <QrCode size={16} />
                  </button>
                  <a
                    className="btn-action"
                    href={`${API_BASE}/${item.shortCode}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button 
                    className="btn-icon-action danger" 
                    onClick={() => handleDelete(item.id)}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {activeQrCode === item.id && (
                <div className="result-card" style={{ marginTop: '0', marginInline: '1rem' }}>
                  <div className="qr-section">
                    <img
                      className="qr-image"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${API_BASE}/${item.shortCode}`)}`}
                      alt="QR Code"
                      width="120"
                      height="120"
                    />
                    <div className="qr-details">
                      <h4>Scan QR Code</h4>
                      <p>Access your shortened link instantly on any mobile device.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
