// src/utils/auth.js

// Keys used in storage — single source of truth
const STORAGE_KEYS = {
    TOKEN:      'token',
    EMAIL:      'userEmail',
    ROLE:       'role',
    FULL_NAME:  'fullName',
    IS_LOGGED_IN: 'isLoggedIn'
};

// ==============================
// Storage Helper
// Detects which storage the session lives in
// ==============================
const getStorage = () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) ? localStorage : sessionStorage;
};

// ==============================
// Get Token
// ==============================
export const getToken = () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN);
};

// ==============================
// Token Expiry Check
// FIX: Decode JWT locally to check exp field without an API call
// ==============================
export const isTokenExpired = (token) => {
    try {
        // JWT is 3 base64 parts separated by dots — middle part is the payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return false;
        // payload.exp is in seconds, Date.now() is in milliseconds
        return payload.exp * 1000 < Date.now();
    } catch {
        // If we can't decode it, treat it as expired
        return true;
    }
};

// ==============================
// Is Authenticated
// FIX: Now checks both token existence AND expiry — single source of truth
// Previously isAuthenticated() and getCurrentUser().isLoggedIn could contradict each other
// ==============================
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;
    if (isTokenExpired(token)) {
        // Token exists but is expired — clean up storage silently
        clearAuthStorage();
        return false;
    }
    return true;
};

// ==============================
// Get Current User
// FIX: Now uses isAuthenticated() so it's always consistent with token state
// ==============================
export const getCurrentUser = () => {
    if (!isAuthenticated()) {
        return {
            email:      null,
            role:       null,
            fullName:   null,
            isLoggedIn: false
        };
    }

    const storage = getStorage();
    return {
        email:      storage.getItem(STORAGE_KEYS.EMAIL),
        role:       storage.getItem(STORAGE_KEYS.ROLE),
        fullName:   storage.getItem(STORAGE_KEYS.FULL_NAME),
        isLoggedIn: true
    };
};

// ==============================
// Save Auth Data (called after login)
// ==============================
export const saveAuthData = (token, email, role, fullName, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEYS.TOKEN,        token);
    storage.setItem(STORAGE_KEYS.EMAIL,        email);
    storage.setItem(STORAGE_KEYS.ROLE,         role);
    storage.setItem(STORAGE_KEYS.FULL_NAME,    fullName);
    storage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
};

// ==============================
// Clear Auth Storage
// FIX: Only removes auth-specific keys instead of nuking all storage
// Previously localStorage.clear() would wipe unrelated app data too
// ==============================
const clearAuthStorage = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
};

// ==============================
// Logout
// ==============================
export const logout = () => {
    clearAuthStorage();
};

// ==============================
// Authenticated Fetch
// FIX: Now checks token expiry before sending — won't make API calls with a dead token
// ==============================
export const fetchWithAuth = async (url, options = {}) => {
    const token = getToken();

    // If token is expired, clear storage and throw so callers can redirect
    if (token && isTokenExpired(token)) {
        clearAuthStorage();
        window.dispatchEvent(new Event('authChange'));
        throw new Error('Session expired. Please sign in again.');
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
};