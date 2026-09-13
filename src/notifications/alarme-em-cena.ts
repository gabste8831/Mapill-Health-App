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
 * A Activity do alarme está **nascendo**, mas ainda não sabe de qual horário é.
 *
 * ## O defeito que isto resolve
 *
 * `AlarmeRaiz` precisa de duas coisas assíncronas antes de montar a tela: abrir o banco e descobrir
 * o horário (`getInitialNotification`, e às vezes uma segunda busca na bandeja). Só então
 * `AlarmeScreen` monta e chama `entrouEmCena`. Entre o nascimento da Activity e esse registro há uma
 * janela — pequena, mas real.
 *
 * Nessa janela o app está cego: `jaEstaEmCena` responde `false` para um horário cuja tela **está
 * subindo agora**. E é exatamente nessa janela que a MIUI entrega um `PRESS` da notificação na tela
 * de bloqueio, sem ninguém ter tocado em nada.
 *
 * O resultado é o que o Gabriel relatou em 12/09, e o padrão dos recentes é a assinatura da corrida:
 * com o app **nos recentes** o processo já está de pé, o `PRESS` chega quase junto do disparo e
 * vence a montagem — a tela azul é fechada e substituída pela de "Hora do remédio". Com o app **fora
 * dos recentes** o processo precisa subir inteiro, o que atrasa o `PRESS` o bastante para a Activity
 * chegar primeiro, e aí a tela azul fica.
 *
 * ## Por que um sinalizador sem horário
 *
 * Porque no instante em que a Activity nasce o horário ainda não foi lido — é justamente o que ela
 * está indo buscar. Guardar "alguma tela de alarme está subindo" é tudo o que dá para saber, e é o
 * suficiente: existe no máximo uma Activity de alarme por vez, e qualquer `PRESS` que chegue
 * enquanto ela sobe é sobre ela.
 *
 * ## Por que ele vale enquanto a Activity vive, e não por um tempo
 *
 * A primeira versão (12/09) apagava o sinalizador por `setTimeout`, 4 s depois de acendê-lo. O
 * Gabriel reportou em 13/09 que a tela azul **continuava intermitente**, e a razão é essa:
 *
 * `AlarmeRaiz` só monta `AlarmeScreen` — e só então alguém chama `entrouEmCena` — depois de o banco
 * abrir **e** o horário ser lido. Até lá ela devolve um loader. Abrir o banco num arranque frio, com
 * o aparelho parado há horas e o sistema ocupado subindo o processo, passa dos 4 s sem dificuldade.
 * O relógio apagava o sinalizador com a Activity ainda no loader, a janela cega reabria, e o `PRESS`
 * da MIUI voltava a vencer — justamente no cenário de madrugada, que é o que importa.
 *
 * Um relógio não podia acertar isso: ele mede tempo, e o que precisa ser sabido é **se a Activity
 * ainda está viva**. Quem sabe disso é o ciclo de vida do React, e é ele quem apaga agora — o
 * cleanup do efeito em `AlarmeRaiz` roda quando a Activity sai, tanto no caminho feliz quanto no de
 * erro. Sem prazo, sem aposta.
 */
let activityNascendo = false;

/**
 * A Activity já se registrou com horário, e portanto **não é mais cega**.
 *
 * Separa os dois estados de uma Activity viva. Enquanto ela sobe, ninguém sabe de qual horário ela
 * é, e a única resposta honesta a `jaEstaEmCena` é "sim" para qualquer um. Depois que ela monta e se
 * registra, o mapa `emCena` responde com precisão — e aí a resposta cega passa a atrapalhar: um
 * segundo alarme, disparando enquanto a primeira tela está aberta, teria a rota recusada por uma
 * guarda que fala por ele sem saber dele.
 *
 * Não dá para apagar `activityNascendo` nesse momento porque a Activity **continua viva**, e é a
 * vida dela — não o registro — que o cleanup em `AlarmeRaiz` desfaz.
 */
let activityConhecida = false;

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
