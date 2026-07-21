import { db } from "./db/client.ts";
import { insumos, insumos_ferramentas, insumos_maquinas } from "./db/schema.ts";
import { eq } from "drizzle-orm";

export const get_insumos = async () => {
  const insumos_data = await db
    .select()
    .from(insumos)
    .orderBy(insumos.cod_interno);
  return insumos_data;
};

export const get_insumo_by_cod_interno = async (cod_interno: string) => {
  const insumos_data = await db
    .select()
    .from(insumos)
    .where(eq(insumos.cod_interno, cod_interno))
    .limit(1);
  return insumos_data;
};
