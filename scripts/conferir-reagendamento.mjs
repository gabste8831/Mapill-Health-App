/**
 * Confere o que sobrevive a uma **edição** de tratamento.
 *
 * O caminho de edição é o mais arriscado do bloco de avisos, e é o único que o
 * `conferir-ids-de-aviso` não cobre: ele prova que a geração é correta a partir de um estado
 * limpo, e aqui o que se testa é a transição de um estado para outro — apagar as doses futuras,
 * gerar as novas, cancelar os avisos e reagendar.
 *
 * O sintoma que motivou o script: depois de editar horários e dose várias vezes no mesmo remédio,
 * o alarme deixou de tocar enquanto as notificações continuavam chegando.
 *
 * Roda em Node, sem aparelho: `planejarAvisosDeDose` é regra pura e recebe o `agora` injetado.
 */
import { planejarAvisosDeDose } from "../src/domain/use-cases/planejar-avisos-de-dose.ts";

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

const agora = new Date("2026-09-05T19:50:00");
const ate = new Date(agora.getTime() + 7 * 24 * 60 * 60_000);

function dose(scheduledFor, reminderMode, extras = {}) {
  return {
    doseScheduleId: `d-${scheduledFor}`,
    scheduledFor: new Date(scheduledFor).toISOString(),
    medicationName: "Losartana",
    quantidadeFormatada: "1 comprimido",
    reminderMode,
    jaResolvida: false,
    jaAdiada: false,
    ...extras,
  };
}

// --- 1. O modo do aviso sobrevive à edição -----------------------------------------------------
{
  const avisos = planejarAvisosDeDose({
    doses: [dose("2026-09-05T21:00:00", "alarm")],
    agora,
    ate,
  });
  conferir(
    "dose com modo alarm gera aviso de alarme",
    avisos.length === 1 && avisos[0].modo === "alarm",
    `gerou ${avisos.length} aviso(s), modo=${avisos[0]?.modo}`,
  );
}

// --- 2. Horário de hoje que já passou ----------------------------------------------------------
{
  const avisos = planejarAvisosDeDose({
    doses: [dose("2026-09-05T19:45:00", "alarm")],
    agora,
    ate,
  });
  conferir(
    "horario de hoje ja passado (5 min) nao vira aviso",
    avisos.length === 0,
    `gerou ${avisos.length} — dose vencida nao deve ser reagendada`,
  );
}

// --- 3. A tolerância de atraso ------------------------------------------------------------------
{
  const avisos = planejarAvisosDeDose({
    doses: [dose("2026-09-05T19:49:00", "alarm")],
    agora,
    ate,
  });
  conferir(
    "horario ha 1 min ainda vira aviso (tolerancia de 2 min)",
    avisos.length === 1,
    `gerou ${avisos.length}`,
  );
}

// --- 4. Vários horários do mesmo remédio, todos com alarme --------------------------------------
{
  const avisos = planejarAvisosDeDose({
    doses: [
      dose("2026-09-05T20:00:00", "alarm"),
      dose("2026-09-05T21:00:00", "alarm"),
      dose("2026-09-05T22:00:00", "alarm"),
    ],
    agora,
    ate,
  });
  const todosAlarme = avisos.every((aviso) => aviso.modo === "alarm");
  conferir(
    "tres horarios com alarme geram TRES avisos de alarme",
    avisos.length === 3 && todosAlarme,
    `gerou ${avisos.length}, modos=${avisos.map((a) => a.modo).join(",")}`,
  );
}

// --- 5. "Os dois" aposentado: vale como alarme ---------------------------------------------------
{
  const avisos = planejarAvisosDeDose({
    doses: [dose("2026-09-05T21:00:00", "both")],
    agora,
    ate,
  });
  // A opção saiu da tela em 05/09 (ver `ReminderMode`): dois avisos vivos para a mesma dose eram
  // dois caminhos de confirmação a manter em sincronia, e o desconto saía dobrado. Um valor gravado
  // antes da remoção não pode deixar de avisar — ele vale como alarme, o modo mais forte.
  conferir(
    "modo 'both' gravado antes da remocao vale como alarme, e gera UM aviso",
    avisos.length === 1 && avisos[0].modo === "alarm",
    `gerou ${avisos.length} aviso(s), modo=${avisos[0]?.modo}`,
  );
}

// --- 6. Dose já resolvida não volta a avisar ------------------------------------------------------
{
  const avisos = planejarAvisosDeDose({
    doses: [dose("2026-09-05T21:00:00", "alarm", { jaResolvida: true })],
    agora,
    ate,
  });
  conferir("dose ja confirmada nao gera aviso", avisos.length === 0, `gerou ${avisos.length}`);
}

// --- 7. Chaves únicas: dois avisos nunca colidem -------------------------------------------------
{
  const avisos = planejarAvisosDeDose({
    doses: [
      dose("2026-09-05T20:00:00", "alarm"),
      dose("2026-09-05T21:00:00", "alarm"),
      dose("2026-09-06T20:00:00", "alarm"),
    ],
    agora,
    ate,
  });
  const chaves = new Set(avisos.map((aviso) => aviso.chave));
  conferir(
    "cada horario tem chave unica (senao um sobrescreve o outro)",
    chaves.size === avisos.length,
    `${avisos.length} avisos, ${chaves.size} chaves distintas`,
  );
}

// --- 8. O gatilho nunca no passado --------------------------------------------------------------
{
  /**
   * O defeito visto em aparelho (09/09): o Notifee recusa um timestamp vencido com
   * `trigger timestamp date must be in the future`, e a exceção derrubava o reagendamento inteiro.
   *
   * A dose que **acabou de vencer** entra de propósito — a tolerância existe para o aviso das 08:00
   * não se perder quando o app é reaberto às 08:00:30 —, mas o instante que vai ao agendador
   * precisa estar no futuro.
   */
  // Local, e não `toISOString()`: o `agora` do script é hora local, e o `dose()` monta o horário do
  // mesmo jeito. Misturar os dois deslocaria o caso pelo fuso e testaria outra coisa.
  const p = (v) => String(v).padStart(2, "0");
  const local = (data) =>
    `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}T${p(data.getHours())}:${p(data.getMinutes())}:${p(data.getSeconds())}`;

  const doisMinutosAtras = local(new Date(agora.getTime() - 2 * 60_000));
  const avisos = planejarAvisosDeDose({
    doses: [dose(doisMinutosAtras, "alarm")],
    agora,
    ate,
  });

  conferir(
    "a dose que acabou de vencer ainda gera aviso (a tolerancia vale)",
    avisos.length === 1,
    `gerou ${avisos.length}`,
  );
  conferir(
    "e o instante dele esta no futuro, nao no passado",
    avisos.every((aviso) => aviso.quando.getTime() > agora.getTime()),
    avisos[0] ? `${avisos[0].quando.toISOString()} vs agora ${agora.toISOString()}` : "nenhum aviso",
  );
  conferir(
    "sem se afastar mais que alguns segundos do agora",
    avisos.every((aviso) => aviso.quando.getTime() - agora.getTime() < 10_000),
  );
}

{
  // A dose no futuro não é tocada: o piso só age sobre o que já venceu.
  const daquiUmaHora = new Date(agora.getTime() + 60 * 60_000);
  const [aviso] = planejarAvisosDeDose({
    doses: [dose("2026-09-05T20:50:00", "alarm")],
    agora,
    ate,
  });
  conferir(
    "dose no futuro mantem o horario exato",
    aviso !== undefined && aviso.quando.getTime() === daquiUmaHora.getTime(),
    aviso ? `${aviso.quando.toISOString()} vs esperado ${daquiUmaHora.toISOString()}` : "nenhum",
  );
}

console.log(`\n${passaram} verificações passaram, ${falharam} falharam.`);
if (falharam > 0) process.exitCode = 1;
