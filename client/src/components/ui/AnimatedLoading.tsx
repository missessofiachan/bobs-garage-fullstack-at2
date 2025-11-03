/**
 * @author Bob's Garage Team
 * @purpose Animated loading component using Framer Motion
 * @version 1.0.0
 */

import { motion } from 'framer-motion';
import { Spinner } from 'react-bootstrap';

interface AnimatedLoadingProps {
  message?: string;
  variant?: 'border' | 'grow';
}

export default function AnimatedLoading({ 
  message, 
  variant = 'border' 
}: AnimatedLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: 160 }}
    >
      <Spinner 
        animation={variant} 
        role="status" 
        aria-hidden="true" 
      />
      {message && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-muted"
          aria-live="polite"
        >
          {message}
        </motion.div>
      )}
    </motion.div>
  );
}

