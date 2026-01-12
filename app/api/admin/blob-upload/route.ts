import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

// POST /api/admin/blob-upload - Generate upload token for client-side Blob upload
export async function POST(request: NextRequest): Promise<NextResponse> {
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

		const body = (await request.json()) as HandleUploadBody;

		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (pathname) => {
				// Validate pathname format (optional)
				return {
					allowedContentTypes: [
						"audio/mpeg",
						"audio/wav",
						"audio/flac",
						"audio/mp4",
						"audio/aac",
						"image/jpeg",
						"image/png",
						"image/webp",
					],
					maximumSizeInBytes: 100 * 1024 * 1024, // 100MB max
					addRandomSuffix: true,
				};
			},
			onUploadCompleted: async ({ blob, tokenPayload }) => {
				// Optional: Log upload completion
				console.log("Blob upload completed:", blob.url);
			},
		});

		return NextResponse.json(jsonResponse);
	} catch (error) {
		console.error("Error in blob upload route:", error);
		return NextResponse.json({ success: false, error: "Failed to generate upload token" }, { status: 500 });
	}
}
