/**
 * Confere a regra de quando o aviso de compromisso e de receita chega.
 *
 * A regra nasceu com hora fixa às 08:00 e o defeito só aparecia em compromissos cedo: uma consulta
 * às 06:00 recebia o aviso "no dia" duas horas **depois** de ela já ter começado, e uma às 08:05 o
 * recebia cinco minutos antes. Agora é 00:01, e o que estes casos travam é isso — que a hora do
 * compromisso não influencia mais a hora do aviso.
 *
 * Rodar: node --experimental-strip-types scripts/conferir-avisos-de-compromisso.mjs
 */
import { planejarAvisosDeCompromisso } from "../src/domain/use-cases/planejar-avisos-de-compromisso.ts";

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

/** 01/09/2026, 10h — a janela vai até 30 dias depois, como a das doses. */
const AGORA = new Date(2026, 8, 1, 10, 0);
const ATE = new Date(2026, 9, 1, 10, 0);

function planejar(compromissos, receitas = []) {
  return planejarAvisosDeCompromisso({ compromissos, receitas, agora: AGORA, ate: ATE });
}

function compromisso(extra) {
  return {
    appointmentId: "c1",
    titulo: "Cardiologista",
    reminderLeadDays: null,
    reminderOnDay: false,
    jaRespondido: false,
    ...extra,
  };
}

/** "00:01 do dia 10/09" — o que se quer ler quando um caso falha. */
function quandoLegivel(data) {
  const p = (v) => String(v).padStart(2, "0");
  return `${p(data.getDate())}/${p(data.getMonth() + 1)} às ${p(data.getHours())}:${p(data.getMinutes())}`;
}

console.log("\nO aviso 'no dia' cai às 00:01, qualquer que seja a hora do compromisso\n");

// O caso que motivou a mudança: consulta antes das 8h. Com a regra antiga o aviso chegava às 08:00,
// duas horas depois de a consulta ter começado.
{
  const [aviso] = planejar([
    compromisso({ scheduledFor: new Date(2026, 8, 10, 6, 0).toISOString(), reminderOnDay: true }),
  ]);
  conferir(
    "consulta às 06:00 → aviso às 00:01 do mesmo dia",
    aviso?.quando.getHours() === 0 && aviso?.quando.getMinutes() === 1 &&
      aviso?.quando.getDate() === 10,
    aviso ? quandoLegivel(aviso.quando) : "nenhum aviso planejado",
  );
  conferir(
    "e ele chega **antes** do compromisso",
    aviso !== undefined && aviso.quando < new Date(2026, 8, 10, 6, 0),
  );
}

// O caso que a regra antiga tornava inútil sem parecer errado: aviso cinco minutos antes.
{
  const [aviso] = planejar([
    compromisso({ scheduledFor: new Date(2026, 8, 10, 8, 5).toISOString(), reminderOnDay: true }),
  ]);
  conferir(
    "consulta às 08:05 → aviso às 00:01, e não cinco minutos antes",
    aviso?.quando.getHours() === 0 && aviso?.quando.getMinutes() === 1,
    aviso ? quandoLegivel(aviso.quando) : "nenhum aviso planejado",
  );
}

// O caso comum, que a regra antiga já atendia: continua atendido.
{
  const [aviso] = planejar([
    compromisso({ scheduledFor: new Date(2026, 8, 10, 14, 0).toISOString(), reminderOnDay: true }),
  ]);
  conferir(
    "consulta às 14:00 → aviso às 00:01 do mesmo dia",
    aviso?.quando.getHours() === 0 && aviso?.quando.getMinutes() === 1 &&
      aviso?.quando.getDate() === 10,
    aviso ? quandoLegivel(aviso.quando) : "nenhum aviso planejado",
  );
}

// Meia-noite em ponto seria o limite do dia, e um agendamento ali cai do lado errado dele.
{
  const [aviso] = planejar([
    compromisso({ scheduledFor: new Date(2026, 8, 10, 9, 0).toISOString(), reminderOnDay: true }),
  ]);
  conferir("nunca 00:00 — é um minuto depois da virada", aviso?.quando.getMinutes() === 1);
}

console.log("\nO aviso de antecedência cai no mesmo horário, N dias antes\n");

{
  const [aviso] = planejar([
    compromisso({
      scheduledFor: new Date(2026, 8, 10, 14, 0).toISOString(),
      reminderLeadDays: 3,
    }),
  ]);
  conferir(
    "3 dias antes de 10/09 → 00:01 do dia 07/09",
    aviso?.quando.getDate() === 7 && aviso?.quando.getHours() === 0 &&
      aviso?.quando.getMinutes() === 1,
    aviso ? quandoLegivel(aviso.quando) : "nenhum aviso planejado",
  );
}

{
  const avisos = planejar([
    compromisso({
      scheduledFor: new Date(2026, 8, 10, 6, 0).toISOString(),
      reminderLeadDays: 1,
      reminderOnDay: true,
    }),
  ]);
  conferir("pedindo os dois, saem dois avisos", avisos.length === 2, `saíram ${avisos.length}`);
  conferir(
    "e em ordem: o de antecedência antes do 'no dia'",
    avisos.length === 2 && avisos[0].quando < avisos[1].quando,
  );
  conferir(
    "o de 1 dia antes cai em 09/09, e não em 10/09 de madrugada",
    avisos[0]?.quando.getDate() === 9,
    avisos[0] ? quandoLegivel(avisos[0].quando) : "nenhum aviso",
  );
}

console.log("\nO que não muda: nada disso vira alarme, e o passado não gera aviso\n");

{
  const avisos = planejar([
    compromisso({ scheduledFor: new Date(2026, 8, 10, 6, 0).toISOString(), reminderOnDay: true }),
  ]);
  conferir("modo é sempre notification", avisos.every((a) => a.modo === "notification"));
  conferir("sem ações rápidas — não há dose a responder", avisos.every((a) => a.semAcoesRapidas));
  conferir("sem dose vinculada", avisos.every((a) => a.doseScheduleIds.length === 0));
}

{
  const avisos = planejar([
    compromisso({ scheduledFor: new Date(2026, 7, 20, 6, 0).toISOString(), reminderOnDay: true }),
  ]);
  conferir("compromisso que já passou não gera aviso", avisos.length === 0);
}

{
  const avisos = planejar([
    compromisso({
      scheduledFor: new Date(2026, 8, 10, 6, 0).toISOString(),
      reminderOnDay: true,
      jaRespondido: true,
    }),
  ]);
  conferir("compromisso já respondido não gera aviso", avisos.length === 0);
}

console.log("\nA receita segue a mesma hora\n");

{
  const avisos = planejar(
    [],
    [
      {
        prescriptionId: "p1",
        medicationName: "Losartana",
        validUntil: "2026-09-20",
        renewalReminderLeadDays: 5,
      },
    ],
  );
  const [aviso] = avisos;
  conferir(
    "5 dias antes de 20/09 → 00:01 do dia 15/09",
    aviso?.quando.getDate() === 15 && aviso?.quando.getHours() === 0 &&
      aviso?.quando.getMinutes() === 1,
    aviso ? quandoLegivel(aviso.quando) : "nenhum aviso planejado",
  );
}

console.log(`\n${passou} passaram, ${falhou} falharam\n`);
process.exit(falhou > 0 ? 1 : 0);
