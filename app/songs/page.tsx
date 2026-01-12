"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
	Search,
	Filter,
	Grid,
	List,
	ScanSearch,
	Star,
	Clock,
	Loader2,
	X,
	MicOff,
} from "lucide-react";
import SongCard from "@/components/SongCard";
import { useAudio } from "@/provider/AudioProvider";
import { useSongs } from "../hooks/songs";
import { ISong } from "@/lib/models";

const SongsPage: React.FC = () => {
	const { hasPurchased } = useAudio();

	// Simplified state management
	const [filters, setFilters] = useState({
		search: "",
		genre: "",
		featured: true,
		minPrice: null,
		maxPrice: null,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const [page, setPage] = useState(1);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [showFilters, setShowFilters] = useState(false);
	const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

	// TanStack Query hook replaces all fetch logic
	const { data, isLoading, error, isPlaceholderData, isFetching, refetch } = useSongs({
		...filters,
		page,
		limit: 12,
	});
	console.log(data);

	const songs = data?.songs || [];
	const pagination = data?.pagination || {
		page: 1,
		limit: 12,
		totalCount: 0,
		totalPages: 0,
		hasNext: false,
		hasPrev: false,
	};

	// Handle search input with debounce
	const handleSearchChange = (value: string) => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		const timeout = setTimeout(() => {
			setFilters((prev) => ({ ...prev, search: value }));
			setPage(1); // Reset to first page
		}, 500);

		setSearchTimeout(timeout);
	};

	// Handle filter changes
	const handleFilterChange = (key: string, value: any) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setPage(1); // Reset to first page
	};

	// Handle page change
	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// Clear all filters
	const clearFilters = () => {
		setFilters({
			search: "",
			genre: "",
			featured: true,
			minPrice: null,
			maxPrice: null,
			sortBy: "createdAt",
			sortOrder: "desc",
		});
		setPage(1);
	};

	const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const fadeInVariants = {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0 },
	};

	return (
		<div className="min-h-screen bg-black pt-20 pb-20 relative overflow-hidden">
			{/* Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-black to-reggae-yellow/5 pointer-events-none" />
			<div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-20 right-20 w-96 h-96 bg-reggae-yellow/10 rounded-full blur-3xl pointer-events-none" />

			<div className="container mx-auto px-4 py-8 relative z-10">
				{/* Header */}
				<motion.div
					initial="initial"
					animate="animate"
					variants={fadeInVariants}
					className="text-center mb-12"
				>
					<p className="text-sm text-gray-300 font-light max-w-xl mx-auto">
						<span className="text-emerald-400 font-semibold">Songs</span> that heal the soul
					</p>
					<h1 className="w-fit mx-auto text-4xl font-semibold font-montserrat bg-clip-text text-transparent bg-gradient-to-r from-white/50 via-white to-white/30 mt-2">
						Rasman Display
					</h1>
				</motion.div>

				{/* Search and Controls */}
				<motion.div
					initial="initial"
					animate="animate"
					variants={fadeInVariants}
					transition={{ delay: 0.2 }}
					className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-6 mb-8"
				>
					<div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
						{/* Search */}
						<div className="relative flex-1 max-w-md">
							<Search
								className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
								size={20}
							/>
							<input
								type="text"
								placeholder="Search songs, artists, or genres..."
								className="w-full pl-12 pr-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none text-white placeholder-gray-400 transition-all duration-300"
								onChange={(e) => handleSearchChange(e.target.value)}
							/>
						</div>

						{/* Controls */}
						<div className="flex items-center gap-4">
							<button
								onClick={() => setShowFilters(!showFilters)}
								className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
									showFilters
										? "bg-emerald-500 text-white"
										: "bg-black/30 border border-gray-700/30 text-gray-300 hover:text-emerald-500 hover:border-emerald-500/30"
								}`}
							>
								<Filter size={20} />
								Filters
							</button>

							<div className="flex items-center gap-2 bg-black/30 border border-gray-700/30 rounded-xl p-1">
								<button
									onClick={() => setViewMode("grid")}
									className={`p-2 rounded-lg transition-all duration-300 ${
										viewMode === "grid" ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-emerald-500"
									}`}
								>
									<Grid size={18} />
								</button>
								<button
									onClick={() => setViewMode("list")}
									className={`p-2 rounded-lg transition-all duration-300 ${
										viewMode === "list" ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-emerald-500"
									}`}
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
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							className="border-t border-gray-700/30 pt-6"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
								{/* Genre Filter */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
									<select
										value={filters.genre}
										onChange={(e) => handleFilterChange("genre", e.target.value)}
										className="w-full p-3 bg-black/30 border border-gray-700/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none text-white"
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
									<label className="block text-sm font-medium text-gray-300 mb-2">Featured</label>
									<select
										value={filters.featured === null ? "" : filters.featured.toString()}
										onChange={(e) =>
											handleFilterChange("featured", e.target.value === "" ? null : e.target.value === "true")
										}
										className="w-full p-3 bg-black/30 border border-gray-700/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none text-white"
									>
										<option value="">All Songs</option>
										<option value="true">Featured Only</option>
										<option value="false">Non-Featured</option>
									</select>
								</div>

								{/* Sort By */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
									<select
										value={filters.sortBy}
										onChange={(e) => handleFilterChange("sortBy", e.target.value)}
										className="w-full p-3 bg-black/30 border border-gray-700/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none text-white"
									>
										<option value="createdAt">Latest</option>
										<option value="title">Title</option>
										<option value="price">Price</option>
										<option value="duration">Duration</option>
									</select>
								</div>

								{/* Sort Order */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
									<select
										value={filters.sortOrder}
										onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
										className="w-full p-3 bg-black/30 border border-gray-700/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none text-white"
									>
										<option value="desc">Descending</option>
										<option value="asc">Ascending</option>
									</select>
								</div>
							</div>

							<div className="flex justify-between items-center">
								<div className="text-sm text-gray-400">
									{pagination.totalCount} songs found
									{isFetching && <span className="ml-2 text-emerald-500">(updating...)</span>}
								</div>
								<button
									onClick={clearFilters}
									className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-emerald-500 transition-colors duration-300"
								>
									<X size={16} />
									Clear Filters
								</button>
							</div>
						</motion.div>
					)}
				</motion.div>

				{/* Results */}
				{isLoading && !isPlaceholderData ? (
					<div className="flex items-center justify-center py-20">
						<div className="text-center">
							<Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
							<p className="text-gray-400">Loading songs...</p>
						</div>
					</div>
				) : error ? (
					<div className="text-center py-12">
						<div className="bg-black/10 backdrop-blur-2xl border border-red-700/30 rounded-2xl p-12 max-w-md mx-auto">
							<MicOff strokeWidth={1.5} className="w-14 h-14 text-red-400 mx-auto mb-4" />
							<h3 className="text-lg font-bold text-white mb-1">Oops</h3>
							<p className="text-gray-500 text-sm mb-6">
								{error instanceof Error ? error.message : "Failed to load songs"}
							</p>
							<button
								onClick={() => refetch()}
								className="bg-emerald-950/40 border-2 border-red-400 text-white px-8 py-1.5 rounded-full transition-colors text-sm font-medium font-mono"
							>
								Try Again
							</button>
						</div>
					</div>
				) : songs.length === 0 ? (
					<div className="text-center py-12">
						<div className="bg-black/10 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-12 max-w-md mx-auto">
							<ScanSearch className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
							<h3 className="text-lg font-bold text-white mb-1">No songs found</h3>
							<p className="text-gray-500 text-sm mb-6">
								{filters.search || filters.genre || filters.featured !== null
									? "Try adjusting your filters"
									: "No songs have been uploaded yet"}
							</p>
							<button
								onClick={clearFilters}
								className="bg-emerald-950/40 border-2 border-emerald-400 text-white px-8 py-1.5 rounded-full transition-colors text-sm font-medium font-mono"
							>
								Clear Filters
							</button>
						</div>
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
								viewMode === "grid"
									? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
									: "space-y-4 mb-12"
							}
						>
							{songs.map((song: ISong, index: number) => (
								<motion.div
									key={song._id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
									className={viewMode === "list" ? "w-full" : "mx-auto"}
								>
									{viewMode === "grid" ? (
										<SongCard song={song} index={index} />
									) : (
										// List view
										<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300">
											<div className="flex items-center gap-6">
												{/* Cover */}
												<div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
													<img
														src={song.coverArtUrl}
														alt={song.title}
														className="w-full h-full object-cover"
													/>
													{song.featured && (
														<div className="absolute top-1 right-1">
															<Star size={12} className="text-reggae-yellow fill-current" />
														</div>
													)}
												</div>

												{/* Song Info */}
												<div className="flex-1 min-w-0">
													<h3 className="font-bold text-white text-lg truncate">{song.title}</h3>
													<p className="text-gray-400 truncate">{song.artist}</p>
													<div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
														<span>{song.genre}</span>
														<span>•</span>
														<span className="flex items-center gap-1">
															<Clock size={12} />
															{formatDuration(song.duration)}
														</span>
													</div>
												</div>

												{/* Price & Status */}
												<div className="text-right flex-shrink-0">
													<div className="flex items-center justify-end gap-2 mb-2">
														<span className="font-bold text-emerald-500">{formatPrice(song.price)}</span>
													</div>
													{hasPurchased(song._id, "song") && (
														<span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-full">
															Owned
														</span>
													)}
												</div>
											</div>
										</div>
									)}
								</motion.div>
							))}
						</motion.div>

						{/* Pagination */}
						{pagination.totalPages > 1 && (
							<motion.div
								initial="initial"
								animate="animate"
								variants={fadeInVariants}
								transition={{ delay: 0.6 }}
								className="flex items-center justify-center gap-2"
							>
								<button
									onClick={() => handlePageChange(pagination.page - 1)}
									disabled={!pagination.hasPrev || isFetching}
									className="px-4 py-2 bg-black/30 border border-gray-700/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/50 transition-all duration-300"
								>
									Previous
								</button>

								{Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
									const pageNum = i + Math.max(1, pagination.page - 2);
									if (pageNum > pagination.totalPages) return null;

									return (
										<button
											key={pageNum}
											onClick={() => handlePageChange(pageNum)}
											disabled={isFetching}
											className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 ${
												pageNum === pagination.page
													? "bg-emerald-500 text-white"
													: "bg-black/30 border border-gray-700/30 text-white hover:bg-black/50"
											}`}
										>
											{pageNum}
										</button>
									);
								}).filter(Boolean)}

								<button
									onClick={() => handlePageChange(pagination.page + 1)}
									disabled={!pagination.hasNext || isFetching}
									className="px-4 py-2 bg-black/30 border border-gray-700/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/50 transition-all duration-300"
								>
									Next
								</button>
							</motion.div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default SongsPage;
