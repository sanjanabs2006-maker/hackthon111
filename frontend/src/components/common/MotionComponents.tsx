import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: (reducedMotion: boolean) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 16,
    scale: reducedMotion ? 1 : 0.985,
  }),
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: EASE_OUT,
    },
  },
};

export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      custom={Boolean(shouldReduceMotion)}
      variants={staggerItemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}> = ({ children, className = '', delay = 0, onClick }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16, scale: shouldReduceMotion ? 1 : 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={shouldReduceMotion ? undefined : { y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985, transition: { duration: 0.1 } }}
      onClick={onClick}
      className={`will-change-[transform,opacity] ${className}`}
    >
      {children}
    </motion.div>
  );
};

/* ── Cinematic Scroll & Reveal Variants ────────────────────────────── */
export const cinematicZoomIn: Variants = {
  initial: (reducedMotion: boolean) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 1.06,
  }),
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.1,
      ease: EASE_OUT,
    },
  },
};

export const cinematicSlideDown: Variants = {
  initial: (reducedMotion: boolean) => ({
    opacity: 0,
    y: reducedMotion ? 0 : -28,
  }),
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: EASE_OUT,
    },
  },
};

export const cinematicSlideLeft: Variants = {
  initial: (reducedMotion: boolean) => ({
    opacity: 0,
    x: reducedMotion ? 0 : -35,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.75,
      ease: EASE_OUT,
    },
  },
};

export const cinematicSlideRight3D: Variants = {
  initial: (reducedMotion: boolean) => ({
    opacity: 0,
    x: reducedMotion ? 0 : 45,
    rotateY: reducedMotion ? 0 : -8,
    scale: reducedMotion ? 1 : 0.96,
  }),
  animate: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      ease: EASE_OUT,
    },
  },
};

export const cinematicSlideUp: Variants = {
  initial: (reducedMotion: boolean) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 32,
  }),
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: EASE_OUT,
    },
  },
};

export const cinematicSectionScroll: Variants = {
  initial: (reducedMotion: boolean) => ({
    opacity: 0,
    y: reducedMotion ? 0 : 36,
  }),
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: EASE_OUT,
    },
  },
};

/* ── Floating Leaves & Ambient Cinematic Lighting ──────────────────── */
export const AmbientFloatingLeaves: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden z-0 select-none ${className}`} aria-hidden="true">
      {/* Ambient Gradient Lighting Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#245C3A]/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#D5A94F]/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-[#DCE9D5]/35 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '5s' }} />

      {/* Floating Organic Leaf SVGs */}
      {/* Leaf 1 - Top Left */}
      <div className="absolute top-12 left-[6%] animate-float-leaf-1 opacity-50">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 3C15 3 6 7 4 14C3.5 15.5 3.5 17.5 4.5 19C5.5 20.5 7.5 20.5 9 20C16 18 20 9 21 3Z" fill="#245C3A" fillOpacity="0.4" stroke="#245C3A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 20C7 16 11 13 21 3" stroke="#245C3A" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Leaf 2 - Top Right */}
      <div className="absolute top-20 right-[10%] animate-float-leaf-2 opacity-55">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 3C15 3 6 7 4 14C3.5 15.5 3.5 17.5 4.5 19C5.5 20.5 7.5 20.5 9 20C16 18 20 9 21 3Z" fill="#D5A94F" fillOpacity="0.4" stroke="#D5A94F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 20C7 16 11 13 21 3" stroke="#D5A94F" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Leaf 3 - Middle Left */}
      <div className="absolute top-1/2 left-[3%] animate-float-leaf-3 opacity-40">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 3C15 3 6 7 4 14C3.5 15.5 3.5 17.5 4.5 19C5.5 20.5 7.5 20.5 9 20C16 18 20 9 21 3Z" fill="#245C3A" fillOpacity="0.35" stroke="#245C3A" strokeWidth="0.8"/>
          <path d="M4 20C7 16 11 13 21 3" stroke="#245C3A" strokeWidth="0.8"/>
        </svg>
      </div>

      {/* Leaf 4 - Middle Right */}
      <div className="absolute top-[65%] right-[5%] animate-float-leaf-1 opacity-45">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 3C15 3 6 7 4 14C3.5 15.5 3.5 17.5 4.5 19C5.5 20.5 7.5 20.5 9 20C16 18 20 9 21 3Z" fill="#245C3A" fillOpacity="0.4" stroke="#245C3A" strokeWidth="1"/>
          <path d="M4 20C7 16 11 13 21 3" stroke="#245C3A" strokeWidth="1"/>
        </svg>
      </div>

      {/* Leaf 5 - Lower Center */}
      <div className="absolute bottom-10 left-[28%] animate-float-leaf-2 opacity-35">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 3C15 3 6 7 4 14C3.5 15.5 3.5 17.5 4.5 19C5.5 20.5 7.5 20.5 9 20C16 18 20 9 21 3Z" fill="#D5A94F" fillOpacity="0.3" stroke="#D5A94F" strokeWidth="0.8"/>
          <path d="M4 20C7 16 11 13 21 3" stroke="#D5A94F" strokeWidth="0.8"/>
        </svg>
      </div>
    </div>
  );
};
