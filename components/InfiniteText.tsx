'use client';

import React from 'react';
import { motion } from 'framer-motion';

const InfiniteText: React.FC = () => {
  return (
    <section className="bg-reggae-dark py-6 overflow-hidden">
      <div className="whitespace-nowrap">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="text-6xl md:text-8xl font-bold font-serif italic text-reggae-green"
        >
          RASMAN PETER DUDU • RASMAN PETER DUDU • RASMAN PETER DUDU • RASMAN PETER DUDU •
        </motion.div>
      </div>
    </section>
  );
};

export default InfiniteText;