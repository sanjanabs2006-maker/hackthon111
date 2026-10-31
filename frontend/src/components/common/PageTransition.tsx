import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const pageVariants: Variants = {
  initial: (reducedMotion: boolean) => ({
    opacity: 0,
    x: reducedMotion ? 0 : 25,
    scale: reducedMotion ? 1 : 0.98,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: EASE_OUT,
    },
  },
  exit: (reducedMotion: boolean) => ({
    opacity: 0,
    x: reducedMotion ? 0 : -20,
    scale: reducedMotion ? 1 : 0.99,
    transition: {
      duration: 0.22,
      ease: EASE_OUT,
    },
  }),
};

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      custom={Boolean(shouldReduceMotion)}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full will-change-[transform,opacity] ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
