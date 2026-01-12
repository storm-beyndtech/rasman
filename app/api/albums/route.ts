import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Album, Song, UserProfile } from "@/lib/models";
import { albumSchema, albumUpdateSchema, albumFilterSchema } from "@/lib/validations";
import { S3Service } from "@/lib/s3";

// GET /api/albums - Fetch albums with filtering and pagination
export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const queryParams = Object.fromEntries(searchParams.entries());

		// Convert string params to appropriate types
		const filterParams = {
			...queryParams,
			featured: queryParams.featured ? queryParams.featured === "true" : undefined,
			minPrice: queryParams.minPrice ? parseFloat(queryParams.minPrice) : undefined,
			maxPrice: queryParams.maxPrice ? parseFloat(queryParams.maxPrice) : undefined,
			page: queryParams.page ? parseInt(queryParams.page) : 1,
			limit: queryParams.limit ? parseInt(queryParams.limit) : 9,
		};

		// Validate filter parameters
		const validatedParams = albumFilterSchema.parse(filterParams);
		const { featured, minPrice, maxPrice, search, sortBy, sortOrder, page, limit } = validatedParams;

		// Build query
		const query: any = {};

		if (featured !== undefined) query.featured = featured;
		if (minPrice !== undefined || maxPrice !== undefined) {
			query.price = {};
			if (minPrice !== undefined) query.price.$gte = minPrice;
			if (maxPrice !== undefined) query.price.$lte = maxPrice;
		}
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ artist: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		// Build sort
		const sort: any = {};
		sort[sortBy] = sortOrder === "asc" ? 1 : -1;

		// Execute query with pagination
		const skip = (page - 1) * limit;
		const [albums, totalCount] = await Promise.all([
			Album.find(query).sort(sort).skip(skip).limit(limit).populate("songIds", "title duration").lean(),
			Album.countDocuments(query),
		]);

		// Generate cover art URLs for S3 keys
		const albumsWithUrls = await Promise.all(
			albums.map(async (album) => {
				let coverArtUrl = album.coverArtUrl;

				// If it's an S3 key (not a URL), generate signed URL
				if (coverArtUrl && !coverArtUrl.startsWith("http")) {
					try {
						coverArtUrl = await S3Service.getSignedDownloadUrl(coverArtUrl, 3600);
					} catch (error) {
						console.error("Failed to sign album cover art URL:", error);
					}
				}

				return {
					...album,
					coverArtUrl,
				};
			})
		);

		const totalPages = Math.ceil(totalCount / limit);

		return NextResponse.json({
			success: true,
			data: {
				albums: albumsWithUrls,
				pagination: {
					page,
					limit,
					totalCount,
					totalPages,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching albums:", error);
		return NextResponse.json({ success: false, error: "Failed to fetch albums" }, { status: 500 });
	}
}

// POST /api/albums - Create new album (Admin only)
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		// Check if user is admin
		const client = await clerkClient();
		const user = await client.users.getUser(userId);

		if (user.publicMetadata?.role !== "admin") {
			return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
		}

		await connectDB();

		// Parse FormData
		const formData = await request.formData();
		const title = formData.get("title") as string;
		const artist = formData.get("artist") as string;
		const priceStr = formData.get("price") as string;
		const description = formData.get("description") as string;
		const featuredStr = formData.get("featured") as string;
		const songIdsStr = formData.get("songIds") as string;
		const coverArtFile = formData.get("coverArt") as File | null;

		// Parse and validate
		const price = parseFloat(priceStr);
		const featured = featuredStr === "true";
		const songIds = JSON.parse(songIdsStr || "[]");

		// Upload cover art (required)
		if (!coverArtFile) {
			return NextResponse.json(
				{ success: false, error: "Cover art is required" },
				{ status: 400 },
			);
		}

		const arrayBuffer = await coverArtFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const coverFileKey = S3Service.generateCoverArtKey(coverArtFile.name, userId);
		const contentType = coverArtFile.type || "image/jpeg";

		await S3Service.uploadFile(coverFileKey, buffer, contentType);
		const coverArtUrl = coverFileKey;

		// Validate input
		const validatedData = albumSchema.parse({
			title,
			artist,
			price,
			description: description || "",
			featured,
			songIds,
		});

		// Create new album
		const album = new Album({
			...validatedData,
			coverArtUrl,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await album.save();

		return NextResponse.json(
			{
				success: true,
				message: "Album created successfully",
				data: album,
			},
			{ status: 201 },
		);
	} catch (error: any) {
		console.error("Error creating album:", error);

		if (error.name === "ZodError") {
			return NextResponse.json(
				{ success: false, error: "Invalid input data", details: error.errors },
				{ status: 400 },
			);
		}

		return NextResponse.json({ success: false, error: "Failed to create album" }, { status: 500 });
	}
}

// PUT /api/albums - Update album (Admin only)
export async function PUT(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		// Check if user is admin
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		if (user.publicMetadata?.role !== "admin") {
			return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
		}

		await connectDB();
		const body = await request.json();

		// Validate input
		const validatedData = albumUpdateSchema.parse(body);
		const { id, ...updateData } = validatedData;

		// Update album
		const album = await Album.findByIdAndUpdate(
			id,
			{ ...updateData, updatedAt: new Date() },
			{ new: true, runValidators: true },
		);

		if (!album) {
			return NextResponse.json({ success: false, error: "Album not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			message: "Album updated successfully",
			data: album,
		});
	} catch (error: any) {
		console.error("Error updating album:", error);

		if (error.name === "ZodError") {
			return NextResponse.json(
				{ success: false, error: "Invalid input data", details: error.errors },
				{ status: 400 },
			);
		}

		return NextResponse.json({ success: false, error: "Failed to update album" }, { status: 500 });
	}
}

// DELETE /api/albums - Delete album (Admin only)
export async function DELETE(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

    
		// Check if user is admin
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
    
		if (user.publicMetadata?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
		}
    
		const { searchParams } = new URL(request.url);
		const albumId = searchParams.get("id");
    
		if (!albumId) {
      return NextResponse.json({ success: false, error: "Album ID is required" }, { status: 400 });
    }
    
    await connectDB();

		// Find album to get file keys for S3 deletion
		const album = await Album.findById(albumId).populate("songIds");
		if (!album) {
			return NextResponse.json({ success: false, error: "Album not found" }, { status: 404 });
		}

		// Delete files from storage (S3 or Blob)
		try {
			const deletePromises = [];
			const { BlobService } = await import("@/lib/blob");

			// Delete album cover
			if (album.coverArtUrl.startsWith("http")) {
				deletePromises.push(BlobService.deleteFile(album.coverArtUrl));
			} else {
				deletePromises.push(S3Service.deleteFile(album.coverArtUrl));
			}

			// Delete all song files in the album
			if (album.songIds && album.songIds.length > 0) {
				const songs = await Song.find({ _id: { $in: album.songIds } });
				songs.forEach((song) => {
					// Delete audio file
					if (song.fileKey.startsWith("http")) {
						deletePromises.push(BlobService.deleteFile(song.fileKey));
					} else {
						deletePromises.push(S3Service.deleteFile(song.fileKey));
					}

					// Delete cover art
					if (song.coverArtUrl.startsWith("http")) {
						deletePromises.push(BlobService.deleteFile(song.coverArtUrl));
					} else {
						deletePromises.push(S3Service.deleteFile(song.coverArtUrl));
					}
				});
			}

			await Promise.all(deletePromises);
		} catch (storageError) {
			console.error("Error deleting files from storage:", storageError);
			// Continue with database deletion even if storage deletion fails
		}

		// Delete songs in the album
		if (album.songIds && album.songIds.length > 0) {
			await Song.deleteMany({ _id: { $in: album.songIds } });
		}

		// Delete album from database
		await Album.findByIdAndDelete(albumId);

		return NextResponse.json({
			success: true,
			message: "Album and associated songs deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting album:", error);
		return NextResponse.json({ success: false, error: "Failed to delete album" }, { status: 500 });
	}
}
