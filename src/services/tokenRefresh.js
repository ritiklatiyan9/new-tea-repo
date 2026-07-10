import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://mern-tea-backend.onrender.com/api';

// ONE in-flight refresh shared across every axios instance. Without this, the
// separate authAPI/adminAPI instances each refresh independently; on a reload
// with an expired access token they race the backend's refresh-token rotation,
// which trips reuse-detection and revokes the whole session (surprise logout).
let refreshPromise = null;

export function refreshAccessToken() {
    if (refreshPromise) return refreshPromise;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return Promise.reject(new Error('No refresh token'));

    refreshPromise = axios
        .post(`${BASE_URL}/auth/refresh`, { refreshToken })
        .then(({ data }) => {
            if (!data?.accessToken) throw new Error('No access token in refresh response');
            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            return data.accessToken;
        })
        .finally(() => {
            refreshPromise = null;
        });

    return refreshPromise;
}

export function clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}
