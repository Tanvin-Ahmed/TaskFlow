import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

let _db: Database | null = null;

export const getDb = (): Database => {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL. Set your Neon Postgres connection string in .env",
    );
  }

  const sql = neon(connectionString);
  _db = drizzle(sql, { schema });
  return _db;
};

/** Lazy proxy so importing this module does not require DATABASE_URL at build time. */
export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
