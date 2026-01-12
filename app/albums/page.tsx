"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
	Search,
	Filter,
	Grid,
	List,
	Disc,
	Star,
	Calendar,
	Music,
	DollarSign,
	Loader2,
	X,
} from "lucide-react";
import AlbumCard from "@/components/AlbumCard";
import { useAudio } from "@/provider/AudioProvider";
import { useAlbums } from "../hooks/music";

const AlbumsPage: React.FC = () => {
	const { hasPurchased } = useAudio();
	const [filters, setFilters] = useState({
		search: "",
		featured: null as boolean | null,
		minPrice: null as number | null,
		maxPrice: null as number | null,
		sortBy: "releaseDate",
		sortOrder: "desc",
	});
	const [page, setPage] = useState(1);
	const limit = 12;
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [showFilters, setShowFilters] = useState(false);
	const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

	const { data, isLoading, error, refetch, isFetching } = useAlbums({
		...filters,
		page,
		limit,
	});

	const albums = data?.albums || [];
	const pagination = data?.pagination || {
		page,
		limit,
		totalCount: 0,
		totalPages: 0,
		hasNext: false,
		hasPrev: false,
	};

	const isInitialLoading = isLoading && !data;
	const errorMessage = error instanceof Error ? error.message : "Failed to load albums";

	const handleSearchChange = (value: string) => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		const timeout = setTimeout(() => {
			setFilters((prev) => ({ ...prev, search: value }));
			setPage(1);
		}, 500);

		setSearchTimeout(timeout);
	};

	const handleFilterChange = (key: string, value: any) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setPage(1);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const clearFilters = () => {
		setFilters({
			search: "",
			featured: null,
			minPrice: null,
			maxPrice: null,
			sortBy: "releaseDate",
			sortOrder: "desc",
		});
		setPage(1);
	};

	const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
	const formatDate = (date: Date | string) => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		return dateObj.toLocaleDateString("en-GB", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const fadeInVariants = {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0 },
	};

	return (
		<div className="min-h-screen bg-black pt-20 pb-20 relative overflow-hidden">
			{/* Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-reggae-red/5 via-black to-reggae-yellow/5 pointer-events-none" />
			<div className="absolute top-20 right-20 w-72 h-72 bg-reggae-red/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-20 left-20 w-96 h-96 bg-reggae-yellow/10 rounded-full blur-3xl pointer-events-none" />

			<div className="container mx-auto px-4 py-8 relative z-10">
				{/* Header */}
				<motion.div
					initial="initial"
					animate="animate"
					variants={fadeInVariants}
					className="text-center mb-12"
				>
					<p className="text-sm text-gray-300 font-light max-w-xl mx-auto">
						<span className="text-emerald-400 font-semibold">Stories </span>
						of love, unity, and spiritual awakening
					</p>
					<h1 className="w-fit mx-auto text-4xl font-semibold font-montserrat bg-clip-text text-transparent bg-gradient-to-r from-white/50 via-white to-white/30 mt-2">
						Album Collections
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
								placeholder="Search albums, artists..."
								className="w-full pl-12 pr-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-yellow focus:border-reggae-yellow/50 outline-none text-white placeholder-gray-400 transition-all duration-300"
								onChange={(e) => handleSearchChange(e.target.value)}
							/>
						</div>

						{/* Controls */}
						<div className="flex items-center gap-4">
							<button
								onClick={() => setShowFilters((prev) => !prev)}
								className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
									showFilters
										? "bg-reggae-yellow text-black"
										: "bg-black/30 border border-gray-700/30 text-gray-300 hover:text-reggae-yellow hover:border-reggae-yellow/30"
								}`}
							>
								<Filter size={20} />
								Filters
							</button>

							<div className="flex items-center gap-2 bg-black/30 border border-gray-700/30 rounded-xl p-1">
								<button
									onClick={() => setViewMode("grid")}
									className={`p-2 rounded-lg transition-all duration-300 ${
										viewMode === "grid"
											? "bg-reggae-yellow text-black"
											: "text-gray-400 hover:text-reggae-yellow"
									}`}
								>
									<Grid size={18} />
								</button>
								<button
									onClick={() => setViewMode("list")}
									className={`p-2 rounded-lg transition-all duration-300 ${
										viewMode === "list"
											? "bg-reggae-yellow text-black"
											: "text-gray-400 hover:text-reggae-yellow"
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
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
								{/* Featured Filter */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Featured</label>
									<select
										value={filters.featured === null ? "" : filters.featured.toString()}
										onChange={(e) =>
											handleFilterChange("featured", e.target.value === "" ? null : e.target.value === "true")
										}
										className="w-full p-3 bg-black/30 border border-gray-700/30 rounded-lg focus:ring-2 focus:ring-reggae-yellow focus:border-reggae-yellow/50 outline-none text-white"
									>
										<option value="">All Albums</option>
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
										className="w-full p-3 bg-black/30 border border-gray-700/30 rounded-lg focus:ring-2 focus:ring-reggae-yellow focus:border-reggae-yellow/50 outline-none text-white"
									>
										<option value="releaseDate">Release Date</option>
										<option value="title">Title</option>
										<option value="price">Price</option>
										<option value="createdAt">Date Added</option>
									</select>
								</div>

								{/* Sort Order */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
									<select
										value={filters.sortOrder}
										onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
										className="w-full p-3 bg-black/30 border border-gray-700/30 rounded-lg focus:ring-2 focus:ring-reggae-yellow focus:border-reggae-yellow/50 outline-none text-white"
									>
										<option value="desc">Descending</option>
										<option value="asc">Ascending</option>
									</select>
								</div>
							</div>

							<div className="flex justify-between items-center">
								<div className="text-sm text-gray-400">
									{pagination.totalCount} albums found{" "}
									{isFetching && <span className="text-reggae-yellow ml-2">(updating...)</span>}
								</div>
								<button
									onClick={clearFilters}
									className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-reggae-yellow transition-colors duration-300"
								>
									<X size={16} />
									Clear Filters
								</button>
							</div>
						</motion.div>
					)}
				</motion.div>

				{/* Results */}
				{isInitialLoading ? (
					<div className="flex items-center justify-center py-20">
						<div className="text-center">
							<Loader2 className="w-12 h-12 text-reggae-yellow animate-spin mx-auto mb-4" />
							<p className="text-gray-400">Loading album collections...</p>
						</div>
					</div>
				) : error ? (
					<div className="text-center py-12">
						<div className="bg-black/20 backdrop-blur-2xl border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
							<div className="text-red-400 text-lg mb-4">{errorMessage}</div>
							<button
								onClick={() => refetch()}
								className="bg-reggae-yellow text-black px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors font-medium"
							>
								Try Again
							</button>
						</div>
					</div>
				) : albums.length === 0 ? (
					<div className="text-center py-12">
						<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-12 max-w-md mx-auto">
							<Disc className="w-16 h-16 text-gray-500 mx-auto mb-4" />
							<h3 className="text-xl font-bold text-white mb-2">No albums found</h3>
							<p className="text-gray-400 mb-6">
								{filters.search || filters.featured !== null
									? "Try adjusting your filters"
									: "No albums have been released yet"}
							</p>
							<button
								onClick={clearFilters}
								className="bg-reggae-yellow text-black px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors font-medium"
							>
								Clear Filters
							</button>
						</div>
					</div>
				) : (
					<>
						{/* Albums Grid/List */}
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
							{albums.map((album, index) => (
								<motion.div
									key={album._id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
									className={viewMode === "list" ? "w-full" : "mx-auto"}
								>
									{viewMode === "grid" ? (
										<AlbumCard album={album} index={index} />
									) : (
										// List view
										<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300 group">
											<div className="flex items-center gap-6">
												{/* Cover */}
												<div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
													<img
														src={album.coverArtUrl}
														alt={album.title}
														className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
													/>
													{album.featured && (
														<div className="absolute top-1 right-1">
															<Star size={14} className="text-reggae-yellow fill-current" />
														</div>
													)}
												</div>

												{/* Album Info */}
												<div className="flex-1 min-w-0">
													<h3 className="font-bold text-white text-xl truncate group-hover:text-reggae-yellow transition-colors duration-300">
														{album.title}
													</h3>
													<p className="text-gray-400 truncate text-lg">{album.artist}</p>
													<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
														<span className="flex items-center gap-1">
															<Calendar size={12} />
															{formatDate(album.releaseDate)}
														</span>
														<span>•</span>
														<span className="flex items-center gap-1">
															<Music size={12} />
															{album.songIds?.length || 0} tracks
														</span>
													</div>
													{album.description && (
														<p className="text-gray-400 text-sm mt-1 line-clamp-2">{album.description}</p>
													)}
												</div>

												{/* Price & Status */}
												<div className="text-right flex-shrink-0">
													<div className="flex items-center gap-2 mb-3">
														<DollarSign size={18} className="text-reggae-yellow" />
														<span className="font-bold text-reggae-yellow text-xl">
															{formatPrice(album.price)}
														</span>
													</div>
													{hasPurchased(album._id, "album") && (
														<span className="text-xs bg-reggae-yellow/20 text-reggae-yellow px-3 py-1 rounded-full">
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
									const pageNumber = i + Math.max(1, pagination.page - 2);
									if (pageNumber > pagination.totalPages) return null;

									return (
										<button
											key={pageNumber}
											onClick={() => handlePageChange(pageNumber)}
											disabled={isFetching}
											className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
												pageNumber === pagination.page
													? "bg-reggae-yellow text-black"
													: "bg-black/30 border border-gray-700/30 text-white hover:bg-black/50"
											}`}
										>
											{pageNumber}
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

export default AlbumsPage;
