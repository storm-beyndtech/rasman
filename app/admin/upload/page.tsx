"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Music, ImageIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

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
							{type === "audio" ? "MP3, WAV, FLAC (any size)" : "JPG, PNG (any size)"}
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

	// Upload files to S3 with progress tracking
	const uploadFileToS3 = async (uploadUrl: string, file: File, contentType: string) => {
		return fetch(uploadUrl, {
			method: "PUT",
			body: file,
			headers: {
				"Content-Type": contentType,
			},
		});
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
			const audioFile = state.songForm.audioFile;
			const coverFile = state.songForm.coverFile;

			// Step 1: Get presigned URLs (10% progress)
			setState((prev) => ({ ...prev, uploadProgress: 10 }));

			const [audioUrlResponse, coverUrlResponse] = await Promise.all([
				fetch(`/api/admin/upload?fileType=audio&fileName=${encodeURIComponent(audioFile.name)}`),
				fetch(`/api/admin/upload?fileType=image&fileName=${encodeURIComponent(coverFile.name)}`),
			]);

			if (!audioUrlResponse.ok || !coverUrlResponse.ok) {
				throw new Error("Failed to get upload URLs from server");
			}

			const [audioUrlData, coverUrlData] = await Promise.all([
				audioUrlResponse.json(),
				coverUrlResponse.json(),
			]);

			// Step 2: Upload files directly to S3 (30-80% progress)
			setState((prev) => ({ ...prev, uploadProgress: 30 }));

			const audioUploadResponse = await uploadFileToS3(
				audioUrlData.data.uploadUrl,
				audioFile,
				audioFile.type || "audio/mpeg"
			);

			if (!audioUploadResponse.ok) {
				throw new Error("Failed to upload audio file to S3");
			}

			setState((prev) => ({ ...prev, uploadProgress: 60 }));

			const coverUploadResponse = await uploadFileToS3(
				coverUrlData.data.uploadUrl,
				coverFile,
				coverFile.type || "image/jpeg"
			);

			if (!coverUploadResponse.ok) {
				throw new Error("Failed to upload cover image to S3");
			}

			// Step 3: Save metadata to database (80-100% progress)
			setState((prev) => ({ ...prev, uploadProgress: 80 }));

			const formData = new FormData();
			formData.append("type", "song-direct");
			formData.append("title", state.songForm.title);
			formData.append("artist", state.songForm.artist);
			formData.append("genre", state.songForm.genre);
			formData.append("duration", state.songForm.duration.toString());
			formData.append("price", state.songForm.price.toString());
			formData.append("featured", state.songForm.featured.toString());
			formData.append("audioFileKey", audioUrlData.data.fileKey);
			formData.append("coverFileKey", coverUrlData.data.fileKey);

			const metadataResponse = await fetch("/api/admin/upload", {
				method: "POST",
				body: formData,
			});

			if (!metadataResponse.ok) {
				throw new Error("Failed to save song metadata");
			}

			const result = await metadataResponse.json();

			if (!result.success) {
				throw new Error(result.error || "Failed to save song");
			}

			setState((prev) => ({ ...prev, uploadProgress: 100, uploadStatus: "success", uploading: false }));

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
