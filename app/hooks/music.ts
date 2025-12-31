// hooks/music.ts
import type { IAlbum, IPurchase, ISong } from "@/lib/models";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";

export interface AlbumsFilters {
	search?: string;
	featured?: boolean | null;
	minPrice?: number | null;
	maxPrice?: number | null;
	sortBy?: string;
	sortOrder?: string;
	page?: number;
	limit?: number;
}

export interface AlbumsResponse {
	albums: IAlbum[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export interface PurchasesFilters {
	status?: string;
	itemType?: "song" | "album";
	page?: number;
	limit?: number;
}

export interface PurchasesResponse {
	purchases: IPurchase[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

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

const fetchAlbums = async (filters: AlbumsFilters = {}): Promise<AlbumsResponse> => {
	const params = new URLSearchParams();

	Object.entries(filters).forEach(([key, value]) => {
		if (value !== null && value !== undefined && value !== "") {
			params.append(key, value.toString());
		}
	});

	const response = await fetch(`/api/albums?${params}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch albums: ${response.status}`);
	}

	const result = await response.json();
	if (!result.success) {
		throw new Error(result.error || "Failed to fetch albums");
	}

	return result.data;
};

const fetchUserPurchases = async (filters: PurchasesFilters = {}): Promise<PurchasesResponse> => {
	const params = new URLSearchParams();

	const normalizedFilters = {
		status: "completed",
		limit: 50,
		...filters,
	};

	Object.entries(normalizedFilters).forEach(([key, value]) => {
		if (value !== null && value !== undefined && value !== "") {
			params.append(key, value.toString());
		}
	});

	const response = await fetch(`/api/purchase?${params.toString()}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch purchases: ${response.status}`);
	}

	const result = await response.json();
	return result.data;
};

// Individual hooks
export function useFeaturedSongs(limit: number = 12) {
	return useQuery({
		queryKey: ["featured", "songs", limit],
		queryFn: () => fetchFeaturedSongs(limit),
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});
}

export function useFeaturedAlbums(limit: number = 12) {
	return useQuery({
		queryKey: ["featured", "albums", limit],
		queryFn: () => fetchFeaturedAlbums(limit),
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});
}

export function useAlbums(filters: AlbumsFilters = {}) {
	return useQuery({
		queryKey: ["albums", filters],
		queryFn: () => fetchAlbums(filters),
		staleTime: 3 * 60 * 1000,
		refetchOnWindowFocus: false,
		placeholderData: (previousData) => previousData,
	});
}

export function useUserPurchases(filters: PurchasesFilters = {}) {
	const { isSignedIn } = useUser();
	const normalizedFilters = { status: "completed", ...filters };

	return useQuery({
		queryKey: ["user", "purchases", normalizedFilters],
		queryFn: () => fetchUserPurchases(normalizedFilters),
		enabled: isSignedIn,
		staleTime: 2 * 60 * 1000, // 2 minutes
		refetchOnWindowFocus: false,
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
	const { data } = useUserPurchases();
	const purchases = data?.purchases || [];

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
		refetchOnWindowFocus: false,
	});
}
