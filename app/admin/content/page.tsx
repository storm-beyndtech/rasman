"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Music,
	Disc,
	Edit,
	Trash2,
	Search,
	Star,
	StarOff,
	Loader2,
	X,
	Save,
	DollarSign,
	Clock,
	Calendar,
	Eye,
} from "lucide-react";

interface ISong {
	_id: string;
	title: string;
	artist: string;
	genre: string;
	duration: number;
	price: number;
	featured: boolean;
	coverArtUrl: string;
	createdAt: Date;
}

interface IAlbum {
	_id: string;
	title: string;
	artist: string;
	price: number;
	description?: string;
	featured: boolean;
	coverArtUrl: string;
	songIds: string[];
	releaseDate: Date;
	createdAt: Date;
}

interface EditFormData {
	title: string;
	artist: string;
	genre?: string;
	price: number;
	featured: boolean;
	description?: string;
}

interface ContentState {
	songs: ISong[];
	albums: IAlbum[];
	loading: boolean;
	searchQuery: string;
	activeTab: "songs" | "albums";
	editingItem: ISong | IAlbum | null;
	deletingItem: ISong | IAlbum | null;
	showEditModal: boolean;
	showDeleteModal: boolean;
	editFormData: EditFormData;
	saving: boolean;
	actionLoading: boolean;
}

export default function AdminContentManagement() {
	const [state, setState] = useState<ContentState>({
		songs: [],
		albums: [],
		loading: true,
		searchQuery: "",
		activeTab: "songs",
		editingItem: null,
		deletingItem: null,
		showEditModal: false,
		showDeleteModal: false,
		editFormData: {
			title: "",
			artist: "",
			genre: "",
			price: 0,
			featured: false,
			description: "",
		},
		saving: false,
		actionLoading: false,
	});

	useEffect(() => {
		fetchContent();
	}, [state.activeTab]);

	const fetchContent = async () => {
		setState((prev) => ({ ...prev, loading: true }));

		try {
			const endpoint = state.activeTab === "songs" ? "/api/songs" : "/api/albums";
			const response = await fetch(`${endpoint}?limit=100`);

			if (response.ok) {
				const data = await response.json();
				if (state.activeTab === "songs") {
					setState((prev) => ({ ...prev, songs: data.data?.songs || [], loading: false }));
				} else {
					setState((prev) => ({ ...prev, albums: data.data?.albums || [], loading: false }));
				}
			}
		} catch (error) {
			console.error("Error fetching content:", error);
			setState((prev) => ({ ...prev, loading: false }));
		}
	};

	const openEditModal = (item: ISong | IAlbum) => {
		const isSong = "genre" in item;
		setState((prev) => ({
			...prev,
			editingItem: item,
			showEditModal: true,
			editFormData: {
				title: item.title,
				artist: item.artist,
				genre: isSong ? (item as ISong).genre : "",
				price: item.price,
				featured: item.featured,
				description: isSong ? "" : (item as IAlbum).description || "",
			},
		}));
	};

	const handleSaveEdit = async () => {
		if (!state.editingItem) return;

		setState((prev) => ({ ...prev, saving: true }));

		try {
			const isSong = "genre" in state.editingItem;
			const endpoint = isSong ? "/api/songs" : "/api/albums";

			const updateData = {
				id: state.editingItem._id,
				title: state.editFormData.title,
				artist: state.editFormData.artist,
				price: state.editFormData.price,
				featured: state.editFormData.featured,
				...(isSong ? { genre: state.editFormData.genre } : { description: state.editFormData.description }),
			};

			const response = await fetch(endpoint, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updateData),
			});

			if (response.ok) {
				setState((prev) => ({
					...prev,
					showEditModal: false,
					editingItem: null,
					saving: false,
				}));
				await fetchContent();
			} else {
				console.error("Failed to update item");
				setState((prev) => ({ ...prev, saving: false }));
			}
		} catch (error) {
			console.error("Failed to update item:", error);
			setState((prev) => ({ ...prev, saving: false }));
		}
	};

	const toggleFeatured = async (item: ISong | IAlbum) => {
		setState((prev) => ({ ...prev, actionLoading: true }));

		try {
			const endpoint = "genre" in item ? "/api/songs" : "/api/albums";
			const response = await fetch(endpoint, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: item._id,
					featured: !item.featured,
				}),
			});

			if (response.ok) {
				await fetchContent();
			} else {
				console.error("Failed to update featured status");
			}
		} catch (error) {
			console.error("Failed to update featured status:", error);
		} finally {
			setState((prev) => ({ ...prev, actionLoading: false }));
		}
	};

	const handleDelete = async () => {
		if (!state.deletingItem) return;

		setState((prev) => ({ ...prev, saving: true }));

		try {
			const isSong = "genre" in state.deletingItem;
			const endpoint = isSong ? "/api/songs" : "/api/albums";

			const response = await fetch(`${endpoint}?id=${state.deletingItem._id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setState((prev) => ({
					...prev,
					showDeleteModal: false,
					deletingItem: null,
					saving: false,
				}));
				await fetchContent();
			} else {
				console.error("Failed to delete item");
				setState((prev) => ({ ...prev, saving: false }));
			}
		} catch (error) {
			console.error("Failed to delete item:", error);
			setState((prev) => ({ ...prev, saving: false }));
		}
	};

	const filteredItems = () => {
		const items = state.activeTab === "songs" ? state.songs : state.albums;
		if (!state.searchQuery) return items;

		return items.filter(
			(item) =>
				item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
				item.artist.toLowerCase().includes(state.searchQuery.toLowerCase()),
		);
	};

	const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
	const formatDate = (date: Date) => new Date(date).toLocaleDateString();
	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="text-sm text-gray-400">
					{state.activeTab === "songs" ? state.songs.length : state.albums.length} items
				</div>
			</div>

			{/* Search and Tabs */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
				{/* Search */}
				<div className="relative max-w-md w-full">
					<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
					<input
						type="text"
						placeholder="Search music..."
						value={state.searchQuery}
						onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
						className="w-full pl-12 pr-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400 transition-all duration-300"
					/>
				</div>

				{/* Tabs */}
				<div className="flex gap-2 bg-black/30 backdrop-blur-sm rounded-xl p-1 border border-gray-700/30">
					<button
						onClick={() => setState((prev) => ({ ...prev, activeTab: "songs" }))}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
							state.activeTab === "songs"
								? "bg-reggae-green/70 text-white shadow-lg"
								: "text-gray-300 hover:text-reggae-green hover:bg-black/30"
						}`}
					>
						<Music size={18} />
						Songs ({state.songs.length})
					</button>
					<button
						onClick={() => setState((prev) => ({ ...prev, activeTab: "albums" }))}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
							state.activeTab === "albums"
								? "bg-reggae-yellow/80 text-white shadow-lg"
								: "text-gray-300 hover:text-reggae-yellow hover:bg-black/30"
						}`}
					>
						<Disc size={18} />
						Albums ({state.albums.length})
					</button>
				</div>
			</div>

			{/* Content List */}
			{state.loading ? (
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<Loader2 className="w-12 h-12 text-reggae-green animate-spin mx-auto mb-4" />
						<p className="text-gray-400">Loading content...</p>
					</div>
				</div>
			) : filteredItems().length === 0 ? (
				<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-12 text-center">
					<Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
					<h3 className="text-xl font-bold text-white mb-2">No {state.activeTab} Found</h3>
					<p className="text-gray-400">
						{state.searchQuery
							? `No ${state.activeTab} match your search "${state.searchQuery}"`
							: `No ${state.activeTab} have been uploaded yet.`}
					</p>
				</div>
			) : (
				<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-black/30 border-b border-gray-700/30">
								<tr>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">Content</th>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">Details</th>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">Price</th>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">Status</th>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">Date</th>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">Actions</th>
								</tr>
							</thead>
							<tbody>
								{filteredItems().map((item, index) => {
									const isSong = "genre" in item;
									return (
										<motion.tr
											key={item._id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.05 }}
											className="border-b border-gray-700/20 hover:bg-black/20 transition-colors duration-200"
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-4">
													{/* Cover Art */}
													<div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/30 flex-shrink-0">
														<img
															src={item.coverArtUrl}
															alt={item.title}
															className="object-cover w-full h-full"
															onError={(e) => {
																(e.target as HTMLImageElement).src =
																	"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiM0QTVBNjgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgM3Y5LjI1bC02LTYuNzVIMTJ6TTEyIDEyLjc1VjIxSDZsNi02Ljc1eiIvPjwvc3ZnPg==";
															}}
														/>
														<div className="absolute top-1 right-1">
															<div
																className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium ${
																	isSong ? "bg-reggae-green/80" : "bg-reggae-yellow/80 text-black"
																}`}
															>
																{isSong ? "S" : "A"}
															</div>
														</div>
													</div>

													{/* Content Info */}
													<div className="min-w-0">
														<h3 className="font-bold text-white text-lg truncate">{item.title}</h3>
														<p className="text-gray-400 truncate">{item.artist}</p>
													</div>
												</div>
											</td>

											<td className="px-6 py-4">
												<div className="text-sm text-gray-400">
													{isSong ? (
														<>
															<div className="flex items-center gap-1 mb-1">
																<Music size={12} />
																{(item as ISong).genre}
															</div>
															<div className="flex items-center gap-1">
																<Clock size={12} />
																{formatDuration((item as ISong).duration)}
															</div>
														</>
													) : (
														<>
															<div className="flex items-center gap-1 mb-1">
																<Disc size={12} />
																{(item as IAlbum).songIds.length} tracks
															</div>
															<div className="flex items-center gap-1">
																<Calendar size={12} />
																Album
															</div>
														</>
													)}
												</div>
											</td>

											<td className="px-6 py-4">
												<div className="flex items-center gap-1">
													<DollarSign size={14} className="text-reggae-green" />
													<span className="font-semibold text-white">{formatPrice(item.price)}</span>
												</div>
											</td>

											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													{item.featured && (
														<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-reggae-green/20 text-reggae-green border border-reggae-green/30">
															<Star size={12} />
															Featured
														</span>
													)}
													<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
														<Eye size={12} />
														Published
													</span>
												</div>
											</td>

											<td className="px-6 py-4">
												<span className="text-sm text-gray-400">{formatDate(item.createdAt)}</span>
											</td>

											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													{/* Featured Toggle */}
													<motion.button
														onClick={() => toggleFeatured(item)}
														disabled={state.actionLoading}
														className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
															item.featured
																? "bg-reggae-green/20 text-reggae-green border border-reggae-green/30"
																: "bg-black/30 text-gray-400 border border-gray-700/30 hover:border-reggae-green/30 hover:text-reggae-green"
														} disabled:opacity-50 disabled:cursor-not-allowed`}
														title={item.featured ? "Remove from featured" : "Add to featured"}
														whileHover={{ scale: state.actionLoading ? 1 : 1.05 }}
														whileTap={{ scale: state.actionLoading ? 1 : 0.95 }}
													>
														{state.actionLoading ? (
															<Loader2 size={14} className="animate-spin" />
														) : item.featured ? (
															<Star size={14} />
														) : (
															<StarOff size={14} />
														)}
													</motion.button>

													{/* Edit Button */}
													<motion.button
														onClick={() => openEditModal(item)}
														disabled={state.actionLoading}
														className="w-8 h-8 rounded-lg bg-black/30 border border-gray-700/30 flex items-center justify-center text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
														title="Edit"
														whileHover={{ scale: state.actionLoading ? 1 : 1.05 }}
														whileTap={{ scale: state.actionLoading ? 1 : 0.95 }}
													>
														<Edit size={14} />
													</motion.button>

													{/* Delete Button */}
													<motion.button
														onClick={() =>
															setState((prev) => ({ ...prev, deletingItem: item, showDeleteModal: true }))
														}
														disabled={state.actionLoading}
														className="w-8 h-8 rounded-lg bg-black/30 border border-gray-700/30 flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
														title="Delete"
														whileHover={{ scale: state.actionLoading ? 1 : 1.05 }}
														whileTap={{ scale: state.actionLoading ? 1 : 0.95 }}
													>
														<Trash2 size={14} />
													</motion.button>
												</div>
											</td>
										</motion.tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			<AnimatePresence>
				{state.showEditModal && state.editingItem && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
							onClick={() => setState((prev) => ({ ...prev, showEditModal: false }))}
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							className="fixed inset-4 z-50 flex items-center justify-center"
						>
							<div className="w-full max-w-lg bg-black/90 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
								<div className="mb-6">
									<h3 className="text-xl font-bold text-white mb-2">
										Edit {"genre" in state.editingItem ? "Song" : "Album"}
									</h3>
									<p className="text-gray-400">Update the details for "{state.editingItem.title}"</p>
								</div>

								<div className="space-y-4">
									{/* Title */}
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
										<input
											type="text"
											value={state.editFormData.title}
											onChange={(e) =>
												setState((prev) => ({
													...prev,
													editFormData: { ...prev.editFormData, title: e.target.value },
												}))
											}
											className="w-full px-4 py-3 bg-black/30 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400"
											placeholder="Enter title"
										/>
									</div>

									{/* Artist */}
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
										<input
											type="text"
											value={state.editFormData.artist}
											onChange={(e) =>
												setState((prev) => ({
													...prev,
													editFormData: { ...prev.editFormData, artist: e.target.value },
												}))
											}
											className="w-full px-4 py-3 bg-black/30 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400"
											placeholder="Enter artist name"
										/>
									</div>

									{/* Genre (Songs only) */}
									{"genre" in state.editingItem && (
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
											<select
												value={state.editFormData.genre}
												onChange={(e) =>
													setState((prev) => ({
														...prev,
														editFormData: { ...prev.editFormData, genre: e.target.value },
													}))
												}
												className="w-full px-4 py-3 bg-black/30 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white"
											>
												<option value="Reggae">Reggae</option>
												<option value="Roots">Roots</option>
												<option value="Dancehall">Dancehall</option>
												<option value="Dub">Dub</option>
											</select>
										</div>
									)}

									{/* Description (Albums only) */}
									{!("genre" in state.editingItem) && (
										<div>
											<label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
											<textarea
												value={state.editFormData.description}
												onChange={(e) =>
													setState((prev) => ({
														...prev,
														editFormData: { ...prev.editFormData, description: e.target.value },
													}))
												}
												className="w-full px-4 py-3 bg-black/30 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400 resize-none"
												placeholder="Enter album description"
												rows={3}
											/>
										</div>
									)}

									{/* Price */}
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">Price (₦)</label>
										<input
											type="number"
											value={state.editFormData.price}
											onChange={(e) =>
												setState((prev) => ({
													...prev,
													editFormData: { ...prev.editFormData, price: parseFloat(e.target.value) || 0 },
												}))
											}
											className="w-full px-4 py-3 bg-black/30 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400"
											placeholder="0"
											min="0"
										/>
									</div>

									{/* Featured Toggle */}
									<div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-gray-700/30">
										<div>
											<h4 className="font-medium text-white">Featured Content</h4>
											<p className="text-sm text-gray-400">Show this content prominently on the platform</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={state.editFormData.featured}
												onChange={(e) =>
													setState((prev) => ({
														...prev,
														editFormData: { ...prev.editFormData, featured: e.target.checked },
													}))
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-black/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-reggae-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-reggae-green border border-gray-600"></div>
										</label>
									</div>
								</div>

								<div className="flex gap-4 mt-8">
									<motion.button
										onClick={() => setState((prev) => ({ ...prev, showEditModal: false }))}
										disabled={state.saving}
										className="flex-1 px-4 py-3 bg-black/30 border border-gray-700/30 text-white rounded-xl hover:bg-black/50 transition-colors duration-300 disabled:opacity-50"
										whileHover={{ scale: state.saving ? 1 : 1.02 }}
										whileTap={{ scale: state.saving ? 1 : 0.98 }}
									>
										Cancel
									</motion.button>
									<motion.button
										onClick={handleSaveEdit}
										disabled={state.saving}
										className="flex-1 px-4 py-3 bg-reggae-green text-white rounded-xl hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
										whileHover={{ scale: state.saving ? 1 : 1.02 }}
										whileTap={{ scale: state.saving ? 1 : 0.98 }}
									>
										{state.saving ? (
											<>
												<Loader2 size={16} className="animate-spin" />
												Saving...
											</>
										) : (
											<>
												<Save size={16} />
												Save Changes
											</>
										)}
									</motion.button>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Delete Confirmation Modal */}
			<AnimatePresence>
				{state.showDeleteModal && state.deletingItem && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
							onClick={() => setState((prev) => ({ ...prev, showDeleteModal: false }))}
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							className="fixed inset-4 z-50 flex items-center justify-center"
						>
							<div className="w-full max-w-md bg-black/90 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8">
								<div className="text-center">
									<div className="w-16 h-16 mx-auto mb-6 bg-red-900/20 rounded-full flex items-center justify-center">
										<Trash2 className="w-8 h-8 text-red-500" />
									</div>
									<h3 className="text-xl font-bold text-white mb-2">
										Delete {"genre" in state.deletingItem ? "Song" : "Album"}
									</h3>
									<p className="text-gray-400 mb-8">
										Are you sure you want to delete "{state.deletingItem.title}"? This action cannot be
										undone.
										{!("genre" in state.deletingItem) && " All songs in this album will also be deleted."}
									</p>
									<div className="flex gap-4">
										<motion.button
											onClick={() =>
												setState((prev) => ({ ...prev, showDeleteModal: false, deletingItem: null }))
											}
											disabled={state.saving}
											className="flex-1 px-4 py-3 bg-black/30 border border-gray-700/30 text-white rounded-xl hover:bg-black/50 transition-colors duration-300 disabled:opacity-50"
											whileHover={{ scale: state.saving ? 1 : 1.02 }}
											whileTap={{ scale: state.saving ? 1 : 0.98 }}
										>
											Cancel
										</motion.button>
										<motion.button
											onClick={handleDelete}
											disabled={state.saving}
											className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
											whileHover={{ scale: state.saving ? 1 : 1.02 }}
											whileTap={{ scale: state.saving ? 1 : 0.98 }}
										>
											{state.saving ? (
												<>
													<Loader2 size={16} className="animate-spin" />
													Deleting...
												</>
											) : (
												<>
													<Trash2 size={16} />
													Delete
												</>
											)}
										</motion.button>
									</div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
