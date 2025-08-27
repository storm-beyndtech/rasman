import { ISong } from "@/lib/models";
import { useQuery } from "@tanstack/react-query";

export interface SongsFilters {
	search?: string;
	genre?: string;
	featured?: boolean | null;
	minPrice?: number | null;
	maxPrice?: number | null;
	sortBy?: string;
	sortOrder?: string;
	page?: number;
	limit?: number;
}

export interface SongsResponse {
	songs: ISong[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

const fetchSongs = async (filters: SongsFilters = {}): Promise<SongsResponse> => {
	const params = new URLSearchParams();

	// Add filter parameters
	Object.entries(filters).forEach(([key, value]) => {
		if (value !== null && value !== undefined && value !== "") {
			params.append(key, value.toString());
		}
	});

	const response = await fetch(`/api/songs?${params}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch songs: ${response.status}`);
	}

	const result = await response.json();
	if (!result.success) {
		throw new Error(result.error || "Failed to fetch songs");
	}

	return result.data;
};

export function useSongs(filters: SongsFilters = {}) {
	return useQuery({
		queryKey: ["songs", filters],
		queryFn: () => fetchSongs(filters),
		staleTime: 2 * 60 * 1000, // 2 minutes
		placeholderData: (previousData) => previousData, // Keep previous data while loading
	});
}
