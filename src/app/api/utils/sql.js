import { neon } from "@neondatabase/serverless";

// Developer-friendly DB guard. In production we require DATABASE_URL; in
// development we fall back to a lightweight mock so SSR and dev flows don't
// crash when a DB isn't available locally.

const logEnvStatus = () => {
  console.log("Database connection status:", {
    DATABASE_URL: process.env.DATABASE_URL ? "[SET]" : "[NOT SET]",
    NODE_ENV: process.env.NODE_ENV,
    length: process.env.DATABASE_URL?.length || 0,
  });
};

logEnvStatus();

let sql;

if (process.env.NODE_ENV === "production") {
  // Production: prefer a real DATABASE_URL but don't throw at import time.
  // Throwing during module import can make serverless functions fail to initialize
  // and will prevent a deployment from being usable even if only some routes
  // require the DB. Instead, if DATABASE_URL is not set we'll provide a
  // fail-fast stub that surfaces clear errors when used.
  if (!process.env.DATABASE_URL) {
    console.warn(
      'No DATABASE_URL configured in production — DB-backed routes will return an error. Add DATABASE_URL to your production environment when ready.',
    );

    const errorStub = {
      query: async () => {
        throw new Error('Database is not configured (DATABASE_URL missing)');
      },
      transaction: async () => {
        throw new Error('Database is not configured (DATABASE_URL missing)');
      },
    };

    sql = errorStub;
  } else {
    sql = neon(process.env.DATABASE_URL);
  }
} else {
  if (process.env.DATABASE_URL) {
    sql = neon(process.env.DATABASE_URL);
  } else {
    const mockSql = {
      query: async () => ({ rows: [] }),
      transaction: async (cb) => {
        if (typeof cb === "function") return await cb(mockSql);
        return null;
      },
    };
    console.warn("Using mock database interface for development (DATABASE_URL not set)");
    sql = mockSql;
  }
}

export default sql;
