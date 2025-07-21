'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Music, Album as AlbumIcon } from 'lucide-react';
import SongCard from './SongCard';
import AlbumCard from './AlbumCard';
import { ISong, IAlbum } from '@/lib/models';

interface FeaturedMusicProps {
  songs: ISong[];
  albums: IAlbum[];
}

const FeaturedMusic: React.FC<FeaturedMusicProps> = ({ songs, albums }) => {
  const [activeTab, setActiveTab] = useState<'songs' | 'albums'>('songs');
  const [currentSong, setCurrentSong] = useState<ISong | null>(null);

  const handlePlay = (song: ISong) => {
    setCurrentSong(song);
    // Here you would integrate with your audio player context/state
    console.log('Playing song:', song.title);
  };

  const tabVariants = {
    inactive: { opacity: 0.6, scale: 0.95 },
    active: { opacity: 1, scale: 1 }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-white rounded-full p-2 shadow-lg">
          <div className="flex gap-2">
            <motion.button
              variants={tabVariants}
              animate={activeTab === 'songs' ? 'active' : 'inactive'}
              onClick={() => setActiveTab('songs')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'songs'
                  ? 'bg-reggae-green text-white shadow-md'
                  : 'text-gray-600 hover:text-reggae-green'
              }`}
            >
              <Music size={20} />
              Featured Songs
              {songs.length > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeTab === 'songs' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {songs.length}
                </span>
              )}
            </motion.button>

            <motion.button
              variants={tabVariants}
              animate={activeTab === 'albums' ? 'active' : 'inactive'}
              onClick={() => setActiveTab('albums')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'albums'
                  ? 'bg-reggae-green text-white shadow-md'
                  : 'text-gray-600 hover:text-reggae-green'
              }`}
            >
              <AlbumIcon size={20} />
              Featured Albums
              {albums.length > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeTab === 'albums' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {albums.length}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        variants={contentVariants}
        initial="initial"
        animate="animate"
      >
        {activeTab === 'songs' ? (
          <div className="space-y-6">
            {songs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {songs.slice(0, 6).map((song, index) => (
                    <motion.div key={song._id} variants={itemVariants}>
                      <SongCard
                        song={song}
                        onPlay={handlePlay}
                        isPlaying={currentSong?._id === song._id}
                      />
                    </motion.div>
                  ))}
                </div>

                {songs.length > 6 && (
                  <motion.div
                    variants={itemVariants}
                    className="text-center"
                  >
                    <Link
                      href="/songs"
                      className="inline-flex items-center gap-2 bg-reggae-green text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-colors duration-300 shadow-lg group"
                    >
                      View All Songs
                      <ArrowRight 
                        size={20} 
                        className="group-hover:translate-x-1 transition-transform duration-300" 
                      />
                    </Link>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                variants={itemVariants}
                className="text-center py-12"
              >
                <Music size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-6">
                  No featured songs available at the moment
                </p>
                <Link
                  href="/songs"
                  className="inline-flex items-center gap-2 bg-reggae-green text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors duration-300"
                >
                  Browse All Songs
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {albums.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {albums.slice(0, 6).map((album, index) => (
                    <motion.div key={album._id} variants={itemVariants}>
                      <AlbumCard album={album} />
                    </motion.div>
                  ))}
                </div>

                {albums.length > 6 && (
                  <motion.div
                    variants={itemVariants}
                    className="text-center"
                  >
                    <Link
                      href="/albums"
                      className="inline-flex items-center gap-2 bg-reggae-green text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-colors duration-300 shadow-lg group"
                    >
                      View All Albums
                      <ArrowRight 
                        size={20} 
                        className="group-hover:translate-x-1 transition-transform duration-300" 
                      />
                    </Link>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                variants={itemVariants}
                className="text-center py-12"
              >
                <AlbumIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-6">
                  No featured albums available at the moment
                </p>
                <Link
                  href="/albums"
                  className="inline-flex items-center gap-2 bg-reggae-green text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors duration-300"
                >
                  Browse All Albums
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* Stats Section */}
      {(songs.length > 0 || albums.length > 0) && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-reggae-green">
                {songs.length}
              </div>
              <div className="text-gray-600">Featured Songs</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-reggae-yellow">
                {albums.length}
              </div>
              <div className="text-gray-600">Featured Albums</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-reggae-red">
                {songs.reduce((total, song) => total + song.duration, 0) > 0 
                  ? Math.round(songs.reduce((total, song) => total + song.duration, 0) / 60)
                  : 0}
              </div>
              <div className="text-gray-600">Minutes of Music</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Call to Action */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-reggae-green to-reggae-yellow rounded-2xl p-8 text-center"
      >
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Experience Conscious Reggae Music
        </h3>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Support independent artistry and become part of the movement. 
          Every purchase helps spread messages of love, unity, and consciousness.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/songs"
            className="bg-white text-reggae-dark px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300"
          >
            Browse Songs
          </Link>
          <Link
            href="/albums"
            className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-reggae-dark transition-colors duration-300"
          >
            View Albums
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturedMusic;