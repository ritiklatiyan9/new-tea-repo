import axios from 'axios';

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

// Response interceptor to handle 401 and refresh token
let refreshPromise = null; // dedupe concurrent 401s into one /refresh call

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // A 401 from login/register means bad credentials, not an expired session
        if (originalRequest?.url?.includes('/login') || originalRequest?.url?.includes('/register')) {
            return Promise.reject(error);
        }

        // Check if error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return Promise.reject(error); // never logged in, nothing to refresh

            try {
                // Share one in-flight refresh across simultaneous 401s (e.g. Navbar + NotificationPanel
                // both firing on mount) so they don't race each other with the same soon-to-be-rotated token
                refreshPromise ??= axios.post(`${API_URL}/refresh`, { refreshToken })
                    .finally(() => { refreshPromise = null; });

                const { data } = await refreshPromise;
                const { accessToken, refreshToken: newRefreshToken } = data;

                if (accessToken) {
                    // Update local storage and header
                    localStorage.setItem('accessToken', accessToken);
                    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    // Retry original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - clean up and redirect to login
                console.error("Token refresh failed:", refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
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
