import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Song, Album, Purchase, UserProfile, ISong, IAlbum } from "@/lib/models";
import { purchaseSchema } from "@/lib/validations";
import { PaystackService } from "@/lib/paystack";
import { S3Service } from "@/lib/s3";

// POST /api/purchase - Initialize purchase
export async function POST(request: NextRequest) {
	try {
		const { userId } = auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		await connectDB();

		// Get full user data with null check
		const clerkUser = await currentUser();
		if (!clerkUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// user details
		const email = clerkUser.emailAddresses[0]?.emailAddress || "";
		const firstName = clerkUser.firstName || "";
		const lastName = clerkUser.lastName || "";

		const body = await request.json();

		// Validate input
		const validatedData = purchaseSchema.parse(body);
		const { itemId, itemType, amount } = validatedData;

		// Verify the item exists and get its details
		let item;
		if (itemType === "song") {
			item = await Song.findById(itemId);
		} else {
			item = await Album.findById(itemId);
		}

		if (!item) {
			return NextResponse.json({ success: false, error: `${itemType} not found` }, { status: 404 });
		}

		// Check if user already owns this item
		const existingPurchase = await Purchase.findOne({
			userId,
			itemId,
			status: "completed",
		});

		if (existingPurchase) {
			return NextResponse.json({ success: false, error: "You already own this item" }, { status: 400 });
		}

		// Generate payment reference
		const reference = PaystackService.generateReference("RAS");

		// Create pending purchase record
		const purchase = new Purchase({
			userId,
			itemId,
			itemType,
			paymentId: reference,
			amount,
			currency: "NGN",
			status: "pending",
		});

		await purchase.save();

		// Initialize Paystack payment
		const paymentResult = await PaystackService.initializePayment({
			email,
			amount: PaystackService.toKobo(amount),
			reference,
			metadata: {
				userId,
				itemId,
				itemType,
				purchaseId: purchase._id.toString(),
				itemTitle: item.title,
				customerName: `${firstName} ${lastName}`.trim(),
			},
		});

		if (!paymentResult.success) {
			await Purchase.findByIdAndDelete(purchase._id);
			return NextResponse.json({ success: false, error: paymentResult.error }, { status: 500 });
		}

		if (!paymentResult.data || !paymentResult.data.authorization_url) {
			await Purchase.findByIdAndDelete(purchase._id);
			return NextResponse.json({ success: false, error: "Failed to initialize payment" }, { status: 500 });
		}

		let userProfile = await UserProfile.findOne({ clerkId: userId });
		if (!userProfile) {
			userProfile = new UserProfile({
				clerkId: userId,
				email,
				firstName,
				lastName,
				role: "user",
				purchases: [],
			});
			await userProfile.save();
		}

		return NextResponse.json({
			success: true,
			data: {
				authorization_url: paymentResult.data.authorization_url,
				access_code: paymentResult.data.access_code,
				reference: paymentResult.data.reference,
				purchaseId: purchase._id,
				item: {
					id: item._id,
					title: item.title,
					type: itemType,
					price: item.price,
				},
			},
		});
	} catch (error: any) {
		console.error("Error initializing purchase:", error);

		if (error.name === "ZodError") {
			return NextResponse.json(
				{ success: false, error: "Invalid input data", details: error.errors },
				{ status: 400 },
			);
		}

		return NextResponse.json({ success: false, error: "Failed to initialize purchase" }, { status: 500 });
	}
}

// GET /api/purchase - Get user's purchases
export async function GET(request: NextRequest) {
	try {
		const { userId } = auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		await connectDB();

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const itemType = searchParams.get("itemType");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");

		// Build query
		const query: any = { userId };
		if (status) query.status = status;
		if (itemType) query.itemType = itemType;

		// Get purchases with pagination
		const skip = (page - 1) * limit;
		const [purchases, totalCount] = await Promise.all([
			Purchase.find(query).sort({ purchaseDate: -1 }).skip(skip).limit(limit).lean(),
			Purchase.countDocuments(query),
		]);

		// Populate item details
		const purchasesWithItems = await Promise.all(
			purchases.map(async (purchase) => {
				let item: ISong | IAlbum | null;
				if (purchase.itemType === "song") {
					item = (await Song.findById(purchase.itemId).lean()) as ISong | null;
				} else {
					item = (await Album.findById(purchase.itemId).lean()) as IAlbum | null;
				}

				// Convert S3 key to signed URL
				if (item && item.coverArtUrl) {
					item.coverArtUrl = await S3Service.getSignedDownloadUrl(item.coverArtUrl, 3600);
				}

				return {
					...JSON.parse(JSON.stringify(purchase)),
					item,
				};
			}),
		);

		const totalPages = Math.ceil(totalCount / limit);

		return NextResponse.json({
			success: true,
			data: {
				purchases: purchasesWithItems,
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
		console.error("Error fetching purchases:", error);
		return NextResponse.json({ success: false, error: "Failed to fetch purchases" }, { status: 500 });
	}
}

// PUT /api/purchase - Verify purchase (called after payment)
export async function PUT(request: NextRequest) {
	try {
		const { userId } = auth();
		if (!userId) {
			return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
		}

		const body = await request.json();
		const { reference } = body;

		if (!reference) {
			return NextResponse.json({ success: false, error: "Payment reference is required" }, { status: 400 });
		}

		await connectDB();

		// Verify payment with Paystack
		const paymentVerification = await PaystackService.verifyPayment(reference);

		if (!paymentVerification.success) {
			return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
		}

		const paymentData = paymentVerification.data;

		// Check if payment was successful
		if (paymentData.status !== "success") {
			return NextResponse.json({ success: false, error: "Payment was not successful" }, { status: 400 });
		}

		// Find and update the purchase
		const purchase = await Purchase.findOne({
			paymentId: reference,
			userId,
		});

		if (!purchase) {
			return NextResponse.json({ success: false, error: "Purchase record not found" }, { status: 404 });
		}

		// Update purchase status
		purchase.status = "completed";
		purchase.purchaseDate = new Date();
		await purchase.save();

		// Add purchase to user's purchase list
		await UserProfile.findOneAndUpdate({ clerkId: userId }, { $addToSet: { purchases: purchase._id } });

		// Get item details for response
		let item;
		if (purchase.itemType === "song") {
			item = await Song.findById(purchase.itemId);
		} else {
			item = await Album.findById(purchase.itemId);
		}

		return NextResponse.json({
			success: true,
			message: "Purchase completed successfully",
			data: {
				purchase,
				item: {
					id: item._id,
					title: item.title,
					type: purchase.itemType,
				},
			},
		});
	} catch (error) {
		console.error("Error verifying purchase:", error);
		return NextResponse.json({ success: false, error: "Failed to verify purchase" }, { status: 500 });
	}
}
