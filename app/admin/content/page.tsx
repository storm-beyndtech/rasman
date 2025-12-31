"use client";

import React, { useState, useEffect } from "react";
import { Music, Loader2 } from "lucide-react";
import { IAlbum, ISong } from "@/lib/models";
import Header from "@/components/admin/ContentManagement/Header";
import SearchTabs from "@/components/admin/ContentManagement/SearchTabs";
import ContentList from "@/components/admin/ContentManagement/ContentList";
import AlbumModal from "@/components/admin/ContentManagement/AlbumModal";
import EditModal from "@/components/admin/ContentManagement/EditModal";
import DeleteModal from "@/components/admin/ContentManagement/DeleteModal";
import { useAlbums, useSongs } from "@/app/hooks/admin";
import { Toast } from "@/components/ui/Toast";

interface EditFormData {
	title: string;
	artist: string;
	genre?: string;
	price: number;
	featured: boolean;
	description?: string;
}

interface AlbumFormData {
	title: string;
	artist: string;
	price: number;
	description: string;
	featured: boolean;
	isNewAlbum: boolean;
	existingAlbumId?: string;
	coverArt?: File;
}

interface ToastState {
	message: string;
	type: "success" | "error" | "warning" | "info";
	isVisible: boolean;
}

export interface ContentState {
	songs: ISong[];
	albums: IAlbum[];
	loading: boolean;
	searchQuery: string;
	activeTab: "songs" | "albums";
	editingItem: ISong | IAlbum | null;
	deletingItem: ISong | IAlbum | null;
	showEditModal: boolean;
	showDeleteModal: boolean;
	showAlbumModal: boolean;
	editFormData: EditFormData;
	albumFormData: AlbumFormData;
	selectedSongs: Set<string>;
	saving: boolean;
	actionLoading: boolean;
}

export default function AdminContentManagement() {
	const [state, setState] = useState<ContentState>({
		songs: [],
		albums: [],
		loading: true,
		searchQuery: "",
		activeTab: "songs",
		editingItem: null,
		deletingItem: null,
		showEditModal: false,
		showDeleteModal: false,
		showAlbumModal: false,
		editFormData: {
			title: "",
			artist: "",
			genre: "",
			price: 0,
			featured: false,
			description: "",
		},
		albumFormData: {
			title: "",
			artist: "",
			price: 0,
			description: "",
			featured: false,
			isNewAlbum: true,
			existingAlbumId: "",
			coverArt: undefined,
		},
		selectedSongs: new Set(),
		saving: false,
		actionLoading: false,
	});

	const [toast, setToast] = useState<ToastState>({ message: "", type: "info", isVisible: false });

	const { data: songsData, isLoading: songsLoading, refetch: refetchSongs } = useSongs({ limit: "100" });
	const { data: albumsData, isLoading: albumsLoading, refetch: refetchAlbums } = useAlbums({ limit: "100" });

	// Update state with fetched data
	useEffect(() => {
		setState((prev) => ({
			...prev,
			songs: songsData?.data?.songs || [],
			albums: albumsData?.data?.albums || [],
			loading: songsLoading || albumsLoading,
			selectedSongs: prev.activeTab === "songs" ? new Set() : prev.selectedSongs,
		}));
	}, [songsData, albumsData, songsLoading, albumsLoading, state.activeTab]);

	// Auto-dismiss toast after 3 seconds
	useEffect(() => {
		if (toast.isVisible) {
			const timer = setTimeout(() => {
				setToast((prev) => ({ ...prev, isVisible: false }));
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [toast.isVisible]);

	const showToast = (message: string, type: ToastState["type"]) => {
		setToast({ message, type, isVisible: true });
	};

	const toggleSongSelection = (songId: string) => {
		setState((prev) => {
			const newSelected = new Set(prev.selectedSongs);
			if (newSelected.has(songId)) {
				newSelected.delete(songId);
			} else {
				newSelected.add(songId);
			}
			return { ...prev, selectedSongs: newSelected };
		});
	};

	const openAlbumModal = () => {
		if (state.selectedSongs.size === 0) {
			showToast("Please select at least one song", "warning");
			return;
		}
		const selectedSong = state.songs.find((song) => state.selectedSongs.has(song._id));
		setState((prev) => ({
			...prev,
			showAlbumModal: true,
			albumFormData: {
				title: "",
				artist: selectedSong?.artist || "",
				price: 0,
				description: "",
				featured: false,
				isNewAlbum: true,
				existingAlbumId: "",
				coverArt: undefined,
			},
		}));
	};

	const handleCreateAlbum = async () => {
		if (!state.albumFormData.title) {
			showToast("Album title is required", "error");
			return;
		}
		if (state.selectedSongs.size === 0) {
			showToast("Please select at least one song", "error");
			return;
		}

		setState((prev) => ({ ...prev, saving: true }));

		try {
			if (state.albumFormData.isNewAlbum) {
				const formData = new FormData();
				formData.append("title", state.albumFormData.title);
				formData.append("artist", state.albumFormData.artist);
				formData.append("price", state.albumFormData.price.toString());
				formData.append("description", state.albumFormData.description);
				formData.append("featured", state.albumFormData.featured.toString());
				formData.append("songIds", JSON.stringify(Array.from(state.selectedSongs)));
				if (state.albumFormData.coverArt) {
					formData.append("coverArt", state.albumFormData.coverArt);
				}

				const response = await fetch("/api/albums", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					throw new Error("Failed to create album");
				}
				showToast("Album created successfully", "success");
			} else {
				const albumResponse = await fetch(`/api/albums?id=${state.albumFormData.existingAlbumId}`);
				const albumData = await albumResponse.json();

				if (!albumResponse.ok) {
					throw new Error("Failed to fetch album");
				}

				const existingAlbum = albumData.data;
				const updatedSongIds = [...existingAlbum.songIds, ...Array.from(state.selectedSongs)];

				const updateResponse = await fetch("/api/albums", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						id: state.albumFormData.existingAlbumId,
						songIds: updatedSongIds,
					}),
				});

				if (!updateResponse.ok) {
					throw new Error("Failed to update album");
				}
				showToast("Songs added to album successfully", "success");
			}

			setState((prev) => ({
				...prev,
				showAlbumModal: false,
				saving: false,
				selectedSongs: new Set(),
			}));

			await Promise.all([refetchSongs(), refetchAlbums()]);
		} catch (error) {
			console.error("Failed to create/update album:", error);
			showToast("Failed to create/update album", "error");
			setState((prev) => ({ ...prev, saving: false }));
		}
	};

	const openEditModal = (item: ISong | IAlbum) => {
		const isSong = "genre" in item;
		setState((prev) => ({
			...prev,
			editingItem: item,
			showEditModal: true,
			editFormData: {
				title: item.title,
				artist: item.artist,
				genre: isSong ? (item as ISong).genre : "",
				price: item.price,
				featured: item.featured,
				description: isSong ? "" : (item as IAlbum).description || "",
			},
		}));
	};

	const handleSaveEdit = async () => {
		if (!state.editingItem) return;

		setState((prev) => ({ ...prev, saving: true }));

		try {
			const isSong = "genre" in state.editingItem;
			const endpoint = isSong ? "/api/songs" : "/api/albums";

			const updateData = {
				id: state.editingItem._id,
				title: state.editFormData.title,
				artist: state.editFormData.artist,
				price: state.editFormData.price,
				featured: state.editFormData.featured,
				...(isSong ? { genre: state.editFormData.genre } : { description: state.editFormData.description }),
			};

			const response = await fetch(endpoint, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updateData),
			});

			if (response.ok) {
				setState((prev) => ({
					...prev,
					showEditModal: false,
					editingItem: null,
					saving: false,
				}));
				showToast(`${isSong ? "Song" : "Album"} updated successfully`, "success");
				await Promise.all([refetchSongs(), refetchAlbums()]);
			} else {
				throw new Error("Failed to update item");
			}
		} catch (error) {
			console.error("Failed to update item:", error);
			showToast(`Failed to update ${"genre" in state.editingItem ? "song" : "album"}`, "error");
			setState((prev) => ({ ...prev, saving: false }));
		}
	};

	const handleCoverArtUpload = async (id: string, file: File | undefined, type: "song" | "album") => {
		if (!file) {
			showToast("Please select an image file", "error");
			return;
		}

		setState((prev) => ({ ...prev, actionLoading: true }));

		try {
			const formData = new FormData();
			formData.append("id", id);
			formData.append("type", "update-cover");
			formData.append("itemType", type);
			formData.append("coverArt", file);

			const response = await fetch("/api/admin/upload", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				showToast(
					`${type.charAt(0).toUpperCase() + type.slice(1)} cover art updated successfully`,
					"success",
				);
				await Promise.all([refetchSongs(), refetchAlbums()]);
			} else {
				throw new Error("Failed to update cover art");
			}
		} catch (error) {
			console.error("Failed to update cover art:", error);
			showToast("Failed to update cover art", "error");
		} finally {
			setState((prev) => ({ ...prev, actionLoading: false }));
		}
	};

	const toggleFeatured = async (item: ISong | IAlbum) => {
		setState((prev) => ({ ...prev, actionLoading: true }));

		try {
			const endpoint = "genre" in item ? "/api/songs" : "/api/albums";
			const response = await fetch(endpoint, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: item._id,
					featured: !item.featured,
				}),
			});

			if (response.ok) {
				showToast(`Featured status ${item.featured ? "removed" : "added"} successfully`, "success");
				await Promise.all([refetchSongs(), refetchAlbums()]);
			} else {
				throw new Error("Failed to update featured status");
			}
		} catch (error) {
			console.error("Failed to update featured status:", error);
			showToast("Failed to update featured status", "error");
		} finally {
			setState((prev) => ({ ...prev, actionLoading: false }));
		}
	};

	const handleDelete = async () => {
		if (!state.deletingItem) return;

		setState((prev) => ({ ...prev, saving: true }));

		try {
			const isSong = "genre" in state.deletingItem;
			const endpoint = isSong ? "/api/songs" : "/api/albums";

			const response = await fetch(`${endpoint}?id=${state.deletingItem._id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setState((prev) => ({
					...prev,
					showDeleteModal: false,
					deletingItem: null,
					saving: false,
				}));
				showToast(`${isSong ? "Song" : "Album"} deleted successfully`, "success");
				await Promise.all([refetchSongs(), refetchAlbums()]);
			} else {
				throw new Error("Failed to delete item");
			}
		} catch (error) {
			console.error("Failed to delete item:", error);
			showToast(`Failed to delete ${"genre" in state.deletingItem ? "song" : "album"}`, "error");
			setState((prev) => ({ ...prev, saving: false }));
		}
	};

	const filteredItems = () => {
		const items = state.activeTab === "songs" ? state.songs : state.albums;
		if (!state.searchQuery) return items;

		return items.filter(
			(item) =>
				item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
				item.artist.toLowerCase().includes(state.searchQuery.toLowerCase()),
		);
	};

	const formatPrice = (price: number) => `₦${price.toLocaleString()}`;
	const formatDate = (date: Date) => new Date(date).toLocaleDateString();
	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div className="space-y-8">
			<Header
				activeTab={state.activeTab}
				songs={state.songs}
				albums={state.albums}
				selectedSongs={state.selectedSongs}
				openAlbumModal={openAlbumModal}
			/>
			<SearchTabs
				activeTab={state.activeTab}
				songs={state.songs}
				albums={state.albums}
				searchQuery={state.searchQuery}
				setState={setState}
			/>
			{state.loading ? (
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<Loader2 className="w-12 h-12 text-reggae-green animate-spin mx-auto mb-4" />
						<p className="text-gray-400">Loading content...</p>
					</div>
				</div>
			) : filteredItems().length === 0 ? (
				<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-12 text-center">
					<Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
					<h3 className="text-xl font-bold text-white mb-2">No {state.activeTab} Found</h3>
					<p className="text-gray-400">
						{state.searchQuery
							? `No ${state.activeTab} match your search "${state.searchQuery}"`
							: `No ${state.activeTab} have been uploaded yet.`}
					</p>
				</div>
			) : (
				<ContentList
					state={state}
					filteredItems={filteredItems}
					toggleSongSelection={toggleSongSelection}
					toggleFeatured={toggleFeatured}
					openEditModal={openEditModal}
					setState={setState}
					formatPrice={formatPrice}
					formatDate={formatDate}
					formatDuration={formatDuration}
					handleCoverArtUpload={handleCoverArtUpload}
				/>
			)}
			<AlbumModal state={state} setState={setState} handleCreateAlbum={handleCreateAlbum} />
			<EditModal state={state} setState={setState} handleSaveEdit={handleSaveEdit} />
			<DeleteModal state={state} setState={setState} handleDelete={handleDelete} />
			<Toast
				message={toast.message}
				type={toast.type}
				isVisible={toast.isVisible}
				onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
			/>
		</div>
	);
}
