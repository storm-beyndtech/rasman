"use client";

import { SignInButton } from "@clerk/nextjs";
import React from "react";
import { ArrowRight } from "lucide-react";

export default function SignInPage() {
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

			<div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
				{/* Enhanced Background Effects */}
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />

				<div className="max-w-md w-full relative z-10 text-center">
					{/* Main Content */}
					<div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-12 space-y-8">
						<div>
							<h2 className="text-4xl font-medium text-white mb-5">Welcome Back!</h2>
						</div>

						{/* Sign In Button */}
						<SignInButton mode="modal">
							<button className="group w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3">
								Sign In
								<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</button>
						</SignInButton>

						{/* Alternative Options */}
						<div className="pt-6 border-t border-white/10">
							<p className="text-gray-400 mb-4">Don't have an account?</p>
							<a
								href="/sign-up"
								className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
							>
								Create Account
								<ArrowRight className="w-4 h-4" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
