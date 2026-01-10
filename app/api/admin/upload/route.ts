import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Song, Album } from "@/lib/models";
import { BlobService, isValidAudioFile, isValidImageFile, getContentType } from "@/lib/blob";
import { S3Service } from "@/lib/s3";

// POST /api/admin/upload - Handle file uploads (Admin only)
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		// Check if user is admin
		const client = await clerkClient();
		const user = await client.users.getUser(userId);

		if (user.publicMetadata?.role !== "admin") {
			return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
		}

		const formData = await request.formData();
		const uploadType = formData.get("type") as string;

		if (uploadType === "song") {
			// AWS S3 upload: Upload through Vercel function (max 4.5MB)
			return await handleSongUpload(formData, userId);
		} else if (uploadType === "song-direct") {
			// Direct Vercel Blob upload (client-side, unlimited size)
			return await handleSongMetadataOnly(formData, userId);
		} else if (uploadType === "album-from-songs") {
			return await handleAlbumFromSongs(formData, userId);
		} else if (uploadType === "album") {
			return await handleAlbumUpload(formData, userId);
		} else if (uploadType === "update-cover") {
			return await handleUpdateCover(formData, userId);
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

		// Upload files to AWS S3
		const audioFileKey = S3Service.generateAudioFileKey(audioFile.name, userId);
		const coverFileKey = S3Service.generateCoverArtKey(coverFile.name, userId);

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

// Handle single song upload with direct S3 upload (metadata only)
async function handleSongMetadataOnly(formData: FormData, userId: string) {
	try {
		// Extract form data
		const title = formData.get("title") as string;
		const artist = formData.get("artist") as string;
		const genre = formData.get("genre") as string;
		const duration = parseInt(formData.get("duration") as string);
		const price = parseFloat(formData.get("price") as string);
		const featured = formData.get("featured") === "true";
		const audioFileKey = formData.get("audioFileKey") as string;
		const coverFileKey = formData.get("coverFileKey") as string;

		// Validate required fields
		if (!title || !audioFileKey || !coverFileKey) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		// Create song in database (files already uploaded to Vercel Blob)
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
		console.error("Error saving song metadata:", error);
		return NextResponse.json({ success: false, error: "Failed to save song metadata" }, { status: 500 });
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

		// Upload album cover to AWS S3
		const albumCoverKey = S3Service.generateCoverArtKey(coverFile.name, userId);
		const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
		await S3Service.uploadFile(albumCoverKey, coverBuffer, getContentType(coverFile.name));

		// Upload songs and create song records
		const songIds = [];

		for (let i = 0; i < songs.length; i++) {
			const songData = songs[i];

			// Upload audio file to AWS S3
			const audioFileKey = S3Service.generateAudioFileKey(songData.audioFile.name, userId);
			const audioBuffer = Buffer.from(await songData.audioFile.arrayBuffer());
			await S3Service.uploadFile(audioFileKey, audioBuffer, getContentType(songData.audioFile.name));

			// Create song in database
			const song = new Song({
				title: songData.title,
				artist,
				genre: "Reggae",
				duration: songData.duration,
				price: songData.price,
				featured: false,
				fileKey: audioFileKey,
				coverArtUrl: albumCoverKey,
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

// Handle album upload from content management songs
async function handleAlbumFromSongs(formData: FormData, userId: string) {
	try {
		const title = formData.get("title") as string;
		const artist = formData.get("artist") as string;
		const price = parseFloat(formData.get("price") as string);
		const description = formData.get("description") as string;
		const featured = formData.get("featured") === "true";
		const coverFile = formData.get("coverFile") as File;

		// Extract song IDs
		const songIds: string[] = [];
		let index = 0;
		while (formData.get(`songIds[${index}]`)) {
			songIds.push(formData.get(`songIds[${index}]`) as string);
			index++;
		}

		if (!title || !coverFile || songIds.length === 0) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		// Validate cover file
		if (!isValidImageFile(coverFile.name)) {
			return NextResponse.json({ success: false, error: "Invalid cover image file type" }, { status: 400 });
		}

		// Upload cover image to AWS S3
		const coverFileKey = S3Service.generateCoverArtKey(coverFile.name, userId);
		const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
		await S3Service.uploadFile(coverFileKey, coverBuffer, getContentType(coverFile.name));

		// Create album in database
		const album = new Album({
			title,
			artist,
			price,
			description,
			featured,
			coverArtUrl: coverFileKey,
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
				message: "Album created successfully",
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
		console.error("Error creating album from songs:", error);
		return NextResponse.json({ success: false, error: "Failed to create album" }, { status: 500 });
	}
}

// Handle only cover photo
async function handleUpdateCover(formData: FormData, userId: string) {
	try {
		const itemId = formData.get("id") as string;
		const itemType = formData.get("itemType") as "song" | "album"; // so you know what to update
    const coverFile = formData.get("coverArt") as File;
    
    console.log(coverFile)

		if (!itemId || !itemType || !coverFile) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		if (!isValidImageFile(coverFile.name)) {
			return NextResponse.json({ success: false, error: "Invalid image file type" }, { status: 400 });
		}

		// Upload to AWS S3
		const coverFileKey = S3Service.generateCoverArtKey(coverFile.name, userId);
		const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
		await S3Service.uploadFile(coverFileKey, coverBuffer, getContentType(coverFile.name));

		// Update DB
		let updatedDoc;
		if (itemType === "song") {
			updatedDoc = await Song.findByIdAndUpdate(
				itemId,
				{ coverArtUrl: coverFileKey, updatedAt: new Date() },
				{ new: true },
			);
		} else {
			updatedDoc = await Album.findByIdAndUpdate(
				itemId,
				{ coverArtUrl: coverFileKey, updatedAt: new Date() },
				{ new: true },
			);
		}

		if (!updatedDoc) {
			return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			message: "Cover updated successfully",
			data: { id: updatedDoc._id, coverArtUrl: updatedDoc.coverArtUrl },
		});
	} catch (error) {
		console.error("Error updating cover:", error);
		return NextResponse.json({ success: false, error: "Failed to update cover" }, { status: 500 });
	}
}

