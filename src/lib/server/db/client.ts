import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { DB_PATH } from "$env/static/private";
import { building } from "$app/environment";
import { dev } from "$app/environment";
import path from "path";
import fs from "fs/promises";

let db: ReturnType<typeof drizzle>;

if (!building) {
  const sqlite = new Database(DB_PATH);
  db = drizzle(sqlite);
}

const backup_database = async () => {
  const date_str = new Date().toISOString().split("T")[0];
  const backup_dir = `${path.dirname(DB_PATH)}/backups`;
  const backup_path = `${backup_dir}/database-${date_str}.sqlite`;

  try {
    // Criar diretório se não existir.
    await fs.mkdir(backup_dir, { recursive: true });
    await db.$client.backup(backup_path);
    console.log("DB Backup: Backup do banco salvo!");
  } catch (err) {
    console.error(
      "DB Backup: Não foi possível realizar o backup do banco: ",
      err,
    );
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
        console.log(`DB Backup: backup antigo deletado: ${backups_by_date[i]}`);
      }
    }
  } catch (err) {
    console.error(
      "DB Backup: Não foi possível deletar os backups antigos: ",
      err,
    );
  }
};

// TODO: export singleton
export { db, backup_database };
