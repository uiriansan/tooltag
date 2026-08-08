import type { PageServerData } from "./$types";
import { get_tipos_ferramentas } from "$lib/server/ferramentas";

export const load: PageServerData = async () => {
  return {
    tipos_ferramentas: await get_tipos_ferramentas(),
  };
};
