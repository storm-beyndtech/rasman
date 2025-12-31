"use client";

import React from "react";
import { motion } from "framer-motion";
import { Music, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface DashboardEmptyStateProps {
	type: "no-purchases" | "no-results";
	searchQuery?: string;
}

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ type, searchQuery }) => {
	const emptyStates = {
		"no-purchases": {
			icon: <Music size={64} />,
			title: "Your Music Library is Empty",
			description:
				"Start building your conscious reggae collection with Rasman's latest tracks and timeless classics.",
			action: (
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link
						href="/songs"
						className="inline-flex items-center gap-2 bg-reggae-green text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg group"
					>
						<ShoppingCart size={20} />
						Browse Songs
						<motion.div className="group-hover:translate-x-1 transition-transform duration-300">→</motion.div>
					</Link>
					<Link
						href="/albums"
						className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold hover:bg-black/30 transition-all duration-300 border border-white/20 hover:border-reggae-green/50"
					>
						<Music size={20} />
						View Albums
					</Link>
				</div>
			),
		},
		"no-results": {
			icon: <Search size={64} />,
			title: "No Results Found",
			description: `No music found matching "${searchQuery}". Try adjusting your search or browse all music.`,
			action: (
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<button
						onClick={() => window.location.reload()}
						className="bg-reggae-yellow/70 text-white px-8 py-2 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300"
					>
						Clear Filters
					</button>
					<Link
						href="/songs"
						className="bg-black/20 backdrop-blur-md text-white px-8 py-2 rounded-xl font-semibold hover:bg-black/30 transition-all duration-300 border border-white/20"
					>
						Browse All Music
					</Link>
				</div>
			),
		},
	};

	const currentState = emptyStates[type];

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
			<div className="bg-black/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 max-w-2xl mx-auto">
				{/* Icon */}
				<motion.div
					initial={{ scale: 0.8 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.2 }}
					className="w-20 h-20 mx-auto mb-6 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-gray-400"
				>
					{currentState.icon}
				</motion.div>

				{/* Content */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<h3 className="text-2xl font-bold text-white mb-4">{currentState.title}</h3>
					<p className="text-gray-400 mb-8 max-w-md mx-auto">{currentState.description}</p>
				</motion.div>

				{/* Action */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					{currentState.action}
				</motion.div>
			</div>
		</motion.div>
	);
};

export default DashboardEmptyState;
