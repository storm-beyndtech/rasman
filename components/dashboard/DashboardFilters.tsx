"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface DashboardFiltersProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	activeFilter: "all" | "songs" | "albums";
	onFilterChange: (filter: "all" | "songs" | "albums") => void;
	counts: {
		all: number;
		songs: number;
		albums: number;
	};
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
	searchQuery,
	onSearchChange,
	activeFilter,
	onFilterChange,
	counts,
}) => {
	const filters = [
		{ key: "all" as const, label: "All", count: counts.all },
		{ key: "songs" as const, label: "Songs", count: counts.songs },
		{ key: "albums" as const, label: "Albums", count: counts.albums },
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			className="bg-black/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8"
		>
			<div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
				{/* Search */}
				<div className="relative flex-1 max-w-md w-full">
					<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
					<input
						type="text"
						placeholder="Search your music..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="w-full pl-12 pr-4 py-3 bg-black/5 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400 transition-all duration-300"
					/>
				</div>

				{/* Filter Tabs */}
				<div className="flex gap-2 bg-black/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
					{filters.map((tab) => (
						<motion.button
							key={tab.key}
							onClick={() => onFilterChange(tab.key)}
							className={`px-4 py-1.5 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
								activeFilter === tab.key
									? "bg-reggae-green/70 text-white shadow-lg"
									: "text-gray-300 hover:text-reggae-green hover:bg-white/5"
							}`}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							{tab.label} ({tab.count})
						</motion.button>
					))}
				</div>
			</div>
		</motion.div>
	);
};

export default DashboardFilters;
