import Hero from "@/components/Hero";
import FeaturedMusic from "@/components/FeaturedMusic";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-black">
			<Hero />
			<div className="w-full bg-gradient-to-b from-black via-gray-950 to-black">
				<FeaturedMusic />
			</div>
		</div>
	);
}
