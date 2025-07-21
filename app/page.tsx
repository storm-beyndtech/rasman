import React from "react";
import { connectDB } from "@/lib/mongodb";
import { Song, Album } from "@/lib/models";
import Hero from "@/components/Hero";
import FeaturedMusic from "@/components/FeaturedMusic";
import ArtistPreview from "@/components/ArtistPreview";
import InfiniteText from "@/components/InfiniteText";
import CallToAction from "@/components/CallToAction";
import Newsletter from "@/components/Newsletter";

// Server function to fetch data
async function getHomePageData() {
	try {
		await connectDB();

		// Fetch featured songs and albums
		const [featuredSongs, featuredAlbums] = await Promise.all([
			Song.find({ featured: true }).limit(6).lean(),
			Album.find({ featured: true }).limit(4).lean(),
    ]);
    
    console.log(featuredAlbums, featuredSongs)

		return {
			songs: JSON.parse(JSON.stringify(featuredSongs)),
			albums: JSON.parse(JSON.stringify(featuredAlbums)),
		};
	} catch (error) {
		console.error("Error fetching homepage data:", error);
		return { songs: [], albums: [] };
	}
}

export default async function HomePage() {
	const { songs, albums } = await getHomePageData();

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<Hero />

			{/* Infinite Sliding Artist Name */}
			<InfiniteText />

			{/* Featured Music Section */}
			<FeaturedMusic songs={songs} albums={albums} />

			{/* Artist Preview Section */}
			<ArtistPreview />

			{/* Call to Action Section */}
			<CallToAction />

			{/* Newsletter Section */}
			<Newsletter />
		</div>
	);
}
