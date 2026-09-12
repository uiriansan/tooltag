import type { PageServerData } from "./$types";
import { get_tipos_ferramentas } from "$lib/server/ferramentas";
import { get_maquinas } from "$lib/server/utils";

export const load: PageServerData = async () => {
  return {
    tipos_ferramentas: await get_tipos_ferramentas(),
    maquinas: await get_maquinas(),
  };
};
