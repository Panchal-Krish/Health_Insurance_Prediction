import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./../styles/Header.css";
import logo from "../assets/logo.png";

function Header() {
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleAdminPanel = () => {
    navigate("/admin");
  };

  const handleManagerPanel = () => {
    navigate("/manager");
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");

    navigate("/signin");
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

      {/* Navigation */}
      <nav className="nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Home
        </NavLink>

        <NavLink
          to="/ai-analysis"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          AI Analysis
        </NavLink>

        <NavLink
          to="/how-it-works"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          How it Works
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          About Us
        </NavLink>

        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Contact
        </NavLink>

        {/* Help Desk for logged-in users */}
        {isLoggedIn && (
          <NavLink
            to="/helpdesk"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Help Desk
          </NavLink>
        )}
      </nav>

      {/* Action Buttons */}
      <div className="actions">
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

            <button className="signin-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="signin-btn" onClick={handleSignIn}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;