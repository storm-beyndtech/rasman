'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { 
  Download, 
  Play, 
  Music, 
  Album as AlbumIcon, 
  Calendar,
  TrendingUp,
  Search,
} from 'lucide-react';
import { LoadingSpinner, ErrorMessage, EmptyState } from '@/components/UtilityComponents';
import SongCard from '@/components/SongCard';
import AlbumCard from '@/components/AlbumCard';
import { ISong, IAlbum, IPurchase } from '@/lib/models';

interface UserDashboardState {
  purchases: Array<IPurchase & { item: ISong | IAlbum }>;
  loading: boolean;
  error: string | null;
  filter: 'all' | 'songs' | 'albums';
  searchQuery: string;
  stats: {
    totalSongs: number;
    totalAlbums: number;
    totalSpent: number;
    recentPurchases: number;
  };
}

const DashboardPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [state, setState] = useState<UserDashboardState>({
    purchases: [],
    loading: true,
    error: null,
    filter: 'all',
    searchQuery: '',
    stats: {
      totalSongs: 0,
      totalAlbums: 0,
      totalSpent: 0,
      recentPurchases: 0,
    },
  });

  // Fetch user purchases
  const fetchPurchases = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/purchase');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch purchases');
      }

      const purchases = result.data.purchases;
      
      // Calculate stats
      const stats = {
        totalSongs: purchases.filter((p: any) => p.itemType === 'song').length,
        totalAlbums: purchases.filter((p: any) => p.itemType === 'album').length,
        totalSpent: purchases.reduce((total: number, p: any) => total + p.amount, 0),
        recentPurchases: purchases.filter((p: any) => {
          const purchaseDate = new Date(p.purchaseDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return purchaseDate >= thirtyDaysAgo;
        }).length,
      };

      setState(prev => ({
        ...prev,
        purchases,
        stats,
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

  useEffect(() => {
    if (isLoaded && user) {
      fetchPurchases();
    }
  }, [isLoaded, user]);

  // Filter purchases based on current filter and search
  const filteredPurchases = state.purchases.filter(purchase => {
    const matchesFilter = state.filter === 'all' || purchase.itemType === state.filter.slice(0, -1);
    const matchesSearch = state.searchQuery === '' || 
      purchase.item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      purchase.item.artist.toLowerCase().includes(state.searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Handle download
  const handleDownload = async (purchase: IPurchase & { item: ISong | IAlbum }) => {
    try {
      const response = await fetch(`/api/download/${purchase.itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemType: purchase.itemType,
          purchaseId: purchase._id,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Open download link in new tab
        window.open(result.data.downloadUrl, '_blank');
      } else {
        throw new Error(result.error || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again or contact support.');
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const fadeInVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h2>
          <button className="bg-reggae-green text-white px-6 py-3 rounded-full font-semibold">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInVariants}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-reggae-dark mb-4">
            Welcome back, {user.firstName || 'Music Lover'}!
          </h1>
          <p className="text-xl text-gray-600">
            Your personal music library and purchase history
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {[
            {
              title: 'Songs Owned',
              value: state.stats.totalSongs,
              icon: <Music size={32} />,
              color: 'bg-reggae-green',
              change: '+2 this month'
            },
            {
              title: 'Albums Owned',
              value: state.stats.totalAlbums,
              icon: <AlbumIcon size={32} />,
              color: 'bg-reggae-yellow',
              change: '+1 this month'
            },
            {
              title: 'Total Spent',
              value: formatCurrency(state.stats.totalSpent),
              icon: <TrendingUp size={32} />,
              color: 'bg-reggae-red',
              change: 'Lifetime'
            },
            {
              title: 'Recent Purchases',
              value: state.stats.recentPurchases,
              icon: <Calendar size={32} />,
              color: 'bg-gray-600',
              change: 'Last 30 days'
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInVariants}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.change}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-700">{stat.title}</h3>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          variants={fadeInVariants}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search your music..."
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-gray-100 rounded-full p-1">
              {[
                { key: 'all', label: 'All', count: state.purchases.length },
                { key: 'songs', label: 'Songs', count: state.stats.totalSongs },
                { key: 'albums', label: 'Albums', count: state.stats.totalAlbums },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setState(prev => ({ ...prev, filter: tab.key as any }))}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    state.filter === tab.key
                      ? 'bg-reggae-green text-white shadow-md'
                      : 'text-gray-600 hover:text-reggae-green'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {state.loading ? (
          <LoadingSpinner />
        ) : state.error ? (
          <ErrorMessage message={state.error} onRetry={fetchPurchases} />
        ) : filteredPurchases.length === 0 ? (
          <EmptyState
            icon={<Music className="text-gray-400" size={64} />}
            title={state.purchases.length === 0 ? "No Music Yet" : "No Results Found"}
            description={
              state.purchases.length === 0
                ? "Start building your reggae music collection by purchasing songs and albums."
                : "Try adjusting your search or filter criteria."
            }
            actionLabel="Browse Music"
            onAction={() => window.location.href = '/songs'}
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {filteredPurchases.map((purchase, index) => (
              <motion.div
                key={purchase._id}
                variants={fadeInVariants}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-6">
                  {/* Item Info */}
                  <div className="flex-1">
                    {purchase.itemType === 'song' ? (
                      <SongCard
                        song={purchase.item as ISong}
                        viewMode="list"
                        showPurchaseButton={false}
                        isOwned={true}
                        className="shadow-none bg-transparent p-0"
                      />
                    ) : (
                      <AlbumCard
                        album={purchase.item as IAlbum}
                        variant="compact"
                        showPurchaseButton={false}
                        isOwned={true}
                        className="shadow-none bg-transparent p-0"
                      />
                    )}
                  </div>

                  {/* Purchase Details */}
                  <div className="text-right space-y-2">
                    <div className="text-sm text-gray-500">
                      Purchased {formatDate(purchase.purchaseDate)}
                    </div>
                    <div className="font-semibold text-reggae-green">
                      {formatCurrency(purchase.amount)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(purchase)}
                        className="flex items-center gap-1 px-3 py-2 bg-reggae-green text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        <Download size={16} />
                        Download
                      </button>
                      <button className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                        <Play size={16} />
                        Play
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          variants={fadeInVariants}
          className="mt-16 bg-gradient-to-r from-reggae-green to-reggae-yellow rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Discover More Music</h3>
          <p className="text-white/90 mb-6">
            Continue building your conscious reggae collection with new releases and classic tracks
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/songs'}
              className="bg-white text-reggae-dark px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Songs
            </button>
            <button 
              onClick={() => window.location.href = '/albums'}
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-reggae-dark transition-colors"
            >
              View Albums
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;