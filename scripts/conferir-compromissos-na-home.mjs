/**
 * Confere quais compromissos entram na Home.
 *
 * A regra: a antecedência do lembrete **é** a janela do card. Quem pede aviso de 7 dias vê o card
 * nos 7 dias antes; quem não pede lembrete nenhum não vê card antes da hora. O que se testa aqui é
 * que a Home e a notificação nunca discordem sobre isso.
 */
import assert from "node:assert/strict";

import { compromissosAMostrarNaHome } from "../src/domain/use-cases/compromissos-a-mostrar-na-home.ts";

let passos = 0;
function confere(descricao, executar) {
  executar();
  passos += 1;
  console.log(`  ok  ${descricao}`);
}

const AGORA = new Date(2026, 8, 5, 15, 0); // 05/09/2026, 15h

/** Um compromisso daqui a `emDias`, às 14h. */
function compromisso(emDias, extras = {}) {
  const quando = new Date(2026, 8, 5 + emDias, 14, 0);
  return {
    appointmentId: `c${emDias}`,
    scheduledFor: quando.toISOString(),
    reminderLeadDays: null,
    reminderOnDay: false,
    jaRespondido: false,
    ...extras,
  };
}

function idsNaHome(compromissos) {
  return compromissosAMostrarNaHome({ compromissos, agora: AGORA }).map((c) => c.appointmentId);
}

console.log("\ncompromissosAMostrarNaHome");

confere("a antecedência do lembrete é a janela do card", () => {
  const daquiA5 = compromisso(5, { reminderLeadDays: 7 });
  assert.deepEqual(idsNaHome([daquiA5]), ["c5"], "7 dias de aviso cobre um compromisso em 5 dias");
});

confere("fora da janela do lembrete, não entra", () => {
  const daquiA10 = compromisso(10, { reminderLeadDays: 7 });
  assert.deepEqual(idsNaHome([daquiA10]), [], "faltam 10 dias e o aviso é de 7");
});

confere("entra exatamente no dia em que o lembrete dispara", () => {
  const daquiA7 = compromisso(7, { reminderLeadDays: 7 });
  assert.deepEqual(idsNaHome([daquiA7]), ["c7"], "o 7º dia antes é o primeiro dia do card");
});

confere("consulta marcada com meses de antecedência não ocupa a Home", () => {
  const daquiA90 = compromisso(90, { reminderLeadDays: 7 });
  assert.deepEqual(idsNaHome([daquiA90]), []);
});

confere("o compromisso de hoje aparece mesmo sem lembrete nenhum", () => {
  const hoje = compromisso(0);
  assert.deepEqual(idsNaHome([hoje]), ["c0"], "quem dispensou o aviso não dispensou a agenda");
});

confere("sem lembrete, não há card antes do dia", () => {
  const daquiA3 = compromisso(3);
  assert.deepEqual(idsNaHome([daquiA3]), [], "sem pedido de antecedência, sem antecipação");
});

confere("reminderOnDay sozinho não antecipa o card", () => {
  const amanha = compromisso(1, { reminderOnDay: true });
  assert.deepEqual(idsNaHome([amanha]), [], "'no dia' é no dia, não na véspera");
});

confere("com os dois pedidos, a antecedência é quem manda", () => {
  const daquiA5 = compromisso(5, { reminderLeadDays: 7, reminderOnDay: true });
  assert.deepEqual(idsNaHome([daquiA5]), ["c5"]);
});

confere("passou a data, sai da Home mesmo sem resposta", () => {
  const ontem = compromisso(-1, { reminderLeadDays: 7, reminderOnDay: true });
  assert.deepEqual(idsNaHome([ontem]), [], "a cobrança do desfecho é da listagem");
});

confere("respondido não entra, mesmo dentro da janela", () => {
  const respondido = compromisso(2, { reminderLeadDays: 7, jaRespondido: true });
  assert.deepEqual(idsNaHome([respondido]), []);
});

confere("compromisso mais cedo no mesmo dia ainda conta como hoje", () => {
  // 8h já passou (agora são 15h), mas o dia é o mesmo: o card continua valendo.
  const cedoHoje = {
    ...compromisso(0),
    scheduledFor: new Date(2026, 8, 5, 8, 0).toISOString(),
  };
  const [item] = compromissosAMostrarNaHome({ compromissos: [cedoHoje], agora: AGORA });
  assert.equal(item.ehHoje, true, "a janela é de dias de calendário, não de horas");
  assert.equal(item.emDias, 0);
});

confere("ordena do mais próximo para o mais distante", () => {
  const lista = [
    compromisso(6, { reminderLeadDays: 7 }),
    compromisso(1, { reminderLeadDays: 7 }),
    compromisso(3, { reminderLeadDays: 7 }),
  ];
  assert.deepEqual(idsNaHome(lista), ["c1", "c3", "c6"]);
});

confere("emDias conta dias de calendário, não períodos de 24h", () => {
  // O compromisso é às 14h e agora são 15h: faltam 23h, mas é amanhã.
  const amanha = compromisso(1, { reminderLeadDays: 7 });
  const [item] = compromissosAMostrarNaHome({ compromissos: [amanha], agora: AGORA });
  assert.equal(item.emDias, 1, "23 horas depois ainda é 'amanhã' para quem lê");
  assert.equal(item.ehHoje, false);
});

console.log(`\n${passos} verificações passaram.\n`);
