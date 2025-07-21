'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const CallToAction: React.FC = () => {
  return (
    <section className="py-20 bg-hero-gradient">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-bold font-serif text-white mb-6">
            Join the Musical Journey
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Experience authentic reggae music that carries messages of love, unity, and consciousness. 
            Support independent artistry and become part of the movement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/songs"
              className="bg-white text-reggae-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg"
            >
              Browse Music
            </Link>
            <Link 
              href="/albums"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-reggae-dark transition-colors duration-300"
            >
              View Albums
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;