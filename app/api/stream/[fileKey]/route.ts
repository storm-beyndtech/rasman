import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { ISong, Purchase, Song } from "@/lib/models";
import { S3Service } from "@/lib/s3";
import { headers } from "next/headers";

interface StreamRouteParams {
	params: {
		fileKey: string;
	};
}

// GET /api/stream/[fileKey] - Stream audio file with access control
export async function GET(request: NextRequest, { params }: StreamRouteParams) {
	try {
		const { userId } = auth();
		const { fileKey } = params;

		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		if (!fileKey) {
			return NextResponse.json({ success: false, error: "File key is required" }, { status: 400 });
		}

		await connectDB();

		// Find the song by file key
		const song = (await Song.findOne({ fileKey }).lean()) as ISong | null;
		if (!song) {
			return NextResponse.json({ success: false, error: "Song not found" }, { status: 404 });
		}

		// Check if user has purchased this song or its album
		const hasPurchase = await Purchase.findOne({
			userId,
			$or: [
				{ itemId: song._id, itemType: "song", status: "completed" },
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
		const fileExists = await S3Service.fileExists(fileKey);
		if (!fileExists) {
			return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
		}

		// Get range header for partial content support
		const headersList = await headers();
		const range = headersList.get("range");

		// Generate signed streaming URL
		const streamUrl = await S3Service.getSignedStreamUrl(fileKey, range || undefined);

		// For direct streaming, redirect to signed URL
		return Response.redirect(streamUrl, 302);
	} catch (error) {
		console.error("Error streaming file:", error);
		return NextResponse.json({ success: false, error: "Failed to stream file" }, { status: 500 });
	}
}

// Alternative: Proxy streaming through our server (more secure but higher bandwidth usage)
export async function POST(request: NextRequest, { params }: StreamRouteParams) {
	try {
		const { userId } = auth();
		const { fileKey } = params;

		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		await connectDB();

		// Find the song by file key
		const song = (await Song.findOne({ fileKey }).lean()) as ISong | null;
		if (!song) {
			return NextResponse.json({ success: false, error: "Song not found" }, { status: 404 });
		}

		// Check if user has purchased this song or its album
		const hasPurchase = await Purchase.findOne({
			userId,
			$or: [
				{ itemId: song._id, itemType: "song", status: "completed" },
				{ itemId: song.albumId, itemType: "album", status: "completed" },
			],
		});

		if (!hasPurchase) {
			return NextResponse.json(
				{ success: false, error: "Access denied - Purchase required" },
				{ status: 403 },
			);
		}

		// Get file info from S3
		const fileInfo = await S3Service.getFileInfo(fileKey);

		// Generate temporary streaming URL (short expiry for security)
		const streamUrl = await S3Service.getSignedStreamUrl(fileKey);

		return NextResponse.json({
			success: true,
			data: {
				streamUrl,
				contentType: fileInfo.contentType,
				contentLength: fileInfo.contentLength,
				duration: song.duration,
				title: song.title,
				artist: song.artist,
				expiresIn: 3600, // 1 hour
			},
		});
	} catch (error) {
		console.error("Error generating stream URL:", error);
		return NextResponse.json({ success: false, error: "Failed to generate stream URL" }, { status: 500 });
	}
}
