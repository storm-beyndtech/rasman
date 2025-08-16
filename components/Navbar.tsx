"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Settings } from "lucide-react";
import Image from "next/image";

const Navbar: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const pathname = usePathname();
	const { isSignedIn, user } = useUser();

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 50);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Close menu when clicking outside (but not on Clerk elements)
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;

			// Don't close if clicking on Clerk elements
			if (
				target.closest("[data-clerk-element]") ||
				target.closest(".cl-userButton") ||
				target.closest(".cl-modal") ||
				target.closest(".cl-popover")
			) {
				return;
			}

			if (isOpen && !target.closest(".navbar-container")) {
				setIsOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [isOpen]);

	const isAdmin = user?.publicMetadata?.role === "admin";

	const navLinks = [
		{ href: "/", label: "Home" },
		{ href: "/songs", label: "Songs" },
		{ href: "/albums", label: "Albums" },
		{ href: "/biography", label: "Biography" },
	];

	const authLinks = isSignedIn
		? [
				{ href: "/dashboard", label: "My Music", icon: <Music size={16} /> },
				...(isAdmin ? [{ href: "/admin", label: "Admin", icon: <Settings size={16} /> }] : []),
		  ]
		: [];

	return (
		<>
			{/* Backdrop blur overlay when menu is open */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xl"
						onClick={() => setIsOpen(false)}
					/>
				)}
			</AnimatePresence>

			<nav
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 navbar-container ${
					scrolled ? "bg-black/10 backdrop-blur-xl border-b border-gray-700/20 shadow-2xl" : "bg-transparent"
				}`}
			>
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between h-[70px]">
						{/* Logo */}
						<Link href="/" className="z-60">
							<motion.div
								className="relative"
								whileHover={{ scale: 1.1 }}
								transition={{ type: "spring", stiffness: 400, damping: 17 }}
							>
								<Image src="/images/logo.svg" alt="Logo" width={40} height={10} className="w-20 h-auto" />
							</motion.div>
						</Link>

						<div className="flex-1"></div>

						{/* Hamburger Menu Button */}
						<motion.button
							onClick={() => setIsOpen(!isOpen)}
							className={`relative p-2 rounded-lg transition-all duration-300 z-60 ${
								scrolled
									? "bg-gray-800/30 backdrop-blur-md border border-gray-700/30"
									: "bg-black/30 backdrop-blur-sm border border-gray-600/20"
							} hover:bg-gray-800/50 group`}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<div className="relative w-5 h-5">
								<motion.div
									animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
									className="absolute top-1 left-0 w-5 h-0.5 bg-white rounded-full"
								/>
								<motion.div
									animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
									className="absolute top-2.5 left-0 w-5 h-0.5 bg-white rounded-full"
								/>
								<motion.div
									animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
									className="absolute top-4 left-0 w-5 h-0.5 bg-white rounded-full"
								/>
							</div>
							<div className="absolute inset-0 bg-gradient-to-br from-reggae-green/20 to-reggae-yellow/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						</motion.button>
					</div>
				</div>

				{/* Futuristic Dropdown Menu */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, y: -20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -20, scale: 0.95 }}
							transition={{ type: "spring", stiffness: 400, damping: 25 }}
							className="absolute top-full right-4 mt-2 w-80 bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden z-[60]"
						>
							<div className="relative p-6 space-y-1 z-[60]">
								{/* Navigation Links */}
								<div className="space-y-1 mb-6">
									{navLinks.map((link, index) => (
										<motion.div
											key={link.href}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
										>
											<Link
												href={link.href}
												onClick={() => setIsOpen(false)}
												className={`block py-3 px-4 rounded-xl font-medium transition-all duration-300 group relative z-[60] ${
													pathname === link.href
														? "text-reggae-green bg-green-800/10"
														: "text-gray-200 hover:text-reggae-green hover:bg-green-800/20"
												}`}
											>
												<span className="relative z-[60]">{link.label}</span>
											</Link>
										</motion.div>
									))}
								</div>

								{/* Auth Links */}
								{authLinks.length > 0 && (
									<div className="space-y-1 mb-6">
										<div className="text-gray-100/50 text-sm font-medium px-4 mb-2">My Account</div>
										{authLinks.map((link, index) => (
											<motion.div
												key={link.href}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: (navLinks.length + index) * 0.1 }}
											>
												<Link
													href={link.href}
													onClick={() => setIsOpen(false)}
													className={`flex items-center space-x-3 py-3 px-4 rounded-xl font-medium transition-all duration-300 group relative z-[60] ${
														pathname === link.href
															? "text-reggae-green bg-gray-800/40"
															: "text-gray-200 hover:text-reggae-green hover:bg-gray-800/20"
													}`}
												>
													<span className="text-gray-400 group-hover:text-reggae-green transition-colors">
														{link.icon}
													</span>
													<span>{link.label}</span>
												</Link>
											</motion.div>
										))}
									</div>
								)}

								{/* Authentication Section */}
								<div className="border-t border-gray-700/30 pt-6">
									{isSignedIn ? (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.3 }}
											className="flex items-center space-x-4 p-4 bg-green-800/10 rounded-xl border border-gray-700/20 relative z-[60]"
										>
											<div className="relative z-[70]">
												<UserButton
													appearance={{
														elements: {
															avatarBox: "w-12 h-12 rounded-xl",
														},
													}}
												/>
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-gray-200 font-medium truncate">{user?.firstName || "User"}</div>
												<div className="text-gray-100/50 text-sm truncate">
													{user?.emailAddresses[0]?.emailAddress}
												</div>
											</div>
										</motion.div>
									) : (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.3 }}
											className="space-y-3 relative z-[60]"
										>
											<div className="relative z-[60]">
												<SignInButton mode="modal">
													<button
														onClick={() => setIsOpen(false)}
														className="w-full py-3 px-6 text-gray-200 hover:text-reggae-green font-medium transition-all duration-300 hover:bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-reggae-green/50 backdrop-blur-sm relative z-[60]"
													>
														Sign In
													</button>
												</SignInButton>
											</div>
											<div className="relative z-[60]">
												<SignUpButton mode="modal">
													<button
														onClick={() => setIsOpen(false)}
														className="w-full bg-gradient-to-r from-reggae-green/80 to-green-600/80 text-white py-3 px-6 rounded-xl font-medium hover:from-reggae-green hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-reggae-green/30 backdrop-blur-sm relative z-[60]"
													>
														Sign Up
													</button>
												</SignUpButton>
											</div>
										</motion.div>
									)}
								</div>
							</div>

							{/* Animated border effect */}
							<div className="absolute inset-0 rounded-2xl">
								<div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-reggae-green/30 via-transparent to-reggae-yellow/30 opacity-30" />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</nav>
		</>
	);
};

export default Navbar;
