import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';

function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('golink_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('golink_user');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('golink_user', JSON.stringify(userData));
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('golink_user');
    setView('landing');
  };

  // Helper to trigger dashboard refresh when a new link is shortened on the landing page
  const handleLinkShortened = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <div className="bg-gradient"></div>
      <div className="app-container">
        <Navbar 
          user={user} 
          view={view} 
          setView={setView} 
          onLogout={handleLogout} 
        />
        
        {view === 'landing' && (
          <LandingPage 
            user={user} 
            onLinkShortened={handleLinkShortened} 
          />
        )}
        
        {view === 'login' && (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess} 
            setView={setView} 
          />
        )}
        
        {view === 'register' && (
          <RegisterPage 
            setView={setView} 
          />
        )}
        
        {view === 'dashboard' && user && (
          <Dashboard 
            user={user} 
            refreshTrigger={refreshTrigger} 
            setView={setView} 
          />
        )}
      </div>
    </>
  );
}

export default App;
