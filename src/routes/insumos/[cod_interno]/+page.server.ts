import type { PageServerData } from "./$types";
import { get_insumo_by_cod_interno } from "$lib/server/insumos";
import { is_insumo } from "$lib/utils";
import { error } from "@sveltejs/kit";

export const load: PageServerData = async ({ params }) => {
  if (!is_insumo(params.cod_interno))
    return error(404, {
      message: `'${params.cod_interno}' não é um código de insumo válido.`,
    });

  return {
    insumo: await get_insumo_by_cod_interno(params.cod_interno),
  };
};
