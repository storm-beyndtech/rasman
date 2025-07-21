import { z } from 'zod';

// Song validation schema
export const songSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  artist: z.string().min(1, 'Artist is required').max(50, 'Artist name must be less than 50 characters').default('Rasman Peter Dudu'),
  genre: z.string().min(1, 'Genre is required').max(30, 'Genre must be less than 30 characters').default('Reggae'),
  duration: z.number().min(1, 'Duration must be at least 1 second').max(3600, 'Duration cannot exceed 1 hour'),
  price: z.number().min(0, 'Price cannot be negative').max(10000, 'Price cannot exceed 10,000'),
  albumId: z.string().optional(),
  featured: z.boolean().default(false),
});

export const songUpdateSchema = songSchema.partial().extend({
  id: z.string().min(1, 'Song ID is required'),
});

// Album validation schema
export const albumSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  artist: z.string().min(1, 'Artist is required').max(50, 'Artist name must be less than 50 characters').default('Rasman Peter Dudu'),
  price: z.number().min(0, 'Price cannot be negative').max(50000, 'Price cannot exceed 50,000'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  songIds: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

export const albumUpdateSchema = albumSchema.partial().extend({
  id: z.string().min(1, 'Album ID is required'),
});

// Purchase validation schema
export const purchaseSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  itemType: z.enum(['song', 'album'], {
    required_error: 'Item type must be either song or album',
  }),
  amount: z.number().min(0, 'Amount cannot be negative'),
  currency: z.string().default('NGN'),
});

// Paystack webhook validation schema
export const paystackWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    reference: z.string(),
    amount: z.number(),
    currency: z.string(),
    status: z.string(),
    customer: z.object({
      email: z.string().email(),
    }),
    metadata: z.object({
      userId: z.string(),
      itemId: z.string(),
      itemType: z.enum(['song', 'album']),
    }),
  }),
});

// User profile validation schema
export const userProfileSchema = z.object({
  clerkId: z.string().min(1, 'Clerk ID is required'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().max(50, 'Last name must be less than 50 characters').optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

// File upload validation schemas
export const audioFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().refine(
    (type) => type.startsWith('audio/'),
    'File must be an audio file'
  ),
  size: z.number().max(50 * 1024 * 1024, 'File size cannot exceed 50MB'), // 50MB limit
});

export const imageFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().refine(
    (type) => type.startsWith('image/'),
    'File must be an image file'
  ),
  size: z.number().max(5 * 1024 * 1024, 'File size cannot exceed 5MB'), // 5MB limit
});

// Contact/Email validation schema
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
});

// Search/Filter validation schemas
export const songFilterSchema = z.object({
  genre: z.string().optional(),
  featured: z.boolean().optional(),
  albumId: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['title', 'price', 'createdAt', 'duration']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const albumFilterSchema = z.object({
  featured: z.boolean().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['title', 'price', 'createdAt', 'releaseDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Admin dashboard filters
export const purchaseFilterSchema = z.object({
  userId: z.string().optional(),
  itemType: z.enum(['song', 'album']).optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['purchaseDate', 'amount']).default('purchaseDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// API response schemas for type safety
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
});

// Export types for TypeScript
export type SongInput = z.infer<typeof songSchema>;
export type SongUpdateInput = z.infer<typeof songUpdateSchema>;
export type AlbumInput = z.infer<typeof albumSchema>;
export type AlbumUpdateInput = z.infer<typeof albumUpdateSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type PaystackWebhookInput = z.infer<typeof paystackWebhookSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type AudioFileInput = z.infer<typeof audioFileSchema>;
export type ImageFileInput = z.infer<typeof imageFileSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SongFilterInput = z.infer<typeof songFilterSchema>;
export type AlbumFilterInput = z.infer<typeof albumFilterSchema>;
export type PurchaseFilterInput = z.infer<typeof purchaseFilterSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;