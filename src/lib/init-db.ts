import { db } from "./database";
import { runMigrations } from "./persistence/migrations";

export async function initDB() {
  await runMigrations();
  console.log("Sutonote local database initialized.");
}
