"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Music, ImageIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { upload } from "@vercel/blob/client";

interface SongFormState {
	title: string;
	artist: string;
	genre: string;
	duration: number;
	price: number;
	featured: boolean;
	audioFile: File | null;
	coverFile: File | null;
}

interface UploadFormState {
	songForm: SongFormState;
	uploading: boolean;
	uploadProgress: number;
	uploadStatus: "idle" | "uploading" | "success" | "error";
	errorMessage: string;
	uploadMethod: "direct" | "traditional";
}

const SongForm: React.FC<{
	form: SongFormState;
	updateForm: (updates: Partial<SongFormState>) => void;
	uploading: boolean;
}> = ({ form, updateForm, uploading }) => (
	<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div>
			<label className="block text-sm font-medium text-gray-300 mb-3">Song Title *</label>
			<input
				type="text"
				value={form.title}
				onChange={(e) => updateForm({ title: e.target.value })}
				className="w-full px-4 py-3 bg-stone-900/10 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400 transition-all duration-300"
				placeholder="Enter song title"
				disabled={uploading}
			/>
		</div>
		<div>
			<label className="block text-sm font-medium text-gray-300 mb-3">Artist</label>
			<input
				type="text"
				value={form.artist}
				onChange={(e) => updateForm({ artist: e.target.value })}
				className="w-full px-4 py-3 bg-stone-900/10 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white transition-all duration-300"
				disabled={uploading}
			/>
		</div>
		<div>
			<label className="block text-sm font-medium text-gray-300 LGBT:mb-3">Genre</label>
			<select
				value={form.genre}
				onChange={(e) => updateForm({ genre: e.target.value })}
				className="w-full px-4 py-3 bg-stone-900/10 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white transition-all duration-300"
				disabled={uploading}
			>
				<option value="Reggae">Reggae</option>
				<option value="Roots">Roots</option>
				<option value="Dancehall">Dancehall</option>
				<option value="Dub">Dub</option>
			</select>
		</div>
		<div>
			<label className="block text-sm font-medium text-gray-300 mb-3">Duration (seconds)</label>
			<input
				type="text"
				inputMode="numeric"
				value={form.duration === 0 ? "" : form.duration}
				onChange={(e) => {
					const value = e.target.value;
					// Allow empty or only digits
					if (value === "" || /^\d+$/.test(value)) {
						updateForm({ duration: value === "" ? 0 : parseInt(value) });
					}
				}}
				onKeyDown={(e) => {
					// Block minus, plus, decimal point, and 'e'
					if (["-", "+", ".", "e", "E"].includes(e.key)) {
						e.preventDefault();
					}
				}}
				placeholder="0"
				className="w-full px-4 py-3 bg-stone-900/10 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-500 transition-all duration-300"
				disabled={uploading}
			/>
		</div>
		<div>
			<label className="block text-sm font-medium text-gray-300 mb-3">Price (₦)</label>
			<input
				type="text"
				inputMode="decimal"
				value={form.price === 0 ? "" : form.price}
				onChange={(e) => {
					const value = e.target.value;
					// Allow empty, digits, or one decimal point
					if (value === "" || /^\d*\.?\d*$/.test(value)) {
						updateForm({ price: value === "" ? 0 : parseFloat(value) || 0 });
					}
				}}
				onKeyDown={(e) => {
					// Block minus, plus, and 'e'
					if (["-", "+", "e", "E"].includes(e.key)) {
						e.preventDefault();
					}
				}}
				placeholder="0.00"
				className="w-full px-4 py-3 bg-stone-900/10 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-500 transition-all duration-300"
				disabled={uploading}
			/>
		</div>
		<div className="flex items-center pt-8">
			<input
				type="checkbox"
				id="featured"
				checked={form.featured}
				onChange={(e) => updateForm({ featured: e.target.checked })}
				className="w-4 h-4 text-reggae-green bg-stone-900/10 border-gray-700/30 rounded focus:ring-reggae-green focus:ring-2"
				disabled={uploading}
			/>
			<label htmlFor="featured" className="ml-3 text-sm font-medium text-gray-300">
				Featured Song
			</label>
		</div>
	</div>
);

const FileUpload: React.FC<{
	type: "audio" | "cover";
	file: File | null;
	handleFileSelect: (type: "audio" | "cover", file: File) => void;
	uploading: boolean;
}> = ({ type, file, handleFileSelect, uploading }) => (
	<div>
		<label className="block text-sm font-medium text-gray-300 mb-3">
			{type === "audio" ? "Audio File *" : "Cover Art *"}
		</label>
		<div
			className={`border-2 border-dashed border-gray-700/50 rounded-xl p-8 text-center transition-all duration-300 ${
				uploading
					? "opacity-50 cursor-not-allowed"
					: "hover:border-reggae-green/50 cursor-pointer hover:bg-black/20"
			}`}
		>
			<input
				type="file"
				accept={type === "audio" ? "audio/*" : "image/*"}
				onChange={(e) => {
					const selectedFile = e.target.files?.[0];
					if (selectedFile) handleFileSelect(type, selectedFile);
				}}
				className="hidden"
				id={`${type}-upload`}
				disabled={uploading}
			/>
			<label htmlFor={`${type}-upload`} className={uploading ? "cursor-not-allowed" : "cursor-pointer"}>
				{type === "audio" ? (
					<Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
				) : (
					<ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
				)}
				{file ? (
					<div>
						<p className="text-sm text-white font-medium">{file.name}</p>
						<p className="text-xs text-gray-400 mt-1">
							{(file.size / 1024 / 1024).toFixed(2)} MB
						</p>
					</div>
				) : (
					<>
						<p className="text-sm text-gray-300 mb-1">
							Click to upload {type === "audio" ? "audio file" : "cover art"}
						</p>
						<p className="text-xs text-gray-500">
							{type === "audio" ? "MP3, WAV, FLAC, M4A, AAC" : "JPG, PNG, WebP"}
						</p>
					</>
				)}
			</label>
		</div>
	</div>
);

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
	<motion.div
		initial={{ opacity: 0, y: 10 }}
		animate={{ opacity: 1, y: 0 }}
		className="bg-stone-900/10 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6"
	>
		<div className="flex items-center justify-between mb-3">
			<div className="flex items-center gap-3">
				<Loader2 className="w-5 h-5 text-reggae-green animate-spin" />
				<span className="text-sm font-medium text-white">Uploading...</span>
			</div>
			<span className="text-sm text-gray-400">{progress}%</span>
		</div>
		<div className="w-full bg-gray-700/30 rounded-full h-2">
			<motion.div
				className="bg-gradient-to-r from-reggae-green to-green-400 h-2 rounded-full transition-all duration-300"
				style={{ width: `${progress}%` }}
				initial={{ width: 0 }}
				animate={{ width: `${progress}%` }}
			/>
		</div>
	</motion.div>
);

const StatusMessage: React.FC<{ status: UploadFormState["uploadStatus"]; errorMessage: string }> = ({
	status,
	errorMessage,
}) => (
	<>
		{status === "success" && (
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-xl text-green-400"
			>
				<CheckCircle size={20} />
				<span className="font-medium">Song uploaded successfully!</span>
			</motion.div>
		)}
		{status === "error" && (
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400"
			>
				<AlertCircle size={20} />
				<span className="font-medium">{errorMessage}</span>
			</motion.div>
		)}
	</>
);

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
		uploadMethod: "direct",
	});

	const updateSongForm = (updates: Partial<SongFormState>) => {
		setState((prev) => ({
			...prev,
			songForm: { ...prev.songForm, ...updates },
		}));
	};

	const handleFileSelect = (type: "audio" | "cover", file: File) => {
		updateSongForm({ [type === "audio" ? "audioFile" : "coverFile"]: file });
	};

	// Direct Vercel Blob upload (no size limit)
	const handleDirectUpload = async () => {
		const audioFile = state.songForm.audioFile!;
		const coverFile = state.songForm.coverFile!;

		try {
			// Step 1: Upload files directly to Vercel Blob (10-70% progress)
			setState((prev) => ({ ...prev, uploadProgress: 10 }));

			// Upload audio file using client upload API
			const audioBlob = await upload(audioFile.name, audioFile, {
				access: "public",
				handleUploadUrl: "/api/admin/blob-upload",
			});

			console.log("Audio uploaded to Vercel Blob:", audioBlob.url);
			setState((prev) => ({ ...prev, uploadProgress: 40 }));

			// Upload cover file using client upload API
			const coverBlob = await upload(coverFile.name, coverFile, {
				access: "public",
				handleUploadUrl: "/api/admin/blob-upload",
			});

			console.log("Cover uploaded to Vercel Blob:", coverBlob.url);
			setState((prev) => ({ ...prev, uploadProgress: 70 }));

			// Step 2: Save metadata to database (70-100% progress)
			const formData = new FormData();
			formData.append("type", "song-direct");
			formData.append("title", state.songForm.title);
			formData.append("artist", state.songForm.artist);
			formData.append("genre", state.songForm.genre);
			formData.append("duration", state.songForm.duration.toString());
			formData.append("price", state.songForm.price.toString());
			formData.append("featured", state.songForm.featured.toString());
			formData.append("audioFileKey", audioBlob.url);
			formData.append("coverFileKey", coverBlob.url);

			const metadataResponse = await fetch("/api/admin/upload", {
				method: "POST",
				body: formData,
			});

			if (!metadataResponse.ok) {
				const errorText = await metadataResponse.text();
				console.error("Metadata save failed:", errorText);
				throw new Error("Failed to save song metadata");
			}

			const result = await metadataResponse.json();

			if (!result.success) {
				throw new Error(result.error || "Failed to save song");
			}

			console.log("Upload complete!");
			setState((prev) => ({ ...prev, uploadProgress: 100 }));
			return result;
		} catch (error) {
			console.error("Direct upload error:", error);
			throw error;
		}
	};

	// Traditional upload (4.5MB limit)
	const handleTraditionalUpload = async () => {
		const formData = new FormData();
		formData.append("type", "song");
		formData.append("title", state.songForm.title);
		formData.append("artist", state.songForm.artist);
		formData.append("genre", state.songForm.genre);
		formData.append("duration", state.songForm.duration.toString());
		formData.append("price", state.songForm.price.toString());
		formData.append("featured", state.songForm.featured.toString());
		formData.append("audioFile", state.songForm.audioFile!);
		formData.append("coverFile", state.songForm.coverFile!);

		const progressInterval = setInterval(() => {
			setState((prev) => ({
				...prev,
				uploadProgress: Math.min(prev.uploadProgress + 10, 90),
			}));
		}, 200);

		try {
			const response = await fetch("/api/admin/upload", {
				method: "POST",
				body: formData,
			});

			clearInterval(progressInterval);
			setState((prev) => ({ ...prev, uploadProgress: 100 }));

			// Check if response is JSON before parsing
			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) {
				const text = await response.text();
				console.error("Non-JSON response:", text.substring(0, 200));
				if (response.status === 413) {
					throw new Error(
						"Files too large (max 4.5MB). Switch to Direct Upload method."
					);
				}
				throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
			}

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || "Upload failed");
			}

			return result;
		} catch (error) {
			clearInterval(progressInterval);
			throw error;
		}
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
			console.log(`Using ${state.uploadMethod} upload method`);

			// Use the selected upload method
			if (state.uploadMethod === "direct") {
				await handleDirectUpload();
			} else {
				await handleTraditionalUpload();
			}

			setState((prev) => ({ ...prev, uploadStatus: "success", uploading: false }));

			// Reset form after 3 seconds
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
			console.error("Upload error:", error);
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
					<SongForm form={state.songForm} updateForm={updateSongForm} uploading={state.uploading} />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<FileUpload
							type="audio"
							file={state.songForm.audioFile}
							handleFileSelect={handleFileSelect}
							uploading={state.uploading}
						/>
						<FileUpload
							type="cover"
							file={state.songForm.coverFile}
							handleFileSelect={handleFileSelect}
							uploading={state.uploading}
						/>
					</div>
					{state.uploading && <ProgressBar progress={state.uploadProgress} />}
					<StatusMessage status={state.uploadStatus} errorMessage={state.errorMessage} />

					{/* Upload Method Selection */}
					<div className="border-t border-gray-700/30 pt-6">
						<label className="block text-sm font-medium text-gray-300 mb-3">Upload Method</label>
						<div className="grid grid-cols-2 gap-4">
							<motion.button
								type="button"
								onClick={() => setState((prev) => ({ ...prev, uploadMethod: "direct" }))}
								disabled={state.uploading}
								className={`p-4 rounded-xl border-2 transition-all duration-300 ${
									state.uploadMethod === "direct"
										? "border-reggae-green bg-reggae-green/10 text-white"
										: "border-gray-700/30 bg-stone-900/10 text-gray-400 hover:border-gray-600"
								} ${state.uploading ? "opacity-50 cursor-not-allowed" : ""}`}
								whileHover={{ scale: state.uploading ? 1 : 1.02 }}
								whileTap={{ scale: state.uploading ? 1 : 0.98 }}
							>
								<div className="text-left">
									<div className="font-semibold mb-1">Direct Upload</div>
									<div className="text-xs opacity-70">Unlimited size • Recommended</div>
								</div>
							</motion.button>

							<motion.button
								type="button"
								onClick={() => setState((prev) => ({ ...prev, uploadMethod: "traditional" }))}
								disabled={state.uploading}
								className={`p-4 rounded-xl border-2 transition-all duration-300 ${
									state.uploadMethod === "traditional"
										? "border-reggae-green bg-reggae-green/10 text-white"
										: "border-gray-700/30 bg-stone-900/10 text-gray-400 hover:border-gray-600"
								} ${state.uploading ? "opacity-50 cursor-not-allowed" : ""}`}
								whileHover={{ scale: state.uploading ? 1 : 1.02 }}
								whileTap={{ scale: state.uploading ? 1 : 0.98 }}
							>
								<div className="text-left">
									<div className="font-semibold mb-1">AWS S3 Upload</div>
									<div className="text-xs opacity-70">Max 4.5MB • Small files</div>
								</div>
							</motion.button>
						</div>
					</div>

					<div className="flex justify-end pt-4">
						<motion.button
							onClick={handleSubmit}
							disabled={state.uploading}
							className="flex items-center gap-3 px-8 py-2.5 bg-reggae-green/60 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
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
