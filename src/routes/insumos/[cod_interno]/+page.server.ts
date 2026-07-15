import type { PageServerData } from './$types';
import { get_insumo_by_id } from "$lib/server/insumos";

export const load: PageServerData = async ({ params }) => {
    return {
        insumo: await get_insumo_by_id(params.cod_interno)
    };
};


