import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Purchase, Song, Album } from "@/lib/models";
import { S3Service } from "@/lib/s3";

interface DownloadRouteParams {
	params: Promise<{ itemId: string }>;
}

// POST /api/download/[itemId] - Generate secure download links
export async function POST(request: NextRequest, { params }: DownloadRouteParams) {
	try {
		const { userId } = await auth();
		const { itemId } = await params;

		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		if (!itemId) {
			return NextResponse.json({ success: false, error: "Item ID is required" }, { status: 400 });
		}

		const body = await request.json();
		const { itemType, purchaseId } = body;

		if (!itemType || !["song", "album"].includes(itemType)) {
			return NextResponse.json(
				{ success: false, error: "Valid item type is required (song or album)" },
				{ status: 400 },
			);
		}

		await connectDB();

		// Verify purchase exists and belongs to user
		const purchase = await Purchase.findOne({
			_id: purchaseId,
			userId,
			itemId,
			itemType,
			status: "completed",
		});

		if (!purchase) {
			return NextResponse.json({ success: false, error: "Valid purchase not found" }, { status: 403 });
		}

		let downloadLinks = [];

		if (itemType === "song") {
			// Handle single song download
			const song = await Song.findById(itemId);
			if (!song) {
				return NextResponse.json({ success: false, error: "Song not found" }, { status: 404 });
			}

			// Generate download URL (24 hour expiry)
			const downloadUrl = await S3Service.getSignedDownloadUrl(song.fileKey, 86400);

			downloadLinks.push({
				title: song.title,
				artist: song.artist,
				downloadUrl,
				fileKey: song.fileKey,
				duration: song.duration,
			});
		} else {
			// Handle album download
			const album = await Album.findById(itemId).populate("songIds");
			if (!album) {
				return NextResponse.json({ success: false, error: "Album not found" }, { status: 404 });
			}

			// Generate download URLs for all songs in the album
			for (const song of album.songIds) {
				const downloadUrl = await S3Service.getSignedDownloadUrl(song.fileKey, 86400);

				downloadLinks.push({
					title: song.title,
					artist: song.artist,
					downloadUrl,
					fileKey: song.fileKey,
					duration: song.duration,
				});
			}
		}

		// Log download activity (optional)
		console.log(`Download requested by user ${userId} for ${itemType} ${itemId}`);

		return NextResponse.json({
			success: true,
			data: {
				downloadLinks,
				purchaseId: purchase._id,
				itemType,
				expiresIn: 86400, // 24 hours
				downloadedAt: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error("Error generating download links:", error);
		return NextResponse.json({ success: false, error: "Failed to generate download links" }, { status: 500 });
	}
}

// GET /api/download/[itemId] - Get download history for an item
export async function GET(request: NextRequest, { params }: DownloadRouteParams) {
	try {
		const { userId } = await auth();
		const { itemId } = await params;

		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		await connectDB();

		// Find user's purchases for this item
		const purchases = await Purchase.find({
			userId,
			itemId,
			status: "completed",
		}).sort({ purchaseDate: -1 });

		if (purchases.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No valid purchases found for this item" },
				{ status: 403 },
			);
		}

		// Get item details
		let item = null;
		const latestPurchase = purchases[0];

		if (latestPurchase.itemType === "song") {
			item = await Song.findById(itemId).select("title artist duration genre");
		} else {
			item = await Album.findById(itemId)
				.select("title artist description songIds")
				.populate("songIds", "title duration");
		}

		if (!item) {
			return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			data: {
				item,
				itemType: latestPurchase.itemType,
				purchases: purchases.map((p) => ({
					id: p._id,
					purchaseDate: p.purchaseDate,
					amount: p.amount,
					currency: p.currency,
				})),
				canDownload: true,
			},
		});
	} catch (error) {
		console.error("Error fetching download info:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch download information" },
			{ status: 500 },
		);
	}
}

// DELETE /api/download/[itemId] - Revoke download access (Admin only)
export async function DELETE(request: NextRequest, { params }: DownloadRouteParams) {
	try {
		const { userId } = await auth();
		const { itemId } = await params;

		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		await connectDB();

		// Check if user is admin (you might want to add this check)
		// const userProfile = await UserProfile.findOne({ clerkId: userId });
		// if (!userProfile || userProfile.role !== 'admin') {
		//   return NextResponse.json(
		//     { success: false, error: 'Admin access required' },
		//     { status: 403 }
		//   );
		// }

		const body = await request.json();
		const { targetUserId, reason } = body;

		if (!targetUserId) {
			return NextResponse.json({ success: false, error: "Target user ID is required" }, { status: 400 });
		}

		// Mark purchases as failed/revoked
		const result = await Purchase.updateMany(
			{
				userId: targetUserId,
				itemId,
				status: "completed",
			},
			{
				status: "failed",
				$set: {
					revokedAt: new Date(),
					revokedBy: userId,
					revocationReason: reason || "Access revoked by admin",
				},
			},
		);

		return NextResponse.json({
			success: true,
			message: `Download access revoked for ${result.modifiedCount} purchases`,
			data: {
				modifiedCount: result.modifiedCount,
				revokedAt: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error("Error revoking download access:", error);
		return NextResponse.json({ success: false, error: "Failed to revoke download access" }, { status: 500 });
	}
}
