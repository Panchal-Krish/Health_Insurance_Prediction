// src/utils/auth.js

// Keys used in storage — single source of truth
const STORAGE_KEYS = {
    TOKEN: 'token',
    EMAIL: 'userEmail',
    ROLE: 'role',
    FULL_NAME: 'fullName',
    IS_LOGGED_IN: 'isLoggedIn'
};

// ==============================
// Storage Helper
// ==============================
const getStorage = () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
        ? localStorage
        : sessionStorage;
};

// ==============================
// Get Token
// ==============================
export const getToken = () => {
    return (
        localStorage.getItem(STORAGE_KEYS.TOKEN) ||
        sessionStorage.getItem(STORAGE_KEYS.TOKEN)
    );
};

// ==============================
// Token Expiry Check
// ==============================
export const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return false;
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

// ==============================
// Is Authenticated
// ==============================
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    if (isTokenExpired(token)) {
        clearAuthStorage();
        return false;
    }

    return true;
};

// ==============================
// Get Current User
// ==============================
export const getCurrentUser = () => {
    if (!isAuthenticated()) {
        return {
            email: null,
            role: null,
            fullName: null,
            isLoggedIn: false
        };
    }

    const storage = getStorage();

    return {
        email: storage.getItem(STORAGE_KEYS.EMAIL),
        role: storage.getItem(STORAGE_KEYS.ROLE),
        fullName: storage.getItem(STORAGE_KEYS.FULL_NAME),
        isLoggedIn: true
    };
};

// ==============================
// Save Auth Data
// ==============================
export const saveAuthData = (token, email, role, fullName, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem(STORAGE_KEYS.TOKEN, token);
    storage.setItem(STORAGE_KEYS.EMAIL, email);
    storage.setItem(STORAGE_KEYS.ROLE, role);
    storage.setItem(STORAGE_KEYS.FULL_NAME, fullName);
    storage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');

    // Notify app
    window.dispatchEvent(new Event('authChange'));
};

// ==============================
// Clear Auth Storage
// ==============================
const clearAuthStorage = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
};

// ==============================
// Logout
// ==============================
export const logout = () => {
    clearAuthStorage();
    window.dispatchEvent(new Event('authChange'));
};

// ==============================
// Authenticated Fetch (FINAL FIX)
// ==============================
export const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();

    // ✅ 1. Check expiry BEFORE request
    if (token && isTokenExpired(token)) {
        clearAuthStorage();
        window.dispatchEvent(new Event('authChange'));
        window.location.href = "/signin";
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    // ✅ 2. Handle backend 401 (EXPIRED / INVALID TOKEN)
    if (response.status === 401) {
        clearAuthStorage();
        window.dispatchEvent(new Event('authChange'));
        window.location.href = "/signin";
        return;
    }

    return response;
};