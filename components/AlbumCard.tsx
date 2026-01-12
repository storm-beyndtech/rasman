"use client";

import React from "react";
import { motion } from "framer-motion";
import { Music, ShoppingCart, Lock, CheckCircle, Download } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { IAlbum } from "@/lib/models";
import { useAudio } from "@/provider/AudioProvider";

interface AlbumCardProps {
	album: IAlbum;
	index: number;
	purchaseId?: string;
	viewMode?: "grid" | "list";
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, index, purchaseId, viewMode = "grid" }) => {
	const { isSignedIn } = useUser();
	const {
		downloadAlbum, // You'll need to implement this in AudioContext
		purchaseAlbum, // You'll need to implement this in AudioContext
		hasPurchased,
	} = useAudio();

	const purchased = hasPurchased(album._id, "album");

	const handleDownload = () => {
		if (purchased && purchaseId) {
			// downloadAlbum(album, purchaseId);
			console.log("Download album - implement in AudioContext");
		}
	};

	const handlePurchase = () => {
		if (isSignedIn && !purchased) {
			// purchaseAlbum(album);
			console.log("Purchase album - implement in AudioContext");
		}
	};

	const formatPrice = (price: number) => {
		return `₦${price.toLocaleString()}`;
	};

	// Grid View
	if (viewMode === "grid") {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: index * 0.1 }}
				className="group relative overflow-hidden rounded-xl bg-black/10 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:shadow-xl w-[300px] h-[300px] flex-shrink-0"
			>
				{/* Background Gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-reggae-yellow/5 via-transparent to-reggae-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

				{/* Content */}
				<div className="relative p-5 h-full flex flex-col justify-between">
					{/* Cover Art */}
					<div className="relative w-[260px] mx-auto rounded-lg overflow-hidden bg-black/20 mb-4">
						<Image
							src={album.coverArtUrl}
							alt={album.title}
							width={260}
							height={260}
							className="h-auto object-cover transition-transform duration-500 group-hover:scale-110"
						/>

						{/* Track count badge */}
						<div className="absolute top-2 left-2">
							<div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white">
								{album.songIds?.length || 0}
							</div>
						</div>

						{/* Purchase status indicator */}
						{isSignedIn && purchased && (
							<div className="absolute top-2 right-2">
								<div className="bg-reggae-yellow/90 backdrop-blur-sm rounded-full p-1">
									<CheckCircle size={12} className="text-black" />
								</div>
							</div>
						)}

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
								<Link href={`/albums/${album._id}`}>
									<motion.button
										className="w-12 h-12 rounded-full bg-reggae-yellow/90 backdrop-blur-sm flex items-center justify-center text-black hover:bg-reggae-yellow transition-colors duration-300"
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
									>
										<Music size={16} />
									</motion.button>
								</Link>
							) : (
								<motion.button
									onClick={handlePurchase}
									className="w-12 h-12 rounded-full bg-reggae-green/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-reggae-green transition-colors duration-300"
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.95 }}
								>
									<ShoppingCart size={16} />
								</motion.button>
							)}
						</div>

						{/* Download button - bottom right when purchased */}
						{isSignedIn && purchased && purchaseId && (
							<motion.button
								onClick={handleDownload}
								className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors duration-300 opacity-0 group-hover:opacity-100"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
								title="Download Album"
							>
								<Download size={14} />
							</motion.button>
						)}
					</div>

					{/* Album Info */}
					<div>
						<h3 className="mb-[2px] font-bold text-gray-300 text-sm leading-tight line-clamp-2 group-hover:text-reggae-yellow transition-colors duration-300">
							{album.title}
						</h3>
						{album.description && (
							<p className="text-gray-400 text-xs line-clamp-1 mb-1">{album.description}</p>
						)}
						<div className="flex items-center justify-between text-xs">
							<span className="text-reggae-yellow font-semibold">{formatPrice(album.price)}</span>
							<span className="text-gray-400">ALBUM</span>
						</div>
					</div>
				</div>
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
			<div className="absolute inset-0 bg-gradient-to-r from-reggae-yellow/5 via-transparent to-reggae-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

			{/* Cover Art */}
			<div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
				<Image
					src={album.coverArtUrl}
					alt={album.title}
					width={64}
					height={64}
					className="object-cover transition-transform duration-300 group-hover:scale-110"
				/>

				{/* Track count badge */}
				<div className="absolute top-1 left-1">
					<div className="bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-xs text-white">
						{album.songIds?.length || 0}
					</div>
				</div>

				{/* Purchase status indicator */}
				{isSignedIn && purchased && (
					<div className="absolute top-1 right-1">
						<div className="bg-reggae-yellow/90 backdrop-blur-sm rounded-full p-0.5">
							<CheckCircle size={8} className="text-black" />
						</div>
					</div>
				)}
			</div>

			{/* Album Info */}
			<div className="flex-1 min-w-0">
				<h3 className="font-bold text-gray-300 text-sm truncate group-hover:text-reggae-yellow transition-colors duration-300">
					{album.title}
				</h3>
				<p className="text-gray-400 text-xs truncate">
					{album.description || `${album.songIds?.length || 0} tracks`}
				</p>
			</div>

			{/* Album indicator */}
			<div className="text-gray-400 text-xs font-medium">ALBUM</div>

			{/* Price */}
			<div className="text-reggae-yellow font-semibold text-sm">{formatPrice(album.price)}</div>

			{/* Actions */}
			<div className="flex items-center gap-2">
				{/* Download button for purchased albums */}
				{isSignedIn && purchased && purchaseId && (
					<motion.button
						onClick={handleDownload}
						className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors duration-300 opacity-0 group-hover:opacity-100"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
						title="Download Album"
					>
						<Download size={14} />
					</motion.button>
				)}

				{/* View/Purchase button */}
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
					<Link href={`/albums/${album._id}`}>
						<motion.button
							className="w-8 h-8 rounded-full bg-reggae-yellow/90 backdrop-blur-sm flex items-center justify-center text-black hover:bg-reggae-yellow transition-colors duration-300"
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.95 }}
						>
							<Music size={14} />
						</motion.button>
					</Link>
				) : (
					<motion.button
						onClick={handlePurchase}
						className="w-8 h-8 rounded-full bg-reggae-green/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-reggae-green transition-colors duration-300"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
					>
						<ShoppingCart size={14} />
					</motion.button>
				)}
			</div>
		</motion.div>
	);
};

export default AlbumCard;
