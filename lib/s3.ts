import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
	HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
	region: process.env.AWS_REGION!,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export class S3Service {
	// Generate a pre-signed URL for file upload
	static async getUploadUrl(key: string, contentType: string): Promise<string> {
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			ContentType: contentType,
		});

		try {
			const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
			return signedUrl;
		} catch (error) {
			console.error("Error generating upload URL:", error);
			throw new Error("Failed to generate upload URL");
		}
	}

	// Upload file directly to S3
	static async uploadFile(key: string, fileBuffer: Buffer, contentType: string): Promise<string> {
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			Body: fileBuffer,
			ContentType: contentType,
		});

		try {
			await s3Client.send(command);
			return `s3://${BUCKET_NAME}/${key}`;
		} catch (error) {
			console.error("Error uploading file to S3:", error);
			throw new Error("Failed to upload file to S3");
		}
	}

	// Generate a pre-signed URL for file download/streaming (private access)
	static async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
		const command = new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
		});

		try {
			const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
			return signedUrl;
		} catch (error) {
			console.error("Error generating download URL:", error);
			throw new Error("Failed to generate download URL");
		}
	}

	// Generate a pre-signed URL for streaming with range support
	static async getSignedStreamUrl(key: string, range?: string): Promise<string> {
		const commandParams: any = {
			Bucket: BUCKET_NAME,
			Key: key,
		};

		if (range) {
			commandParams.Range = range;
		}

		const command = new GetObjectCommand(commandParams);

		try {
			const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
			return signedUrl;
		} catch (error) {
			console.error("Error generating stream URL:", error);
			throw new Error("Failed to generate stream URL");
		}
	}

	// Delete file from S3
	static async deleteFile(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
		});

		try {
			await s3Client.send(command);
		} catch (error) {
			console.error("Error deleting file from S3:", error);
			throw new Error("Failed to delete file from S3");
		}
	}

	// Check if file exists in S3
	static async fileExists(key: string): Promise<boolean> {
		const command = new HeadObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
		});

		try {
			await s3Client.send(command);
			return true;
		} catch (error) {
			return false;
		}
	}

	// Generate file key for audio files
	static generateAudioFileKey(filename: string, userId: string): string {
		const timestamp = Date.now();
		const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
		return `audio/${userId}/${timestamp}_${sanitizedFilename}`;
	}

	// Generate file key for cover art
	static generateCoverArtKey(filename: string, userId: string): string {
		const timestamp = Date.now();
		const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
		return `covers/${userId}/${timestamp}_${sanitizedFilename}`;
	}

	// Get file info from S3
	static async getFileInfo(key: string) {
		const command = new HeadObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
		});

		try {
			const response = await s3Client.send(command);
			return {
				contentType: response.ContentType,
				contentLength: response.ContentLength,
				lastModified: response.LastModified,
				etag: response.ETag,
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
