/**
 * Quem já tem a tela do alarme na frente — e é o que impede **duas** ao mesmo tempo.
 *
 * A tela tem dois pontos de entrada, e ambos são necessários: a Activity que o Notifee monta pelo
 * `fullScreenAction` (por cima do bloqueio, sem navegação nenhuma) e a rota `/alarme/[instante]`,
 * que o listener empurra quando o alarme chega com o app aberto — aí o Android rebaixa a tela cheia
 * para heads-up, e um aviso discreto no topo é o que se ignora sem perceber.
 *
 * Os dois vivem no **mesmo processo JavaScript**: o `index.js` registra o componente nativo e logo
 * abaixo sobe o app inteiro. Quando o alarme irrompe com o app em segundo plano, as duas coisas
 * acontecem — e o sintoma é som duplicado, com uma tela por cima da outra.
 *
 * **Por que um módulo, e não estado de React:** os dois lados não compartilham árvore de
 * componentes (um é `AppRegistry`, o outro é o roteador). O que compartilham é o módulo. Um `Set`
 * em componente seria zerado a cada montagem, e a trava não travaria nada.
 */

/**
 * Os horários cuja tela já está em cena, e por qual caminho.
 *
 * O caminho importa: a Activity tem precedência sobre a rota, porque é ela que o sistema pôs na
 * frente — ver `quemEstaEmCena`, que permite à rota ceder lugar.
 */
const emCena = new Map<string, "activity" | "rota">();

/**
 * A Activity do alarme está **nascendo**, mas ainda não sabe de qual horário é.
 *
 * `AlarmeRaiz` precisa de duas coisas assíncronas antes de montar a tela — abrir o banco e
 * descobrir o horário — e só então `AlarmeScreen` chama `entrouEmCena`. Entre o nascimento da
 * Activity e esse registro há uma janela em que `jaEstaEmCena` responderia `false` para um horário
 * cuja tela **está subindo agora**. É nessa janela que a MIUI entrega um `PRESS` da notificação sem
 * ninguém ter tocado em nada, e a tela azul era fechada e substituída pela do horário.
 *
 * **Sem horário, de propósito:** no instante em que a Activity nasce ele ainda não foi lido — é o
 * que ela está indo buscar. "Alguma tela de alarme está subindo" é tudo o que dá para saber, e
 * basta: existe no máximo uma por vez.
 *
 * **E vale enquanto a Activity vive, não por um prazo.** Uma primeira versão apagava o sinalizador
 * por `setTimeout` de 4 s, e num arranque frio abrir o banco passa disso sem dificuldade — a janela
 * cega reabria com a tela ainda no loader. O que precisa ser sabido não é tempo decorrido, é se a
 * Activity ainda está viva; quem sabe disso é o cleanup do efeito em `AlarmeRaiz`.
 */
let activityNascendo = false;

/**
 * A Activity já se registrou com horário, e portanto **não é mais cega**.
 *
 * Separa os dois estados de uma Activity viva. Enquanto ela sobe, a única resposta honesta a
 * `jaEstaEmCena` é "sim" para qualquer horário; depois que ela se registra, o mapa responde com
 * precisão — e aí a resposta cega passaria a atrapalhar um segundo alarme, recusando a rota dele.
 *
 * Não dá para apagar `activityNascendo` aqui: a Activity **continua viva**, e é a vida dela — não o
 * registro — que o cleanup desfaz.
 */
let activityConhecida = false;

/**
 * O horário do alarme que disparou por último — a **rede de segurança** do `AlarmeRaiz`.
 *
 * A tela descobre de qual horário é lendo a notificação: `getInitialNotification` e, se falhar,
 * varrendo a bandeja. Mas o caminho do `PRESS` **cancela a notificação** ao tratar o toque, e as
 * duas coisas correm juntas — medido em 70 ms entre a tela montar e o aviso sumir. Quando ela vai
 * procurar, não há mais o que procurar.
 *
 * O valor é gravado na **entrega**, antes de existir toque para cancelar coisa alguma, e não
 * expira: sobrescrever no alarme seguinte é o certo, porque interessa sempre o último que disparou.
 * Guardar só o instante basta — a tela relê o banco a partir dele, então não há dado de saúde em
 * memória.
 */
let ultimoHorarioEntregue: string | null = null;

/**
 * Anota o horário do alarme entregue — chamado pelo listener, no `DELIVERED`.
 *
 * Antes de qualquer cancelamento: é justamente o `PRESS` que apaga a notificação, e quando ele
 * chega este valor já precisa estar guardado.
 */
export function anotarHorarioEntregue(scheduledFor: string): void {
  ultimoHorarioEntregue = scheduledFor;
}

/**
 * O horário do último alarme entregue, ou `null` se nenhum passou por aqui nesta execução.
 *
 * `AlarmeRaiz` usa como penúltimo recurso: depois da notificação inicial e da bandeja, antes de
 * cair no horário atual. A ordem importa — a notificação é sempre a fonte mais precisa, e isto só
 * responde quando ela não existe mais.
 */
export function horarioEntregueMaisRecente(): string | null {
  return ultimoHorarioEntregue;
}

/**
 * Marca que a tela do alarme deste horário está na frente.
 *
 * Chamado pela própria tela ao montar, e não por quem a abre: é a montagem que prova que ela
 * existe. Quem abre pode falhar no meio (uma Activity que o sistema recusa, um `push` num roteador
 * que ainda não subiu), e marcar antes deixaria a trava presa num alarme que nunca apareceu.
 */
export function entrouEmCena(scheduledFor: string, por: "activity" | "rota"): void {
  /**
   * A **Activity** assumiu com horário: ela deixa de ser "cega" e passa a ser conhecida.
   *
   * Daqui em diante quem responde por ela é o registro por horário, que é mais preciso. Manter o
   * sinalizador cego ligado faria `jaEstaEmCena` responder `true` para **qualquer** horário —
   * inclusive um alarme diferente disparando enquanto esta tela está aberta, cuja rota o listener
   * então recusaria abrir.
   *
   * `activityConhecida` e não `activityNascendo = false` porque a Activity **continua viva**: se ela
   * sair de cena e o cleanup rodar, é o registro por horário que sai junto. Ver `saiuDeCena`.
   *
   * **Só a Activity converte.** A rota não: ela pode montar enquanto a Activity ainda sobe (é o
   * caminho tardio de `use-dose-notifications`, que abre a tela quando ninguém assumiu), e converter
   * ali reabriria a janela cega no meio exato da corrida que este sinalizador existe para vencer.
   */
  if (por === "activity") activityConhecida = true;

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
 * A Activity do alarme começou a subir — chamado por `AlarmeRaiz` **antes** de qualquer `await`.
 *
 * Fecha a janela cega descrita em `activityNascendo`. A partir daqui, `jaEstaEmCena` responde `true`
 * para qualquer horário, porque uma tela de alarme está a caminho e ainda não se sabe de qual.
 */
export function activityDeAlarmeNascendo(): void {
  activityNascendo = true;
}

/**
 * A Activity terminou de subir (e se registrou) ou desistiu — chamado por `AlarmeRaiz` no fim.
 *
 * Precisa acontecer **sempre**, inclusive no caminho de erro: deixado ligado, o sinalizador faria o
 * listener recusar para sempre abrir a rota do alarme, e o app perderia a tela azul no caso em que
 * ele mesmo precisa abri-la (ver `use-dose-notifications`).
 */
export function activityDeAlarmeParouDeNascer(): void {
  activityNascendo = false;
  activityConhecida = false;
}

/**
 * Se já há tela na frente para este horário — **ou uma Activity a caminho**.
 *
 * É a pergunta que o listener faz antes de empurrar a rota: com a Activity nativa já de pé, abrir
 * a rota produz a segunda tela — e o segundo som. E é a mesma pergunta que a guarda do `PRESS` faz
 * antes de trocar a tela azul pela de horário.
 *
 * O `activityNascendo` entra aqui porque a resposta honesta durante a montagem é "sim, vai ter tela"
 * — e não "não tem nenhuma", que era o que este registro dizia enquanto a Activity carregava o banco
 * e procurava o horário. Errar para "sim" custa, no pior caso, um toque legítimo ignorado enquanto a
 * tela sobe; errar para "não" custa a tela azul inteira, que é o defeito de 12/09.
 *
 * A resposta cega vale **só até a Activity se registrar** (`activityConhecida`). Depois disso o mapa
 * por horário é mais preciso e assume sozinho: sem esse recorte, um segundo alarme disparando com a
 * primeira tela aberta teria a rota recusada por uma guarda que não sabe nada sobre ele.
 */
export function jaEstaEmCena(scheduledFor: string): boolean {
  if (activityNascendo && !activityConhecida) return true;
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
