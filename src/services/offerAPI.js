import axios from 'axios';

const PUBLIC_URL = import.meta.env.VITE_API_URL || 'https://mern-tea-backend.vercel.app/api';

export const offerAPI = {
    // ── Public endpoints ─────────────────────────────────────
    getActiveOffers: async () => {
        const res = await axios.get(`${PUBLIC_URL}/offers/active`);
        return res.data;
    },
    getOffersByProduct: async (productId) => {
        const res = await axios.get(`${PUBLIC_URL}/offers/product/${productId}`);
        return res.data;
    },
};

export default offerAPI;
