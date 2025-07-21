import mongoose from 'mongoose';

// Song Model
const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    default: 'Rasman Peter Dudu'
  },
  fileKey: {
    type: String,
    required: true // S3 object key for the audio file
  },
  coverArtUrl: {
    type: String,
    required: true // S3 URL for cover art
  },
  duration: {
    type: Number,
    required: true // Duration in seconds
  },
  genre: {
    type: String,
    required: true,
    default: 'Reggae'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  previewUrl: {
    type: String, // Optional preview/snippet URL
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Album Model
const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    default: 'Rasman Peter Dudu'
  },
  coverArtUrl: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  songIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  description: {
    type: String,
    required: false
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Purchase Model
const purchaseSchema = new mongoose.Schema({
  userId: {
    type: String, // Clerk user ID
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // Can reference Song or Album
  },
  itemType: {
    type: String,
    enum: ['song', 'album'],
    required: true
  },
  paymentId: {
    type: String, // Paystack payment reference
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  emailSent: {
    type: Boolean,
    default: false
  }
});

// User Profile Model (to store additional user data)
const userProfileSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  purchases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better performance
songSchema.index({ title: 1, artist: 1 });
songSchema.index({ albumId: 1 });
songSchema.index({ featured: 1 });
albumSchema.index({ title: 1, artist: 1 });
albumSchema.index({ featured: 1 });
purchaseSchema.index({ userId: 1 });

// Export models
export const Song = mongoose.models.Song || mongoose.model('Song', songSchema);
export const Album = mongoose.models.Album || mongoose.model('Album', albumSchema);
export const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
export const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);

// Type definitions for TypeScript
export interface ISong {
  _id: string;
  title: string;
  artist: string;
  fileKey: string;
  coverArtUrl: string;
  duration: number;
  genre: string;
  price: number;
  albumId?: string;
  featured: boolean;
  previewUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAlbum {
  _id: string;
  title: string;
  artist: string;
  coverArtUrl: string;
  price: number;
  songIds: string[];
  description?: string;
  releaseDate: Date;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchase {
  _id: string;
  userId: string;
  itemId: string;
  itemType: 'song' | 'album';
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  purchaseDate: Date;
  emailSent: boolean;
}

export interface IUserProfile {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  purchases: string[];
  createdAt: Date;
  lastLogin: Date;
}
