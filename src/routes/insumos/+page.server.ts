import type { PageServerData } from './$types';
import { get_insumos } from "$lib/server/insumos";

export const load: PageServerData = async () => {
    return {
        insumos: await get_insumos()
    };
};
