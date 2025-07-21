import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Song, Album } from "@/lib/models";
import { S3Service, isValidAudioFile, isValidImageFile, getContentType } from "@/lib/s3";

// POST /api/admin/upload - Handle file uploads (Admin only)
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

		const formData = await request.formData();
		const uploadType = formData.get("type") as string;

		if (uploadType === "song") {
			return await handleSongUpload(formData, userId);
		} else if (uploadType === "album") {
			return await handleAlbumUpload(formData, userId);
		} else {
			return NextResponse.json({ success: false, error: "Invalid upload type" }, { status: 400 });
		}
	} catch (error) {
		console.error("Error in upload route:", error);
		return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
	}
}

// Handle single song upload
async function handleSongUpload(formData: FormData, userId: string) {
	try {
		// Extract form data
		const title = formData.get("title") as string;
		const artist = formData.get("artist") as string;
		const genre = formData.get("genre") as string;
		const duration = parseInt(formData.get("duration") as string);
		const price = parseFloat(formData.get("price") as string);
		const featured = formData.get("featured") === "true";
		const audioFile = formData.get("audioFile") as File;
		const coverFile = formData.get("coverFile") as File;

		// Validate required fields
		if (!title || !audioFile || !coverFile) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		// Validate file types
		if (!isValidAudioFile(audioFile.name)) {
			return NextResponse.json({ success: false, error: "Invalid audio file type" }, { status: 400 });
		}

		if (!isValidImageFile(coverFile.name)) {
			return NextResponse.json({ success: false, error: "Invalid image file type" }, { status: 400 });
    }
  
		// Generate S3 keys
		const audioFileKey = S3Service.generateAudioFileKey(audioFile.name, userId);
		const coverFileKey = S3Service.generateCoverArtKey(coverFile.name, userId);

		// Upload files to S3
		const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
		const coverBuffer = Buffer.from(await coverFile.arrayBuffer());

		await Promise.all([
			S3Service.uploadFile(audioFileKey, audioBuffer, getContentType(audioFile.name)),
			S3Service.uploadFile(coverFileKey, coverBuffer, getContentType(coverFile.name)),
		]);

		// Create song in database
		const song = new Song({
			title,
			artist,
			genre,
			duration,
			price,
			featured,
			fileKey: audioFileKey,
			coverArtUrl: coverFileKey,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await song.save();

		return NextResponse.json(
			{
				success: true,
				message: "Song uploaded successfully",
				data: {
					songId: song._id,
					title: song.title,
					artist: song.artist,
				},
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error uploading song:", error);
		return NextResponse.json({ success: false, error: "Failed to upload song" }, { status: 500 });
	}
}

// Handle album upload with multiple songs
async function handleAlbumUpload(formData: FormData, userId: string) {
	try {
		// Extract album data
		const title = formData.get("title") as string;
		const artist = formData.get("artist") as string;
		const price = parseFloat(formData.get("price") as string);
		const description = formData.get("description") as string;
		const featured = formData.get("featured") === "true";
		const coverFile = formData.get("coverFile") as File;

		// Validate required fields
		if (!title || !coverFile) {
			return NextResponse.json({ success: false, error: "Missing required album fields" }, { status: 400 });
		}

		// Validate cover file type
		if (!isValidImageFile(coverFile.name)) {
			return NextResponse.json({ success: false, error: "Invalid album cover file type" }, { status: 400 });
		}

		// Extract songs data
		const songs = [];
		let songIndex = 0;

		while (formData.get(`songs[${songIndex}][title]`)) {
			const songTitle = formData.get(`songs[${songIndex}][title]`) as string;
			const songDuration = parseInt(formData.get(`songs[${songIndex}][duration]`) as string);
			const songPrice = parseFloat(formData.get(`songs[${songIndex}][price]`) as string);
			const songAudioFile = formData.get(`songs[${songIndex}][audioFile]`) as File;

			if (!songTitle || !songAudioFile) {
				return NextResponse.json(
					{ success: false, error: `Song ${songIndex + 1}: Missing required fields` },
					{ status: 400 },
				);
			}

			if (!isValidAudioFile(songAudioFile.name)) {
				return NextResponse.json(
					{ success: false, error: `Song ${songIndex + 1}: Invalid audio file type` },
					{ status: 400 },
				);
			}

			songs.push({
				title: songTitle,
				duration: songDuration,
				price: songPrice,
				audioFile: songAudioFile,
			});

			songIndex++;
		}

		if (songs.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Album must contain at least one song" },
				{ status: 400 },
			);
		}

		// Upload album cover to S3
		const albumCoverKey = S3Service.generateCoverArtKey(coverFile.name, userId);
		const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
		await S3Service.uploadFile(albumCoverKey, coverBuffer, getContentType(coverFile.name));

		// Upload songs and create song records
		const songIds = [];

		for (let i = 0; i < songs.length; i++) {
			const songData = songs[i];

			// Generate S3 keys for song
			const audioFileKey = S3Service.generateAudioFileKey(songData.audioFile.name, userId);
			const songCoverKey = albumCoverKey; // Use album cover for individual songs

			// Upload audio file to S3
			const audioBuffer = Buffer.from(await songData.audioFile.arrayBuffer());
			await S3Service.uploadFile(audioFileKey, audioBuffer, getContentType(songData.audioFile.name));

			// Create song in database
			const song = new Song({
				title: songData.title,
				artist,
				genre: "Reggae", // Default genre for album songs
				duration: songData.duration,
				price: songData.price,
				featured: false, // Individual songs in album are not featured by default
				fileKey: audioFileKey,
				coverArtUrl: songCoverKey,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			await song.save();
			songIds.push(song._id);
		}

		// Create album in database
		const album = new Album({
			title,
			artist,
			price,
			description,
			featured,
			coverArtUrl: albumCoverKey,
			songIds,
			releaseDate: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await album.save();

		// Update songs to reference the album
		await Song.updateMany({ _id: { $in: songIds } }, { albumId: album._id });

		return NextResponse.json(
			{
				success: true,
				message: "Album uploaded successfully",
				data: {
					albumId: album._id,
					title: album.title,
					artist: album.artist,
					songsCount: songIds.length,
				},
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error uploading album:", error);
		return NextResponse.json({ success: false, error: "Failed to upload album" }, { status: 500 });
	}
}

// GET /api/admin/upload - Get upload presigned URLs (for direct S3 upload)
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

		const { searchParams } = new URL(request.url);
		const fileType = searchParams.get("fileType");
		const fileName = searchParams.get("fileName");

		if (!fileType || !fileName) {
			return NextResponse.json({ success: false, error: "File type and name are required" }, { status: 400 });
		}

		// Generate appropriate file key
		let fileKey: string;
		if (fileType === "audio") {
			fileKey = S3Service.generateAudioFileKey(fileName, userId);
		} else if (fileType === "image") {
			fileKey = S3Service.generateCoverArtKey(fileName, userId);
		} else {
			return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 400 });
		}

		// Generate presigned URL for upload
		const uploadUrl = await S3Service.getUploadUrl(fileKey, getContentType(fileName));

		return NextResponse.json({
			success: true,
			data: {
				uploadUrl,
				fileKey,
				expires: "1 hour",
			},
		});
	} catch (error) {
		console.error("Error generating upload URL:", error);
		return NextResponse.json({ success: false, error: "Failed to generate upload URL" }, { status: 500 });
	}
}
