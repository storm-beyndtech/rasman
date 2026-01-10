"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const Hero: React.FC = () => {
	const { scrollY } = useScroll();

	return (
		<section className="bg-gradient-to-b from-black via-gray-900 to-black relative w-full sm:h-screen h-[400px] flex items-center justify-center overflow-hidden">
			<Image
				src="/images/Hero-BG.png"
				alt="bg"
				width={1440}
				height={600}
				priority
				className="absolute mix-blend-overlay opacity-60 top-0"
			/>
			<motion.div
				className="sm:w-[450px] absolute bottom-[10%] mx-auto z-10"
				style={{ y: useTransform(scrollY, [0, 1000], [0, -400]) }}
			>
				<Image
					src="/images/Hero-Name.svg"
					className="w-[300px] sm:w-[600px] sm:h-[500px]"
					alt="name"
					width={600}
					height={500}
					priority
				/>
			</motion.div>
		</section>
	);
};

export default Hero;
