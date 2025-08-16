import Hero from "@/components/Hero";
import FeaturedMusic from "@/components/FeaturedMusic";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-bg">
			<Hero />
			<div className="w-full bg-[url('/images/Most-Recent-BG.svg')] bg-cover bg-center bg-no-repeat">
				<FeaturedMusic />
			</div>
		</div>
	);
}
