import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "$env/dynamic/private";
import path from "path";
import fs from "fs/promises";
import * as schema from "./schema";
import { logger } from "$lib/server/logger";

const global_db = globalThis as unknown as {
  sqlite: Database.Database | undefined;
};

const sqlite =
  global_db.sqlite ??
  new Database(env.DB_PATH ?? "./data/dev/development.sqlite");

// Previnir Vite hot reloading de re-importar o módulo em `dev`:
if (env.NODE_ENV !== "production") {
  global_db.sqlite = sqlite;
}

sqlite.pragma("foreign_keys = ON");
sqlite.pragma("journal_mode = WAL");

// Use `import { db } from "$lib/server/db` para importar o client como "singleton".
export const db = drizzle(sqlite, { schema });

/* -------------------------------------------------- */

export const backup_database = async () => {
  const date_str = new Date().toISOString().split("T")[0];
  const backup_dir = `${path.dirname(env.DATA_PATH ?? "./data/prod")}/backups`;
  const backup_path = `${backup_dir}/production-${date_str}.sqlite`;

  try {
    // Criar diretório se não existir.
    await fs.mkdir(backup_dir, { recursive: true });
    await db.$client.backup(backup_path);
    logger.info(`Backup do banco salvo em '${backup_path}'.`);
  } catch (err: any) {
    logger.error("Não foi possível realizar o backup do banco: ", {
      error: err.message,
    });

    return;
  }

  // Número de backups mantidos:
  // Quando um novo backup é salvo, o mais antigo é deletado.
  const n_backups = 5;

  try {
    const backup_files = await fs.readdir(backup_dir);

    if (backup_files.length > n_backups) {
      const backups_by_date = backup_files.sort((a, b) => a.localeCompare(b));
      const n_extra_backups = backups_by_date.length - n_backups;

      for (let i = 0; i < n_extra_backups; i++) {
        await fs.unlink(`${backup_dir}/${backups_by_date[i]}`);
        logger.info(`Backup antigo deletado: ${backups_by_date[i]}`);
      }
    }
  } catch (err: any) {
    logger.error("Não foi possível deletar os backups antigos: ", {
      error: err.message,
    });
  }
};
