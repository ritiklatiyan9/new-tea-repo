import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { StaggerContainer, StaggerItem } from '@/components/ScrollAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '@/services/productAPI';
import { categoryAPI } from '@/services/categoryAPI';
import SEOHelmet from '@/components/SEOHelmet';
import { Loader2 } from 'lucide-react';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    productAPI.getAll(),
                    categoryAPI.getAll()
                ]);
                const prodData = prodRes?.data || prodRes;
                const catData = catRes?.data || catRes;
                setProducts(Array.isArray(prodData) ? prodData : []);
                setCategories(Array.isArray(catData) ? catData : []);
            } catch (error) {
                console.error("Failed to fetch shop data", error);
                setProducts([]);
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter products based on active category
    const filteredProducts = activeCategory === "All"
        ? products
        : products.filter(p => p.category?._id === activeCategory || p.category?.name === activeCategory);

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <SEOHelmet
                title="Buy Organic Tea Online India | Best Chai Delivery Nationwide"
                description="Explore Chai Adda's premium organic tea collection. Buy masala chai, green tea, and herbal blends online with fast nationwide shipping across India."
                url="https://www.chaiadda.co.in/shop"
                breadcrumbs={[
                    { name: "Home", url: "https://www.chaiadda.co.in/" },
                    { name: "Shop", url: "https://www.chaiadda.co.in/shop" }
                ]}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": "Chai Adda Shop",
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.9",
                        "reviewCount": "89"
                    }
                }}
            />
            {/* Header Section */}
            <div className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 bg-[#385040] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D4F57B]/10 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-[#D4F57B] font-bold tracking-[0.2em] uppercase text-sm mb-4 block"
                    >
                        Our Collection
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-display text-5xl sm:text-7xl font-bold mb-6"
                    >
                        Curated for the <span className="italic font-serif text-[#D4F57B]">Connoisseur</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-white/80 text-lg max-w-2xl mx-auto font-serif leading-relaxed"
                    >
                        From the misty hills of Darjeeling to the sun-kissed estates of Assam, explore our hand-picked selection of the world's finest teas.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    <motion.button
                        key="All"
                        onClick={() => setActiveCategory("All")}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 border ${activeCategory === "All"
                            ? "bg-[#385040] text-white border-[#385040] shadow-md transform scale-105"
                            : "bg-transparent text-gray-500 border-gray-200 hover:border-[#385040] hover:text-[#385040]"
                            }`}
                    >
                        All
                    </motion.button>
                    {categories.map((category, index) => (
                        <motion.button
                            key={category._id}
                            onClick={() => setActiveCategory(category._id)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className={`px-6 py-2 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 border ${activeCategory === category._id
                                ? "bg-[#385040] text-white border-[#385040] shadow-md transform scale-105"
                                : "bg-transparent text-gray-500 border-gray-200 hover:border-[#385040] hover:text-[#385040]"
                                }`}
                        >
                            {category.name}
                        </motion.button>
                    ))}
                </div>

                {/* Product Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-[#385040] animate-spin" />
                    </div>
                ) : (
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {filteredProducts.length > 0 ? (
                                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                    {filteredProducts.map((product, index) => (
                                        <StaggerItem key={product._id} className="h-full w-full">
                                            <ProductCard product={product} index={index} variant="horizontal" />
                                        </StaggerItem>
                                    ))}
                                </StaggerContainer>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-xl text-gray-400 font-serif italic">No products found in this category.</p>
                                    <button
                                        onClick={() => setActiveCategory("All")}
                                        className="mt-4 text-[#385040] font-bold hover:underline"
                                    >
                                        View all products
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}


            </div>
        </div>
    );
}
