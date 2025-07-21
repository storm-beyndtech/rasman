'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Music, 
  Album as AlbumIcon, 
  DollarSign, 
  TrendingUp,
  Upload,
  Settings,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import AdminUploadForm from '@/components/admin/AdminUploadForm';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminContentManagement from '@/components/admin/AdminContentManagement';
import { LoadingSpinner, ErrorMessage } from '@/components/UtilityComponents';

interface AdminDashboardState {
  loading: boolean;
  error: string | null;
  activeTab: 'overview' | 'upload' | 'content' | 'users' | 'analytics';
  stats: {
    totalSongs: number;
    totalAlbums: number;
    totalUsers: number;
    totalRevenue: number;
    recentSales: number;
    monthlyGrowth: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'purchase' | 'upload' | 'user_signup';
    description: string;
    timestamp: string;
    amount?: number;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [state, setState] = useState<AdminDashboardState>({
    loading: true,
    error: null,
    activeTab: 'overview',
    stats: {
      totalSongs: 0,
      totalAlbums: 0,
      totalUsers: 0,
      totalRevenue: 0,
      recentSales: 0,
      monthlyGrowth: 0,
    },
    recentActivity: [],
  });

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Fetch admin dashboard data
  const fetchDashboardData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/admin/dashboard');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      setState(prev => ({
        ...prev,
        stats: result.data.stats,
        recentActivity: result.data.recentActivity,
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
    if (isLoaded && isAdmin) {
      fetchDashboardData();
    }
  }, [isLoaded, isAdmin]);

  // Navigation tabs
  const tabs = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={20} /> },
    { key: 'upload', label: 'Upload', icon: <Upload size={20} /> },
    { key: 'content', label: 'Content', icon: <Music size={20} /> },
    { key: 'users', label: 'Users', icon: <Users size={20} /> },
    { key: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
  ];

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString()}`;
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
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
          <h2 className="text-2xl font-bold mb-4">Please sign in to access admin dashboard</h2>
          <button className="bg-reggae-green text-white px-6 py-3 rounded-full font-semibold">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-reggae-green text-white px-6 py-3 rounded-full font-semibold"
          >
            Return Home
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
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-reggae-dark mb-2">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Manage your music platform and monitor performance
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex gap-3">
            <button className="flex items-center gap-2 bg-reggae-green text-white px-4 py-2 rounded-full font-semibold hover:bg-green-600 transition-colors">
              <Plus size={18} />
              Quick Upload
            </button>
            <button className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full font-semibold border hover:bg-gray-50 transition-colors">
              <Download size={18} />
              Export Data
            </button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          variants={fadeInVariants}
          className="bg-white rounded-2xl shadow-lg p-2 mb-8"
        >
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setState(prev => ({ ...prev, activeTab: tab.key as any }))}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  state.activeTab === tab.key
                    ? 'bg-reggae-green text-white shadow-md'
                    : 'text-gray-600 hover:text-reggae-green hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={state.activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {state.activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              {state.loading ? (
                <LoadingSpinner />
              ) : state.error ? (
                <ErrorMessage message={state.error} onRetry={fetchDashboardData} />
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {[
                    {
                      title: 'Total Revenue',
                      value: formatCurrency(state.stats.totalRevenue),
                      change: formatPercentage(state.stats.monthlyGrowth),
                      icon: <DollarSign size={32} />,
                      color: 'bg-green-500',
                      positive: state.stats.monthlyGrowth >= 0
                    },
                    {
                      title: 'Total Users',
                      value: state.stats.totalUsers.toLocaleString(),
                      change: '+12% this month',
                      icon: <Users size={32} />,
                      color: 'bg-blue-500',
                      positive: true
                    },
                    {
                      title: 'Songs Published',
                      value: state.stats.totalSongs,
                      change: '+3 this week',
                      icon: <Music size={32} />,
                      color: 'bg-reggae-green',
                      positive: true
                    },
                    {
                      title: 'Albums Published',
                      value: state.stats.totalAlbums,
                      change: '+1 this month',
                      icon: <AlbumIcon size={32} />,
                      color: 'bg-reggae-yellow',
                      positive: true
                    },
                    {
                      title: 'Recent Sales',
                      value: state.stats.recentSales,
                      change: 'Last 7 days',
                      icon: <TrendingUp size={32} />,
                      color: 'bg-purple-500',
                      positive: true
                    },
                    {
                      title: 'Active Sessions',
                      value: '24',
                      change: 'Currently online',
                      icon: <Eye size={32} />,
                      color: 'bg-orange-500',
                      positive: true
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
                        <div className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-gray-600 font-medium">
                        {stat.title}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Recent Activity */}
              <motion.div
                variants={fadeInVariants}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                  <button className="text-reggae-green hover:text-green-600 font-medium">
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {state.recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'purchase' ? 'bg-green-100 text-green-600' :
                        activity.type === 'upload' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'purchase' ? <DollarSign size={18} /> :
                         activity.type === 'upload' ? <Upload size={18} /> :
                         <Users size={18} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500">{activity.timestamp}</p>
                      </div>
                      {activity.amount && (
                        <div className="font-bold text-green-600">
                          {formatCurrency(activity.amount)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {state.activeTab === 'upload' && <AdminUploadForm />}
          {state.activeTab === 'content' && <AdminContentManagement />}
          {state.activeTab === 'users' && <AdminUserManagement />}
          {state.activeTab === 'analytics' && <AdminAnalytics />}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;