'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Download,
  Heart,
  Maximize2,
  Minimize2,
  Shuffle,
  Repeat
} from 'lucide-react';
import Image from 'next/image';
import { ISong } from '@/lib/models';

interface AudioPlayerProps {
  currentSong: ISong | null;
  playlist: ISong[];
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSongSelect: (song: ISong) => void;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentSong,
  playlist,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSongSelect,
  className = ''
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [loading, setLoading] = useState(false);

  // Update audio element when song changes
  useEffect(() => {
    if (audioRef.current && currentSong) {
      setLoading(true);
      // In a real app, this would be a signed URL from your backend
      // audioRef.current.src = currentSong.streamUrl;
      audioRef.current.load();
    }
  }, [currentSong]);

  // Handle play/pause state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Time update handler
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Duration change handler
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setLoading(false);
    }
  };

  // Seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Volume handler
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  // Mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Format time display
  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle song end
  const handleEnded = () => {
    if (repeatMode === 'one' && currentSong) {
      // Repeat current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === 'all' || playlist.length > 1) {
      onNext();
    } else {
      onPause();
    }
  };

  // Toggle repeat mode
  const toggleRepeat = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  if (!currentSong) {
    return null;
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Player Container */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 ${className}`}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-br from-reggae-dark to-gray-900 text-white p-6"
            >
              {/* Expanded Player Content */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Album Art */}
                  <div className="text-center">
                    <div className="relative w-64 h-64 mx-auto mb-6">
                      <Image
                        src={currentSong.coverArtUrl}
                        alt={currentSong.title}
                        fill
                        className="object-cover rounded-2xl shadow-2xl"
                      />
                    </div>
                  </div>

                  {/* Song Info and Controls */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{currentSong.title}</h2>
                      <p className="text-xl text-gray-300">{currentSong.artist}</p>
                      <p className="text-reggae-green">{currentSong.genre}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-6">
                      <button
                        onClick={() => setIsShuffling(!isShuffling)}
                        className={`p-2 rounded-full transition-colors ${
                          isShuffling ? 'text-reggae-green' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Shuffle size={20} />
                      </button>

                      <button
                        onClick={onPrevious}
                        className="p-3 rounded-full hover:bg-white/10 transition-colors"
                        disabled={playlist.length <= 1}
                      >
                        <SkipBack size={24} />
                      </button>

                      <button
                        onClick={isPlaying ? onPause : onPlay}
                        className="w-16 h-16 bg-reggae-green rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isPlaying ? (
                          <Pause size={32} />
                        ) : (
                          <Play size={32} className="ml-1" />
                        )}
                      </button>

                      <button
                        onClick={onNext}
                        className="p-3 rounded-full hover:bg-white/10 transition-colors"
                        disabled={playlist.length <= 1}
                      >
                        <SkipForward size={24} />
                      </button>

                      <button
                        onClick={toggleRepeat}
                        className={`p-2 rounded-full transition-colors ${
                          repeatMode !== 'none' ? 'text-reggae-green' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Repeat size={20} />
                        {repeatMode === 'one' && (
                          <span className="text-xs absolute -mt-1 ml-1">1</span>
                        )}
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <Download size={18} />
                        Download
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <Heart size={18} />
                        Like
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Player */}
        <div className="flex items-center gap-4 p-4">
          {/* Song Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={currentSong.coverArtUrl}
                alt={currentSong.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 truncate">{currentSong.title}</h4>
              <p className="text-sm text-gray-600 truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={onPrevious}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={playlist.length <= 1}
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={isPlaying ? onPause : onPlay}
              className="w-12 h-12 bg-reggae-green rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={20} className="text-white" />
              ) : (
                <Play size={20} className="text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={playlist.length <= 1}
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
            <span className="text-xs text-gray-500 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${progressPercentage}%, #d1d5db ${progressPercentage}%, #d1d5db 100%)`
                }}
              />
            </div>
            <span className="text-xs text-gray-500 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Volume Control */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden px-4 pb-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #22c55e 0%, #22c55e ${progressPercentage}%, #d1d5db ${progressPercentage}%, #d1d5db 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </motion.div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          height: 4px;
          border-radius: 2px;
        }

        .slider::-moz-range-track {
          height: 4px;
          border-radius: 2px;
        }
      `}</style>
    </>
  );
};

export default AudioPlayer;