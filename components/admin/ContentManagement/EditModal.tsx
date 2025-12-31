import { ContentState } from "@/app/admin/content/page";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Save } from "lucide-react";

const EditModal: React.FC<{
	state: ContentState;
	setState: React.Dispatch<React.SetStateAction<ContentState>>;
	handleSaveEdit: () => void;
}> = ({ state, setState, handleSaveEdit }) => (
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
									className="w-full px-4 py-3 bg-stone-900/15 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400"
									placeholder="Enter title"
								/>
							</div>
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
									className="w-full px-4 py-3 bg-stone-900/15 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400"
									placeholder="Enter artist name"
								/>
							</div>
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
										className="w-full px-4 py-3 bg-stone-900/15 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white"
									>
										<option value="Reggae">Reggae</option>
										<option value="Roots">Roots</option>
										<option value="Dancehall">Dancehall</option>
										<option value="Dub">Dub</option>
									</select>
								</div>
							)}
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
										className="w-full px-4 py-3 bg-stone-900/15 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400 resize-none"
										placeholder="Enter album description"
										rows={3}
									/>
								</div>
							)}
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
									className="w-full px-4 py-3 bg-stone-900/15 border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400"
									placeholder="0"
									min="0"
								/>
							</div>
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
									<div className="w-11 h-6 bg-stone-900/15 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-reggae-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-reggae-green border border-gray-600"></div>
								</label>
							</div>
						</div>
						<div className="flex gap-4 mt-8">
							<motion.button
								onClick={() => setState((prev) => ({ ...prev, showEditModal: false }))}
								disabled={state.saving}
								className="flex-1 px-4 py-2 bg-stone-900/15 border border-gray-700/30 text-white rounded-xl hover:bg-black/50 transition-colors duration-300 disabled:opacity-50"
								whileHover={{ scale: state.saving ? 1 : 1.02 }}
								whileTap={{ scale: state.saving ? 1 : 0.98 }}
							>
								Cancel
							</motion.button>
							<motion.button
								onClick={handleSaveEdit}
								disabled={state.saving}
								className="flex-1 px-4 py-2 bg-reggae-green/70 text-white rounded-xl hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
);

export default EditModal;
