import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Song } from "@/lib/models";
import { songSchema, songFilterSchema, songUpdateSchema } from "@/lib/validations";
import { S3Service } from "@/lib/s3";

// GET /api/songs - Fetch songs with filtering and pagination
export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const queryParams = Object.fromEntries(searchParams.entries());

		// Convert string params to appropriate types
		const filterParams = {
			...queryParams,
			featured: queryParams.featured ? true : undefined,
			minPrice: queryParams.minPrice ? parseFloat(queryParams.minPrice) : undefined,
			maxPrice: queryParams.maxPrice ? parseFloat(queryParams.maxPrice) : undefined,
			page: queryParams.page ? parseInt(queryParams.page) : 1,
			limit: queryParams.limit ? parseInt(queryParams.limit) : 10,
		};

		// Validate filter parameters
		const validatedParams = songFilterSchema.parse(filterParams);
		const { genre, featured, albumId, minPrice, maxPrice, search, sortBy, sortOrder, page, limit } =
			validatedParams;

		// Build query
		const query: any = {};

		if (genre) query.genre = genre;
		if (featured !== undefined) query.featured = featured;
		if (albumId) query.albumId = albumId;
		if (minPrice !== undefined || maxPrice !== undefined) {
			query.price = {};
			if (minPrice !== undefined) query.price.$gte = minPrice;
			if (maxPrice !== undefined) query.price.$lte = maxPrice;
		}
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ artist: { $regex: search, $options: "i" } },
				{ genre: { $regex: search, $options: "i" } },
			];
		}

		// Build sort
		const sort: any = {};
		sort[sortBy] = sortOrder === "asc" ? 1 : -1;

		// Execute query with pagination
		const skip = (page - 1) * limit;
		const [songs, totalCount] = await Promise.all([
			Song.find(query).sort(sort).skip(skip).limit(limit).populate("albumId", "title").lean(),
			Song.countDocuments(query),
		]);

		// Generate cover art URLs (public access for browsing)
		const songsWithUrls = await Promise.all(
			songs.map(async (song) => {
				let coverArtUrl = song.coverArtUrl;

				if (coverArtUrl && !coverArtUrl.startsWith("http")) {
					try {
						coverArtUrl = await S3Service.getSignedDownloadUrl(coverArtUrl, 3600); // 1 hour expiry
					} catch (s3Error) {
						console.error("Cover signing failed for song", song._id?.toString(), coverArtUrl, s3Error);
					}
				}

				return {
					...song,
					coverArtUrl,
					fileKey: undefined,
				};
			}),
		);

		const totalPages = Math.ceil(totalCount / limit);

		return NextResponse.json({
			success: true,
			data: {
				songs: songsWithUrls,
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
		console.error("Error fetching songs:", error);
		return NextResponse.json({ success: false, error: "Failed to fetch songs" }, { status: 500 });
	}
}

// POST /api/songs - Create new song (Admin only)
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
		const validatedData = songSchema.parse(body);

		// Create new song
		const song = new Song({
			...validatedData,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await song.save();

		return NextResponse.json(
			{
				success: true,
				message: "Song created successfully",
				data: song,
			},
			{ status: 201 },
		);
	} catch (error: any) {
		console.error("Error creating song:", error);

		if (error.name === "ZodError") {
			return NextResponse.json(
				{ success: false, error: "Invalid input data", details: error.errors },
				{ status: 400 },
			);
		}

		return NextResponse.json({ success: false, error: "Failed to create song" }, { status: 500 });
	}
}

// PUT /api/songs - Update song (Admin only)
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
		const validatedData = songUpdateSchema.parse(body);
		const { id, ...updateData } = validatedData;

		// Update song
		const song = await Song.findByIdAndUpdate(
			id,
			{ ...updateData, updatedAt: new Date() },
			{ new: true, runValidators: true },
		);

		if (!song) {
			return NextResponse.json({ success: false, error: "Song not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			message: "Song updated successfully",
			data: song,
		});
	} catch (error: any) {
		console.error("Error updating song:", error);

		if (error.name === "ZodError") {
			return NextResponse.json(
				{ success: false, error: "Invalid input data", details: error.errors },
				{ status: 400 },
			);
		}

		return NextResponse.json({ success: false, error: "Failed to update song" }, { status: 500 });
	}
}

// DELETE /api/songs - Delete song (Admin only)
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

		await connectDB();

		const { searchParams } = new URL(request.url);
		const songId = searchParams.get("id");

		if (!songId) {
			return NextResponse.json({ success: false, error: "Song ID is required" }, { status: 400 });
		}

		// Find song to get file keys for S3 deletion
		const song = await Song.findById(songId);
		if (!song) {
			return NextResponse.json({ success: false, error: "Song not found" }, { status: 404 });
		}

		// Delete files from S3
		try {
			await Promise.all([S3Service.deleteFile(song.fileKey), S3Service.deleteFile(song.coverArtUrl)]);
		} catch (s3Error) {
			console.error("Error deleting files from S3:", s3Error);
			// Continue with database deletion even if S3 deletion fails
		}

		// Delete song from database
		await Song.findByIdAndDelete(songId);

		return NextResponse.json({
			success: true,
			message: "Song deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting song:", error);
		return NextResponse.json({ success: false, error: "Failed to delete song" }, { status: 500 });
	}
}
