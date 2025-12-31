"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Play, Music, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

const verifyPayment = async (reference: string) => {
	const response = await fetch("/api/purchase", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ reference }),
	});

	const data = await response.json();

	if (!response.ok || !data.success) {
		throw new Error(data.error || "Payment verification failed");
	}

	return data.data;
};

export default function PaymentSuccess() {
	const searchParams = useSearchParams();
	const reference = searchParams.get("reference");

	const {
		data,
		isLoading,
		isError,
		refetch,
		isFetching,
	} = useQuery({
		queryKey: ["payment-verification", reference],
		queryFn: () => verifyPayment(reference as string),
		enabled: Boolean(reference),
		retry: 1,
	});

	const status: "verifying" | "success" | "failed" = useMemo(() => {
		if (!reference) return "failed";
		if (isLoading || isFetching) return "verifying";
		if (data) return "success";
		if (isError) return "failed";
		return "failed";
	}, [reference, isLoading, isFetching, data, isError]);

	const purchaseData = data;

	if (status === "verifying") {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center px-4">
				<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
					<div className="relative mb-8">
						<div className="w-24 h-24 mx-auto bg-black/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center">
							<Loader2 className="w-12 h-12 text-reggae-green animate-spin" />
						</div>
						<div className="absolute inset-0 bg-gradient-to-br from-reggae-green/20 to-reggae-yellow/20 rounded-full animate-pulse" />
					</div>

					<h1 className="text-2xl font-bold text-white mb-4">Verifying Payment...</h1>

					<p className="text-gray-400 mb-4">Please wait while we confirm your purchase</p>

					{reference && <div className="text-sm text-gray-500">Reference: {reference}</div>}
				</motion.div>
			</div>
		);
	}

	if (status === "success") {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center px-4">
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
					<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8 text-center">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
							className="relative mb-8"
						>
							<div className="w-24 h-24 mx-auto bg-reggae-green/20 backdrop-blur-md border border-reggae-green/30 rounded-full flex items-center justify-center">
								<CheckCircle className="w-12 h-12 text-reggae-green" />
							</div>
							<div className="absolute inset-0 bg-gradient-to-br from-reggae-green/30 to-reggae-yellow/20 rounded-full animate-pulse" />
						</motion.div>

						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
							<h1 className="text-3xl font-bold text-white mb-4">Payment Successful! 🎉</h1>

							<p className="text-gray-300 text-lg mb-6">
								Thank you for your purchase. Your music is now available in your library!
							</p>
						</motion.div>

						{purchaseData?.item && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="bg-black/30 backdrop-blur-md border border-gray-700/20 rounded-xl p-6 mb-8"
							>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12 bg-reggae-green/20 rounded-lg flex items-center justify-center">
										<Music className="w-6 h-6 text-reggae-green" />
									</div>
									<div className="text-left flex-1">
										<h3 className="text-white font-semibold">{purchaseData.item.title}</h3>
										<p className="text-gray-400 text-sm">
											{purchaseData.item.type === "album" ? "Album" : "Single"}
										</p>
									</div>
									{purchaseData.item.price && (
										<div className="text-reggae-green font-semibold">NGN {purchaseData.item.price}</div>
									)}
								</div>
							</motion.div>
						)}

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							className="flex flex-col sm:flex-row gap-4"
						>
							<Link
								href="/dashboard"
								className="flex-1 inline-flex items-center justify-center gap-2 bg-reggae-green text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg group"
							>
								<Play size={20} />
								Go to My Music
								<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
							</Link>

							<Link
								href="/songs"
								className="flex-1 inline-flex items-center justify-center gap-2 bg-black/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold hover:bg-black/30 transition-all duration-300 border border-gray-700/30 hover:border-reggae-green/50"
							>
								<Music size={20} />
								Browse More Music
							</Link>
						</motion.div>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1 }}
							className="text-gray-500 text-sm mt-6"
						>
							You'll be redirected to your music library in a few seconds...
						</motion.p>
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black flex items-center justify-center px-4">
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
				<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8 text-center">
					<div className="w-24 h-24 mx-auto bg-red-900/20 backdrop-blur-md border border-red-500/30 rounded-full flex items-center justify-center mb-8">
						<div className="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center">
							<div className="w-6 h-0.5 bg-red-500 rounded rotate-45" />
							<div className="w-6 h-0.5 bg-red-500 rounded -rotate-45 absolute" />
						</div>
					</div>

					<h1 className="text-2xl font-bold text-white mb-4">Payment Verification Failed</h1>

					<p className="text-gray-300 mb-8">
						We couldn't verify your payment. Please contact support if you were charged.
					</p>

					<div className="space-y-4">
						<button
							onClick={() => (reference ? refetch() : undefined)}
							className="w-full bg-reggae-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 disabled:opacity-60"
							disabled={!reference}
						>
							Try Again
						</button>

						<Link
							href="/songs"
							className="block w-full bg-black/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold hover:bg-black/30 transition-all duration-300 border border-gray-700/30"
						>
							Back to Music
						</Link>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
