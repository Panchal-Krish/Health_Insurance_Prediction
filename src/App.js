import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { ProtectedRoute, RoleBasedRoute, GuestRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Contact from './pages/Contact';
import Predict from './pages/Predict';
import HelpDesk from './pages/HelpDesk';
import AdminPanel from './pages/AdminPanel';
import ManagerDashboard from './pages/ManagerDashboard';
import About from './pages/About';
import HowitWorks from './pages/Howitworks';


import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />

            {/* Guest Routes (only for non-logged-in users) */}
            <Route
              path="/signin"
              element={
                <GuestRoute>
                  <SignIn />
                </GuestRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <SignUp />
                </GuestRoute>
              }
            />

            {/* Protected Routes (require login) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/predict"
              element={
                <ProtectedRoute>
                  <Predict />
                </ProtectedRoute>
              }
            />
            <Route
              path="/helpdesk"
              element={
                <ProtectedRoute>
                  <HelpDesk />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                  <About />
              }
            />
            <Route
              path="/howitworks"
              element={
                  <HowitWorks />
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/admin"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </RoleBasedRoute>
              }
            />

            {/* Manager Only Routes */}
            <Route
              path="/manager"
              element={
                <RoleBasedRoute allowedRoles={['manager']}>
                  <ManagerDashboard />
                </RoleBasedRoute>
              }
            />

            {/* Placeholder Routes (for future implementation) */}
            <Route path="/privacy-policy" element={<div className="page-placeholder">Privacy Policy</div>} />
            <Route path="/terms-of-service" element={<div className="page-placeholder">Terms of Service</div>} />

            {/* 404 - Catch all */}
            <Route path="*" element={<div className="page-placeholder">404 - Page Not Found</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;