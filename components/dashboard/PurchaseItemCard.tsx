"use client";

import React from "react";
import { motion } from "framer-motion";
import { Download, Play, Music, Calendar, Pause } from "lucide-react";
import Image from "next/image";
import { ISong, IAlbum, IPurchase } from "@/lib/models";
import { useAudio } from "@/provider/AudioProvider";

interface PurchaseItemCardProps {
	purchase: IPurchase & { item: ISong | IAlbum };
	index: number;
}

const PurchaseItemCard: React.FC<PurchaseItemCardProps> = ({ purchase, index }) => {
	const { playSong, pauseSong, resumeSong, downloadSong, audioState } = useAudio();
	const isCurrentSong = purchase.itemType === "song" && audioState.currentSong?._id === purchase.item._id;
	const isPlaying = isCurrentSong && audioState.isPlaying;

	const handlePlayPause = () => {
		if (isCurrentSong) {
			if (isPlaying) {
				pauseSong();
			} else {
				resumeSong();
			}
		} else {
			playSong(purchase.item as ISong, purchase._id);
		}
	};

	const formatCurrency = (amount: number): string => {
		return `₦${amount.toLocaleString()}`;
	};

	const formatDate = (date: string | Date): string => {
		return new Date(date).toLocaleDateString("en-GB", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05 }}
			className={`group bg-black/5 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:border-white/30 transition-all duration-500 hover:scale-[1.01] hover:shadow-xl ${
				isCurrentSong ? "border-reggae-green/50 bg-reggae-green/5" : ""
			}`}
		>
			<div className="flex items-center gap-6">
				{/* Cover Art */}
				<div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/20 flex-shrink-0">
					<Image
						src={purchase.item.coverArtUrl}
						alt={purchase.item.title}
						width={64}
						height={64}
						className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
					/>
					{isCurrentSong && (
						<div className="absolute inset-0 bg-reggae-green/20 flex items-center justify-center">
							<div className="w-2 h-2 bg-reggae-green rounded-full animate-pulse" />
						</div>
					)}
					<div className="absolute top-1 right-1">
						<div
							className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium ${
								purchase.itemType === "song" ? "bg-reggae-green/80" : "bg-reggae-yellow/80 text-black"
							}`}
						>
							{purchase.itemType === "song" ? "S" : "A"}
						</div>
					</div>
				</div>

				{/* Item Info */}
				<div className="flex-1 min-w-0">
					<h3
						className={`font-bold text-lg truncate transition-colors duration-300 ${
							isCurrentSong ? "text-reggae-green" : "text-white group-hover:text-reggae-green"
						}`}
					>
						{purchase.item.title}
					</h3>
					<p className="text-gray-400 text-sm truncate">{purchase.item.artist}</p>
					<div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
						<div className="flex items-center gap-1">
							<Calendar size={12} />
							{formatDate(purchase.purchaseDate)}
						</div>
						{purchase.itemType === "album" && (
							<div className="flex items-center gap-1">
								<Music size={12} />
								{(purchase.item as IAlbum).songIds?.length || 0} tracks
							</div>
						)}
					</div>
				</div>

				{/* Purchase Details & Actions */}
				<div className="text-right space-y-3 flex-shrink-0">
					<div className="font-bold text-reggae-green text-lg">{formatCurrency(purchase.amount)}</div>

					<div className="flex items-center gap-2">
						{/* Play Button (Songs only) */}
						{purchase.itemType === "song" && (
							<motion.button
								onClick={handlePlayPause}
								className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
									isPlaying
										? "bg-reggae-green text-white"
										: "bg-white/10 text-white hover:bg-reggae-green/20 hover:text-reggae-green"
								} backdrop-blur-sm border border-white/10 hover:border-reggae-green/30`}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								title={isPlaying ? "Playing" : "Play"}
							>
								{isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
							</motion.button>
						)}

						{/* Download Button */}
						<motion.button
							onClick={() => downloadSong(purchase.item as ISong, purchase._id)}
							className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-reggae-green/20 hover:text-reggae-green hover:border-reggae-green/30 transition-all duration-300"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							title="Download"
						>
							<Download size={16} />
						</motion.button>
					</div>

					{/* Status indicator */}
					<div className="flex items-center justify-end">
						<span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded-full">Owned</span>
					</div>
				</div>
			</div>

			{/* Progress bar for currently playing song */}
			{isCurrentSong && (
				<div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
					<div
						className="h-full bg-reggae-green transition-all duration-300"
						style={{
							width: `${(audioState.currentTime / audioState.duration) * 100}%`,
						}}
					/>
				</div>
			)}
		</motion.div>
	);
};

export default PurchaseItemCard;
