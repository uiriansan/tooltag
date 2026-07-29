/*
 *  Script by claude.ai :)
 *  Não revisei direito. Erros são esperados...
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { seed } from "drizzle-seed";
import * as schema from "./schema";

const sqlite = new Database(process.env.DB_PATH!);
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

// ---------------------------------------------------------------------------
// Listas curadas (para dar variedade sem depender só de lorem ipsum)
// ---------------------------------------------------------------------------

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
  // -------------------------------------------------------------------------
  // Fase 1 — Usuário gestor (o admin de id 1 já existe no banco)
  // -------------------------------------------------------------------------
  if (process.env.NODE_ENV !== "development") {
    console.error("Ignorando seed em ambiente de produção.");
    return 1;
  }

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
  // Fase 3 — Insumos e Ferramentas (drizzle-seed)
  // -------------------------------------------------------------------------

  const TOTAL_INSUMOS = 1500;
  const TOTAL_FERRAMENTAS = 1000;

  await seed(db, { insumos: schema.insumos }).refine((f) => ({
    insumos: {
      count: TOTAL_INSUMOS,
      columns: {
        // "00" + 4 dígitos, ex.: 001234. `phoneNumber` já é sempre único por padrão
        // (não aceita a opção `isUnique`), e 10.000 combinações são de sobra para 1.500 linhas.
        cod_interno: f.phoneNumber({ template: "00####" }),
        cod_fabricacao: f.weightedRandom([
          { weight: 0.75, value: f.phoneNumber({ template: "FAB-#####" }) },
          { weight: 0.25, value: f.default({ defaultValue: null }) },
        ]),
        nome: f.loremIpsum({ sentencesCount: 1 }),
        observacoes: f.weightedRandom([
          { weight: 0.4, value: f.loremIpsum({ sentencesCount: 2 }) },
          { weight: 0.6, value: f.default({ defaultValue: null }) },
        ]),
        foto_path: f.weightedRandom([
          {
            weight: 0.5,
            value: f.default({
              defaultValue: `${process.env.DATA_PATH?.replace("./", "/")}/uploads/teste.png`,
            }),
          },
          { weight: 0.5, value: f.default({ defaultValue: null }) },
        ]),
        material: f.weightedRandom([
          { weight: 0.8, value: f.valuesFromArray({ values: MATERIAIS }) },
          { weight: 0.2, value: f.default({ defaultValue: null }) },
        ]),
        categoria_id: f.weightedRandom([
          { weight: 0.85, value: f.valuesFromArray({ values: categoriaIds }) },
          { weight: 0.15, value: f.default({ defaultValue: null }) },
        ]),
        adicionado_em: f.date({ minDate: "2022-01-01", maxDate: "2026-07-01" }),
        adicionado_por: f.valuesFromArray({ values: usuarioIds }),
        atualizado_em: f.date({ minDate: "2025-01-01", maxDate: "2026-07-26" }),
        completo: f.weightedRandom([
          { weight: 0.85, value: f.default({ defaultValue: true }) },
          { weight: 0.15, value: f.default({ defaultValue: false }) },
        ]),
        obsoleto: f.weightedRandom([
          { weight: 0.92, value: f.default({ defaultValue: false }) },
          { weight: 0.08, value: f.default({ defaultValue: true }) },
        ]),
        obsoleto_substituto: f.default({ defaultValue: null }),
      },
    },
  }));

  await seed(db, { ferramentas: schema.ferramentas }).refine((f) => ({
    ferramentas: {
      count: TOTAL_FERRAMENTAS,
      columns: {
        // template exigido: "H-###" (1.000 combinações para 1.000 linhas — cabe certinho).
        // `phoneNumber` já é sempre único por padrão, não aceita `isUnique`.
        cod_interno: f.phoneNumber({ template: "H###" }),
        cod_fabricacao: f.weightedRandom([
          { weight: 0.7, value: f.phoneNumber({ template: "FAB-#####" }) },
          { weight: 0.3, value: f.default({ defaultValue: null }) },
        ]),
        nome: f.loremIpsum({ sentencesCount: 1 }),
        observacoes: f.weightedRandom([
          { weight: 0.4, value: f.loremIpsum({ sentencesCount: 2 }) },
          { weight: 0.6, value: f.default({ defaultValue: null }) },
        ]),
        foto_path: f.weightedRandom([
          {
            weight: 0.5,
            value: f.default({
              defaultValue: `${process.env.DATA_PATH?.replace("./", "/")}/uploads/teste.png`,
            }),
          },
          { weight: 0.5, value: f.default({ defaultValue: null }) },
        ]),
        material: f.weightedRandom([
          { weight: 0.8, value: f.valuesFromArray({ values: MATERIAIS }) },
          { weight: 0.2, value: f.default({ defaultValue: null }) },
        ]),
        tipo_id: f.weightedRandom([
          {
            weight: 0.85,
            value: f.valuesFromArray({ values: tipoFerramentaIds }),
          },
          { weight: 0.15, value: f.default({ defaultValue: null }) },
        ]),
        altura_min: f.weightedRandom([
          {
            weight: 0.7,
            value: f.number({ minValue: 1, maxValue: 50, precision: 10 }),
          },
          { weight: 0.3, value: f.default({ defaultValue: null }) },
        ]),
        altura_max: f.weightedRandom([
          {
            weight: 0.7,
            value: f.number({ minValue: 50, maxValue: 200, precision: 10 }),
          },
          { weight: 0.3, value: f.default({ defaultValue: null }) },
        ]),
        rpm: f.weightedRandom([
          {
            weight: 0.75,
            value: f.number({ minValue: 500, maxValue: 24000, precision: 1 }),
          },
          { weight: 0.25, value: f.default({ defaultValue: null }) },
        ]),
        avanco_min: f.weightedRandom([
          {
            weight: 0.75,
            value: f.number({ minValue: 0.01, maxValue: 5, precision: 100 }),
          },
          { weight: 0.25, value: f.default({ defaultValue: null }) },
        ]),
        adicionado_em: f.date({ minDate: "2022-01-01", maxDate: "2026-07-01" }),
        adicionado_por: f.valuesFromArray({ values: usuarioIds }),
        atualizado_em: f.date({ minDate: "2025-01-01", maxDate: "2026-07-26" }),
        completo: f.weightedRandom([
          { weight: 0.85, value: f.default({ defaultValue: true }) },
          { weight: 0.15, value: f.default({ defaultValue: false }) },
        ]),
        obsoleto: f.weightedRandom([
          { weight: 0.92, value: f.default({ defaultValue: false }) },
          { weight: 0.08, value: f.default({ defaultValue: true }) },
        ]),
        obsoleto_substituto: f.default({ defaultValue: null }),
      },
    },
  }));

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

  // altura_min/altura_max foram gerados independentes; conserta os casos em que ficaram invertidos.
  sqlite
    .prepare(
      `UPDATE Ferramentas
       SET altura_min = altura_max, altura_max = altura_min
       WHERE altura_min IS NOT NULL AND altura_max IS NOT NULL AND altura_min > altura_max`,
    )
    .run();

  // obsoleto_substituto: para ~metade dos itens marcados como obsoletos, aponta para outro item ativo.
  const patchObsolescencia = (
    table: "Insumos" | "Ferramentas",
    ids: number[],
  ) => {
    const obsoletos = sqlite
      .prepare(`SELECT id FROM ${table} WHERE obsoleto = 1`)
      .all() as { id: number }[];

    const stmt = sqlite.prepare(
      `UPDATE ${table} SET obsoleto_substituto = ? WHERE id = ?`,
    );
    db.transaction(() => {
      for (const { id } of obsoletos) {
        if (!chance(0.5)) continue;
        const candidato = pick(ids.filter((otherId) => otherId !== id));
        stmt.run(candidato, id);
      }
    });
  };
  patchObsolescencia("Insumos", insumoIds);
  patchObsolescencia("Ferramentas", ferramentaIds);

  // -------------------------------------------------------------------------
  // Fase 4 — InsumosFerramentas (manual: nem toda ferramenta tem dependências)
  // -------------------------------------------------------------------------

  const ferramentasComInsumos = pickN(
    ferramentaIds,
    Math.round(ferramentaIds.length * 0.55), // ~55% das ferramentas têm insumos associados
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
    const insumosEscolhidos = pickN(insumoIds, qtdInsumos);

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

  const insumosMaquinasRows: { maquina_id: number; insumo_id: number }[] = [];
  const ferramentasMaquinasRows: {
    maquina_id: number;
    ferramenta_id: number;
  }[] = [];

  for (const maquina_id of maquinaIds) {
    for (const insumo_id of pickN(insumoIds, randomInt(5, 20))) {
      insumosMaquinasRows.push({ maquina_id, insumo_id });
    }
    for (const ferramenta_id of pickN(ferramentaIds, randomInt(5, 15))) {
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
  console.log(`  insumos: ${insumoIds.length}`);
  console.log(`  ferramentas: ${ferramentaIds.length}`);
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
