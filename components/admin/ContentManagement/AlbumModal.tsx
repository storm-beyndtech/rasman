import { ContentState } from "@/app/admin/content/page";
import { AnimatePresence, motion } from "framer-motion";
import { Album, FolderPlus, Loader2, Plus, Upload } from "lucide-react";

const AlbumModal: React.FC<{
	state: ContentState;
	setState: React.Dispatch<React.SetStateAction<ContentState>>;
	handleCreateAlbum: () => void;
}> = ({ state, setState, handleCreateAlbum }) => (
	<AnimatePresence>
		{state.showAlbumModal && (
			<>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
					onClick={() => setState((prev) => ({ ...prev, showAlbumModal: false }))}
				/>
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 20 }}
					className="fixed inset-4 z-50 flex items-center justify-center"
				>
					<div className="w-full max-w-lg bg-black/90 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
						<div className="mb-6">
							<h3 className="text-xl font-bold text-white mb-2">Add Songs to Album</h3>
							<p className="text-gray-400">
								Add {state.selectedSongs.size} selected song{state.selectedSongs.size > 1 ? "s" : ""} to an
								album
							</p>
						</div>
						<div className="mb-6">
							<div className="flex gap-2 bg-stone-900/15 backdrop-blur-sm rounded-xl p-1 border border-gray-700/30">
								<button
									onClick={() =>
										setState((prev) => ({
											...prev,
											albumFormData: { ...prev.albumFormData, isNewAlbum: true },
										}))
									}
									className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
										state.albumFormData.isNewAlbum
											? "bg-reggae-green/70 text-white shadow-lg"
											: "text-gray-300 hover:text-reggae-green hover:bg-stone-900/15"
									}`}
								>
									<Plus size={16} />
									New Album
								</button>
								<button
									onClick={() =>
										setState((prev) => ({
											...prev,
											albumFormData: { ...prev.albumFormData, isNewAlbum: false },
										}))
									}
									className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
										!state.albumFormData.isNewAlbum
											? "bg-reggae-yellow/80 text-white shadow-lg"
											: "text-gray-300 hover:text-reggae-yellow hover:bg-stone-900/15"
									}`}
								>
									<Album size={16} />
									Existing Album
								</button>
							</div>
						</div>
						{state.albumFormData.isNewAlbum ? (
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Album Title *</label>
									<input
										type="text"
										value={state.albumFormData.title}
										onChange={(e) =>
											setState((prev) => ({
												...prev,
												albumFormData: { ...prev.albumFormData, title: e.target.value },
											}))
										}
										className="w-full px-4 py-3 bg-stone-900/15 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400"
										placeholder="Enter album title"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
									<input
										type="text"
										value={state.albumFormData.artist}
										onChange={(e) =>
											setState((prev) => ({
												...prev,
												albumFormData: { ...prev.albumFormData, artist: e.target.value },
											}))
										}
										className="w-full px-4 py-3 bg-stone-900/15 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400"
										placeholder="Enter artist name"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Cover Art</label>
									<div className="relative">
										<input
											type="file"
											accept="image/*"
											onChange={(e) =>
												setState((prev) => ({
													...prev,
													albumFormData: { ...prev.albumFormData, coverArt: e.target.files?.[0] },
												}))
											}
											className="w-full px-4 py-3 bg-stone-900/15 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-reggae-green/20 file:text-reggae-green hover:file:bg-reggae-green/30"
										/>
										<Upload
											className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
											size={20}
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
									<textarea
										value={state.albumFormData.description}
										onChange={(e) =>
											setState((prev) => ({
												...prev,
												albumFormData: { ...prev.albumFormData, description: e.target.value },
											}))
										}
										className="w-full px-4 py-3 bg-stone-900/15 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400 resize-none"
										placeholder="Enter album description"
										rows={3}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Album Price (₦)</label>
									<input
										type="number"
										value={state.albumFormData.price}
										onChange={(e) =>
											setState((prev) => ({
												...prev,
												albumFormData: { ...prev.albumFormData, price: parseFloat(e.target.value) || 0 },
											}))
										}
										className="w-full px-4 py-3 bg-stone-900/15 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400"
										placeholder="0"
										min="0"
									/>
								</div>
								<div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-gray-700/30">
									<div>
										<h4 className="font-medium text-white">Featured Album</h4>
										<p className="text-sm text-gray-400">Show this album prominently on the platform</p>
									</div>
									<label className="relative inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={state.albumFormData.featured}
											onChange={(e) =>
												setState((prev) => ({
													...prev,
													albumFormData: { ...prev.albumFormData, featured: e.target.checked },
												}))
											}
											className="sr-only peer"
										/>
										<div className="w-11 h-6 bg-stone-900/15 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-reggae-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-reggae-green border border-gray-600"></div>
									</label>
								</div>
							</div>
						) : (
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Select Existing Album</label>
								<select
									value={state.albumFormData.existingAlbumId}
									onChange={(e) =>
										setState((prev) => ({
											...prev,
											albumFormData: { ...prev.albumFormData, existingAlbumId: e.target.value },
										}))
									}
									className="w-full px-4 py-3 bg-stone-900/15 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white"
								>
									<option value="">Choose an album...</option>
									{state.albums.map((album) => (
										<option key={album._id} value={album._id}>
											{album.title} by {album.artist} ({album.songIds.length} tracks)
										</option>
									))}
								</select>
							</div>
						)}
						<div className="flex gap-4 mt-8">
							<motion.button
								onClick={() => setState((prev) => ({ ...prev, showAlbumModal: false }))}
								disabled={state.saving}
								className="flex-1 px-4 py-2 bg-stone-900/15 border border-gray-700/30 text-white rounded-xl hover:bg-black/50 transition-colors duration-300 disabled:opacity-50"
								whileHover={{ scale: state.saving ? 1 : 1.02 }}
								whileTap={{ scale: state.saving ? 1 : 0.98 }}
							>
								Cancel
							</motion.button>
							<motion.button
								onClick={handleCreateAlbum}
								disabled={
									state.saving ||
									!state.albumFormData.title ||
									(!state.albumFormData.isNewAlbum && !state.albumFormData.existingAlbumId)
								}
								className="flex-1 px-4 py-2 bg-reggae-green/70 text-white rounded-xl hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
								whileHover={{ scale: state.saving ? 1 : 1.02 }}
								whileTap={{ scale: state.saving ? 1 : 0.98 }}
							>
								{state.saving ? (
									<>
										<Loader2 size={16} className="animate-spin" />
										{state.albumFormData.isNewAlbum ? "Creating..." : "Adding..."}
									</>
								) : (
									<>
										<FolderPlus size={16} />
										{state.albumFormData.isNewAlbum ? "Create Album" : "Add to Album"}
									</>
								)}
							</motion.button>
						</div>
					</div>
				</motion.div>
			</>
		)}
	</AnimatePresence>
);

export default AlbumModal;
