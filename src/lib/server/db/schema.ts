import {  sql } from "drizzle-orm";
import { sqliteTable, primaryKey, check, integer, text, real } from "drizzle-orm/sqlite-core";

// CREATE TABLE IF NOT EXISTS Usuarios (
export const usuarios = sqliteTable("Usuarios", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nome: text("nome").unique().notNull(),
    admin: integer("admin", { mode: "boolean" }).notNull().default(false),
    gestor: integer("gestor", { mode: "boolean" }).notNull().default(false),
    senha: text("senha").notNull(),
    criado_em: integer("criado_em", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    atualizado_em: integer("atualizado_em", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// CREATE TABLE IF NOT EXISTS Categorias (
export const categorias = sqliteTable("Categorias", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nome: text("nome").unique().notNull(),
});

// CREATE TABLE IF NOT EXISTS TiposFerramentas (
export const tipos_ferramentas = sqliteTable("TiposFerramentas", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nome: text("nome").unique().notNull(),
});

// CREATE TABLE IF NOT EXISTS Insumos (
export const insumos = sqliteTable("Insumos", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cod_fabricacao: text("cod_fabricacao").unique().notNull(),
    cod_interno: text("cod_interno").unique().notNull(),
    nome: text("nome").notNull(),
    observacoes: text("observacoes"),
    foto_path: text("foto_path"),
    material: text("material"),
    ferramenta: integer("ferramenta", { mode: "boolean" }).notNull().default(false),
    tipo: integer("tipo").references(() => tipos_ferramentas.id),
    altura_min: real("altura_min"),
    altura_max: real("altura_max"),
    rpm: real("rpm"),
    avanco_min: real("avanco_min"),
    categoria: integer("categoria").references(() => categorias.id),
    criado_em: integer("criado_em", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    atualizado_em: integer("atualizado_em", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    adicionado_por: integer("adicionado_por").notNull().references(() => usuarios.id),
});

// CREATE TABLE IF NOT EXISTS InsumosFerramentas (
export const insumos_ferramentas = sqliteTable("InsumosFerramentas", {
    insumo_id: integer("insumo_id").notNull().references(() => insumos.id),
    ferramenta_id: integer("ferramenta_id").notNull().references(() => insumos.id),
    quantidade: integer("quantidade").notNull(),
}, (insumos_ferramentas) => [
    primaryKey({ columns: [insumos_ferramentas.insumo_id, insumos_ferramentas.ferramenta_id] })
]);

// CREATE TABLE IF NOT EXISTS Maquinas (
export const maquinas = sqliteTable("Maquinas", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nome: text("nome").unique().notNull(),
});

// CREATE TABLE IF NOT EXISTS InsumosMaquinas (
export const insumos_maquinas = sqliteTable("InsumosMaquinas", {
    insumo_id: integer("insumo_id").notNull().references(() => insumos.id),
    maquina_id: integer("maquina_id").notNull().references(() => maquinas.id),
}, (insumos_maquinas) => [
        primaryKey({ columns: [insumos_maquinas.insumo_id, insumos_maquinas.maquina_id] })
]);

// CREATE TABLE IF NOT EXISTS Ocorrencias (
export const ocorrencias = sqliteTable("Ocorrencias", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    status: integer("status").notNull(),
    prioridade: integer("prioridade").notNull(),
    data: integer("data", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    solicitante: text("solicitante").notNull(),
    justificativa: text("justificativa").notNull(),
    aprovado_por: integer("aprovador_por").references(() => usuarios.id),
    data_aprovacao: integer("data_aprovacao", { mode: "timestamp" }),
    observacao: text("observacao"),
    maquina: integer("maquina").notNull().references(() => maquinas.id)
}, (ocorrencias) => [
    check("status_check", sql`${ocorrencias.status} in (0, 1)`),
    check("prioridade_check", sql`${ocorrencias.prioridade} in (0, 1, 2, 3)`),
]);

// CREATE TABLE IF NOT EXISTS InsumosOcorrencias (
export const insumos_ocorrencias = sqliteTable("InsumosOcorrencias", {
    insumo_id: integer("insumo_id").notNull().references(() => insumos.id),
    ocorrencia_id: integer("ocorrencia_id").notNull().references(() => ocorrencias.id),
    quantidade: integer("quantidade").notNull(),
}, (insumos_ocorrencias) => [
    primaryKey({ columns: [insumos_ocorrencias.insumo_id, insumos_ocorrencias.ocorrencia_id] })
]);
