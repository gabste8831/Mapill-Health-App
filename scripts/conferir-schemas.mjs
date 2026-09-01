/**
 * Confere se o SQLite local e o schema do Supabase falam a mesma língua.
 *
 * **Por que existe.** O SQLite não remove coluna, e a regra do projeto é que migration publicada
 * não se edita — então toda coluna substituída fica na tabela local para sempre. O push envia a
 * linha inteira, e uma única coluna que o servidor não conhece faz o PostgREST recusar o lote:
 * uma coluna morta há semanas bloqueia a sincronização inteira do usuário.
 *
 * Foi o que aconteceu na validação de 01/09, com `emergency_contact_name` (substituída pela lista
 * `emergency_contacts` na migration 005, três semanas antes). O erro só apareceu no aparelho, e só
 * na primeira tabela — as três órfãs de `appointments` seriam a falha seguinte.
 *
 * Este script antecipa isso: cria o banco de verdade em memória, aplica todas as migrações na
 * ordem e compara coluna a coluna com `docs/supabase-schema.sql`.
 *
 * Rodar após criar migration nova ou mexer no schema remoto:
 *
 *     node scripts/conferir-schemas.mjs
 */

import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR_MIGRACOES = join(RAIZ, "src/data/local/migrations");

/** Tabelas que sobem e descem — espelha `TABELAS_SINCRONIZAVEIS`. */
const SINCRONIZAVEIS = [
  "patient_profiles",
  "consent_records",
  "medications",
  "appointments",
  "prescriptions",
  "inventory_items",
  "dose_schedules",
  "inventory_adjustments",
  "intake_logs",
];

/** Espelha `COLUNAS_LOCAIS` e `COLUNAS_ORFAS` de `tabelas-sincronizaveis.ts`. */
const COLUNAS_LOCAIS = ["synced_at"];
const COLUNAS_ORFAS = {
  patient_profiles: [
    "emergency_contact_name",
    "emergency_contact_phone",
    "emergency_contact_relationship",
  ],
  appointments: ["prescription_photo_uri", "prescription_valid_until", "photo_sync_opt_out"],
};

function aplicarMigracoes() {
  const arquivos = readdirSync(DIR_MIGRACOES)
    .filter((nome) => /^\d{3}-/.test(nome))
    .sort();

  const db = new DatabaseSync(":memory:");
  for (const arquivo of arquivos) {
    const conteudo = readFileSync(join(DIR_MIGRACOES, arquivo), "utf8");
    const sql = conteudo.match(/=\s*`([\s\S]*?)`;/);
    if (sql === null) continue;
    db.exec(sql[1]);
  }
  return { db, total: arquivos.length };
}

function lerSchemaRemoto() {
  const sql = readFileSync(join(RAIZ, "docs/supabase-schema.sql"), "utf8");
  const tabelas = {};
  const blocos = sql.matchAll(/create table if not exists public\.(\w+)\s*\(([\s\S]*?)\n\);/g);

  for (const [, tabela, corpo] of blocos) {
    const colunas = new Set();
    for (const linha of corpo.split("\n")) {
      const limpa = linha.trim();
      if (limpa === "" || limpa.startsWith("--")) continue;
      const nome = limpa.match(/^(\w+)\s/);
      const palavrasChave = ["primary", "unique", "constraint", "foreign", "check"];
      if (nome !== null && !palavrasChave.includes(nome[1].toLowerCase())) {
        colunas.add(nome[1]);
      }
    }
    tabelas[tabela] = colunas;
  }
  return tabelas;
}

const { db, total } = aplicarMigracoes();
const remoto = lerSchemaRemoto();
console.log(`${total} migrações aplicadas.\n`);

let problemas = 0;

for (const tabela of SINCRONIZAVEIS) {
  const local = db
    .prepare(`PRAGMA table_info(${tabela})`)
    .all()
    .map((coluna) => coluna.name);
  const servidor = remoto[tabela];

  if (servidor === undefined) {
    console.log(`FALHA  ${tabela}: não existe em supabase-schema.sql`);
    problemas++;
    continue;
  }

  const ignoradas = [...COLUNAS_LOCAIS, ...(COLUNAS_ORFAS[tabela] ?? [])];
  const quebram = local.filter((c) => !servidor.has(c) && !ignoradas.includes(c));

  if (quebram.length > 0) {
    console.log(`FALHA  ${tabela}: o push quebraria em → ${quebram.join(", ")}`);
    console.log(`       (declare em COLUNAS_ORFAS, ou acrescente a coluna no schema remoto)`);
    problemas++;
  } else {
    console.log(`PASSA  ${tabela}`);
  }

  const soNoServidor = [...servidor].filter((c) => c !== "user_id" && !local.includes(c));
  if (soNoServidor.length > 0) {
    console.log(`       (só no servidor, sem efeito: ${soNoServidor.join(", ")})`);
  }
}

console.log(`\n${problemas} tabela(s) com problema.`);
process.exit(problemas === 0 ? 0 : 1);
