import { ContentState } from "@/app/admin/content/page";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";

const DeleteModal: React.FC<{
	state: ContentState;
	setState: React.Dispatch<React.SetStateAction<ContentState>>;
	handleDelete: () => void;
}> = ({ state, setState, handleDelete }) => (
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
								Are you sure you want to delete "{state.deletingItem.title}"? This action cannot be undone.
								{!("genre" in state.deletingItem) && " All songs in this album will also be deleted."}
							</p>
							<div className="flex gap-4">
								<motion.button
									onClick={() =>
										setState((prev) => ({ ...prev, showDeleteModal: false, deletingItem: null }))
									}
									disabled={state.saving}
									className="flex-1 px-4 py-2 bg-black/30 border border-gray-700/30 text-white rounded-xl hover:bg-black/50 transition-colors duration-300 disabled:opacity-50"
									whileHover={{ scale: state.saving ? 1 : 1.02 }}
									whileTap={{ scale: state.saving ? 1 : 0.98 }}
								>
									Cancel
								</motion.button>
								<motion.button
									onClick={handleDelete}
									disabled={state.saving}
									className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
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
);

export default DeleteModal;
