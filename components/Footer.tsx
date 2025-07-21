"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Music, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Heart } from "lucide-react";

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	const footerLinks = {
		music: [
			{ label: "All Songs", href: "/songs" },
			{ label: "Albums", href: "/albums" },
			{ label: "Featured Music", href: "/#featured" },
			{ label: "New Releases", href: "/songs?featured=true" },
		],
		about: [
			{ label: "Biography", href: "/biography" },
			{ label: "Story", href: "/biography#story" },
			{ label: "Philosophy", href: "/biography#philosophy" },
			{ label: "Press Kit", href: "/press" },
		],
		support: [
			{ label: "Contact Us", href: "/contact" },
			{ label: "Help Center", href: "/help" },
			{ label: "Privacy Policy", href: "/privacy" },
			{ label: "Terms of Service", href: "/terms" },
		],
	};

	const socialLinks = [
		{ icon: Facebook, href: "#", label: "Facebook" },
		{ icon: Instagram, href: "#", label: "Instagram" },
		{ icon: Twitter, href: "#", label: "Twitter" },
		{ icon: Youtube, href: "#", label: "YouTube" },
	];

	const contactInfo = [
		{ icon: Mail, text: "info@rasmanmusic.com", href: "mailto:info@rasmanmusic.com" },
		{ icon: Phone, text: "+234 (0) 123 456 7890", href: "tel:+2341234567890" },
		{ icon: MapPin, text: "Lagos, Nigeria", href: "#" },
	];

	const fadeInVariants = {
		initial: { opacity: 0, y: 20 },
		animate: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6 },
		},
	};

	const staggerContainer = {
		animate: {
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	return (
		<footer className="bg-reggae-dark text-white">
			{/* Main Footer Content */}
			<div className="container mx-auto px-4 py-16">
				<motion.div
					variants={staggerContainer}
					initial="initial"
					whileInView="animate"
					viewport={{ once: true }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
				>
					{/* Brand Section */}
					<motion.div variants={fadeInVariants} className="lg:col-span-1">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-12 h-12 bg-reggae-gradient rounded-full flex items-center justify-center">
								<Music className="text-white" size={24} />
							</div>
							<div>
								<h3 className="text-2xl font-bold font-serif">Rasman Music</h3>
								<p className="text-reggae-green text-sm">Conscious Reggae</p>
							</div>
						</div>

						<p className="text-gray-300 mb-6 leading-relaxed">
							Spreading love, unity, and consciousness through authentic reggae music. Join the movement and
							experience the power of positive vibrations.
						</p>

						{/* Social Links */}
						<div className="flex gap-3">
							{socialLinks.map((social, index) => {
								const IconComponent = social.icon;
								return (
									<motion.a
										key={index}
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
										className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-reggae-green transition-colors duration-300"
										aria-label={social.label}
									>
										<IconComponent size={20} />
									</motion.a>
								);
							})}
						</div>
					</motion.div>

					{/* Music Links */}
					<motion.div variants={fadeInVariants}>
						<h4 className="text-xl font-bold mb-6 text-reggae-yellow">Music</h4>
						<ul className="space-y-3">
							{footerLinks.music.map((link, index) => (
								<li key={index}>
									<Link
										href={link.href}
										className="text-gray-300 hover:text-reggae-green transition-colors duration-300 flex items-center gap-2 group"
									>
										<span className="w-1 h-1 bg-reggae-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</motion.div>

					{/* About Links */}
					<motion.div variants={fadeInVariants}>
						<h4 className="text-xl font-bold mb-6 text-reggae-yellow">About</h4>
						<ul className="space-y-3">
							{footerLinks.about.map((link, index) => (
								<li key={index}>
									<Link
										href={link.href}
										className="text-gray-300 hover:text-reggae-green transition-colors duration-300 flex items-center gap-2 group"
									>
										<span className="w-1 h-1 bg-reggae-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</motion.div>

					{/* Contact & Support */}
					<motion.div variants={fadeInVariants}>
						<h4 className="text-xl font-bold mb-6 text-reggae-yellow">Connect</h4>

						{/* Contact Info */}
						<div className="space-y-3 mb-6">
							{contactInfo.map((contact, index) => {
								const IconComponent = contact.icon;
								return (
									<a
										key={index}
										href={contact.href}
										className="flex items-center gap-3 text-gray-300 hover:text-reggae-green transition-colors duration-300 group"
									>
										<span className="text-reggae-green group-hover:scale-110 transition-transform">
											<IconComponent size={18} />
										</span>
										{contact.text}
									</a>
								);
							})}
						</div>

						{/* Support Links */}
						<div>
							<h5 className="font-semibold mb-3 text-white">Support</h5>
							<ul className="space-y-2">
								{footerLinks.support.map((link, index) => (
									<li key={index}>
										<Link
											href={link.href}
											className="text-gray-300 hover:text-reggae-green transition-colors duration-300 text-sm"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</motion.div>
				</motion.div>

				{/* Newsletter Section */}
				<motion.div
					variants={fadeInVariants}
					className="mt-16 p-8 bg-white/5 rounded-2xl border border-white/10"
				>
					<div className="text-center max-w-2xl mx-auto">
						<h4 className="text-2xl font-bold mb-4">Stay Connected with the Movement</h4>
						<p className="text-gray-300 mb-6">
							Be the first to know about new releases, exclusive content, and upcoming events. Join our
							community of conscious music lovers.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
							<input
								type="email"
								placeholder="Enter your email"
								className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-reggae-green focus:border-transparent outline-none"
							/>
							<button className="bg-reggae-green text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors duration-300 whitespace-nowrap">
								Subscribe
							</button>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Bottom Bar */}
			<div className="border-t border-white/10">
				<div className="container mx-auto px-4 py-6">
					<motion.div
						variants={fadeInVariants}
						initial="initial"
						whileInView="animate"
						viewport={{ once: true }}
						className="flex flex-col md:flex-row items-center justify-between gap-4"
					>
						<div className="flex items-center gap-2 text-gray-400">
							<span>&copy; {currentYear} Rasman Music. All rights reserved.</span>
						</div>

						<div className="flex items-center gap-2 text-gray-400">
							<span>Made with</span>
							<Heart className="text-reggae-red" size={16} />
							<span>for the reggae community</span>
						</div>

						<div className="flex items-center gap-6 text-sm">
							<Link href="/privacy" className="text-gray-400 hover:text-reggae-green transition-colors">
								Privacy
							</Link>
							<Link href="/terms" className="text-gray-400 hover:text-reggae-green transition-colors">
								Terms
							</Link>
							<Link href="/cookies" className="text-gray-400 hover:text-reggae-green transition-colors">
								Cookies
							</Link>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Floating Back to Top Button */}
			<motion.button
				onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				className="fixed bottom-6 right-6 w-12 h-12 bg-reggae-green rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors duration-300 z-40"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1 }}
				type="button"
				aria-label="Scroll to top"
			>
				<svg
					width="20"
					height="20"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					className="text-white"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
				</svg>
			</motion.button>
		</footer>
	);
};

export default Footer;
