'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

// Error Component
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 ${className}`}
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Music className="text-red-500" size={32} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-reggae-green text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors duration-300"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
};

// Export as default for easier importing
export default ErrorMessage;