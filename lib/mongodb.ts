import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('❌ Please define the MONGODB_URI environment variable in .env.local');
}

// Add a custom type to the global object
declare global {
  var _mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// Avoid re-declaring in hot-reloading dev mode
const globalWithMongoose = global as typeof globalThis & {
  _mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
};

let cached = globalWithMongoose._mongoose;

if (!cached) {
  cached = globalWithMongoose._mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    }).catch((err) => {
      cached.promise = null;
      console.error('❌ MongoDB connection error:', err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
