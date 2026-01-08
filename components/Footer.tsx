"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Footer() {
	const pathname = usePathname();

	// Navigation links
	const navLinks = [
		{ href: "/", label: "RASMAN", isLogo: true },
		{ href: "/biography", label: "BIO" },
		{ href: "/songs", label: "SONGS" },
		{ href: "/albums", label: "ALBUMS" },
		{ href: "/contact", label: "CONTACT" },
	];

	return (
		<footer className="relative bg-[#0B0600] overflow-hidden">
			{/* Navigation Links Row */}
			<div className="relative z-10 sm:px-8 py-8">
				<div className="container mx-auto">
					<div className="flex justify-between items-center">
						{navLinks.map((link, index) => (
							<motion.div
								key={link.href}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								className={`${link.isLogo ? "hidden sm:block" : ""} max-sm:px-4`}
							>
								<Link
									href={link.href}
									className={`relative group transition-all duration-300 font-bold font-montserrat ${
										pathname === link.href
											? "text-reggae-green"
											: "text-reggae-green/80 hover:text-reggae-yellow/50"
									} `}
								>
									{link.isLogo ? (
										<Image src="/images/logo.svg" alt="Logo" width={70} height={30} className="w-18 h-auto" />
									) : (
										link.label
									)}
								</Link>
							</motion.div>
						))}
					</div>
				</div>
			</div>

			{/* Infinite Scrolling Artist Name */}
			<div className="relative overflow-hidden">
				{/* Scrolling container */}
				<motion.div
					animate={{ x: ["0%", "-100%"] }}
					transition={{
						duration: 200,
						repeat: Infinity,
						ease: "linear",
					}}
					className="flex w-fit h-full "
				>
					<div className={`flex gap-20`}>
						{Array.from({ length: Math.ceil(window.innerWidth / 1713) + 2 }).map((_, i) => (
							<div key={i} className="w-[1713px] flex-shrink-0">
								<Image src="/images/Footer-Name.svg" alt="Rasman" width={1713} height={125} />
							</div>
						))}
					</div>
				</motion.div>
			</div>
		</footer>
	);
}
