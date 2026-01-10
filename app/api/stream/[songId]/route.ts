import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { ISong, Purchase, Song } from "@/lib/models";
import { S3Service } from "@/lib/s3";

interface StreamRouteParams {
	params: Promise<{ songId: string }>;
}

// GET /api/stream/[songId] - Stream audio file with access control
export async function GET(request: NextRequest, { params }: StreamRouteParams) {
	try {
		const { userId } = await auth();
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

		// Verify song has a valid fileKey
		if (!song.fileKey) {
			return NextResponse.json({ success: false, error: "Audio file not found" }, { status: 404 });
		}

		// Check if it's a Blob URL (starts with http) or S3 key
		if (song.fileKey.startsWith("http")) {
			// Direct Blob URL - redirect directly
			return Response.redirect(song.fileKey, 302);
		} else {
			// S3 key - generate signed URL
			const streamUrl = await S3Service.getSignedStreamUrl(song.fileKey);
			return Response.redirect(streamUrl, 302);
		}
	} catch (error) {
		console.error("Error streaming file:", error);
		return NextResponse.json({ success: false, error: "Failed to stream file" }, { status: 500 });
	}
}

// POST /api/stream/[songId] - Get streaming URL (more secure, returns URL instead of redirect)
export async function POST(request: NextRequest, { params }: StreamRouteParams) {
	try {
		const { userId } = await auth();
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

		// Verify song has a valid fileKey
		if (!song.fileKey) {
			return NextResponse.json({ success: false, error: "Audio file not found" }, { status: 404 });
		}

		// Check if it's a Blob URL or S3 key
		let streamUrl: string;
		if (song.fileKey.startsWith("http")) {
			// Direct Blob URL
			streamUrl = song.fileKey;
		} else {
			// S3 key - generate signed URL
			streamUrl = await S3Service.getSignedStreamUrl(song.fileKey);
		}

		return NextResponse.json({
			success: true,
			data: {
				streamUrl,
				contentType: "audio/mpeg",
				duration: song.duration,
				title: song.title,
				artist: song.artist,
				genre: song.genre,
				songId: song._id,
			},
		});
	} catch (error) {
		console.error("Error generating stream URL:", error);
		return NextResponse.json({ success: false, error: "Failed to generate stream URL" }, { status: 500 });
	}
}
