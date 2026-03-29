import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logout as authLogout, saveAuthData } from '../utils/auth';

// ==============================
// Create Context
// ==============================
const AuthContext = createContext(null);

// ==============================
// Provider Component
// Wrap <App> with this in index.js
// ==============================
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getCurrentUser());

    // Re-read auth state from storage (used after login/logout)
    const refreshAuth = useCallback(() => {
        setUser(getCurrentUser());
    }, []);

    // Call this after a successful login
    const login = useCallback((token, email, role, fullName, rememberMe) => {
        saveAuthData(token, email, role, fullName, rememberMe);
        setUser(getCurrentUser());
    }, []);

    // Call this to log out from anywhere
    const logout = useCallback(() => {
        authLogout();
        setUser({ email: null, role: null, fullName: null, isLoggedIn: false });
    }, []);

    // Keep in sync if another tab logs out / token expires
    useEffect(() => {
        const handleStorageChange = () => refreshAuth();
        const handleAuthChange = () => refreshAuth();

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authChange', handleAuthChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, [refreshAuth]);

    const value = {
        user,                           // { email, role, fullName, isLoggedIn }
        isLoggedIn: user.isLoggedIn,   // boolean shortcut
        role: user.role,          // 'user' | 'admin' | 'manager' | null
        fullName: user.fullName,
        login,
        logout,
        refreshAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ==============================
// Hook — use this in any component
// e.g. const { isLoggedIn, role, login, logout } = useAuth();
// ==============================
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return context;
}