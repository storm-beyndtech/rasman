'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Music, Image as ImageIcon, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadFormState {
  activeTab: 'song' | 'album';
  songForm: {
    title: string;
    artist: string;
    genre: string;
    duration: number;
    price: number;
    featured: boolean;
    audioFile: File | null;
    coverFile: File | null;
  };
  albumForm: {
    title: string;
    artist: string;
    price: number;
    description: string;
    featured: boolean;
    coverFile: File | null;
    songs: Array<{
      title: string;
      duration: number;
      price: number;
      audioFile: File | null;
    }>;
  };
  uploading: boolean;
  uploadProgress: number;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage: string;
}

const AdminUploadForm: React.FC = () => {
  const [state, setState] = useState<UploadFormState>({
    activeTab: 'song',
    songForm: {
      title: '',
      artist: 'Rasman Peter Dudu',
      genre: 'Reggae',
      duration: 0,
      price: 0,
      featured: false,
      audioFile: null,
      coverFile: null,
    },
    albumForm: {
      title: '',
      artist: 'Rasman Peter Dudu',
      price: 0,
      description: '',
      featured: false,
      coverFile: null,
      songs: [],
    },
    uploading: false,
    uploadProgress: 0,
    uploadStatus: 'idle',
    errorMessage: '',
  });

  // Handle file selection
  const handleFileSelect = (type: 'audio' | 'cover', file: File, songIndex?: number) => {
    if (state.activeTab === 'song') {
      setState(prev => ({
        ...prev,
        songForm: {
          ...prev.songForm,
          [type === 'audio' ? 'audioFile' : 'coverFile']: file
        }
      }));
    } else {
      if (type === 'audio' && songIndex !== undefined) {
        setState(prev => ({
          ...prev,
          albumForm: {
            ...prev.albumForm,
            songs: prev.albumForm.songs.map((song, index) =>
              index === songIndex ? { ...song, audioFile: file } : song
            )
          }
        }));
      } else if (type === 'cover') {
        setState(prev => ({
          ...prev,
          albumForm: {
            ...prev.albumForm,
            coverFile: file
          }
        }));
      }
    }
  };

  // Add song to album
  const addSongToAlbum = () => {
    setState(prev => ({
      ...prev,
      albumForm: {
        ...prev.albumForm,
        songs: [
          ...prev.albumForm.songs,
          {
            title: '',
            duration: 0,
            price: 0,
            audioFile: null,
          }
        ]
      }
    }));
  };

  // Remove song from album
  const removeSongFromAlbum = (index: number) => {
    setState(prev => ({
      ...prev,
      albumForm: {
        ...prev.albumForm,
        songs: prev.albumForm.songs.filter((_, i) => i !== index)
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ 
      ...prev, 
      uploading: true, 
      uploadStatus: 'uploading',
      uploadProgress: 0,
      errorMessage: ''
    }));

    try {
      const formData = new FormData();
      
      if (state.activeTab === 'song') {
        const { songForm } = state;
        
        // Validate required fields
        if (!songForm.title || !songForm.audioFile || !songForm.coverFile) {
          throw new Error('Please fill all required fields and select files');
        }

        // Append form data
        formData.append('type', 'song');
        formData.append('title', songForm.title);
        formData.append('artist', songForm.artist);
        formData.append('genre', songForm.genre);
        formData.append('duration', songForm.duration.toString());
        formData.append('price', songForm.price.toString());
        formData.append('featured', songForm.featured.toString());
        formData.append('audioFile', songForm.audioFile);
        formData.append('coverFile', songForm.coverFile);

      } else {
        const { albumForm } = state;
        
        // Validate required fields
        if (!albumForm.title || !albumForm.coverFile || albumForm.songs.length === 0) {
          throw new Error('Please fill all required fields and add at least one song');
        }

        // Append album data
        formData.append('type', 'album');
        formData.append('title', albumForm.title);
        formData.append('artist', albumForm.artist);
        formData.append('price', albumForm.price.toString());
        formData.append('description', albumForm.description);
        formData.append('featured', albumForm.featured.toString());
        formData.append('coverFile', albumForm.coverFile);
        
        // Append songs data
        albumForm.songs.forEach((song, index) => {
          if (!song.title || !song.audioFile) {
            throw new Error(`Song ${index + 1}: Please fill all required fields`);
          }
          formData.append(`songs[${index}][title]`, song.title);
          formData.append(`songs[${index}][duration]`, song.duration.toString());
          formData.append(`songs[${index}][price]`, song.price.toString());
          formData.append(`songs[${index}][audioFile]`, song.audioFile);
        });
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 10, 90)
        }));
      }, 200);

      // Upload to server
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setState(prev => ({
        ...prev,
        uploadProgress: 100,
        uploadStatus: 'success',
        uploading: false
      }));

      // Reset form after success
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          songForm: {
            title: '',
            artist: 'Rasman Peter Dudu',
            genre: 'Reggae',
            duration: 0,
            price: 0,
            featured: false,
            audioFile: null,
            coverFile: null,
          },
          albumForm: {
            title: '',
            artist: 'Rasman Peter Dudu',
            price: 0,
            description: '',
            featured: false,
            coverFile: null,
            songs: [],
          },
          uploadStatus: 'idle',
          uploadProgress: 0
        }));
      }, 3000);

    } catch (error) {
      setState(prev => ({
        ...prev,
        uploading: false,
        uploadStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Upload failed',
        uploadProgress: 0
      }));
    }
  };

  const fadeInVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Tab Selection */}
      <motion.div
        variants={fadeInVariants}
        className="bg-white rounded-2xl shadow-lg p-2"
      >
        <div className="flex gap-2">
          <button
            onClick={() => setState(prev => ({ ...prev, activeTab: 'song' }))}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
              state.activeTab === 'song'
                ? 'bg-reggae-green text-white shadow-md'
                : 'text-gray-600 hover:text-reggae-green'
            }`}
          >
            <Music size={20} />
            Upload Song
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, activeTab: 'album' }))}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
              state.activeTab === 'album'
                ? 'bg-reggae-green text-white shadow-md'
                : 'text-gray-600 hover:text-reggae-green'
            }`}
          >
            <ImageIcon size={20} />
            Upload Album
          </button>
        </div>
      </motion.div>

      {/* Upload Form */}
      <motion.div
        key={state.activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {state.activeTab === 'song' ? (
            // Song Upload Form
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Song Title *
                  </label>
                  <input
                    type="text"
                    value={state.songForm.title}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      songForm: { ...prev.songForm, title: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                    placeholder="Enter song title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist
                  </label>
                  <input
                    type="text"
                    value={state.songForm.artist}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      songForm: { ...prev.songForm, artist: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <select
                    value={state.songForm.genre}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      songForm: { ...prev.songForm, genre: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                  >
                    <option value="Reggae">Reggae</option>
                    <option value="Roots">Roots</option>
                    <option value="Dancehall">Dancehall</option>
                    <option value="Dub">Dub</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={state.songForm.duration}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      songForm: { ...prev.songForm, duration: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    value={state.songForm.price}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      songForm: { ...prev.songForm, price: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured-song"
                    checked={state.songForm.featured}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      songForm: { ...prev.songForm, featured: e.target.checked }
                    }))}
                    className="w-4 h-4 text-reggae-green bg-gray-100 border-gray-300 rounded focus:ring-reggae-green focus:ring-2"
                  />
                  <label htmlFor="featured-song" className="ml-2 text-sm font-medium text-gray-700">
                    Featured Song
                  </label>
                </div>
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audio File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-reggae-green transition-colors">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect('audio', file);
                      }}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      {state.songForm.audioFile ? (
                        <p className="text-sm text-gray-600">{state.songForm.audioFile.name}</p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600">Click to upload audio file</p>
                          <p className="text-xs text-gray-500 mt-1">MP3, WAV, FLAC up to 50MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Cover Art Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Art *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-reggae-green transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect('cover', file);
                      }}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      {state.songForm.coverFile ? (
                        <p className="text-sm text-gray-600">{state.songForm.coverFile.name}</p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600">Click to upload cover art</p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Album Upload Form
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Album Title *
                  </label>
                  <input
                    type="text"
                    value={state.albumForm.title}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      albumForm: { ...prev.albumForm, title: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                    placeholder="Enter album title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist
                  </label>
                  <input
                    type="text"
                    value={state.albumForm.artist}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      albumForm: { ...prev.albumForm, artist: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Album Price (₦)
                  </label>
                  <input
                    type="number"
                    value={state.albumForm.price}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      albumForm: { ...prev.albumForm, price: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured-album"
                    checked={state.albumForm.featured}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      albumForm: { ...prev.albumForm, featured: e.target.checked }
                    }))}
                    className="w-4 h-4 text-reggae-green bg-gray-100 border-gray-300 rounded focus:ring-reggae-green focus:ring-2"
                  />
                  <label htmlFor="featured-album" className="ml-2 text-sm font-medium text-gray-700">
                    Featured Album
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={state.albumForm.description}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    albumForm: { ...prev.albumForm, description: e.target.value }
                  }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                  placeholder="Enter album description"
                />
              </div>

              {/* Album Cover Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Album Cover *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-reggae-green transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect('cover', file);
                    }}
                    className="hidden"
                    id="album-cover-upload"
                  />
                  <label htmlFor="album-cover-upload" className="cursor-pointer">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    {state.albumForm.coverFile ? (
                      <p className="text-sm text-gray-600">{state.albumForm.coverFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">Click to upload album cover</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Songs Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Album Songs</h3>
                  <button
                    type="button"
                    onClick={addSongToAlbum}
                    className="flex items-center gap-2 px-4 py-2 bg-reggae-green text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Music size={18} />
                    Add Song
                  </button>
                </div>

                <div className="space-y-4">
                  {state.albumForm.songs.map((song, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Song {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeSongFromAlbum(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Song Title *
                          </label>
                          <input
                            type="text"
                            value={song.title}
                            onChange={(e) => setState(prev => ({
                              ...prev,
                              albumForm: {
                                ...prev.albumForm,
                                songs: prev.albumForm.songs.map((s, i) =>
                                  i === index ? { ...s, title: e.target.value } : s
                                )
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                            placeholder="Enter song title"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (seconds)
                          </label>
                          <input
                            type="number"
                            value={song.duration}
                            onChange={(e) => setState(prev => ({
                              ...prev,
                              albumForm: {
                                ...prev.albumForm,
                                songs: prev.albumForm.songs.map((s, i) =>
                                  i === index ? { ...s, duration: parseInt(e.target.value) || 0 } : s
                                )
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price (₦)
                          </label>
                          <input
                            type="number"
                            value={song.price}
                            onChange={(e) => setState(prev => ({
                              ...prev,
                              albumForm: {
                                ...prev.albumForm,
                                songs: prev.albumForm.songs.map((s, i) =>
                                  i === index ? { ...s, price: parseFloat(e.target.value) || 0 } : s
                                )
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* Audio File Upload for Song */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Audio File *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-reggae-green transition-colors">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect('audio', file, index);
                            }}
                            className="hidden"
                            id={`song-audio-${index}`}
                          />
                          <label htmlFor={`song-audio-${index}`} className="cursor-pointer">
                            <Music className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            {song.audioFile ? (
                              <p className="text-sm text-gray-600">{song.audioFile.name}</p>
                            ) : (
                              <p className="text-sm text-gray-600">Click to upload audio file</p>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Upload Progress */}
          {state.uploading && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm text-gray-500">{state.uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-reggae-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {state.uploadStatus === 'success' && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle size={20} />
              <span>Upload completed successfully!</span>
            </div>
          )}

          {state.uploadStatus === 'error' && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle size={20} />
              <span>{state.errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={state.uploading}
              className="flex items-center gap-2 px-8 py-4 bg-reggae-green text-white rounded-full font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload size={20} />
              {state.uploading ? 'Uploading...' : `Upload ${state.activeTab === 'song' ? 'Song' : 'Album'}`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminUploadForm;