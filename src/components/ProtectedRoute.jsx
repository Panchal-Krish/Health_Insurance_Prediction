import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/auth';

/**
 * ProtectedRoute - Requires user to be logged in
 * Redirects to /signin if not authenticated
 */
export const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/signin" replace />;
    }
    return children;
};

/**
 * RoleBasedRoute - Requires specific role(s)
 * Redirects based on user's actual role
 */
export const RoleBasedRoute = ({ children, allowedRoles }) => {
    const user = getCurrentUser();

    // Not logged in → redirect to signin
    if (!user.isLoggedIn) {
        return <Navigate to="/signin" replace />;
    }

    // Logged in but wrong role → redirect to appropriate dashboard
    if (!allowedRoles.includes(user.role)) {
        // Redirect to user's appropriate page
        if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        } else if (user.role === 'manager') {
            return <Navigate to="/manager" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // Correct role → allow access
    return children;
};

/**
 * GuestRoute - Only for non-logged-in users (signin/signup pages)
 * Redirects logged-in users to their dashboard
 */
export const GuestRoute = ({ children }) => {
    const user = getCurrentUser();

    if (user.isLoggedIn) {
        // Redirect based on role
        if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        } else if (user.role === 'manager') {
            return <Navigate to="/manager" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};