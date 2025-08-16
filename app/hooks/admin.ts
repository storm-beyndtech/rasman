// hooks/admin.js
import { useQuery } from "@tanstack/react-query";

interface AdminStats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalRevenue: number;
	recentSales: number;
	monthlyGrowth: number;
	activeSessions: number;
}

interface RecentActivity {
	id: string;
	type: "purchase" | "upload" | "user_signup";
	description: string;
	timestamp: string;
	amount?: number;
	status?: string;
}

// Base fetch functions
const fetchDashboardStats = async (): Promise<{
	stats: AdminStats;
	recentActivity: RecentActivity[];
}> => {
	const response = await fetch("/api/admin/dashboard");
	if (!response.ok) {
		throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
	}

	const resData: any = await response.json();
	return resData.data;
};

const fetchSongs = async (filters = {}) => {
	const params = Object.keys(filters).length > 0 ? `?${new URLSearchParams(filters).toString()}` : "";

	const response = await fetch(`/api/songs${params}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch songs: ${response.status}`);
	}
	return response.json();
};

const fetchAlbums = async (filters = {}) => {
	const params = Object.keys(filters).length > 0 ? `?${new URLSearchParams(filters).toString()}` : "";

	const response = await fetch(`/api/albums${params}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch albums: ${response.status}`);
	}
	return response.json();
};

const fetchUsers = async (filters = {}) => {
	const params = Object.keys(filters).length > 0 ? `?${new URLSearchParams(filters).toString()}` : "";

	const response = await fetch(`/api/admin/users${params}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch users: ${response.status}`);
	}
	return response.json();
};

// Hook exports
export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboardStats,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSongs(filters = {}) {
	return useQuery({
		queryKey: ["songs", filters],
		queryFn: () => fetchSongs(filters),
	});
}

export function useAlbums(filters = {}) {
	return useQuery({
		queryKey: ["albums", filters],
		queryFn: () => fetchAlbums(filters),
	});
}

export function useUsers(filters = {}) {
	return useQuery({
		queryKey: ["admin", "users", filters],
		queryFn: () => fetchUsers(filters),
	});
}

// Usage examples for each hook:

/* 
1. DASHBOARD STATS (no filters)
const { data: stats, isLoading } = useDashboardStats();

2. SONGS with filters
const { data: songs } = useSongs(); // All songs
const { data: songs } = useSongs({ status: 'featured' }); // Featured songs
const { data: songs } = useSongs({ genre: 'reggae', page: 1 }); // Reggae songs, page 1
const { data: songs } = useSongs({ search: 'bob marley' }); // Search songs

3. ALBUMS with filters  
const { data: albums } = useAlbums(); // All albums
const { data: albums } = useAlbums({ status: 'recent' }); // Recent albums
const { data: albums } = useAlbums({ artist: 'Bob Marley' }); // Albums by artist

4. USERS with filters
const { data: users } = useUsers(); // All users
const { data: users } = useUsers({ role: 'admin' }); // Admin users only
const { data: users } = useUsers({ active: 'true', page: 2 }); // Active users, page 2
*/
