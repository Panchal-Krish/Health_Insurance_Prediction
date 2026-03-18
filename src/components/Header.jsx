import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './../styles/Header.css';
import logo from '../assets/logo.png';

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, role, logout } = useAuth();  // ← single source of truth
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();               // clears storage + updates context in one call
    navigate('/signin');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNav = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="nav-logo" onClick={() => navigate('/')}>
        <img src={logo} alt="Logo" className="logo-image" />
        <div className="logo-text">
          <span className="logo-title">Insurance Predictor</span>
          <span className="tagline">Predict your insurance today</span>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation */}
      <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
          Home
        </NavLink>

        <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
          Contact
        </NavLink>

        {isLoggedIn && (
          <NavLink to="/helpdesk" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            Help Desk
          </NavLink>
        )}
      </nav>

      {/* Action Buttons */}
      <div className={`actions ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {isLoggedIn ? (
          <>
            {/* Show the right dashboard button based on role */}
            {role === 'admin' && (
              <button className="signin-btn" onClick={() => handleNav('/admin')}>
                Admin Panel
              </button>
            )}
            {role === 'manager' && (
              <button className="signin-btn" onClick={() => handleNav('/manager')}>
                Manager Panel
              </button>
            )}
            {role === 'user' && (
              <button className="signin-btn" onClick={() => handleNav('/dashboard')}>
                Dashboard
              </button>
            )}

            <button className="signin-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="signin-btn" onClick={() => handleNav('/signin')}>
            Sign In
          </button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu} />
      )}
    </header>
  );
}

export default Header;