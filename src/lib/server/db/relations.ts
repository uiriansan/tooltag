import * as schema from "./schema";
import { sql, relations } from "drizzle-orm";

export const usuarios_relations = relations(schema.usuarios, ({ many }) => ({
  insumos_adicionados: many(schema.insumos),
  ferramentas_adicionadas: many(schema.ferramentas),
  ocorrencias_aprovadas: many(schema.ocorrencias),
}));

export const categorias_insumos_relations = relations(
  schema.categorias_insumos,
  ({ many }) => ({
    insumos: many(schema.insumos),
  }),
);

export const tipos_ferramentas_relations = relations(
  schema.tipos_ferramentas,
  ({ many }) => ({
    ferramentas: many(schema.ferramentas),
  }),
);

export const insumos_relations = relations(schema.insumos, ({ one, many }) => ({
  categoria: one(schema.categorias_insumos, {
    fields: [schema.insumos.categoria_id],
    references: [schema.categorias_insumos.id],
  }),
  adicionado_por: one(schema.usuarios, {
    fields: [schema.insumos.adicionado_por],
    references: [schema.usuarios.id],
  }),
  insumos_ferramentas: many(schema.insumos_ferramentas),
  insumos_maquinas: many(schema.insumos_maquinas),
  insumos_ocorrencias: many(schema.insumos_ocorrencias),
}));

export const ferramentas_relations = relations(
  schema.ferramentas,
  ({ one, many }) => ({
    tipo: one(schema.tipos_ferramentas, {
      fields: [schema.ferramentas.tipo_id],
      references: [schema.tipos_ferramentas.id],
    }),
    adicionado_por: one(schema.usuarios, {
      fields: [schema.ferramentas.adicionado_por],
      references: [schema.usuarios.id],
    }),
    insumos_ferramentas: many(schema.insumos_ferramentas),
    ferramentas_maquinas: many(schema.ferramentas_maquinas),
    insumos_ocorrencias: many(schema.insumos_ocorrencias),
  }),
);

export const insumos_ferramentas_relations = relations(
  schema.insumos_ferramentas,
  ({ one }) => ({
    insumo: one(schema.insumos, {
      fields: [schema.insumos_ferramentas.insumo_id],
      references: [schema.insumos.id],
    }),
    ferramenta: one(schema.ferramentas, {
      fields: [schema.insumos_ferramentas.ferramenta_id],
      references: [schema.ferramentas.id],
    }),
  }),
);

export const celulas_relations = relations(schema.celulas, ({ many }) => ({
  maquinas: many(schema.maquinas),
}));

export const maquinas_relations = relations(
  schema.maquinas,
  ({ one, many }) => ({
    celula: one(schema.celulas, {
      fields: [schema.maquinas.celula_id],
      references: [schema.celulas.id],
    }),
    insumos_maquinas: many(schema.insumos_maquinas),
    ferramentas_maquinas: many(schema.ferramentas_maquinas),
    ocorrencias: many(schema.ocorrencias),
  }),
);

export const insumos_maquinas_relations = relations(
  schema.insumos_maquinas,
  ({ one }) => ({
    maquina: one(schema.maquinas, {
      fields: [schema.insumos_maquinas.maquina_id],
      references: [schema.maquinas.id],
    }),
    insumo: one(schema.insumos, {
      fields: [schema.insumos_maquinas.insumo_id],
      references: [schema.insumos.id],
    }),
  }),
);

export const ferramentas_maquinas_relations = relations(
  schema.ferramentas_maquinas,
  ({ one }) => ({
    maquina: one(schema.maquinas, {
      fields: [schema.ferramentas_maquinas.maquina_id],
      references: [schema.maquinas.id],
    }),
    ferramenta: one(schema.ferramentas, {
      fields: [schema.ferramentas_maquinas.ferramenta_id],
      references: [schema.ferramentas.id],
    }),
  }),
);

export const ocorrencias_relations = relations(
  schema.ocorrencias,
  ({ one, many }) => ({
    maquina: one(schema.maquinas, {
      fields: [schema.ocorrencias.maquina_id],
      references: [schema.maquinas.id],
    }),
    aprovado_por: one(schema.usuarios, {
      fields: [schema.ocorrencias.aprovado_por],
      references: [schema.usuarios.id],
    }),
    insumos_ocorrencias: many(schema.insumos_ocorrencias),
  }),
);

export const insumos_ocorrencias_relations = relations(
  schema.insumos_ocorrencias,
  ({ one }) => ({
    ocorrencia: one(schema.ocorrencias, {
      fields: [schema.insumos_ocorrencias.ocorrencia_id],
      references: [schema.ocorrencias.id],
    }),
    insumo: one(schema.insumos, {
      fields: [schema.insumos_ocorrencias.insumo_id],
      references: [schema.insumos.id],
    }),
    ferramenta: one(schema.ferramentas, {
      fields: [schema.insumos_ocorrencias.ferramenta_id],
      references: [schema.ferramentas.id],
    }),
  }),
);
