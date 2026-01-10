import { put, del, head } from "@vercel/blob";

export class BlobService {
	// Upload file directly to Vercel Blob
	static async uploadFile(file: File, folder: "audio" | "covers", userId: string): Promise<string> {
		try {
			const timestamp = Date.now();
			const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
			const pathname = `${folder}/${userId}/${timestamp}_${sanitizedFilename}`;

			const blob = await put(pathname, file, {
				access: "public",
				addRandomSuffix: false,
			});

			console.log("File uploaded to Vercel Blob:", blob.url);
			return blob.url;
		} catch (error) {
			console.error("Error uploading file to Vercel Blob:", error);
			throw new Error("Failed to upload file to Vercel Blob");
		}
	}

	// Upload file from buffer (for server-side uploads)
	static async uploadFileFromBuffer(
		buffer: Buffer,
		filename: string,
		contentType: string,
		folder: "audio" | "covers",
		userId: string
	): Promise<string> {
		try {
			const timestamp = Date.now();
			const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
			const pathname = `${folder}/${userId}/${timestamp}_${sanitizedFilename}`;

			const blob = await put(pathname, buffer, {
				access: "public",
				contentType,
				addRandomSuffix: false,
			});

			console.log("File uploaded to Vercel Blob:", blob.url);
			return blob.url;
		} catch (error) {
			console.error("Error uploading buffer to Vercel Blob:", error);
			throw new Error("Failed to upload file to Vercel Blob");
		}
	}

	// Delete file from Vercel Blob
	static async deleteFile(url: string): Promise<void> {
		try {
			await del(url);
			console.log("File deleted from Vercel Blob:", url);
		} catch (error) {
			console.error("Error deleting file from Vercel Blob:", error);
			throw new Error("Failed to delete file from Vercel Blob");
		}
	}

	// Check if file exists in Vercel Blob
	static async fileExists(url: string): Promise<boolean> {
		try {
			await head(url);
			return true;
		} catch (error) {
			return false;
		}
	}

	// Get file info from Vercel Blob
	static async getFileInfo(url: string) {
		try {
			const response = await head(url);
			return {
				contentType: response.contentType,
				size: response.size,
				uploadedAt: response.uploadedAt,
				url: response.url,
			};
		} catch (error) {
			console.error("Error getting file info:", error);
			throw new Error("Failed to get file info");
		}
	}
}

// Helper function to extract file extension
export function getFileExtension(filename: string): string {
	return filename.split(".").pop()?.toLowerCase() || "";
}

// Helper function to validate audio file type
export function isValidAudioFile(filename: string): boolean {
	const validExtensions = ["mp3", "wav", "flac", "m4a", "aac"];
	const extension = getFileExtension(filename);
	return validExtensions.includes(extension);
}

// Helper function to validate image file type
export function isValidImageFile(filename: string): boolean {
	const validExtensions = ["jpg", "jpeg", "png", "webp"];
	const extension = getFileExtension(filename);
	return validExtensions.includes(extension);
}

// Helper function to get content type based on file extension
export function getContentType(filename: string): string {
	const extension = getFileExtension(filename);

	const contentTypes: { [key: string]: string } = {
		mp3: "audio/mpeg",
		wav: "audio/wav",
		flac: "audio/flac",
		m4a: "audio/mp4",
		aac: "audio/aac",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		webp: "image/webp",
	};

	return contentTypes[extension] || "application/octet-stream";
}
