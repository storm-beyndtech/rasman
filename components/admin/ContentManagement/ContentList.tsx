import { ContentState } from "@/app/admin/content/page";
import { IAlbum, ISong } from "@/lib/models";
import { motion } from "framer-motion";
import {
	Calendar,
	Clock,
	Disc,
	DollarSign,
	Edit,
	Eye,
	Loader2,
	Music,
	Star,
	StarOff,
	Trash2,
} from "lucide-react";

const ContentList: React.FC<{
	state: ContentState;
	filteredItems: () => (ISong | IAlbum)[];
	toggleSongSelection: (songId: string) => void;
	toggleFeatured: (item: ISong | IAlbum) => void;
	openEditModal: (item: ISong | IAlbum) => void;
	setState: React.Dispatch<React.SetStateAction<ContentState>>;
	formatPrice: (price: number) => string;
	formatDate: (date: Date) => string;
	formatDuration: (seconds: number) => string;
	handleCoverArtUpload: (id: string, file: File | undefined, type: "song" | "album") => void;
}> = ({
	state,
	filteredItems,
	toggleSongSelection,
	toggleFeatured,
	openEditModal,
	setState,
	formatPrice,
	formatDate,
	formatDuration,
	handleCoverArtUpload,
}) => (
	<div className="bg-stone-900/15 backdrop-blur-sm border border-gray-700/30 rounded-2xl overflow-hidden">
		<div className="overflow-x-auto">
			<table className="w-full">
				<thead className="bg-black/20 border-b border-gray-700/30">
					<tr>
						{state.activeTab === "songs" && (
							<th className="text-left px-6 py-4 font-semibold text-gray-300 w-12">
								<input
									type="checkbox"
									className="w-4 h-4 text-reggae-green bg-black/30 border-gray-700/30 rounded focus:ring-reggae-green focus:ring-2"
									checked={state.selectedSongs.size === filteredItems().length && filteredItems().length > 0}
									onChange={(e) => {
										setState((prev) => ({
											...prev,
											selectedSongs: e.target.checked
												? new Set(filteredItems().map((item) => item._id))
												: new Set(),
										}));
									}}
								/>
							</th>
						)}
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
								className={`border-b border-gray-700/20 hover:bg-black/20 transition-colors duration-200 ${
									isSong && state.selectedSongs.has(item._id) ? "bg-reggae-green/10" : ""
								}`}
							>
								{state.activeTab === "songs" && (
									<td className="px-6 py-4">
										<input
											type="checkbox"
											className="w-4 h-4 text-reggae-green bg-black/30 border-gray-700/30 rounded focus:ring-reggae-green focus:ring-2"
											checked={state.selectedSongs.has(item._id)}
											onChange={() => toggleSongSelection(item._id)}
										/>
									</td>
								)}
								<td className="px-6 py-4">
									<div className="flex items-center gap-4">
										<div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/30 flex-shrink-0">
											<input
												type="file"
												accept="image/*"
												className="absolute inset-0 opacity-0 cursor-pointer"
												onChange={(e) =>
													handleCoverArtUpload(item._id, e.target.files?.[0], isSong ? "song" : "album")
												}
											/>
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
);

export default ContentList;
