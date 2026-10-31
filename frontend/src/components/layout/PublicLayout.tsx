import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { pageVariants } from '../common/PageTransition';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F0] text-[#303B32]">
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            custom={Boolean(shouldReduceMotion)}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full will-change-[transform,opacity]"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};


