"use client";

import type { IAlbum, IPurchase, ISong } from "@/lib/models";
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useUserPurchases } from "@/app/hooks/music";

interface AudioState {
	currentSong: ISong | null;
	isPlaying: boolean;
	isLoading: boolean;
	currentTime: number;
	duration: number;
	volume: number;
}

interface AudioContextType {
	// State
	audioState: AudioState;
	purchases: IPurchase[];

	// Actions
	playSong: (song: ISong) => Promise<void>;
	pauseSong: () => void;
	resumeSong: () => void;
	seekTo: (time: number) => void;
	setVolume: (volume: number) => void;
	downloadSong: (song: ISong, purchaseId: string) => Promise<void>;
	downloadAlbum: (album: IAlbum, purchaseId: string) => Promise<void>;
	purchaseSong: (song: ISong) => Promise<void>;
	purchaseAlbum: (album: IAlbum) => Promise<void>;

	// Utilities
	hasPurchased: (itemId: string, type: "song" | "album") => boolean;
	formatTime: (seconds: number) => string;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
	const context = useContext(AudioContext);
	if (!context) {
		throw new Error("useAudio must be used within AudioProvider");
	}
	return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { isSignedIn, user } = useUser();
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [audioState, setAudioState] = useState<AudioState>({
		currentSong: null,
		isPlaying: false,
		isLoading: false,
		currentTime: 0,
		duration: 0,
		volume: 1,
	});
	const { data: purchaseData } = useUserPurchases({ status: "completed", limit: 200 });
	const purchases: IPurchase[] = purchaseData?.purchases || [];

	// Initialize audio element
	useEffect(() => {
		audioRef.current = new Audio();
		audioRef.current.preload = "none";

		const audio = audioRef.current;

		// Audio event listeners
		const handleLoadStart = () => setAudioState((prev) => ({ ...prev, isLoading: true }));
		const handleCanPlay = () => setAudioState((prev) => ({ ...prev, isLoading: false }));
		const handleLoadedMetadata = () => {
			setAudioState((prev) => ({ ...prev, duration: audio.duration }));
		};
		const handleTimeUpdate = () => {
			setAudioState((prev) => ({ ...prev, currentTime: audio.currentTime }));
		};
		const handleEnded = () => {
			setAudioState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
		};
		const handleError = () => {
			setAudioState((prev) => ({ ...prev, isLoading: false, isPlaying: false }));
			console.error("Audio playback error");
		};

		audio.addEventListener("loadstart", handleLoadStart);
		audio.addEventListener("canplay", handleCanPlay);
		audio.addEventListener("loadedmetadata", handleLoadedMetadata);
		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("error", handleError);

		return () => {
			audio.removeEventListener("loadstart", handleLoadStart);
			audio.removeEventListener("canplay", handleCanPlay);
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("error", handleError);
			audio.pause();
		};
	}, []);

	const hasPurchased = useCallback(
		(itemId: string, type: "song" | "album") => {
			if (!isSignedIn) return false;
			return purchases.some((p) => p.itemId === itemId && p.itemType === type && p.status === "completed");
		},
		[purchases, isSignedIn],
	);

	const getStreamUrl = async (song: ISong): Promise<string> => {
		try {
			const response = await fetch(`/api/stream/${song._id}`, { method: "POST" });
			if (!response.ok) {
				throw new Error("Failed to get stream URL");
			}
			const data = await response.json();
			return data.data.streamUrl;
		} catch (error) {
			console.error("Error getting stream URL:", error);
			throw error;
		}
	};

	const playSong = useCallback(
		async (song: ISong) => {
			console.log(song);
			if (!isSignedIn || !hasPurchased(song._id, "song")) {
				console.error("Song not purchased or user not signed in");
				return;
			}

			try {
				setAudioState((prev) => ({ ...prev, isLoading: true }));

				// Get stream URL
				const streamUrl = await getStreamUrl(song);

				// Stop current audio
				if (audioRef.current) {
					audioRef.current.pause();
					audioRef.current.currentTime = 0;
				}

				// Set new song
				setAudioState((prev) => ({
					...prev,
					currentSong: song,
					currentTime: 0,
					duration: song.duration,
				}));

				// Load and play new audio
				if (audioRef.current) {
					audioRef.current.src = streamUrl;
					audioRef.current.volume = audioState.volume;
					await audioRef.current.play();
					setAudioState((prev) => ({ ...prev, isPlaying: true, isLoading: false }));
				}
			} catch (error) {
				console.error("Error playing song:", error);
				setAudioState((prev) => ({ ...prev, isLoading: false, isPlaying: false }));
			}
		},
		[isSignedIn, hasPurchased, audioState.volume],
	);

	const pauseSong = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			setAudioState((prev) => ({ ...prev, isPlaying: false }));
		}
	}, []);

	const resumeSong = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.play();
			setAudioState((prev) => ({ ...prev, isPlaying: true }));
		}
	}, []);

	const seekTo = useCallback((time: number) => {
		if (audioRef.current) {
			audioRef.current.currentTime = time;
			setAudioState((prev) => ({ ...prev, currentTime: time }));
		}
	}, []);

	const setVolume = useCallback((volume: number) => {
		if (audioRef.current) {
			audioRef.current.volume = volume;
			setAudioState((prev) => ({ ...prev, volume }));
		}
	}, []);

	const downloadSong = useCallback(async (song: ISong, purchaseId: string) => {
		try {
			const response = await fetch(`/api/download/${song._id}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					itemType: "song",
					purchaseId,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get download link");
			}

			const data = await response.json();
			const downloadLink = data.data.downloadLinks[0];

			// Create download link
			const link = document.createElement("a");
			link.href = downloadLink.downloadUrl;
			link.download = `${song.artist} - ${song.title}.mp3`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error("Error downloading song:", error);
		}
	}, []);

	const downloadAlbum = useCallback(async (album: IAlbum, purchaseId: string) => {
		try {
			const response = await fetch(`/api/download/${album._id}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					itemType: "album",
					purchaseId,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get download links");
			}

			const data = await response.json();
			const downloadLinks = data.data.downloadLinks;

			// Download all songs in the album
			downloadLinks.forEach((song: any, index: number) => {
				setTimeout(() => {
					const link = document.createElement("a");
					link.href = song.downloadUrl;
					link.download = `${song.artist} - ${song.title}.mp3`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}, index * 1000); // Delay each download by 1 second
			});
		} catch (error) {
			console.error("Error downloading album:", error);
		}
	}, []);

	const purchaseSong = useCallback(
		async (song: ISong) => {
			if (!isSignedIn || !user) return;

			try {
				const response = await fetch("/api/purchase", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						itemId: song._id,
						itemType: "song",
						amount: song.price,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to initialize purchase");
				}

				const data = await response.json();
				// Redirect to Paystack payment page
				window.location.href = data.data.authorization_url;
			} catch (error) {
				console.error("Error purchasing song:", error);
			}
		},
		[isSignedIn, user],
	);

	const purchaseAlbum = useCallback(
		async (album: IAlbum) => {
			if (!isSignedIn || !user) return;

			try {
				const response = await fetch("/api/purchase", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						itemId: album._id,
						itemType: "album",
						amount: album.price,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to initialize purchase");
				}

				const data = await response.json();
				// Redirect to Paystack payment page
				window.location.href = data.data.authorization_url;
			} catch (error) {
				console.error("Error purchasing album:", error);
			}
		},
		[isSignedIn, user],
	);

	const formatTime = useCallback((seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}, []);

	const contextValue: AudioContextType = {
		audioState,
		purchases,
		playSong,
		pauseSong,
		resumeSong,
		seekTo,
		setVolume,
		downloadSong,
		downloadAlbum,
		purchaseSong,
		purchaseAlbum,
		hasPurchased,
		formatTime,
	};

	return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
};
