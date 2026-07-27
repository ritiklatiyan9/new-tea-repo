import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Sparkles, Flower2, Mountain, Trees, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ScrollAnimations';

export default function PackSection() {
  const packSectionRef = useRef(null);

  const { scrollYProgress: packScroll } = useScroll({
    target: packSectionRef,
    offset: ["start end", "end start"]
  });

  // Pack Section Parallax
  const packImageY = useTransform(packScroll, [0, 1], [0, -100]);
  const packImageRotate = useTransform(packScroll, [0, 1], [0, 10]);

  return (
    <section ref={packSectionRef} className="relative py-24 lg:py-32 overflow-hidden bg-[#FAF9F6]">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-[#385040]/5 -skew-x-12 transform origin-top-right z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4F57B]/10 rounded-full blur-3xl z-0" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left Column: Parallax Visuals */}
          <div className="relative perspective-1000 group">
            {/* Main Pack Image */}
            <motion.div
              style={{ y: packImageY, rotate: packImageRotate }}
              className="relative z-20 mx-auto w-64 sm:w-80 md:w-96"
            >
              <div className="absolute inset-0 bg-black/20 blur-xl rounded-full transform scale-90 translate-y-10" />
              <video
                src="/videos/assam-tea-garden.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Tea garden in Assam"
                className="w-full aspect-[3/2] object-cover rounded-2xl shadow-2xl relative z-10 transform transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>

            {/* Floating Elements (Optimized with simpler useTransform) */}
            <motion.div
              style={{ y: useTransform(packScroll, [0, 1], [0, -60]) }}
              className="absolute top-0 -left-2 sm:-left-6 z-30 bg-white/90 backdrop-blur-md p-2 sm:p-3 rounded-xl shadow-xl border border-black/5 flex items-center gap-2 sm:gap-3 w-36 sm:w-48"
            >
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#D4F57B] flex items-center justify-center text-[#385040] shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="font-bold text-[#385040] text-[9px] sm:text-xs leading-tight uppercase font-sans">No Preservatives</p>
                <p className="text-[7px] sm:text-[9px] text-gray-500 uppercase tracking-wider font-bold">SHELF-PURE & NATURAL</p>
              </div>
            </motion.div>

            <motion.div
              style={{ y: useTransform(packScroll, [0, 1], [0, 40]) }}
              className="absolute top-0 -right-2 sm:-right-4 z-30 bg-white/90 backdrop-blur-md p-2 sm:p-3 rounded-xl shadow-xl border border-black/5 flex items-center gap-2 sm:gap-3 w-40 sm:w-52"
            >
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#385040] flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="font-bold text-[#385040] text-[9px] sm:text-xs leading-tight uppercase font-sans">No Artificial Flavours</p>
                <p className="text-[7px] sm:text-[9px] text-gray-500 uppercase tracking-wider font-bold">REAL TEA, NOTHING ADDED</p>
              </div>
            </motion.div>

            <motion.div
              style={{ y: useTransform(packScroll, [0, 1], [0, -100]) }}
              className="absolute bottom-0 -left-4 sm:-left-10 z-30 bg-white/90 backdrop-blur-md p-2 sm:p-3 rounded-xl shadow-xl border border-black/5 flex items-center gap-2 sm:gap-3 w-36 sm:w-48"
            >
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#D4F57B] flex items-center justify-center text-[#385040] shrink-0">
                <Flower2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="font-bold text-[#385040] text-[9px] sm:text-xs leading-tight uppercase font-sans">No Added Colours</p>
                <p className="text-[7px] sm:text-[9px] text-gray-500 uppercase tracking-wider font-bold">PURE LEAF, PURE COLOUR</p>
              </div>
            </motion.div>

            <motion.div
              style={{ y: useTransform(packScroll, [0, 1], [0, 80]) }}
              className="absolute bottom-0 -right-2 sm:-right-4 z-30 bg-white/90 backdrop-blur-md p-2 sm:p-3 rounded-xl shadow-xl border border-black/5 flex items-center gap-2 sm:gap-3 w-36 sm:w-48"
            >
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#385040] flex items-center justify-center text-white shrink-0">
                <Mountain className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="font-bold text-[#385040] text-[9px] sm:text-xs leading-tight uppercase font-sans">Single Estate Sourced</p>
                <p className="text-[7px] sm:text-[9px] text-gray-500 uppercase tracking-wider font-bold">ASSAM VALLEY GROWN</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Content */}
          <div>
            <ScrollReveal>
              <span className="text-[#385040] font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Unveiling the Purity</span>
              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-[#385040] mb-8 leading-[0.9]">
                What's in Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4F57B] to-[#385040]">Daily Cup?</span>
              </h2>
            </ScrollReveal>

            <div className="space-y-8 mt-10">
              <ScrollReveal delay={0.1} className="flex group">
                <div className="mr-6 relative">
                  <div className="w-12 h-12 rounded-full border-2 border-[#385040]/10 flex items-center justify-center group-hover:bg-[#385040] group-hover:text-white transition-colors duration-300">
                    <Trees className="w-5 h-5" />
                  </div>
                  <div className="absolute top-12 left-1/2 w-px h-full bg-[#385040]/10 -translate-x-1/2" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#385040] mb-2">Garden-Fresh from Assam</h3>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Our teas are sourced directly from carefully tended Assam garden &ndash; &quot;Borsillah&quot;, where every plant is nurtured individually to draw out its purest, most aromatic character.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.15} className="flex group">
                <div className="mr-6 relative">
                  <div className="w-12 h-12 rounded-full border-2 border-[#385040]/10 flex items-center justify-center group-hover:bg-[#385040] group-hover:text-white transition-colors duration-300">
                    <Flower2 className="w-5 h-5" />
                  </div>
                  <div className="absolute top-12 left-1/2 w-px h-full bg-[#385040]/10 -translate-x-1/2" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#385040] mb-2">7-Day Pluck Cycle</h3>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Strict 7-day leaf plucking cycle being followed, ensuring only the softest, juiciest young leaves make it into your cup &mdash; nothing rushed, nothing wasted.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2} className="flex group">
                <div className="mr-6 relative">
                  <div className="w-12 h-12 rounded-full border-2 border-[#385040]/10 flex items-center justify-center group-hover:bg-[#385040] group-hover:text-white transition-colors duration-300">
                    <Star className="w-5 h-5" />
                  </div>
                  <div className="absolute top-12 left-1/2 w-px h-full bg-[#385040]/10 -translate-x-1/2" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#385040] mb-2">Whole Leaf Quality</h3>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    We use only the finest whole leaves, never dust or fannings. Experience the full spectrum of essential oils and antioxidants.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3} className="flex group">
                <div className="mr-6">
                  <div className="w-12 h-12 rounded-full border-2 border-[#385040]/10 flex items-center justify-center group-hover:bg-[#385040] group-hover:text-white transition-colors duration-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#385040] mb-2">Ethically Sourced</h3>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    From the vibrant valleys of Assam to your cup, we ensure fair wages and sustainable practices at every step.
                  </p>
                </div>
              </ScrollReveal>
            </div>


          </div>

        </div>
      </div>
    </section>
  );
}
