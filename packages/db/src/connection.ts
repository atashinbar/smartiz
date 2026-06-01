import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

export function createDb(connectionString: string) {
  const client = postgres(connectionString, {
    max: 5,
    fetch_types: false,
  });
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
