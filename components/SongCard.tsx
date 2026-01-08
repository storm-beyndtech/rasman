"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, ShoppingCart, Lock, CheckCircle, Download } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import { ISong } from "@/lib/models";
import { useAudio } from "@/provider/AudioProvider";

interface SongCardProps {
	song: ISong;
	index: number;
	purchaseId?: string;
	viewMode?: "grid" | "list";
}

const SongCard: React.FC<SongCardProps> = ({ song, index, purchaseId, viewMode = "grid" }) => {
	const { isSignedIn } = useUser();
	const {
		audioState,
		playSong,
		pauseSong,
		resumeSong,
		downloadSong,
		purchaseSong,
		hasPurchased,
		formatTime,
	} = useAudio();

	const purchased = hasPurchased(song._id, "song");
	const isCurrentSong = audioState.currentSong?._id === song._id;
	const isPlaying = isCurrentSong && audioState.isPlaying;
	const isLoading = isCurrentSong && audioState.isLoading;

	const handlePlayPause = () => {
		if (!isSignedIn) return;

		if (purchased) {
			if (isCurrentSong) {
				if (isPlaying) {
					pauseSong();
				} else {
					resumeSong();
				}
			} else {
				playSong(song);
			}
		}
	};

	const handleDownload = () => {
		if (purchased && purchaseId) {
			downloadSong(song, purchaseId);
		}
	};

	const handlePurchase = () => {
		if (isSignedIn && !purchased) {
			purchaseSong(song);
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
		}).format(price);
	};

	// Grid View (Your current design)
	if (viewMode === "grid") {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.1 }}
				className="group relative overflow-hidden rounded-xl bg-black/10 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:shadow-xl w-[300px] h-[300px] flex-shrink-0"
			>
				{/* Background Gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-reggae-green/5 via-transparent to-reggae-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

				{/* Playing indicator overlay */}
				{isCurrentSong && (
					<div className="absolute inset-0 bg-reggae-green/10 flex items-center justify-center pointer-events-none">
						{isLoading && (
							<div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						)}
					</div>
				)}

				{/* Content */}
				<div className="relative p-4 h-full flex flex-col justify-between">
					{/* Cover Art */}
					<div className="relative w-[270px] h-auto mx-auto rounded-lg overflow-hidden bg-black/20 mb-4">
						<Image
							src={song.coverArtUrl}
							alt={song.title}
							width={270}
							height={270}
							className="object-cover transition-transform duration-500 group-hover:scale-110"
						/>

						{/* Overlay with action button */}
						<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
							{!isSignedIn ? (
								<SignInButton mode="modal">
									<motion.button
										className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors duration-300"
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
									>
										<Lock size={16} />
									</motion.button>
								</SignInButton>
							) : purchased ? (
								<motion.button
									onClick={handlePlayPause}
									className="w-12 h-12 rounded-full bg-reggae-green/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-reggae-green transition-colors duration-300"
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
									disabled={isLoading}
								>
									{isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
								</motion.button>
							) : (
								<motion.button
									onClick={handlePurchase}
									className="w-12 h-12 rounded-full bg-reggae-yellow/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-reggae-yellow transition-colors duration-300"
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
								>
									<ShoppingCart size={16} />
								</motion.button>
							)}
						</div>

						{/* Purchase status indicator */}
						{isSignedIn && purchased && (
							<div className="absolute top-2 right-2">
								<div className="bg-reggae-green/90 backdrop-blur-sm rounded-full p-1">
									<CheckCircle size={12} className="text-white" />
								</div>
							</div>
						)}

						{/* Download button - bottom right when purchased */}
						{isSignedIn && purchased && purchaseId && (
							<motion.button
								onClick={handleDownload}
								className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors duration-300 opacity-0 group-hover:opacity-100"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								title="Download"
							>
								<Download size={14} />
							</motion.button>
						)}
					</div>

					{/* Song Info */}
					<div>
						<h3
							className={`mb-[2px] font-bold text-sm leading-tight line-clamp-2 transition-colors duration-300 ${
								isCurrentSong ? "text-reggae-green" : "text-gray-300 group-hover:text-reggae-green"
							}`}
						>
							{song.title}
						</h3>
						<div className="flex items-center justify-between text-xs">
							<span className="text-reggae-green font-semibold">{formatPrice(song.price)}</span>
							<span className="text-gray-400">{formatTime(song.duration)}</span>
						</div>
					</div>
				</div>

				{/* Now playing progress bar */}
				{isCurrentSong && (
					<div className="absolute bottom-0 left-0 right-0 h-1 bg-reggae-green/30">
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
	}

	// List View
	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.05 }}
			className="group relative overflow-hidden rounded-lg bg-black/10 backdrop-blur-md transition-all duration-300 hover:bg-black/20 flex items-center p-4 gap-4"
		>
			{/* Background Gradient */}
			<div className="absolute inset-0 bg-gradient-to-r from-reggae-green/5 via-transparent to-reggae-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

			{/* Cover Art */}
			<div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
				<Image
					src={song.coverArtUrl}
					alt={song.title}
					width={64}
					height={64}
					className="object-cover transition-transform duration-300 group-hover:scale-110"
				/>

				{/* Playing indicator */}
				{isCurrentSong && (
					<div className="absolute inset-0 bg-reggae-green/20 flex items-center justify-center">
						{isLoading ? (
							<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						) : (
							<div className="w-2 h-2 bg-reggae-green rounded-full animate-pulse" />
						)}
					</div>
				)}

				{/* Purchase status indicator */}
				{isSignedIn && purchased && (
					<div className="absolute top-1 right-1">
						<div className="bg-reggae-green/90 backdrop-blur-sm rounded-full p-0.5">
							<CheckCircle size={8} className="text-white" />
						</div>
					</div>
				)}
			</div>

			{/* Song Info */}
			<div className="flex-1 min-w-0">
				<h3
					className={`font-bold text-sm truncate transition-colors duration-300 ${
						isCurrentSong ? "text-reggae-green" : "text-gray-300 group-hover:text-reggae-green"
					}`}
				>
					{song.title}
				</h3>
				<p className="text-gray-400 text-xs truncate">{song.genre}</p>
			</div>

			{/* Duration */}
			<div className="text-gray-400 text-xs font-medium">{formatTime(song.duration)}</div>

			{/* Price */}
			<div className="text-reggae-green font-semibold text-sm">{formatPrice(song.price)}</div>

			{/* Actions */}
			<div className="flex items-center gap-2">
				{/* Download button for purchased songs */}
				{isSignedIn && purchased && purchaseId && (
					<motion.button
						onClick={handleDownload}
						className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors duration-300 opacity-0 group-hover:opacity-100"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						title="Download"
					>
						<Download size={14} />
					</motion.button>
				)}

				{/* Play/Purchase button */}
				{!isSignedIn ? (
					<SignInButton mode="modal">
						<motion.button
							className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors duration-300"
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
						>
							<Lock size={14} />
						</motion.button>
					</SignInButton>
				) : purchased ? (
					<motion.button
						onClick={handlePlayPause}
						className="w-8 h-8 rounded-full bg-reggae-green/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-reggae-green transition-colors duration-300"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						disabled={isLoading}
					>
						{isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
					</motion.button>
				) : (
					<motion.button
						onClick={handlePurchase}
						className="w-8 h-8 rounded-full bg-reggae-yellow/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-reggae-yellow transition-colors duration-300"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
					>
						<ShoppingCart size={14} />
					</motion.button>
				)}
			</div>

			{/* Progress bar for list view */}
			{isCurrentSong && (
				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-reggae-green/30">
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

export default SongCard;
