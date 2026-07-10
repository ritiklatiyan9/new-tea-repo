import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TopRibbon from '@/components/TopRibbon';
import { useHideOnScroll } from '@/hooks/useHideOnScroll';

export default function MainLayout() {
  const hidden = useHideOnScroll();

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <motion.div
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={hidden ? { duration: 0.35, ease: 'easeInOut' } : { duration: 0.2, ease: 'easeOut' }}
      >
        <TopRibbon />
        <Navbar />
      </motion.div>
      <main className="flex-grow">
        <Suspense fallback={<div className="min-h-screen bg-[#F9F9F9]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
