"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Music, Disc as AlbumIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import SongCard from "./SongCard";
import AlbumCard from "./AlbumCard";
import Image from "next/image";
import ArchivePlaceholder from "./ui/ArchivePlaceholder";
import { IAlbum, IPurchase, ISong } from "@/lib/models";
import Link from "next/link";

const FeaturedMusic: React.FC = () => {
	const [songs, setSongs] = useState<ISong[]>([]);
	const [albums, setAlbums] = useState<IAlbum[]>([]);
	const [purchases, setPurchases] = useState<IPurchase[]>([]);
	const [activeTab, setActiveTab] = useState<"songs" | "albums">("songs");
	const [loading, setLoading] = useState(true);

	const { isSignedIn, user } = useUser();

	// Parallax scroll effects
	const { scrollY } = useScroll();
	const cardsY = useTransform(scrollY, [0, 1000], [200, 0]);

	// Fetch featured content and user purchases
	useEffect(() => {
		const fetchFeaturedContent = async () => {
			try {
				setLoading(true);

				const [songsRes, albumsRes] = await Promise.all([
					fetch("/api/songs?featured=true&limit=12"),
					fetch("/api/albums?featured=true&limit=12"),
				]);

				if (songsRes.ok) {
					const songsData = await songsRes.json();
					setSongs(songsData.data?.songs || []);
				}

				if (albumsRes.ok) {
					const albumsData = await albumsRes.json();
					setAlbums(albumsData.data?.albums || []);
				}

				// Fetch user purchases if signed in
				if (isSignedIn) {
					const purchasesRes = await fetch("/api/purchase");
					if (purchasesRes.ok) {
						const purchasesData = await purchasesRes.json();
						setPurchases(purchasesData.data?.purchases || []);
					}
				}
			} catch (error) {
				console.error("Error fetching featured content:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchFeaturedContent();
	}, [isSignedIn]);

	if (loading) {
		return (
			<div className="relative min-h-[600px] flex items-center justify-center">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
					className="w-16 h-16 border-4 border-reggae-green/30 border-t-reggae-green rounded-full"
				/>
			</div>
		);
	}

	return (
		<div className="relative py-20 sm:pt-96 sm:pb-40 overflow-hidden">
			{/* Floating Decorative Elements with Parallax */}
			<div className="top-8 left-10 absolute">
				<Image src="/images/Floating-Text-1.svg" alt="text" width={40} height={170} />
			</div>

			{/* Archive Center */}
			<ArchivePlaceholder />

			<div className="top-12 right-0 absolute">
				<Image src="/images/Floating-Text-2.svg" alt="text" width={120} height={20} />
			</div>

			{/* Mobile Tabs */}
			<div className="lg:hidden mb-12">
				<div className="flex justify-center">
					<div className="bg-black/30 backdrop-blur-md rounded-full p-2 border border-white/20">
						<div className="flex gap-2">
							<motion.button
								onClick={() => setActiveTab("songs")}
								className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
									activeTab === "songs"
										? "bg-reggae-green text-white shadow-lg"
										: "text-gray-300 hover:text-reggae-green"
								}`}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Music strokeWidth={1} size={18} />
								Singles
								{songs.length > 0 && (
									<span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
										{songs.length}
									</span>
								)}
							</motion.button>

							<motion.button
								onClick={() => setActiveTab("albums")}
								className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
									activeTab === "albums"
										? "bg-reggae-yellow text-black shadow-lg"
										: "text-gray-300 hover:text-reggae-yellow"
								}`}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<AlbumIcon strokeWidth={1} size={18} />
								Albums
								{albums.length > 0 && (
									<span className="text-xs bg-black/20 text-white px-2 py-1 rounded-full">
										{albums.length}
									</span>
								)}
							</motion.button>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="container mx-auto px-4 pt-52">
				{/* Mobile Tabbed Content */}
				<div className="lg:hidden">
					<AnimatePresence mode="wait">
						<motion.div
							key={activeTab}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
						>
							{activeTab === "songs" ? (
								<div className="space-y-8">
									{songs.length > 0 ? (
										<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
											{songs.map((song, index) => (
												<React.Fragment key={song._id}>
													<SongCard
														song={song}
														index={index}
														purchaseId={purchases.find((p) => p.itemId === song._id)?._id}
													/>
												</React.Fragment>
											))}
										</div>
									) : (
										<div className="text-center py-20">
											<Music strokeWidth={1} size={48} className="mx-auto text-gray-400 mb-4" />
											<p className="text-gray-300 text-lg mb-6">No featured singles available</p>
										</div>
									)}
								</div>
							) : (
								<div className="space-y-8">
									{albums.length > 0 ? (
										<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
											{albums.map((album, index) => (
												<React.Fragment key={album._id}>
													<AlbumCard
														album={album}
														index={index}
														purchaseId={purchases.find((p) => p.itemId === album._id)?._id}
													/>
												</React.Fragment>
											))}
										</div>
									) : (
										<div className="text-center py-20">
											<AlbumIcon strokeWidth={1} size={48} className="mx-auto text-gray-400 mb-4" />
											<p className="text-gray-300 text-lg mb-6">No featured albums available</p>
										</div>
									)}
								</div>
							)}
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Desktop Layout */}
				<motion.div className="hidden lg:flex items-start gap-8 justify-center" style={{ y: cardsY }}>
					{/* Singles Section - Left */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						className="space-y-6"
					>
						<div className="text-center mb-16">
							<Link href="/songs">
								<h2 className="text-xl font-bold text-reggae-green tracking-wider">
									Singles<span className="text-reggae-yellow">&darr;</span>
								</h2>
							</Link>
						</div>

						{songs.length > 0 ? (
							<div className="h-[640px] overflow-y-auto space-y-4 scrollbar-hide">
								{songs.map((song, index) => (
									<React.Fragment key={song._id}>
										<SongCard
											song={song}
											index={index}
											purchaseId={purchases.find((p) => p.itemId === song._id)?._id}
										/>
									</React.Fragment>
								))}
							</div>
						) : (
							<div className="min-w-[300px] text-center py-20">
								<Music strokeWidth={1} size={48} className="mx-auto text-gray-400 mb-4" />
								<p className="text-gray-300">No featured singles</p>
							</div>
						)}
					</motion.div>

					{/* Archive Center invisible*/}
					<div className="w-40 mx-20" />

					{/* Albums Section - Right */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="space-y-6"
					>
						<div className="text-center mb-16">
							<Link href="/albums">
								<h2 className="text-xl font-bold text-reggae-green tracking-wider">
									Albums<span className="text-reggae-yellow">&darr;</span>
								</h2>
							</Link>
						</div>

						{albums.length > 0 ? (
							<div className="h-[640px] overflow-y-auto space-y-4 scrollbar-hide pr-2">
								{albums.map((album, index) => (
									<React.Fragment key={album._id}>
										<AlbumCard
											album={album}
											index={index}
											purchaseId={purchases.find((p) => p.itemId === album._id)?._id}
										/>
									</React.Fragment>
								))}
							</div>
						) : (
							<div className="min-w-[300px] text-center py-20">
								<AlbumIcon strokeWidth={1} size={48} className="mx-auto text-gray-400 mb-4" />
								<p className="text-gray-300">No featured albums</p>
							</div>
						)}
					</motion.div>
				</motion.div>
			</div>

			<style jsx global>{`
				.scrollbar-hide {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
				.scrollbar-hide::-webkit-scrollbar {
					display: none;
				}
			`}</style>
		</div>
	);
};

export default FeaturedMusic;
