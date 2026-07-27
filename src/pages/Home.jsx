import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ScrollReveal } from '@/components/ScrollAnimations';
import TeaCarousel from '@/components/TeaCarousel';
import HomeChoose from '@/components/HomeChoose';
import ProductCard from '@/components/ProductCard';
import Hero from '@/components/Hero';
import PackSection from '@/components/PackSection';
import IngredientsSection from '@/components/IngredientsSection';
import SEOHelmet from '@/components/SEOHelmet';
import { productAPI } from '@/services/productAPI';
import OfferBanner from '@/components/OfferBanner';
import OfferPopup from '@/components/OfferPopup';
import videoStory from '@/assets/video-story.mp4';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getAll();
        const data = response?.data || response;
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch products for home", error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const containerRef = useRef(null);
  const collectionsRef = useRef(null);

  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"]
  });

  const featuredTeas = products.slice(0, 4);

  // Bounded parallax for Featured Collections
  const { scrollYProgress: collectionsScroll } = useScroll({
    target: collectionsRef,
    offset: ["start end", "end start"]
  });

  return (
    <div ref={containerRef} className="relative bg-[#385040] overflow-x-clip">
      <SEOHelmet
        title="Chai Adda | Premium Organic Tea & Chai Online in India"
        description="Chai Adda brings authentic masala chai, organic green tea and premium loose-leaf blends to your door, with pan-India delivery."
        url="https://www.chaiadda.co.in/"
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "Do you deliver chai to all states in India?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, we deliver pan-India to every state and city." } },
              { "@type": "Question", "name": "Is Chai Adda tea 100% certified organic?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, our teas are 100% organically grown without pesticides." } },
              { "@type": "Question", "name": "How long does delivery take to Delhi, Mumbai, Bengaluru?", "acceptedAnswer": { "@type": "Answer", "text": "Delivery takes 2-4 days depending on the city." } },
              { "@type": "Question", "name": "Can I order Chai Adda tea in bulk or wholesale across India?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, we offer bulk and wholesale ordering pan-India." } },
              { "@type": "Question", "name": "What makes Chai Adda better than other tea brands in India?", "acceptedAnswer": { "@type": "Answer", "text": "Our commitment to 100% organic ingredients, authentic Indian recipes, and ethical sourcing." } }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "AggregateRating",
            "itemReviewed": { "@type": "Organization", "name": "Chai Adda" },
            "ratingValue": "4.8",
            "reviewCount": "128"
          }
        ]}
        breadcrumbs={[{ name: "Home", url: "https://www.chaiadda.co.in/" }]}
      />

      {/* Offer Banner — additive */}
      <div className="relative z-10">
        <OfferBanner />
      </div>

      {/* Hero Section — now isolated for performance */}
      <Hero />


      {/* PRODUCTS SECTION */}
      <section ref={collectionsRef} className="py-12 mt-0 md:mt-10 sm:py-32 bg-white md:rounded-t-[2rem] sm:rounded-t-[4rem] -mt-10 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-20 gap-4 sm:gap-8">
            <div className="max-w-6xl text-left">
              <ScrollReveal once={false}>
                <h2 className="font-sans font-black text-3xl sm:text-5xl lg:text-7xl text-black uppercase leading-tight mb-4 sm:mb-6 lg:whitespace-nowrap">
                  Featured Collections
                </h2>
                <p className="text-gray-500 text-sm sm:text-lg font-medium max-w-xl">
                  Discover our most prestigious blends, hand-picked for their exceptional flavor profiles and curative properties.
                </p>
              </ScrollReveal>
            </div>
            <Link to="/shop" className="px-5 sm:px-10 py-2.5 sm:py-5 bg-black text-white rounded-full font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors text-xs sm:text-base whitespace-nowrap">
              Explore All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {featuredTeas.map((product, i) => (
              <ScrollReveal
                key={product._id || product.id || i}
                delay={i * 0.1}
                className="h-full"
              >
                <ProductCard product={product} variant="horizontal" />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STORY SECTION */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-16 lg:gap-24">
            
            {/* Left Image Placeholder */}
            <ScrollReveal className="w-full md:w-5/12 flex flex-col items-center">
              <div className="bg-[#EAE1D6] w-full max-w-[320px] lg:max-w-[360px] aspect-[4/5] rounded-3xl flex flex-col relative overflow-hidden shadow-sm">
                <video 
                  src={videoStory} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
              <div className="bg-[#2C4A3B] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base -mt-5 sm:-mt-6 z-20 shadow-lg">
                50+ years of trust
              </div>
            </ScrollReveal>

            {/* Right Content */}
            <ScrollReveal delay={0.2} className="w-full md:w-7/12 flex flex-col items-start xl:pl-4">
              <div className="bg-[#EFE3D5] text-[#91765A] px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-6 sm:mb-8">
                Our Story
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#222] mb-6 sm:mb-8">
                50 Years of <span className="text-[#155A44] italic">Tea Legacy</span>
              </h2>

              <ul className="flex flex-col gap-3 mb-8 text-[#155A44] font-bold text-sm sm:text-[15px]">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#155A44]"></div>
                  Sourced with experience
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#155A44]"></div>
                  Trusted by generations
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#155A44]"></div>
                  Delivered to your doorstep
                </li>
              </ul>

              <div className="space-y-6 text-gray-800 text-[15px] sm:text-base leading-relaxed">
                <p>
                  A man left his village with nothing but a belief &mdash; that a truly great cup of tea has the power to <strong className="font-bold text-black">bring people together.</strong>
                </p>
                <p>
                  For over 50 years, he devoted his life to one simple promise <strong className="font-bold text-black">&mdash; great tea should never be compromised.</strong> Over the decades, he built relationships with tea growers, carefully selecting teas that met his one simple standard <strong className="font-bold text-black">&mdash; if it wasn't good enough for his own cup, it wasn't good enough for anyone else's.</strong>
                </p>
                <p>
                  Shopkeepers trusted him. Families trusted him.
                </p>
                <p>
                  As the next generation of this legacy, we carry that same passion beyond markets and into homes across the country. Because <strong className="font-bold text-black">some traditions are too good to stay local.</strong>
                </p>
              </div>

              <div className="mt-8 border-l-2 border-[#155A44] pl-5 py-1">
                <p className="text-[#155A44] italic font-serif text-base sm:text-[17px] leading-relaxed">
                  "One sip is all it takes to understand why our tea has been trusted for generations."
                </p>
              </div>

              <div className="mt-10">
                <Link to="/about" className="inline-flex items-center gap-4 border border-gray-400 rounded-lg px-6 py-3 font-bold text-xs tracking-widest uppercase hover:bg-gray-100 transition-colors text-[#222]">
                  READ OUR FULL STORY <span className="w-6 h-[2px] bg-black block"></span>
                </Link>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* WHAT'S IN YOUR PACK SECTION — Refactored */}
      <PackSection />

      {/* BEST QUALITY INGREDIENTS SECTION — Refactored */}
      <IngredientsSection />


      {/* TEA CAROUSEL SECTION */}
      <section className="bg-white py-6 sm:py-20 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <TeaCarousel />

        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <HomeChoose />

      {/* Offer Popup — session-once modal */}
      <OfferPopup />
    </div>
  );
}
