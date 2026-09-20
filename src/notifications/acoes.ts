/**
 * Os identificadores das acoes rapidas que viajam com a notificacao e voltam no toque.
 *
 * "Tomei" confirma sem abrir o app: e exceção consciente a confirmacao visual que acoes criticas
 * exigem, aceitavel porque a Home oferece correcao e nada aqui e irreversivel.
 *
 * "Adiar" nao registra desfecho nenhum, so reagenda. Num horario com mais de uma dose, quem adia
 * nao esta afirmando nada sobre elas, e gravar um log ali inventaria uma resposta que ninguem deu.
 * Resposta parcial se resolve na tela do horario.
 */

export const ACAO_TOMEI = "tomei";
/** O relatorio distingue "pulada" de "sem registro", e sem este botao nao havia como dizer a primeira. */
export const ACAO_PULEI = "pulei";
export const ACAO_ADIAR = "adiar";

/** Um adiamento so por horario - ver `snoozeCount`. */
export const MINUTOS_DE_ADIAMENTO = 5;
