import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { get_ferramentas_filter } from "$lib/server/ferramentas";
import { SortFerramentas } from "$lib/types";
import { logger } from "$lib/server/logger";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parse_sort_ferramentas = (val_str: string | null): SortFerramentas => {
  if (Object.values(SortFerramentas).includes(val_str as SortFerramentas)) {
    return val_str as SortFerramentas;
  }
  return SortFerramentas.COD_AZ;
};

export const GET: RequestHandler = async ({ url }) => {
  const offset = Number(url.searchParams.get("offset")) || 0;
  const limit = Number(url.searchParams.get("limit")) || 50;

  const sort: SortFerramentas = parse_sort_ferramentas(
    url.searchParams.get("sort"),
  );
  const search_query = url.searchParams.get("q");
  const tipo_id = Number(url.searchParams.get("tipo"));
  const completo = Boolean(url.searchParams.get("completo"));
  const obsoleto = Boolean(url.searchParams.get("obsoleto"));

  const ferramentas = await get_ferramentas_filter(
    sort,
    offset,
    limit,
    null,
    null,
    tipo_id,
    NaN,
    completo,
    obsoleto,
    search_query,
  );

  // TODO: REMOVE!
  await delay(1000);

  logger.info(url.toString());

  return json({
    offset,
    limit,
    items: ferramentas,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
