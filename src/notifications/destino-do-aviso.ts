/**
 * Para onde o toque leva, quando o aviso **não** é de dose.
 *
 * Estoque, receita e compromisso não têm o que responder na notificação — não há "tomei" nem
 * "pulei". O que a pessoa quer ao tocar é chegar onde se resolve aquilo, e cada um resolve num
 * lugar: repor estoque é na tela de estoque, renovar receita é no cadastro do remédio, e um
 * compromisso se confere na lista com o detalhe aberto.
 *
 * Sem isto o toque abria a Home, e a pessoa tinha de reencontrar sozinha o assunto que a
 * notificação acabara de nomear — pior justamente no caso que o aviso existe para cobrir, quem
 * abriu o celular por causa dele e não estava no app.
 *
 * Mora em arquivo próprio, separado de `escutar-avisos`, porque é **regra pura**: não toca no
 * Notifee nem em navegação, e é isso que permite verificá-la em Node
 * (`scripts/conferir-destino-do-aviso.mjs`). O listener importa daqui.
 */
export type DestinoDoAviso =
  | { tela: "estoque" }
  | { tela: "medicamento"; prescriptionId: string }
  | { tela: "compromissos"; appointmentId: string };

/**
 * Os sufixos que os planejadores acrescentam à chave para distinguir os dois avisos do mesmo item.
 *
 * Removidos por **âncora de fim**, e não cortando no primeiro hífen: os ids são UUID e têm hífen
 * dentro, então `split("-")` devolveria `3f2504e0` no lugar do id inteiro. `no-dia` também tem
 * hífen, e por isso o padrão casa o sufixo completo.
 */
const SUFIXOS = /-(baixo|acabou|antes|no-dia)$/;

/**
 * O destino que a chave do aviso pede, ou `null` quando é aviso de dose.
 *
 * A chave já carrega o tipo e o id (`estoque-<inventoryId>-baixo`, `receita-<prescriptionId>-antes`,
 * `compromisso-<appointmentId>-no-dia`), montada pelos planejadores. Ler dali evita gravar um campo
 * novo em cada aviso só para dizer o que a chave já diz — e um campo a mais é mais uma coisa que
 * pode divergir do que o planejador escreveu.
 *
 * `null` para dose é deliberado: ela abre a tela do horário ou a do alarme, e quem decide entre as
 * duas é o listener, que sabe se o aviso é de tela cheia. Devolver um destino aqui faria o toque
 * navegar **sem** registrar a dose.
 */
export function destinoDaChave(chave: string): DestinoDoAviso | null {
  if (chave.startsWith("estoque-")) {
    // A tela de estoque lista tudo e é onde se repõe — não há detalhe por item que valha mais.
    return { tela: "estoque" };
  }
  if (chave.startsWith("receita-")) {
    const prescriptionId = chave.slice("receita-".length).replace(SUFIXOS, "");
    if (prescriptionId.length === 0) return null;
    return { tela: "medicamento", prescriptionId };
  }
  if (chave.startsWith("compromisso-")) {
    const appointmentId = chave.slice("compromisso-".length).replace(SUFIXOS, "");
    if (appointmentId.length === 0) return null;
    return { tela: "compromissos", appointmentId };
  }
  return null;
}
