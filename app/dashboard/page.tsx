"use client";

import type { IAlbum, IPurchase, ISong } from "@/lib/models";
import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Album as AlbumIcon, Calendar, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import PurchaseItemCard from "@/components/dashboard/PurchaseItemCard";
import { useToast } from "@/provider/ToastProvider";
import { useUserPurchases } from "../hooks/music";

const DashboardContent: React.FC = () => {
	const { user, isLoaded } = useUser();
	const { showToast } = useToast();
	const searchParams = useSearchParams();
	const purchaseSuccess = searchParams.get("purchase") === "success";

	const [filter, setFilter] = useState<"all" | "songs" | "albums">("all");
	const [searchQuery, setSearchQuery] = useState("");

	const { data, isLoading, error: purchasesError, refetch, isFetching } = useUserPurchases({
		status: "completed",
		limit: 200,
	});

	const purchases = useMemo(
		() => (data?.purchases || []) as Array<IPurchase & { item: ISong | IAlbum }>,
		[data?.purchases],
	);

	const stats = useMemo(() => {
		const totalSongs = purchases.filter((p) => p.itemType === "song").length;
		const totalAlbums = purchases.filter((p) => p.itemType === "album").length;
		const totalSpent = purchases.reduce((total, p) => total + (p.amount || 0), 0);
		const recentPurchases = purchases.filter((p) => {
			const purchaseDate = new Date(p.purchaseDate);
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
			return purchaseDate >= thirtyDaysAgo;
		}).length;

		return { totalSongs, totalAlbums, totalSpent, recentPurchases };
	}, [purchases]);

	useEffect(() => {
		if (purchaseSuccess) {
			showToast("Purchase successful! Your music is now available.", "success");
			window.history.replaceState({}, "", "/dashboard");
		}
	}, [purchaseSuccess, showToast]);

	const filteredPurchases = useMemo(
		() =>
			purchases.filter((purchase) => {
				const matchesFilter = filter === "all" || purchase.itemType === filter.slice(0, -1);
				const matchesSearch =
					searchQuery === "" ||
					purchase.item?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					purchase.item?.artist?.toLowerCase().includes(searchQuery.toLowerCase());

				return matchesFilter && matchesSearch;
			}),
		[purchases, filter, searchQuery],
	);

	const formatCurrency = (amount: number): string => `NGN ${amount.toLocaleString()}`;

	const isInitialLoading = isLoading && !data;

	if (!isLoaded || isInitialLoading) {
		return (
			<div className="min-h-screen bg-bg flex items-center justify-center">
				<div
					className="fixed inset-0 opacity-50 pointer-events-none"
					style={{
						backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
						backgroundSize: "80px 80px",
						backgroundAttachment: "fixed",
					}}
				/>
				<div className="text-center">
					<Loader2 className="w-12 h-12 text-reggae-green animate-spin mx-auto mb-4" />
					<p className="text-gray-400">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-bg flex items-center justify-center px-4">
				<div
					className="fixed inset-0 opacity-50 pointer-events-none"
					style={{
						backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
						backgroundSize: "80px 80px",
						backgroundAttachment: "fixed",
					}}
				/>
				<div className="text-center bg-black/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
					<h2 className="text-2xl font-bold text-white mb-4">Please sign in to view your dashboard</h2>
					<p className="text-gray-400 mb-6">Access your music library and purchase history</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-bg pt-24 pb-20 relative overflow-hidden">
			<div
				className="fixed inset-0 opacity-50 pointer-events-none"
				style={{
					backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
					backgroundSize: "80px 80px",
					backgroundAttachment: "fixed",
				}}
			/>

			<div className="container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-12 space-y-3"
				>
					<h1 className="text-3xl font-bold text-white">
						Welcome back, <span className="text-emerald-300">{user.firstName || "Music Lover"}!</span>
					</h1>
					<p className="font-mono font-light sm:text-lg text-stone-200/60">
						Your personal music library and purchase history
					</p>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<StatsCard
						title="Songs Owned"
						value={stats.totalSongs}
						icon={<Music size={24} />}
						color="green"
						change="Lifetime collection"
						index={0}
					/>
					<StatsCard
						title="Albums Owned"
						value={stats.totalAlbums}
						icon={<AlbumIcon size={24} />}
						color="yellow"
						change="Full albums"
						index={1}
					/>
					<StatsCard
						title="Total Invested"
						value={formatCurrency(stats.totalSpent)}
						icon={<TrendingUp size={24} />}
						color="red"
						change="Supporting the artist"
						index={2}
					/>
					<StatsCard
						title="Recent Purchases"
						value={stats.recentPurchases}
						icon={<Calendar size={24} />}
						color="gray"
						change="Last 30 days"
						index={3}
					/>
				</div>

				<DashboardFilters
					searchQuery={searchQuery}
					onSearchChange={(query: string) => setSearchQuery(query)}
					activeFilter={filter}
					onFilterChange={(selectedFilter: "all" | "songs" | "albums") => setFilter(selectedFilter)}
					counts={{
						all: purchases.length,
						songs: stats.totalSongs,
						albums: stats.totalAlbums,
					}}
				/>

				<AnimatePresence mode="wait">
					{isFetching && !purchases.length ? (
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
					) : purchasesError ? (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="text-center py-20"
						>
							<div className="bg-black/10 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
								<div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
									<div className="text-red-500">!!</div>
								</div>
								<h3 className="text-xl font-bold text-white mb-4">Something went wrong</h3>
								<p className="text-gray-400 mb-6">
									{purchasesError instanceof Error
										? purchasesError.message
										: "Failed to load your music library"}
								</p>
								<button
									onClick={() => refetch()}
									className="inline-flex items-center gap-2 bg-reggae-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300"
								>
									<RefreshCw size={18} />
									Try Again
								</button>
							</div>
						</motion.div>
					) : filteredPurchases.length === 0 ? (
						<DashboardEmptyState
							type={purchases.length === 0 ? "no-purchases" : "no-results"}
							searchQuery={searchQuery}
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
								/>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

const DashboardPage: React.FC = () => {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-bg flex items-center justify-center">
					<div
						className="fixed inset-0 opacity-50 pointer-events-none"
						style={{
							backgroundImage: `
								linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
								linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
							`,
							backgroundSize: "80px 80px",
							backgroundAttachment: "fixed",
						}}
					/>
					<div className="text-center">
						<Loader2 className="w-12 h-12 text-reggae-green animate-spin mx-auto mb-4" />
						<p className="text-gray-400">Loading dashboard...</p>
					</div>
				</div>
			}
		>
			<DashboardContent />
		</Suspense>
	);
};

export default DashboardPage;
