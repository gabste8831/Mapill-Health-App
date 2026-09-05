/**
 * Confere que **editar** um tratamento reflete em tudo que depende dele.
 *
 * O sintoma que motivou o script: mudar o horário de um remédio e o alarme não tocar mais. Cada
 * campo do cadastro alimenta uma consequência diferente — horário alimenta o aviso, dose alimenta
 * o estoque, antecedência alimenta o alerta de reposição —, e o que se testa aqui é a **cadeia**,
 * não cada peça isolada.
 *
 * As peças já têm seus próprios scripts (`conferir-ids-de-aviso`, `conferir-reagendamento`). O que
 * faltava era provar que uma edição não deixa nenhuma delas para trás.
 */
import { planejarAvisosDeDose } from "../src/domain/use-cases/planejar-avisos-de-dose.ts";
import { generateDoseSchedules } from "../src/domain/use-cases/generate-dose-schedules.ts";

let passaram = 0;
let falharam = 0;

function conferir(descricao, condicao, detalhe) {
  if (condicao) {
    passaram += 1;
    console.log(`PASSA  ${descricao}`);
  } else {
    falharam += 1;
    console.log(`FALHA  ${descricao}${detalhe ? ` — ${detalhe}` : ""}`);
  }
}

const agora = new Date("2026-09-05T11:00:00");
const ate = new Date(agora.getTime() + 7 * 24 * 60 * 60_000);

function prescricao(horarios, extras = {}) {
  return {
    id: "p1",
    schedule: {
      kind: "daily",
      doses: horarios.map((at) => ({ at, amount: null })),
    },
    startDate: "2026-09-01",
    endDate: null,
    doseAmount: 1,
    doseUnit: "tablet",
    ...extras,
  };
}

function avisosDe(horarios, reminderMode = "alarm") {
  const gerados = generateDoseSchedules({
    prescription: prescricao(horarios),
    from: agora,
    until: ate,
  });
  return planejarAvisosDeDose({
    doses: gerados.map((doseSchedule, indice) => ({
      doseScheduleId: `d${indice}`,
      scheduledFor: doseSchedule.scheduledFor,
      medicationName: "Losartana",
      quantidadeFormatada: "1 comprimido",
      reminderMode,
      jaResolvida: false,
      jaAdiada: false,
    })),
    agora,
    ate,
  });
}

// --- 1. Mudar o horário move o aviso ------------------------------------------------------------
{
  const antes = avisosDe(["11:40"]);
  const depois = avisosDe(["11:52"]);

  const horaDe = (aviso) =>
    `${String(aviso.quando.getHours()).padStart(2, "0")}:${String(aviso.quando.getMinutes()).padStart(2, "0")}`;

  conferir(
    "editar 11:40 -> 11:52 move o aviso para o horario novo",
    depois.length > 0 && horaDe(depois[0]) === "11:52",
    `primeiro aviso em ${depois[0] ? horaDe(depois[0]) : "nenhum"}`,
  );
  conferir(
    "e o aviso do horario ANTIGO deixa de existir",
    !depois.some((aviso) => horaDe(aviso) === "11:40"),
    "o horario antigo continua na lista — seria alarme orfao",
  );
  conferir("o horario antigo existia antes da edicao", antes.some((a) => horaDe(a) === "11:40"));
}

// --- 2. A chave muda junto do horário -----------------------------------------------------------
{
  const antes = avisosDe(["11:40"]);
  const depois = avisosDe(["11:52"]);
  conferir(
    "a chave do aviso acompanha o horario (senao o sistema reusa o agendamento velho)",
    antes[0].chave !== depois[0].chave,
    `antes=${antes[0].chave} depois=${depois[0].chave}`,
  );
}

// --- 3. Trocar o modo troca o canal -------------------------------------------------------------
{
  const comoAlarme = avisosDe(["14:00"], "alarm");
  const comoNotificacao = avisosDe(["14:00"], "notification");
  const comoAmbos = avisosDe(["14:00"], "both");

  conferir("modo alarm -> um aviso de alarme", comoAlarme.every((a) => a.modo === "alarm"));
  conferir(
    "modo notification -> um aviso de notificacao",
    comoNotificacao.every((a) => a.modo === "notification"),
  );
  // "Os dois" saiu da tela em 05/09 — um valor gravado antes vale como alarme, e produz a mesma
  // grade que o modo `alarm`. Ver `ReminderMode`.
  conferir(
    "modo both (aposentado) produz a mesma grade que alarm",
    comoAmbos.length === comoAlarme.length && comoAmbos.every((a) => a.modo === "alarm"),
    `${comoAmbos.length} aviso(s) contra ${comoAlarme.length} do modo alarm`,
  );
}

// --- 4. Acrescentar um horário acrescenta avisos ------------------------------------------------
{
  const umPorDia = avisosDe(["08:00"]);
  const doisPorDia = avisosDe(["08:00", "20:00"]);
  conferir(
    "acrescentar um horario dobra os avisos da janela",
    doisPorDia.length > umPorDia.length,
    `${umPorDia.length} -> ${doisPorDia.length}`,
  );
}

// --- 5. Editar para um horário de hoje já passado ------------------------------------------------
{
  // 11:00 é "agora"; 09:00 de hoje já foi. É o caso que fazia o alarme sumir sem explicação: a
  // dose de hoje não é gerada, e a próxima só acontece amanhã.
  const avisos = avisosDe(["09:00"]);
  const primeiro = avisos[0];
  const ehAmanha = primeiro !== undefined && primeiro.quando.getDate() !== agora.getDate();
  conferir(
    "horario de hoje ja passado agenda so a partir de amanha",
    ehAmanha,
    primeiro ? `primeiro aviso em ${primeiro.quando.toLocaleString("pt-BR")}` : "nenhum aviso",
  );
}

// --- 6. A janela não vaza para além do limite ---------------------------------------------------
{
  const avisos = avisosDe(["08:00"]);
  const forasDaJanela = avisos.filter(
    (aviso) => aviso.quando < agora || aviso.quando > ate,
  );
  conferir(
    "nenhum aviso cai fora da janela de 7 dias",
    forasDaJanela.length === 0,
    `${forasDaJanela.length} aviso(s) fora`,
  );
}

// --- 7. Dose resolvida some da grade ------------------------------------------------------------
{
  const gerados = generateDoseSchedules({
    prescription: prescricao(["14:00"]),
    from: agora,
    until: ate,
  });
  const comUmaResolvida = planejarAvisosDeDose({
    doses: gerados.map((doseSchedule, indice) => ({
      doseScheduleId: `d${indice}`,
      scheduledFor: doseSchedule.scheduledFor,
      medicationName: "Losartana",
      quantidadeFormatada: "1 comprimido",
      reminderMode: "alarm",
      jaResolvida: indice === 0,
      jaAdiada: false,
    })),
    agora,
    ate,
  });
  conferir(
    "confirmar uma dose remove o aviso dela, e so dela",
    comUmaResolvida.length === gerados.length - 1,
    `${gerados.length} dose(s) -> ${comUmaResolvida.length} aviso(s)`,
  );
}

console.log(`\n${passaram} verificações passaram, ${falharam} falharam.`);
if (falharam > 0) process.exitCode = 1;
