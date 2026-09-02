/**
 * Confere as regras de id dos avisos agendados.
 *
 * **Por que existe.** Na unificação em torno do Notifee (02/09) o id do agendamento passou a
 * carregar um prefixo quando o aviso é alarme (`alarme:`), e o lembrete adiado já carregava o seu
 * (`adiado-`). Como o adiado é agendado com `modo: "alarm"` — ele precisa interromper como o aviso
 * original —, seu id fica com **os dois**: `alarme:adiado-…`.
 *
 * Isso quebra o filtro óbvio. `cancelarTudo` preserva o adiado testando o prefixo, e comparar o id
 * cru falharia: o aviso que a função existe para preservar seria apagado a cada reagendamento, em
 * silêncio, e a pessoa perderia o lembrete que ela mesma pediu cinco minutos antes.
 *
 * O bug foi encontrado escrevendo a migração, e este script existe para que ele não volte: são
 * regras de string puras, então rodam em Node sem aparelho e sem banco.
 *
 * Rodar após mexer em prefixo de id ou no filtro de `cancelarTudo`:
 *
 *     node scripts/conferir-ids-de-aviso.mjs
 */

const PREFIXO_ADIADO = "adiado-";
const PREFIXO_ALARME = "alarme:";

const idDoAviso = (aviso) =>
  aviso.modo === "alarm" ? `${PREFIXO_ALARME}${aviso.chave}` : aviso.chave;
const chaveDoId = (id) =>
  id.startsWith(PREFIXO_ALARME) ? id.slice(PREFIXO_ALARME.length) : id;
const ehAdiado = (id) => chaveDoId(id).startsWith(PREFIXO_ADIADO);
const ehAlarme = (id) => id.startsWith(PREFIXO_ALARME);

let ok = 0, falhou = 0;
const checar = (nome, cond, det) => {
  if (cond) ok++;
  else { falhou++; console.log(`  FALHOU: ${nome}${det ? ` — ${det}` : ""}`); }
};

const dose = { chave: "dose-2026-09-02T08:00:00.000Z" };
const compromisso = { chave: "compromisso-abc" };
const adiado = { chave: "adiado-2026-09-02T08:05:00.000Z" };

// 1 — O alarme é reconhecível; o lembrete não é confundido com alarme.
{
  checar("1. alarme marcado", ehAlarme(idDoAviso({ ...dose, modo: "alarm" })));
  checar("1. lembrete não é alarme", !ehAlarme(idDoAviso({ ...dose, modo: "notification" })));
  checar("1. compromisso não é alarme", !ehAlarme(idDoAviso({ ...compromisso, modo: "notification" })));
}

// 2 — O BUG QUE ISTO PEGOU: o lembrete adiado é agendado com `modo: "alarm"`, então seu id fica
//     `alarme:adiado-…`. Um filtro que comparasse o id cru com PREFIXO_ADIADO não o reconheceria,
//     e `cancelarTudo` apagaria justamente o aviso que ele existe para preservar.
{
  const id = idDoAviso({ ...adiado, modo: "alarm" });
  checar("2. id do adiado tem os dois prefixos", id === "alarme:adiado-2026-09-02T08:05:00.000Z", id);
  checar("2. adiado é reconhecido apesar do prefixo de alarme", ehAdiado(id), id);
  checar("2. filtro ingênuo falharia", !id.startsWith(PREFIXO_ADIADO),
    "se este passasse, o teste não provaria nada");
}

// 3 — Adiado sem prefixo de alarme (modo notification) também é reconhecido.
{
  checar("3. adiado simples", ehAdiado(idDoAviso({ ...adiado, modo: "notification" })));
}

// 4 — cancelarTudo: preserva só o adiado, apaga o resto — inclusive alarmes.
{
  const pendentes = [
    idDoAviso({ ...dose, modo: "alarm" }),
    idDoAviso({ ...dose, modo: "notification" }),
    idDoAviso({ ...compromisso, modo: "notification" }),
    idDoAviso({ ...adiado, modo: "alarm" }),
  ];
  const alvos = pendentes.filter((id) => !ehAdiado(id));

  checar("4. apaga três", alvos.length === 3, `apagou ${alvos.length}`);
  checar("4. preserva o adiado", !alvos.some(ehAdiado));
  checar("4. apaga o alarme da grade", alvos.some((id) => ehAlarme(id) && !ehAdiado(id)));
  checar("4. apaga o compromisso", alvos.includes("compromisso-abc"));
}

// 5 — Dispensa por chave alcança o alarme, cujo id não é a chave.
{
  const chave = dose.chave;
  const tentativas = [chave, `${PREFIXO_ALARME}${chave}`];
  checar("5. alcança o lembrete", tentativas.includes(idDoAviso({ ...dose, modo: "notification" })));
  checar("5. alcança o alarme", tentativas.includes(idDoAviso({ ...dose, modo: "alarm" })));
}

// 6 — Chave estável: mesmo horário, mesmo id. É o que faz reagendar ser idempotente.
{
  const a = idDoAviso({ ...dose, modo: "alarm" });
  const b = idDoAviso({ chave: "dose-2026-09-02T08:00:00.000Z", modo: "alarm" });
  checar("6. id é estável para o mesmo horário", a === b);
}

console.log(`\n${ok} verificações passaram, ${falhou} falharam.`);
process.exit(falhou === 0 ? 0 : 1);
