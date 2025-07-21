'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

// Full Page Loading Component
const PageLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
          className="w-16 h-16 bg-reggae-gradient rounded-full flex items-center justify-center mb-4 mx-auto"
        >
          <Music className="text-white" size={32} />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Music...</h2>
        <p className="text-gray-500">Preparing your reggae experience</p>
      </div>
    </div>
  );
};

export default PageLoading;