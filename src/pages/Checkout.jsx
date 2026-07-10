import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, CreditCard, Banknote, ShieldCheck, Leaf, MapPin, AlertCircle, Mail, User, Truck, Clock, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { cartAPI } from '@/services/cartAPI';
import { guestCartService } from '@/services/guestCartService';
import { orderAPI } from '@/services/orderAPI';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getSugarOffer } from '@/utils/sugarOffer';



const PAYMENT_METHODS = [
    { id: 'online', label: 'Pay Online (Razorpay)', icon: CreditCard, desc: 'UPI, Cards, Net Banking' },
];

const InputField = ({ label, name, type = 'text', placeholder, value, onChange, error, colSpan = '', autoComplete, required }) => (
    <div className={colSpan}>
        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`w-full px-3.5 py-2.5 rounded-lg border ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'} text-sm focus:outline-none focus:border-[#385040] focus:ring-1 focus:ring-[#385040]/20 transition-colors`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

/**
 * Dynamically load Razorpay SDK script
 */
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const isExpress = Boolean(location.state?.expressItems);

    const { user, isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [errors, setErrors] = useState({});

    const [address, setAddress] = useState({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
    });

    // Guest contact email — name/phone come from the shipping address, no need to ask twice
    const [guestContact, setGuestContact] = useState({ email: '' });

    // ── Shipping / Courier Selection State ───────────────────
    const [shippingCouriers, setShippingCouriers] = useState([]);
    const [selectedCourier, setSelectedCourier] = useState(null);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [shippingError, setShippingError] = useState('');
    const [lastCheckedPincode, setLastCheckedPincode] = useState('');

    // (Removed auto-load logic to ensure fields remain blank per user request)

    // Fetch cart or load from router state for express buy
    useEffect(() => {
        const loadCheckoutData = async () => {
            try {
                if (isExpress) {
                    const items = location.state.expressItems;
                    const totalPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                    setCart({ items, totalPrice });
                    setLoading(false);
                    return;
                }

                if (isAuthenticated) {
                    const { data } = await cartAPI.getCart();
                    const cartData = data.data;
                    if (!cartData || !cartData.items || cartData.items.length === 0) {
                        toast.error('Your cart is empty');
                        navigate('/cart');
                        return;
                    }
                    setCart(cartData);
                } else {
                    const guestCart = guestCartService.getCart();
                    if (!guestCart.items || guestCart.items.length === 0) {
                        toast.error('Your cart is empty');
                        navigate('/cart');
                        return;
                    }
                    setCart(guestCart);
                }
            } catch (err) {
                console.error('Failed to load checkout data', err);
                toast.error('Failed to load checkout data');
                navigate('/cart');
            } finally {
                setLoading(false);
            }
        };

        loadCheckoutData();

        if (!isExpress) {
            const handleCartUpdate = () => {
                loadCheckoutData();
            };
            window.addEventListener('cartUpdated', handleCartUpdate);
            return () => window.removeEventListener('cartUpdated', handleCartUpdate);
        }
    }, [navigate, isAuthenticated, isExpress, location.state]);

    // ── Fetch shipping rates when pincode is valid and cart is loaded ──
    useEffect(() => {
        const pincode = address.zipCode?.trim();
        if (!/^\d{6}$/.test(pincode) || !cart?.items?.length || pincode === lastCheckedPincode) return;

        const fetchShipping = async () => {
            setShippingLoading(true);
            setShippingError('');
            setSelectedCourier(null);
            setShippingCouriers([]);
            try {
                const items = cart.items.map(item => ({
                    productId: item.product?._id || item.product,
                    variantSize: item.variantSize || item.size,
                    quantity: item.quantity,
                }));
                const { data } = await orderAPI.calculateShipping(pincode, items);
                const couriers = data?.data?.couriers || [];
                setShippingCouriers(couriers);
                // Auto-select recommended (cheapest) courier
                const recommended = couriers.find(c => c.recommended) || couriers[0];
                if (recommended) setSelectedCourier(recommended);
                setLastCheckedPincode(pincode);
            } catch (err) {
                const msg = err.response?.data?.message || 'Failed to calculate shipping';
                setShippingError(msg);
                setShippingCouriers([]);
            } finally {
                setShippingLoading(false);
            }
        };

        const debounce = setTimeout(fetchShipping, 600);
        return () => clearTimeout(debounce);
    }, [address.zipCode, cart, lastCheckedPincode]);

    // Sanitize phone/mobile: strip spaces, dashes, +91 prefix, leading 0
    const sanitizePhone = (val) => {
        let cleaned = val.replace(/[\s\-().]/g, '');
        if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
        if (cleaned.startsWith('91') && cleaned.length > 10) cleaned = cleaned.slice(2);
        if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
        return cleaned;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === 'phone' ? sanitizePhone(value) : value;
        setAddress(prev => ({ ...prev, [name]: finalValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        // Reset shipping when pincode changes
        if (name === 'zipCode') {
            setLastCheckedPincode('');
        }
    };

    const handleGuestChange = (e) => {
        const { name, value } = e.target;
        setGuestContact(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!address.fullName.trim()) errs.fullName = 'Full name is required';
        if (!address.phone.trim()) errs.phone = 'Phone number is required';
        else if (!/^[6-9]\d{9}$/.test(address.phone.trim())) errs.phone = 'Enter a valid 10-digit phone number';
        if (!address.street.trim()) errs.street = 'Street address is required';
        if (!address.city.trim()) errs.city = 'City is required';
        if (!address.state.trim()) errs.state = 'State is required';
        if (!address.zipCode.trim()) errs.zipCode = 'ZIP code is required';
        else if (!/^\d{6}$/.test(address.zipCode.trim())) errs.zipCode = 'Enter a valid 6-digit ZIP code';

        // Courier selection validation
        if (!selectedCourier) errs.courier = 'Please select a delivery option';

        // Guest-specific validation (name/phone already validated above via the shared address fields)
        if (!isAuthenticated) {
            if (!guestContact.email.trim()) errs.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(guestContact.email)) errs.email = 'Enter a valid email address';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const buildShippingAddress = useCallback(() => ({
        fullName: address.fullName,
        phone: address.phone,
        address: address.street,
        city: address.city,
        state: address.state,
        pincode: address.zipCode
    }), [address]);

    /**
     * Handle Razorpay Online Payment Flow
     */
    const handleRazorpayPayment = async (shippingAddress) => {
        // 1. Load Razorpay SDK
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            toast.error('Failed to load payment gateway. Please check your internet connection.');
            return;
        }

        // 2. Create Razorpay order on backend
        let orderData;
        try {
            let response;
            if (isExpress) {
                // Express Buy → use buy-now endpoint (no cart)
                const buyNowItems = cart.items.map(item => ({
                    productId: item.product._id,
                    variantSize: item.size,
                    quantity: item.quantity
                }));
                response = await orderAPI.buyNowRazorpayCreate(buyNowItems, shippingAddress, selectedCourier.rate, selectedCourier.courier_company_id);
            } else {
                response = await orderAPI.createRazorpayOrder(shippingAddress, selectedCourier.rate, selectedCourier.courier_company_id);
            }
            orderData = response.data?.data || response.data;
        } catch (err) {
            console.error('Razorpay order creation failed', err);
            toast.error(err.response?.data?.message || 'Failed to create payment order. Please try again.');
            return;
        }

        const { orderId, orderNumber, razorpayOrderId, amount, currency } = orderData;

        // 3. Open Razorpay Checkout
        const options = {
            key: import.meta.env.VITE_RAZORPAY_PUBLIC_ID, // Use Public ID to avoid deployment warnings
            amount: amount * 100, // Amount in paise
            currency: currency || 'INR',
            name: 'Chai Adda',
            description: `Order #${orderNumber}`,
            order_id: razorpayOrderId,
            prefill: {
                name: address.fullName,
                contact: address.phone,
                email: user?.email || '',
            },
            theme: {
                color: '#385040',
            },
            handler: async (response) => {
                // 4. Verify payment on backend
                try {
                    await orderAPI.verifyRazorpayPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: orderId,
                    });

                    // Payment verified successfully
                    window.dispatchEvent(new Event('cartUpdated'));
                    navigate('/order-success', {
                        state: {
                            orderNumber,
                            orderId,
                            amount,
                            paymentId: response.razorpay_payment_id,
                        }
                    });
                } catch (verifyErr) {
                    console.error('Payment verification failed', verifyErr);
                    navigate('/order-failure', {
                        state: {
                            orderNumber,
                            orderId,
                            reason: verifyErr.response?.data?.message || 'Payment verification failed',
                        }
                    });
                }
            },
            modal: {
                ondismiss: () => {
                    toast.error('Payment cancelled. Your order is pending.');
                    // Navigate to failure page with cancellation info
                    navigate('/order-failure', {
                        state: {
                            orderNumber,
                            orderId,
                            reason: 'Payment was cancelled by user',
                        }
                    });
                },
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
            console.error('Razorpay payment failed', response.error);
            navigate('/order-failure', {
                state: {
                    orderNumber,
                    orderId,
                    reason: response.error?.description || 'Payment failed',
                }
            });
        });
        rzp.open();
    };

    /**
     * Handle Razorpay Online Payment Flow (Guest)
     */
    const handleGuestRazorpayPayment = async (shippingAddress) => {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            toast.error('Failed to load payment gateway.');
            return;
        }

        let orderData;
        try {
            const items = isExpress
                ? cart.items.map(item => ({ productId: item.product._id, variantSize: item.size, quantity: item.quantity }))
                : guestCartService.getOrderItems();
            const response = await orderAPI.createGuestRazorpayOrder({
                items,
                shippingAddress,
                guestContact: {
                    mobile: shippingAddress.phone,
                    name: shippingAddress.fullName,
                    email: guestContact.email.trim()
                },
                actualShippingCost: selectedCourier.rate,
                selectedCourierId: selectedCourier.courier_company_id,
            });
            orderData = response.data?.data || response.data;
        } catch (err) {
            console.error('Guest Razorpay order creation failed', err);
            toast.error(err.response?.data?.message || 'Failed to create payment order.');
            return;
        }

        const { orderId, orderNumber, razorpayOrderId, amount, currency } = orderData;

        const options = {
            key: import.meta.env.VITE_RAZORPAY_PUBLIC_ID,
            amount: amount * 100,
            currency: currency || 'INR',
            name: 'Chai Adda',
            description: `Order #${orderNumber}`,
            order_id: razorpayOrderId,
            prefill: {
                name: shippingAddress.fullName || 'Guest',
                contact: shippingAddress.phone,
                email: guestContact.email || '',
            },
            theme: { color: '#385040' },
            handler: async (response) => {
                try {
                    await orderAPI.verifyGuestRazorpayPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: orderId,
                    });

                    if (!isExpress) guestCartService.clearCart();
                    toast.success('Order placed successfully! 🎉');
                    navigate('/order-success', {
                        state: { orderNumber, orderId, amount, paymentId: response.razorpay_payment_id }
                    });
                } catch (verifyErr) {
                    console.error('Payment verification failed', verifyErr);
                    navigate('/order-failure', {
                        state: { orderNumber, orderId, reason: verifyErr.response?.data?.message || 'Verification failed' }
                    });
                }
            },
            modal: {
                ondismiss: () => {
                    toast.error('Payment cancelled.');
                },
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
            navigate('/order-failure', {
                state: { orderNumber, orderId, reason: response.error?.description || 'Payment failed' }
            });
        });
        rzp.open();
    };

    const handlePlaceOrder = async () => {
        if (!validate()) {
            toast.error('Please fill all required fields');
            return;
        }
        setPlacing(true);
        try {
            const shippingAddress = buildShippingAddress();

            if (isAuthenticated) {
                // === RAZORPAY ONLINE PAYMENT (Authenticated) ===
                await handleRazorpayPayment(shippingAddress);
            } else {
                // === RAZORPAY ONLINE PAYMENT (Guest) ===
                await handleGuestRazorpayPayment(shippingAddress);
            }
        } catch (err) {
            console.error('Order placement failed', err);
            toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setPlacing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#385040] animate-spin" />
            </div>
        );
    }

    const totalPrice = cart?.totalPrice || 0;
    const shipping = selectedCourier ? selectedCourier.rate : 0; // real courier cost — on us, not charged to the customer
    const total = totalPrice;

    // ── Sugar offer: 1 kg free sugar per full 1 kg of tea, repeating ──
    const { sugarKg, remainingG } = getSugarOffer(cart?.items || []);
    const qualifiesForSugar = sugarKg > 0;

    return (
        <div className="min-h-screen bg-[#F9F9F9] pt-28 pb-16 font-sans text-[#1A1A1A]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-5">
                    <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#385040] transition-colors uppercase tracking-wide mb-3">
                        <ArrowLeft className="w-4 h-4" /> Back to Cart
                    </Link>
                    <h1 className="font-display text-3xl font-bold">Checkout</h1>
                </div>

                <div className="lg:grid lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT: Form */}
                    <div className="lg:col-span-7 space-y-5">

                        {/* Shipping Address (+ contact email for guests, folded in — no need to re-ask for name/phone) */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-7 h-7 rounded-full bg-[#385040] text-white flex items-center justify-center text-xs font-bold">1</div>
                                <h2 className="font-display text-lg font-bold">{isAuthenticated ? 'Shipping Address' : 'Contact & Shipping Address'}</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {!isAuthenticated && (
                                    <InputField
                                        label="Email"
                                        name="email"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={guestContact.email}
                                        onChange={handleGuestChange}
                                        error={errors.email}
                                        autoComplete="email"
                                        colSpan="sm:col-span-2"
                                        required
                                    />
                                )}
                                <InputField
                                    label="Full Name"
                                    name="fullName"
                                    placeholder="John Doe"
                                    value={address.fullName}
                                    onChange={handleChange}
                                    error={errors.fullName}
                                    autoComplete="name"
                                    required
                                />
                                <InputField
                                    label="Phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="9999999999"
                                    value={address.phone}
                                    onChange={handleChange}
                                    error={errors.phone}
                                    autoComplete="tel"
                                    required
                                />
                                <InputField
                                    label="Street Address"
                                    name="street"
                                    placeholder="123 Tea Estate Road"
                                    colSpan="sm:col-span-2"
                                    value={address.street}
                                    onChange={handleChange}
                                    error={errors.street}
                                    autoComplete="street-address"
                                    required
                                />
                                <InputField
                                    label="City"
                                    name="city"
                                    placeholder="Mumbai"
                                    value={address.city}
                                    onChange={handleChange}
                                    error={errors.city}
                                    autoComplete="address-level2"
                                    required
                                />
                                <InputField
                                    label="State"
                                    name="state"
                                    placeholder="Maharashtra"
                                    value={address.state}
                                    onChange={handleChange}
                                    error={errors.state}
                                    autoComplete="address-level1"
                                    required
                                />
                                <InputField
                                    label="ZIP Code"
                                    name="zipCode"
                                    placeholder="400001"
                                    value={address.zipCode}
                                    onChange={handleChange}
                                    error={errors.zipCode}
                                    autoComplete="postal-code"
                                    required
                                />
                                <InputField
                                    label="Country"
                                    name="country"
                                    placeholder="India"
                                    value={address.country}
                                    onChange={handleChange}
                                    error={errors.country}
                                    autoComplete="country-name"
                                />
                            </div>
                        </motion.div>

                        {/* Delivery Options */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-7 h-7 rounded-full bg-[#385040] text-white flex items-center justify-center text-xs font-bold">2</div>
                                <h2 className="font-display text-lg font-bold">Delivery Options</h2>
                            </div>

                            {!address.zipCode || address.zipCode.length < 6 ? (
                                <div className="text-center py-6 text-gray-400 text-sm">
                                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>Enter your ZIP code to see delivery options</p>
                                </div>
                            ) : shippingLoading ? (
                                <div className="text-center py-6">
                                    <div className="w-6 h-6 border-2 border-[#385040] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Checking delivery options...</p>
                                </div>
                            ) : shippingError ? (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    {shippingError}
                                </div>
                            ) : shippingCouriers.length > 0 ? (
                                <div className="grid gap-3">
                                    {shippingCouriers.map((courier) => {
                                        const isSelected = selectedCourier?.courier_company_id === courier.courier_company_id;
                                        return (
                                            <button
                                                type="button"
                                                key={courier.courier_company_id}
                                                onClick={() => setSelectedCourier(courier)}
                                                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${isSelected
                                                    ? 'border-[#385040] bg-[#385040]/5 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#385040] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    <Truck className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-sm text-[#1A1A1A]">{courier.courier_name}</p>
                                                        {courier.recommended && (
                                                            <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Recommended</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        {courier.estimated_delivery_days} day{courier.estimated_delivery_days > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wide text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 shrink-0">
                                                    Free
                                                </span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#385040]' : 'border-gray-300'}`}>
                                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#385040]" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400 text-sm">
                                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No delivery options available for this pincode</p>
                                </div>
                            )}
                            {errors.courier && <p className="text-red-500 text-xs mt-2">{errors.courier}</p>}
                        </motion.div>

                        {/* Payment Method */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-7 h-7 rounded-full bg-[#385040] text-white flex items-center justify-center text-xs font-bold">3</div>
                                <h2 className="font-display text-lg font-bold">Payment Method</h2>
                            </div>

                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-[#385040]/20 bg-[#385040]/5">
                                <div className="w-9 h-9 rounded-lg bg-[#385040] text-white flex items-center justify-center shrink-0">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-[#1A1A1A]">{PAYMENT_METHODS[0].label}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-blue-600 shrink-0" /> Secured — UPI, Cards, Net Banking &amp; Wallets
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 sticky top-32">
                            <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-6 border-b border-gray-100 pb-4">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                                {cart?.items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 items-center">
                                        <div className="w-14 h-14 bg-[#F5F5F0] rounded-lg overflow-hidden border border-gray-100 shrink-0">
                                            <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-[#1A1A1A] truncate">{item.product?.name}</p>
                                            <p className="text-xs text-gray-400">{item.variantSize || item.size} × {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-bold text-[#1A1A1A] shrink-0">₹{(item.itemTotal || (item.price * item.quantity)).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Delivery Charge</span>
                                    {selectedCourier ? (
                                        <span className="flex items-center gap-2">
                                            <span className="text-gray-400 line-through decoration-2">₹{shipping.toFixed(2)}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wide text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                                                Free — on us
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Select courier</span>
                                    )}
                                </div>
                                {qualifiesForSugar && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Sugar × {sugarKg} Kg (Free)</span>
                                        <span className="font-bold">₹0.00</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2 mt-1">
                                    <Gift className="w-3.5 h-3.5 shrink-0" />
                                    <span>Add {remainingG} g more tea to get <strong>FREE {sugarKg + 1} Kg Sugar!</strong></span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-base font-bold">Total</span>
                                    <span className="font-display text-3xl font-bold text-[#1A1A1A]">₹{total.toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 text-right mt-1">Inclusive of all taxes · Free delivery, on us</p>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={placing}
                                className="w-full py-4 bg-[#1A1A1A] text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#385040] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                            >
                                {placing ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><CreditCard className="w-4 h-4" /> Pay ₹{total.toFixed(2)}</>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Secure</span>
                                <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" /> Estate Direct</span>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}
