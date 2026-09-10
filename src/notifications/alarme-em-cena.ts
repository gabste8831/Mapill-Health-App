/**
 * Quem já tem a tela do alarme na frente — e é o que impede **duas** ao mesmo tempo.
 *
 * ## O defeito que isto resolve
 *
 * A tela do alarme tem dois pontos de entrada, e os dois são necessários:
 *
 * - **`AlarmeRaiz`**, uma Activity que o Notifee monta pelo `fullScreenAction`, por cima da tela de
 *   bloqueio, sem passar por navegação nenhuma. É a promessa central do app.
 * - **A rota `/alarme/[instante]`**, empurrada pelo listener quando o `DELIVERED` chega com o app
 *   aberto — porque nesse caso o Android **rebaixa** o full-screen intent para um heads-up, e um
 *   aviso discreto no topo é o que se ignora sem perceber.
 *
 * O problema é que os dois vivem no **mesmo processo JavaScript**: o `index.js` registra o
 * componente nativo e, logo abaixo, `import "expo-router/entry"` sobe o app inteiro — incluindo o
 * `useDoseNotifications` que assina o `DELIVERED`. Então quando o alarme irrompe com o app rodando
 * em segundo plano, **as duas coisas acontecem**: a Activity sobe e o listener empurra a rota.
 *
 * O sintoma relatado em aparelho (09/09) descreve exatamente isso: o som sai **duplicado** — dois
 * players, um por tela —, e ao responder na de cima ela fecha e a de baixo pisca antes de também
 * se fechar por ver tudo resolvido.
 *
 * ## Por que um módulo, e não estado de React
 *
 * Porque os dois lados não compartilham árvore de componentes: um é `AppRegistry`, o outro é o
 * roteador. O que eles compartilham é o **módulo**, e é aí que a informação tem de morar. Um `Set`
 * em componente seria zerado a cada montagem, e a trava não travaria nada — a mesma razão do
 * `jaAbertos` em `escutar-avisos`.
 */

/**
 * Os horários cuja tela já está em cena, e por qual caminho.
 *
 * O caminho importa: a Activity nativa tem precedência sobre a rota, porque ela é a que o sistema
 * colocou na frente. Se a rota registrar primeiro e a Activity chegar depois, é a rota que deve
 * sair — mas isso não acontece na prática, porque o `fullScreenAction` é resolvido pelo Android
 * antes de o evento JS chegar ao listener.
 */
const emCena = new Map<string, "activity" | "rota">();

/**
 * Marca que a tela do alarme deste horário está na frente.
 *
 * Chamado pela própria tela ao montar, e não por quem a abre: é a montagem que prova que ela
 * existe. Quem abre pode falhar no meio (uma Activity que o sistema recusa, um `push` num roteador
 * que ainda não subiu), e marcar antes deixaria a trava presa num alarme que nunca apareceu.
 */
export function entrouEmCena(scheduledFor: string, por: "activity" | "rota"): void {
  /**
   * A rota **não sobrescreve** a Activity.
   *
   * As duas telas são o mesmo componente, e ele registra a si mesmo ao montar. Se a rota chegar
   * depois da Activity — a corrida que a rota resolve saindo de cena —, sobrescrever aqui apagaria
   * a informação de que a Activity está na frente, e a rota não teria como saber que deve ceder.
   *
   * O contrário pode sobrescrever: a Activity chegando por cima de uma rota é o sistema colocando
   * o alarme na frente, e aí é a rota que sai.
   */
  if (por === "rota" && emCena.get(scheduledFor) === "activity") return;
  emCena.set(scheduledFor, por);
}

/**
 * Desmarca ao sair. Sem isto, o horário ficaria travado para o resto da execução.
 *
 * `por` evita que a rota, ao ceder lugar, leve embora o registro da **Activity** que a fez sair —
 * o que deixaria o listener livre para empurrar uma rota nova por baixo dela, e o defeito voltaria
 * pela porta dos fundos.
 */
export function saiuDeCena(scheduledFor: string, por: "activity" | "rota"): void {
  if (emCena.get(scheduledFor) !== por) return;
  emCena.delete(scheduledFor);
}

/**
 * Se já há tela na frente para este horário.
 *
 * É a pergunta que o listener faz antes de empurrar a rota: com a Activity nativa já de pé, abrir
 * a rota produz a segunda tela — e o segundo som.
 */
export function jaEstaEmCena(scheduledFor: string): boolean {
  return emCena.has(scheduledFor);
}

/**
 * Por qual caminho a tela deste horário está em cena, ou `null` se não está.
 *
 * Existe para a rota poder **ceder lugar** à Activity. `jaEstaEmCena` responde a pergunta do
 * listener ("já tem alguém lá?"), mas não resolve a corrida: o `DELIVERED` pode chegar antes de a
 * Activity montar, e aí a rota entra sem ver nada. Ao montar, a rota pergunta *quem* está lá — e se
 * for a Activity, sai.
 *
 * A Activity vence porque é ela que o Android colocou na frente, sobre a tela de bloqueio.
 */
export function quemEstaEmCena(scheduledFor: string): "activity" | "rota" | null {
  return emCena.get(scheduledFor) ?? null;
}
