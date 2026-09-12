/**
 * Confere a previsão de quando o estoque acaba — em especial o caso que apagava o aviso.
 *
 * O que estes casos travam: `estimateStockDepletion` devolvia `null` sempre que o estoque cobria
 * todas as doses geradas, e isso confundia duas situações muito diferentes. "Dura mais que o
 * horizonte de 730 dias" é desconhecido e `null` está certo; "dá conta até o último dia de um
 * tratamento com data de fim" é um fato com data, e devolver `null` ali descartava o estoque antes
 * de ele chegar ao planejador — o aviso não saía nem na antecedência nem no dia em que acabava.
 *
 * O Gabriel encontrou em 12/09 comparando com o aviso de receita, que nunca desaparece porque a
 * validade dela já é uma data pronta. O pedido foi exatamente esse: que o estoque se comportasse
 * como a receita.
 *
 * O `--import` do resolvedor é obrigatório aqui: esta função importa `generate-dose-schedules` sem
 * extensão, do jeito que o bundler aceita e o Node puro não. Ver `resolver-sem-extensao.mjs`.
 *
 * Rodar: node --experimental-strip-types --import ./scripts/resolver-sem-extensao.mjs \
 *          scripts/conferir-previsao-de-estoque.mjs
 */
import { estimateStockDepletion } from "../src/domain/use-cases/estimate-stock-depletion.ts";

let passou = 0;
let falhou = 0;

function conferir(descricao, condicao, detalhe) {
  if (condicao) {
    passou += 1;
    console.log(`  ok  ${descricao}`);
  } else {
    falhou += 1;
    console.error(`FALHOU  ${descricao}${detalhe ? ` — ${detalhe}` : ""}`);
  }
}

/** 12/09/2026, 14h — o dia em que o caso foi encontrado. */
const AGORA = new Date(2026, 8, 12, 14, 0);

const BASE = {
  id: "p1",
  doseAmount: 1,
  doseUnit: "comprimido",
  schedule: { kind: "daily", doses: [{ at: "08:00", amount: null }] },
  startDate: "2026-09-12",
};

const comprimidos = (n) => ({ amount: n, unit: "comprimido" });

console.log("\nTratamento com data de fim — o caso que apagava o aviso\n");

// 30 dias de tratamento (12/09 a 11/10) com 30 comprimidos: dá conta do tratamento inteiro.
const cobreTudo = estimateStockDepletion(
  { ...BASE, endDate: "2026-10-11" },
  comprimidos(30),
  AGORA,
);
conferir("estoque que cobre o tratamento inteiro tem previsão", cobreTudo !== null);
conferir(
  "e a previsão aponta o último dia do tratamento",
  cobreTudo !== null && cobreTudo.lastDay === "2026-10-11",
  cobreTudo === null ? "veio null" : `veio ${cobreTudo.lastDay}`,
);

// Tratamento curto, estoque exato: o caso mais simples, e ele também ficava sem aviso.
const curto = estimateStockDepletion({ ...BASE, endDate: "2026-09-18" }, comprimidos(7), AGORA);
conferir("tratamento de uma semana com estoque exato tem previsão", curto !== null);
conferir(
  "e ela termina no último dia do tratamento",
  curto !== null && curto.lastDay === "2026-09-18",
  curto === null ? "veio null" : `veio ${curto.lastDay}`,
);

// Estoque de sobra: continua sendo o fim do tratamento que limita, não a quantidade.
const sobrando = estimateStockDepletion(
  { ...BASE, endDate: "2026-10-11" },
  comprimidos(60),
  AGORA,
);
conferir("estoque de sobra também tem previsão", sobrando !== null);
conferir(
  "e ela para no fim do tratamento, não na quantidade",
  sobrando !== null && sobrando.lastDay === "2026-10-11",
  sobrando === null ? "veio null" : `veio ${sobrando.lastDay}`,
);

console.log("\nO que continua sendo null — e precisa continuar\n");

// Tratamento contínuo com estoque grande: dura além do horizonte, e inventar data seria mentir.
const continuoGrande = estimateStockDepletion(
  { ...BASE, endDate: null },
  comprimidos(5000),
  AGORA,
);
conferir(
  "tratamento contínuo com estoque além do horizonte segue null",
  continuoGrande === null,
  continuoGrande === null ? "" : `veio ${continuoGrande.lastDay}`,
);

// Unidades diferentes: gota se toma em gota e se compra em ml, e a conversão exigiria a
// concentração do frasco, que o app não tem.
const outraUnidade = estimateStockDepletion({ ...BASE, endDate: "2026-10-11" }, { amount: 20, unit: "ml" }, AGORA);
conferir("unidade incompatível segue null", outraUnidade === null);

// Sem estoque não há o que prever.
conferir(
  "estoque zerado segue null",
  estimateStockDepletion({ ...BASE, endDate: "2026-10-11" }, comprimidos(0), AGORA) === null,
);

// "Só quando precisar" não gera horário, então não há ritmo de consumo.
conferir(
  "posologia sem horário segue null",
  estimateStockDepletion(
    { ...BASE, endDate: "2026-10-11", schedule: { kind: "asNeeded" } },
    comprimidos(30),
    AGORA,
  ) === null,
);

console.log("\nO que já funcionava, e não pode ter regredido\n");

// Estoque que acaba antes do fim do tratamento: o caso normal, com data no meio.
const acabaAntes = estimateStockDepletion(
  { ...BASE, endDate: "2026-10-11" },
  comprimidos(10),
  AGORA,
);
conferir("estoque que acaba antes do fim mantém a previsão", acabaAntes !== null);
conferir(
  "e ela cai no dia da última dose coberta (a de hoje já passou às 14h)",
  acabaAntes !== null && acabaAntes.lastDay === "2026-09-22",
  acabaAntes === null ? "veio null" : `veio ${acabaAntes.lastDay}`,
);
conferir(
  "com os dias restantes contados do dia de hoje",
  acabaAntes !== null && acabaAntes.daysRemaining === 10,
  acabaAntes === null ? "veio null" : `veio ${acabaAntes.daysRemaining}`,
);

// Tratamento contínuo com estoque pequeno: sempre funcionou, é o que o Gabriel validou primeiro.
const continuoPequeno = estimateStockDepletion({ ...BASE, endDate: null }, comprimidos(4), AGORA);
conferir("tratamento contínuo com estoque pequeno mantém a previsão", continuoPequeno !== null);
conferir(
  "e ela diz quantos dias faltam",
  continuoPequeno !== null && continuoPequeno.daysRemaining === 4,
  continuoPequeno === null ? "veio null" : `veio ${continuoPequeno.daysRemaining}`,
);

// Menos que uma dose na caixa: acabou na prática, e a previsão é hoje.
const menosQueUmaDose = estimateStockDepletion(
  { ...BASE, endDate: "2026-10-11", doseAmount: 2 },
  comprimidos(1),
  AGORA,
);
conferir(
  "menos que uma dose na caixa dá previsão para hoje",
  menosQueUmaDose !== null && menosQueUmaDose.daysRemaining === 0,
);

console.log(`\n${passou} passaram, ${falhou} falharam\n`);
if (falhou > 0) process.exit(1);
