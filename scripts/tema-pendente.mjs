#!/usr/bin/env node
/**
 * Lista o que ainda NÃO responde a troca de tema.
 *
 * Existe porque a migração é gradual: enquanto ela não termina, é preciso saber com precisão o que
 * já foi e o que falta — sem depender de abrir tela por tela e olhar. Este script é a resposta à
 * pergunta "quais pontos ainda não estão mapeados?".
 *
 * Uso:
 *   node scripts/tema-pendente.mjs           # resumo por arquivo
 *   node scripts/tema-pendente.mjs --lista   # cada ocorrência, com linha
 *   node scripts/tema-pendente.mjs --ci      # sai com código 1 se houver pendência
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ORIGEM = join(RAIZ, "src");

/** O motor de temas em si lê a paleta de propósito — não é pendência. */
const ISENTOS = [
  join("src", "shared", "theme"),
];

function arquivos(dir) {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...arquivos(caminho));
    else if (/\.tsx?$/.test(nome)) saida.push(caminho);
  }
  return saida;
}

const listar = process.argv.includes("--lista");
const ci = process.argv.includes("--ci");

const pendencias = [];

for (const caminho of arquivos(ORIGEM)) {
  const rel = relative(RAIZ, caminho);
  if (ISENTOS.some((i) => rel.startsWith(i))) continue;

  const linhas = readFileSync(caminho, "utf8").split(/\r?\n/);
  const achados = [];

  linhas.forEach((linha, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(linha)) return; // comentário
    // `colors.` fora do motor = cor congelada na importação.
    if (/\bcolors\.[a-zA-Z]/.test(linha)) achados.push({ n: i + 1, txt: linha.trim(), tipo: "colors." });
    // Folha estática num arquivo que usa cor = não repinta ao trocar de tema.
    else if (/StyleSheet\.create\(/.test(linha) && /colors/.test(readFileSync(caminho, "utf8")))
      achados.push({ n: i + 1, txt: linha.trim(), tipo: "StyleSheet estático" });
  });

  if (achados.length > 0) pendencias.push({ rel, achados });
}

const totalOcorrencias = pendencias.reduce((s, p) => s + p.achados.length, 0);

if (pendencias.length === 0) {
  console.log("✓ Tudo migrado: nenhum arquivo lê cor fora do motor de temas.");
  process.exit(0);
}

console.log(`\nPENDENTES DE TEMA — ${pendencias.length} arquivos, ${totalOcorrencias} ocorrências\n`);
for (const { rel, achados } of pendencias.sort((a, b) => b.achados.length - a.achados.length)) {
  console.log(`  ${String(achados.length).padStart(3)}  ${rel}`);
  if (listar) for (const a of achados) console.log(`         ${a.n}: ${a.txt.slice(0, 90)}`);
}
console.log(`\nMigrar: trocar \`colors\` por \`cores\` do \`estilosDoTema\` — ver src/shared/theme/usar-estilos.ts\n`);

process.exit(ci ? 1 : 0);
