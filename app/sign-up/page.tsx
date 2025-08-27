"use client";

import { SignUpButton } from "@clerk/nextjs";
import React from "react";
import { ArrowRight, Play, Heart, Star, Music, Headphones, Download } from "lucide-react";

export default function SignUpPage() {
	return (
		<>
			{/* Add CSS to hide modal footer */}
			<style jsx global>{`
				.cl-footer,
				.cl-footerAction,
				.cl-footerActionText,
				.cl-footerActionLink,
				.cl-footerPages {
					display: none !important;
				}
			`}</style>

			<div className="min-h-screen bg-bg flex items-center justify-center px-4 py-24 relative overflow-hidden">
				{/* Enhanced Background Effects */}
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />

				<div className="max-w-7xl w-full relative z-10 grid place-content-center">
					<div className="max-w-lg">
						<div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-12 space-y-8">
							<div>
								<h2 className="sm:text-5xl text-4xl font-medium text-white mb-6">Discover Amazing Music</h2>
								<p className="text-gray-300 text-lg leading-relaxed">
									Join thousands of music lovers exploring the best sounds.
								</p>
							</div>

							{/* Sign Up Button */}
							<div className="space-y-6">
								<SignUpButton mode="modal">
									<button className="group w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3">
										Get Started
										<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
									</button>
								</SignUpButton>

								<div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-400">
									<div className="flex -space-x-1">
										{[1, 2, 3].map((i) => (
											<div key={i} className="w-6 h-6 bg-white/20 rounded-full border border-white/30"></div>
										))}
									</div>
									<span>Join 25,000+ music lovers</span>
								</div>
							</div>

							{/* Already have account */}
							<div className="pt-6 border-t border-white/10">
								<p className="text-gray-400 mb-2">Already have an account?</p>
								<a
									href="/sign-in"
									className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
								>
									Sign In
									<ArrowRight className="w-4 h-4" />
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
