import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — requires user to be logged in
 * Redirects to /signin if not authenticated
 */
export const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/signin" replace />;
    }
    return children;
};

/**
 * RoleBasedRoute — requires a specific role
 * Redirects based on the user's actual role if they don't have access
 */
export const RoleBasedRoute = ({ children, allowedRoles }) => {
    const { isLoggedIn, role } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/signin" replace />;
    }

    if (!allowedRoles.includes(role)) {
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'manager') return <Navigate to="/manager" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

/**
 * GuestRoute — only for non-logged-in users (signin / signup)
 * Redirects logged-in users to their appropriate dashboard
 */
export const GuestRoute = ({ children }) => {
    const { isLoggedIn, role } = useAuth();

    if (isLoggedIn) {
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'manager') return <Navigate to="/manager" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};