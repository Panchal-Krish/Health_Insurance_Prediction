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

      <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {!isLoggedIn && (
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            Home
          </NavLink>
        )}

        {/* Dashboards based on role */}
        {isLoggedIn && role === 'user' && (
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            Dashboard
          </NavLink>
        )}
        {isLoggedIn && role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            Admin Panel
          </NavLink>
        )}
        {isLoggedIn && role === 'manager' && (
          <NavLink to="/manager" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
            Manager Panel
          </NavLink>
        )}

        {/* Regular links for non-staff */}
        {role !== 'admin' && role !== 'manager' && (
          <>
            {!isLoggedIn ? (
              <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
                Contact
              </NavLink>
            ) : (
              <NavLink to="/helpdesk" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
                Help Desk
              </NavLink>
            )}
            
            <NavLink to="/howitworks" end className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
              How it Works
            </NavLink>

            <NavLink to="/about" end className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>
              About us
            </NavLink>
          </>
        )}

        {/* Auth links — part of the nav now */}
        <span className="nav-divider" />
        {isLoggedIn ? (
          <button className="nav-auth-btn nav-logout" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <NavLink to="/signin" className={({ isActive }) => `nav-auth-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
            Sign In / Sign Up
          </NavLink>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu} />
      )}
    </header>
  );
}

export default Header;