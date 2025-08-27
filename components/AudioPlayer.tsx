"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Download } from "lucide-react";
import Image from "next/image";
import { useAudio } from "@/context/AudioProvider";

const AudioPlayer: React.FC = () => {
	const [showVolumeSlider, setShowVolumeSlider] = useState(false);
	const { audioState, pauseSong, resumeSong, seekTo, setVolume, downloadSong, formatTime } = useAudio();

	const { currentSong, isPlaying, isLoading, currentTime, duration, volume } = audioState;

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
		// You'll need to pass purchaseId somehow - maybe store it in context
		// downloadSong(currentSong, purchaseId);
		console.log("Download functionality - need purchaseId");
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ y: 100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: 100, opacity: 0 }}
				className="fixed bottom-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-2xl border-t border-white/20"
			>
				<div className="container mx-auto px-4 py-3">
					<div className="flex items-center gap-4">
						{/* Song Info */}
						<div className="flex items-center gap-3 min-w-0 flex-1">
							<div className="w-12 h-12 rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
								<Image
									src={currentSong.coverArtUrl}
									alt={currentSong.title}
									width={48}
									height={48}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="min-w-0 flex-1">
								<h3 className="text-white font-medium text-sm truncate">{currentSong.title}</h3>
								<p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
							</div>
						</div>

						{/* Controls */}
						<div className="flex items-center gap-2">
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

						{/* Progress Bar */}
						<div className="flex-1 max-w-md mx-4">
							<div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
								<span>{formatTime(currentTime)}</span>
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
								<span>{formatTime(duration)}</span>
							</div>
						</div>

						{/* Volume & Actions */}
						<div className="flex items-center gap-2">
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
