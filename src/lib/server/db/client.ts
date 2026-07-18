import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { DB_PATH } from "$env/static/private";
import { building } from "$app/environment";

let db: ReturnType<typeof drizzle>;

if (!building) {
  const sqlite = new Database(DB_PATH);
  db = drizzle(sqlite);
}

export { db };
