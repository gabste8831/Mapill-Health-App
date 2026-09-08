/**
 * Confere a adesão dia a dia da tela "Minha adesão".
 *
 * Roda em Node puro (`node scripts/conferir-adesao-por-dia.mjs`) porque o use-case é uma função
 * pura sem React nem SQLite. O que se testa aqui é o que o médico lê: se um dia sem dose virar 0%,
 * a tela acusa uma falha que não houve.
 */
import assert from "node:assert/strict";

import { adesaoPorDia } from "../src/domain/use-cases/adesao-por-dia.ts";

let passos = 0;
function confere(descricao, executar) {
  executar();
  passos += 1;
  console.log(`  ok  ${descricao}`);
}

/** Uma dose em `dia` (YYYY-MM-DD) às `hora`, com o status dado. */
function dose(dia, hora, latestStatus = null) {
  const [ano, mes, data] = dia.split("-").map(Number);
  return { scheduledFor: new Date(ano, mes - 1, data, hora, 0).toISOString(), latestStatus };
}

const AGORA = new Date(2026, 8, 5, 15, 0); // 05/09/2026, 15h

console.log("\nadesaoPorDia");

confere("devolve exatamente os dias pedidos, terminando em hoje", () => {
  const dias = adesaoPorDia({ doses: [], agora: AGORA, dias: 7 });
  assert.equal(dias.length, 7);
  assert.equal(dias[0].dia, "2026-08-30");
  assert.equal(dias[6].dia, "2026-09-05");
  assert.equal(dias[6].ehHoje, true);
  assert.equal(dias[0].ehHoje, false);
});

confere("dia sem dose vem com taxa null, e não com zero", () => {
  const [dia] = adesaoPorDia({ doses: [], agora: AGORA, dias: 1 });
  assert.equal(dia.previstas, 0);
  assert.equal(dia.taxa, null);
});

confere("conta só as confirmadas como aderência", () => {
  const doses = [
    dose("2026-09-04", 8, "confirmed"),
    dose("2026-09-04", 12, "skipped"),
    dose("2026-09-04", 20, null),
    dose("2026-09-04", 22, "confirmed"),
  ];
  const [dia] = adesaoPorDia({ doses, agora: AGORA, dias: 1 }).slice(-1);
  const ontem = adesaoPorDia({ doses, agora: AGORA, dias: 2 })[0];
  assert.equal(ontem.previstas, 4);
  assert.equal(ontem.confirmadas, 2);
  assert.equal(ontem.taxa, 0.5);
  assert.equal(dia.previstas, 0); // hoje não tinha nada
});

confere("o dia em andamento conta inteiro, com as doses que ainda não venceram", () => {
  // 8h já passou (agora são 15h); 20h não — e mesmo assim entra, porque o dia é um só.
  //
  // Era o defeito de 08/09: contando só as vencidas, este dia dava 100% enquanto a barra de
  // progresso da Home, logo acima na mesma tela, dizia 50%. Um dia com duas doses em que uma foi
  // tomada está pela metade, e é isso que as duas barras precisam mostrar.
  const doses = [dose("2026-09-05", 8, "confirmed"), dose("2026-09-05", 20, null)];
  const [hoje] = adesaoPorDia({ doses, agora: AGORA, dias: 1 });
  assert.equal(hoje.previstas, 2, "a dose das 20h é de hoje e entra no dia");
  assert.equal(hoje.confirmadas, 1);
  assert.equal(hoje.taxa, 0.5);
});

confere("um dia inteiramente no futuro continua sem taxa", () => {
  // A dose de amanhã não entra: aquele dia ainda não começou, e barra nenhuma o descreve.
  const doses = [dose("2026-09-06", 8, null)];
  const dias = adesaoPorDia({ doses, agora: AGORA, dias: 1 });
  assert.equal(dias[0].previstas, 0);
  assert.equal(dias[0].taxa, null);
});

confere("dose fora da janela não entra em nenhum dia", () => {
  const doses = [dose("2026-08-01", 8, "confirmed")];
  const dias = adesaoPorDia({ doses, agora: AGORA, dias: 7 });
  assert.equal(
    dias.reduce((total, dia) => total + dia.previstas, 0),
    0,
  );
});

confere("agrupa pelo dia local, e não pelo dia UTC", () => {
  // 22h no fuso do Brasil é o dia seguinte em UTC. Se o agrupamento usasse toISOString, esta dose
  // apareceria no dia 05 em vez do 04.
  const doses = [dose("2026-09-04", 22, "confirmed")];
  const dias = adesaoPorDia({ doses, agora: AGORA, dias: 2 });
  assert.equal(dias[0].dia, "2026-09-04");
  assert.equal(dias[0].previstas, 1);
  assert.equal(dias[1].previstas, 0);
});

confere("a ordem é do mais antigo para o mais recente", () => {
  const dias = adesaoPorDia({ doses: [], agora: AGORA, dias: 5 });
  const ordenados = [...dias].sort((a, b) => a.dia.localeCompare(b.dia));
  assert.deepEqual(
    dias.map((dia) => dia.dia),
    ordenados.map((dia) => dia.dia),
  );
});

confere("pulada não conta como tomada — é o que separa o gráfico da barra da Home", () => {
  // O defeito de 08/09: a barra de progresso do topo da Home marcava 50% e o gráfico dos sete dias
  // marcava 100% para o mesmo dia. São contas diferentes de propósito — a barra mede quantas doses
  // já foram *respondidas* (confirmadas e puladas), o gráfico mede quantas foram *tomadas* —, mas
  // as duas precisam sair do mesmo lugar para não divergirem por acidente.
  const doses = [dose("2026-09-05", 8, "confirmed"), dose("2026-09-05", 9, "skipped")];
  const [hoje] = adesaoPorDia({ doses, agora: AGORA, dias: 1 });
  assert.equal(hoje.previstas, 2);
  assert.equal(hoje.confirmadas, 1);
  assert.equal(hoje.taxa, 0.5);
});

confere("o gráfico da Home e a barra de progresso dão o mesmo número", () => {
  // As duas ficam lado a lado na mesma tela. O numerador difere de propósito — a barra conta as
  // *respondidas*, o gráfico as *tomadas* —, mas o denominador é o mesmo dia inteiro, e num dia sem
  // dose pulada os dois números têm que coincidir. Foi vendo 50% em cima e 100% embaixo que o
  // defeito apareceu.
  const doses = [dose("2026-09-05", 8, "confirmed"), dose("2026-09-05", 22)];
  const [hoje] = adesaoPorDia({ doses, agora: AGORA, dias: 1 });

  const resolvidas = doses.filter((d) => d.latestStatus !== null).length;
  const barraDaHome = resolvidas / doses.length;

  assert.equal(hoje.taxa, 0.5);
  assert.equal(hoje.taxa, barraDaHome, "as duas barras precisam dizer a mesma coisa");
});

console.log(`\n${passos} verificações passaram.\n`);
