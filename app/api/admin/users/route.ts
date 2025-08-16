import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { UserProfile, Purchase } from "@/lib/models";

// GET /api/admin/users - Hybrid approach: Fetch from Clerk + enrich with MongoDB
export async function GET(request: NextRequest) {
	try {
		const { userId } = auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Check if user is admin
		const adminUser = await clerkClient.users.getUser(userId);
		if (adminUser.publicMetadata?.role !== "admin") {
			return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "50");
		const roleFilter = searchParams.get("role");
		const searchQuery = searchParams.get("search");

		// Fetch ALL users from Clerk (source of truth)
		const offset = (page - 1) * limit;
		let clerkUsers = [];
		let hasMore = true;
		let currentOffset = 0;

		// Fetch users in batches until we have enough or no more users
		while (clerkUsers.length < limit && hasMore) {
			const response = await clerkClient.users.getUserList({
				limit: 100, // Clerk's max limit per request
				offset: currentOffset,
			});

			if (response.data.length === 0) {
				hasMore = false;
				break;
			}

			clerkUsers.push(...response.data);
			currentOffset += 100;

			// If we've fetched more than we need, break
			if (currentOffset >= offset + limit + 100) {
				hasMore = false;
			}
		}

		// Apply search filter to Clerk users
		if (searchQuery) {
			clerkUsers = clerkUsers.filter((user) => {
				const email = user.emailAddresses[0]?.emailAddress || "";
				const firstName = user.firstName || "";
				const lastName = user.lastName || "";
				const fullName = `${firstName} ${lastName}`.trim();
				const searchLower = searchQuery.toLowerCase();

				return (
					email.toLowerCase().includes(searchLower) ||
					firstName.toLowerCase().includes(searchLower) ||
					lastName.toLowerCase().includes(searchLower) ||
					fullName.toLowerCase().includes(searchLower)
				);
			});
		}

		// Apply role filter
		if (roleFilter && roleFilter !== "all") {
			clerkUsers = clerkUsers.filter((user) => user.publicMetadata?.role === roleFilter);
		}

		// Get total count for pagination
		const totalUsers = clerkUsers.length;

		// Apply pagination to filtered results
		const paginatedUsers = clerkUsers.slice(offset, offset + limit);

		// Get MongoDB data for enrichment
		const clerkIds = paginatedUsers.map((user) => user.id);
		const [userProfiles, userPurchases] = await Promise.all([
			UserProfile.find({ clerkId: { $in: clerkIds } }).lean(),
			Purchase.aggregate([
				{
					$match: {
						userId: { $in: clerkIds },
						status: "completed",
					},
				},
				{
					$group: {
						_id: "$userId",
						totalPurchases: { $sum: 1 },
						totalSpent: { $sum: "$amount" },
						lastPurchase: { $max: "$purchaseDate" },
						purchases: { $push: "$_id" },
					},
				},
			]),
		]);

		// Create lookup maps for efficient merging
		const profileMap = new Map(userProfiles.map((profile) => [profile.clerkId, profile]));
		const purchaseMap = new Map(userPurchases.map((purchase) => [purchase._id, purchase]));

		// Merge Clerk data with MongoDB data
		const enrichedUsers = paginatedUsers.map((clerkUser) => {
			const profile = profileMap.get(clerkUser.id);
			const purchases = purchaseMap.get(clerkUser.id);

			return {
				_id: profile?._id || clerkUser.id, // Use MongoDB _id if exists, fallback to clerkId
				clerkId: clerkUser.id,
				email: clerkUser.emailAddresses[0]?.emailAddress || "",
				firstName: clerkUser.firstName,
				lastName: clerkUser.lastName,
				imageUrl: clerkUser.imageUrl,
				role: (clerkUser.publicMetadata?.role as string) || "user",
				banned: clerkUser.banned || false,
				createdAt: new Date(clerkUser.createdAt),
				lastSignInAt: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt) : null,

				// MongoDB enrichment data
				totalPurchases: purchases?.totalPurchases || 0,
				totalSpent: purchases?.totalSpent || 0,
				lastPurchase: purchases?.lastPurchase,
				purchases: purchases?.purchases || [],

				// Profile data (if user has made purchases)
				lastLogin: profile?.lastLogin,
				hasMongoProfile: !!profile,
			};
		});

		return NextResponse.json({
			success: true,
			data: {
				users: enrichedUsers,
				pagination: {
					page,
					limit,
					totalCount: totalUsers,
					totalPages: Math.ceil(totalUsers / limit),
					hasNext: offset + limit < totalUsers,
					hasPrev: offset > 0,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
	}
}

// PUT /api/admin/users - Update user (role changes, ban/unban)
export async function PUT(request: NextRequest) {
	try {
		const { userId } = auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Check if user is admin
		const adminUser = await clerkClient.users.getUser(userId);
		if (adminUser.publicMetadata?.role !== "admin") {
			return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
		}

		const { id: targetUserId, role, banned } = await request.json();

		if (!targetUserId) {
			return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
		}

		// Get current user data
		const targetUser = await clerkClient.users.getUser(targetUserId);
		if (!targetUser) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}

		// Prevent admin from changing their own role or banning themselves
		if (targetUserId === userId) {
			return NextResponse.json(
				{
					success: false,
					error: "Cannot modify your own account",
				},
				{ status: 400 },
			);
		}

		// Prepare updates for Clerk
		const updates: any = {};

		// Update role in Clerk publicMetadata
		if (role !== undefined) {
			updates.publicMetadata = {
				...targetUser.publicMetadata,
				role: role,
			};
		}

		// Update ban status
		if (banned !== undefined) {
			updates.banned = banned;
		}

		// Apply updates to Clerk
		await clerkClient.users.updateUser(targetUserId, updates);

		// Also update MongoDB profile if it exists
		if (role !== undefined) {
			await UserProfile.findOneAndUpdate(
				{ clerkId: targetUserId },
				{ role: role, updatedAt: new Date() },
				{ upsert: false }, // Don't create if doesn't exist
			);
		}

		return NextResponse.json({
			success: true,
			message: "User updated successfully",
		});
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
	}
}

// DELETE /api/admin/users - Delete user account (permanent)
export async function DELETE(request: NextRequest) {
	try {
		const { userId } = auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Check if user is admin
		const adminUser = await clerkClient.users.getUser(userId);
		if (adminUser.publicMetadata?.role !== "admin") {
			return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const targetUserId = searchParams.get("id");

		if (!targetUserId) {
			return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
		}

		// Prevent admin from deleting their own account
		if (targetUserId === userId) {
			return NextResponse.json(
				{
					success: false,
					error: "Cannot delete your own account",
				},
				{ status: 400 },
			);
		}

		// Delete from Clerk first
		await clerkClient.users.deleteUser(targetUserId);

		// Clean up MongoDB data
		await Promise.all([
			UserProfile.deleteOne({ clerkId: targetUserId }),
			Purchase.deleteMany({ userId: targetUserId }),
		]);

		return NextResponse.json({
			success: true,
			message: "User account deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
	}
}
