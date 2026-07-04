import React from 'react';
import { Link2, LayoutDashboard, LogIn, UserPlus, LogOut, User } from 'lucide-react';

export default function Navbar({ user, view, setView, onLogout }) {
  return (
    <header className="navbar">
      <div className="logo" onClick={() => setView('landing')}>
        <Link2 size={28} style={{ transform: 'rotate(-45deg)' }} />
        <span>GoLink</span>
      </div>
      <nav className="nav-links">
        <button 
          className={`nav-btn ${view === 'landing' ? 'active' : ''}`}
          onClick={() => setView('landing')}
        >
          Shorten URL
        </button>

        {user ? (
          <>
            <button 
              className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`}
              onClick={() => setView('dashboard')}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <div className="nav-btn" style={{ cursor: 'default', color: 'var(--text-primary)' }}>
              <User size={18} />
              <span>Hi, {user.name}</span>
            </div>
            <button className="nav-btn-primary" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            <button 
              className={`nav-btn ${view === 'login' ? 'active' : ''}`}
              onClick={() => setView('login')}
            >
              <LogIn size={18} />
              Sign In
            </button>
            <button 
              className="nav-btn-primary"
              onClick={() => setView('register')}
            >
              <UserPlus size={18} style={{ marginRight: '0.2rem' }} />
              Register
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
