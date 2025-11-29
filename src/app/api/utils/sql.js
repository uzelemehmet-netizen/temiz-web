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
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "No database connection string was provided to `neon()`. Set DATABASE_URL in production environment",
    );
  }
  sql = neon(process.env.DATABASE_URL);
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
