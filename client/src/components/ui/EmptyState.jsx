import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({ title, description, icon: Icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="relative w-40 h-40 mb-8"
      >
        {/* Custom SVG Illustration */}
        <svg viewBox="0 0 200 200" className="w-full h-full text-brand-primary" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M20 100 Q 100 0 180 100 Q 100 200 20 100 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="opacity-20"
          />
          <motion.rect
            x="70"
            y="70"
            width="60"
            height="60"
            rx="12"
            fill="currentColor"
            className="opacity-10"
            initial={{ rotate: -10 }}
            animate={{ rotate: 10, y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", yoyo: Infinity }}
          />
          {Icon && (
            <foreignObject x="85" y="85" width="30" height="30">
              <Icon className="w-full h-full text-brand-primary" />
            </foreignObject>
          )}
        </svg>
      </motion.div>
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-heading font-bold text-white mb-2"
      >
        {title}
      </motion.h3>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-text-secondary max-w-sm mb-6"
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}
