"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Download, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useAudio } from "@/provider/AudioProvider";

const AudioPlayer: React.FC = () => {
	const [showVolumeSlider, setShowVolumeSlider] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const { audioState, pauseSong, resumeSong, seekTo, setVolume, downloadSong, formatTime } = useAudio();

	const { currentSong, currentPurchaseId, isPlaying, isLoading, currentTime, duration, volume } = audioState;

	// Don't render if no current song
	if (!currentSong) return null;

	const handlePlayPause = () => {
		if (isPlaying) {
			pauseSong();
		} else {
			resumeSong();
		}
	};

	const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const percent = (e.clientX - rect.left) / rect.width;
		const newTime = percent * duration;
		seekTo(newTime);
	};

	const handleVolumeChange = (newVolume: number) => {
		setVolume(Math.max(0, Math.min(1, newVolume)));
	};

	const handleDownload = () => {
		if (!currentPurchaseId) {
			console.error("No purchase ID available for download");
			return;
		}
		downloadSong(currentSong, currentPurchaseId);
	};

	// Minimized view - just a floating disk
	if (isMinimized) {
		return (
			<motion.div
				initial={{ scale: 0, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0, opacity: 0 }}
				className="fixed bottom-4 right-4 z-50"
			>
				<motion.button
					onClick={() => setIsMinimized(false)}
					className="relative w-16 h-16 rounded-full bg-black/40 backdrop-blur-2xl border-2 border-reggae-green/50 overflow-hidden shadow-2xl group"
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
				>
					{/* Rotating disk */}
					<motion.div
						animate={{ rotate: isPlaying ? 360 : 0 }}
						transition={{
							duration: 3,
							repeat: isPlaying ? Infinity : 0,
							ease: "linear",
						}}
						className="absolute inset-0"
					>
						<Image
							src={currentSong.coverArtUrl}
							alt={currentSong.title}
							width={64}
							height={64}
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/50" />
					</motion.div>

					{/* Center play/pause icon */}
					<div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
						<motion.div
							onClick={(e) => {
								e.stopPropagation();
								handlePlayPause();
							}}
							className="w-8 h-8 rounded-full bg-reggae-green flex items-center justify-center text-white"
							whileHover={{ scale: 1.2 }}
							whileTap={{ scale: 0.9 }}
						>
							{isLoading ? (
								<div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : isPlaying ? (
								<Pause size={14} />
							) : (
								<Play size={14} className="ml-0.5" />
							)}
						</motion.div>
					</div>

					{/* Progress ring */}
					<svg className="absolute inset-0 w-full h-full -rotate-90">
						<circle
							cx="32"
							cy="32"
							r="30"
							stroke="rgba(34, 197, 94, 0.2)"
							strokeWidth="2"
							fill="none"
						/>
						<circle
							cx="32"
							cy="32"
							r="30"
							stroke="rgba(34, 197, 94, 1)"
							strokeWidth="2"
							fill="none"
							strokeDasharray={`${2 * Math.PI * 30}`}
							strokeDashoffset={`${2 * Math.PI * 30 * (1 - currentTime / duration)}`}
							className="transition-all duration-300"
						/>
					</svg>
				</motion.button>
			</motion.div>
		);
	}

	// Full player view
	return (
		<AnimatePresence>
			<motion.div
				initial={{ y: 100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 100, opacity: 0 }}
				className="fixed bottom-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-2xl border-t border-white/20"
			>
				<div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
					<div className="flex items-center gap-2 sm:gap-4">
						{/* Song Info */}
						<div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-black/20 flex-shrink-0 relative">
								<motion.div
									animate={{ rotate: isPlaying ? 360 : 0 }}
									transition={{
										duration: 10,
										repeat: isPlaying ? Infinity : 0,
										ease: "linear",
									}}
								>
									<Image
										src={currentSong.coverArtUrl}
										alt={currentSong.title}
										width={48}
										height={48}
										className="w-full h-full object-cover"
									/>
								</motion.div>
							</div>
							<div className="min-w-0 flex-1">
								<h3 className="text-white font-medium text-xs sm:text-sm truncate">{currentSong.title}</h3>
								<p className="text-gray-400 text-[10px] sm:text-xs truncate">{currentSong.artist}</p>
							</div>
						</div>

						{/* Mobile: Play/Pause + Minimize */}
						<div className="flex items-center gap-2 sm:hidden">
							<motion.button
								onClick={handlePlayPause}
								className="w-10 h-10 rounded-full bg-reggae-green/90 backdrop-blur-sm flex items-center justify-center text-white"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								disabled={isLoading}
							>
								{isLoading ? (
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								) : isPlaying ? (
									<Pause size={18} />
								) : (
									<Play size={18} className="ml-0.5" />
								)}
							</motion.button>

							<motion.button
								onClick={() => setIsMinimized(true)}
								className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								title="Minimize"
							>
								<ChevronDown size={16} />
							</motion.button>
						</div>

						{/* Desktop: Full Controls */}
						<div className="hidden sm:flex items-center gap-2">
							<motion.button
								onClick={() => {}} // Skip previous - not implemented yet
								className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								disabled
							>
								<SkipBack size={16} />
							</motion.button>

							<motion.button
								onClick={handlePlayPause}
								className="w-10 h-10 rounded-full bg-reggae-green/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-reggae-green transition-colors duration-300"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								disabled={isLoading}
							>
								{isLoading ? (
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								) : isPlaying ? (
									<Pause size={20} />
								) : (
									<Play size={20} className="ml-0.5" />
								)}
							</motion.button>

							<motion.button
								onClick={() => {}} // Skip next - not implemented yet
								className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								disabled
							>
								<SkipForward size={16} />
							</motion.button>
						</div>

						{/* Progress Bar - Desktop Only */}
						<div className="hidden md:flex flex-1 max-w-md mx-4">
							<div className="flex items-center gap-2 text-xs text-gray-400 mb-1 w-full flex-col">
								<div className="flex items-center gap-2 w-full">
									<span className="text-[10px]">{formatTime(currentTime)}</span>
									<div className="flex-1">
										<div
											className="h-1 bg-white/20 rounded-full cursor-pointer group"
											onClick={handleProgressChange}
										>
											<div
												className="h-full bg-reggae-green rounded-full transition-all duration-300 group-hover:bg-reggae-green/80 relative"
												style={{ width: `${(currentTime / duration) * 100}%` }}
											>
												<div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-reggae-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											</div>
										</div>
									</div>
									<span className="text-[10px]">{formatTime(duration)}</span>
								</div>
							</div>
						</div>

						{/* Volume & Actions - Desktop Only */}
						<div className="hidden sm:flex items-center gap-2">
							{/* Download button */}
							<motion.button
								onClick={handleDownload}
								className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								title="Download"
							>
								<Download size={16} />
							</motion.button>

							{/* Volume control */}
							<div
								className="relative flex items-center gap-2"
								onMouseEnter={() => setShowVolumeSlider(true)}
								onMouseLeave={() => setShowVolumeSlider(false)}
							>
								<motion.button
									onClick={() => handleVolumeChange(volume > 0 ? 0 : 1)}
									className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300"
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
								>
									{volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
								</motion.button>

								{/* Volume slider */}
								<AnimatePresence>
									{showVolumeSlider && (
										<motion.div
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -10 }}
											className="absolute right-full mr-2 bg-black/40 backdrop-blur-md rounded-lg p-2 border border-white/20"
										>
											<input
												type="range"
												min="0"
												max="1"
												step="0.1"
												value={volume}
												onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
												className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer volume-slider"
											/>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Minimize button */}
							<motion.button
								onClick={() => setIsMinimized(true)}
								className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								title="Minimize"
							>
								<ChevronDown size={16} />
							</motion.button>
						</div>
					</div>

					{/* Mobile Progress Bar */}
					<div className="md:hidden mt-2 w-full">
						<div
							className="h-1 bg-white/20 rounded-full cursor-pointer"
							onClick={handleProgressChange}
						>
							<div
								className="h-full bg-reggae-green rounded-full transition-all duration-300"
								style={{ width: `${(currentTime / duration) * 100}%` }}
							/>
						</div>
						<div className="flex justify-between text-[10px] text-gray-400 mt-1">
							<span>{formatTime(currentTime)}</span>
							<span>{formatTime(duration)}</span>
						</div>
					</div>
				</div>

				{/* Glassmorphic background effects */}
				<div className="absolute inset-0 bg-gradient-to-r from-reggae-green/5 via-transparent to-reggae-yellow/5 pointer-events-none" />

				<style jsx>{`
					.volume-slider::-webkit-slider-thumb {
						appearance: none;
						width: 12px;
						height: 12px;
						background: #22c55e;
						border-radius: 50%;
						cursor: pointer;
					}

					.volume-slider::-moz-range-thumb {
						width: 12px;
						height: 12px;
						background: #22c55e;
						border-radius: 50%;
						border: none;
						cursor: pointer;
					}
				`}</style>
			</motion.div>
		</AnimatePresence>
	);
};

export default AudioPlayer;
