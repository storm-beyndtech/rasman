"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Music, ImageIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface UploadFormState {
	songForm: {
		title: string;
		artist: string;
		genre: string;
		duration: number;
		price: number;
		featured: boolean;
		audioFile: File | null;
		coverFile: File | null;
	};
	uploading: boolean;
	uploadProgress: number;
	uploadStatus: "idle" | "uploading" | "success" | "error";
	errorMessage: string;
}

export default function AdminUploadForm() {
	const [state, setState] = useState<UploadFormState>({
		songForm: {
			title: "",
			artist: "Rasman Peter Dudu",
			genre: "Reggae",
			duration: 0,
			price: 0,
			featured: false,
			audioFile: null,
			coverFile: null,
		},
		uploading: false,
		uploadProgress: 0,
		uploadStatus: "idle",
		errorMessage: "",
	});

	const handleFileSelect = (type: "audio" | "cover", file: File) => {
		setState((prev) => ({
			...prev,
			songForm: {
				...prev.songForm,
				[type === "audio" ? "audioFile" : "coverFile"]: file,
			},
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!state.songForm.title || !state.songForm.audioFile || !state.songForm.coverFile) {
			setState((prev) => ({
				...prev,
				errorMessage: "Please fill all required fields and select files",
				uploadStatus: "error",
			}));
			return;
		}

		setState((prev) => ({
			...prev,
			uploading: true,
			uploadStatus: "uploading",
			uploadProgress: 0,
			errorMessage: "",
		}));

		try {
			const formData = new FormData();
			formData.append("title", state.songForm.title);
			formData.append("artist", state.songForm.artist);
			formData.append("genre", state.songForm.genre);
			formData.append("duration", state.songForm.duration.toString());
			formData.append("price", state.songForm.price.toString());
			formData.append("featured", state.songForm.featured.toString());
			formData.append("audioFile", state.songForm.audioFile);
			formData.append("coverFile", state.songForm.coverFile);

			// Simulate progress
			const progressInterval = setInterval(() => {
				setState((prev) => ({
					...prev,
					uploadProgress: Math.min(prev.uploadProgress + 10, 90),
				}));
			}, 200);

			const response = await fetch("/api/admin/upload", {
				method: "POST",
				body: formData,
			});

			clearInterval(progressInterval);
			setState((prev) => ({ ...prev, uploadProgress: 100 }));

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || "Upload failed");
			}

			setState((prev) => ({ ...prev, uploadStatus: "success", uploading: false }));

			// Reset form after success
			setTimeout(() => {
				setState((prev) => ({
					...prev,
					songForm: {
						title: "",
						artist: "Rasman Peter Dudu",
						genre: "Reggae",
						duration: 0,
						price: 0,
						featured: false,
						audioFile: null,
						coverFile: null,
					},
					uploadStatus: "idle",
					uploadProgress: 0,
				}));
			}, 3000);
		} catch (error) {
			setState((prev) => ({
				...prev,
				uploading: false,
				uploadStatus: "error",
				errorMessage: error instanceof Error ? error.message : "Upload failed",
				uploadProgress: 0,
			}));
		}
	};

	return (
		<div className="space-y-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8"
			>
				<div className="space-y-8">
					{/* Form Fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Title */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-3">Song Title *</label>
							<input
								type="text"
								value={state.songForm.title}
								onChange={(e) =>
									setState((prev) => ({
										...prev,
										songForm: { ...prev.songForm, title: e.target.value },
									}))
								}
								className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400 transition-all duration-300"
								placeholder="Enter song title"
								disabled={state.uploading}
							/>
						</div>

						{/* Artist */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-3">Artist</label>
							<input
								type="text"
								value={state.songForm.artist}
								onChange={(e) =>
									setState((prev) => ({
										...prev,
										songForm: { ...prev.songForm, artist: e.target.value },
									}))
								}
								className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white transition-all duration-300"
								disabled={state.uploading}
							/>
						</div>

						{/* Genre */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-3">Genre</label>
							<select
								value={state.songForm.genre}
								onChange={(e) =>
									setState((prev) => ({
										...prev,
										songForm: { ...prev.songForm, genre: e.target.value },
									}))
								}
								className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white transition-all duration-300"
								disabled={state.uploading}
							>
								<option value="Reggae">Reggae</option>
								<option value="Roots">Roots</option>
								<option value="Dancehall">Dancehall</option>
								<option value="Dub">Dub</option>
							</select>
						</div>

						{/* Duration */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-3">Duration (seconds)</label>
							<input
								type="number"
								value={state.songForm.duration}
								onChange={(e) =>
									setState((prev) => ({
										...prev,
										songForm: { ...prev.songForm, duration: parseInt(e.target.value) || 0 },
									}))
								}
								className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white transition-all duration-300"
								min="0"
								disabled={state.uploading}
							/>
						</div>

						{/* Price */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-3">Price (₦)</label>
							<input
								type="number"
								value={state.songForm.price}
								onChange={(e) =>
									setState((prev) => ({
										...prev,
										songForm: { ...prev.songForm, price: parseFloat(e.target.value) || 0 },
									}))
								}
								className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white transition-all duration-300"
								min="0"
								step="0.01"
								disabled={state.uploading}
							/>
						</div>

						{/* Featured */}
						<div className="flex items-center pt-8">
							<input
								type="checkbox"
								id="featured"
								checked={state.songForm.featured}
								onChange={(e) =>
									setState((prev) => ({
										...prev,
										songForm: { ...prev.songForm, featured: e.target.checked },
									}))
								}
								className="w-4 h-4 text-reggae-green bg-black/30 border-gray-700/30 rounded focus:ring-reggae-green focus:ring-2"
								disabled={state.uploading}
							/>
							<label htmlFor="featured" className="ml-3 text-sm font-medium text-gray-300">
								Featured Song
							</label>
						</div>
					</div>

					{/* File Uploads */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Audio File */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-3">Audio File *</label>
							<div
								className={`border-2 border-dashed border-gray-700/50 rounded-xl p-8 text-center transition-all duration-300 ${
									state.uploading
										? "opacity-50 cursor-not-allowed"
										: "hover:border-reggae-green/50 cursor-pointer hover:bg-black/20"
								}`}
							>
								<input
									type="file"
									accept="audio/*"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleFileSelect("audio", file);
									}}
									className="hidden"
									id="audio-upload"
									disabled={state.uploading}
								/>
								<label
									htmlFor="audio-upload"
									className={state.uploading ? "cursor-not-allowed" : "cursor-pointer"}
								>
									<Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
									{state.songForm.audioFile ? (
										<div>
											<p className="text-sm text-white font-medium">{state.songForm.audioFile.name}</p>
											<p className="text-xs text-gray-400 mt-1">
												{(state.songForm.audioFile.size / 1024 / 1024).toFixed(2)} MB
											</p>
										</div>
									) : (
										<>
											<p className="text-sm text-gray-300 mb-1">Click to upload audio file</p>
											<p className="text-xs text-gray-500">MP3, WAV, FLAC up to 50MB</p>
										</>
									)}
								</label>
							</div>
						</div>

						{/* Cover Art */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-3">Cover Art *</label>
							<div
								className={`border-2 border-dashed border-gray-700/50 rounded-xl p-8 text-center transition-all duration-300 ${
									state.uploading
										? "opacity-50 cursor-not-allowed"
										: "hover:border-reggae-green/50 cursor-pointer hover:bg-black/20"
								}`}
							>
								<input
									type="file"
									accept="image/*"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleFileSelect("cover", file);
									}}
									className="hidden"
									id="cover-upload"
									disabled={state.uploading}
								/>
								<label
									htmlFor="cover-upload"
									className={state.uploading ? "cursor-not-allowed" : "cursor-pointer"}
								>
									<ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
									{state.songForm.coverFile ? (
										<div>
											<p className="text-sm text-white font-medium">{state.songForm.coverFile.name}</p>
											<p className="text-xs text-gray-400 mt-1">
												{(state.songForm.coverFile.size / 1024 / 1024).toFixed(2)} MB
											</p>
										</div>
									) : (
										<>
											<p className="text-sm text-gray-300 mb-1">Click to upload cover art</p>
											<p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
										</>
									)}
								</label>
							</div>
						</div>
					</div>

					{/* Upload Progress */}
					{state.uploading && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6"
						>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<Loader2 className="w-5 h-5 text-reggae-green animate-spin" />
									<span className="text-sm font-medium text-white">Uploading...</span>
								</div>
								<span className="text-sm text-gray-400">{state.uploadProgress}%</span>
							</div>
							<div className="w-full bg-gray-700/30 rounded-full h-2">
								<motion.div
									className="bg-gradient-to-r from-reggae-green to-green-400 h-2 rounded-full transition-all duration-300"
									style={{ width: `${state.uploadProgress}%` }}
									initial={{ width: 0 }}
									animate={{ width: `${state.uploadProgress}%` }}
								/>
							</div>
						</motion.div>
					)}

					{/* Status Messages */}
					{state.uploadStatus === "success" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-xl text-green-400"
						>
							<CheckCircle size={20} />
							<span className="font-medium">Song uploaded successfully!</span>
						</motion.div>
					)}

					{state.uploadStatus === "error" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400"
						>
							<AlertCircle size={20} />
							<span className="font-medium">{state.errorMessage}</span>
						</motion.div>
					)}

					{/* Submit Button */}
					<div className="flex justify-end pt-4">
						<motion.button
							onClick={handleSubmit}
							disabled={state.uploading}
							className="flex items-center gap-3 px-8 py-4 bg-reggae-green text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
							whileHover={{ scale: state.uploading ? 1 : 1.02 }}
							whileTap={{ scale: state.uploading ? 1 : 0.98 }}
						>
							{state.uploading ? (
								<>
									<Loader2 size={20} className="animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<Upload size={20} />
									Upload Song
								</>
							)}
						</motion.button>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
