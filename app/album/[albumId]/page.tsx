"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	Calendar,
	Clock,
	Music,
	Play,
	ArrowLeft,
	Share2,
	Download,
	Star,
	DollarSign,
	Heart,
} from "lucide-react";
import { IAlbum, ISong } from "@/lib/models";
import PurchaseButton from "@/components/PurchaseButton";
import { useAudio } from "@/context/AudioProvider";

interface AlbumDetailPageProps {
	album: IAlbum;
	songs: ISong[];
}

const AlbumDetailPage: React.FC<AlbumDetailPageProps> = ({ album, songs }) => {
	const { hasPurchased, playSong, audioState } = useAudio();

	// Calculate total duration
	const totalDuration = songs.reduce((total, song) => total + song.duration, 0);
	const totalMinutes = Math.floor(totalDuration / 60);

	// Format date
	const formatDate = (date: Date | string): string => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		return dateObj.toLocaleDateString("en-GB", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Format price
	const formatPrice = (price: number): string => {
		return `₦${price.toLocaleString()}`;
	};

	// Format duration
	const formatDuration = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const fadeInVariants = {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0 },
	};

	return (
		<div className="min-h-screen bg-black pt-20 pb-20 relative overflow-hidden">
			{/* Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-reggae-red/5 via-black to-reggae-yellow/5 pointer-events-none" />
			<div className="absolute top-20 left-20 w-96 h-96 bg-reggae-red/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-20 right-20 w-72 h-72 bg-reggae-yellow/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-reggae-green/5 rounded-full blur-3xl pointer-events-none" />

			<div className="container mx-auto px-4 py-8 relative z-10">
				{/* Back Button */}
				<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
					<Link
						href="/albums"
						className="inline-flex items-center gap-2 text-gray-400 hover:text-reggae-yellow transition-colors duration-300"
					>
						<ArrowLeft size={20} />
						Back to Albums
					</Link>
				</motion.div>

				{/* Album Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
				>
					{/* Album Cover */}
					<div className="relative">
						<div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl">
							<Image
								src={album.coverArtUrl}
								alt={`${album.title} cover`}
								fill
								className="object-cover"
								priority
							/>

							{/* Glassmorphism Overlay */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

							{/* Featured Badge */}
							{album.featured && (
								<div className="absolute top-6 left-6 px-4 py-2 bg-reggae-yellow/80 backdrop-blur-sm border border-reggae-yellow/30 text-black text-sm font-bold rounded-full">
									<Star size={14} className="inline mr-1" />
									Featured Album
								</div>
							)}

							{/* Play Button Overlay */}
							<div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm">
								<motion.button
									className="w-20 h-20 bg-reggae-green/80 backdrop-blur-sm border border-reggae-green/30 text-white rounded-full flex items-center justify-center hover:bg-reggae-green transition-all duration-300 shadow-lg"
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
								>
									<Play size={32} className="ml-1" />
								</motion.button>
							</div>
						</div>

						{/* Decorative Elements */}
						<div className="absolute -top-6 -right-6 w-24 h-24 bg-reggae-green/20 rounded-full blur-2xl"></div>
						<div className="absolute -bottom-6 -left-6 w-32 h-32 bg-reggae-yellow/20 rounded-full blur-2xl"></div>
					</div>

					{/* Album Info */}
					<div className="space-y-8">
						<div>
							<motion.h1
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="text-4xl md:text-6xl font-bold font-serif text-white mb-4"
							>
								{album.title}
							</motion.h1>

							<motion.p
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
								className="text-2xl text-reggae-yellow mb-6"
							>
								by {album.artist}
							</motion.p>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="flex flex-wrap items-center gap-6 text-gray-400"
							>
								<div className="flex items-center gap-2">
									<Calendar size={18} />
									<span>{formatDate(album.releaseDate)}</span>
								</div>
								<div className="flex items-center gap-2">
									<Music size={18} />
									<span>{songs.length} tracks</span>
								</div>
								<div className="flex items-center gap-2">
									<Clock size={18} />
									<span>{totalMinutes} minutes</span>
								</div>
							</motion.div>
						</div>

						{/* Description */}
						{album.description && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
								className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-6"
							>
								<h3 className="text-lg font-semibold text-white mb-3">About This Album</h3>
								<p className="text-gray-300 leading-relaxed">{album.description}</p>
							</motion.div>
						)}

						{/* Price and Purchase */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
							className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8"
						>
							<div className="flex items-center justify-between mb-6">
								<div>
									<div className="text-sm text-gray-400 mb-1">Complete Album</div>
									<div className="text-4xl font-bold text-reggae-yellow">{formatPrice(album.price)}</div>
								</div>
								<div className="text-right">
									<div className="text-sm text-gray-400 mb-1">Individual Songs</div>
									<div className="text-lg font-semibold text-gray-300">
										{formatPrice(songs.reduce((total, song) => total + song.price, 0))}
									</div>
									<div className="text-xs text-reggae-green">
										Save {formatPrice(songs.reduce((total, song) => total + song.price, 0) - album.price)}!
									</div>
								</div>
							</div>

							<div className="space-y-4">
								{hasPurchased(album._id, "album") ? (
									<div className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-reggae-green/20 border border-reggae-green/30 text-reggae-green rounded-xl font-semibold">
										<Heart size={20} />
										Album Owned
									</div>
								) : (
									<PurchaseButton
										item={album}
										itemType="album"
										size="lg"
										className="w-full justify-center text-lg"
									/>
								)}

								<div className="flex gap-3">
									<motion.button
										className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 text-white rounded-xl font-semibold hover:bg-black/50 hover:border-reggae-green/30 transition-all duration-300"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Play size={20} />
										Preview Album
									</motion.button>
									<motion.button
										className="flex items-center justify-center gap-2 px-6 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 text-gray-400 rounded-xl hover:bg-black/50 hover:text-white transition-all duration-300"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Share2 size={20} />
									</motion.button>
									{hasPurchased(album._id, "album") && (
										<motion.button
											className="flex items-center justify-center gap-2 px-6 py-3 bg-reggae-green/20 border border-reggae-green/30 text-reggae-green rounded-xl hover:bg-reggae-green/30 transition-all duration-300"
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											<Download size={20} />
										</motion.button>
									)}
								</div>
							</div>
						</motion.div>
					</div>
				</motion.div>

				{/* Track Listing */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7 }}
					className="mb-16"
				>
					<div className="flex items-center justify-between mb-8">
						<h2 className="text-3xl font-bold font-serif text-white">Track Listing</h2>
						<div className="text-gray-400">
							{songs.length} songs • {totalMinutes} min
						</div>
					</div>

					<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl overflow-hidden">
						<div className="divide-y divide-gray-700/30">
							{songs.map((song, index) => {
								const isCurrentSong = audioState.currentSong?._id === song._id;
								const isPlaying = isCurrentSong && audioState.isPlaying;
								const isPurchased = hasPurchased(song._id, "song") || hasPurchased(album._id, "album");

								return (
									<motion.div
										key={song._id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.8 + index * 0.05 }}
										className={`p-6 hover:bg-black/30 transition-all duration-300 group ${
											isCurrentSong ? "bg-reggae-green/10 border-l-4 border-reggae-green" : ""
										}`}
									>
										<div className="flex items-center gap-6">
											{/* Track Number */}
											<div
												className={`w-8 text-center font-bold ${
													isCurrentSong ? "text-reggae-green" : "text-gray-400"
												}`}
											>
												{isPlaying ? (
													<div className="flex items-center justify-center">
														<div className="w-1 h-3 bg-reggae-green rounded-full animate-pulse mx-0.5"></div>
														<div
															className="w-1 h-3 bg-reggae-green rounded-full animate-pulse mx-0.5"
															style={{ animationDelay: "0.2s" }}
														></div>
														<div
															className="w-1 h-3 bg-reggae-green rounded-full animate-pulse mx-0.5"
															style={{ animationDelay: "0.4s" }}
														></div>
													</div>
												) : (
													(index + 1).toString().padStart(2, "0")
												)}
											</div>

											{/* Song Cover */}
											<div className="relative w-16 h-16 rounded-lg overflow-hidden">
												<Image
													src={song.coverArtUrl}
													alt={`${song.title} cover`}
													fill
													className="object-cover"
												/>
												{isCurrentSong && (
													<div className="absolute inset-0 bg-reggae-green/20 flex items-center justify-center">
														<div className="w-2 h-2 bg-reggae-green rounded-full animate-pulse" />
													</div>
												)}
											</div>

											{/* Song Info */}
											<div className="flex-1 min-w-0">
												<h3
													className={`font-bold text-lg truncate transition-colors duration-300 ${
														isCurrentSong ? "text-reggae-green" : "text-white group-hover:text-reggae-green"
													}`}
												>
													{song.title}
												</h3>
												<p className="text-gray-400">{song.artist}</p>
												<div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
													<span>{formatDuration(song.duration)}</span>
													<span>•</span>
													<span>{song.genre}</span>
													{isPurchased && (
														<>
															<span>•</span>
															<span className="text-reggae-green">Owned</span>
														</>
													)}
												</div>
											</div>

											{/* Individual Song Price & Actions */}
											<div className="text-right flex items-center gap-4">
												<div>
													<div className="flex items-center gap-1 mb-2">
														<DollarSign size={14} className="text-reggae-green" />
														<span className="font-bold text-reggae-green">{formatPrice(song.price)}</span>
													</div>
													{!isPurchased && (
														<PurchaseButton item={song} itemType="song" size="sm" variant="outline" />
													)}
												</div>

												{/* Play Button */}
												{isPurchased && (
													<motion.button
														onClick={() => playSong(song)}
														className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
															isPlaying
																? "bg-reggae-green text-white"
																: "bg-reggae-green/20 border border-reggae-green/30 text-reggae-green hover:bg-reggae-green hover:text-white"
														}`}
														whileHover={{ scale: 1.05 }}
														whileTap={{ scale: 0.95 }}
													>
														<Play size={16} className="ml-0.5" />
													</motion.button>
												)}
											</div>
										</div>
									</motion.div>
								);
							})}
						</div>
					</div>
				</motion.div>

				{/* Related Albums */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1.2 }}
				>
					<h2 className="text-3xl font-bold font-serif text-white mb-8">
						More Albums by <span className="text-reggae-yellow">{album.artist}</span>
					</h2>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Placeholder for related albums */}
						<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8 text-center hover:border-gray-600/50 transition-all duration-300">
							<div className="w-16 h-16 bg-gradient-to-br from-reggae-green to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
								<Music className="text-white" size={32} />
							</div>
							<h3 className="text-lg font-semibold text-white mb-2">More Music Coming Soon</h3>
							<p className="text-gray-400 mb-4">
								Stay tuned for more conscious reggae albums from {album.artist}
							</p>
							<Link
								href="/albums"
								className="inline-flex items-center gap-2 text-reggae-green hover:text-green-400 font-semibold transition-colors duration-300"
							>
								Browse All Albums
								<ArrowLeft size={16} className="rotate-180" />
							</Link>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default AlbumDetailPage;
