import * as Notifications from "expo-notifications";

/**
 * Ações rápidas na própria notificação.
 *
 * Existem duas categorias porque os botões mudam com a quantidade de doses do horário, e a
 * categoria é escolhida no agendamento — não dá para trocar botão depois que a notificação saiu.
 */
export const CATEGORIA_UMA_DOSE = "dose-unica";
export const CATEGORIA_VARIAS_DOSES = "dose-multipla";
/** Sem o botão de adiar: o horário já gastou seu único adiamento. */
export const CATEGORIA_UMA_DOSE_SEM_ADIAR = "dose-unica-sem-adiar";
export const CATEGORIA_VARIAS_SEM_ADIAR = "dose-multipla-sem-adiar";

export const ACAO_TOMEI = "tomei";
export const ACAO_ADIAR = "adiar";

/** Quanto tempo o adiamento empurra o aviso. Um só por horário — ver `snoozeCount`. */
export const MINUTOS_DE_ADIAMENTO = 5;

/**
 * Registra as categorias no sistema. Idempotente.
 *
 * **"Tomei" confirma direto, sem abrir o app.** Isso pula a confirmação visual que o projeto exige
 * para ações críticas, e é uma exceção consciente: tocar num botão rotulado "Tomei" já é uma ação
 * deliberada, e a fricção extra num app de adesão custa exatamente o que ele existe para
 * conseguir — doses registradas. O que torna a exceção aceitável é a Home oferecer correção óbvia
 * (`correct-intake` já existe), então nada aqui é irreversível.
 *
 * **"Adiar" não registra nada.** Ele só reagenda o aviso; nenhum log é gravado, nem `deferred`.
 * Isso importa quando o horário tem mais de uma dose: quem tomou uma e não a outra não está
 * afirmando nada sobre nenhuma delas ao adiar — está dizendo "me lembra de novo". Registrar um
 * desfecho ali inventaria uma resposta que ninguém deu. O aviso que volta em 5 minutos traz só o
 * que ainda estiver pendente.
 *
 * Resposta parcial ("tomei este, aquele não") se resolve tocando no corpo da notificação, que abre
 * a tela do horário com um Tomei/Pulei por dose. É o único lugar onde ela cabe sem ambiguidade.
 */
export async function registrarCategorias(): Promise<void> {
  const adiar: Notifications.NotificationAction = {
    identifier: ACAO_ADIAR,
    buttonTitle: `Adiar ${MINUTOS_DE_ADIAMENTO} min`,
    options: { opensAppToForeground: false },
  };

  const tomei = (titulo: string): Notifications.NotificationAction => ({
    identifier: ACAO_TOMEI,
    buttonTitle: titulo,
    options: { opensAppToForeground: false },
  });

  await Notifications.setNotificationCategoryAsync(CATEGORIA_UMA_DOSE, [tomei("Tomei"), adiar]);
  await Notifications.setNotificationCategoryAsync(CATEGORIA_VARIAS_DOSES, [
    // "Tomei todas" e não "Tomei": com dois remédios listados, o botão precisa dizer sobre quais
    // ele fala. É o rótulo que evita confirmar duas doses achando que confirmou uma.
    tomei("Tomei todas"),
    adiar,
  ]);

  // Sem adiar: o botão some em vez de aparecer e recusar. Oferecer o que não funciona é pior que
  // não oferecer — a pessoa toca, nada acontece, e ela deixa de confiar no aviso.
  await Notifications.setNotificationCategoryAsync(CATEGORIA_UMA_DOSE_SEM_ADIAR, [tomei("Tomei")]);
  await Notifications.setNotificationCategoryAsync(CATEGORIA_VARIAS_SEM_ADIAR, [
    tomei("Tomei todas"),
  ]);
}

/**
 * Qual categoria usar, dadas a quantidade de doses e se as ações rápidas cabem.
 *
 * `undefined` quando não há ação nenhuma a oferecer — o aviso sai só com o corpo, e tocar nele abre
 * o app. É o caso dos avisos de compromisso e de receita vencendo: "Tomei" não significa nada numa
 * consulta, e um botão que não faz sentido ensina a desconfiar dos que fazem.
 */
export function categoriaDoAviso(
  quantidadeDeDoses: number,
  semAcoesRapidas: boolean,
): string | undefined {
  if (quantidadeDeDoses === 0) return undefined;
  if (quantidadeDeDoses === 1) {
    return semAcoesRapidas ? CATEGORIA_UMA_DOSE_SEM_ADIAR : CATEGORIA_UMA_DOSE;
  }
  return semAcoesRapidas ? CATEGORIA_VARIAS_SEM_ADIAR : CATEGORIA_VARIAS_DOSES;
}
