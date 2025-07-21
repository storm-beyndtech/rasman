'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Music, Download } from 'lucide-react';

const Hero: React.FC = () => {
  const parallaxVariants = {
    initial: { y: 0 },
    animate: {
      y: [-20, 20, -20],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const fadeInVariants = {
    initial: { opacity: 0, y: 60 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-reggae-dark via-gray-900 to-black">
      {/* Background Pattern - FIXED: Corrected the SVG URL encoding */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%223%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
      </div>

      {/* Floating Music Elements - FIXED: Removed style prop, using transition delay in variants */}
      <motion.div
        variants={parallaxVariants}
        initial="initial"
        animate="animate"
        className="absolute top-20 left-10 text-reggae-green opacity-30"
      >
        <Music size={60} />
      </motion.div>
      
      <motion.div
        variants={{
          ...parallaxVariants,
          animate: {
            ...parallaxVariants.animate,
            transition: {
              ...parallaxVariants.animate.transition,
              delay: 2
            }
          }
        }}
        initial="initial"
        animate="animate"
        className="absolute top-40 right-20 text-reggae-yellow opacity-20"
      >
        <Play size={80} />
      </motion.div>

      <motion.div
        variants={{
          ...parallaxVariants,
          animate: {
            ...parallaxVariants.animate,
            transition: {
              ...parallaxVariants.animate.transition,
              delay: 4
            }
          }
        }}
        initial="initial"
        animate="animate"
        className="absolute bottom-32 left-20 text-reggae-red opacity-25"
      >
        <Download size={50} />
      </motion.div>

      {/* Main Hero Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Artist Name */}
          <motion.h1
            variants={fadeInVariants}
            className="text-6xl md:text-8xl lg:text-9xl font-bold font-serif"
          >
            <span className="bg-reggae-gradient bg-clip-text text-transparent">
              RASMAN
            </span>
            <br />
            <span className="text-white italic">
              Peter Dudu
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={fadeInVariants}
            className="text-2xl md:text-4xl font-serif italic text-reggae-green max-w-4xl mx-auto leading-relaxed"
          >
            &quot;Conscious reggae music for the soul, spreading love and unity through every beat&quot;
          </motion.p>

          {/* Description */}
          <motion.p
            variants={fadeInVariants}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Experience authentic Jamaican reggae with messages that uplift, inspire, and connect hearts across the world. 
            From roots to contemporary, every song carries the spirit of unity and consciousness.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
          >
            <Link 
              href="/songs"
              className="group bg-reggae-green text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-green-600 transition-all duration-300 shadow-2xl transform hover:scale-105 flex items-center gap-3"
            >
              <Play size={24} className="group-hover:scale-110 transition-transform" />
              Listen Now
            </Link>
            
            <Link 
              href="/albums"
              className="group bg-transparent border-2 border-reggae-yellow text-reggae-yellow px-12 py-4 rounded-full font-bold text-lg hover:bg-reggae-yellow hover:text-black transition-all duration-300 flex items-center gap-3"
            >
              <Music size={24} className="group-hover:scale-110 transition-transform" />
              View Albums
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={fadeInVariants}
            className="pt-12 flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-reggae-green rounded-full animate-pulse"></div>
              <span>High Quality Audio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-reggae-yellow rounded-full animate-pulse"></div>
              <span>Instant Download</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-reggae-red rounded-full animate-pulse"></div>
              <span>Secure Payments</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;