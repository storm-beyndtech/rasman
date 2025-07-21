'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List } from 'lucide-react';
import SongCard from '@/components/SongCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { ISong } from '@/lib/models';

interface SongsPageState {
  songs: ISong[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    genre: string;
    featured: boolean | null;
    minPrice: number | null;
    maxPrice: number | null;
    sortBy: string;
    sortOrder: string;
  };
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  viewMode: 'grid' | 'list';
}

const SongsPage: React.FC = () => {
  const [state, setState] = useState<SongsPageState>({
    songs: [],
    loading: true,
    error: null,
    filters: {
      search: '',
      genre: '',
      featured: null,
      minPrice: null,
      maxPrice: null,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    pagination: {
      page: 1,
      limit: 12,
      totalCount: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    viewMode: 'grid',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch songs
  const fetchSongs = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams();
      
      // Add filter parameters
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      // Add pagination parameters
      params.append('page', state.pagination.page.toString());
      params.append('limit', state.pagination.limit.toString());

      const response = await fetch(`/api/songs?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch songs');
      }

      setState(prev => ({
        ...prev,
        songs: result.data.songs,
        pagination: result.data.pagination,
        loading: false,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      }));
    }
  };

  // Effect to fetch songs when filters or pagination change
  useEffect(() => {
    fetchSongs();
  }, [state.filters, state.pagination.page]);

  // Handle search input with debounce
  const handleSearchChange = (value: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, search: value },
        pagination: { ...prev.pagination, page: 1 },
      }));
    }, 500);

    setSearchTimeout(timeout);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: {
        search: '',
        genre: '',
        featured: null,
        minPrice: null,
        maxPrice: null,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  const fadeInVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInVariants}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-serif text-reggae-dark mb-4">
            All Songs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the complete collection of conscious reggae music by Rasman Peter Dudu
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInVariants}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search songs, artists, or genres..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-reggae-green transition-colors"
              >
                <Filter size={20} />
                Filters
              </button>

              <div className="flex items-center gap-2 border rounded-lg p-1">
                <button
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                  className={`p-2 rounded ${state.viewMode === 'grid' ? 'bg-reggae-green text-white' : 'text-gray-400'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                  className={`p-2 rounded ${state.viewMode === 'list' ? 'bg-reggae-green text-white' : 'text-gray-400'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t pt-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                  <select
                    value={state.filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent"
                  >
                    <option value="">All Genres</option>
                    <option value="Reggae">Reggae</option>
                    <option value="Roots">Roots</option>
                    <option value="Dancehall">Dancehall</option>
                    <option value="Dub">Dub</option>
                  </select>
                </div>

                {/* Featured Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
                  <select
                    value={state.filters.featured === null ? '' : state.filters.featured.toString()}
                    onChange={(e) => handleFilterChange('featured', e.target.value === '' ? null : e.target.value === 'true')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent"
                  >
                    <option value="">All Songs</option>
                    <option value="true">Featured Only</option>
                    <option value="false">Non-Featured</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={state.filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent"
                  >
                    <option value="createdAt">Latest</option>
                    <option value="title">Title</option>
                    <option value="price">Price</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <select
                    value={state.filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-transparent"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-reggae-green transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        {state.loading ? (
          <LoadingSpinner />
        ) : state.error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">{state.error}</div>
            <button
              onClick={fetchSongs}
              className="bg-reggae-green text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : state.songs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No songs found</div>
            <button
              onClick={clearFilters}
              className="bg-reggae-green text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Songs Grid/List */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInVariants}
              transition={{ delay: 0.4 }}
              className={
                state.viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {state.songs.map((song, index) => (
                <motion.div
                  key={song._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SongCard 
                    song={song} 
                    viewMode={state.viewMode}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {state.pagination.totalPages > 1 && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInVariants}
                transition={{ delay: 0.6 }}
                className="mt-12"
              >
                <Pagination
                  currentPage={state.pagination.page}
                  totalPages={state.pagination.totalPages}
                  onPageChange={handlePageChange}
                  hasNext={state.pagination.hasNext}
                  hasPrev={state.pagination.hasPrev}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SongsPage;