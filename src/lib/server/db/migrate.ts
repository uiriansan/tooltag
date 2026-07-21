import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { usuarios } from "./schema.ts";
import bcrypt from "bcrypt";

const database = new Database(process.env.DB_PATH!);
const db = drizzle(database);

async function main() {
  console.log("Executando migrations pendentes...");
  await migrate(db, { migrationsFolder: "./src/lib/server/db/migrations" });

  const users = await db.select().from(usuarios).limit(1);

  const salt_rounds = 12;
  const hashed_passwd = await bcrypt.hash(process.env.ADM_SENHA!, salt_rounds);

  if (users.length === 0) {
    console.log("Populando DB...");
    const adm = {
      nome: process.env.ADM_USERNAME!,
      cargo: 1,
      senha: hashed_passwd,
      criado_em: new Date(),
      atualizado_em: new Date(),
    };
    await db.insert(usuarios).values(adm);
  } else {
    console.log("Banco de dados já foi populado. Ignorando seed...");
  }

  database.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(`Erro (migrate_and_seed): ${err}`);
  process.exit(1);
});
