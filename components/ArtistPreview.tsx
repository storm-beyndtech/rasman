'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Music, Award, Users, Calendar } from 'lucide-react';

const ArtistPreview: React.FC = () => {
  const achievements = [
    { icon: <Music size={24} />, label: 'Original Songs', value: '50+' },
    { icon: <Award size={24} />, label: 'Years Active', value: '10+' },
    { icon: <Users size={24} />, label: 'Global Fans', value: '10K+' },
    { icon: <Calendar size={24} />, label: 'Albums Released', value: '5' },
  ];

  const fadeInVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
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
    <motion.section
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className="py-20"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Artist Image */}
          <motion.div
            variants={fadeInVariants}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-reggae-gradient rounded-3xl transform rotate-6 opacity-20"></div>
              <div className="absolute inset-0 bg-reggae-gradient rounded-3xl transform -rotate-3 opacity-30"></div>
              
              {/* Main Image Container */}
              <div className="relative h-full bg-gray-200 rounded-3xl overflow-hidden shadow-2xl">
                {/* Placeholder for artist image */}
                <div className="w-full h-full bg-gradient-to-br from-reggae-green via-reggae-yellow to-reggae-red flex items-center justify-center">
                  <div className="text-center text-white">
                    <Music size={80} className="mx-auto mb-4" />
                    <p className="text-2xl font-bold">Rasman Peter Dudu</p>
                  </div>
                </div>
                
                {/* Overlay for upcoming photo */}
                <div className="absolute inset-0 bg-black/20 flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-1">Rasman Peter Dudu</h3>
                    <p className="text-white/90">Conscious Reggae Artist</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 w-20 h-20 bg-reggae-yellow rounded-full flex items-center justify-center shadow-lg"
            >
              <Music className="text-reggae-dark" size={28} />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-reggae-red rounded-full flex items-center justify-center shadow-lg"
            >
              <Award className="text-white" size={24} />
            </motion.div>
          </motion.div>

          {/* Artist Info */}
          <motion.div
            variants={fadeInVariants}
            className="space-y-8"
          >
            <div>
              <motion.h2 
                variants={fadeInVariants}
                className="text-4xl md:text-5xl font-bold font-serif text-reggae-dark mb-4"
              >
                Meet the Artist
              </motion.h2>
              <motion.div
                variants={fadeInVariants}
                className="w-20 h-1 bg-reggae-gradient rounded-full mb-6"
              ></motion.div>
            </div>

            <motion.div
              variants={fadeInVariants}
              className="space-y-6 text-lg text-gray-700 leading-relaxed"
            >
              <p className="italic text-xl text-reggae-green font-medium">
                "Music is the universal language that speaks directly to the soul, 
                and reggae is the heartbeat of consciousness."
              </p>
              
              <p>
                <strong className="text-reggae-dark">Rasman Peter Dudu</strong> is a passionate reggae artist 
                dedicated to spreading messages of love, unity, and spiritual consciousness through music. 
                Born with the rhythm of Jamaica in his soul, he creates authentic reggae that touches hearts 
                and inspires positive change.
              </p>
              
              <p>
                His musical journey began over a decade ago, and since then, he has been crafting songs 
                that blend traditional reggae roots with contemporary consciousness, creating a unique 
                sound that resonates with listeners worldwide.
              </p>
            </motion.div>

            {/* Achievements Grid */}
            <motion.div
              variants={fadeInVariants}
              className="grid grid-cols-2 gap-4"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  variants={fadeInVariants}
                  className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-reggae-green/10 rounded-lg flex items-center justify-center text-reggae-green">
                      {achievement.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-reggae-dark">
                        {achievement.value}
                      </div>
                      <div className="text-sm text-gray-600">
                        {achievement.label}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Call to Action */}
            <motion.div
              variants={fadeInVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/biography"
                className="group inline-flex items-center gap-2 bg-reggae-green text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg"
              >
                Read Full Biography
                <ArrowRight 
                  size={20} 
                  className="group-hover:translate-x-1 transition-transform duration-300" 
                />
              </Link>
              
              <Link
                href="/songs"
                className="group inline-flex items-center gap-2 bg-transparent border-2 border-reggae-green text-reggae-green px-8 py-4 rounded-full font-semibold hover:bg-reggae-green hover:text-white transition-all duration-300"
              >
                <Music size={20} />
                Listen to Music
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Quote Section */}
        <motion.div
          variants={fadeInVariants}
          className="mt-20 text-center"
        >
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-reggae-green/10 via-reggae-yellow/10 to-reggae-red/10 rounded-3xl p-8 md:p-12">
            <blockquote className="text-2xl md:text-3xl font-serif italic text-reggae-dark mb-6">
              "Through music, we can heal the world one soul at a time. 
              Every song is a prayer, every beat is a heartbeat of humanity."
            </blockquote>
            <footer className="text-xl font-semibold text-reggae-green">
              — Rasman Peter Dudu
            </footer>
          </div>
        </motion.div>

        {/* Musical Philosophy */}
        <motion.div
          variants={fadeInVariants}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              title: "Unity",
              description: "Bringing people together through the universal language of music",
              color: "bg-reggae-green"
            },
            {
              title: "Consciousness",
              description: "Awakening minds and spirits through meaningful lyrics and melodies",
              color: "bg-reggae-yellow"
            },
            {
              title: "Love",
              description: "Spreading love and positive vibrations to heal and inspire",
              color: "bg-reggae-red"
            }
          ].map((philosophy, index) => (
            <motion.div
              key={index}
              variants={fadeInVariants}
              className="text-center group"
            >
              <div className={`w-20 h-20 ${philosophy.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Music className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-reggae-dark mb-3">
                {philosophy.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {philosophy.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ArtistPreview;