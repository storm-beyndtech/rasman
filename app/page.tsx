import Hero from "@/components/Hero";
import FeaturedMusic from "@/components/FeaturedMusic";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-bg">
			<Hero />
			<div
				className="w-full bg-no-repeat bg-cover [background-position-y:40%]"
				style={{ backgroundImage: "url(/images/Most-Recent-BG.svg)" }}
			>
				<FeaturedMusic />
			</div>
		</div>
	);
}
