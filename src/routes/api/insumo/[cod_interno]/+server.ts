import { get_insumo_by_cod_interno } from "$lib/server/insumos";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
  if (params.cod_interno) {
    if (/^[A-Z]-[0-9]{3}$/.test(params.cod_interno)) {
      const insumo = await get_insumo_by_cod_interno(params.cod_interno);
      return json(insumo, {
        status: insumo && insumo.length > 0 ? 200 : 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }
  return json([], {
    status: 404,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
