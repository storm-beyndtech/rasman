"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const Hero: React.FC = () => {
	const { scrollY } = useScroll();

	return (
		<section className="bg-gradient-to-b from-[#0B0600] to-[#000A07] relative w-full sm:h-screen h-[400px] flex items-center justify-center overflow-hidden">
			<Image
				src="/images/Hero-BG.png"
				alt="bg"
				width={1440}
				height={600}
				priority
				className="absolute mix-blend-color-dodge  top-0"
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
