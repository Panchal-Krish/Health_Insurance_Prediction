import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { getCurrentUser, logout } from "../utils/auth";
import "./../styles/Header.css";
import logo from "../assets/logo.png";

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check login status on mount and when storage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const user = getCurrentUser();
      setIsLoggedIn(user.isLoggedIn);
      setRole(user.role);
    };

    // Check on mount
    checkAuthStatus();

    // Listen for custom auth events (triggered after login/logout)
    window.addEventListener('authChange', checkAuthStatus);

    // Cleanup
    return () => {
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  const handleSignIn = () => {
    setMobileMenuOpen(false);
    navigate("/signin");
  };

  const handleDashboard = () => {
    setMobileMenuOpen(false);
    navigate("/dashboard");
  };

  const handleAdminPanel = () => {
    setMobileMenuOpen(false);
    navigate("/admin");
  };

  const handleManagerPanel = () => {
    setMobileMenuOpen(false);
    navigate("/manager");
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout(); // Clear all storage
    setIsLoggedIn(false);
    setRole(null);
    
    // Trigger auth change event
    window.dispatchEvent(new Event('authChange'));
    
    navigate("/signin");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="nav-logo" onClick={() => navigate("/")}>
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
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={closeMobileMenu}
        >
          Home
        </NavLink>

        {/* Commented out - Not implemented yet
        <NavLink
          to="/ai-analysis"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={closeMobileMenu}
        >
          AI Analysis
        </NavLink>

        <NavLink
          to="/how-it-works"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={closeMobileMenu}
        >
          How it Works
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={closeMobileMenu}
        >
          About Us
        </NavLink>
        */}

        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={closeMobileMenu}
        >
          Contact
        </NavLink>

        {/* Help Desk for logged-in users */}
        {isLoggedIn && (
          <NavLink
            to="/helpdesk"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMobileMenu}
          >
            Help Desk
          </NavLink>
        )}
      </nav>

      {/* Action Buttons */}
      <div className={`actions ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {isLoggedIn ? (
          <>
            <button className="signin-btn" onClick={handleDashboard}>
              Dashboard
            </button>

            {/* Manager Dashboard */}
            {role === "manager" && (
              <button className="signin-btn" onClick={handleManagerPanel}>
                Manager Panel
              </button>
            )}

            {/* Admin Panel */}
            {role === "admin" && (
              <button className="signin-btn" onClick={handleAdminPanel}>
                Admin Panel
              </button>
            )}

            <button className="signin-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="signin-btn" onClick={handleSignIn}>
            Sign In
          </button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={closeMobileMenu}
        />
      )}
    </header>
  );
}

export default Header;