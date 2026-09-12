import { db } from "$lib/server/db";
import { maquinas, celulas } from "./db/schema";
import { asc } from "drizzle-orm";

export const get_maquinas = async () => {
  return await db
    .select({ id: maquinas.id, nome: maquinas.nome })
    .from(maquinas)
    .orderBy(asc(maquinas.nome));
};
