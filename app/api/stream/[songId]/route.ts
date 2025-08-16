import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { ISong, Purchase, Song } from "@/lib/models";
import { S3Service } from "@/lib/s3";
import { headers } from "next/headers";

interface StreamRouteParams {
	params: Promise<{ songId: string }>;
}

// GET /api/stream/[songId] - Stream audio file with access control
export async function GET(request: NextRequest, { params }: StreamRouteParams) {
	try {
		const { userId } = auth();
		const { songId } = await params;

		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		if (!songId) {
			return NextResponse.json({ success: false, error: "Song ID is required" }, { status: 400 });
		}

		await connectDB();

		// Find the song by ID
		const song = (await Song.findById(songId).lean()) as ISong | null;
		if (!song) {
			return NextResponse.json({ success: false, error: "Song not found" }, { status: 404 });
		}

		// Check if user has purchased this song or its album
		const hasPurchase = await Purchase.findOne({
			userId,
			$or: [
				{ itemId: songId, itemType: "song", status: "completed" },
				{ itemId: song.albumId, itemType: "album", status: "completed" },
			],
		});

		if (!hasPurchase) {
			return NextResponse.json(
				{ success: false, error: "Access denied - Purchase required" },
				{ status: 403 },
			);
		}

		// Check if file exists in S3 using the song's fileKey
		const fileExists = await S3Service.fileExists(song.fileKey);
		if (!fileExists) {
			return NextResponse.json({ success: false, error: "Audio file not found" }, { status: 404 });
		}

		// Get range header for partial content support
		const headersList = await headers();
		const range = headersList.get("range");

		// Generate signed streaming URL using the song's fileKey
		const streamUrl = await S3Service.getSignedStreamUrl(song.fileKey, range || undefined);

		// For direct streaming, redirect to signed URL
		return Response.redirect(streamUrl, 302);
	} catch (error) {
		console.error("Error streaming file:", error);
		return NextResponse.json({ success: false, error: "Failed to stream file" }, { status: 500 });
	}
}

// POST /api/stream/[songId] - Get streaming URL (more secure, returns URL instead of redirect)
export async function POST(request: NextRequest, { params }: StreamRouteParams) {
	try {
		const { userId } = auth();
		const { songId } = await params;

		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		if (!songId) {
			return NextResponse.json({ success: false, error: "Song ID is required" }, { status: 400 });
		}

		await connectDB();

		// Find the song by ID
		const song = (await Song.findById(songId).lean()) as ISong | null;
		if (!song) {
			return NextResponse.json({ success: false, error: "Song not found" }, { status: 404 });
		}

		// Check if user has purchased this song or its album
		const hasPurchase = await Purchase.findOne({
			userId,
			$or: [
				{ itemId: songId, itemType: "song", status: "completed" },
				{ itemId: song.albumId, itemType: "album", status: "completed" },
			],
		});

		if (!hasPurchase) {
			return NextResponse.json(
				{ success: false, error: "Access denied - Purchase required" },
				{ status: 403 },
			);
		}

		// Check if file exists in S3
		const fileExists = await S3Service.fileExists(song.fileKey);
		if (!fileExists) {
			return NextResponse.json({ success: false, error: "Audio file not found" }, { status: 404 });
		}

		// Get file info from S3 (optional - for additional metadata)
		let fileInfo;
		try {
			fileInfo = await S3Service.getFileInfo(song.fileKey);
		} catch (error) {
			console.warn("Could not get file info:", error);
			fileInfo = null;
		}

		// Generate temporary streaming URL (short expiry for security)
		const streamUrl = await S3Service.getSignedStreamUrl(song.fileKey);

		return NextResponse.json({
			success: true,
			data: {
				streamUrl,
				contentType: fileInfo?.contentType || "audio/mpeg",
				contentLength: fileInfo?.contentLength,
				duration: song.duration,
				title: song.title,
				artist: song.artist,
				genre: song.genre,
				songId: song._id,
				expiresIn: 3600, // 1 hour
			},
		});
	} catch (error) {
		console.error("Error generating stream URL:", error);
		return NextResponse.json({ success: false, error: "Failed to generate stream URL" }, { status: 500 });
	}
}
