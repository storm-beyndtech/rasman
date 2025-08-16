"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Grid, List, Music, Star, Clock, DollarSign, Loader2, X } from "lucide-react";
import { ISong } from "@/lib/models";
import SongCard from "@/components/SongCard";
import { useAudio } from "@/provider/AudioProvider";

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
	viewMode: "grid" | "list";
	showFilters: boolean;
}

const SongsPage: React.FC = () => {
	const { hasPurchased } = useAudio();
	const [state, setState] = useState<SongsPageState>({
		songs: [],
		loading: true,
		error: null,
		filters: {
			search: "",
			genre: "",
			featured: null,
			minPrice: null,
			maxPrice: null,
			sortBy: "createdAt",
			sortOrder: "desc",
		},
		pagination: {
			page: 1,
			limit: 12,
			totalCount: 0,
			totalPages: 0,
			hasNext: false,
			hasPrev: false,
		},
		viewMode: "grid",
		showFilters: false,
	});

	const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

	// Fetch songs
	const fetchSongs = async () => {
		setState((prev) => ({ ...prev, loading: true, error: null }));

		try {
			const params = new URLSearchParams();

			// Add filter parameters
			Object.entries(state.filters).forEach(([key, value]) => {
				if (value !== null && value !== "") {
					params.append(key, value.toString());
				}
			});

			// Add pagination parameters
			params.append("page", state.pagination.page.toString());
			params.append("limit", state.pagination.limit.toString());

			const response = await fetch(`/api/songs?${params}`);
			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || "Failed to fetch songs");
			}

			setState((prev) => ({
				...prev,
				songs: result.data.songs,
				pagination: result.data.pagination,
				loading: false,
			}));
		} catch (error) {
			setState((prev) => ({
				...prev,
				error: error instanceof Error ? error.message : "An error occurred",
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
			setState((prev) => ({
				...prev,
				filters: { ...prev.filters, search: value },
				pagination: { ...prev.pagination, page: 1 },
			}));
		}, 500);

		setSearchTimeout(timeout);
	};

	// Handle filter changes
	const handleFilterChange = (key: string, value: any) => {
		setState((prev) => ({
			...prev,
			filters: { ...prev.filters, [key]: value },
			pagination: { ...prev.pagination, page: 1 },
		}));
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		setState((prev) => ({
			...prev,
			pagination: { ...prev.pagination, page },
		}));
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// Clear all filters
	const clearFilters = () => {
		setState((prev) => ({
			...prev,
			filters: {
				search: "",
				genre: "",
				featured: null,
				minPrice: null,
				maxPrice: null,
				sortBy: "createdAt",
				sortOrder: "desc",
			},
			pagination: { ...prev.pagination, page: 1 },
		}));
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
			<div className="absolute inset-0 bg-gradient-to-br from-reggae-green/5 via-black to-reggae-yellow/5 pointer-events-none" />
			<div className="absolute top-20 left-20 w-72 h-72 bg-reggae-green/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-20 right-20 w-96 h-96 bg-reggae-yellow/10 rounded-full blur-3xl pointer-events-none" />

			<div className="container mx-auto px-4 py-8 relative z-10">
				{/* Header */}
				<motion.div
					initial="initial"
					animate="animate"
					variants={fadeInVariants}
					className="text-center mb-12"
				>
					<h1 className="text-5xl md:text-7xl font-bold font-serif text-white mb-4">
						Conscious <span className="text-reggae-green">Music</span>
					</h1>
					<p className="text-xl text-gray-300 max-w-3xl mx-auto">
						Discover the complete collection of conscious reggae music that heals the soul
					</p>
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
								className="w-full pl-12 pr-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400 transition-all duration-300"
								onChange={(e) => handleSearchChange(e.target.value)}
							/>
						</div>

						{/* Controls */}
						<div className="flex items-center gap-4">
							<button
								onClick={() => setState((prev) => ({ ...prev, showFilters: !prev.showFilters }))}
								className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
									state.showFilters
										? "bg-reggae-green text-white"
										: "bg-black/30 border border-gray-700/30 text-gray-300 hover:text-reggae-green hover:border-reggae-green/30"
								}`}
							>
								<Filter size={20} />
								Filters
							</button>

							<div className="flex items-center gap-2 bg-black/30 border border-gray-700/30 rounded-xl p-1">
								<button
									onClick={() => setState((prev) => ({ ...prev, viewMode: "grid" }))}
									className={`p-2 rounded-lg transition-all duration-300 ${
										state.viewMode === "grid"
											? "bg-reggae-green text-white"
											: "text-gray-400 hover:text-reggae-green"
									}`}
								>
									<Grid size={18} />
								</button>
								<button
									onClick={() => setState((prev) => ({ ...prev, viewMode: "list" }))}
									className={`p-2 rounded-lg transition-all duration-300 ${
										state.viewMode === "list"
											? "bg-reggae-green text-white"
											: "text-gray-400 hover:text-reggae-green"
									}`}
								>
									<List size={18} />
								</button>
							</div>
						</div>
					</div>

					{/* Expandable Filters */}
					{state.showFilters && (
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
										value={state.filters.genre}
										onChange={(e) => handleFilterChange("genre", e.target.value)}
										className="w-full p-3 bg-black/30 border border-gray-700/30 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white"
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
										value={state.filters.featured === null ? "" : state.filters.featured.toString()}
										onChange={(e) =>
											handleFilterChange("featured", e.target.value === "" ? null : e.target.value === "true")
										}
										className="w-full p-3 bg-black/30 border border-gray-700/30 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white"
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
										value={state.filters.sortBy}
										onChange={(e) => handleFilterChange("sortBy", e.target.value)}
										className="w-full p-3 bg-black/30 border border-gray-700/30 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white"
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
										value={state.filters.sortOrder}
										onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
										className="w-full p-3 bg-black/30 border border-gray-700/30 rounded-lg focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white"
									>
										<option value="desc">Descending</option>
										<option value="asc">Ascending</option>
									</select>
								</div>
							</div>

							<div className="flex justify-between items-center">
								<div className="text-sm text-gray-400">{state.pagination.totalCount} songs found</div>
								<button
									onClick={clearFilters}
									className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-reggae-green transition-colors duration-300"
								>
									<X size={16} />
									Clear Filters
								</button>
							</div>
						</motion.div>
					)}
				</motion.div>

				{/* Results */}
				{state.loading ? (
					<div className="flex items-center justify-center py-20">
						<div className="text-center">
							<Loader2 className="w-12 h-12 text-reggae-green animate-spin mx-auto mb-4" />
							<p className="text-gray-400">Loading conscious music...</p>
						</div>
					</div>
				) : state.error ? (
					<div className="text-center py-12">
						<div className="bg-black/20 backdrop-blur-2xl border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
							<div className="text-red-400 text-lg mb-4">{state.error}</div>
							<button
								onClick={fetchSongs}
								className="bg-reggae-green text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-medium"
							>
								Try Again
							</button>
						</div>
					</div>
				) : state.songs.length === 0 ? (
					<div className="text-center py-12">
						<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-12 max-w-md mx-auto">
							<Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
							<h3 className="text-xl font-bold text-white mb-2">No songs found</h3>
							<p className="text-gray-400 mb-6">
								{state.filters.search || state.filters.genre || state.filters.featured !== null
									? "Try adjusting your filters"
									: "No songs have been uploaded yet"}
							</p>
							<button
								onClick={clearFilters}
								className="bg-reggae-green text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-medium"
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
								state.viewMode === "grid"
									? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
									: "space-y-4 mb-12"
							}
						>
							{state.songs.map((song, index) => (
								<motion.div
									key={song._id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
									className={state.viewMode === "list" ? "w-full" : ""}
								>
									{state.viewMode === "grid" ? (
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
													<div className="flex items-center gap-2 mb-2">
														<DollarSign size={16} className="text-reggae-green" />
														<span className="font-bold text-reggae-green">{formatPrice(song.price)}</span>
													</div>
													{hasPurchased(song._id, "song") && (
														<span className="text-xs bg-reggae-green/20 text-reggae-green px-2 py-1 rounded-full">
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
						{state.pagination.totalPages > 1 && (
							<motion.div
								initial="initial"
								animate="animate"
								variants={fadeInVariants}
								transition={{ delay: 0.6 }}
								className="flex items-center justify-center gap-2"
							>
								<button
									onClick={() => handlePageChange(state.pagination.page - 1)}
									disabled={!state.pagination.hasPrev}
									className="px-4 py-2 bg-black/30 border border-gray-700/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/50 transition-all duration-300"
								>
									Previous
								</button>

								{Array.from({ length: Math.min(state.pagination.totalPages, 5) }, (_, i) => {
									const page = i + Math.max(1, state.pagination.page - 2);
									if (page > state.pagination.totalPages) return null;

									return (
										<button
											key={page}
											onClick={() => handlePageChange(page)}
											className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
												page === state.pagination.page
													? "bg-reggae-green text-white"
													: "bg-black/30 border border-gray-700/30 text-white hover:bg-black/50"
											}`}
										>
											{page}
										</button>
									);
								}).filter(Boolean)}

								<button
									onClick={() => handlePageChange(state.pagination.page + 1)}
									disabled={!state.pagination.hasNext}
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
