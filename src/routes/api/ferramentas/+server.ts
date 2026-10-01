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

  const tipos_url = url.searchParams.get("tipos");
  const tipos_ids =
    tipos_url === null ? [] : tipos_url.split(",").map((id) => Number(id));

  const maquinas_url = url.searchParams.get("maquinas");
  const maquinas_ids =
    maquinas_url === null
      ? []
      : maquinas_url.split(",").map((id) => Number(id));

  const enable_status_filters =
    url.searchParams.get("status") === "1" ? true : false;
  const incompleto = url.searchParams.get("incompleto") === "1" ? true : false;
  const obsoleto = url.searchParams.get("obsoleto") === "1" ? true : false;

  const versoes_group_url = url.searchParams.get("versoes_group");
  const versoes_group =
    versoes_group_url === null
      ? true
      : versoes_group_url !== "1"
        ? false
        : true;

  const ferramentas = await get_ferramentas_filter(
    sort,
    offset,
    limit,
    tipos_ids,
    maquinas_ids,
    null,
    enable_status_filters,
    incompleto,
    obsoleto,
    search_query,
    versoes_group,
  );

  // TODO: REMOVE!
  // await delay(1000);

  logger.info(url.toString());

  return json({
    offset,
    limit,
    count: ferramentas.count,
    items: ferramentas.items,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
