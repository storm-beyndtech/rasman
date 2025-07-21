'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Music, Award, Heart, Globe, Calendar, Users, Mic, Guitar } from 'lucide-react';

const BiographyPage: React.FC = () => {
  const achievements = [
    { icon: <Music size={32} />, title: 'Original Songs', value: '50+', description: 'Conscious reggae tracks' },
    { icon: <Award size={32} />, title: 'Years Active', value: '10+', description: 'Spreading positive vibes' },
    { icon: <Users size={32} />, title: 'Global Fans', value: '10K+', description: 'Worldwide community' },
    { icon: <Globe size={32} />, title: 'Countries Reached', value: '25+', description: 'International impact' },
  ];

  const timeline = [
    {
      year: '2014',
      title: 'Musical Awakening',
      description: 'Discovered the power of reggae music and began writing conscious lyrics inspired by spiritual teachings and life experiences.',
      icon: <Mic size={24} />
    },
    {
      year: '2016',
      title: 'First Recordings',
      description: 'Released debut singles focusing on unity, love, and social consciousness. Started performing at local venues and spiritual gatherings.',
      icon: <Guitar size={24} />
    },
    {
      year: '2018',
      title: 'First Album Release',
      description: 'Launched debut album "Conscious Vibrations" featuring 12 tracks of authentic reggae with messages of hope and healing.',
      icon: <Music size={24} />
    },
    {
      year: '2020',
      title: 'Digital Revolution',
      description: 'Embraced digital platforms to reach global audiences during the pandemic. Connected with reggae lovers worldwide through virtual concerts.',
      icon: <Globe size={24} />
    },
    {
      year: '2022',
      title: 'Community Impact',
      description: 'Established music education programs for youth, using reggae as a tool for positive change and cultural awareness.',
      icon: <Users size={24} />
    },
    {
      year: '2024',
      title: 'Platform Launch',
      description: 'Launched official music platform to provide direct access to conscious reggae music while supporting independent artistry.',
      icon: <Award size={24} />
    },
  ];

  const philosophy = [
    {
      title: 'Unity Through Music',
      description: 'Music is the universal language that transcends all barriers - race, religion, nationality. Through reggae\'s rhythmic heartbeat, we can unite souls and create understanding between all people.',
      color: 'bg-reggae-green',
      quote: '"One love, one heart, let\'s get together and feel alright."'
    },
    {
      title: 'Conscious Messaging',
      description: 'Every song carries a purpose - to awaken consciousness, inspire positive action, and remind listeners of their divine nature. Music should heal, not harm; unite, not divide.',
      color: 'bg-reggae-yellow',
      quote: '"Words are powerful - they can build up or tear down. I choose to build."'
    },
    {
      title: 'Spiritual Connection',
      description: 'Reggae is more than entertainment; it\'s a spiritual practice. Each rhythm connects us to the divine, each melody carries prayers, and each lyric plants seeds of wisdom in the hearts of listeners.',
      color: 'bg-reggae-red',
      quote: '"Music is my meditation, my prayer, my way of connecting with the Most High."'
    },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Hero Text */}
            <motion.div variants={fadeInVariants} className="space-y-8">
              <div>
                <h1 className="text-5xl md:text-7xl font-bold font-serif text-reggae-dark mb-6">
                  Rasman Peter Dudu
                </h1>
                <div className="w-24 h-2 bg-reggae-gradient rounded-full mb-6"></div>
                <p className="text-2xl text-gray-600 italic">
                  "Spreading consciousness through the healing power of reggae music"
                </p>
              </div>
              
              <p className="text-xl text-gray-700 leading-relaxed">
                A passionate reggae artist dedicated to creating music that not only entertains 
                but transforms. Through conscious lyrics and authentic rhythms, Rasman bridges 
                the gap between traditional reggae roots and contemporary spiritual awakening.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-reggae-green/10 text-reggae-green rounded-full font-semibold">
                  Conscious Artist
                </div>
                <div className="px-4 py-2 bg-reggae-yellow/20 text-reggae-yellow rounded-full font-semibold">
                  Spiritual Teacher
                </div>
                <div className="px-4 py-2 bg-reggae-red/10 text-reggae-red rounded-full font-semibold">
                  Community Builder
                </div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div variants={fadeInVariants} className="relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 bg-reggae-gradient rounded-3xl transform rotate-6 opacity-20"></div>
                <div className="absolute inset-0 bg-reggae-gradient rounded-3xl transform -rotate-3 opacity-30"></div>
                
                {/* Main Image Container */}
                <div className="relative h-full bg-gradient-to-br from-reggae-green via-reggae-yellow to-reggae-red rounded-3xl overflow-hidden shadow-2xl">
                  {/* Placeholder for artist image */}
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Music size={120} className="mx-auto mb-6" />
                      <p className="text-3xl font-bold">Rasman</p>
                      <p className="text-xl">Peter Dudu</p>
                    </div>
                  </div>
                </div>

                {/* Floating Musical Notes */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-8 -right-8 w-16 h-16 bg-reggae-yellow rounded-full flex items-center justify-center shadow-lg"
                >
                  <Music className="text-reggae-dark" size={24} />
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-6 -left-6 w-14 h-14 bg-reggae-red rounded-full flex items-center justify-center shadow-lg"
                >
                  <Heart className="text-white" size={20} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Infinite Scrolling Text */}
      <section className="bg-reggae-dark py-8 overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="whitespace-nowrap text-6xl md:text-8xl font-bold font-serif italic text-reggae-green"
        >
          CONSCIOUSNESS • UNITY • LOVE • MUSIC • HEALING • CONSCIOUSNESS • UNITY • LOVE •
        </motion.div>
      </section>

      {/* Achievements Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInVariants} className="text-4xl md:text-5xl font-bold font-serif text-reggae-dark mb-6">
              Musical Journey in Numbers
            </motion.h2>
            <motion.p variants={fadeInVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              A decade of spreading consciousness through music has touched hearts across the globe
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                variants={fadeInVariants}
                className="text-center group"
              >
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <div className="text-reggae-green">
                    {achievement.icon}
                  </div>
                </div>
                <div className="text-4xl font-bold text-reggae-dark mb-2">
                  {achievement.value}
                </div>
                <div className="text-xl font-semibold text-gray-700 mb-2">
                  {achievement.title}
                </div>
                <div className="text-gray-600">
                  {achievement.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInVariants} className="text-4xl md:text-5xl font-bold font-serif text-reggae-dark mb-6">
              The Musical Timeline
            </motion.h2>
            <motion.p variants={fadeInVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to global impact - the journey of conscious reggae music
            </motion.p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((event, index) => (
              <motion.div
                key={index}
                variants={fadeInVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative flex items-start gap-8 pb-12 last:pb-0"
              >
                {/* Timeline Line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-reggae-green to-reggae-yellow"></div>
                )}

                {/* Year Circle */}
                <div className="relative z-10 w-12 h-12 bg-reggae-green rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {event.icon}
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-2xl font-bold text-reggae-green">
                      {event.year}
                    </div>
                    <h3 className="text-xl font-bold text-reggae-dark">
                      {event.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-gradient-to-br from-reggae-dark to-gray-900 text-white" id="philosophy">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInVariants} className="text-4xl md:text-5xl font-bold font-serif mb-6">
              Musical Philosophy
            </motion.h2>
            <motion.p variants={fadeInVariants} className="text-xl text-gray-300 max-w-3xl mx-auto">
              The core beliefs that drive every rhythm, every lyric, and every performance
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {philosophy.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInVariants}
                className="relative group"
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 h-full border border-white/10 hover:border-reggae-green/30 transition-all duration-300">
                  <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Music className="text-white" size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-reggae-green">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {item.description}
                  </p>
                  
                  <blockquote className="text-reggae-yellow italic font-medium border-l-4 border-reggae-yellow pl-4">
                    {item.quote}
                  </blockquote>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeInVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-reggae-green via-reggae-yellow to-reggae-red rounded-3xl p-12 text-white">
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6">
                Join the Musical Movement
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Experience the transformative power of conscious reggae music. 
                Every song is a step towards unity, every rhythm a heartbeat of healing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-reggae-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                  Explore Music
                </button>
                <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-reggae-dark transition-colors">
                  Connect with Rasman
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BiographyPage;