"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Music, Award, Heart, Globe, Calendar, Users, Mic, Guitar, Star, Play, Download } from "lucide-react";

const BiographyPage: React.FC = () => {
	const achievements = [
		{
			icon: <Music size={32} />,
			title: "Original Songs",
			value: "50+",
			description: "Conscious reggae tracks",
			color: "reggae-green",
		},
		{
			icon: <Award size={32} />,
			title: "Years Active",
			value: "10+",
			description: "Spreading positive vibes",
			color: "reggae-yellow",
		},
		{
			icon: <Users size={32} />,
			title: "Global Fans",
			value: "10K+",
			description: "Worldwide community",
			color: "reggae-red",
		},
		{
			icon: <Globe size={32} />,
			title: "Countries Reached",
			value: "25+",
			description: "International impact",
			color: "purple-500",
		},
	];

	const timeline = [
		{
			year: "2014",
			title: "Musical Awakening",
			description:
				"Discovered the power of reggae music and began writing conscious lyrics inspired by spiritual teachings and life experiences.",
			icon: <Mic size={24} />,
			color: "reggae-green",
		},
		{
			year: "2016",
			title: "First Recordings",
			description:
				"Released debut singles focusing on unity, love, and social consciousness. Started performing at local venues and spiritual gatherings.",
			icon: <Guitar size={24} />,
			color: "reggae-yellow",
		},
		{
			year: "2018",
			title: "First Album Release",
			description:
				'Launched debut album "Conscious Vibrations" featuring 12 tracks of authentic reggae with messages of hope and healing.',
			icon: <Music size={24} />,
			color: "reggae-red",
		},
		{
			year: "2020",
			title: "Digital Revolution",
			description:
				"Embraced digital platforms to reach global audiences during the pandemic. Connected with reggae lovers worldwide through virtual concerts.",
			icon: <Globe size={24} />,
			color: "blue-500",
		},
		{
			year: "2022",
			title: "Community Impact",
			description:
				"Established music education programs for youth, using reggae as a tool for positive change and cultural awareness.",
			icon: <Users size={24} />,
			color: "purple-500",
		},
		{
			year: "2024",
			title: "Platform Launch",
			description:
				"Launched official music platform to provide direct access to conscious reggae music while supporting independent artistry.",
			icon: <Award size={24} />,
			color: "reggae-green",
		},
	];

	const philosophy = [
		{
			title: "Unity Through Music",
			description:
				"Music is the universal language that transcends all barriers - race, religion, nationality. Through reggae's rhythmic heartbeat, we can unite souls and create understanding between all people.",
			color: "from-reggae-green to-green-600",
			quote: '"One love, one heart, let\'s get together and feel alright."',
			icon: <Heart size={24} />,
		},
		{
			title: "Conscious Messaging",
			description:
				"Every song carries a purpose - to awaken consciousness, inspire positive action, and remind listeners of their divine nature. Music should heal, not harm; unite, not divide.",
			color: "from-reggae-yellow to-yellow-600",
			quote: '"Words are powerful - they can build up or tear down. I choose to build."',
			icon: <Music size={24} />,
		},
		{
			title: "Spiritual Connection",
			description:
				"Reggae is more than entertainment; it's a spiritual practice. Each rhythm connects us to the divine, each melody carries prayers, and each lyric plants seeds of wisdom in the hearts of listeners.",
			color: "from-reggae-red to-red-600",
			quote: '"Music is my meditation, my prayer, my way of connecting with the Most High."',
			icon: <Star size={24} />,
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
		<div className="min-h-screen bg-black pt-20 relative overflow-hidden">
			{/* Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-reggae-green/5 via-black to-reggae-red/5 pointer-events-none" />
			<div className="absolute top-20 left-20 w-96 h-96 bg-reggae-green/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-20 right-20 w-72 h-72 bg-reggae-yellow/10 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-reggae-red/5 rounded-full blur-3xl pointer-events-none" />

			{/* Hero Section */}
			<section className="py-20 relative">
				<div className="container mx-auto px-4">
					<motion.div
						variants={staggerContainer}
						initial="initial"
						animate="animate"
						className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
					>
						{/* Hero Text */}
						<motion.div variants={fadeInVariants} className="space-y-8">
							<div>
								<motion.h1
									className="text-6xl md:text-8xl font-bold font-serif text-white mb-6"
									initial={{ opacity: 0, x: -50 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.8 }}
								>
									Rasman <span className="text-reggae-green">Peter</span>{" "}
									<span className="text-reggae-yellow">Dudu</span>
								</motion.h1>
								<div className="w-24 h-2 bg-gradient-to-r from-reggae-green via-reggae-yellow to-reggae-red rounded-full mb-6"></div>
								<p className="text-2xl text-gray-300 italic">
									"Spreading consciousness through the healing power of reggae music"
								</p>
							</div>

							<p className="text-xl text-gray-400 leading-relaxed">
								A passionate reggae artist dedicated to creating music that not only entertains but
								transforms. Through conscious lyrics and authentic rhythms, Rasman bridges the gap between
								traditional reggae roots and contemporary spiritual awakening.
							</p>

							<div className="flex flex-wrap gap-4">
								<div className="px-4 py-2 bg-reggae-green/20 border border-reggae-green/30 text-reggae-green rounded-full font-semibold backdrop-blur-sm">
									Conscious Artist
								</div>
								<div className="px-4 py-2 bg-reggae-yellow/20 border border-reggae-yellow/30 text-reggae-yellow rounded-full font-semibold backdrop-blur-sm">
									Spiritual Teacher
								</div>
								<div className="px-4 py-2 bg-reggae-red/20 border border-reggae-red/30 text-reggae-red rounded-full font-semibold backdrop-blur-sm">
									Community Builder
								</div>
							</div>

							<div className="flex gap-4">
								<motion.button
									className="flex items-center gap-2 bg-reggae-green text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Play size={20} />
									Listen Now
								</motion.button>
								<motion.button
									className="flex items-center gap-2 bg-black/30 backdrop-blur-sm border border-gray-700/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-black/50 transition-all duration-300"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Download size={20} />
									Download Music
								</motion.button>
							</div>
						</motion.div>

						{/* Hero Image */}
						<motion.div variants={fadeInVariants} className="relative">
							<div className="relative aspect-square max-w-lg mx-auto">
								{/* Decorative Background Elements */}
								<div className="absolute inset-0 bg-gradient-to-br from-reggae-green via-reggae-yellow to-reggae-red rounded-3xl transform rotate-6 opacity-20"></div>
								<div className="absolute inset-0 bg-gradient-to-br from-reggae-red via-reggae-green to-reggae-yellow rounded-3xl transform -rotate-3 opacity-30"></div>

								{/* Main Image Container */}
								<div className="relative h-full bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-3xl overflow-hidden shadow-2xl">
									{/* Placeholder for artist image */}
									<div className="w-full h-full flex items-center justify-center text-white">
										<div className="text-center">
											<Music size={120} className="mx-auto mb-6 text-reggae-green" />
											<p className="text-4xl font-bold text-white">Rasman</p>
											<p className="text-2xl text-reggae-yellow">Peter Dudu</p>
										</div>
									</div>
								</div>

								{/* Floating Musical Notes */}
								<motion.div
									animate={{ y: [0, -20, 0] }}
									transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
									className="absolute -top-8 -right-8 w-16 h-16 bg-reggae-yellow/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-reggae-yellow/30"
								>
									<Music className="text-black" size={24} />
								</motion.div>

								<motion.div
									animate={{ y: [0, 15, 0] }}
									transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
									className="absolute -bottom-6 -left-6 w-14 h-14 bg-reggae-red/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-reggae-red/30"
								>
									<Heart className="text-white" size={20} />
								</motion.div>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Infinite Scrolling Text */}
			<section className="bg-black/30 backdrop-blur-sm border-y border-gray-700/30 py-8 overflow-hidden">
				<motion.div
					animate={{ x: ["-100%", "100%"] }}
					transition={{
						duration: 25,
						repeat: Infinity,
						ease: "linear",
					}}
					className="whitespace-nowrap text-6xl md:text-8xl font-bold font-serif italic text-reggae-green/30"
				>
					CONSCIOUSNESS • UNITY • LOVE • MUSIC • HEALING • CONSCIOUSNESS • UNITY • LOVE •
				</motion.div>
			</section>

			{/* Achievements Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<motion.div
						variants={staggerContainer}
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<motion.h2
							variants={fadeInVariants}
							className="text-4xl md:text-5xl font-bold font-serif text-white mb-6"
						>
							Musical Journey in <span className="text-reggae-green">Numbers</span>
						</motion.h2>
						<motion.p variants={fadeInVariants} className="text-xl text-gray-400 max-w-3xl mx-auto">
							A decade of spreading consciousness through music has touched hearts across the globe
						</motion.p>
					</motion.div>

					<motion.div
						variants={staggerContainer}
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
					>
						{achievements.map((achievement, index) => (
							<motion.div key={index} variants={fadeInVariants} className="text-center group">
								<div
									className={`w-24 h-24 bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 text-${achievement.color}`}
								>
									{achievement.icon}
								</div>
								<div className={`text-4xl font-bold text-${achievement.color} mb-2`}>{achievement.value}</div>
								<div className="text-xl font-semibold text-white mb-2">{achievement.title}</div>
								<div className="text-gray-400">{achievement.description}</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Timeline Section */}
			<section className="py-20 bg-black/20 backdrop-blur-sm">
				<div className="container mx-auto px-4">
					<motion.div
						variants={staggerContainer}
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<motion.h2
							variants={fadeInVariants}
							className="text-4xl md:text-5xl font-bold font-serif text-white mb-6"
						>
							The Musical <span className="text-reggae-yellow">Timeline</span>
						</motion.h2>
						<motion.p variants={fadeInVariants} className="text-xl text-gray-400 max-w-3xl mx-auto">
							From humble beginnings to global impact - the journey of conscious reggae music
						</motion.p>
					</motion.div>

					<div className="max-w-4xl mx-auto">
						{timeline.map((event, index) => (
							<motion.div
								key={index}
								variants={fadeInVariants}
								initial="initial"
								whileInView="animate"
								viewport={{ once: true }}
								transition={{ delay: index * 0.2 }}
								className="relative flex items-start gap-8 pb-12 last:pb-0"
							>
								{/* Timeline Line */}
								{index < timeline.length - 1 && (
									<div
										className={`absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-${event.color} to-transparent opacity-50`}
									></div>
								)}

								{/* Year Circle */}
								<div
									className={`relative z-10 w-12 h-12 bg-${event.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
								>
									{event.icon}
								</div>

								{/* Content */}
								<div className="flex-1 bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-6 hover:shadow-lg hover:border-gray-600/50 transition-all duration-300">
									<div className="flex items-center gap-4 mb-4">
										<div className={`text-2xl font-bold text-${event.color}`}>{event.year}</div>
										<h3 className="text-xl font-bold text-white">{event.title}</h3>
									</div>
									<p className="text-gray-400 leading-relaxed">{event.description}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Philosophy Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<motion.div
						variants={staggerContainer}
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<motion.h2
							variants={fadeInVariants}
							className="text-4xl md:text-5xl font-bold font-serif text-white mb-6"
						>
							Musical <span className="text-reggae-red">Philosophy</span>
						</motion.h2>
						<motion.p variants={fadeInVariants} className="text-xl text-gray-400 max-w-3xl mx-auto">
							The core beliefs that drive every rhythm, every lyric, and every performance
						</motion.p>
					</motion.div>

					<motion.div
						variants={staggerContainer}
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
						className="grid grid-cols-1 lg:grid-cols-3 gap-8"
					>
						{philosophy.map((item, index) => (
							<motion.div key={index} variants={fadeInVariants} className="relative group">
								<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8 h-full hover:border-gray-600/50 transition-all duration-300">
									<div
										className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
									>
										<div className="text-white">{item.icon}</div>
									</div>

									<h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>

									<p className="text-gray-400 leading-relaxed mb-6">{item.description}</p>

									<blockquote className="text-reggae-yellow italic font-medium border-l-4 border-reggae-yellow pl-4">
										{item.quote}
									</blockquote>
								</div>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Call to Action */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<motion.div
						variants={fadeInVariants}
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
						className="text-center max-w-4xl mx-auto"
					>
						<div className="bg-gradient-to-r from-reggae-green/20 via-reggae-yellow/20 to-reggae-red/20 backdrop-blur-2xl border border-gray-700/30 rounded-3xl p-12">
							<h2 className="text-4xl md:text-5xl font-bold font-serif text-white mb-6">
								Join the Musical <span className="text-reggae-green">Movement</span>
							</h2>
							<p className="text-xl mb-8 text-gray-300">
								Experience the transformative power of conscious reggae music. Every song is a step towards
								unity, every rhythm a heartbeat of healing.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<motion.button
									className="bg-gradient-to-r from-reggae-green to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									Explore Music
								</motion.button>
								<motion.button
									className="bg-black/30 backdrop-blur-sm border-2 border-gray-700/50 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black/50 hover:border-reggae-green/50 transition-all duration-300"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									Connect with Rasman
								</motion.button>
							</div>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
};

export default BiographyPage;
