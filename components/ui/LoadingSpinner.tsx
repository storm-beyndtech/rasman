"use client";

import React from "react";
import { motion } from "framer-motion";

// Loading Spinner Component
interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", className = "" }) => {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-8 h-8",
		lg: "w-12 h-12",
	};

	return (
		<div className={`flex items-center justify-center py-8 ${className}`}>
			<motion.div
				animate={{ rotate: 360 }}
				transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
				className={`${sizeClasses[size]} border-2 border-reggae-green border-t-transparent rounded-full`}
			/>
		</div>
	);
};

export default LoadingSpinner;
