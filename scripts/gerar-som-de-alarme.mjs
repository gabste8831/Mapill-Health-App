/**
 * Gera o som do alarme de dose (`assets/sounds/alarme-de-dose.wav`).
 *
 * **Por que gerado, e não baixado.** Um arquivo de som de terceiro traz licença junto, e este vai
 * embarcado num app que é entregue como trabalho acadêmico e vive num repositório público. Gerar a
 * onda por código resolve a procedência de uma vez: o arquivo é do projeto, e este script é a prova
 * de como ele foi feito.
 *
 * **O desenho do som.** Dois tons alternados (880 Hz e 660 Hz), em pulsos curtos com silêncio entre
 * eles — a gramática que o ouvido reconhece como alarme, e não como aviso de mensagem. Onda senoidal
 * com envelope suave nas bordas de cada pulso: sem isso, o corte seco produz um "clique" audível a
 * cada repetição, que cansa rápido em algo que vai tocar em loop até alguém desligar.
 *
 * A duração é de ~4 s. O loop contínuo é responsabilidade da tela de alarme (`expo-audio` com
 * `isLooping`), não do arquivo — um WAV longo só ocuparia espaço para dizer a mesma coisa.
 *
 *     node scripts/gerar-som-de-alarme.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = join(RAIZ, "assets/sounds/alarme-de-dose.wav");

const TAXA = 44100; // Hz — padrão de CD, aceito por qualquer aparelho Android.
const CANAIS = 1; // Mono: o alarme não ganha nada com estéreo, e o arquivo fica na metade.
const BITS = 16;

/** Um pulso: tom por `duracaoMs`, depois silêncio por `silencioMs`. */
const PULSOS = [
  { hz: 880, duracaoMs: 250, silencioMs: 120 },
  { hz: 660, duracaoMs: 250, silencioMs: 120 },
  { hz: 880, duracaoMs: 250, silencioMs: 120 },
  { hz: 660, duracaoMs: 250, silencioMs: 700 },
];

/** Quantas vezes a sequência acima se repete dentro do arquivo. */
const REPETICOES = 2;

/**
 * Sobe e desce o volume nos 8 ms de cada borda.
 *
 * Um pulso que começa e termina no volume cheio produz um estalo — a descontinuidade da onda vira
 * um clique no alto-falante. Em som que repete em loop, esse clique é o que faz o alarme soar
 * quebrado em vez de urgente.
 */
function envelope(indice, total) {
  const rampa = Math.floor(TAXA * 0.008);
  if (indice < rampa) return indice / rampa;
  if (indice > total - rampa) return (total - indice) / rampa;
  return 1;
}

const amostras = [];

for (let volta = 0; volta < REPETICOES; volta++) {
  for (const pulso of PULSOS) {
    const amostrasDoTom = Math.floor((TAXA * pulso.duracaoMs) / 1000);
    for (let i = 0; i < amostrasDoTom; i++) {
      const onda = Math.sin((2 * Math.PI * pulso.hz * i) / TAXA);
      // 0.7 deixa margem para o aparelho amplificar sem distorcer.
      amostras.push(onda * envelope(i, amostrasDoTom) * 0.7);
    }
    const amostrasDeSilencio = Math.floor((TAXA * pulso.silencioMs) / 1000);
    for (let i = 0; i < amostrasDeSilencio; i++) amostras.push(0);
  }
}

// --- monta o WAV (cabeçalho RIFF de 44 bytes + PCM 16 bits) ---
const dados = Buffer.alloc(amostras.length * 2);
amostras.forEach((amostra, i) => {
  dados.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(amostra * 32767))), i * 2);
});

const cabecalho = Buffer.alloc(44);
cabecalho.write("RIFF", 0);
cabecalho.writeUInt32LE(36 + dados.length, 4);
cabecalho.write("WAVE", 8);
cabecalho.write("fmt ", 12);
cabecalho.writeUInt32LE(16, 16); // tamanho do bloco fmt
cabecalho.writeUInt16LE(1, 20); // 1 = PCM sem compressão
cabecalho.writeUInt16LE(CANAIS, 22);
cabecalho.writeUInt32LE(TAXA, 24);
cabecalho.writeUInt32LE((TAXA * CANAIS * BITS) / 8, 28); // bytes por segundo
cabecalho.writeUInt16LE((CANAIS * BITS) / 8, 32); // alinhamento de bloco
cabecalho.writeUInt16LE(BITS, 34);
cabecalho.write("data", 36);
cabecalho.writeUInt32LE(dados.length, 40);

mkdirSync(dirname(DESTINO), { recursive: true });
writeFileSync(DESTINO, Buffer.concat([cabecalho, dados]));

const segundos = (amostras.length / TAXA).toFixed(1);
const kb = Math.round((cabecalho.length + dados.length) / 1024);
console.log(`Gerado: assets/sounds/alarme-de-dose.wav — ${segundos}s, ${kb} KB`);
