import { db } from "$lib/server/db";
import { env } from "$env/dynamic/private";
import { ferramentas, tipos_ferramentas } from "./db/schema";
import { SortFerramentas } from "$lib/types";
import {
  eq,
  or,
  and,
  like,
  isNull,
  sql,
  count,
  asc,
  desc,
  inArray,
} from "drizzle-orm";
import { logger } from "./logger";

export const get_ferramentas_filter = async (
  sort: SortFerramentas = SortFerramentas.COD_AZ,
  offset: number = 0,
  limit: number = 50,
  tipos_ids: number[],
  adicionado_por: number | null,
  enable_status_filters: boolean,
  incompleto: boolean,
  obsoleto: boolean,
  query: string | null,
  versoes_group: boolean,
) => {
  const filter_conditions = [];

  if (query) {
    filter_conditions.push(
      or(
        like(ferramentas.cod_interno, `%${query}%`),
        like(ferramentas.nome, `%${query}%`),
        like(ferramentas.observacoes, `%${query}%`),
        eq(ferramentas.cod_fabricacao, query),
      ),
    );
  }

  const geral_tipo_index = tipos_ids.indexOf(0);

  if (geral_tipo_index !== -1) {
    filter_conditions.push(isNull(ferramentas.tipo_id));
    tipos_ids.splice(geral_tipo_index, 1);
  }
  if (tipos_ids.length > 0) {
    filter_conditions.push(inArray(ferramentas.tipo_id, tipos_ids));
  }

  if (adicionado_por !== null) {
    filter_conditions.push(eq(ferramentas.adicionado_por, adicionado_por));
  }

  if (enable_status_filters) {
    filter_conditions.push(eq(ferramentas.completo, !incompleto));
    filter_conditions.push(eq(ferramentas.obsoleto, obsoleto));
  }

  const where_clause =
    filter_conditions.length > 0 ? and(...filter_conditions) : undefined;

  const max_versao_ativa_per_item = db
    .select({
      cod_interno: ferramentas.cod_interno,
      max_versao: sql<number>`max(${ferramentas.versao})`.as("max_versao"),
    })
    .from(ferramentas)
    .where(
      enable_status_filters
        ? and(
            eq(ferramentas.obsoleto, obsoleto),
            eq(ferramentas.completo, !incompleto),
          )
        : undefined,
    )
    .groupBy(ferramentas.cod_interno)
    .as("max_versao_ativa");

  function apply_filters<T extends { $dynamic: () => any }>(query: T) {
    let q = query.$dynamic();

    if (versoes_group) {
      q = q.innerJoin(
        max_versao_ativa_per_item,
        and(
          eq(ferramentas.cod_interno, max_versao_ativa_per_item.cod_interno),
          eq(ferramentas.versao, max_versao_ativa_per_item.max_versao),
        ),
      );
    }
    if (where_clause) {
      q = q.where(where_clause);
    }
    return q;
  }

  const [count_res] = await apply_filters(
    db.select({ total: count() }).from(ferramentas),
  );
  const total_count = count_res?.total ?? 0;

  if (total_count === 0)
    return {
      count: 0,
      items: [],
    };

  let sort_method = null;
  switch (sort) {
    case SortFerramentas.DATA_UPD_NEW:
      sort_method = desc(ferramentas.atualizado_em);
      break;
    case SortFerramentas.DATA_UPD_OLD:
      sort_method = asc(ferramentas.atualizado_em);
      break;
    case SortFerramentas.COD_ZA:
      sort_method = desc(ferramentas.cod_interno);
      break;
    default:
      sort_method = asc(ferramentas.cod_interno);
  }

  const items = await apply_filters(
    db
      .select({
        cod_interno: ferramentas.cod_interno,
        nome: ferramentas.nome,
        observacoes: ferramentas.observacoes,
        foto_path: ferramentas.foto_path,
        versao: ferramentas.versao,
      })
      .from(ferramentas),
  )
    .orderBy(sort_method)
    .offset(offset)
    .limit(limit);

  return {
    items,
    count: total_count,
  };
};

export const get_tipos_ferramentas = async () => {
  return await db
    .select({ id: tipos_ferramentas.id, nome: tipos_ferramentas.nome })
    .from(tipos_ferramentas)
    .orderBy(asc(tipos_ferramentas.nome));
};
