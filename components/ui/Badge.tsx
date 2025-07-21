"use client";

import React from "react";

// Badge Component
interface BadgeProps {
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "success" | "warning" | "danger";
	size?: "sm" | "md" | "lg";
	className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
	children,
	variant = "primary",
	size = "md",
	className = "",
}) => {
	const variants = {
		primary: "bg-reggae-green text-white",
		secondary: "bg-gray-100 text-gray-700",
		success: "bg-green-100 text-green-700",
		warning: "bg-yellow-100 text-yellow-700",
		danger: "bg-red-100 text-red-700",
	};

	const sizes = {
		sm: "px-2 py-1 text-xs",
		md: "px-3 py-1 text-sm",
		lg: "px-4 py-2 text-base",
	};

	return (
		<span
			className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
		>
			{children}
		</span>
	);
};
