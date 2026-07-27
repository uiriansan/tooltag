import { db } from "$lib/server/db";
import {
  insumos,
  insumos_ferramentas,
  insumos_maquinas,
} from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const get_insumos = async () => {
  const insumos_data = await db
    .select()
    .from(insumos)
    .orderBy(insumos.cod_interno);
  return insumos_data;
};

export const get_insumos_filter = async (
  include_insumos: boolean,
  include_ferramentas: boolean,
  limit?: number,
  offset?: number,
  categoria_insumo?: number,
) => {
  let data = db.select().from(insumos).$dynamic();

  if (categoria_insumo) {
    data = data.where(eq(insumos.categoria_id, categoria_insumo));
  }

  return await data;
};

export const get_insumo_by_cod_interno = async (cod_interno: string) => {
  const insumos_data = await db
    .select()
    .from(insumos)
    .where(eq(insumos.cod_interno, cod_interno))
    .limit(1);
  return insumos_data;
};
