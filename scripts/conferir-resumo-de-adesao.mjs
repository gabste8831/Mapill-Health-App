/**
 * Confere a taxa de adesão de um período — o número grande de "Minha adesão" e o do relatório em
 * PDF que vai ao médico.
 *
 * Roda em Node puro porque `resumirAdesao` é uma função pura. O que se testa aqui é se o resumo
 * descreve **o que de fato aconteceu**: uma dose tomada precisa aparecer como tomada, e uma que
 * ninguém respondeu ainda não pode contar contra ninguém.
 */
import assert from "node:assert/strict";

import { resumirAdesao, listarDosesPerdidas } from "../src/domain/use-cases/resumir-adesao.ts";

let passos = 0;
function confere(descricao, executar) {
  executar();
  passos += 1;
  console.log(`  ok  ${descricao}`);
}

const AGORA = new Date(2026, 8, 8, 15, 0); // 08/09/2026, 15h

/** Uma dose no dia `dia` de setembro, às `hora`, do medicamento `med`. */
function dose(dia, hora, latestStatus = null, med = "A") {
  return {
    doseScheduleId: `${dia}-${hora}-${med}`,
    scheduledFor: new Date(2026, 8, dia, hora, 0).toISOString(),
    medicationId: med,
    medicationName: med,
    latestStatus,
  };
}

console.log("\nresumirAdesao");

confere("dose confirmada antes do horário conta como tomada", () => {
  /**
   * O defeito de 08/09, relatado em aparelho: duas doses tomadas hoje (uma confirmada antes da
   * hora) e uma pulada ontem apareciam como "1 de 2 doses tomadas — 50%". A dose confirmada às 15h
   * para o horário das 22h saía inteira da conta, e o acerto da pessoa desaparecia da tela.
   */
  const doses = [
    dose(8, 8, "confirmed", "A"),
    dose(8, 22, "confirmed", "B"),
    dose(7, 8, "skipped", "A"),
  ];
  const resumo = resumirAdesao({ doses, agora: AGORA });

  assert.equal(resumo.confirmadas, 2, "duas doses foram tomadas");
  assert.equal(resumo.previstas, 3);
  assert.equal(resumo.puladas, 1);
  assert.equal(Math.round(resumo.taxa * 100), 67);
});

confere("dose futura sem resposta continua fora da conta", () => {
  // A outra metade da regra: incluí-la faria a taxa cair sozinha ao longo do dia e subir de novo à
  // noite, medindo o relógio em vez do comportamento.
  const doses = [dose(8, 8, "confirmed", "A"), dose(8, 22, null, "B")];
  const resumo = resumirAdesao({ doses, agora: AGORA });

  assert.equal(resumo.previstas, 1);
  assert.equal(resumo.taxa, 1);
});

confere("dose futura pulada também conta — é um fato, não uma promessa", () => {
  const doses = [dose(8, 8, "confirmed", "A"), dose(8, 22, "skipped", "B")];
  const resumo = resumirAdesao({ doses, agora: AGORA });

  assert.equal(resumo.previstas, 2);
  assert.equal(resumo.puladas, 1);
  assert.equal(resumo.taxa, 0.5);
});

confere("pular reduz a adesão, e sem resposta conta igual no número", () => {
  const doses = [dose(7, 8, "confirmed"), dose(7, 12, "skipped"), dose(7, 20, null)];
  const resumo = resumirAdesao({ doses, agora: AGORA });

  assert.equal(resumo.taxa, 1 / 3);
  // Separadas na lista, porque pedem condutas clínicas opostas: "decidi não tomar" e "esqueci".
  assert.equal(resumo.puladas, 1);
  assert.equal(resumo.semResposta, 1);
});

confere("sem dose vencida não há taxa — e nunca 0%", () => {
  // RN20: zero por cento é uma afirmação sobre o paciente; ausência de dados não é.
  const resumo = resumirAdesao({ doses: [dose(9, 8, null)], agora: AGORA });
  assert.equal(resumo.previstas, 0);
  assert.equal(resumo.taxa, null);
});

confere("por medicamento, do pior para o melhor", () => {
  const doses = [
    dose(7, 8, "confirmed", "Bom"),
    dose(7, 9, "confirmed", "Bom"),
    dose(7, 8, "skipped", "Ruim"),
    dose(7, 9, "confirmed", "Ruim"),
  ];
  const { porMedicamento } = resumirAdesao({ doses, agora: AGORA });

  assert.deepEqual(
    porMedicamento.map((item) => item.medicationName),
    ["Ruim", "Bom"],
  );
});

console.log("\nlistarDosesPerdidas");

confere("lista só o que venceu e não foi tomado", () => {
  const doses = [
    dose(7, 8, "skipped", "A"),
    dose(7, 12, null, "B"),
    dose(7, 20, "confirmed", "C"),
    // Futura e sem resposta: ainda dá tempo de tomar, então não é uma dose perdida.
    dose(8, 22, null, "D"),
  ];
  const perdidas = listarDosesPerdidas({ doses, agora: AGORA });

  assert.equal(perdidas.length, 2);
  assert.deepEqual(
    perdidas.map((item) => item.medicationName).sort(),
    ["A", "B"],
  );
});

console.log(`\n${passos} verificações passaram.\n`);
