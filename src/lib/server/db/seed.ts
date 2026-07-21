import Database from "better-sqlite3";
import { seed, reset } from "drizzle-seed";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { insumos, ocorrencias } from "./schema";

async function main() {
  const sqlite = new Database(process.env.DB_PATH!);
  const db = drizzle(sqlite);

  const insumos_c = await db.select().from(schema.insumos).limit(1);

  if (insumos_c.length == 0) {
    await db
      .insert(schema.categorias)
      .values([
        { nome: "Metal Duro" },
        { nome: "HSS" },
        { nome: "Broca" },
        { nome: "Fresa" },
        { nome: "Rosca" },
        { nome: "Acabamento" },
        { nome: "Desbaste" },
      ]);

    await db
      .insert(schema.tipos_ferramentas)
      .values([
        { nome: "Broca" },
        { nome: "Fresa de Topo" },
        { nome: "Fresa Esférica" },
        { nome: "Pastilha" },
        { nome: "Escareador" },
      ]);

    await db
      .insert(schema.maquinas)
      .values([
        { nome: "Haas VF-2" },
        { nome: "Haas VF-3" },
        { nome: "Romi D600" },
        { nome: "Mazak VCN530" },
        { nome: "Okuma GENOS" },
        { nome: "DMG Mori CMX1100" },
      ]);

    await seed(db, {
      insumos,
      ocorrencias,
    }).refine((funcs) => ({
      insumos: {
        count: 1000,
        columns: {
          cod_fabricacao: funcs.string({
            isUnique: true,
          }),
          cod_interno: funcs.phoneNumber({
            prefixes: [
              "A-",
              "B-",
              "C-",
              "D-",
              "E-",
              "F-",
              "G-",
              "H-",
              "I-",
              "J-",
              "K-",
              "L-",
              "M-",
              "N-",
              "O-",
              "P-",
              "Q-",
              "R-",
              "S-",
              "T-",
              "U-",
              "V-",
              "W-",
              "X-",
              "Y-",
              "Z-",
            ],
            generatedDigitsNumbers: 3,
          }),
          nome: funcs.loremIpsum(),
          material: funcs.valuesFromArray({
            values: [
              "Aço SAE 1020",
              "Alumínio 6061",
              "Inox 304",
              "Latão",
              "Bronze",
            ],
          }),
          ferramenta: funcs.weightedRandom([
            { weight: 0.2, value: funcs.boolean() },
            { weight: 0.8, value: funcs.boolean() },
          ]),
          foto: funcs.valuesFromArray({
            values: [undefined, undefined, undefined, undefined, "teste.png"],
          }),
          tipo: funcs.int({
            minValue: 1,
            maxValue: 5,
          }),
          categoria: funcs.int({
            minValue: 1,
            maxValue: 6,
          }),
          altura_min: funcs.number({
            minValue: 1,
            maxValue: 20,
            precision: 2,
          }),
          altura_max: funcs.number({
            minValue: 20,
            maxValue: 100,
            precision: 2,
          }),
          rpm: funcs.number({
            minValue: 1000,
            maxValue: 20000,
          }),
          avanco_min: funcs.number({
            minValue: 50,
            maxValue: 1000,
          }),
          adicionado_por: funcs.default({
            defaultValue: 1,
          }),
          completo: funcs.weightedRandom([
            { weight: 0.3, value: funcs.boolean() },
            { weight: 0.7, value: funcs.boolean() },
          ]),
        },
      },
      ocorrencias: {
        count: 500,
        columns: {
          status: funcs.int({
            minValue: 0,
            maxValue: 1,
          }),
          prioridade: funcs.int({
            minValue: 0,
            maxValue: 3,
          }),
          solicitante: funcs.fullName(),
          justificativa: funcs.loremIpsum(),
          maquina: funcs.int({
            minValue: 1,
            maxValue: 5,
          }),
        },
      },
    }));

    const allInsumos = await db.select().from(insumos);

    const ferramentas = allInsumos.filter((i) => i.ferramenta);
    const materiais = allInsumos.filter((i) => !i.ferramenta);

    for (const item of allInsumos) {
      await db.insert(schema.insumos_maquinas).values({
        insumo_id: item.id,
        maquina_id: (item.id % 6) + 1,
      });

      if (item.id % 3 === 0) {
        await db.insert(schema.insumos_maquinas).values({
          insumo_id: item.id,
          maquina_id: ((item.id + 2) % 6) + 1,
        });
      }
    }

    for (const material of materiais.slice(0, 150)) {
      const ferramenta = ferramentas[material.id % ferramentas.length];

      await db.insert(schema.insumos_ferramentas).values({
        insumo_id: material.id,
        ferramenta_id: ferramenta.id,
        quantidade: (material.id % 5) + 1,
      });
    }

    const allOcorrencias = await db.select().from(ocorrencias);

    for (const ocorrencia of allOcorrencias) {
      await db.insert(schema.insumos_ocorrencias).values({
        ocorrencia_id: ocorrencia.id,
        insumo_id: materiais[ocorrencia.id % materiais.length].id,
        quantidade: (ocorrencia.id % 4) + 1,
        ferramenta_ref:
          Math.random() < 0.3
            ? ferramentas[Math.floor(Math.random() * ferramentas.length)].id
            : null,
      });
    }

    console.log("Seed concluído");
    process.exit(0);
  } else {
    console.log("Banco de dados já populado. Cancelando seeding...");
    process.exit(1);
  }
}

main();
