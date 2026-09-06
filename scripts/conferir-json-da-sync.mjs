/**
 * Confere a travessia das colunas JSON entre o SQLite e o Postgres.
 *
 * O app guarda alergias, contatos, posologia e instruções como **texto** serializado numa coluna
 * `TEXT`; no Supabase as mesmas colunas são `jsonb`. Sem conversão nas duas pontas o dado se perde
 * de dois jeitos diferentes, e nenhum deles dá erro visível:
 *
 *   - Subindo, a string vira **duplo encoding**: o Postgres guarda `"[\"Dipirona\"]"` — a string —
 *     em vez do array.
 *   - Descendo, o `jsonb` volta como array de verdade, e o expo-sqlite não aceita objeto como
 *     parâmetro: a linha falha ou grava algo que o `JSON.parse` do repositório não lê.
 *
 * Foi assim que as alergias sumiram no primeiro teste de restauração (06/09).
 *
 * As duas funções são copiadas aqui de propósito: `sync-service.ts` importa `expo-sqlite` e
 * `react-native`, que não existem no Node. O que se verifica é a **regra**, e ela cabe em vinte
 * linhas — a alternativa seria extrair um módulo só para permitir o teste, o que espalharia a
 * lógica em vez de protegê-la.
 */
import assert from "node:assert/strict";

const COLUNAS_JSON = ["allergies", "emergency_contacts", "schedule", "intake_instructions"];
const COLUNAS_DE_DATA = ["updated_at", "deleted_at"];

function interpretarJson(texto) {
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

/** SQLite → Postgres. */
function paraRemoto(linha) {
  const saida = {};
  for (const [coluna, valor] of Object.entries(linha)) {
    if (valor === "" && COLUNAS_DE_DATA.includes(coluna)) {
      saida[coluna] = null;
      continue;
    }
    if (COLUNAS_JSON.includes(coluna) && typeof valor === "string") {
      saida[coluna] = interpretarJson(valor);
      continue;
    }
    saida[coluna] = valor;
  }
  return saida;
}

/** Postgres → SQLite. */
function paraLocal(linha) {
  const saida = {};
  for (const [coluna, valor] of Object.entries(linha)) {
    if (coluna === "user_id") continue;
    if (valor instanceof Date) {
      saida[coluna] = valor.toISOString();
      continue;
    }
    if (valor !== null && typeof valor === "object") {
      saida[coluna] = JSON.stringify(valor);
      continue;
    }
    saida[coluna] = valor;
  }
  return saida;
}

let passos = 0;
function confere(descricao, executar) {
  executar();
  passos += 1;
  console.log(`  ok  ${descricao}`);
}

console.log("\ncolunas JSON na sincronização");

confere("subindo: a string de alergias vira array de verdade", () => {
  const { allergies } = paraRemoto({ allergies: '["Dipirona","Látex"]' });
  assert.deepEqual(allergies, ["Dipirona", "Látex"]);
  assert.equal(typeof allergies, "object", "string aqui produziria duplo encoding no jsonb");
});

confere("descendo: o array volta a ser texto para o SQLite", () => {
  const { allergies } = paraLocal({ allergies: ["Dipirona", "Látex"] });
  assert.equal(typeof allergies, "string", "objeto não é parâmetro válido no expo-sqlite");
  assert.deepEqual(JSON.parse(allergies), ["Dipirona", "Látex"]);
});

confere("a ida e a volta preservam o valor", () => {
  const original = '[{"name":"Ana","phone":"48999","relationship":"filha"}]';
  const noServidor = paraRemoto({ emergency_contacts: original }).emergency_contacts;
  const deVolta = paraLocal({ emergency_contacts: noServidor }).emergency_contacts;
  assert.deepEqual(JSON.parse(deVolta), JSON.parse(original));
});

confere("a posologia atravessa como objeto, não só listas", () => {
  const schedule = '{"kind":"daily","times":["08:00","20:00"]}';
  const noServidor = paraRemoto({ schedule }).schedule;
  assert.equal(noServidor.kind, "daily");
  const deVolta = paraLocal({ schedule: noServidor }).schedule;
  assert.deepEqual(JSON.parse(deVolta), JSON.parse(schedule));
});

confere("lista vazia sobrevive à travessia", () => {
  const noServidor = paraRemoto({ allergies: "[]" }).allergies;
  assert.deepEqual(noServidor, []);
  assert.equal(paraLocal({ allergies: noServidor }).allergies, "[]");
});

confere("texto que não é JSON válido não derruba a sincronização", () => {
  // Linha antiga, gravada antes de a coluna ser serializada. Perder uma é melhor que perder todas.
  const { allergies } = paraRemoto({ allergies: "Dipirona" });
  assert.equal(allergies, "Dipirona");
});

confere("coluna de texto comum não é tocada", () => {
  const { full_name } = paraRemoto({ full_name: '{"isto":"não é json de verdade"}' });
  assert.equal(full_name, '{"isto":"não é json de verdade"}', "só as colunas JSON são convertidas");
});

confere("null atravessa como null, e não como a string 'null'", () => {
  assert.equal(paraLocal({ notes: null }).notes, null);
  assert.equal(paraRemoto({ notes: null }).notes, null);
});

confere("data vazia vira null no Postgres", () => {
  assert.equal(paraRemoto({ deleted_at: "" }).deleted_at, null);
});

confere("user_id não desce para o aparelho", () => {
  assert.equal("user_id" in paraLocal({ user_id: "abc", full_name: "Ana" }), false);
});

console.log(`\n${passos} verificações passaram.\n`);
