'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <section className="py-16 bg-reggae-dark">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h3 className="text-3xl font-bold font-serif text-reggae-green mb-4">
            Stay Connected
          </h3>
          <p className="text-white/80 mb-8">
            Be the first to know about new releases, exclusive content, and upcoming events
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-full border-0 focus:ring-2 focus:ring-reggae-green outline-none"
            />
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="bg-reggae-green text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition-colors duration-300 disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
          
          {status === 'success' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-reggae-green mt-4"
            >
              Thanks for subscribing! One Love 🎵
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;