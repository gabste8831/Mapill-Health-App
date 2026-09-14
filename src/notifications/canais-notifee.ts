import notifee, { AndroidImportance, AndroidVisibility } from "react-native-notify-kit";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { colors } from "@/shared/theme";

/**
 * Canais de notificação do Android (8+), agora com o Notifee.
 *
 * **O id carrega versão de propósito.** Depois de criado, um canal só aceita mudança de nome e
 * descrição — som, importância e bypass ficam congelados no aparelho de quem já instalou, e uma
 * correção nossa simplesmente não apareceria para essas pessoas. Subir o sufixo cria um canal novo
 * e a mudança passa a valer. A regra: mexeu em som ou importância, sobe a versão.
 *
 * **v4 → v5 (02/09).** A troca de biblioteca é motivo suficiente: o Notifee escreve o canal com
 * outra semântica de `sound` (aqui a string **é** um nome de arquivo em `res/raw`, sempre), e
 * reaproveitar um id criado pelo `expo-notifications` deixaria o canal congelado com o que a
 * biblioteca anterior gravou. Um id novo é a única forma de a mudança valer sem desinstalar.
 *
 * **v5 → v6 (12/09).** O canal do alarme passou a sair no **volume de despertador**, e o
 * `AudioAttributes` é gravado no canal na criação — congelado junto com o resto. Sem subir a versão,
 * a correção valeria só para quem instalasse o app do zero, e quem já testava continuaria com o
 * alarme no volume de mídia sem nada explicando por quê.
 *
 * O canal de lembrete sobe junto, mesmo sem mudança própria: os dois versionam em par desde o v5, e
 * um par desalinhado é o tipo de detalhe que faz alguém ler `v5` no código e `v6` no aparelho e
 * perder uma hora. Criar canal é barato; confusão de versão não é.
 *
 * **v6 → v7 (13/09).** Feito supondo que o `v6` tivesse nascido sem o `USAGE_ALARM`, porque
 * `recriarSeDivergente` não consegue comparar o `AudioAttributes` — a API do Notifee não o expõe na
 * leitura. A hipótese era razoável e **estava errada**; fica registrada abaixo junto com o que ela
 * revelou. O `v7` permanece porque já nasceu nos aparelhos, e voltar não traria nada.
 *
 * ### ⚠️ O volume de despertador não se resolve por aqui — não suba a versão de novo por isso
 *
 * A build com o `v7` saiu e **o alarme continuou no volume de mídia**. Isso encerra a hipótese do
 * canal velho: o `v7` nasceu do código patchado e falhou igual.
 *
 * O patch de `plugins/volume-de-despertador.js` **é** aplicado — verificado em 13/09 rodando
 * `expo prebuild` localmente, com o `ChannelManager.java` saindo transformado. O que acontece é que
 * **quem toca o som da notificação é o NotificationManager, não o app**, e ele usa o stream dele
 * independentemente do que o `AudioAttributes` do canal peça. Ali o atributo é dica, não ordem.
 *
 * Não é limitação do Notifee: a issue #297, pedindo exatamente isto, foi fechada como *not planned*.
 * E os requisitos do Google Play para apps de alarme descrevem a arquitetura esperada — o app toca
 * som próprio, e a notificação serve ao full-screen intent, não ao áudio.
 *
 * **A correção** é o app tocar o próprio som com `expo-audio`, com o canal do alarme mudo. Está
 * descrita como **E.1** em `docs/O-QUE-FALTA-TESTAR.md`, com o alvo do patch já localizado, e foi
 * adiada por decisão do Gabriel em 13/09 até o resto do app estar validado. Até lá o alarme sai no
 * volume de mídia, e isso é limitação conhecida — não um defeito a investigar de novo.
 *
 * ### A armadilha da palavra "default", registrada para não voltar
 *
 * No `expo-notifications` a palavra `"default"` significava coisas **opostas** conforme a direção:
 * escrita, era um nome de arquivo a resolver (e nascia canal mudo, porque o arquivo não existe);
 * lida, era a confirmação de que o som padrão estava ativo. Isso quebrou o alarme duas vezes.
 *
 * Aqui não há ambiguidade: `sound` é sempre nome de recurso em `res/raw`, sem extensão. O alarme
 * usa o arquivo próprio; o lembrete omite o campo para receber o som padrão do sistema.
 */
export const CANAL_ALARME = "dose-alarm-v8";
export const CANAL_LEMBRETE = "dose-reminder-v8";

/**
 * ⚠️ **O plugin `expo-notifications` continua no `app.json`, e não pode ser removido.**
 *
 * Nenhuma linha do app importa a biblioteca desde 02/09 — o agendamento é todo do Notifee. Mas o
 * plugin é de **build**, não de runtime, e é ele que produz dois recursos nativos que o Notifee
 * consome pelo nome:
 *
 * - `notification_icon`, o drawable gerado a partir do `icon` declarado ali. Sem ele o Notifee cai
 *   no ícone padrão do sistema, e o aviso aparece com cara de "app genérico".
 * - `alarme_de_dose` em `res/raw`, vindo do array `sounds`. É o arquivo que o canal do alarme
 *   referencia abaixo — sem ele o canal nasce **mudo**, que é exatamente o defeito de 29/08.
 *
 * Tirar o pacote do `package.json` acharia que está limpando dependência morta e apagaria o som do
 * alarme junto, sem erro de compilação nenhum.
 */

/**
 * O componente registrado em `index.js` que o Notifee abre em tela cheia.
 *
 * O nome é uma string acordada entre o registro e o agendamento — errar aqui não dá erro de
 * compilação, e o sintoma seria a notificação abrir o app na Home em vez da tela de alarme.
 */
export const COMPONENTE_DE_ALARME = "alarme-de-dose";

/**
 * Recria o canal quando o que está no aparelho **diverge** do que pedimos.
 *
 * Um canal congela na criação: `createChannel` sobre um id existente atualiza nome e descrição, e
 * mais nada. Quem instalou o app e **depois** autorizou a política do Não Perturbe ficaria com um
 * canal que pediu o bypass e não o tem — para sempre, sem sinal nenhum.
 *
 * Apagar e recriar é a única recuperação que não depende de o usuário desinstalar o app na mão.
 * Só acontece quando há divergência, então em operação normal isto não faz nada.
 */
async function recriarSeDivergente(
  id: string,
  esperado: { bypassDnd?: boolean; sound?: string },
): Promise<void> {
  const existente = await notifee.getChannel(id);
  if (existente === null) return;

  const divergente =
    (esperado.bypassDnd === true && !existente.bypassDnd) ||
    (esperado.sound !== undefined && existente.sound !== esperado.sound);

  if (divergente) {
    await notifee.deleteChannel(id);
    if (__DEV__) console.log(`[Mapill] canal ${id} divergia do pedido, e foi apagado e recriado.`);
  }
}

/**
 * Cria os canais. Idempotente — chamar de novo com o mesmo id não faz nada.
 *
 * A diferença entre os dois é real, e é o que sustenta o app oferecer duas opções no cadastro: o
 * alarme atravessa o Não Perturbe, sai pelo volume de despertador e toca até alguém responder; o
 * lembrete respeita o silencioso e avisa sem interromper. Prometer duas coisas e entregar a mesma
 * seria falha de correspondência com o mundo real (Nielsen) — num app de medicação, uma promessa de
 * segurança falsa.
 */
export async function registrarCanais(): Promise<void> {
  if (Platform.OS !== "android") return;

  await recriarSeDivergente(CANAL_ALARME, { bypassDnd: true, sound: undefined });
  /**
   * O de lembrete também: ele nasceu mudo enquanto `sound` era omitido, e canal criado é
   * **imutável** no Android — mudar o código não conserta o que já existe no aparelho. Sem isto, a
   * correção só valeria para quem instalasse o app do zero.
   */
  await recriarSeDivergente(CANAL_LEMBRETE, { sound: "default" });

  await notifee.createChannel({
    id: CANAL_ALARME,
    name: "Alarmes de dose",
    description: "Abre a tela do remédio e toca até você responder.",
    importance: AndroidImportance.HIGH,
    /**
     * **Mudo de propósito, desde o `v8`.** Omitir `sound` cria o canal sem som, e é o que se quer:
     * quem toca o alarme é o app, pelo foreground service (ver `som-do-alarme.ts`), no volume de
     * despertador.
     *
     * Dar som ao canal aqui traria o defeito de volta em dobro: o sistema tocaria no volume de
     * mídia por cima do som do serviço, as duas fontes sobrepostas, e parar uma não calaria a
     * outra.
     *
     * A notificação continua inteira no resto — é ela que faz a tela azul irromper pelo
     * `fullScreenAction` e que fica na bandeja. O que saiu foi só o áudio.
     */
    vibration: true,
    // Longo e espaçado: o padrão curto do sistema se confunde com mensagem, e a diferença entre
    // "chegou um WhatsApp" e "está na hora do remédio" precisa ser sentida sem olhar a tela.
    vibrationPattern: [500, 500, 500, 500],
    /**
     * Atravessar o Não Perturbe **depende de uma permissão que o Android não pede sozinho**
     * (acesso à política do Não Perturbe). Sem ela esta flag é ignorada em silêncio: o canal é
     * criado, não dá erro, e o alarme simplesmente não fura o DND.
     *
     * ⚠️ Exige `android.permission.ACCESS_NOTIFICATION_POLICY` no `app.json`. Sem ela o app **não
     * aparece na lista** do Não Perturbe, então não há como concedê-la — que foi exatamente o
     * sintoma encontrado na validação até 02/09.
     */
    bypassDnd: true,
    visibility: AndroidVisibility.PUBLIC,
    lights: true,
    lightColor: colors.primary,
  });

  await notifee.createChannel({
    id: CANAL_LEMBRETE,
    name: "Lembretes de dose",
    description: "Aparece na barra de avisos e respeita o modo silencioso.",
    importance: AndroidImportance.HIGH,
    /**
     * `"default"` explícito — omitir `sound` cria o canal **mudo**.
     *
     * O comentário anterior aqui dizia o contrário: que a ausência significava "som padrão do
     * sistema". A documentação do Notifee diz o oposto ("The default value is to play no sound. To
     * play the default system sound use 'default'"), e o teste em aparelho (05/09) confirmou — a
     * notificação aparecia na tela sem emitir som nenhum, com o volume alto.
     *
     * É o que separa esta opção do alarme: aqui o som é o do sistema, sai pelo volume de avisos e
     * respeita o silencioso; lá é um arquivo próprio, no volume de **despertador** — quem de fato
     * diz isso ao Android é `plugins/volume-de-despertador.js`, porque o `AudioAttributes` do canal
     * não é configurável pelo JavaScript desta biblioteca.
     */
    sound: "default",
    vibration: true,
    vibrationPattern: [250, 250],
    bypassDnd: false,
    visibility: AndroidVisibility.PRIVATE,
    lights: true,
    lightColor: colors.primary,
  });
}

/**
 * O que o **sistema** guardou sobre o canal do alarme, e não o que pedimos.
 *
 * Existe porque este bloco já falhou duas vezes em silêncio: o canal era criado, nenhum erro
 * aparecia, e só o teste em aparelho revelava que ele tinha nascido mudo. Ler de volta é a única
 * forma de saber o que está valendo de verdade no aparelho de quem testa.
 */
export async function diagnosticarCanalDeAlarme(): Promise<string> {
  if (Platform.OS !== "android") return "iOS/web: sem canais.";

  const canal = await notifee.getChannel(CANAL_ALARME);
  if (canal === null) {
    return `❌ Canal ${CANAL_ALARME} NAO EXISTE: nenhum alarme vai tocar.`;
  }

  /**
   * O diagnóstico **conclui**, em vez de só despejar valores. Na validação de 01/09 ele imprimiu
   * `som: default · bypassDnd: false` e essa linha continha a resposta inteira — mas exigia saber
   * de cor o que "default" significava ali. Quem testa não deveria precisar decorar a semântica
   * interna da biblioteca para saber se o alarme vai tocar.
   */
  const problemas: string[] = [];

  /**
   * **Canal mudo é o esperado desde o `v8`** — quem toca é o app, pelo foreground service. Som no
   * canal é que virou defeito: significa um canal antigo sobrevivendo no aparelho, e o alarme
   * sairia duas vezes, uma delas no volume de mídia.
   */
  if (canal.sound !== undefined && canal.sound !== null) {
    problemas.push(`som no canal (${canal.sound}): deveria ser mudo, quem toca e o app`);
  }
  // `importance` é opcional na tipagem: um canal lido do sistema pode não trazê-la. Ausente conta
  // como problema — não saber a importância é o mesmo que não poder afirmar que o alarme interrompe.
  if ((canal.importance ?? 0) < AndroidImportance.HIGH) {
    problemas.push(`importance ${canal.importance ?? "?"} < HIGH: nao interrompe a tela`);
  }
  if (!canal.bypassDnd) {
    // Não é defeito do código: depende de permissão que o Android não concede sozinho.
    problemas.push("bypassDnd desligado: nao fura o Nao Perturbe (falta a permissão do sistema)");
  }

  /**
   * O stream de áudio, que é o que decide se o alarme sai no volume de **despertador**.
   *
   * Não dá para lê-lo do canal: o `AudioAttributes` não é exposto pela API do Notifee — e essa
   * cegueira é o que deixou o defeito passar na build de 12/09, com o diagnóstico dizendo "OK".
   *
   * A marca vem do `extra` do `app.json` e diz que `plugins/volume-de-despertador.js` está
   * registrado. É indireta de propósito: um mod não consegue escrever no `extra` que chega ao
   * runtime (ele roda no `prebuild`, depois de o config ser resolvido). O que sustenta a marca é o
   * plugin **falhar a build** se não encontrar o alvo do patch — registrado, ou ele aplica ou nada
   * compila.
   *
   * No teste isto separa duas hipóteses: alarme no volume errado **com** a marca é canal velho
   * sobrevivendo no aparelho (a versão do id precisa subir); **sem** a marca, o plugin saiu do
   * `app.json`. Eram indistinguíveis em 12/09.
   */
  const comPatchDeVolume = Constants.expoConfig?.extra?.volumeDeDespertadorAplicado === true;
  if (!comPatchDeVolume) {
    problemas.push("SEM o patch de volume: o alarme sai no volume de MIDIA, nao no de despertador");
  }

  const estado = problemas.length === 0 ? "✅ OK" : `⚠️ ${problemas.join(" | ")}`;

  return [
    estado,
    `id: ${canal.id}`,
    `importance: ${canal.importance}`,
    `som: ${canal.sound ?? "NENHUM"}`,
    `bypassDnd: ${canal.bypassDnd}`,
    `volume de despertador: ${comPatchDeVolume ? "patch aplicado" : "NAO APLICADO"}`,
  ].join(" · ");
}
