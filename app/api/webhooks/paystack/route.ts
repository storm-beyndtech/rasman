import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import { Purchase, Song, Album, UserProfile } from '@/lib/models';
import { PaystackService } from '@/lib/paystack';
import { EmailService } from '@/lib/email';
import { S3Service } from '@/lib/s3';
import { paystackWebhookSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body and signature
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-paystack-signature');
    

    if (!signature) {
      console.error('Missing Paystack signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValidSignature = PaystackService.verifyWebhookSignature(body, signature);
    if (!isValidSignature) {
      console.error('Invalid Paystack signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse the webhook data
    const webhookData = JSON.parse(body);
    
    // Validate webhook data structure
    const validatedData = paystackWebhookSchema.parse(webhookData);
    const { event, data } = validatedData;

    console.log('Paystack webhook received:', event, data.reference);

    await connectDB();

    // Handle different webhook events
    switch (event) {
      case 'charge.success':
        await handleSuccessfulPayment(data);
        break;
      
      case 'charge.failed':
        await handleFailedPayment(data);
        break;
      
      default:
        console.log('Unhandled webhook event:', event);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const { reference, amount, customer, metadata } = data;
    const { userId, itemId, itemType, purchaseId } = metadata;

    // Find the purchase record
    const purchase = await Purchase.findOne({ 
      paymentId: reference,
      _id: purchaseId 
    });

    if (!purchase) {
      console.error('Purchase not found for reference:', reference);
      return;
    }

    // Check if already processed
    if (purchase.status === 'completed') {
      console.log('Purchase already processed:', reference);
      return;
    }

    // Update purchase status
    purchase.status = 'completed';
    purchase.purchaseDate = new Date();
    await purchase.save();

    // Add purchase to user's purchase list
    await UserProfile.findOneAndUpdate(
      { clerkId: userId },
      { $addToSet: { purchases: purchase._id } }
    );

    // Get item details and user profile
    const [item, userProfile] = await Promise.all([
      itemType === 'song' 
        ? Song.findById(itemId)
        : Album.findById(itemId).populate('songIds'),
      UserProfile.findOne({ clerkId: userId })
    ]);

    if (!item || !userProfile) {
      console.error('Item or user not found');
      return;
    }

    // Generate download links
    const downloadLinks = await generateDownloadLinks(item, itemType);

    // Send confirmation email
    const emailSent = await EmailService.sendPurchaseConfirmation(
      userProfile.email,
      userProfile.firstName || 'Music Lover',
      {
        itemType,
        itemTitle: item.title,
        artist: item.artist,
        amount,
        currency: 'NGN',
        paymentReference: reference,
        downloadLinks
      }
    );

    // Update email sent status
    if (emailSent) {
      purchase.emailSent = true;
      await purchase.save();
    }

    // Send admin notification
    await EmailService.sendAdminPurchaseNotification({
      userEmail: userProfile.email,
      userName: userProfile.firstName || 'Unknown',
      itemTitle: item.title,
      itemType,
      amount,
      currency: 'NGN',
      paymentReference: reference
    });

    console.log('Successfully processed payment:', reference);

  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { reference, metadata } = data;
    const { purchaseId } = metadata;

    // Update purchase status to failed
    await Purchase.findOneAndUpdate(
      { paymentId: reference, _id: purchaseId },
      { status: 'failed' }
    );

    console.log('Marked payment as failed:', reference);

  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function generateDownloadLinks(item: any, itemType: 'song' | 'album') {
  const links = [];

  if (itemType === 'song') {
    // Generate links for single song
    const downloadUrl = await S3Service.getSignedDownloadUrl(item.fileKey, 86400); // 24 hours
    const streamUrl = await S3Service.getSignedStreamUrl(item.fileKey);

    links.push({
      title: item.title,
      downloadUrl,
      streamUrl
    });

  } else if (itemType === 'album') {
    // Generate links for all songs in album
    const songs = await Song.find({ _id: { $in: item.songIds } });
    
    for (const song of songs) {
      const downloadUrl = await S3Service.getSignedDownloadUrl(song.fileKey, 86400); // 24 hours
      const streamUrl = await S3Service.getSignedStreamUrl(song.fileKey);
      
      links.push({
        title: song.title,
        downloadUrl,
        streamUrl
      });
    }
  }

  return links;
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Paystack webhook endpoint' });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}