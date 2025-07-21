import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Clock, Music, Play, ArrowLeft, Share2 } from 'lucide-react';
import { connectDB } from '@/lib/mongodb';
import { Album, Song } from '@/lib/models';
import { IAlbum, ISong } from '@/lib/models';
import PurchaseButton from '@/components/PurchaseButton';

interface AlbumPageProps {
  params: {
    albumId: string;
  };
}

// Server component to fetch album data
async function getAlbumData(albumId: string) {
  try {
    await connectDB();

    const album: any = await Album.findById(albumId).lean();
    if (!album) {
      return null;
    }

    // Fetch all songs in the album
    const songs = await Song.find({ _id: { $in: album.songIds } })
      .sort({ createdAt: 1 })
      .lean();

    return {
      album: JSON.parse(JSON.stringify(album)),
      songs: JSON.parse(JSON.stringify(songs))
    };
  } catch (error) {
    console.error('Error fetching album data:', error);
    return null;
  }
}

export default async function AlbumDetailPage({ params }: AlbumPageProps) {
  const data = await getAlbumData(params.albumId);

  if (!data) {
    notFound();
  }

  const { album, songs }: { album: IAlbum; songs: ISong[] } = data;

  // Calculate total duration
  const totalDuration = songs.reduce((total, song) => total + song.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  // Format date
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format price
  const formatPrice = (price: number): string => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/albums"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-reggae-green transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Albums
          </Link>
        </motion.div>

        {/* Album Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
        >
          {/* Album Cover */}
          <div className="relative">
            <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={album.coverArtUrl}
                alt={`${album.title} cover`}
                fill
                className="object-cover"
                priority
              />
              
              {/* Featured Badge */}
              {album.featured && (
                <div className="absolute top-6 left-6 px-4 py-2 bg-reggae-yellow text-black text-sm font-bold rounded-full">
                  Featured Album
                </div>
              )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-reggae-green/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-reggae-yellow/20 rounded-full blur-2xl"></div>
          </div>

          {/* Album Info */}
          <div className="space-y-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold font-serif text-reggae-dark mb-4"
              >
                {album.title}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl text-gray-600 mb-6"
              >
                by {album.artist}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 text-gray-600"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{formatDate(album.releaseDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music size={18} />
                  <span>{songs.length} tracks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{totalMinutes} minutes</span>
                </div>
              </motion.div>
            </div>

            {/* Description */}
            {album.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="prose prose-lg max-w-none"
              >
                <p className="text-gray-700 leading-relaxed text-lg">
                  {album.description}
                </p>
              </motion.div>
            )}

            {/* Price and Purchase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Album Price</div>
                  <div className="text-4xl font-bold text-reggae-green">
                    {formatPrice(album.price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Individual Songs</div>
                  <div className="text-lg font-semibold text-gray-700">
                    {formatPrice(songs.reduce((total, song) => total + song.price, 0))}
                  </div>
                  <div className="text-xs text-reggae-green">
                    Save {formatPrice(songs.reduce((total, song) => total + song.price, 0) - album.price)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <PurchaseButton
                  item={album}
                  itemType="album"
                  size="lg"
                  className="w-full justify-center text-lg"
                />
                
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-reggae-green text-reggae-green rounded-full font-semibold hover:bg-reggae-green hover:text-white transition-all duration-300">
                    <Play size={20} />
                    Preview Album
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                    <Share2 size={20} />
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Track Listing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold font-serif text-reggae-dark">
              Track Listing
            </h2>
            <div className="text-gray-600">
              {songs.length} songs • {totalMinutes} min
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-100">
              {songs.map((song, index) => (
                <motion.div
                  key={song._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    {/* Track Number */}
                    <div className="w-8 text-center font-bold text-gray-400">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>

                    {/* Song Cover */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={song.coverArtUrl}
                        alt={`${song.title} cover`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {song.title}
                      </h3>
                      <p className="text-gray-600">{song.artist}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
                        <span>•</span>
                        <span>{song.genre}</span>
                      </div>
                    </div>

                    {/* Individual Song Price */}
                    <div className="text-right">
                      <div className="font-bold text-reggae-green">
                        {formatPrice(song.price)}
                      </div>
                      <PurchaseButton
                        item={song}
                        itemType="song"
                        size="sm"
                        variant="outline"
                        className="mt-2"
                      />
                    </div>

                    {/* Play Button */}
                    <button className="w-12 h-12 bg-reggae-green text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                      <Play size={20} className="ml-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Related Albums */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <h2 className="text-3xl font-bold font-serif text-reggae-dark mb-8">
            More Albums by {album.artist}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for related albums - would fetch from API */}
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-reggae-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="text-reggae-green" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">More Music Coming Soon</h3>
              <p className="text-gray-600 mb-4">
                Stay tuned for more conscious reggae albums from {album.artist}
              </p>
              <Link
                href="/albums"
                className="inline-flex items-center gap-2 text-reggae-green hover:text-green-600 font-semibold"
              >
                Browse All Albums
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}