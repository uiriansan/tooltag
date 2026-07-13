import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { DB_PATH } from "$env/static/private";

const sqlite = new Database(DB_PATH);
export const db = drizzle(sqlite);
