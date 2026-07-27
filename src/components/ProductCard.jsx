import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Loader2 } from 'lucide-react';
import { cartAPI } from '@/services/cartAPI';
import { guestCartService } from '@/services/guestCartService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';
import confetti from 'canvas-confetti';
import { getOptimizedCloudinaryUrl } from '@/lib/utils';
import OfferBadge from '@/components/OfferBadge';

export default function ProductCard({ product, index, variant = 'default' }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [adding, setAdding] = useState(false);

    // Handle both backend data and potential legacy/dummy structure
    const id = product._id || product.id;
    const name = product.name;
    const category = product.category?.name || product.category || 'Collection';
    const price = product.variants?.[0]?.price || product.price || 0;
    const imageBase = product.images?.[0]?.url || product.image || '/fallback-image.jpg';

    // Optimize Cloudinary URL if present
    const image = getOptimizedCloudinaryUrl(imageBase, 327);

    const defaultVariantSize = product.variants?.[0]?.size;

    // Defaults for fields not in backend yet
    const rating = product.rating || 4.8;
    const originalPrice = product.originalPrice || null;
    const badge = product.badge || (product.variants?.[0]?.stock < 5 ? 'Low Stock' : null);
    const bgGradient = product.bgGradient || 'from-white to-[#f0fff4]';
    const categoryColor = product.categoryColor || 'text-tea-primary';
    const isHorizontal = variant === 'horizontal';
    const cardLayoutClass = isHorizontal
        ? 'flex lg:flex-row lg:items-stretch'
        : 'flex flex-col';
    const imageWrapperClass = isHorizontal
        ? `relative w-full h-[240px] lg:w-[42%] lg:min-h-[240px] lg:h-full bg-gradient-to-br ${bgGradient} dark:from-white/5 dark:from-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 rounded-t-2xl sm:rounded-t-3xl lg:rounded-l-2xl lg:rounded-tr-none lg:rounded-br-none`
        : `relative aspect-[4/5] w-full bg-gradient-to-br ${bgGradient} dark:from-white/5 dark:from-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 rounded-t-2xl sm:rounded-t-3xl`;
    const contentWrapperClass = isHorizontal
        ? 'px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 flex flex-col flex-grow bg-[#F4FFF8] dark:bg-[#1A1A1A] rounded-b-2xl sm:rounded-b-3xl lg:rounded-l-none lg:rounded-r-2xl lg:rounded-br-3xl lg:rounded-bl-3xl lg:min-h-[240px]'
        : 'px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 flex flex-col flex-grow bg-[#F4FFF8] dark:bg-[#1A1A1A] rounded-b-2xl sm:rounded-b-3xl';
    const actionsClass = isHorizontal
        ? 'mt-auto flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4'
        : 'mt-auto flex flex-col gap-3';
    const actionButtonsClass = isHorizontal
        ? 'grid grid-cols-2 gap-2 lg:grid-cols-1 lg:w-1/2'
        : 'grid grid-cols-2 gap-2';
    const addLabel = isHorizontal ? 'Buy' : 'Add';

    const triggerCartConfetti = (e) => {
        const origin = e?.currentTarget
            ? (() => {
                const rect = e.currentTarget.getBoundingClientRect();
                return {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight,
                };
            })()
            : { x: 0.5, y: 0.6 };

        confetti({ particleCount: 60, spread: 80, origin, colors: ['#385040', '#4CAF50', '#D4F57B', '#C8A96E', '#fff'], scalar: 1.1, gravity: 1.2, ticks: 180 });
    };

    const handleAddToCart = async (e) => {
        if (e) e.stopPropagation();
        if (!defaultVariantSize) {
            toast.error('No variant available for this product');
            return;
        }
        setAdding(true);
        try {
            if (isAuthenticated) {
                await cartAPI.addToCart(id, defaultVariantSize, 1);
            } else {
                guestCartService.addToCart(product, defaultVariantSize, 1);
            }
            triggerCartConfetti(e);
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

    return (
        <motion.div
            onClick={() => navigate(`/product/${id}`)}
            className={`group relative bg-gradient-to-br from-white to-[#f0fff4] dark:from-[#1A1A1A] dark:to-[#1F3324] rounded-2xl sm:rounded-3xl shadow-sm transition-all duration-500 cursor-pointer border border-transparent overflow-hidden h-full ${cardLayoutClass}`}
        >
            {/* Image Container */}
            <div className={imageWrapperClass}>
                {/* Badge */}
                {badge && (
                    <div className="absolute top-4 left-4 z-20">
                        <span className="px-3 py-1 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                            {badge}
                        </span>
                    </div>
                )}



                {/* Product Image */}
                <div className="block w-full h-full relative z-10">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover object-center"
                    />
                </div>
            </div>

            {/* Content */}
            <div className={contentWrapperClass}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-grow">
                        <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 ${categoryColor} min-h-[1.25rem]`}>
                            {category}
                        </p>
                    <h3 className="font-display font-bold text-base sm:text-xl text-foreground transition-colors leading-tight line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem] mt-1 sm:mt-2">
                            {name}
                        </h3>
                    </div>

                </div>

                {/* Offer Badge Integration */}
                <div className="mb-2 min-h-[1.25rem]">
                    <OfferBadge productId={id} />
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-6 h-8 sm:h-10 hidden sm:block">
                    {product.description}
                </p>

                <div className={actionsClass}>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-foreground">₹{Number(price).toFixed(2)}</span>

                    </div>

                    <div className={actionButtonsClass}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/product/${id}`);
                            }}
                            className="px-3 py-2.5 rounded-xl text-xs font-bold border border-gray-200 bg-white transition-colors text-center w-full"
                        >
                            View Details
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(e);
                            }}
                            disabled={adding}
                            className="bg-[#1A1A1A] text-white px-3 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 w-full disabled:opacity-70"
                        >
                            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                                <><span>{addLabel}</span> <ShoppingBag className="w-3.5 h-3.5" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
