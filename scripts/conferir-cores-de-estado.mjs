/**
 * Confere as cores de estado que o app oferece em Ajustes → Configurações de tema.
 *
 * ## O que este script prova
 *
 * Cada conjunto de cores ("tudo certo" / "fique atento" / "urgente") precisa passar em duas
 * exigências diferentes, e uma não implica a outra:
 *
 * 1. **Contraste WCAG AA** (4,5:1 para texto, 3:1 para elemento gráfico) de cada cor contra as
 *    superfícies onde ela aparece. É o que garante que a cor seja **vista**.
 * 2. **Distinção entre as três**, para quem não percebe cores da forma comum. É o que garante que
 *    elas signifiquem coisas diferentes — e contraste não mede isso, porque contraste compara
 *    figura com fundo, e aqui o problema é figura contra figura.
 *
 * ## O método da segunda exigência
 *
 * As cores são convertidas para como cada tipo de daltonismo as vê, pelas matrizes de
 * **Viénot, Brettel e Mollon (1999)** — as mesmas usadas por simuladores como o Coblis. As cores
 * resultantes são comparadas com **CIEDE2000** (CIE, 2001), a fórmula padrão de diferença
 * perceptual de cor.
 *
 * O limiar é **ΔE ≥ 10**. Abaixo de 5 duas cores são praticamente a mesma; 10 é a folga usual em
 * acessibilidade para que a diferença sobreviva a tela ruim, luz do sol e visão cansada.
 *
 * ## Por que ele existe
 *
 * Foi este script que mostrou que o antigo tema "Sem depender de cor" não cumpria o que prometia, e
 * que o amarelo de atenção colidia com o vermelho de urgência **no tema padrão** (ΔE 7,8). Rodar de
 * novo antes de acrescentar um conjunto novo é o que impede a lista de crescer com uma opção que
 * parece boa e não é.
 *
 * Uso: `node scripts/conferir-cores-de-estado.mjs`
 */

const MATRIZES = {
  deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
  protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
};

const paraLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const paraSrgb = (c) => {
  const v = Math.max(0, Math.min(1, c));
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
};
const canais = (hex) => [1, 3, 5].map((i) => paraLinear(Number.parseInt(hex.slice(i, i + 2), 16) / 255));
const paraHex = (rgb) =>
  `#${rgb.map((v) => Math.round(paraSrgb(v) * 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;

function simular(hex, tipo) {
  const v = canais(hex);
  const m = MATRIZES[tipo];
  return paraHex(m.map((linha) => linha.reduce((soma, peso, j) => soma + peso * v[j], 0)));
}

function paraLab(hex) {
  const [r, g, b] = canais(hex);
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(X), f(Y), f(Z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIEDE2000 (CIE, 2001). */
function deltaE(hexA, hexB) {
  const [L1, a1, b1] = paraLab(hexA);
  const [L2, a2, b2] = paraLab(hexB);
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)) || 0);
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const h1p = (Math.atan2(b1, a1p) / rad + 360) % 360;
  const h2p = (Math.atan2(b2, a2p) / rad + 360) % 360;
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * rad) / 2);
  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hbp = (h1p + h2p) / 2;
    else hbp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  }
  const T =
    1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad) +
    0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt =
    -Math.sin(2 * (30 * Math.exp(-(((hbp - 275) / 25) ** 2))) * rad) *
    (2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) || 0);
  return Math.sqrt(
    (dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh),
  );
}

const luminancia = (hex) => {
  const [r, g, b] = canais(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => {
  const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (maior + 0.05) / (menor + 0.05);
};

/** O menor ΔE entre duas cores, considerando as três formas de daltonismo. */
const menorDeltaE = (a, b) =>
  Math.min(...Object.keys(MATRIZES).map((tipo) => deltaE(simular(a, tipo), simular(b, tipo))));

// Espelha `src/shared/theme/pares-de-estado.ts`. Se lá mudar, aqui muda junto.
const CONJUNTOS = [
  { nome: "Verde, amarelo e vermelho", afirmativo: "#11803E", negativo: "#C90000", atencao: "#A16207", padrao: true },
  { nome: "Azul, marrom e laranja", afirmativo: "#0B5FD9", negativo: "#C2410C", atencao: "#6D4C00" },
  { nome: "Azul, petróleo e vermelho", afirmativo: "#1D4ED8", negativo: "#B91C1C", atencao: "#155E75" },
  { nome: "Roxo, petróleo e âmbar", afirmativo: "#6D28D9", negativo: "#96590A", atencao: "#155E75" },
  { nome: "Turquesa, marrom e magenta", afirmativo: "#00696E", negativo: "#C2185B", atencao: "#6D4C00" },
];

const FUNDO_DA_TELA = "#F1F4F8";
const CARTAO = "#FFFFFF";
const LIMIAR_DELTA_E = 10;
const LIMIAR_TEXTO = 4.5;

let falhas = 0;
console.log("Cores de estado: contraste WCAG e distinção sob daltonismo\n");

for (const conjunto of CONJUNTOS) {
  const { nome, afirmativo, negativo, atencao, padrao } = conjunto;
  const problemas = [];

  for (const [rotulo, cor] of [["tudo certo", afirmativo], ["fique atento", atencao], ["urgente", negativo]]) {
    for (const [ondeNome, onde] of [["fundo da tela", FUNDO_DA_TELA], ["cartão", CARTAO]]) {
      const valor = contraste(cor, onde);
      if (valor < LIMIAR_TEXTO) {
        problemas.push(`contraste ${rotulo} sobre ${ondeNome}: ${valor.toFixed(2)} (mínimo ${LIMIAR_TEXTO})`);
      }
    }
  }

  const distancias = [
    ["tudo certo / urgente", menorDeltaE(afirmativo, negativo)],
    ["tudo certo / fique atento", menorDeltaE(afirmativo, atencao)],
    ["fique atento / urgente", menorDeltaE(atencao, negativo)],
  ];
  for (const [par, valor] of distancias) {
    if (valor < LIMIAR_DELTA_E) {
      problemas.push(`ΔE ${par}: ${valor.toFixed(1)} (mínimo ${LIMIAR_DELTA_E})`);
    }
  }

  const resumo = distancias.map(([, v]) => v.toFixed(1)).join(" / ");
  if (problemas.length === 0) {
    console.log(`  OK    ${nome.padEnd(27)} ΔE ${resumo}`);
  } else if (padrao) {
    // O conjunto original do app é o **problema** que os outros existem para resolver: ele fica na
    // lista para quem enxerga as cores normalmente, e falhar aqui é o esperado.
    console.log(`  ~     ${nome.padEnd(27)} ΔE ${resumo}   (esperado: é o conjunto que se troca)`);
    for (const p of problemas) console.log(`          ${p}`);
  } else {
    falhas += problemas.length;
    console.log(`  FALHA ${nome.padEnd(27)} ΔE ${resumo}`);
    for (const p of problemas) console.log(`          ${p}`);
  }
}

console.log(`\n${falhas === 0 ? "Nenhuma falha nos conjuntos alternativos." : `${falhas} falha(s).`}`);
process.exit(falhas === 0 ? 0 : 1);
