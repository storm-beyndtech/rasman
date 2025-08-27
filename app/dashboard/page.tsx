"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Album as AlbumIcon, Calendar, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { ISong, IAlbum, IPurchase } from "@/lib/models";
import { useToast } from "@/context/ToastProvider";
import StatsCard from "@/components/dashboard/StatsCard";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import PurchaseItemCard from "@/components/dashboard/PurchaseItemCard";

interface UserDashboardState {
	purchases: Array<IPurchase & { item: ISong | IAlbum }>;
	loading: boolean;
	error: string | null;
	filter: "all" | "songs" | "albums";
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
	const { showToast } = useToast();
	const searchParams = useSearchParams();
	const purchaseSuccess = searchParams.get("purchase") === "success";

	const [state, setState] = useState<UserDashboardState>({
		purchases: [],
		loading: true,
		error: null,
		filter: "all",
		searchQuery: "",
		stats: {
			totalSongs: 0,
			totalAlbums: 0,
			totalSpent: 0,
			recentPurchases: 0,
		},
	});

	// Show success message if redirected from payment
	useEffect(() => {
		if (purchaseSuccess) {
			showToast("Purchase successful! Your music is now available.", "success");
			// Clean URL
			window.history.replaceState({}, "", "/dashboard");
		}
	}, [purchaseSuccess, showToast]);

	// Fetch user purchases
	const fetchPurchases = async () => {
		setState((prev) => ({ ...prev, loading: true, error: null }));

		try {
			const response = await fetch("/api/purchase?status=completed");
			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || "Failed to fetch purchases");
			}

			const purchases = result.data?.purchases || [];

			// Calculate stats
			const stats = {
				totalSongs: purchases.filter((p: any) => p.itemType === "song").length,
				totalAlbums: purchases.filter((p: any) => p.itemType === "album").length,
				totalSpent: purchases.reduce((total: number, p: any) => total + (p.amount || 0), 0),
				recentPurchases: purchases.filter((p: any) => {
					const purchaseDate = new Date(p.purchaseDate);
					const thirtyDaysAgo = new Date();
					thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
					return purchaseDate >= thirtyDaysAgo;
				}).length,
			};

			setState((prev) => ({
				...prev,
				purchases,
				stats,
				loading: false,
			}));
		} catch (error) {
			console.error("Error fetching purchases:", error);
			setState((prev) => ({
				...prev,
				error: error instanceof Error ? error.message : "Failed to load your music library",
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
	const filteredPurchases = state.purchases.filter((purchase) => {
		const matchesFilter = state.filter === "all" || purchase.itemType === state.filter.slice(0, -1);
		const matchesSearch =
			state.searchQuery === "" ||
			purchase.item?.title?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
			purchase.item?.artist?.toLowerCase().includes(state.searchQuery.toLowerCase());

		return matchesFilter && matchesSearch;
	});

	// Handle download
	const handleDownload = async (purchase: IPurchase & { item: ISong | IAlbum }) => {
		try {
			showToast("Preparing download...", "info");

			const response = await fetch(`/api/download/${purchase.itemId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					itemType: purchase.itemType,
					purchaseId: purchase._id,
				}),
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || "Download failed");
			}

			// Handle single song download
			if (purchase.itemType === "song" && result.data.downloadLinks[0]) {
				const link = document.createElement("a");
				link.href = result.data.downloadLinks[0].downloadUrl;
				link.download = `${purchase.item.artist} - ${purchase.item.title}.mp3`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				showToast("Download started!", "success");
			}

			// Handle album download
			if (purchase.itemType === "album" && result.data.downloadLinks) {
				result.data.downloadLinks.forEach((song: any, index: number) => {
					setTimeout(() => {
						const link = document.createElement("a");
						link.href = song.downloadUrl;
						link.download = `${song.artist} - ${song.title}.mp3`;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
					}, index * 1000); // 1 second delay between downloads
				});
				showToast("Album download started!", "success");
			}
		} catch (error) {
			console.error("Download error:", error);
			showToast(error instanceof Error ? error.message : "Download failed. Please try again.", "error");
		}
	};

	// Format currency
	const formatCurrency = (amount: number): string => {
		return `₦${amount.toLocaleString()}`;
	};

	// Loading state
	if (!isLoaded) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-12 h-12 text-reggae-green animate-spin mx-auto mb-4" />
					<p className="text-gray-400">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	// Not authenticated state
	if (!user) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center px-4">
				<div className="text-center bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-8">
					<h2 className="text-2xl font-bold text-white mb-4">Please sign in to view your dashboard</h2>
					<p className="text-gray-400 mb-6">Access your music library and purchase history</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black pt-24 pb-20">
			<div className="container mx-auto px-4">
				{/* Header */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
						Welcome back, <span className="text-reggae-green">{user.firstName || "Music Lover"}</span>!
					</h1>
					<p className="text-xl text-gray-400">Your personal music library and purchase history</p>
				</motion.div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<StatsCard
						title="Songs Owned"
						value={state.stats.totalSongs}
						icon={<Music size={24} />}
						color="green"
						change="Lifetime collection"
						index={0}
					/>
					<StatsCard
						title="Albums Owned"
						value={state.stats.totalAlbums}
						icon={<AlbumIcon size={24} />}
						color="yellow"
						change="Full albums"
						index={1}
					/>
					<StatsCard
						title="Total Invested"
						value={formatCurrency(state.stats.totalSpent)}
						icon={<TrendingUp size={24} />}
						color="red"
						change="Supporting the artist"
						index={2}
					/>
					<StatsCard
						title="Recent Purchases"
						value={state.stats.recentPurchases}
						icon={<Calendar size={24} />}
						color="gray"
						change="Last 30 days"
						index={3}
					/>
				</div>

				{/* Filters */}
				<DashboardFilters
					searchQuery={state.searchQuery}
					onSearchChange={(query: any) => setState((prev) => ({ ...prev, searchQuery: query }))}
					activeFilter={state.filter}
					onFilterChange={(filter: any) => setState((prev) => ({ ...prev, filter }))}
					counts={{
						all: state.purchases.length,
						songs: state.stats.totalSongs,
						albums: state.stats.totalAlbums,
					}}
				/>

				{/* Content */}
				<AnimatePresence mode="wait">
					{state.loading ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex items-center justify-center py-20"
						>
							<div className="text-center">
								<Loader2 className="w-12 h-12 text-reggae-green animate-spin mx-auto mb-4" />
								<p className="text-gray-400">Loading your music library...</p>
							</div>
						</motion.div>
					) : state.error ? (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="text-center py-20"
						>
							<div className="bg-black/20 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
								<div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
									<div className="text-red-500">⚠️</div>
								</div>
								<h3 className="text-xl font-bold text-white mb-4">Something went wrong</h3>
								<p className="text-gray-400 mb-6">{state.error}</p>
								<button
									onClick={fetchPurchases}
									className="inline-flex items-center gap-2 bg-reggae-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300"
								>
									<RefreshCw size={18} />
									Try Again
								</button>
							</div>
						</motion.div>
					) : filteredPurchases.length === 0 ? (
						<DashboardEmptyState
							type={state.purchases.length === 0 ? "no-purchases" : "no-results"}
							searchQuery={state.searchQuery}
						/>
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="space-y-4"
						>
							{filteredPurchases.map((purchase, index) => (
								<PurchaseItemCard
									key={purchase._id}
									purchase={purchase}
									index={index}
									onDownload={handleDownload}
								/>
							))}
						</motion.div>
					)}
				</AnimatePresence>

				{/* Quick Actions CTA */}
				{!state.loading && !state.error && state.purchases.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
						className="mt-16 bg-gradient-to-r from-reggae-green/20 to-reggae-yellow/20 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center"
					>
						<div className="max-w-2xl mx-auto">
							<h3 className="text-2xl font-bold text-white mb-4">Discover More Conscious Music</h3>
							<p className="text-gray-300 mb-6">
								Continue building your reggae collection with Rasman's latest releases and timeless classics
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<motion.a
									href="/songs"
									className="inline-flex items-center gap-2 bg-reggae-green text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg group"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<Music size={20} />
									Browse New Songs
									<motion.div className="group-hover:translate-x-1 transition-transform duration-300">
										→
									</motion.div>
								</motion.a>

								<motion.a
									href="/albums"
									className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-black/30 transition-all duration-300 border border-white/20 hover:border-reggae-green/50"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									<AlbumIcon size={20} />
									View Albums
								</motion.a>
							</div>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default DashboardPage;
