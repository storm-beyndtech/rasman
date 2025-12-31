// app/admin/layout.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Music, Upload } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminLayoutProps {
	children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
	const pathname = usePathname();

	const tabs = [
		{
			key: "overview",
			label: "Overview",
			icon: <TrendingUp size={20} />,
			href: "/admin",
		},
		{
			key: "upload",
			label: "Upload",
			icon: <Upload size={20} />,
			href: "/admin/upload",
		},
		{
			key: "content",
			label: "Content",
			icon: <Music size={20} />,
			href: "/admin/content",
		},
		{
			key: "users",
			label: "Users",
			icon: <Users size={20} />,
			href: "/admin/users",
		},
	];

	const isActiveTab = (href: string) => {
		if (href === "/admin") {
			return pathname === "/admin";
		}
		return pathname.startsWith(href);
	};

	return (
		<div className="min-h-screen bg-bg pt-24 pb-20 relative overflow-hidden">
			{/* Grid Pattern */}
			<div
				className="fixed inset-0 opacity-[0.3] pointer-events-none"
				style={{
					backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
					backgroundSize: "80px 80px",
					backgroundAttachment: "fixed",
				}}
			/>

			<div className="container mx-auto px-4">
				{/* Horizontal Tabs */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="mb-12"
				>
					<div className="bg-transparent backdrop-blur-sm border border-stone-700/40 rounded-2xl p-1">
						<div className="max-w-4xl mx-auto grid sm:grid-cols-4 grid-cols-2 p-3 gap-3 items-center">
							{tabs.map((tab, index) => (
								<Link key={tab.key} href={tab.href}>
									<motion.div
										className={`flex items-center justify-center gap-3 px-6 py-2 border-[1.5px] rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${
											isActiveTab(tab.href)
												? "bg-purple-500/5 text-white border-purple-500"
												: "text-stone-600 hover:text-white hover:bg-putple-500/20 border-transparent"
										}`}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.2 + index * 0.05 }}
									>
										<div
											className={`transition-colors duration-300 ${
												isActiveTab(tab.href) ? "text-white" : "text-stone-500"
											}`}
										>
											{tab.icon}
										</div>
										<span>{tab.label}</span>
									</motion.div>
								</Link>
							))}
						</div>
					</div>
				</motion.div>

				{/* Content Area */}
				<div className="min-h-[600px]">
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3 }}
					>
						{children}
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default AdminLayout;
