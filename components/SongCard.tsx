'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Pause, Clock, Music, Download, Heart } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { ISong } from '@/lib/models';
import PurchaseButton from './PurchaseButton';

interface SongCardProps {
  song: ISong;
  viewMode?: 'grid' | 'list';
  showPurchaseButton?: boolean;
  isOwned?: boolean;
  onPlay?: (song: ISong) => void;
  isPlaying?: boolean;
  className?: string;
}

const SongCard: React.FC<SongCardProps> = ({
  song,
  viewMode = 'grid',
  showPurchaseButton = true,
  isOwned = false,
  onPlay,
  isPlaying = false,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isSignedIn } = useUser();

  // Format duration from seconds to mm:ss
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format price in Naira
  const formatPrice = (price: number): string => {
    return `₦${price.toLocaleString()}`;
  };

  const handlePlayClick = () => {
    if (onPlay) {
      onPlay(song);
    }
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    hover: { opacity: 1 }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 ${className}`}
      >
        <div className="flex items-center gap-4">
          {/* Cover Art */}
          <div className="relative w-16 h-16 flex-shrink-0">
            {!imageError ? (
              <Image
                src={song.coverArtUrl}
                alt={`${song.title} cover`}
                fill
                className={`object-cover rounded-lg transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-reggae-gradient rounded-lg flex items-center justify-center">
                <Music className="text-white" size={24} />
              </div>
            )}
            
            {/* Play Button Overlay */}
            <motion.div
              variants={overlayVariants}
              className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={handlePlayClick}
            >
              {isPlaying ? (
                <Pause className="text-white" size={20} />
              ) : (
                <Play className="text-white" size={20} />
              )}
            </motion.div>
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 truncate">{song.title}</h3>
            <p className="text-gray-600 truncate">{song.artist}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDuration(song.duration)}
              </span>
              <span className="px-2 py-1 bg-reggae-green/10 text-reggae-green rounded-full text-xs">
                {song.genre}
              </span>
              {song.featured && (
                <span className="px-2 py-1 bg-reggae-yellow/20 text-reggae-yellow rounded-full text-xs">
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-bold text-xl text-reggae-green">
                {formatPrice(song.price)}
              </div>
            </div>
            
            {isOwned ? (
              <div className="flex gap-2">
                <button className="p-2 bg-reggae-green text-white rounded-lg hover:bg-green-600 transition-colors">
                  <Download size={18} />
                </button>
                <button className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                  <Heart size={18} />
                </button>
              </div>
            ) : showPurchaseButton && (
              <PurchaseButton
                item={song}
                itemType="song"
                className="px-4 py-2"
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group ${className}`}
    >
      {/* Cover Art */}
      <div className="relative aspect-square">
        {!imageError ? (
          <Image
            src={`/${song.coverArtUrl}`}
            alt={`${song.title} cover`}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-reggae-gradient flex items-center justify-center">
            <Music className="text-white" size={48} />
          </div>
        )}

        {/* Featured Badge */}
        {song.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-reggae-yellow text-black text-xs font-bold rounded-full">
            Featured
          </div>
        )}

        {/* Play Button Overlay */}
        <motion.div
          variants={overlayVariants}
          className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
          onClick={handlePlayClick}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
          >
            {isPlaying ? (
              <Pause className="text-reggae-dark ml-1" size={24} />
            ) : (
              <Play className="text-reggae-dark ml-1" size={24} />
            )}
          </motion.div>
        </motion.div>

        {/* Owned Badge */}
        {isOwned && (
          <div className="absolute top-3 right-3 p-2 bg-reggae-green text-white rounded-full">
            <Download size={16} />
          </div>
        )}
      </div>

      {/* Song Details */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-xl text-gray-900 mb-1 line-clamp-1">
            {song.title}
          </h3>
          <p className="text-gray-600 text-lg">
            {song.artist}
          </p>
        </div>

        {/* Song Meta */}
        <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {formatDuration(song.duration)}
          </span>
          <span className="px-2 py-1 bg-reggae-green/10 text-reggae-green rounded-full">
            {song.genre}
          </span>
        </div>

        {/* Price and Purchase */}
        <div className="flex items-center justify-between">
          <div className="font-bold text-2xl text-reggae-green">
            {formatPrice(song.price)}
          </div>
          
          {isOwned ? (
            <div className="flex gap-2">
              <button className="p-2 bg-reggae-green text-white rounded-lg hover:bg-green-600 transition-colors">
                <Download size={18} />
              </button>
              <button className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                <Heart size={18} />
              </button>
            </div>
          ) : showPurchaseButton ? (
            <PurchaseButton
              item={song}
              itemType="song"
              className="px-6 py-3 text-sm font-semibold"
            />
          ) : (
            <button
              onClick={handlePlayClick}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Play size={16} />
              Preview
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SongCard;