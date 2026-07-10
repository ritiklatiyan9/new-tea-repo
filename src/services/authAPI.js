import axios from 'axios';
import { refreshAccessToken, clearSession } from './tokenRefresh';

// Backend URL from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'https://mern-tea-backend.onrender.com/api';
const API_URL = `${BASE_URL}/auth`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Ensure cookies are sent (important for refresh tokens if httpOnly)
    timeout: 10000 // 10 seconds timeout
});

// Request interceptor to attach access token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh token (shared refresh — see tokenRefresh.js)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // A 401 from login/register/google means bad credentials, not an expired session
        if (['/login', '/register', '/google'].some((p) => originalRequest?.url?.includes(p))) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            if (!localStorage.getItem('refreshToken')) return Promise.reject(error); // never logged in

            try {
                const accessToken = await refreshAccessToken(); // shared across all instances
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                clearSession();
                if (!window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (userData) => api.post('/register', userData),
    login: (credentials) => api.post('/login', credentials),
    googleLogin: (credential) => api.post('/google', { credential }),
    logout: () => api.post('/logout'),
    getCurrentUser: () => api.get('/me'),
    updateProfile: (userData) => {
        return api.patch('/profile', userData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    forgotPassword: (email) => api.post('/forgot-password', { email }),
    resetPassword: ({ token, email, password }) => api.post('/reset-password', { token, email, password }),
};

export default api;
