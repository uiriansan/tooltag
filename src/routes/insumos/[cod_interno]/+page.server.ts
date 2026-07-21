import type { PageServerData } from "./$types";
import { get_insumo_by_cod_interno } from "$lib/server/insumos";

export const load: PageServerData = async ({ params }) => {
  return {
    insumo: await get_insumo_by_cod_interno(params.cod_interno),
  };
};
