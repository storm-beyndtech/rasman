"use client";

import React from "react";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
	Music,
	Disc,
	Users,
	BanknoteArrowDown,
	TrendingUp,
	Calendar,
	ShoppingBag,
	Loader2,
	ArrowUpRight,
	ArrowDownRight,
	Upload,
	Album,
	Eye,
} from "lucide-react";
import { useDashboardStats } from "../hooks/admin";

export default function AdminDashboard() {
	const { isLoaded, user } = useUser();
	const { data, isLoading, isError, error } = useDashboardStats();

	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center py-20 gap-2">
				<Loader2 className="w-8 h-8 text-reggae-green animate-spin" />
				<p className="text-gray-400">Loading user...</p>
			</div>
		);
	}

	if (!user) {
		return <RedirectToSignIn />;
	}

	// Optional: Keep client-side admin check as fallback
	if (user.publicMetadata?.role !== "admin") {
		return (
			<div className="text-center py-20 text-red-500">
				<p>Access denied. Admin privileges required.</p>
			</div>
		);
	}

	if (isError) {
		let message = "Failed to load dashboard data.";
		if (error?.message?.includes("401")) {
			message = "Unauthorized. Please log in as admin.";
		} else if (error?.message?.includes("403")) {
			message = "Access denied. Admin role required.";
		} else if (error?.message?.includes("500")) {
			message = "Server error. Please try again later.";
		}
		return (
			<div className="text-center py-20 text-red-500">
				<p>{message}</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center gap-2 py-20">
				<Loader2 className="w-8 h-8 text-reggae-green animate-spin" />
				<p className="text-gray-400">Loading Stats...</p>
			</div>
		);
	}

	const stats = data?.stats || {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalRevenue: 0,
		recentSales: 0,
		monthlyGrowth: 0,
		activeSessions: 0,
	};
	const recentActivity = data?.recentActivity || [];

	const formatCurrency = (amount: number = 0): string => {
		return `₦${amount.toLocaleString()}`;
	};

	const formatPercentage = (value: number = 0): string => {
		return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
	};

	const statsCards = [
		{
			title: "Total Revenue",
			value: formatCurrency(stats.totalRevenue),
			change: formatPercentage(stats.monthlyGrowth),
			icon: <BanknoteArrowDown size={24} strokeWidth={1.2} />,
			color: "from-green-500/10 to-green-600/5 border-green-500/30",
			iconColor: "text-green-400",
			positive: stats.monthlyGrowth >= 0,
		},
		{
			title: "Total Users",
			value: (stats.totalUsers || 0).toLocaleString(),
			change: "Platform users",
			icon: <Users size={24} strokeWidth={1.2} />,
			color: "from-blue-500/10 to-blue-600/5 border-blue-500/30",
			iconColor: "text-blue-400",
			positive: true,
		},
		{
			title: "Songs Published",
			value: stats.totalSongs || 0,
			change: "Total tracks",
			icon: <Music size={24} strokeWidth={1.2} />,
			color: "from-reggae-green/10 to-green-600/5 border-reggae-green/30",
			iconColor: "text-reggae-green",
			positive: true,
		},
		{
			title: "Albums Published",
			value: stats.totalAlbums || 0,
			change: "Total albums",
			icon: <Disc size={24} strokeWidth={1.2} />,
			color: "from-purple-500/10 to-purple-600/5 border-purple-500/30",
			iconColor: "text-purple-400",
			positive: true,
		},
		{
			title: "Recent Sales",
			value: stats.recentSales || 0,
			change: "Last 7 days",
			icon: <ShoppingBag size={24} strokeWidth={1.2} />,
			color: "from-yellow-500/10 to-yellow-600/5 border-yellow-500/30",
			iconColor: "text-yellow-400",
			positive: true,
		},
		{
			title: "Active Sessions",
			value: stats.activeSessions || 0,
			change: "Currently online",
			icon: <Eye size={24} strokeWidth={1.2} />,
			color: "from-orange-500/10 to-orange-600/5 border-orange-500/30",
			iconColor: "text-orange-400",
			positive: true,
		},
	];

	return (
		<div className="space-y-20">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{statsCards.map((stat, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className={`font-montserrat group bg-transparent backdrop-blur-sm border rounded-2xl p-6 hover:scale-[1.02] transition-all duration-500 hover:shadow-xl ${stat.color}`}
					>
						<div
							className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${stat.color}`}
						/>
						<div className="relative z-10">
							<div className="flex items-center justify-between mb-4">
								<div
									className={`w-14 h-14 rounded-xl bg-stone-900/40 backdrop-blur-sm border border-gray-700/30 flex items-center justify-center ${stat.iconColor}`}
								>
									{stat.icon}
								</div>
								<div
									className={`flex items-center gap-1 ${stat.positive ? "text-emerald-500" : "text-red-400"}`}
								>
									{stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
									<span className="text-sm font-medium">{stat.change}</span>
								</div>
							</div>
							<div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
							<div className="font-medium text-sm text-white/50 group-hover:text-white transition-colors duration-300">
								{stat.title}
							</div>
						</div>
					</motion.div>
				))}
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
				{/* Recent Activity */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7 }}
					className="h-[500px] overflow-y-scroll hide-scrollbar xl:col-span-2 bg-transparent backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6"
				>
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-xl font-bold text-white">Recent Activity</h3>
					</div>
					{recentActivity.length > 0 ? (
						<div className="space-y-4">
							{recentActivity.slice(0, 6).map((activity: any) => (
								<div
									key={activity.id}
									className="flex items-center gap-4 p-4 bg-stone-900/10 rounded-xl border border-gray-700/20 hover:border-gray-600/30 transition-all duration-200"
								>
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center ${
											activity.type === "purchase"
												? "bg-emerald-500/20 text-green-400"
												: activity.type === "upload"
												? "bg-blue-500/20 text-blue-400"
												: "bg-purple-500/20 text-purple-400"
										}`}
									>
										{activity.type === "purchase" ? (
											<BanknoteArrowDown size={18} />
										) : activity.type === "upload" ? (
											<Music size={18} />
										) : (
											<Users size={18} />
										)}
									</div>
									<div className="flex-1 min-w-0 space-y-1">
										<p className="font-medium text-sm text-white truncate">{activity.description}</p>
										<p className="text-xs text-stone-600">{activity.timestamp}</p>
									</div>
									{activity.amount && (
										<div>
											<div
												className={`text-sm font-semibold ${
													activity.status === "pending" ? "text-orange-300" : "text-green-300"
												}`}
											>
												{formatCurrency(activity.amount)}
											</div>
											<div
												className={`text-[10px] font-medium ${
													activity.status === "pending" ? "text-gray-400" : "text-gray-400"
												}`}
											>
												{activity.status}
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
								<Calendar className="w-8 h-8 text-gray-500" />
							</div>
							<h4 className="text-lg font-semibold text-gray-300 mb-2">No Activity Yet</h4>
							<p className="text-gray-500 text-sm max-w-xs mx-auto">
								Activity will appear here as users upload content, make purchases, and interact with the
								platform.
							</p>
						</div>
					)}
				</motion.div>

				{/* Performance Summary */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
					className="bg-transparent backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6"
				>
					<h3 className="text-xl font-bold text-white mb-6">Performance Metrics</h3>
					<div className="space-y-6">
						<div>
							<div className="flex items-center justify-between mb-3">
								<span className="text-xs font-medium text-gray-300">Monthly Revenue Goal</span>
								<span className="text-xs font-semibold text-white">
									{formatCurrency(stats.totalRevenue)} / ₦500,000
								</span>
							</div>
							<div className="w-full bg-gray-700/30 rounded-full h-1">
								<div
									className="bg-gradient-to-r from-reggae-red via-reggae-yellow to-reggae-green h-2 rounded-full transition-all duration-500"
									style={{ width: `${Math.min((stats.totalRevenue / 500000) * 100, 100)}%` }}
								/>
							</div>
							<p className="text-xs text-gray-500 mt-2">
								{((stats.totalRevenue / 500000) * 100).toFixed(1)}% of monthly target
							</p>
						</div>
						<div>
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-medium text-gray-300">User Growth</span>
								<span className="text-sm font-semibold text-white">{stats.totalUsers} / 1,000</span>
							</div>
							<div className="w-full bg-gray-700/30 rounded-full h-2">
								<div
									className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
									style={{ width: `${Math.min((stats.totalUsers / 1000) * 100, 100)}%` }}
								/>
							</div>
							<p className="text-xs text-gray-500 mt-2">
								{((stats.totalUsers / 1000) * 100).toFixed(1)}% of user target
							</p>
						</div>
						<div>
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-medium text-gray-300">Content Library</span>
								<span className="text-sm font-semibold text-white">
									{(stats.totalSongs || 0) + (stats.totalAlbums || 0)} items
								</span>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div className="bg-black/30 rounded-lg p-3 border border-gray-700/20">
									<div className="flex items-center gap-2 mb-2">
										<Music size={14} className="text-reggae-green" />
										<span className="text-xs text-gray-400">Songs</span>
									</div>
									<p className="text-lg font-bold text-white">{stats.totalSongs || 0}</p>
								</div>
								<div className="bg-black/30 rounded-lg p-3 border border-gray-700/20">
									<div className="flex items-center gap-2 mb-2">
										<Disc size={14} className="text-purple-400" />
										<span className="text-xs text-gray-400">Albums</span>
									</div>
									<p className="text-lg font-bold text-white">{stats.totalAlbums || 0}</p>
								</div>
							</div>
						</div>
						<div className="pt-4 border-t border-gray-700/30">
							<h4 className="text-sm font-semibold text-gray-300 mb-4">Quick Actions</h4>
							<div className="grid grid-cols-2 sm:gap-3 gap-2 text-nowrap">
								<motion.button
									className="w-full flex items-center gap-2 p-2 bg-reggae-green/10 border border-reggae-green/20 rounded-lg text-reggae-green hover:bg-reggae-green/20 transition-all duration-300 sm:text-sm text-xs font-medium"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Upload size={14} className="flex-shrink-0" />
									Upload Content
								</motion.button>
								<motion.button
									className="w-full flex items-center gap-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all duration-300 sm:text-sm text-xs font-medium"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Album size={14} className="flex-shrink-0" />
									Manage Content
								</motion.button>
							</div>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Platform Status */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.9 }}
				className="bg-transparent backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6"
			>
				<h3 className="text-xl font-bold text-white mb-6">Platform Status</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					<div className="text-center">
						<div className="w-14 h-14 mx-auto mb-3 bg-emerald-500/10 rounded-full flex items-center justify-center">
							<div className="w-6 h-6 bg-emerald-500 rounded-full animate-pulse" />
						</div>
						<p className="text-sm text-gray-400 mb-1">Server Status</p>
						<p className="font-semibold text-emerald-400">Online</p>
					</div>
					<div className="text-center">
						<div className="w-14 h-14 mx-auto mb-3 bg-blue-500/10 rounded-full flex items-center justify-center">
							<TrendingUp className="w-6 h-6 text-blue-400" />
						</div>
						<p className="text-sm text-gray-400 mb-1">Response Time</p>
						<p className="font-semibold text-white">~120ms</p>
					</div>
					<div className="text-center">
						<div className="w-14 h-14 mx-auto mb-3 bg-reggae-green/10 rounded-full flex items-center justify-center">
							<ShoppingBag className="w-6 h-6 text-reggae-green" />
						</div>
						<p className="text-sm text-gray-400 mb-1">Daily Activity</p>
						<p className="font-semibold text-white">{stats.recentSales || 0}</p>
					</div>
					<div className="text-center">
						<div className="w-14 h-14 mx-auto mb-3 bg-purple-500/10 rounded-full flex items-center justify-center">
							<Users className="w-6 h-6 text-purple-400" />
						</div>
						<p className="text-sm text-gray-400 mb-1">Active Users</p>
						<p className="font-semibold text-white">{stats.activeSessions || 0}</p>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
