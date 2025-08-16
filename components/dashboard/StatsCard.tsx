"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	change?: string;
	color: "green" | "yellow" | "red" | "gray";
	index: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, change, color, index }) => {
	const colorClasses = {
		green: "from-reggae-green/20 to-green-600/10 border-reggae-green/30",
		yellow: "from-reggae-yellow/20 to-yellow-600/10 border-reggae-yellow/30",
		red: "from-red-500/20 to-red-600/10 border-red-500/30",
		gray: "from-gray-500/20 to-gray-600/10 border-gray-500/30",
	};

	const iconColors = {
		green: "text-reggae-green",
		yellow: "text-reggae-yellow",
		red: "text-red-500",
		gray: "text-gray-400",
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
			className={`relative group bg-black/10 backdrop-blur-md border rounded-xl p-6 hover:scale-[1.02] transition-all duration-500 hover:shadow-xl ${colorClasses[color]}`}
		>
			{/* Background gradient */}
			<div
				className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl ${colorClasses[color]}`}
			/>

			<div className="relative z-10">
				<div className="flex items-center justify-between mb-4">
					<div
						className={`w-12 h-12 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 flex items-center justify-center ${iconColors[color]}`}
					>
						{icon}
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-white">{value}</div>
						{change && <div className="text-xs text-gray-400">{change}</div>}
					</div>
				</div>
				<h3 className="font-semibold text-gray-300 group-hover:text-white transition-colors duration-300">
					{title}
				</h3>
			</div>
		</motion.div>
	);
};

export default StatsCard;


