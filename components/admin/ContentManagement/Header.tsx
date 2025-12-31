import { IAlbum, ISong } from "@/lib/models";
import { motion } from "framer-motion";
import { FolderPlus } from "lucide-react";

const Header: React.FC<{
	activeTab: "songs" | "albums";
	songs: ISong[];
	albums: IAlbum[];
	selectedSongs: Set<string>;
	openAlbumModal: () => void;
}> = ({ activeTab, songs, albums, selectedSongs, openAlbumModal }) => (
	<div className="flex items-center justify-between">
		<div className="text-sm text-gray-400">{activeTab === "songs" ? songs.length : albums.length} items</div>
		{activeTab === "songs" && selectedSongs.size > 0 && (
			<div className="flex items-center gap-4">
				<span className="text-sm text-gray-400">
					{selectedSongs.size} song{selectedSongs.size > 1 ? "s" : ""} selected
				</span>
				<motion.button
					onClick={openAlbumModal}
					className="flex items-center gap-2 px-4 py-2 bg-reggae-green/80 text-white rounded-lg font-medium hover:bg-reggae-green transition-all duration-300 shadow-lg"
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					<FolderPlus size={16} />
					Add to Album
				</motion.button>
			</div>
		)}
	</div>
);

export default Header;
