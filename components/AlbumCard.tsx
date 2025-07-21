'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Music, Calendar, Download, Heart } from 'lucide-react';
import { IAlbum } from '@/lib/models';
import PurchaseButton from './PurchaseButton';

interface AlbumCardProps {
  album: IAlbum;
  showPurchaseButton?: boolean;
  isOwned?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  showPurchaseButton = true,
  isOwned = false,
  className = '',
  variant = 'default'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Format price in Naira
  const formatPrice = (price: number): string => {
    return `₦${price.toLocaleString()}`;
  };

  // Format date
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    hover: { opacity: 1 }
  };

  // Compact variant for smaller spaces
  if (variant === 'compact') {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 ${className}`}
      >
        <div className="flex items-center gap-4">
          {/* Cover Art */}
          <div className="relative w-16 h-16 flex-shrink-0">
            {!imageError ? (
              <Image
                src={album.coverArtUrl}
                alt={`${album.title} cover`}
                fill
                className={`object-cover rounded-lg transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-reggae-gradient rounded-lg flex items-center justify-center">
                <Music className="text-white" size={20} />
              </div>
            )}
          </div>

          {/* Album Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 truncate">{album.title}</h3>
            <p className="text-gray-600 truncate">{album.artist}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">
                {album.songIds?.length || 0} tracks
              </span>
              {album.featured && (
                <span className="px-2 py-1 bg-reggae-yellow/20 text-reggae-yellow rounded-full text-xs">
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Price and Action */}
          <div className="text-right">
            <div className="font-bold text-xl text-reggae-green">
              {formatPrice(album.price)}
            </div>
            {isOwned ? (
              <button className="p-2 bg-reggae-green text-white rounded-lg hover:bg-green-600 transition-colors mt-2">
                <Download size={16} />
              </button>
            ) : showPurchaseButton && (
              <PurchaseButton
                item={album}
                itemType="album"
                size="sm"
                className="mt-2"
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
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
            src={album.coverArtUrl}
            alt={`${album.title} cover`}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-reggae-gradient flex items-center justify-center">
            <Music className="text-white" size={64} />
          </div>
        )}

        {/* Featured Badge */}
        {album.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-reggae-yellow text-black text-xs font-bold rounded-full">
            Featured
          </div>
        )}

        {/* Play Button Overlay */}
        <motion.div
          variants={overlayVariants}
          className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
        >
          <Link href={`/album/${album._id}`}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <Play className="text-reggae-dark ml-1" size={24} />
            </motion.div>
          </Link>
        </motion.div>

        {/* Owned Badge */}
        {isOwned && (
          <div className="absolute top-3 right-3 p-2 bg-reggae-green text-white rounded-full">
            <Download size={16} />
          </div>
        )}
      </div>

      {/* Album Details */}
      <div className="p-6">
        <div className="mb-4">
          <Link href={`/album/${album._id}`}>
            <h3 className="font-bold text-xl text-gray-900 mb-1 hover:text-reggae-green transition-colors line-clamp-1">
              {album.title}
            </h3>
          </Link>
          <p className="text-gray-600 text-lg">
            {album.artist}
          </p>
        </div>

        {/* Album Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Music size={14} />
            {album.songIds?.length || 0} tracks
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(album.releaseDate)}
          </span>
        </div>

        {/* Description */}
        {album.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {album.description}
          </p>
        )}

        {/* Price and Purchase */}
        <div className="flex items-center justify-between">
          <div className="font-bold text-2xl text-reggae-green">
            {formatPrice(album.price)}
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
              item={album}
              itemType="album"
              className="px-6 py-3 text-sm font-semibold"
            />
          ) : (
            <Link
              href={`/album/${album._id}`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Play size={16} />
              View Album
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AlbumCard;