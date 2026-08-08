import { db } from "$lib/server/db";
import { env } from "$env/dynamic/private";
import { ferramentas, tipos_ferramentas } from "./db/schema";
import { SortFerramentas } from "$lib/types";
import { eq, or, like, sql, count, asc, desc } from "drizzle-orm";
import { logger } from "./logger";

export const get_ferramentas_filter = async (
  sort: SortFerramentas = SortFerramentas.COD_AZ,
  offset: number = 0,
  limit: number = 50,
  cod_interno: string | null,
  nome: string | null,
  tipo_id: number,
  adicionado_por: number,
  completo: boolean,
  obsoleto: boolean,
  query: string | null,
) => {
  let data = db
    .select({
      cod_interno: ferramentas.cod_interno,
      nome: ferramentas.nome,
      observacoes: ferramentas.observacoes,
      foto_path: sql`IFNULL(${ferramentas.foto_path}, ${env.DATA_PATH} || '/uploads/ferramenta.png')`,
    })
    .from(ferramentas)
    .offset(offset)
    .limit(limit)
    .$dynamic();

  if (query) {
    data = data.where(
      or(
        like(ferramentas.cod_interno, `%${query}%`),
        like(ferramentas.nome, `%${query}%`),
        eq(ferramentas.cod_fabricacao, `%${query}%`),
      ),
    );
  }

  let sort_method = null;
  switch (sort) {
    case SortFerramentas.DATA_ADD_NEW:
      sort_method = asc(ferramentas.adicionado_em);
      break;
    case SortFerramentas.DATA_ADD_OLD:
      sort_method = desc(ferramentas.adicionado_em);
      break;
    case SortFerramentas.DATA_UPD_NEW:
      sort_method = asc(ferramentas.atualizado_em);
      break;
    case SortFerramentas.DATA_UPD_OLD:
      sort_method = desc(ferramentas.atualizado_em);
      break;
    case SortFerramentas.COD_ZA:
      sort_method = desc(ferramentas.cod_interno);
      break;
    default:
      sort_method = asc(ferramentas.cod_interno);
  }

  data = data.orderBy(sort_method);

  return await data;
};

export const get_tipos_ferramentas = async () => {
  return await db
    .select({ id: tipos_ferramentas.id, nome: tipos_ferramentas.nome })
    .from(tipos_ferramentas)
    .orderBy(asc(tipos_ferramentas.nome));
};
