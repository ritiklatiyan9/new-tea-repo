import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Leaf } from 'lucide-react';

// public/ assets are served from the site root
const POUCH_LEFT = '/one.png';   // black — Kadak Chaska Chai
const POUCH_RIGHT = '/two.png';  // maroon — Mystique Assam Tea

// Per-word staggered reveal — each word slides up from its own mask
const RevealWords = ({ text, baseDelay = 0, step = 0.09 }) => (
  <>
    {text.split(' ').map((word, i) => (
      <span key={i} className="inline-block overflow-hidden align-bottom">
        <span
          className="inline-block opacity-0 hero-text-reveal [animation-fill-mode:forwards]"
          style={{ animationDelay: `${baseDelay + i * step}s` }}
        >
          {word}&nbsp;
        </span>
      </span>
    ))}
  </>
);

const Hero = memo(() => {
  // Mouse parallax — spring-smoothed, transform-only; the two pouches drift in
  // opposite directions for depth. Touch devices never fire mousemove, so mobile
  // is naturally unaffected.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 18 });
  const sy = useSpring(my, { stiffness: 45, damping: 18 });
  const leftX = useTransform(sx, [-0.5, 0.5], [-22, 10]);
  const leftY = useTransform(sy, [-0.5, 0.5], [-12, 12]);
  const rightX = useTransform(sx, [-0.5, 0.5], [-10, 22]);
  const rightY = useTransform(sy, [-0.5, 0.5], [12, -12]);

  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative w-full h-[100svh] min-h-[660px] overflow-hidden bg-[#F2EDE3] flex flex-col"
    >
      {/* Soft color blobs + film grain */}
      <div className="hero-blob hero-blob-1" aria-hidden="true" />
      <div className="hero-blob hero-blob-2" aria-hidden="true" />
      <div className="hero-grain absolute inset-0 pointer-events-none z-[1]" aria-hidden="true" />

      {/* ── LEFT pouch — rises from the bottom-left, tilts inward ── */}
      <motion.div
        style={{ x: leftX, y: leftY }}
        className="absolute bottom-0 left-0 z-[5] w-[54vw] sm:w-[44vw] lg:w-[38vw] max-w-[560px] opacity-0 hero-text-reveal [animation-delay:0.95s] [animation-fill-mode:forwards]"
        aria-hidden="true"
      >
        <div className="hero-card-float">
          <img src={POUCH_LEFT} alt="" loading="eager" fetchPriority="high"
            className="w-full h-auto object-contain origin-bottom rotate-[4deg] drop-shadow-[0_25px_45px_rgba(34,56,43,0.35)]" />
        </div>
      </motion.div>

      {/* ── RIGHT pouch — rises from the bottom-right, tilts inward ── */}
      <motion.div
        style={{ x: rightX, y: rightY }}
        className="absolute bottom-0 right-0 z-[5] w-[54vw] sm:w-[44vw] lg:w-[38vw] max-w-[560px] opacity-0 hero-text-reveal [animation-delay:1.1s] [animation-fill-mode:forwards]"
        aria-hidden="true"
      >
        <div className="hero-card-float-2">
          <img src={POUCH_RIGHT} alt="" loading="eager" fetchPriority="high"
            className="w-full h-auto object-contain origin-bottom -rotate-[4deg] drop-shadow-[0_25px_45px_rgba(34,56,43,0.35)]" />
        </div>
      </motion.div>

      {/* ── Center editorial column ── */}
      <div className="relative z-20 flex flex-col items-center text-center px-5 sm:px-8 pt-32 sm:pt-36 lg:pt-40 max-w-3xl mx-auto shrink-0 pointer-events-none">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#385040]/20 bg-white/50 backdrop-blur-sm opacity-0 hero-text-reveal [animation-delay:0.1s] [animation-fill-mode:forwards]">
          <Leaf size={11} className="text-[#385040]" />
          <span className="text-[#385040]/80 text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.3em]">Est. 1974 · Assam's Finest Gardens</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title mt-5 sm:mt-6 text-[#22382B] text-[3rem] sm:text-[4.2rem] lg:text-[5.5rem] xl:text-[6.25rem] leading-[0.95] drop-shadow-[0_2px_20px_rgba(242,237,227,0.9)]">
          <RevealWords text="Elevate Your" baseDelay={0.2} />
          <br />
          <RevealWords text="Everyday" baseDelay={0.45} />
          {/* mask (static) → reveal (opacity/slide) → shimmer (gradient) — separate elements so the animations don't override each other */}
          <span className="inline-block overflow-hidden align-bottom">
            <span className="relative inline-block opacity-0 hero-text-reveal [animation-delay:0.6s] [animation-fill-mode:forwards]">
              <span className="italic hero-shimmer-gold">Sip</span>
              <svg className="absolute -bottom-2 sm:-bottom-3 left-0 w-full" viewBox="0 0 120 14" fill="none" aria-hidden="true">
                <path d="M4 10 Q 60 -2 116 8" stroke="#B08848" strokeWidth="3" strokeLinecap="round" className="hero-underline-draw" />
              </svg>
            </span>
          </span>
        </h1>

        {/* Sub copy */}
        <p className="mt-5 sm:mt-6 text-[#22382B]/70 text-sm sm:text-base max-w-md font-sans font-light leading-[1.8] opacity-0 hero-text-reveal [animation-delay:0.75s] [animation-fill-mode:forwards]">
          Authentic herbal blends from Assam's finest tea gardens.
          <span className="text-[#B08848] font-medium"> Nature in every cup.</span>
        </p>

        {/* CTAs */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 opacity-0 hero-text-reveal [animation-delay:0.85s] [animation-fill-mode:forwards] pointer-events-auto">
          <Link to="/shop" className="group inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-10 py-3.5 sm:py-4 bg-[#22382B] text-[#F2EDE3] font-sans font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs rounded-full hover:bg-[#385040] hover:scale-[1.03] transition-all duration-300 shadow-[0_10px_30px_rgba(34,56,43,0.25)]">
            Shop Collection
            <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
          <Link to="/about" className="inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full border border-[#22382B]/25 bg-[#F2EDE3]/60 backdrop-blur-sm text-[#22382B]/80 font-sans font-semibold uppercase tracking-[0.2em] text-[10px] sm:text-xs hover:border-[#22382B]/50 hover:text-[#22382B] transition-all duration-300">
            Our Legacy
          </Link>
        </div>
      </div>

      {/* Rotating heritage badge — floats bottom-center, between the pouches */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-20 h-20 sm:w-24 sm:h-24 opacity-0 hero-text-reveal [animation-delay:1.25s] [animation-fill-mode:forwards] hidden sm:block" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-[#F2EDE3]/90 backdrop-blur-sm shadow-[0_10px_30px_rgba(34,56,43,0.15)]" />
        <svg className="absolute inset-0 hero-ring-spin" viewBox="0 0 100 100">
          <defs>
            <path id="hero-badge-circle" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
          </defs>
          <text className="fill-[#22382B]" style={{ fontSize: '9.5px', fontFamily: 'sans-serif', fontWeight: 700, letterSpacing: '0.15em' }}>
            <textPath href="#hero-badge-circle">PURE ASSAM · SINCE 1974 ·</textPath>
          </text>
        </svg>
        <Leaf className="absolute inset-0 m-auto w-5 h-5 text-[#B08848]" />
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;
