import mongoose from "mongoose";

/**
 * In-memory cache for the Mongoose connection promise and resolved client.
 * Next.js dev mode re-executes modules on every reload; without this, each
 * import would open a new connection and quickly hit MongoDB limits.
 */
interface MongooseConnectionCache {
  /** Resolved Mongoose module after a successful connect (singleton). */
  conn: typeof mongoose | null;
  /** In-flight connect promise so concurrent callers share one connection attempt. */
  promise: Promise<typeof mongoose> | null;
}

/** Attach cache to `globalThis` so it survives HMR and is shared across imports. */
const globalForMongoose = globalThis as typeof globalThis & {
  __mongooseConnectionCache?: MongooseConnectionCache;
};

function getCache(): MongooseConnectionCache {
  if (!globalForMongoose.__mongooseConnectionCache) {
    globalForMongoose.__mongooseConnectionCache = {
      conn: null,
      promise: null,
    };
  }
  return globalForMongoose.__mongooseConnectionCache;
}

const defaultConnectOptions: mongoose.ConnectOptions = {
  // Fail fast in serverless instead of buffering until timeout when disconnected.
  bufferCommands: false,
};

/**
 * Ensures a single shared MongoDB connection for the process.
 * Safe to call from every Server Component, Route Handler, or server action.
 *
 * @throws If `MONGODB_URI` is missing or connection fails.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim().length === 0) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your environment (e.g. `.env.local`).",
    );
  }

  const cache = getCache();

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, defaultConnectOptions);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

/**
 * Optional: close the pool (e.g. in tests or scripts). Not used during normal Next.js requests.
 */
export async function disconnectFromDatabase(): Promise<void> {
  const cache = getCache();
  cache.promise = null;
  cache.conn = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
