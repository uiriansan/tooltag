import { get_insumos } from "$lib/server/insumos";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
  const insumo = await get_insumos();
  return json(insumo, {
    status: insumo && insumo.length > 0 ? 200 : 404,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
