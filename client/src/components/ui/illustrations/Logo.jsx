import React from 'react';
import { motion } from 'framer-motion';

export default function Logo({ className = "w-6 h-6 text-white" }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.path
        d="M50 10 L50 50 L90 30 M50 50 L10 30 M50 50 L50 90"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
      />
      {/* Inner floating element */}
      <motion.circle
        cx="50"
        cy="40"
        r="6"
        fill="currentColor"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -5, 0] }}
        transition={{ 
          opacity: { delay: 1.5, duration: 0.5 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      />
    </svg>
  );
}
