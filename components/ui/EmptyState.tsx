'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';


// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-16 ${className}`}
    >
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        {icon || <Music className="text-gray-400" size={40} />}
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-reggae-green text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors duration-300"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

// Export as default for easier importing
export default EmptyState