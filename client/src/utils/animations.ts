/**
 * @author Bob's Garage Team
 * @purpose Shared animation constants for Framer Motion
 * @version 1.0.0
 */

/**
 * Fade in and slide up animation
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

/**
 * Stagger container animation for children
 */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
