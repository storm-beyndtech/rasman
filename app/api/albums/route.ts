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

		// Generate cover art URLs (public access for browsing)
		const albumsWithUrls = await Promise.all(
			albums.map(async (album) => {
				const coverArtUrl = await S3Service.getSignedDownloadUrl(album.coverArtUrl, 3600); // 1 hour expiry
				return {
					...album,
					coverArtUrl,
				};
			}),
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
		const body = await request.json();

		// Validate input
		const validatedData = albumSchema.parse(body);

		// Create new album
		const album = new Album({
			...validatedData,
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

		// Delete files from S3
		try {
			const deletePromises = [S3Service.deleteFile(album.coverArtUrl)];

			// Delete all song files in the album
			if (album.songIds && album.songIds.length > 0) {
				const songs = await Song.find({ _id: { $in: album.songIds } });
				songs.forEach((song) => {
					deletePromises.push(S3Service.deleteFile(song.fileKey));
					deletePromises.push(S3Service.deleteFile(song.coverArtUrl));
				});
			}

			await Promise.all(deletePromises);
		} catch (s3Error) {
			console.error("Error deleting files from S3:", s3Error);
			// Continue with database deletion even if S3 deletion fails
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
