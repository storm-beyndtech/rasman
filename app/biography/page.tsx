"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Music, Award, Heart, Globe, Users, Mic, Guitar, Star, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const BiographyPage: React.FC = () => {
	const { scrollY } = useScroll();
	const router = useRouter();
	const achievements = [
		{
			icon: <Music size={24} strokeWidth={1.2} />,
			title: "Original Songs",
			value: "50",
			description: "Conscious reggae tracks",
		},
		{
			icon: <Award size={24} strokeWidth={1.2} />,
			title: "Years Active",
			value: "10",
			description: "Spreading positive vibes",
		},
		{
			icon: <Users size={24} strokeWidth={1.2} />,
			title: "Global Fans",
			value: "10",
			description: "Worldwide community",
		},
		{
			icon: <Globe size={24} strokeWidth={1.2} />,
			title: "Countries Reached",
			value: "25",
			description: "International impact",
		},
	];

	const timeline = [
		{
			year: "2014",
			title: "Musical Awakening",
			description:
				"Discovered the power of reggae music and began writing conscious lyrics inspired by spiritual teachings and life experiences.",
			icon: <Mic size={30} strokeWidth={1} />,
			color: "emerald-300",
		},
		{
			year: "2016",
			title: "First Recordings",
			description:
				"Released debut singles focusing on unity, love, and social consciousness. Started performing at local venues and spiritual gatherings.",
			icon: <Guitar size={30} strokeWidth={1} />,
			color: "purple-400",
		},
		{
			year: "2018",
			title: "First Album Release",
			description:
				'Launched debut album "Conscious Vibrations" featuring 12 tracks of authentic reggae with messages of hope and healing.',
			icon: <Music size={30} strokeWidth={1} />,
			color: "emerald-300",
		},
		{
			year: "2020",
			title: "Digital Revolution",
			description:
				"Embraced digital platforms to reach global audiences during the pandemic. Connected with reggae lovers worldwide through virtual concerts.",
			icon: <Globe size={30} strokeWidth={1} />,
			color: "purple-400",
		},
		{
			year: "2022",
			title: "Community Impact",
			description:
				"Established music education programs for youth, using reggae as a tool for positive change and cultural awareness.",
			icon: <Users size={30} strokeWidth={1} />,
			color: "emerald-300",
		},
		{
			year: "2024",
			title: "Platform Launch",
			description:
				"Launched official music platform to provide direct access to conscious reggae music while supporting independent artistry.",
			icon: <Award size={30} strokeWidth={1} />,
			color: "purple-400",
		},
	];

	const philosophy = [
		{
			title: "Unity Through Music",
			description: "Music transcends all barriers and unites souls through reggae's universal heartbeat.",
			quote: '"One love, one heart, let\'s get together and feel alright."',
		},
		{
			title: "Conscious Messaging",
			description: "Every song awakens consciousness and inspires positive action in listeners.",
			quote: '"Words are powerful - I choose to build, not destroy."',
		},
		{
			title: "Spiritual Connection",
			description: "Reggae connects us to the divine through rhythm, melody, and wisdom.",
			quote: '"Music is my meditation, my prayer to the Most High."',
		},
	];

	const fadeInVariants = {
		initial: { opacity: 0, y: 30 },
		animate: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6 },
		},
	};

	const staggerContainer = {
		animate: {
			transition: {
				staggerChildren: 0.2,
			},
		},
	};

	return (
		<div className="min-h-screen bg-bg pt-20 relative overflow-hidden">
			{/* Subtle Background Elements */}
			<div className="fixed inset-0 bg-stone-900/20 pointer-events-none" />

			{/* Minimal orbs */}
			<div className="absolute top-40 left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-40 right-20 w-60 h-60 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

			{/* Grid Pattern */}
			<div
				className="fixed inset-0 opacity-[0.3] pointer-events-none"
				style={{
					backgroundImage: `
						linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
						linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
					`,
					backgroundSize: "80px 80px",
				}}
			/>

			{/* Hero Section */}
			<section className="py-24 relative">
				<div className="container mx-auto px-6 max-w-7xl">
					<motion.div
						variants={staggerContainer}
						initial="initial"
						animate="animate"
						className="grid grid-cols-1 xl:grid-cols-4 gap-20 items-center"
					>
						{/* Hero Text */}
						<motion.div variants={fadeInVariants} className="space-y-12 col-span-2">
							<div className="space-y-7">
								<p className="text-stone-300/40 font-mono font-light leading-snug tracking-wide max-w-xs">
									"Spreading consciousness through the healing power of reggae music"
								</p>
								<motion.h1
									className="w-fit leading-tight text-4xl sm:text-6xl bio-name bg-clip-text text-transparent bg-gradient-to-r from-stone-400/50 via-stone-100 to-stone-200/50"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 1 }}
								>
									Rasman Peter Dudu
								</motion.h1>
							</div>

							{/* Description Card */}
							<div className="p-8 bg-stone-400/5 backdrop-blur-xl border border-white/10 rounded-2xl">
								<p className="font-mono text-sm text-stone-300/60 leading-relaxed tracking-wide">
									A colossal reggae artist dedicated to creating music that entertains & transforms. Through
									conscious lyrics and authentic rhythms, Rasman bridges the gap between traditional reggae
									roots and contemporary spiritual awakening.
								</p>
							</div>

							{/* Tags */}
							<div className="flex justify-between flex-wrap gap-4">
								<div className="px-6 py-2.5 bg-purple-400/10 border border-purple-400/20 text-purple-400 rounded-xl font-medium backdrop-blur-xl">
									Spiritual Teacher
								</div>

								<div className="px-6 py-2.5 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 rounded-xl font-medium backdrop-blur-xl">
									Conscious Artist
								</div>

								<motion.button
									className="flex items-center gap-3 px-6 py-2.5 bg-purple-400/10 border border-purple-400/20 text-purple-400 rounded-xl font-medium backdrop-blur-xl"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => router.push("/songs")}
								>
									<Play size={20} />
									Listen Now
								</motion.button>
							</div>
						</motion.div>

						{/* Hero Visual */}
						<motion.div variants={fadeInVariants} className="relative col-span-2">
							<motion.div
								className="w-full"
								style={{ y: useTransform(scrollY, [0, 1000], [0, window.innerWidth < 768 ? -100 : -500]) }}
							>
								<Image src="/images/Album-Cover.svg" alt="name" width={500} height={500} priority />
							</motion.div>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Achievements */}
			<section className="py-24">
				<div className="container mx-auto px-6 max-w-7xl">
					<div className="text-center space-y-4 mb-10">
						<motion.h1
							className="text-3xl font-semibold font-montserrat uppercase text-stone-100"
							initial={{ opacity: 0, y: -100 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
						>
							Stats
						</motion.h1>

						<motion.p
							className="text-sm text-stone-300/50 max-w-xs mx-auto"
							initial={{ opacity: 0, y: -100 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1 }}
						>
							A decade of spreading consciousness through music has touched hearts across the globe
						</motion.p>
					</div>

					<motion.div
						variants={staggerContainer}
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
					>
						{achievements.map((achievement, index) => (
							<motion.div
								key={index}
								variants={fadeInVariants}
								className="group text-center"
								whileHover={{ y: -8 }}
							>
								<div className="p-8 bg-stone-400/5 backdrop-blur-2xl border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300">
									<div
										className={`w-16 h-16 bg-stone-500/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
									>
										<div className="text-emerald-300">{achievement.icon}</div>
									</div>

									<div
										className={`text-8xl font-extrabold text-purple-400 ${
											index % 2 === 0 ? "mb-24" : "mb-3"
										}`}
									>
										{achievement.value}
										<span className="text-2xl font-medium">{index === 2 && "K"}</span>
										<span className="text-lg">+</span>
									</div>
									<div className="text-sm font-semibold text-white mb-1">{achievement.title}</div>
									<div className="text-stone-500 text-xs">{achievement.description}</div>
								</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Timeline */}
			<section className="py-24">
				<div className="container mx-auto px-6 max-w-6xl">
					<div className="text-center space-y-4 mb-20">
						<motion.h1
							className="text-3xl font-semibold font-montserrat uppercase text-stone-100"
							initial={{ opacity: 0, y: -100 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
						>
							Timeline
						</motion.h1>

						<motion.p
							className="text-sm text-stone-300/50 max-w-xs mx-auto"
							initial={{ opacity: 0, y: -100 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1 }}
						>
							- From Humble Beginnings to Global Impact -
						</motion.p>
					</div>

					<div className="relative">
						{timeline.map((event, index) => (
							<motion.div
								key={index}
								variants={fadeInVariants}
								initial="initial"
								whileInView="animate"
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className="relative flex items-start gap-8 sm:gap-40 pb-12 last:pb-0"
							>
								{/* Timeline Line */}
								{index < timeline.length - 1 && (
									<div className="absolute left-6 top-12 w-0.5 h-full bg-white/10" />
								)}

								{/* Year Circle */}
								<div
									className={`relative z-10 w-14 h-14 bg-stone-400/5 backdrop-blur-xl rounded-xl flex items-center justify-center text-emerald-200 font-bold`}
								>
									{event.icon}
								</div>

								{/* Content */}
								<motion.div className="flex-1" whileHover={{ x: 8 }}>
									<div className="flex flex-wrap-reverse gap-3 mb-5 tracking-wider">
										<h3 className="text-xl font-mono text-stone-200/70">{event.title}</h3>
										<div className={`text-xl font-bold text-${event.color} ml-auto`}>{event.year}</div>
									</div>

									<div
										className={`p-5 bg-stone-500/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-purple-400 transition-all duration-300`}
									>
										<p className="font-mono text-sm text-stone-300/40 leading-relaxed tracking-wide">
											{event.description}
										</p>
									</div>
								</motion.div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Philosophy */}
			<section className="py-24">
				<div className="container mx-auto px-6 max-w-7xl">
					<div className="text-center space-y-4 mb-10">
						<motion.h1
							className="text-3xl font-semibold font-montserrat uppercase text-stone-100"
							initial={{ opacity: 0, y: -100 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
						>
							Philosophy
						</motion.h1>

						<motion.p
							className="text-sm text-stone-300/50 max-w-[300px] mx-auto"
							initial={{ opacity: 0, y: -100 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1 }}
						>
							The Core Beliefs that Drive Every Rhythm, Every Lyric, and Every Performance
						</motion.p>
					</div>

					<motion.div
						variants={staggerContainer}
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
						className="grid grid-cols-1 lg:grid-cols-3 gap-8"
					>
						{philosophy.map((item, index) => (
							<motion.div key={index} variants={fadeInVariants} className="group" whileHover={{ y: -8 }}>
								<div className="p-8 bg-stone-400/5 backdrop-blur-xl border border-white/10 rounded-2xl h-full hover:border-white/20 transition-all duration-300">
									<h3 className="text-xl font-medium mb-4 text-stone-200">{item.title}</h3>
									<p className="text-sm text-stone-300/50 leading-relaxed mb-6">{item.description}</p>

									<blockquote className="text-emerald-300 italic font-medium border-l border-emerald-200 pl-4">
										{item.quote}
									</blockquote>
								</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>
		</div>
	);
};

export default BiographyPage;
