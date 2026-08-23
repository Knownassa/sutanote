import { PGlite } from "@electric-sql/pglite";
import { runMigrations } from "./persistence/migrations";

export const db = new PGlite("idb://sutonote");

export async function initDB() {
  await runMigrations();
  console.log("Sutonote local database initialized.");
}
