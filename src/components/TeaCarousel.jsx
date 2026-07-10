import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import local assets
import video1 from '../assets/video1.mp4';
import video2 from '../assets/video2.mp4';

const teaImages = [
    {
        url: '/3rd.mp4', // served from public/
        title: "Crafted to Perfection",
        desc: "From leaf to cup — witness the artistry behind every Borsillah blend."
    },
    {
        url: video2,
        title: "Modern Brewing",
        desc: "Blending traditional techniques with modern perfection for the ultimate tea experience."
    },
    {
        url: video1,
        title: "Tea Traditions",
        desc: "Discover the rich history and culture behind every cup of our artisanal blends."
    }
];

export default function TeaCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9
        })
    };

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % teaImages.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + teaImages.length) % teaImages.length);
    };

    // Auto-slide
    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[650px] overflow-hidden bg-tea-dark rounded-[1.5rem] sm:rounded-[3rem] my-4 sm:my-12">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.4 },
                        scale: { duration: 0.4 }
                    }}
                    className="absolute inset-0 will-change-transform"
                >
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 bg-tea-dark/20 backdrop-blur-xl">
                        {/* Main Product Video */}
                        <video
                            src={teaImages[currentIndex].url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover lg:object-contain brightness-95 lg:brightness-100 transition-all duration-700"
                        />
                        {/* Vignette/Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute inset-x-0 bottom-6 sm:bottom-12 flex items-center justify-between px-4 sm:px-8 lg:px-20 z-10">
                <button
                    onClick={prevSlide}
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all group"
                >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Progress Dots */}
                <div className="flex gap-3">
                    {teaImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > currentIndex ? 1 : -1);
                                setCurrentIndex(index);
                            }}
                            className={`h-1.5 transition-all duration-500 rounded-full ${index === currentIndex ? 'w-12 bg-tea-primary' : 'w-2 bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all group"
                >
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
