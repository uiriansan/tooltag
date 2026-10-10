import { db } from "$lib/server/db";
import { env } from "$env/dynamic/private";
import {
  ferramentas,
  tipos_ferramentas,
  ocorrencias,
  insumos_ocorrencias,
  insumos,
  insumos_ferramentas,
  maquinas,
  ferramentas_maquinas,
} from "./db/schema";
import { SortFerramentas } from "$lib/types";
import {
  eq,
  or,
  and,
  like,
  isNull,
  isNotNull,
  sql,
  count,
  asc,
  desc,
  inArray,
  exists,
  notExists,
} from "drizzle-orm";
import { logger } from "./logger";
import { normalize_search_string } from "./utils";

export const get_ferramenta_by_cod_interno = async (cod_interno: string) => {};

type FiltrosFerramentas = {
  query: string | null;
  tipos_ids: number[];
  maquinas_ids: number[];
  adicionado_por: number | null;
  enable_status_filters: boolean;
  incompleto: boolean;
  obsoleto: boolean;
};

const build_where_clause = (f: FiltrosFerramentas) => {
  const conditions = [];

  if (f.query) {
    conditions.push(
      or(
        like(ferramentas.busca_str, `%${normalize_search_string(f.query)}%`),
        eq(ferramentas.cod_fabricacao, `${f.query}`),
      ),
    );
  }

  if (f.tipos_ids.length > 0) {
    const ids_not_null = f.tipos_ids.filter((id) => id !== 0);
    const sub = [];
    if (ids_not_null.length > 0) {
      sub.push(inArray(ferramentas.tipo_id, ids_not_null));
    }
    if (f.tipos_ids.includes(0)) {
      sub.push(isNull(ferramentas.tipo_id));
    }
    conditions.push(or(...sub));
  }

  if (f.maquinas_ids.length > 0) {
    const ids_not_null = f.maquinas_ids.filter((id) => id !== 0);
    const sub = [];

    if (ids_not_null.length > 0) {
      sub.push(
        exists(
          db
            .select({ one: sql`1` })
            .from(ferramentas_maquinas)
            .where(
              and(
                eq(ferramentas_maquinas.ferramenta_id, ferramentas.id),
                inArray(ferramentas_maquinas.maquina_id, ids_not_null),
              ),
            ),
        ),
      );
    }

    if (f.maquinas_ids.includes(0)) {
      sub.push(
        notExists(
          db
            .select({ one: sql`1` })
            .from(ferramentas_maquinas)
            .where(eq(ferramentas_maquinas.ferramenta_id, ferramentas.id)),
        ),
      );
    }
    conditions.push(or(...sub));
  }

  if (f.adicionado_por !== null) {
    conditions.push(eq(ferramentas.adicionado_por, f.adicionado_por));
  }

  if (f.enable_status_filters) {
    conditions.push(eq(ferramentas.completo, !f.incompleto));
    conditions.push(eq(ferramentas.obsoleto, f.obsoleto));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

const build_max_versao_subquery = (
  enable_status_filters: boolean,
  incompleto: boolean,
  obsoleto: boolean,
) => {
  return db
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
};

const build_ultima_ocorrencia_subquery = () => {
  return db
    .select({
      ferramenta_id: insumos_ocorrencias.ferramenta_id,
      ultima_ocorrencia: sql<number>`max(${ocorrencias.data})`.as(
        "ultima_ocorrencia",
      ),
    })
    .from(insumos_ocorrencias)
    .innerJoin(
      ocorrencias,
      eq(ocorrencias.id, insumos_ocorrencias.ocorrencia_id),
    )
    .where(isNotNull(insumos_ocorrencias.ferramenta_id))
    .groupBy(insumos_ocorrencias.ferramenta_id)
    .as("ultima_ocorrencia_ferramenta");
};

const resolve_sort_method = (
  sort: SortFerramentas,
  ferramenta_ultima_ocorrencia: ReturnType<
    typeof build_ultima_ocorrencia_subquery
  >,
) => {
  switch (sort) {
    case SortFerramentas.DATA_UPD_NEW:
      return desc(ferramentas.atualizado_em);
    case SortFerramentas.DATA_UPD_OLD:
      return asc(ferramentas.atualizado_em);
    case SortFerramentas.COD_ZA:
      return desc(ferramentas.cod_interno);
    case SortFerramentas.OCORRENCIAS_NEW:
      return desc(ferramenta_ultima_ocorrencia.ultima_ocorrencia);
    case SortFerramentas.OCORRENCIAS_OLD:
      return asc(ferramenta_ultima_ocorrencia.ultima_ocorrencia);
    default:
      return asc(ferramentas.cod_interno);
  }
};

type FerramentaDeps = {
  maquinas: { nome: string; celula: string }[];
  insumos: {
    cod_interno: string;
    versao: number;
    nome: string;
    observacoes: string | null;
    foto_path: string | null;
    quantidade: number;
  }[];
};

const buscar_dependencias = async (
  ferramenta_ids: number[],
): Promise<Map<number, FerramentaDeps>> => {
  const map = new Map<number, FerramentaDeps>();

  if (ferramenta_ids.length === 0) return map;

  const res = await db.query.ferramentas.findMany({
    where: inArray(ferramentas.id, ferramenta_ids),
    columns: { id: true },
    with: {
      ferramentas_maquinas: {
        columns: {},
        with: {
          maquina: {
            columns: { nome: true },
            with: { celula: { columns: { nome: true } } },
          },
        },
      },
      insumos_ferramentas: {
        columns: { quantidade: true },
        with: {
          insumo: {
            columns: {
              cod_interno: true,
              versao: true,
              nome: true,
              observacoes: true,
              foto_path: true,
            },
          },
        },
      },
    },
  });

  for (const f of res) {
    map.set(f.id, {
      maquinas: f.ferramentas_maquinas.map((fm) => ({
        nome: fm.maquina.nome,
        celula: fm.maquina.celula.nome,
      })),
      insumos: f.insumos_ferramentas.map((ifr) => ({
        ...ifr.insumo,
        quantidade: ifr.quantidade,
      })),
    });
  }

  return map;
};

export const get_ferramentas_filter = async (
  sort: SortFerramentas = SortFerramentas.COD_AZ,
  offset: number = 0,
  limit: number = 50,
  tipos_ids: number[],
  maquinas_ids: number[],
  adicionado_por: number | null,
  enable_status_filters: boolean,
  incompleto: boolean,
  obsoleto: boolean,
  query: string | null,
  versoes_group: boolean,
) => {
  const where_clause = build_where_clause({
    query,
    tipos_ids,
    maquinas_ids,
    adicionado_por,
    enable_status_filters,
    incompleto,
    obsoleto,
  });

  const max_versao_ativa_per_item = build_max_versao_subquery(
    enable_status_filters,
    incompleto,
    obsoleto,
  );

  const ferramenta_ultima_ocorrencia = build_ultima_ocorrencia_subquery();

  const sort_method = resolve_sort_method(sort, ferramenta_ultima_ocorrencia);

  let q = db
    .select({
      id: ferramentas.id,
      cod_interno: ferramentas.cod_interno,
      nome: ferramentas.nome,
      observacoes: ferramentas.observacoes,
      foto_path: ferramentas.foto_path,
      versao: ferramentas.versao,
      tipo_id: tipos_ferramentas.id,
      tipo_nome: tipos_ferramentas.nome,
      total_count: sql<number>`count(*) over()`,
    })
    .from(ferramentas)
    .leftJoin(tipos_ferramentas, eq(tipos_ferramentas.id, ferramentas.tipo_id))
    .orderBy(sort_method)
    .offset(offset)
    .limit(limit)
    .$dynamic();

  if (versoes_group) {
    q = q.innerJoin(
      max_versao_ativa_per_item,
      and(
        eq(ferramentas.cod_interno, max_versao_ativa_per_item.cod_interno),
        eq(ferramentas.versao, max_versao_ativa_per_item.max_versao),
      ),
    );
  }
  if (
    sort === SortFerramentas.OCORRENCIAS_NEW ||
    sort === SortFerramentas.OCORRENCIAS_OLD
  ) {
    q = q.leftJoin(
      ferramenta_ultima_ocorrencia,
      eq(ferramentas.id, ferramenta_ultima_ocorrencia.ferramenta_id),
    );
  }
  if (where_clause) {
    q = q.where(where_clause);
  }

  const rows = await q;

  if (rows.length === 0) return { count: 0, items: [] };

  const deps = await buscar_dependencias(rows.map((d) => d.id));

  const items = rows.map((d) => ({
    id: d.id,
    cod_interno: d.cod_interno,
    nome: d.nome,
    observacoes: d.observacoes,
    foto_path: d.foto_path,
    versao: d.versao,
    tipo: d.tipo_nome !== null ? d.tipo_nome : null,
    maquinas: deps.get(d.id)?.maquinas ?? [],
    insumos: deps.get(d.id)?.insumos ?? [],
  }));

  return {
    items,
    count: rows[0].total_count,
  };
};

export const get_tipos_ferramentas = async () => {
  return await db
    .select({ id: tipos_ferramentas.id, nome: tipos_ferramentas.nome })
    .from(tipos_ferramentas)
    .orderBy(asc(tipos_ferramentas.nome));
};
