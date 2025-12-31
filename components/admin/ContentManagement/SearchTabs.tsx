import { ContentState } from "@/app/admin/content/page";
import { IAlbum, ISong } from "@/lib/models";
import { Disc, Music, Search } from "lucide-react";

const SearchTabs: React.FC<{
	activeTab: "songs" | "albums";
	songs: ISong[];
	albums: IAlbum[];
	searchQuery: string;
	setState: React.Dispatch<React.SetStateAction<ContentState>>;
}> = ({ activeTab, songs, albums, searchQuery, setState }) => (
	<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
		<div className="relative max-w-md w-full">
			<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
			<input
				type="text"
				placeholder="Search music..."
				value={searchQuery}
				onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
				className="w-full pl-12 pr-4 py-3 bg-stone-900/10 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400 transition-all duration-300"
			/>
		</div>
		<div className="flex gap-2 bg-stone-900/10 backdrop-blur-sm rounded-xl p-1 border border-gray-700/30">
			<button
				onClick={() => setState((prev) => ({ ...prev, activeTab: "songs" }))}
				className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
					activeTab === "songs"
						? "bg-reggae-green/70 text-white shadow-lg"
						: "text-gray-300 hover:text-reggae-green hover:bg-stone-900/10"
				}`}
			>
				<Music size={18} />
				Songs ({songs.length})
			</button>
			<button
				onClick={() => setState((prev) => ({ ...prev, activeTab: "albums" }))}
				className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
					activeTab === "albums"
						? "bg-reggae-yellow/80 text-white shadow-lg"
						: "text-gray-300 hover:text-reggae-yellow hover:bg-stone-900/10"
				}`}
			>
				<Disc size={18} />
				Albums ({albums.length})
			</button>
		</div>
	</div>
);

export default SearchTabs;
