import { adminAxiosInstance as api } from './adminAPI';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://mern-tea-backend.vercel.app/api';

export const orderAPI = {
    // ── Authenticated User Routes ────────────────────────────
    createOrder: (shippingAddress, paymentMethod) => api.post('/orders/create', { shippingAddress, paymentMethod }),
    getMyOrders: () => api.get('/orders/my'),
    getOrderById: (id) => api.get(`/orders/${id}`),
    cancelOrder: (id) => api.post(`/orders/${id}/cancel`),

    // ── Shipping Calculation ─────────────────────────────────
    calculateShipping: (deliveryPincode, items) => axios.post(`${BASE_URL}/orders/calculate-shipping`, { deliveryPincode, items }),

    // ── Razorpay Payment Routes ──────────────────────────────
    createRazorpayOrder: (shippingAddress, actualShippingCost, selectedCourierId) =>
        api.post('/orders/razorpay/create', { shippingAddress, actualShippingCost, selectedCourierId }),
    verifyRazorpayPayment: (data) => api.post('/orders/razorpay/verify', data),

    // ── Buy Now (direct purchase, no cart) ────────────────────
    buyNow: (items, shippingAddress, paymentMethod) => api.post('/orders/buy-now', { items, shippingAddress, paymentMethod }),
    buyNowRazorpayCreate: (items, shippingAddress, actualShippingCost, selectedCourierId) =>
        api.post('/orders/buy-now/razorpay/create', { items, shippingAddress, actualShippingCost, selectedCourierId }),

    // ── Guest Routes (no auth) ───────────────────────────────
    createGuestOrder: (data) => axios.post(`${BASE_URL}/orders/guest`, data),
    createGuestRazorpayOrder: (data) => axios.post(`${BASE_URL}/orders/guest/razorpay/create`, data),
    verifyGuestRazorpayPayment: (data) => axios.post(`${BASE_URL}/orders/guest/razorpay/verify`, data),
    trackOrders: (mobile) => axios.get(`${BASE_URL}/orders/track`, { params: { mobile } }),

    // ── Admin Routes ─────────────────────────────────────────
    getAllOrders: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.orderStatus) params.append('orderStatus', filters.orderStatus);
        if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
        return api.get(`/admin/orders?${params.toString()}`);
    },
    updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
    getOrderTracking: (id) => api.get(`/admin/orders/${id}/tracking`),
};
