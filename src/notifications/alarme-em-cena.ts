/**
 * Trava que impede duas telas de alarme ao mesmo tempo.
 *
 * A tela tem dois pontos de entrada - a Activity do `fullScreenAction` e a rota
 * `/alarme/[instante]` - e os dois vivem no mesmo processo JS, então um alarme em segundo plano
 * dispara ambos. A Activity tem precedência; a rota cede lugar.
 *
 * Estado de módulo porque os dois lados não compartilham árvore de componentes.
 */

const emCena = new Map<string, "activity" | "rota">();

/**
 * A Activity está subindo e ainda não sabe de qual horário é.
 *
 * Nessa janela a MIUI entrega um `PRESS` sem ninguém tocar em nada. Vale enquanto a Activity vive,
 * e não por um prazo: um timeout não cobre arranque frio.
 */
let activityNascendo = false;

/** A Activity já se registrou com horário; a partir daí o mapa responde sozinho. */
let activityConhecida = false;

/** Gravado na entrega porque o `PRESS` cancela a notificação antes de a tela conseguir lê-la. */
let ultimoHorarioEntregue: string | null = null;

export function anotarHorarioEntregue(scheduledFor: string): void {
  ultimoHorarioEntregue = scheduledFor;
}

export function horarioEntregueMaisRecente(): string | null {
  return ultimoHorarioEntregue;
}

/** Chamado pela própria tela ao montar: é a montagem que prova que ela existe. */
export function entrouEmCena(scheduledFor: string, por: "activity" | "rota"): void {
  // Só a Activity converte. A rota pode montar enquanto a Activity ainda sobe, e converter ali
  // reabriria a janela cega.
  if (por === "activity") activityConhecida = true;

  // A rota não sobrescreve a Activity, senão perderia como saber que deve ceder.
  if (por === "rota" && emCena.get(scheduledFor) === "activity") return;
  emCena.set(scheduledFor, por);
}

/** `por` evita que a rota, ao ceder lugar, leve embora o registro da Activity. */
export function saiuDeCena(scheduledFor: string, por: "activity" | "rota"): void {
  if (emCena.get(scheduledFor) !== por) return;
  emCena.delete(scheduledFor);
}

/** Chamado por `AlarmeRaiz` antes de qualquer `await`. */
export function activityDeAlarmeNascendo(): void {
  activityNascendo = true;
}

/** Precisa rodar sempre, inclusive no caminho de erro, senão a rota fica recusada para sempre. */
export function activityDeAlarmeParouDeNascer(): void {
  activityNascendo = false;
  activityConhecida = false;
}

/**
 * Se já há tela na frente para este horário, ou uma Activity a caminho.
 *
 * Errar para "sim" custa um toque ignorado enquanto a tela sobe; errar para "não" custa a tela
 * inteira. A resposta cega vale só até a Activity se registrar.
 */
export function jaEstaEmCena(scheduledFor: string): boolean {
  if (activityNascendo && !activityConhecida) return true;
  return emCena.has(scheduledFor);
}

/** Existe para a rota poder ceder lugar à Activity quando o `DELIVERED` chega antes dela montar. */
export function quemEstaEmCena(scheduledFor: string): "activity" | "rota" | null {
  return emCena.get(scheduledFor) ?? null;
}
