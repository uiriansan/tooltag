import { sql } from "drizzle-orm";
import { boolean, foreignKey } from "drizzle-orm/gel-core";
import {
  sqliteTable,
  primaryKey,
  check,
  integer,
  text,
  real,
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
      .$defaultFn(() => new Date()),
  },
  (usuarios) => [
    check("cargo", sql`${usuarios.cargo} in (0, 1)`), // `0` gestor, `1` admin
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
export const insumos = sqliteTable("Insumos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cod_fabricacao: text("cod_fabricacao"),
  cod_interno: text("cod_interno").notNull(),
  nome: text("nome").notNull(),
  observacoes: text("observacoes"),
  foto_path: text("foto_path"),
  material: text("material"), // material do insumo
  categoria: integer("categoria").references(() => categorias_insumos.id),
  adicionado_em: integer("adicionado_em", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  adicionado_por: integer("adicionado_por")
    .notNull()
    .references(() => usuarios.id),
  atualizado_em: integer("atualizado_em", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  completo: integer("completo", { mode: "boolean" }).notNull().default(false), // Se o cadastro do insumo foi ou não finalizado.
  obsoleto: integer("obsoleto", { mode: "boolean" }).notNull().default(false),
  obsoleto_substituto: integer("obsoleto_substituto").references(
    (): AnySQLiteColumn => insumos.id,
  ),
});

// CREATE TABLE IF NOT EXISTS Ferramentas (
export const ferramentas = sqliteTable("Ferramentas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cod_fabricacao: text("cod_fabricacao"),
  cod_interno: text("cod_interno").notNull(),
  nome: text("nome"),
  observacoes: text("observacoes"),
  foto_path: text("foto_path"),
  material: text("material"), // Material para qual a ferramenta é destinada
  tipo: integer("tipo").references(() => tipos_ferramentas.id),
  altura_min: real("altura_min"),
  altura_max: real("altura_max"),
  rpm: integer("rpm"),
  avanco_min: real("avanco_min"),
  adicionado_em: integer("adicionado_em", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  adicionado_por: integer("adicionado_por")
    .notNull()
    .references(() => usuarios.id),
  atualizado_em: integer("atualizado_em", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  completo: integer("completo", { mode: "boolean" }).notNull().default(false), // Se o cadastro da ferramenta foi ou não finalizado.
  obsoleto: integer("obsoleto", { mode: "boolean" }).notNull().default(false),
  obsoleto_substituto: integer("obsoleto_substituto").references(
    (): AnySQLiteColumn => ferramentas.id,
  ),
});

// CREATE TABLE IF NOT EXISTS InsumosFerramentas (
export const insumos_ferramentas = sqliteTable(
  "InsumosFerramentas",
  {
    ferramenta_id: integer("ferramenta_id")
      .notNull()
      .references(() => ferramentas.id),
    insumo_id: integer("insumo_id")
      .notNull()
      .references(() => insumos.id),
    quantidade: integer("quantidade").notNull().default(1),
    observacoes: text("observacoes"),
  },
  (insumos_ferramentas) => [
    primaryKey({
      columns: [
        insumos_ferramentas.ferramenta_id,
        insumos_ferramentas.insumo_id,
      ],
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
  celula: integer("celula")
    .notNull()
    .references(() => celulas.id),
});

// CREATE TABLE IF NOT EXISTS InsumosMaquinas (
export const insumos_maquinas = sqliteTable(
  "InsumosMaquinas",
  {
    maquina_id: integer("maquina_id")
      .notNull()
      .references(() => maquinas.id),
    insumo_id: integer("insumo_id")
      .notNull()
      .references(() => insumos.id),
  },
  (insumos_maquinas) => [
    primaryKey({
      columns: [insumos_maquinas.maquina_id, insumos_maquinas.insumo_id],
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
  (ferramentas_maquinas) => [
    primaryKey({
      columns: [
        ferramentas_maquinas.maquina_id,
        ferramentas_maquinas.ferramenta_id,
      ],
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
    maquina: integer("maquina")
      .notNull()
      .references(() => maquinas.id),
  },
  (ocorrencias) => [
    check("ocorrencia_status_check", sql`${ocorrencias.status} in (0, 1)`), // `0` pendente, `1` atendida.
    check(
      "ocorrencia_prioridade_check",
      sql`${ocorrencias.prioridade} in (0, 1, 2, 3)`,
    ), // `0` baixa, `1` média, `2` alta, `3` crítica.
  ],
);

// CREATE TABLE IF NOT EXISTS InsumosOcorrencias (
export const insumos_ocorrencias = sqliteTable(
  "InsumosOcorrencias",
  {
    tipo: integer("tipo").notNull(),
    ocorrencia_id: integer("ocorrencia_id")
      .notNull()
      .references(() => ocorrencias.id),
    insumo_id: integer("insumo_id").references(() => insumos.id),
    ferramenta_id: integer("ferramenta_id").references(() => ferramentas.id),
    quantidade: integer("quantidade").notNull(),
  },
  (insumos_ocorrencias) => [
    primaryKey({
      columns: [
        insumos_ocorrencias.ocorrencia_id,
        insumos_ocorrencias.ferramenta_id,
        insumos_ocorrencias.insumo_id,
      ],
    }),
    check(
      "ocorrencia_insumo_tipo_check",
      sql`${insumos_ocorrencias.tipo} in (0, 1)`,
    ), // `0` insumo, `1` ferramenta
  ],
);
