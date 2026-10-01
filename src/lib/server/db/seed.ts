/*
 *  Script by claude.ai :)
 *  Não revisei direito. Erros são esperados...
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { seed } from "drizzle-seed";
import * as schema from "./schema";

const sqlite = new Database(process.env.DB_PATH!);
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

const normalize_search_string = (query: string) => {
  return query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  const val = Math.random() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(val * factor) / factor;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

/** Amostra `n` elementos distintos de `arr` (sem repetição). */
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  const count = Math.min(n, copy.length);
  for (let i = 0; i < count; i++) {
    const idx = randomInt(0, copy.length - 1);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
}

function chance(p: number): boolean {
  return Math.random() < p;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Escolha aleatória ponderada. `options` é uma lista de [peso, valor]. */
function weightedPick<T>(options: [number, T][]): T {
  const total = options.reduce((sum, [w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [w, v] of options) {
    if (r < w) return v;
    r -= w;
  }
  return options[options.length - 1][1];
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/** Insere em lotes dentro de uma transação síncrona (rápido e seguro para o limite de parâmetros do SQLite). */
function insertInBatches<T extends Record<string, unknown>>(
  table: any,
  rows: T[],
  batchSize: number,
) {
  db.transaction((tx) => {
    for (const batch of chunk(rows, batchSize)) {
      tx.insert(table).values(batch).run();
    }
  });
}

function fotoPathPadrao(): string {
  return `${process.env.DATA_PATH?.replace("./", "/")}/uploads/teste.png`;
}

/** Quantas versões (cadastros) um item terá: a grande maioria tem só a 1. */
function decidirNumeroVersoes(): number {
  return weightedPick<number>([
    [0.9, 1],
    [0.08, 2],
    [0.02, 3],
  ]);
}

/**
 * Decide, para um item com `numVersoes` versões, quais delas ficam `obsoleto`.
 * Retorna um array de flags indexado por (versao - 1).
 *
 * Regra geral: só a versão mais recente fica ativa. Casos raros previstos:
 *  - mais de uma versão ativa ao mesmo tempo (uso incomum, mas válido);
 *  - item descontinuado por completo, nem a última versão está ativa.
 */
function decidirObsolescencia(numVersoes: number): boolean[] {
  if (numVersoes === 1) {
    return [chance(0.08)]; // item avulso, sem histórico de revisão, raramente obsoleto
  }

  const flags = new Array(numVersoes).fill(true);
  flags[numVersoes - 1] = false; // versão mais recente ativa, por padrão

  if (chance(0.1)) {
    // caso raro: uma versão anterior também continua ativa
    const idxExtra = randomInt(0, numVersoes - 2);
    flags[idxExtra] = false;
  }

  if (chance(0.03)) {
    // caso bem raro: item descontinuado por completo
    flags[numVersoes - 1] = true;
  }

  return flags;
}

// ---------------------------------------------------------------------------
// Listas curadas (para dar variedade sem depender só de lorem ipsum)
// ---------------------------------------------------------------------------

const LOREM_PALAVRAS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
];

function loremFrase(minPalavras: number, maxPalavras: number): string {
  const n = randomInt(minPalavras, maxPalavras);
  const frase = Array.from({ length: n }, () => pick(LOREM_PALAVRAS)).join(" ");
  return frase.charAt(0).toUpperCase() + frase.slice(1) + ".";
}

function codigoFabricacao(): string {
  return `FAB-${String(randomInt(0, 99999)).padStart(5, "0")}`;
}

const NOMES = [
  "Carlos",
  "Ana",
  "João",
  "Mariana",
  "Pedro",
  "Fernanda",
  "Lucas",
  "Camila",
  "Rafael",
  "Juliana",
  "Bruno",
  "Patrícia",
  "Diego",
  "Larissa",
  "Eduardo",
  "Beatriz",
  "Thiago",
  "Amanda",
  "Gustavo",
  "Vanessa",
  "Rodrigo",
  "Priscila",
];

const SOBRENOMES = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Pereira",
  "Costa",
  "Rodrigues",
  "Almeida",
  "Nascimento",
  "Lima",
  "Araújo",
  "Fernandes",
  "Carvalho",
  "Gomes",
  "Martins",
];

const CATEGORIAS_INSUMOS = [
  "Parafusos",
  "Porcas",
  "Arruelas",
  "Lubrificantes",
  "Abrasivos",
  "Adesivos",
  "Vedantes",
  "Correias",
  "Rolamentos",
  "Filtros",
  "Mangueiras",
  "Conectores Elétricos",
  "Fitas Industriais",
  "Consumíveis de Solda",
  "EPI",
];

const TIPOS_FERRAMENTAS = [
  "Fresa de Topo",
  "Broca Helicoidal",
  "Macho de Roscar",
  "Alargador",
  "Rebolo",
  "Inserto de Torneamento",
  "Broca Escalonada",
  "Escareador",
  "Bailarina",
  "Fresa de Faceamento",
];

const CELULAS_NOMES = [
  "Célula de Usinagem 1",
  "Célula de Usinagem 2",
  "Célula de Montagem",
  "Célula de Solda",
  "Célula de Acabamento",
];

const MAQUINAS_NOMES = [
  "Torno CNC 01",
  "Torno CNC 02",
  "Fresadora Vertical 01",
  "Fresadora Vertical 02",
  "Centro de Usinagem 01",
  "Centro de Usinagem 02",
  "Retífica Cilíndrica 01",
  "Retífica Cilíndrica 02",
  "Furadeira Radial 01",
  "Prensa Hidráulica 01",
];

const MATERIAIS = [
  "Aço Inox 304",
  "Aço Carbono 1045",
  "Alumínio 6061",
  "Latão",
  "Bronze",
  "Nylon",
  "PVC",
  "Borracha Nitrílica",
  "Ferro Fundido",
  "Titânio Grau 5",
];

const JUSTIFICATIVAS = [
  "Máquina apresentou ruído anormal durante operação normal.",
  "Ferramenta com desgaste visível impedindo acabamento adequado.",
  "Parada não programada por falha no sistema hidráulico.",
  "Substituição preventiva conforme plano de manutenção.",
  "Insumo necessário para reposição de estoque mínimo.",
  "Vazamento identificado durante inspeção de rotina.",
  "Ajuste de calibração solicitado pela equipe de qualidade.",
  "Quebra de componente durante ciclo de produção.",
  "Solicitação para atender demanda extra de produção.",
  "Reposição de item consumido no processo de usinagem.",
  "Manutenção corretiva após alarme de superaquecimento.",
  "Troca programada dentro do intervalo de vida útil.",
];

const OBSERVACOES_OCORRENCIA = [
  "Atendido dentro do prazo previsto.",
  "Aguardando peça de fornecedor externo.",
  "Necessário acompanhamento na próxima manutenção.",
  "Sem intercorrências durante o atendimento.",
  "Reincidência do mesmo problema no último trimestre.",
];

async function main() {
  if (process.env.NODE_ENV !== "development") {
    console.error("Ignorando seed em ambiente de produção.");
    return 1;
  }

  // -------------------------------------------------------------------------
  // Fase 1 — Usuário gestor (o admin de id 1 já existe no banco)
  // -------------------------------------------------------------------------

  db.insert(schema.usuarios)
    .values({
      nome: "Gestor Padrão",
      cargo: 0, // gestor
      senha: "$2b$10$K9pQnZbXWvY6H1sJmC0DUuLRzq8eOaN4Tf7Ig2Vy5Xh3Bo1Wl9Cq6", // hash fake, mesmo formato de um bcrypt real
    })
    .run();

  const usuarioIds = db
    .select({ id: schema.usuarios.id })
    .from(schema.usuarios)
    .all()
    .map((r: { id: number }) => r.id);

  // -------------------------------------------------------------------------
  // Fase 2 — Tabelas de apoio simples (drizzle-seed)
  // -------------------------------------------------------------------------

  await seed(db, { categorias_insumos: schema.categorias_insumos }).refine(
    (f) => ({
      categorias_insumos: {
        count: CATEGORIAS_INSUMOS.length,
        columns: {
          nome: f.valuesFromArray({
            values: CATEGORIAS_INSUMOS,
            isUnique: true,
          }),
        },
      },
    }),
  );

  await seed(db, { tipos_ferramentas: schema.tipos_ferramentas }).refine(
    (f) => ({
      tipos_ferramentas: {
        count: TIPOS_FERRAMENTAS.length,
        columns: {
          nome: f.valuesFromArray({
            values: TIPOS_FERRAMENTAS,
            isUnique: true,
          }),
        },
      },
    }),
  );

  // Células e máquinas juntas: relação 1:N via `with`, 2 máquinas por célula = 10 máquinas.
  await seed(db, {
    celulas: schema.celulas,
    maquinas: schema.maquinas,
  }).refine((f) => ({
    celulas: {
      count: CELULAS_NOMES.length,
      columns: {
        nome: f.valuesFromArray({ values: CELULAS_NOMES, isUnique: true }),
      },
      with: {
        maquinas: 2,
      },
    },
    maquinas: {
      columns: {
        nome: f.valuesFromArray({ values: MAQUINAS_NOMES, isUnique: true }),
      },
    },
  }));

  const categoriaIds = db
    .select({ id: schema.categorias_insumos.id })
    .from(schema.categorias_insumos)
    .all()
    .map((r: { id: number }) => r.id);

  const tipoFerramentaIds = db
    .select({ id: schema.tipos_ferramentas.id })
    .from(schema.tipos_ferramentas)
    .all()
    .map((r: { id: number }) => r.id);

  const maquinaIds = db
    .select({ id: schema.maquinas.id })
    .from(schema.maquinas)
    .all()
    .map((r: { id: number }) => r.id);

  // -------------------------------------------------------------------------
  // Fase 3 — Insumos e Ferramentas (MANUAL, não mais drizzle-seed)
  // -------------------------------------------------------------------------
  // `versao` exige que várias linhas compartilhem o mesmo `cod_interno` (uma
  // por revisão do cadastro), e o `phoneNumber` do drizzle-seed é sempre
  // único — não tem como gerar o mesmo código de propósito para duas linhas.
  // Por isso essa fase virou geração manual: cada "item" (cod_interno) recebe
  // de 1 a 3 versões, e cada versão > 1 sempre difere de alguma forma da
  // anterior (garantido, não sorteado).

  const TOTAL_INSUMOS = 1500; // itens distintos, não linhas — cada um pode gerar mais de uma linha (versão)
  const TOTAL_FERRAMENTAS = 1000;

  const insumosRows: (typeof schema.insumos.$inferInsert)[] = [];

  for (let itemIndex = 1; itemIndex <= TOTAL_INSUMOS; itemIndex++) {
    const codInterno = `00${String(itemIndex).padStart(4, "0")}`; // ex.: 001234

    const numVersoes = decidirNumeroVersoes();
    const obsolescencias = decidirObsolescencia(numVersoes);

    // Perfil-base do item, compartilhado entre as versões (ponto de partida).
    const base = {
      nome: loremFrase(3, 8),
      material: weightedPick<string | null>([
        [0.8, pick(MATERIAIS)],
        [0.2, null],
      ]),
      categoriaId: weightedPick<number | null>([
        [0.85, pick(categoriaIds)],
        [0.15, null],
      ]),
      codFabricacao: chance(0.75) ? codigoFabricacao() : null,
      temFoto: chance(0.5),
    };
    const adicionadoPor = pick(usuarioIds);

    let dataVersao = daysAgo(randomInt(180, 1460)); // entre ~6 meses e 4 anos atrás

    for (let v = 1; v <= numVersoes; v++) {
      if (v > 1) {
        const proxima =
          dataVersao.getTime() + randomInt(30, 365) * 24 * 60 * 60 * 1000;
        dataVersao = new Date(
          Math.min(proxima, Date.now() - 24 * 60 * 60 * 1000),
        );
      }

      const ehRevisao = v > 1;
      const nome = ehRevisao ? `${base.nome} (revisão ${v})` : base.nome;
      const observacoes = ehRevisao
        ? `Revisão ${v} do cadastro. ${loremFrase(4, 10)}`
        : chance(0.4)
          ? loremFrase(6, 16)
          : null;

      insumosRows.push({
        cod_interno: codInterno,
        cod_fabricacao: base.codFabricacao,
        // a partir da v2, garante (de forma determinística) que algo mudou
        nome,
        observacoes,
        busca_str: normalize_search_string(
          `${codInterno} ${base.nome} ${observacoes}`,
        ),
        foto_path: base.temFoto ? fotoPathPadrao() : null,
        material: ehRevisao && chance(0.4) ? pick(MATERIAIS) : base.material,
        categoria_id: base.categoriaId,
        adicionado_em: dataVersao,
        adicionado_por: adicionadoPor,
        atualizado_em: dataVersao,
        completo: chance(0.85),
        obsoleto: obsolescencias[v - 1],
        versao: v,
      });
    }
  }

  insertInBatches(schema.insumos, insumosRows, 200);

  const ferramentasRows: (typeof schema.ferramentas.$inferInsert)[] = [];

  for (let itemIndex = 1; itemIndex <= TOTAL_FERRAMENTAS; itemIndex++) {
    const codInterno = `H${String(itemIndex % 1000).padStart(3, "0")}`; // ex.: H042

    const numVersoes = decidirNumeroVersoes();
    const obsolescencias = decidirObsolescencia(numVersoes);

    let alturaMin: number | null = chance(0.7) ? randomFloat(1, 50, 1) : null;
    let alturaMax: number | null = chance(0.7) ? randomFloat(50, 200, 1) : null;
    if (alturaMin !== null && alturaMax !== null && alturaMin > alturaMax) {
      [alturaMin, alturaMax] = [alturaMax, alturaMin];
    }

    const base = {
      nome: loremFrase(3, 8),
      material: weightedPick<string | null>([
        [0.8, pick(MATERIAIS)],
        [0.2, null],
      ]),
      tipoId: weightedPick<number | null>([
        [0.85, pick(tipoFerramentaIds)],
        [0.15, null],
      ]),
      codFabricacao: chance(0.7) ? codigoFabricacao() : null,
      temFoto: chance(0.5),
      alturaMin,
      alturaMax,
      rpm: chance(0.75) ? randomFloat(500, 24000, 0) : null,
      avancoMin: chance(0.75) ? randomFloat(0.01, 5, 2) : null,
    };
    const adicionadoPor = pick(usuarioIds);

    let dataVersao = daysAgo(randomInt(180, 1460));

    for (let v = 1; v <= numVersoes; v++) {
      if (v > 1) {
        const proxima =
          dataVersao.getTime() + randomInt(30, 365) * 24 * 60 * 60 * 1000;
        dataVersao = new Date(
          Math.min(proxima, Date.now() - 24 * 60 * 60 * 1000),
        );
      }

      const ehRevisao = v > 1;
      const nome = ehRevisao ? `${base.nome} (revisão ${v})` : base.nome;
      const observacoes = ehRevisao
        ? `Revisão ${v} do cadastro. ${loremFrase(4, 10)}`
        : chance(0.4)
          ? loremFrase(6, 16)
          : null;

      ferramentasRows.push({
        cod_interno: codInterno,
        cod_fabricacao: base.codFabricacao,
        nome,
        observacoes,
        busca_str: normalize_search_string(
          `${codInterno} ${nome} ${observacoes}`,
        ),
        foto_path: base.temFoto ? fotoPathPadrao() : null,
        material: ehRevisao && chance(0.4) ? pick(MATERIAIS) : base.material,
        tipo_id: base.tipoId,
        // numa revisão, às vezes o próprio ajuste técnico é o que muda
        altura_min:
          ehRevisao && chance(0.3) ? randomFloat(1, 50, 1) : base.alturaMin,
        altura_max:
          ehRevisao && chance(0.3) ? randomFloat(50, 200, 1) : base.alturaMax,
        rpm: base.rpm,
        avanco_min: base.avancoMin,
        adicionado_em: dataVersao,
        adicionado_por: adicionadoPor,
        atualizado_em: dataVersao,
        completo: chance(0.85),
        obsoleto: obsolescencias[v - 1],
        versao: v,
      });
    }
  }

  insertInBatches(schema.ferramentas, ferramentasRows, 200);

  // ids de todas as versões (usados no histórico de ocorrências)
  const insumoIds = db
    .select({ id: schema.insumos.id })
    .from(schema.insumos)
    .all()
    .map((r: { id: number }) => r.id);

  const ferramentaIds = db
    .select({ id: schema.ferramentas.id })
    .from(schema.ferramentas)
    .all()
    .map((r: { id: number }) => r.id);

  // ids só das versões ativas (usados nas associações "atuais": InsumosFerramentas, InsumosMaquinas)
  const insumoIdsAtivos = db
    .select({ id: schema.insumos.id })
    .from(schema.insumos)
    .where(eq(schema.insumos.obsoleto, false))
    .all()
    .map((r: { id: number }) => r.id);

  const ferramentaIdsAtivos = db
    .select({ id: schema.ferramentas.id })
    .from(schema.ferramentas)
    .where(eq(schema.ferramentas.obsoleto, false))
    .all()
    .map((r: { id: number }) => r.id);

  // -------------------------------------------------------------------------
  // Fase 4 — InsumosFerramentas (manual: nem toda ferramenta tem dependências)
  // -------------------------------------------------------------------------
  // Usa só versões ativas: essa tabela representa a composição *atual* de cada ferramenta.

  const ferramentasComInsumos = pickN(
    ferramentaIdsAtivos,
    Math.round(ferramentaIdsAtivos.length * 0.55), // ~55% das ferramentas ativas têm insumos associados
  );

  const paresInsumoFerramenta: { ferramenta_id: number; insumo_id: number }[] =
    [];
  const insumosFerramentasRows: {
    ferramenta_id: number;
    insumo_id: number;
    quantidade: number;
    observacoes: string | null;
  }[] = [];

  for (const ferramenta_id of ferramentasComInsumos) {
    const qtdInsumos = weightedPick<number>([
      [0.5, randomInt(1, 2)],
      [0.35, randomInt(3, 4)],
      [0.15, randomInt(5, 6)],
    ]);
    const insumosEscolhidos = pickN(insumoIdsAtivos, qtdInsumos);

    for (const insumo_id of insumosEscolhidos) {
      insumosFerramentasRows.push({
        ferramenta_id,
        insumo_id,
        quantidade: randomInt(1, 20),
        observacoes: chance(0.2)
          ? "Item crítico para a montagem da ferramenta."
          : null,
      });
      paresInsumoFerramenta.push({ ferramenta_id, insumo_id });
    }
  }

  insertInBatches(schema.insumos_ferramentas, insumosFerramentasRows, 200);

  // -------------------------------------------------------------------------
  // Fase 5 — InsumosMaquinas e FerramentasMaquinas (manual)
  // -------------------------------------------------------------------------
  // Idem: só versões ativas, já que representa o que está de fato em uso nas máquinas hoje.

  const insumosMaquinasRows: { maquina_id: number; insumo_id: number }[] = [];
  const ferramentasMaquinasRows: {
    maquina_id: number;
    ferramenta_id: number;
  }[] = [];

  for (const maquina_id of maquinaIds) {
    for (const insumo_id of pickN(insumoIdsAtivos, randomInt(5, 20))) {
      insumosMaquinasRows.push({ maquina_id, insumo_id });
    }
    for (const ferramenta_id of pickN(ferramentaIdsAtivos, randomInt(5, 15))) {
      ferramentasMaquinasRows.push({ maquina_id, ferramenta_id });
    }
  }

  insertInBatches(schema.insumos_maquinas, insumosMaquinasRows, 200);
  insertInBatches(schema.ferramentas_maquinas, ferramentasMaquinasRows, 200);

  // -------------------------------------------------------------------------
  // Fase 6 — Ocorrencias (manual: status/aprovação precisam ficar coerentes)
  // -------------------------------------------------------------------------

  const TOTAL_OCORRENCIAS = 5000;
  const ocorrenciasRows: {
    status: number;
    prioridade: number;
    data: Date;
    solicitante: string;
    justificativa: string;
    aprovado_por: number | null;
    data_aprovacao: Date | null;
    observacao: string | null;
    maquina_id: number;
  }[] = [];

  for (let i = 0; i < TOTAL_OCORRENCIAS; i++) {
    const status = weightedPick<number>([
      [0.6, 1], // atendida
      [0.4, 0], // pendente
    ]);
    const prioridade = weightedPick<number>([
      [0.3, 0],
      [0.35, 1],
      [0.25, 2],
      [0.1, 3],
    ]);
    const data = daysAgo(randomInt(0, 730));

    let aprovado_por: number | null = null;
    let data_aprovacao: Date | null = null;
    if (status === 1 && chance(0.9)) {
      aprovado_por = pick(usuarioIds);
      data_aprovacao = new Date(
        data.getTime() + randomInt(1, 5) * 24 * 60 * 60 * 1000,
      );
    } else if (status === 0 && chance(0.05)) {
      // caso raro: já aprovada mas ainda pendente de execução
      aprovado_por = pick(usuarioIds);
      data_aprovacao = new Date(
        data.getTime() + randomInt(1, 5) * 24 * 60 * 60 * 1000,
      );
    }

    ocorrenciasRows.push({
      status,
      prioridade,
      data,
      solicitante: `${pick(NOMES)} ${pick(SOBRENOMES)}`,
      justificativa: pick(JUSTIFICATIVAS),
      aprovado_por,
      data_aprovacao,
      observacao: chance(0.5) ? pick(OBSERVACOES_OCORRENCIA) : null,
      maquina_id: pick(maquinaIds),
    });
  }

  insertInBatches(schema.ocorrencias, ocorrenciasRows, 200);

  const ocorrenciaIds = db
    .select({ id: schema.ocorrencias.id })
    .from(schema.ocorrencias)
    .all()
    .map((r: { id: number }) => r.id);

  // -------------------------------------------------------------------------
  // Fase 7 — InsumosOcorrencias (manual: respeita exclusividade e FK composta)
  // -------------------------------------------------------------------------
  // Histórico: pode referenciar qualquer versão (inclusive obsoleta hoje), já
  // que uma ocorrência antiga pode muito bem ter usado uma versão que só
  // depois foi descontinuada.

  const insumosOcorrenciasRows: {
    tipo: number;
    ocorrencia_id: number;
    insumo_id: number | null;
    ferramenta_id: number | null;
    quantidade: number;
  }[] = [];

  for (const ocorrencia_id of ocorrenciaIds) {
    const numItens = weightedPick<number>([
      [0.4, 1],
      [0.35, randomInt(2, 3)],
      [0.2, randomInt(4, 5)],
      [0.05, randomInt(6, 8)],
    ]);

    const insumosUsados = new Set<number>();
    const ferramentasUsadas = new Set<number>();
    const paresUsados = new Set<string>();

    for (let i = 0; i < numItens; i++) {
      // sem pares insumo-ferramenta cadastrados, tipo 2 não é possível
      const tipo = weightedPick<number>([
        [0.5, 0],
        [0.3, 1],
        [paresInsumoFerramenta.length > 0 ? 0.2 : 0, 2],
      ]);

      if (tipo === 0) {
        const candidatos = insumoIds.filter((id) => !insumosUsados.has(id));
        if (candidatos.length === 0) continue;
        const insumo_id = pick(candidatos);
        insumosUsados.add(insumo_id);
        insumosOcorrenciasRows.push({
          tipo: 0,
          ocorrencia_id,
          insumo_id,
          ferramenta_id: null,
          quantidade: randomInt(1, 10),
        });
      } else if (tipo === 1) {
        const candidatos = ferramentaIds.filter(
          (id) => !ferramentasUsadas.has(id),
        );
        if (candidatos.length === 0) continue;
        const ferramenta_id = pick(candidatos);
        ferramentasUsadas.add(ferramenta_id);
        insumosOcorrenciasRows.push({
          tipo: 1,
          ocorrencia_id,
          insumo_id: null,
          ferramenta_id,
          quantidade: randomInt(1, 5),
        });
      } else {
        const candidatos = paresInsumoFerramenta.filter(
          (p) => !paresUsados.has(`${p.insumo_id}-${p.ferramenta_id}`),
        );
        if (candidatos.length === 0) continue;
        const par = pick(candidatos);
        paresUsados.add(`${par.insumo_id}-${par.ferramenta_id}`);
        insumosOcorrenciasRows.push({
          tipo: 2,
          ocorrencia_id,
          insumo_id: par.insumo_id,
          ferramenta_id: par.ferramenta_id,
          quantidade: randomInt(1, 10),
        });
      }
    }
  }

  insertInBatches(schema.insumos_ocorrencias, insumosOcorrenciasRows, 150);

  console.log("Seeding concluído:");
  console.log(`  usuarios: +1 gestor`);
  console.log(`  categorias_insumos: ${CATEGORIAS_INSUMOS.length}`);
  console.log(`  tipos_ferramentas: ${TIPOS_FERRAMENTAS.length}`);
  console.log(`  celulas: ${CELULAS_NOMES.length}`);
  console.log(`  maquinas: ${maquinaIds.length}`);
  console.log(
    `  insumos: ${insumoIds.length} linhas (${TOTAL_INSUMOS} itens distintos)`,
  );
  console.log(
    `  ferramentas: ${ferramentaIds.length} linhas (${TOTAL_FERRAMENTAS} itens distintos)`,
  );
  console.log(`  insumos_ferramentas: ${insumosFerramentasRows.length}`);
  console.log(`  insumos_maquinas: ${insumosMaquinasRows.length}`);
  console.log(`  ferramentas_maquinas: ${ferramentasMaquinasRows.length}`);
  console.log(`  ocorrencias: ${ocorrenciasRows.length}`);
  console.log(`  insumos_ocorrencias: ${insumosOcorrenciasRows.length}`);
}

main()
  .then(() => {
    sqlite.close();
  })
  .catch((err) => {
    console.error(err);
    sqlite.close();
    process.exit(1);
  });
