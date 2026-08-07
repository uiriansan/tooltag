import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { get_ferramentas_filter } from "$lib/server/ferramentas";
import { SortFerramentas } from "$lib/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const GET: RequestHandler = async ({ url }) => {
  const offset = Number(url.searchParams.get("offset")) || 0;
  const limit = Number(url.searchParams.get("limit")) || 50;

  const sort: SortFerramentas = Number(url.searchParams.get("sort")) || 0;
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

  await delay(2000);

  return json({
    offset,
    limit,
    items: ferramentas,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
