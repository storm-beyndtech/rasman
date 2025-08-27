// hooks/music.ts
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { IAlbum, IPurchase, ISong } from "@/lib/models";

// Fetch functions
const fetchFeaturedSongs = async (limit: number = 12): Promise<ISong[]> => {
	const response = await fetch(`/api/songs?featured=true&limit=${limit}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch featured songs: ${response.status}`);
	}

	const result = await response.json();
	return result.data?.songs || [];
};

const fetchFeaturedAlbums = async (limit: number = 12): Promise<IAlbum[]> => {
	const response = await fetch(`/api/albums?featured=true&limit=${limit}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch featured albums: ${response.status}`);
	}

	const result = await response.json();
	return result.data?.albums || [];
};

const fetchUserPurchases = async (): Promise<IPurchase[]> => {
	const response = await fetch("/api/purchase");
	if (!response.ok) {
		throw new Error(`Failed to fetch purchases: ${response.status}`);
	}

	const result = await response.json();
	return result.data?.purchases || [];
};

// Individual hooks
export function useFeaturedSongs(limit: number = 12) {
	return useQuery({
		queryKey: ["featured", "songs", limit],
		queryFn: () => fetchFeaturedSongs(limit),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useFeaturedAlbums(limit: number = 12) {
	return useQuery({
		queryKey: ["featured", "albums", limit],
		queryFn: () => fetchFeaturedAlbums(limit),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useUserPurchases() {
	const { isSignedIn } = useUser();

	return useQuery({
		queryKey: ["user", "purchases"],
		queryFn: fetchUserPurchases,
		enabled: isSignedIn, // Only run if user is signed in
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

// Combined hook for all featured content
export function useFeaturedContent(limit: number = 12) {
	const songsQuery = useFeaturedSongs(limit);
	const albumsQuery = useFeaturedAlbums(limit);

	return {
		songs: songsQuery.data || [],
		albums: albumsQuery.data || [],
		isLoading: songsQuery.isLoading || albumsQuery.isLoading,
		isError: songsQuery.isError || albumsQuery.isError,
		error: songsQuery.error || albumsQuery.error,
		refetch: () => {
			songsQuery.refetch();
			albumsQuery.refetch();
		},
	};
}

// Helper hook to check if user purchased an item
export function useUserPurchase(itemId: string) {
	const { data: purchases = [] } = useUserPurchases();

	return {
		isPurchased: purchases.some((purchase) => purchase.itemId === itemId),
		purchase: purchases.find((purchase) => purchase.itemId === itemId),
		purchaseId: purchases.find((purchase) => purchase.itemId === itemId)?._id,
	};
}

// Enhanced hook with filters and search
export function useSongs(filters = {}) {
	return useQuery({
		queryKey: ["songs", filters],
		queryFn: async () => {
			const params = new URLSearchParams(filters).toString();
			const response = await fetch(`/api/songs?${params}`);
			if (!response.ok) throw new Error("Failed to fetch songs");
			const result = await response.json();
			return result.data?.songs || [];
		},
		staleTime: 3 * 60 * 1000, // 3 minutes
	});
}

export function useAlbums(filters = {}) {
	return useQuery({
		queryKey: ["albums", filters],
		queryFn: async () => {
			const params = new URLSearchParams(filters).toString();
			const response = await fetch(`/api/albums?${params}`);
			if (!response.ok) throw new Error("Failed to fetch albums");
			const result = await response.json();
			return result.data?.albums || [];
		},
		staleTime: 3 * 60 * 1000, // 3 minutes
	});
}
