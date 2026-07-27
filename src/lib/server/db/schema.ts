import { sql } from "drizzle-orm";
import {
  sqliteTable,
  primaryKey,
  foreignKey,
  check,
  integer,
  text,
  real,
  index,
  uniqueIndex,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

// CREATE TABLE IF NOT EXISTS Usuarios (
export const usuarios = sqliteTable(
  "Usuarios",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nome: text("nome").notNull().unique(),
    cargo: integer("cargo").notNull().default(0),
    senha: text("senha").notNull(),
    criado_em: integer("criado_em", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    atualizado_em: integer("atualizado_em", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    bloqueado: integer("bloqueado", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (t) => [
    check("cargo", sql`${t.cargo} in (0, 1)`), // `0` gestor, `1` admin
  ],
);

// CREATE TABLE IF NOT EXISTS CategoriasInsumos (
export const categorias_insumos = sqliteTable("CategoriasInsumos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull().unique(),
});

// CREATE TABLE IF NOT EXISTS TiposFerramentas (
export const tipos_ferramentas = sqliteTable("TiposFerramentas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull().unique(),
});

// CREATE TABLE IF NOT EXISTS Insumos (
export const insumos = sqliteTable(
  "Insumos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cod_fabricacao: text("cod_fabricacao"),
    cod_interno: text("cod_interno").notNull(),
    nome: text("nome").notNull(),
    observacoes: text("observacoes"),
    foto_path: text("foto_path"),
    material: text("material"), // material do insumo
    categoria_id: integer("categoria_id").references(
      () => categorias_insumos.id,
      {
        onDelete: "set null",
      },
    ),
    adicionado_em: integer("adicionado_em", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    adicionado_por: integer("adicionado_por")
      .notNull()
      .references(() => usuarios.id),
    atualizado_em: integer("atualizado_em", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    completo: integer("completo", { mode: "boolean" }).notNull().default(false), // Se o cadastro do insumo foi ou não finalizado.
    obsoleto: integer("obsoleto", { mode: "boolean" }).notNull().default(false),
    obsoleto_substituto: integer("obsoleto_substituto").references(
      (): AnySQLiteColumn => insumos.id,
    ),
  },
  (t) => [
    check(
      "insumos_obsoleto_non_recursive_check",
      sql`${t.id} != ${t.obsoleto_substituto}`,
    ),
    index("insumos_adicionado_por_idx").on(t.adicionado_por),
  ],
);

// CREATE TABLE IF NOT EXISTS Ferramentas (
export const ferramentas = sqliteTable(
  "Ferramentas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cod_fabricacao: text("cod_fabricacao"),
    cod_interno: text("cod_interno").notNull(),
    nome: text("nome").notNull(),
    observacoes: text("observacoes"),
    foto_path: text("foto_path"),
    material: text("material"), // Material para qual a ferramenta é destinada
    tipo_id: integer("tipo_id").references(() => tipos_ferramentas.id, {
      onDelete: "set null",
    }),
    altura_min: real("altura_min"),
    altura_max: real("altura_max"),
    rpm: real("rpm"),
    avanco_min: real("avanco_min"),
    adicionado_em: integer("adicionado_em", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    adicionado_por: integer("adicionado_por")
      .notNull()
      .references(() => usuarios.id),
    atualizado_em: integer("atualizado_em", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    completo: integer("completo", { mode: "boolean" }).notNull().default(false), // Se o cadastro da ferramenta foi ou não finalizado.
    obsoleto: integer("obsoleto", { mode: "boolean" }).notNull().default(false),
    obsoleto_substituto: integer("obsoleto_substituto").references(
      (): AnySQLiteColumn => ferramentas.id,
    ),
  },
  (t) => [
    check(
      "ferramentas_obsoleto_non_recursive_check",
      sql`${t.id} != ${t.obsoleto_substituto}`,
    ),
    index("ferramentas_adicionado_por_idx").on(t.adicionado_por),
  ],
);

// CREATE TABLE IF NOT EXISTS InsumosFerramentas (
export const insumos_ferramentas = sqliteTable(
  "InsumosFerramentas",
  {
    ferramenta_id: integer("ferramenta_id")
      .notNull()
      .references(() => ferramentas.id, {
        onDelete: "cascade",
      }),
    insumo_id: integer("insumo_id")
      .notNull()
      .references(() => insumos.id, {
        onDelete: "cascade",
      }),
    quantidade: integer("quantidade").notNull().default(1),
    observacoes: text("observacoes"),
  },
  (t) => [
    check("ferramenta_insumo_positive_qtd", sql`${t.quantidade} > 0`),
    primaryKey({
      columns: [t.ferramenta_id, t.insumo_id],
    }),
  ],
);

// CREATE TABLE IF NOT EXISTS Celulas (
export const celulas = sqliteTable("Celulas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull().unique(),
});

// CREATE TABLE IF NOT EXISTS Maquinas (
export const maquinas = sqliteTable("Maquinas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull().unique(),
  celula_id: integer("celula_id")
    .notNull()
    .references(() => celulas.id),
});

// CREATE TABLE IF NOT EXISTS InsumosMaquinas (
export const insumos_maquinas = sqliteTable(
  "InsumosMaquinas",
  {
    maquina_id: integer("maquina_id")
      .notNull()
      .references(() => maquinas.id, {
        onDelete: "cascade",
      }),
    insumo_id: integer("insumo_id")
      .notNull()
      .references(() => insumos.id, {
        onDelete: "cascade",
      }),
  },
  (t) => [
    primaryKey({
      columns: [t.maquina_id, t.insumo_id],
    }),
  ],
);

// CREATE TABLE IF NOT EXISTS FerramentasMaquinas (
export const ferramentas_maquinas = sqliteTable(
  "FerramentasMaquinas",
  {
    maquina_id: integer("maquina_id")
      .notNull()
      .references(() => maquinas.id),
    ferramenta_id: integer("ferramenta_id")
      .notNull()
      .references(() => ferramentas.id),
  },
  (t) => [
    primaryKey({
      columns: [t.maquina_id, t.ferramenta_id],
    }),
  ],
);

// CREATE TABLE IF NOT EXISTS Ocorrencias (
export const ocorrencias = sqliteTable(
  "Ocorrencias",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    status: integer("status").notNull(),
    prioridade: integer("prioridade").notNull(),
    data: integer("data", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    solicitante: text("solicitante").notNull(),
    justificativa: text("justificativa").notNull(),
    aprovado_por: integer("aprovado_por").references(() => usuarios.id),
    data_aprovacao: integer("data_aprovacao", { mode: "timestamp" }),
    observacao: text("observacao"),
    maquina_id: integer("maquina_id")
      .notNull()
      .references(() => maquinas.id),
  },
  (t) => [
    check("ocorrencia_status_check", sql`${t.status} in (0, 1)`), // `0` pendente, `1` atendida.
    check("ocorrencia_prioridade_check", sql`${t.prioridade} in (0, 1, 2, 3)`), // `0` baixa, `1` média, `2` alta, `3` crítica.
    index("ocorrencias_maquina_id_idx").on(t.maquina_id),
  ],
);

// CREATE TABLE IF NOT EXISTS InsumosOcorrencias (
export const insumos_ocorrencias = sqliteTable(
  "InsumosOcorrencias",
  {
    tipo: integer("tipo").notNull().default(0),
    ocorrencia_id: integer("ocorrencia_id")
      .notNull()
      .references(() => ocorrencias.id, {
        onDelete: "cascade",
      }),
    insumo_id: integer("insumo_id").references(() => insumos.id),
    ferramenta_id: integer("ferramenta_id").references(() => ferramentas.id),
    quantidade: integer("quantidade").notNull().default(1),
  },
  (t) => [
    // FK composta para garantir que `insumo_id` e `ferramenta_id`
    // formam uma combinação válida quando `tipo = 2`:
    foreignKey({
      columns: [t.ferramenta_id, t.insumo_id],
      foreignColumns: [
        insumos_ferramentas.ferramenta_id,
        insumos_ferramentas.insumo_id,
      ],
    }),
    check("ocorrencia_insumo_tipo_check", sql`${t.tipo} in (0, 1, 2)`), // `0` insumo solto, `1` ferramenta, `2` insumo que é parte de uma ferramenta.
    check("ocorrencia_insumo_positive_qtd", sql`${t.quantidade} > 0`),

    // Por limitações do SQLite, PKs compostas não se dão bem com nullable FKs.
    // UNIQUE INDEXes são a solução:
    check(
      "ocorrencia_insumo_exclusive_check",
      sql`
          (${t.tipo} = 0 AND ${t.insumo_id} IS NOT NULL AND ${t.ferramenta_id} IS NULL) OR
          (${t.tipo} = 1 AND ${t.ferramenta_id} IS NOT NULL AND ${t.insumo_id} IS NULL) OR
          (${t.tipo} = 2 AND ${t.insumo_id} IS NOT NULL AND ${t.ferramenta_id} IS NOT NULL)
        `,
    ),

    index("ocorrencia_insumo_ocorrencia_idx").on(t.ocorrencia_id),

    uniqueIndex("insumos_ocorrencias_insumo_uq")
      .on(t.ocorrencia_id, t.insumo_id)
      .where(sql`${t.tipo} = 0`),

    uniqueIndex("insumos_ocorrencias_ferramenta_uq")
      .on(t.ocorrencia_id, t.ferramenta_id)
      .where(sql`${t.tipo} = 1`),

    uniqueIndex("insumos_ocorrencias_insumo_ferramenta_uq")
      .on(t.ocorrencia_id, t.insumo_id, t.ferramenta_id)
      .where(sql`${t.tipo} = 2`),
  ],
);
