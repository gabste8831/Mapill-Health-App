/**
 * Confere a normalização dos nomes vindos da CMED.
 *
 * **Por que existe.** A base da Anvisa entrega tudo em maiúsculas, e o app capitaliza só na
 * exibição — o dado gravado continua sendo o que o órgão publicou, porque a busca por EAN depende
 * dele e alterá-lo apagaria a rastreabilidade da fonte.
 *
 * O risco de uma função assim é **trocar o nome de um remédio por engano**: transformar "AAS" em
 * "Aas" muda o que a pessoa lê na caixa. São regras de string puras, então rodam em Node.
 *
 *     node scripts/conferir-rotulos-cmed.mjs
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const raiz = path.resolve(import.meta.dirname, "..");
const saida = mkdtempSync(path.join(tmpdir(), "mapill-rotulos-"));

let ok = 0;
let falhou = 0;
const checar = (nome, cond, detalhe) => {
  if (cond) ok += 1;
  else {
    falhou += 1;
    console.log(`FALHA  ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  }
};

try {
  // Só as funções puras: o arquivo inteiro importa entidades do domínio, e aqui elas não fazem
  // falta — o que se verifica é transformação de string.
  const fonte = readFileSync(path.join(raiz, "src/shared/rotulos-de-medicamento.ts"), "utf8");
  const puro = fonte.slice(fonte.indexOf("const PALAVRAS_MINUSCULAS")).replace(/export function/g, "function");
  const arquivo = path.join(saida, "rotulos.ts");
  writeFileSync(arquivo, `${puro}\nexport { capitalizarNome, resumirSubstancia };\n`);

  execFileSync("npx", ["tsc", "--ignoreConfig", arquivo, "--outDir", saida, "--module", "esnext",
    "--target", "es2022", "--skipLibCheck"], { cwd: raiz, stdio: "pipe", shell: process.platform === "win32" });

  const { capitalizarNome, resumirSubstancia } = await import(
    pathToFileURL(path.join(saida, "rotulos.js")).href
  );

  // Casos reais da base, incluindo os que uma heurística ingênua erraria.
  for (const [entrada, esperado] of [
    ["A SAÚDE DA MULHER", "A Saúde da Mulher"],
    ["DIPIRONA SÓDICA", "Dipirona Sódica"],
    ["ÁCIDO ACETILSALICÍLICO", "Ácido Acetilsalicílico"],
    ["NEO-QUIMICA", "Neo-Quimica"],
    // Siglas continuam em caixa alta: "Aas" seria outro remédio aos olhos de quem lê a caixa.
    ["AAS", "AAS"],
    ["AAS PROTECT", "AAS Protect"],
    ["VITAMINA C", "Vitamina C"],
    // Unidade colada ao número sobe inteira: "500Mg" fica pior que "500 MG".
    ["TYLENOL 500 MG", "Tylenol 500 MG"],
  ]) {
    const resultado = capitalizarNome(entrada);
    checar(`capitalizar "${entrada}"`, resultado === esperado, `veio "${resultado}"`);
  }

  // A primeira palavra sobe mesmo sendo preposição — "A Saúde", nunca "a Saúde".
  checar("preposição inicial sobe", capitalizarNome("DE OLHO") === "De Olho");

  const multipla = resumirSubstancia("EXTRATO DE PASSIFLORA;EXTRATO DE LARANJA;SALICILATO DE SÓDIO");
  checar("substância múltipla conta o resto", multipla.endsWith("e mais 2"), multipla);
  checar("substância única não conta nada", resumirSubstancia("DIPIRONA") === "Dipirona");
  checar("substância vazia devolve vazio", resumirSubstancia("") === "");
} finally {
  rmSync(saida, { recursive: true, force: true });
}

console.log(`\n${ok} verificações passaram, ${falhou} falharam.`);
process.exit(falhou === 0 ? 0 : 1);
