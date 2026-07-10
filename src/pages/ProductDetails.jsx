import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, ArrowLeft, Minus, Plus, ChevronDown, ChevronUp, Leaf, Check, X, Clock, Thermometer, Loader2 } from 'lucide-react';
import { productAPI } from '@/services/productAPI';
import { cartAPI } from '@/services/cartAPI';
import { guestCartService } from '@/services/guestCartService';
import { offerAPI } from '@/services/offerAPI';
import { ScrollReveal } from '@/components/ScrollAnimations';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getOptimizedCloudinaryUrl } from '@/lib/utils';
import brand from '@/assets/brand.webp';
import brandwo from '@/assets/brandwo.webp';
import SEOHelmet from '@/components/SEOHelmet';
import OfferBadge from '@/components/OfferBadge';

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [offers, setOffers] = useState([]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const { data } = await productAPI.getById(id);
                // Map backend data to UI structure
                const mapped = {
                    ...data,
                    id: data._id,
                    price: data.variants?.[0]?.price || 0,
                    category: data.category?.name || 'Collection',
                    rating: 4.8,
                    reviews: 128,
                    bgGradient: 'from-amber-50 to-orange-50',
                    badge: data.variants?.[0]?.stock < 5 ? 'Low Stock' : null,
                    brewTime: '3-5 mins',
                    brewTemp: '85-90°C',
                    origin: 'Assam, India'
                };
                setProduct(mapped);
                if (data.variants?.length > 0) {
                    setSelectedVariant(data.variants[0]);
                }
                setCurrentIndex(0);
                window.scrollTo(0, 0);

                // Fetch offers using the resolved MongoDB ObjectId, NOT the URL slug
                try {
                    const res = await offerAPI.getOffersByProduct(data._id);
                    if (res.success && Array.isArray(res.data) && res.data.length > 0) setOffers(res.data);
                } catch { /* silent */ }

            } catch (error) {
                console.error("Failed to fetch product details", error);
                navigate('/shop'); // Redirect to shop on error
            }
        };

        if (id) {
            fetchProductDetails();
        }
    }, [id, navigate]);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#385040] opacity-20" />
                    <p className="text-sm font-medium text-[#385040] animate-pulse uppercase tracking-[0.2em]">Brewing your tea...</p>
                </div>
            </div>
        );
    }

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            toast.error('Please select a size');
            return;
        }
        setAdding(true);
        console.log('[DEBUG] Starting handleAddToCart. Authenticated:', isAuthenticated);
        try {
            if (isAuthenticated) {
                await cartAPI.addToCart(product.id, selectedVariant.size, quantity);
            } else {
                guestCartService.addToCart(product, selectedVariant.size, quantity);
            }
            window.dispatchEvent(new Event('cartUpdated'));
            toast.success('Added to cart!');
            navigate('/cart');
        } catch (error) {
            console.error('Add to cart failed', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to add to cart');
        } finally {
            setAdding(false);
        }
    };

    const displayImage = product.images?.[currentIndex]?.url
        ? getOptimizedCloudinaryUrl(product.images[currentIndex].url, 600)
        : product.image;

    const handleExpressBuy = () => {
        if (!selectedVariant) {
            toast.error('Please select a size');
            return;
        }

        // Navigate directly to checkout, passing this single item via state
        // bypassing the actual cart database specifically for this purchase flow
        navigate('/checkout', {
            state: {
                expressItems: [{
                    product: {
                        _id: product.id,
                        name: product.name,
                        image: displayImage,
                        price: selectedVariant.price || product.price
                    },
                    size: selectedVariant.size,
                    quantity: quantity,
                    price: selectedVariant.price || product.price
                }]
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] pb-32 font-sans selection:bg-[#D4F57B] selection:text-[#385040]">
            <SEOHelmet
                title={`${product.name} | Buy Online India | Chai Adda`}
                description={`Buy premium ${product.name} online. 100% organic tea delivered pan-India. Experience authentic Indian chai crafted from the finest ingredients.`}
                url={`https://www.chaiadda.co.in/product/${product.id}`}
                image={displayImage}
                breadcrumbs={[
                    { name: "Home", url: "https://www.chaiadda.co.in/" },
                    { name: "Shop", url: "https://www.chaiadda.co.in/shop" },
                    { name: product.name, url: `https://www.chaiadda.co.in/product/${product.id}` }
                ]}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": product.name,
                    "image": displayImage,
                    "description": product.description || `Premium ${product.name} delivering authentic taste across India.`,
                    "sku": product.id,
                    "brand": { "@type": "Brand", "name": "Chai Adda" },
                    "offers": {
                        "@type": "Offer",
                        "url": `https://www.chaiadda.co.in/product/${product.id}`,
                        "priceCurrency": "INR",
                        "price": selectedVariant ? selectedVariant.price : product.price,
                        "availability": (selectedVariant?.stock > 0 || product.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                    },
                    
                }}
            />

            {/* --- HERO SECTION --- */}
            <div className="relative pt-32 lg:pt-48 pb-12 overflow-hidden bg-white rounded-b-[3rem] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 mb-6">
                        <Link to="/shop" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#385040] hover:border-[#385040] transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">/ {product.category}</span>                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Image - Floating Style + Thumbnails */}
                        <div className="flex flex-col gap-4 w-full md:max-w-lg lg:max-w-2xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="relative aspect-[4/5] lg:aspect-square w-full rounded-[2rem] overflow-hidden flex items-center justify-center group"
                            >
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.img
                                        key={currentIndex}
                                        src={displayImage}
                                        alt={product.name}
                                        className="w-full h-auto object-contain z-10 shadow-sm"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </AnimatePresence>


                                {/* Image Navigation Arrows */}
                                {product.images?.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => {
                                                const prevIndex = currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;
                                                setCurrentIndex(prevIndex);
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-full text-[#385040] transition-all shadow-md"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                        </button>
                                        <button
                                            onClick={() => {
                                                const nextIndex = currentIndex === product.images.length - 1 ? 0 : currentIndex + 1;
                                                setCurrentIndex(nextIndex);
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-full text-[#385040] transition-all shadow-md"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                        </button>
                                    </>
                                )}
                            </motion.div>

                            {/* Secondary Thumbnails Gallery */}
                            {product.images?.length > 1 && (
                                <div className="flex gap-3 justify-center overflow-x-auto pb-2 scrollbar-none">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={img.publicId || idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${currentIndex === idx ? 'border-[#385040] shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                                                } bg-white`}
                                        >
                                            <img src={img.url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details - Clean & Sharp */}
                        <div className="flex flex-col">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                

                                <h1 className="font-display text-4xl lg:text-6xl font-black text-[#1A1A1A] leading-tight mb-4">
                                    {product.name}
                                </h1>

                                {/* --- REDESIGNED PRICING BLOCK --- */}
                                {offers.length > 0 ? (
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                                            <span className="text-4xl font-bold text-[#385040]">
                                                ₹{(selectedVariant?.price || product.price).toFixed(2)}
                                            </span>
                                            <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded ml-2">
                                                {product.stock > 0 || (selectedVariant && selectedVariant.stock > 0) ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                        <div className="text-gray-500 text-sm mb-3">
                                            MRP (incl. of all taxes)
                                        </div>

                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-3 mb-6">
                                        <span className="text-4xl font-bold text-[#385040]">₹{(selectedVariant?.price || product.price).toFixed(2)}</span>

                                        <div className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded inline-block">
                                            {product.stock > 0 || (selectedVariant && selectedVariant.stock > 0) ? 'In Stock' : 'Out of Stock'}
                                        </div>
                                    </div>
                                )}

                                {/* Product Description moved here */}
                                <div className="prose prose-sm text-gray-600 font-serif leading-relaxed mb-8">
                                    <p>{product.description}</p>
                                </div>

                                {/* Variant Size Selector */}
                                {product.variants && product.variants.length > 0 && (
                                    <div className="mb-8">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">Select Size</label>
                                        <div className="flex flex-wrap gap-2">
                                            {product.variants.map((variant) => (
                                                <button
                                                    key={variant.size}
                                                    onClick={() => setSelectedVariant(variant)}
                                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${selectedVariant?.size === variant.size
                                                        ? 'bg-[#385040] text-white border-[#385040] shadow-lg shadow-[#385040]/20'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#385040] hover:text-[#385040]'
                                                        } ${variant.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    disabled={variant.stock === 0}
                                                >
                                                    {variant.size}
                                                    {variant.stock === 0 && <span className="ml-1 text-[10px]">(Out)</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* "Add to Cart" block instead of metadata pills */}
                                <div className="mb-8">
                                    <div className="flex gap-4 items-stretch mb-4">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50">
                                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100/50 rounded-l-xl transition-colors">
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-bold text-[#1A1A1A]">{quantity}</span>
                                            <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100/50 rounded-r-xl transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={adding || (selectedVariant && selectedVariant.stock === 0)}
                                            className="flex-1 bg-[#4CAF50] hover:bg-[#43a047] text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-sm shadow-green-500/20 active:scale-[0.98] flex items-center justify-center disabled:opacity-70"
                                        >
                                            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add to Cart'}
                                        </button>
                                    </div>

                                    {/* Express Buy Button */}
                                    <button
                                        onClick={handleExpressBuy}
                                        disabled={selectedVariant && selectedVariant.stock === 0}
                                        className="w-full bg-[#1A1A1A] hover:bg-black text-white rounded-xl font-bold uppercase tracking-widest text-sm py-4 transition-all shadow-xl shadow-black/10 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 mb-3"
                                    >
                                        Express Buy
                                        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md ml-2">
                                            {/* Dummy Payment Icons placeholder inline to match screenshot */}
                                            <span className="text-[10px] text-blue-600 font-bold uppercase leading-none tracking-tighter">Pay<span className="text-cyan-500">tm</span></span>
                                            <span className="w-3 h-3 bg-[#5e35b1] rounded-full text-[8px] flex items-center justify-center font-bold text-white uppercase italic leading-none">पे</span>
                                            <span className="text-[11px] font-bold text-black border-l pl-1 border-gray-200">G</span>
                                        </div>
                                    </button>

                                    {/* Subtitle text */}
                                    <p className="text-center text-sm font-medium text-gray-800">Order <span className="text-green-600 font-bold">now</span> & Get Fast <span className="font-bold">Shipping</span></p>
                                </div>

                                {/* Removed lower description block */}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- VISUAL SECTIONS --- */}

            {/* Taste the Difference - Full Width Card */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <ScrollReveal>
                    <div className="rounded-[2.5rem] overflow-hidden bg-[#385040] text-white relative shadow-2xl">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                        <div className="grid lg:grid-cols-2">
                            <div className="p-10 lg:p-16 flex flex-col justify-center relative z-10">
                              

                                <h2 className="font-display text-3xl lg:text-5xl font-bold mb-6">
                                    Taste the <span className="text-[#D4F57B]">Legacy</span>
                                </h2>
                                <p className="text-white/80 font-serif text-lg leading-relaxed mb-8">
                                    Sourced directly from our 23 heritage estates. No middlemen, just pure, unadulterated tea craftsmanship preserved for over a century.
                                </p>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-3xl font-bold text-[#D4F57B]">23</div>
                                        <div className="text-xs uppercase tracking-widest opacity-60">Estates</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-[#D4F57B]">50k+</div>
                                        <div className="text-xs uppercase tracking-widest opacity-60">Acres</div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative min-h-[200px] lg:min-h-[300px]">
                                <img src={brandwo} alt="Estate" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#385040]/80 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            {/* Why Choose Us - Visual Comparison */}
            <div className="bg-[#F3F4F1] py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-center font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-12 tracking-wide uppercase">Why Choose Us ?</h2>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-0 relative">
                        {/* Vertical Divider for Desktop */}
                        <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-gray-300 -ml-px"></div>

                        {/* Left Side: Brand Match */}
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-48 h-48 md:w-64 md:h-64 mb-6 rounded-full overflow-hidden bg-white/50 p-2">
                                <img
                                    src={brand}
                                    alt="Premium Whole Leaf Tea"
                                    className="w-full h-full object-cover rounded-full hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <h3 className="font-serif text-xl tracking-widest text-[#1A1A1A] uppercase mb-6">Chai Adda Estates</h3>
                            <ul className="space-y-4 text-left inline-block">
                                {[
                                    'Whole leaf ingredients',
                                    'Hand-blended with care',
                                    'Multiple quality checks',
                                    'Fresh, vibrant, and true to nature'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-gray-700 font-sans text-sm md:text-base">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                                        </div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Side: Other Brands */}
                        <div className="flex flex-col items-center text-center p-4 opacity-80">
                            <div className="w-48 h-48 md:w-64 md:h-64 mb-6 rounded-full overflow-hidden bg-white/50 p-2 grayscale-[50%]">
                                <img
                                    src="https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&q=80&w=500"
                                    alt="Dust Tea Comparison"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                            <h3 className="font-serif text-xl tracking-widest text-[#1A1A1A] uppercase mb-6">Other Brands</h3>
                            <ul className="space-y-4 text-left inline-block">
                                {[
                                    'Dust and fannings',
                                    'Mechanically mixed',
                                    'Dull and often artificial',
                                    'Minimal or no quality checks'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-gray-500 font-sans text-sm md:text-base">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
                                            <X className="w-3 h-3 text-red-500" strokeWidth={3} />
                                        </div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Decorative Lines Bottom */}
                    <div className="mt-16 border-t border-gray-300 w-full mb-1"></div>
                    <div className="border-t border-gray-300 w-full mb-1 opacity-70"></div>
                    <div className="border-t border-gray-300 w-full opacity-40"></div>
                </div>
            </div>

        </div>
    );
}
