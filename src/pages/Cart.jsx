import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Leaf, Loader2, AlertCircle, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cartAPI } from '@/services/cartAPI';
import { guestCartService } from '@/services/guestCartService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import SEOHelmet from '@/components/SEOHelmet';
import { getSugarOffer } from '@/utils/sugarOffer';

export default function Cart() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingItems, setUpdatingItems] = useState(new Set());

    const fetchCart = async () => {
        try {
            setError(null);
            if (isAuthenticated) {
                console.log('[DEBUG] Cart.jsx: Fetching API cart...');
                const { data } = await cartAPI.getCart();
                console.log('[DEBUG] Cart.jsx: API Cart received:', data.data);
                setCart(data.data);
            } else {
                console.log('[DEBUG] Cart.jsx: Fetching Guest cart...');
                const guestCart = guestCartService.getCart();
                console.log('[DEBUG] Cart.jsx: Guest Cart read:', guestCart);
                setCart(guestCart);
            }
        } catch (err) {
            console.error('Failed to fetch cart', err);
            setError('Failed to load your cart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();

        // Listen for cart updates (e.g. from Navbar or other components)
        const handleCartUpdate = () => {
            console.log('[DEBUG] Cart.jsx: cartUpdated event received, refreshing cart...');
            fetchCart();
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [isAuthenticated]);

    const updateQuantity = async (productId, variantSize, newQuantity) => {
        const key = `${productId}-${variantSize}`;
        setUpdatingItems(prev => new Set(prev).add(key));
        try {
            if (isAuthenticated) {
                const { data } = await cartAPI.updateCartItem(productId, variantSize, newQuantity);
                setCart(data.data);
            } else {
                const updated = guestCartService.updateCartItem(productId, variantSize, newQuantity);
                setCart(updated);
            }
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to update quantity');
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }
    };

    const removeItem = async (productId, variantSize) => {
        const key = `${productId}-${variantSize}`;
        setUpdatingItems(prev => new Set(prev).add(key));
        try {
            if (isAuthenticated) {
                const { data } = await cartAPI.removeFromCart(productId, variantSize);
                setCart(data.data);
            } else {
                const updated = guestCartService.removeFromCart(productId, variantSize);
                setCart(updated);
            }
            window.dispatchEvent(new Event('cartUpdated'));
            toast.success('Item removed from cart');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to remove item');
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center font-serif">
                <Loader2 className="w-8 h-8 text-[#385040] animate-spin" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center font-serif">
                <div className="text-center max-w-md mx-auto px-6 bg-white p-12 rounded-xl shadow-sm border border-gray-100">
                    <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                    <h2 className="font-display text-xl text-[#1A1A1A] mb-3">{error}</h2>
                    <button onClick={fetchCart} className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#385040] transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const cartItems = cart?.items || [];
    const totalPrice = cart?.totalPrice || 0;
    // Delivery charge depends on the destination pincode — calculated on the Checkout page, not here.
    const total = totalPrice;

    // ── Sugar offer: 1 kg free sugar per full 1 kg of tea, repeating ──
    const { totalWeightGrams, sugarKg, remainingG, progressPct } = getSugarOffer(cartItems);
    const qualifiesForSugar = sugarKg > 0;

    // Empty cart
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center font-serif">
                <div className="text-center max-w-md mx-auto px-6 bg-white p-12 rounded-xl shadow-sm border border-gray-100">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6 opacity-30">
                        <ShoppingBag className="w-12 h-12 mx-auto text-[#1A1A1A]" />
                    </motion.div>
                    <h2 className="font-display text-2xl text-[#1A1A1A] mb-3">Your Cart is Empty</h2>
                    <p className="text-gray-400 mb-8 font-sans text-sm">Explore our estate selection of premium teas.</p>
                    <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#385040] transition-colors">
                        Start Shopping <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F9F9] pt-24 pb-32 lg:pb-20 font-sans text-[#1A1A1A]">
            <SEOHelmet
                title="Your Cart | Chai Adda"
                description="Review items in your Chai Adda shopping cart."
                url="https://www.chaiadda.co.in/cart"
                noindex={true}
            />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8 mt-12 flex items-baseline justify-between">
                    <h1 className="font-display text-3xl font-bold mt-5">Shopping Cart</h1>
                    <span className="text-sm text-gray-500 font-medium">{cartItems.length} Items</span>
                </div>

                <div className="lg:grid lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT: Cart Items List */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Column Headers (Desktop) */}
                            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                <div className="col-span-6">Product</div>
                                <div className="col-span-3 text-center">Quantity</div>
                                <div className="col-span-3 text-right">Total</div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                <AnimatePresence>
                                    {cartItems.map((item) => {
                                        const productId = item.product?._id || item.product;
                                        const itemKey = `${productId}-${item.variantSize}`;
                                        const isUpdating = updatingItems.has(itemKey);

                                        return (
                                            <motion.div
                                                key={itemKey}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`p-4 sm:p-6 ${isUpdating ? 'opacity-60 pointer-events-none' : ''}`}
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">

                                                    {/* Product Info */}
                                                    <div className="sm:col-span-6 flex gap-4">
                                                        <Link to={`/product/${productId}`} className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-[#F5F5F0] rounded-lg overflow-hidden border border-gray-100">
                                                            <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform duration-500" />
                                                        </Link>
                                                        <div className="flex flex-col justify-center">
                                                            <Link to={`/product/${productId}`} className="font-display text-lg font-bold text-[#1A1A1A] hover:text-[#385040] transition-colors mb-1 line-clamp-1">
                                                                {item.product?.name}
                                                            </Link>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.variantSize}</span>
                                                            <span className="text-xs text-gray-500 mb-2">₹{item.price} each</span>
                                                            <button
                                                                onClick={() => removeItem(productId, item.variantSize)}
                                                                disabled={isUpdating}
                                                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors w-fit"
                                                            >
                                                                <Trash2 className="w-3 h-3" /> Remove
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div className="sm:col-span-3 flex justify-start sm:justify-center">
                                                        <div className="flex items-center border border-gray-200 rounded-lg h-9">
                                                            <button
                                                                onClick={() => updateQuantity(productId, item.variantSize, item.quantity - 1)}
                                                                disabled={isUpdating || item.quantity <= 1}
                                                                className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50 rounded-l-lg transition-colors disabled:opacity-30"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-bold text-[#1A1A1A]">
                                                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(productId, item.variantSize, item.quantity + 1)}
                                                                disabled={isUpdating}
                                                                className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50 rounded-r-lg transition-colors disabled:opacity-30"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="sm:col-span-3 flex justify-between sm:justify-end items-center sm:block">
                                                        <span className="text-sm font-bold text-gray-500 sm:hidden">Total:</span>
                                                        <span className="block font-sans text-lg font-bold text-[#1A1A1A] text-right">₹{item.itemTotal?.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Sugar offer — unlocked tier(s) plus progress to the next */}
                            <AnimatePresence>
                                {qualifiesForSugar && (
                                    <motion.div
                                        key="sugar-unlocked"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="p-4 sm:p-6 bg-green-50/60 border-t border-green-100"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                                            <div className="sm:col-span-6 flex gap-4 items-center">
                                                <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-lg flex items-center justify-center border border-green-200">
                                                    <Gift className="w-8 h-8 text-green-600" />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <span className="font-display text-lg font-bold text-[#1A1A1A] mb-1">Sugar ({sugarKg} Kg Packet{sugarKg > 1 ? 's' : ''})</span>
                                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Complimentary — Unlocked 🎉</span>
                                                    <span className="text-xs text-green-600 font-semibold">Free with your order</span>
                                                </div>
                                            </div>
                                            <div className="sm:col-span-3 flex justify-start sm:justify-center">
                                                <span className="text-sm font-bold text-gray-500">Qty: {sugarKg}</span>
                                            </div>
                                            <div className="sm:col-span-3 flex justify-between sm:justify-end items-center sm:block">
                                                <span className="text-sm font-bold text-gray-500 sm:hidden">Total:</span>
                                                <div className="text-right">
                                                    <span className="block font-sans text-lg font-bold text-green-600">₹0.00</span>
                                                    <span className="text-[10px] font-bold text-green-500 uppercase">Free Offer</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <motion.div
                                    key="sugar-progress"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="p-4 sm:p-6 border-t border-amber-100 bg-amber-50/50"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <Gift className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-[#1A1A1A]">
                                                Add <span className="text-amber-600">{remainingG >= 1000 ? `${(remainingG / 1000).toFixed(2)} kg` : `${remainingG} g`}</span> more tea to unlock <span className="text-green-600">FREE {sugarKg + 1} Kg Sugar!</span>
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                {sugarKg > 0 ? 'Every extra 1 KG of tea unlocks another 1 KG of free sugar' : 'Offer applies when cart reaches 1 KG (e.g. 4 × 250 g packets)'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                            className="h-2 rounded-full bg-amber-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPct}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-amber-600 font-semibold mt-1 text-right">{totalWeightGrams} g / {(sugarKg + 1) * 1000} g</p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <Link to="/shop" className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-gray-500 hover:text-[#385040] transition-colors uppercase tracking-wide">
                            <ArrowLeft className="w-4 h-4" /> Continue Shopping
                        </Link>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 sticky top-32">
                            <h2 className="font-display text-xl font-bold text-[#1A1A1A] mb-6 border-b border-gray-100 pb-4">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-[#1A1A1A]">₹{totalPrice.toFixed(2)}</span>
                                </div>
                                {qualifiesForSugar && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Sugar × {sugarKg} Kg (Free)</span>
                                        <span className="font-bold">₹0.00</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 mb-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-base font-bold text-[#1A1A1A]">Total</span>
                                    <span className="font-display text-3xl font-bold text-[#1A1A1A]">₹{total.toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 text-right mt-1">+ delivery, calculated at checkout</p>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="hidden lg:flex w-full py-4 bg-[#1A1A1A] text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#385040] transition-all shadow-md hover:shadow-lg items-center justify-center gap-2 active:scale-95"
                            >
                                Proceed to Checkout <ArrowRight className="w-4 h-4" />
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Secure</span>
                                <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" /> Estate Direct</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Fixed Checkout (Hidden on Desktop) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between max-w-6xl mx-auto gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total <span className="normal-case font-medium">(+ delivery)</span></span>
                        <span className="font-display text-xl font-bold text-[#1A1A1A]">₹{total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="flex-1 py-3 bg-[#1A1A1A] text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#385040] transition-colors flex items-center justify-center gap-2"
                    >
                        Checkout <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

        </div>
    );
}
