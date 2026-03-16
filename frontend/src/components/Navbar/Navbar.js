import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiCalendar, FiMapPin } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">Skill<span>Worker</span></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>{t('nav.home')}</Link>
          <Link to="/search" className={isActive('/search')} onClick={() => setMenuOpen(false)}>{t('nav.findWorkers')}</Link>
          <Link to="/categories" className={isActive('/categories')} onClick={() => setMenuOpen(false)}>{t('nav.categories')}</Link>
          <Link to="/nearby" className={isActive('/nearby')} onClick={() => setMenuOpen(false)}><FiMapPin size={14} /> Nearby</Link>
          <LanguageToggle />
          {!user && (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
          {user && (
            <div className="nav-user" onClick={() => setDropOpen(!dropOpen)}>
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=6C63FF&color=fff`} alt={user.name} className="nav-avatar" />
              <span className="nav-name">{user.name.split(' ')[0]}</span>
              {dropOpen && (
                <div className="nav-dropdown">
                  <Link to="/profile" onClick={() => setDropOpen(false)}><FiUser /> Profile</Link>
                  {user.role === 'customer' && <Link to="/my-bookings" onClick={() => setDropOpen(false)}><FiCalendar /> My Bookings</Link>}
                  {user.role === 'customer' && <Link to="/dashboard" onClick={() => setDropOpen(false)}><FiSettings /> Dashboard</Link>}
                  {user.role === 'worker' && <Link to="/worker/dashboard" onClick={() => setDropOpen(false)}><FiSettings /> Dashboard</Link>}
                  {user.role === 'admin' && <Link to="/admin/dashboard" onClick={() => setDropOpen(false)}><FiSettings /> Admin Panel</Link>}
                  <button onClick={handleLogout}><FiLogOut /> Logout</button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
}
