import { db } from "$lib/server/db";
import { maquinas, celulas } from "./db/schema";
import { asc } from "drizzle-orm";

export const get_maquinas = async () => {
  return await db.query.celulas.findMany({
    orderBy: (celulas, { asc }) => asc(celulas.nome),
    with: {
      maquinas: {
        columns: {
          id: true,
          nome: true,
        },
        orderBy: (maquinas, { asc }) => asc(maquinas.nome),
      },
    },
  });
};

// Remove acentos da query:
export const normalize_search_string = (query: string) => {
  return query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};
