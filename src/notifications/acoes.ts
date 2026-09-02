/**
 * As ações rápidas do aviso — os identificadores que viajam com a notificação e voltam no toque.
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
 *
 * ## Por que este arquivo encolheu
 *
 * Ele registrava **quatro categorias** no `expo-notifications`, para cobrir as combinações de "uma
 * ou várias doses" × "pode adiar ou não" — categorias precisavam existir no sistema *antes* do
 * agendamento, e a escolha era feita por uma função que traduzia contagem em nome de categoria.
 *
 * No Notifee os botões vão **na própria notificação**, montados na hora a partir do aviso. A
 * indireção inteira deixou de ter função, e com ela a chance de agendar apontando para uma
 * categoria que não corresponde ao que o aviso realmente oferece.
 */

export const ACAO_TOMEI = "tomei";
export const ACAO_ADIAR = "adiar";

/** Quanto tempo o adiamento empurra o aviso. Um só por horário — ver `snoozeCount`. */
export const MINUTOS_DE_ADIAMENTO = 5;
