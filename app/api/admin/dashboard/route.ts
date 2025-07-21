import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Song, Album, UserProfile } from "@/lib/models";

// GET /api/admin/dashboard - Get admin dashboard data
export async function GET(request: NextRequest) {
	try {
		const { userId } = auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Check if user is admin
		const user = await clerkClient.users.getUser(userId);
		if (user.publicMetadata?.role !== "admin") {
			return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
		}

		// Get current date and calculate date ranges
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		// Fetch basic statistics
		const [
			totalSongs,
			totalAlbums,
			totalUsers,
			songsThisMonth,
			songsLastMonth,
			albumsThisMonth,
			albumsLastMonth,
			recentSongs,
			recentAlbums,
			recentUsers
		] = await Promise.all([
			Song.countDocuments(),
			Album.countDocuments(),
			UserProfile.countDocuments(),
			Song.countDocuments({ createdAt: { $gte: startOfMonth } }),
			Song.countDocuments({ 
				createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
			}),
			Album.countDocuments({ createdAt: { $gte: startOfMonth } }),
			Album.countDocuments({ 
				createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
			}),
			Song.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
			Album.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
			UserProfile.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
		]);

		// Calculate revenue (assuming purchases are tracked in a Purchase model)
		// For now, we'll use mock data or calculate based on song prices
		const songs = await Song.find({}, 'price');
		const albums = await Album.find({}, 'price');
		
		const totalSongValue = songs.reduce((sum, song) => sum + (song.price || 0), 0);
		const totalAlbumValue = albums.reduce((sum, album) => sum + (album.price || 0), 0);
		const totalRevenue = totalSongValue + totalAlbumValue;

		// Calculate growth percentages
		const songGrowth = songsLastMonth > 0 
			? ((songsThisMonth - songsLastMonth) / songsLastMonth) * 100 
			: songsThisMonth > 0 ? 100 : 0;
		
		const albumGrowth = albumsLastMonth > 0 
			? ((albumsThisMonth - albumsLastMonth) / albumsLastMonth) * 100 
			: albumsThisMonth > 0 ? 100 : 0;

		// Mock monthly growth for revenue (you can replace this with actual purchase data)
		const monthlyGrowth = Math.random() * 20 - 5; // Random between -5% and 15%

		// Get recent activity
		const recentActivity = [];

		// Add recent song uploads
		const recentSongUploads = await Song.find({
			createdAt: { $gte: sevenDaysAgo }
		})
		.sort({ createdAt: -1 })
		.limit(5)
		.select('title artist createdAt');

		recentSongUploads.forEach(song => {
			recentActivity.push({
				id: song._id.toString(),
				type: 'upload',
				description: `New song uploaded: "${song.title}" by ${song.artist}`,
				timestamp: formatRelativeTime(song.createdAt),
			});
		});

		// Add recent album uploads
		const recentAlbumUploads = await Album.find({
			createdAt: { $gte: sevenDaysAgo }
		})
		.sort({ createdAt: -1 })
		.limit(3)
		.select('title artist createdAt');

		recentAlbumUploads.forEach(album => {
			recentActivity.push({
				id: album._id.toString(),
				type: 'upload',
				description: `New album uploaded: "${album.title}" by ${album.artist}`,
				timestamp: formatRelativeTime(album.createdAt),
			});
		});

		// Add recent user signups
		const recentUserSignups = await UserProfile.find({
			createdAt: { $gte: sevenDaysAgo }
		})
		.sort({ createdAt: -1 })
		.limit(5)
		.select('firstName lastName createdAt');

		recentUserSignups.forEach(user => {
			recentActivity.push({
				id: user._id.toString(),
				type: 'user_signup',
				description: `New user registered: ${user.firstName} ${user.lastName}`,
				timestamp: formatRelativeTime(user.createdAt),
			});
		});

		// Mock some recent purchases (replace with actual purchase data)
		const mockPurchases = [
			{
				id: 'purchase_1',
				type: 'purchase',
				description: 'Song purchased: "One Love" by Bob Marley',
				timestamp: '2 hours ago',
				amount: 500,
			},
			{
				id: 'purchase_2',
				type: 'purchase',
				description: 'Album purchased: "Legend" by Bob Marley',
				timestamp: '5 hours ago',
				amount: 2500,
			},
		];

		recentActivity.push(...mockPurchases);

		// Sort activity by timestamp (most recent first)
		recentActivity.sort((a, b) => {
			// For mock data, we'll keep the current order
			// In a real implementation, you'd sort by actual timestamp
			return 0;
		});

		// Prepare stats object
		const stats = {
			totalSongs,
			totalAlbums,
			totalUsers,
			totalRevenue,
			recentSales: recentSongs + recentAlbums, // Songs and albums added in last 7 days
			monthlyGrowth,
		};

		return NextResponse.json({
			success: true,
			data: {
				stats,
				recentActivity: recentActivity.slice(0, 10), // Limit to 10 most recent
				additionalMetrics: {
					songsThisMonth,
					songsLastMonth,
					albumsThisMonth,
					albumsLastMonth,
					songGrowth,
					albumGrowth,
					recentSongs,
					recentAlbums,
					recentUsers,
				},
			},
		});

	} catch (error) {
		console.error("Error fetching dashboard data:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch dashboard data" },
			{ status: 500 }
		);
	}
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return `${diffInSeconds} seconds ago`;
	} else if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < 2592000) {
		const days = Math.floor(diffInSeconds / 86400);
		return `${days} day${days > 1 ? 's' : ''} ago`;
	} else {
		const months = Math.floor(diffInSeconds / 2592000);
		return `${months} month${months > 1 ? 's' : ''} ago`;
	}
}

// Optional: Add more specific endpoints for different dashboard sections
export async function POST(request: NextRequest) {
	try {
		const { userId } = auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Check if user is admin
		const user = await clerkClient.users.getUser(userId);
		if (user.publicMetadata?.role !== "admin") {
			return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
		}

		const { action, data } = await request.json();

		switch (action) {
			case 'update_featured':
				// Update featured status for songs/albums
				const { type, itemId, featured } = data;
				
				if (type === 'song') {
					await Song.findByIdAndUpdate(itemId, { featured, updatedAt: new Date() });
				} else if (type === 'album') {
					await Album.findByIdAndUpdate(itemId, { featured, updatedAt: new Date() });
				}
				
				return NextResponse.json({
					success: true,
					message: `${type} featured status updated successfully`,
				});

			case 'delete_content':
				// Delete content (songs/albums)
				const { type: deleteType, itemId: deleteId } = data;
				
				if (deleteType === 'song') {
					await Song.findByIdAndDelete(deleteId);
				} else if (deleteType === 'album') {
					// Also delete associated songs
					const album = await Album.findById(deleteId);
					if (album) {
						await Song.deleteMany({ _id: { $in: album.songIds } });
						await Album.findByIdAndDelete(deleteId);
					}
				}
				
				return NextResponse.json({
					success: true,
					message: `${deleteType} deleted successfully`,
				});

			default:
				return NextResponse.json(
					{ success: false, error: "Invalid action" },
					{ status: 400 }
				);
		}

	} catch (error) {
		console.error("Error in dashboard POST:", error);
		return NextResponse.json(
			{ success: false, error: "Operation failed" },
			{ status: 500 }
		);
	}
}