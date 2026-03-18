// src/utils/auth.js

/**
 * Get authentication token from storage
 */
export const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

/**
 * Get current user info from storage
 */
export const getCurrentUser = () => {
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
    
    return {
        email: storage.getItem('userEmail'),
        role: storage.getItem('role'),
        fullName: storage.getItem('fullName'),
        isLoggedIn: storage.getItem('isLoggedIn') === 'true'
    };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!getToken();
};

/**
 * Logout user - clear all storage
 */
export const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
};

/**
 * Make authenticated API request
 */
export const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return fetch(url, {
        ...options,
        headers
    });
};