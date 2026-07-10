import axios from 'axios';

// Backend URL from environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://mern-tea-backend.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
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

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return Promise.reject(error); // never logged in, nothing to refresh

            try {
                // Share one in-flight refresh across simultaneous 401s (e.g. Navbar + NotificationPanel
                // both firing on mount) so they don't race each other with the same soon-to-be-rotated token
                refreshPromise ??= axios.post(`${API_URL}/auth/refresh`, { refreshToken })
                    .finally(() => { refreshPromise = null; });

                const { data } = await refreshPromise;
                const { accessToken, refreshToken: newRefreshToken } = data;

                if (accessToken) {
                    localStorage.setItem('accessToken', accessToken);
                    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
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

export const adminAPI = {
    // ── Dashboard ────────────────────────────────────────────
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard-stats');
        return response.data;
    },

    // ── Admin Management ─────────────────────────────────────
    getAllAdmins: async () => {
        const response = await api.get('/admin/admins');
        return response.data;
    },
    createAdmin: async (data) => {
        const response = await api.post('/admin/admins', data);
        return response.data;
    },
    updateAdmin: async (id, data) => {
        const response = await api.patch(`/admin/admins/${id}`, data);
        return response.data;
    },
    deleteAdmin: async (id) => {
        const response = await api.delete(`/admin/admins/${id}`);
        return response.data;
    },

    // ── User Management ──────────────────────────────────────
    getAllUsers: async (role) => {
        const query = role ? `?role=${role}` : '';
        const response = await api.get(`/admin/users${query}`);
        return response.data;
    },
    getUserById: async (id) => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    },
    updateUser: async (id, data) => {
        const response = await api.patch(`/admin/users/${id}`, data);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    // ── Order Management ─────────────────────────────────────
    getAllOrders: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.orderStatus) params.append('orderStatus', filters.orderStatus);
        if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
        if (filters.userId) params.append('userId', filters.userId);

        const response = await api.get(`/admin/orders?${params.toString()}`);
        return response.data;
    },
    getOrderById: async (id) => {
        const response = await api.get(`/admin/orders/${id}`);
        return response.data;
    },
    updateOrderStatus: async (orderId, status) => {
        const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
        return response.data;
    },
    updatePaymentStatus: async (orderId, paymentStatus) => {
        const response = await api.patch(`/admin/orders/${orderId}/payment`, { paymentStatus });
        return response.data;
    },
    deleteOrder: async (id) => {
        const response = await api.delete(`/admin/orders/${id}`);
        return response.data;
    },

    // ── Complaint Management ─────────────────────────────────
    submitComplaint: async (data) => {
        // Public endpoint, use raw axios if no auth, or api instance if we want to attach potential token
        // Use 'api' instance to auto-attach token if user is logged in
        const response = await api.post('/complaints', data);
        return response.data;
    },
    getAllComplaints: async (status, source) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (source) params.append('source', source);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await api.get(`/admin/complaints${query}`);
        return response.data;
    },
    getComplaintById: async (id) => {
        const response = await api.get(`/admin/complaints/${id}`);
        return response.data;
    },
    respondToComplaint: async (id, data) => {
        const response = await api.patch(`/admin/complaints/${id}`, data);
        return response.data;
    },
    deleteComplaint: async (id) => {
        const response = await api.delete(`/admin/complaints/${id}`);
        return response.data;
    },
    getUserComplaints: async () => {
        const response = await api.get('/complaints/my-complaints');
        return response.data;
    },
    trackComplaint: async (id) => {
        // Public endpoint, use raw axios if needed, but api instance handles it fine
        const response = await api.get(`/complaints/track/${id}`);
        return response.data;
    },

    // ══════════════════════════════════════════════════════════
    // NEW FEATURE API METHODS (additive only)
    // ══════════════════════════════════════════════════════════

    // ── Offers ────────────────────────────────────────────────
    getAllOffers: async () => {
        const response = await api.get('/offers');
        return response.data;
    },
    createOffer: async (formData) => {
        const response = await api.post('/offers', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    updateOffer: async (id, formData) => {
        const response = await api.patch(`/offers/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    toggleOffer: async (id) => {
        const response = await api.patch(`/offers/${id}/toggle`);
        return response.data;
    },
    deleteOffer: async (id) => {
        const response = await api.delete(`/offers/${id}`);
        return response.data;
    },

    // ── Notifications (optimized polling) ─────────────────────
    getNotifications: async (params = {}) => {
        const response = await api.get('/notifications', { params });
        return response.data;
    },
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },
    markNotificationRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },
    markAllNotificationsRead: async () => {
        const response = await api.patch('/notifications/mark-all-read');
        return response.data;
    },
    deleteNotification: async (id) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },

    // ── Reports ───────────────────────────────────────────────
    getMonthlyReport: async (month, year) => {
        const response = await api.get(`/reports/monthly?month=${month}&year=${year}`);
        return response.data;
    },
    exportReportExcel: async (month, year) => {
        const response = await api.get(`/reports/monthly/excel?month=${month}&year=${year}`, {
            responseType: 'blob',
        });
        return response.data;
    },
    exportReportPDF: async (month, year) => {
        const response = await api.get(`/reports/monthly/pdf?month=${month}&year=${year}`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // ── Stock Alerts ──────────────────────────────────────────
    getLowStockProducts: async () => {
        const response = await api.get('/stock-alerts');
        return response.data;
    },
    getStockSummary: async () => {
        const response = await api.get('/stock-alerts/summary');
        return response.data;
    },
    getLowStockCount: async () => {
        const response = await api.get('/stock-alerts/count');
        return response.data;
    },

    // ── Settings (dynamic threshold) ──────────────────────────
    getSettings: async () => {
        const response = await api.get('/settings');
        return response.data;
    },
    updateSettings: async (data) => {
        const response = await api.patch('/settings', data);
        return response.data;
    },

    // ── Admin Logs ────────────────────────────────────────────
    getAdminLogs: async (params = {}) => {
        const response = await api.get('/admin-logs', { params });
        return response.data;
    },
};

export const adminAxiosInstance = api;
export default adminAPI;
