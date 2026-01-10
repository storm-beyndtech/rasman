"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Music, Disc as AlbumIcon } from "lucide-react";
import SongCard from "./SongCard";
import AlbumCard from "./AlbumCard";
import Image from "next/image";
import ArchivePlaceholder from "./ui/ArchivePlaceholder";
import Link from "next/link";
import { useFeaturedContent, useUserPurchase } from "@/app/hooks/music";

const FeaturedMusic: React.FC = () => {
	const [activeTab, setActiveTab] = useState<"songs" | "albums">("songs");

	// Parallax scroll effects
	const { scrollY } = useScroll();
	const cardsY = useTransform(scrollY, [0, 1000], [200, 0]);

	// Fetch all data with custom hook
	const { songs, albums, isLoading, isError, error } = useFeaturedContent(12);

	// Loading state
	if (isLoading) {
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

	// Error state
	if (isError) {
		return (
			<div className="relative min-h-[600px] flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-400 mb-4">Failed to load featured content</div>
					<p className="text-gray-500">{error?.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative py-20 sm:pt-96 sm:pb-40 overflow-hidden">
			{/* Floating Decorative Elements */}
			<div className="top-8 left-10 absolute">
				<Image src="/images/Floating-Text-1.svg" alt="text" width={40} height={170} />
			</div>

			{/* Archive Center */}
			<ArchivePlaceholder />

			<div className="top-12 right-0 absolute">
				<Image src="/images/Floating-Text-2.svg" alt="text" width={120} height={20} />
			</div>

			{/* Mobile Tabs */}
			<div className="lg:hidden pt-80">
				<div className="flex justify-center">
					<div className="bg-black/30 backdrop-blur-md rounded-full p-2 border border-white/20">
						<div className="flex gap-2">
							<TabButton
								active={activeTab === "songs"}
								onClick={() => setActiveTab("songs")}
								icon={<Music strokeWidth={1} size={18} />}
								label="Singles"
								count={songs.length}
								activeColor="bg-reggae-green"
								hoverColor="hover:text-reggae-green"
							/>

							<TabButton
								active={activeTab === "albums"}
								onClick={() => setActiveTab("albums")}
								icon={<AlbumIcon strokeWidth={1} size={18} />}
								label="Albums"
								count={albums.length}
								activeColor="bg-reggae-yellow text-black"
								hoverColor="hover:text-reggae-yellow"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="container mx-auto px-4 pt-20">
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
								<MobileContentSection
									items={songs}
									EmptyIcon={Music}
									emptyText="No featured singles available"
									renderItem={(song, index) => (
										<SongCardWithPurchase key={song._id} song={song} index={index} />
									)}
								/>
							) : (
								<MobileContentSection
									items={albums}
									EmptyIcon={AlbumIcon}
									emptyText="No featured albums available"
									renderItem={(album, index) => (
										<AlbumCardWithPurchase key={album._id} album={album} index={index} />
									)}
								/>
							)}
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Desktop Layout */}
				<motion.div className="hidden lg:flex items-start gap-8 justify-center" style={{ y: cardsY }}>
					{/* Singles Section - Left */}
					<DesktopSection
						title="Singles"
						href="/songs"
						items={songs}
						EmptyIcon={Music}
						emptyText="No featured singles"
						renderItem={(song, index) => <SongCardWithPurchase key={song._id} song={song} index={index} />}
						animation={{ initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 } }}
					/>

					{/* Archive Center invisible */}
					<div className="w-40 mx-20" />

					{/* Albums Section - Right */}
					<DesktopSection
						title="Albums"
						href="/albums"
						items={albums}
						EmptyIcon={AlbumIcon}
						emptyText="No featured albums"
						renderItem={(album, index) => (
							<AlbumCardWithPurchase key={album._id} album={album} index={index} />
						)}
						animation={{
							initial: { opacity: 0, x: 50 },
							animate: { opacity: 1, x: 0 },
							transition: { duration: 0.6, delay: 0.2 },
						}}
					/>
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

// Reusable Components

interface TabButtonProps {
	active: boolean;
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
	count: number;
	activeColor: string;
	hoverColor: string;
}

const TabButton: React.FC<TabButtonProps> = ({
	active,
	onClick,
	icon,
	label,
	count,
	activeColor,
	hoverColor,
}) => (
	<motion.button
		onClick={onClick}
		className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
			active ? `${activeColor} text-white shadow-lg` : `text-gray-300 ${hoverColor}`
		}`}
		whileHover={{ scale: 1.05 }}
		whileTap={{ scale: 0.95 }}
	>
		{icon}
		{label}
		{count > 0 && <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">{count}</span>}
	</motion.button>
);

interface MobileContentSectionProps {
	items: any[];
	EmptyIcon: React.ComponentType<any>;
	emptyText: string;
	renderItem: (item: any, index: number) => React.ReactNode;
}

const MobileContentSection: React.FC<MobileContentSectionProps> = ({
	items,
	EmptyIcon,
	emptyText,
	renderItem,
}) => (
	<div className="space-y-8">
		{items.length > 0 ? (
			<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">{items.map(renderItem)}</div>
		) : (
			<div className="text-center py-20">
				<EmptyIcon strokeWidth={1} size={48} className="mx-auto text-gray-400 mb-4" />
				<p className="text-gray-300 text-lg mb-6">{emptyText}</p>
			</div>
		)}
	</div>
);

interface DesktopSectionProps {
	title: string;
	href: string;
	items: any[];
	EmptyIcon: React.ComponentType<any>;
	emptyText: string;
	renderItem: (item: any, index: number) => React.ReactNode;
	animation: any;
}

const DesktopSection: React.FC<DesktopSectionProps> = ({
	title,
	href,
	items,
	EmptyIcon,
	emptyText,
	renderItem,
	animation,
}) => (
	<motion.div className="space-y-6" {...animation}>
		<div className="text-center mb-8">
			<Link href={href}>
				<h2 className="text-base font-medium text-gray-300 hover:text-reggae-green transition-colors">
					{title}
				</h2>
			</Link>
		</div>

		{items.length > 0 ? (
			<div className="h-[640px] overflow-y-auto space-y-4 scrollbar-hide pr-2">{items.map(renderItem)}</div>
		) : (
			<div className="min-w-[300px] text-center py-20">
				<EmptyIcon strokeWidth={1} size={48} className="mx-auto text-gray-400 mb-4" />
				<p className="text-gray-300">{emptyText}</p>
			</div>
		)}
	</motion.div>
);

// Card components with purchase data
const SongCardWithPurchase: React.FC<{ song: any; index: number }> = ({ song, index }) => {
	const { purchaseId } = useUserPurchase(song._id);
	return <SongCard song={song} index={index} purchaseId={purchaseId} />;
};

const AlbumCardWithPurchase: React.FC<{ album: any; index: number }> = ({ album, index }) => {
	const { purchaseId } = useUserPurchase(album._id);
	return <AlbumCard album={album} index={index} purchaseId={purchaseId} />;
};

export default FeaturedMusic;
