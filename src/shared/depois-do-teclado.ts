import { Keyboard } from "react-native";

/** Reserva para o caso de o `keyboardDidHide` não vir: melhor abrir torto do que não abrir. */
const TEMPO_LIMITE_MS = 500;

/**
 * Roda `acao` só depois que o teclado terminar de fechar, ou na hora se ele já estiver fechado.
 *
 * Existe por causa do relógio e do calendário nativos: o `BottomSheet` se mede pela altura do
 * teclado, e se o popup abre com ele de pé o mostrador nasce no espaço que sobrava e não acompanha
 * quando o teclado desce. Abrindo depois, o popup já nasce no tamanho certo.
 */
export function depoisDoTeclado(acao: () => void): void {
  if (!Keyboard.isVisible()) {
    acao();
    return;
  }

  let feito = false;
  const executar = () => {
    if (feito) return;
    feito = true;
    assinatura.remove();
    clearTimeout(reserva);
    acao();
  };

  const assinatura = Keyboard.addListener("keyboardDidHide", executar);
  const reserva = setTimeout(executar, TEMPO_LIMITE_MS);
  Keyboard.dismiss();
}
