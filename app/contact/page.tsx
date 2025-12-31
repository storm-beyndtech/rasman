"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Mail, Phone, Send } from "lucide-react";
import { contactSchema } from "@/lib/validations";
import { useToast } from "@/provider/ToastProvider";

interface ContactFormState {
	name: string;
	email: string;
	subject: string;
	message: string;
}

const ContactPage: React.FC = () => {
	const { showToast } = useToast();
	const [formData, setFormData] = useState<ContactFormState>({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});

	const contactMutation = useMutation({
		mutationKey: ["contact-form"],
		mutationFn: async (payload: ContactFormState) => {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const result = await response.json();
			if (!response.ok || !result.success) {
				throw new Error(result.error || "Failed to send message");
			}

			return result;
		},
		onSuccess: () => {
			showToast("Message sent successfully", "success");
			setFormData({ name: "", email: "", subject: "", message: "" });
		},
		onError: (error) => {
			showToast(error instanceof Error ? error.message : "Failed to send message", "error");
		},
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const parsed = contactSchema.safeParse(formData);

		if (!parsed.success) {
			const errors: Partial<Record<keyof ContactFormState, string>> = {};
			parsed.error.issues.forEach((issue) => {
				const fieldName = issue.path[0] as keyof ContactFormState;
				if (!errors[fieldName]) {
					errors[fieldName] = issue.message;
				}
			});
			setFieldErrors(errors);
			return;
		}

		setFieldErrors({});
		contactMutation.mutate(parsed.data);
	};

	const handleChange = (field: keyof ContactFormState, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className="min-h-screen bg-bg pt-24 pb-16 relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-br from-reggae-green/5 via-bg to-reggae-yellow/10 pointer-events-none" />
			<div className="container mx-auto px-4 relative z-10">
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
					<p className="text-sm text-reggae-green tracking-[0.25em] uppercase mb-4">Contact</p>
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Let's talk music and collaboration</h1>
					<p className="text-lg text-gray-300 max-w-2xl mx-auto">
						Send a note about bookings, purchases, or partnership ideas. We respond quickly so your rhythm never
						stops.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="lg:col-span-2 bg-black/30 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-8 shadow-2xl"
					>
						<form className="space-y-6" onSubmit={handleSubmit}>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) => handleChange("name", e.target.value)}
										className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-reggae-green"
										placeholder="Your full name"
										required
									/>
									{fieldErrors.name && <p className="text-red-400 text-sm mt-2">{fieldErrors.name}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
									<input
										type="email"
										value={formData.email}
										onChange={(e) => handleChange("email", e.target.value)}
										className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-reggae-green"
										placeholder="you@example.com"
										required
									/>
									{fieldErrors.email && <p className="text-red-400 text-sm mt-2">{fieldErrors.email}</p>}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
								<input
									type="text"
									value={formData.subject}
									onChange={(e) => handleChange("subject", e.target.value)}
									className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-reggae-green"
									placeholder="How can we help?"
									required
								/>
								{fieldErrors.subject && <p className="text-red-400 text-sm mt-2">{fieldErrors.subject}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
								<textarea
									value={formData.message}
									onChange={(e) => handleChange("message", e.target.value)}
									className="w-full px-4 py-3 rounded-xl bg-black/40 border border-gray-700/40 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-reggae-green min-h-[160px]"
									placeholder="Share details about your request..."
									required
								/>
								{fieldErrors.message && <p className="text-red-400 text-sm mt-2">{fieldErrors.message}</p>}
							</div>

							<div className="flex items-center justify-between flex-wrap gap-4">
								<div className="text-gray-400 text-sm">
									We respect your privacy and respond within one business day.
								</div>
								<button
									type="submit"
									disabled={contactMutation.isPending}
									className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-reggae-green text-black font-semibold shadow-lg hover:bg-green-500 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
								>
									{contactMutation.isPending ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Sending...
										</>
									) : (
										<>
											<Send size={18} />
											Send Message
										</>
									)}
								</button>
							</div>
						</form>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-black/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 text-white shadow-xl space-y-6"
					>
						<div>
							<h3 className="text-xl font-semibold mb-2">Direct support</h3>
							<p className="text-gray-400">For urgent questions about purchases or downloads, use the contact form or:</p>
						</div>
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-reggae-green/20 flex items-center justify-center">
									<Mail className="text-reggae-green" size={18} />
								</div>
								<div>
									<p className="text-sm text-gray-400">Email</p>
									<p className="font-medium">support@rasmanmusic.com</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-reggae-yellow/20 flex items-center justify-center">
									<Phone className="text-reggae-yellow" size={18} />
								</div>
								<div>
									<p className="text-sm text-gray-400">Phone</p>
									<p className="font-medium">+234-000-000-0000</p>
								</div>
							</div>
						</div>
						<div className="p-4 rounded-xl bg-black/30 border border-gray-700/40">
							<h4 className="font-semibold mb-2">Why reach out?</h4>
							<ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
								<li>Purchase or download assistance</li>
								<li>Booking and collaboration requests</li>
								<li>Technical issues with streaming</li>
								<li>Feedback to improve the platform</li>
							</ul>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default ContactPage;
