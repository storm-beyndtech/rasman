"use client";

import { motion } from "framer-motion";
import { XCircle, ArrowLeft, Music, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelled() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center px-4">
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
				<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8 text-center">
					{/* Cancelled Icon */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
						className="relative mb-8"
					>
						<div className="w-24 h-24 mx-auto bg-yellow-900/20 backdrop-blur-md border border-yellow-500/30 rounded-full flex items-center justify-center">
							<XCircle className="w-12 h-12 text-yellow-500" />
						</div>
						<div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-full animate-pulse" />
					</motion.div>

					{/* Cancelled Message */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<h1 className="text-2xl font-bold text-white mb-4">Payment Cancelled</h1>

						<p className="text-gray-300 mb-2">You cancelled the payment process.</p>

						<p className="text-gray-400 text-sm mb-8">
							No charges were made to your account. You can try again anytime.
						</p>
					</motion.div>

					{/* Action Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="space-y-4"
					>
						<Link
							href="/songs"
							className="w-full inline-flex items-center justify-center gap-2 bg-reggae-green text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg group"
						>
							<ShoppingCart size={20} />
							Continue Shopping
							<motion.div className="group-hover:translate-x-1 transition-transform duration-300">
								→
							</motion.div>
						</Link>

						<Link
							href="/albums"
							className="block w-full bg-black/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold hover:bg-black/30 transition-all duration-300 border border-gray-700/30 hover:border-reggae-green/50"
						>
							<div className="flex items-center justify-center gap-2">
								<Music size={18} />
								Browse Albums
							</div>
						</Link>

						<Link
							href="/"
							className="block w-full text-gray-400 hover:text-reggae-green px-6 py-3 rounded-xl font-medium transition-all duration-300"
						>
							<div className="flex items-center justify-center gap-2">
								<ArrowLeft size={18} />
								Back to Home
							</div>
						</Link>
					</motion.div>

					{/* Help Text */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="mt-8 pt-6 border-t border-gray-700/30"
					>
						<p className="text-gray-500 text-sm">Need help? Contact our support team</p>
						<a
							href="mailto:support@rasman.com"
							className="text-reggae-green hover:text-green-400 transition-colors duration-300 text-sm font-medium"
						>
							support@rasman.com
						</a>
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
}
