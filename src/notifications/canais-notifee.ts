import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
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
 * ### A armadilha da palavra "default", registrada para não voltar
 *
 * No `expo-notifications` a palavra `"default"` significava coisas **opostas** conforme a direção:
 * escrita, era um nome de arquivo a resolver (e nascia canal mudo, porque o arquivo não existe);
 * lida, era a confirmação de que o som padrão estava ativo. Isso quebrou o alarme duas vezes.
 *
 * Aqui não há ambiguidade: `sound` é sempre nome de recurso em `res/raw`, sem extensão. O alarme
 * usa o arquivo próprio; o lembrete omite o campo para receber o som padrão do sistema.
 */
export const CANAL_ALARME = "dose-alarm-v5";
export const CANAL_LEMBRETE = "dose-reminder-v5";

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
    if (__DEV__) console.log(`[Mapill] canal ${id} divergia do pedido — apagado e recriado.`);
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

  await recriarSeDivergente(CANAL_ALARME, { bypassDnd: true, sound: "alarme_de_dose" });

  await notifee.createChannel({
    id: CANAL_ALARME,
    name: "Alarmes de dose",
    description: "Abre a tela do remédio e toca até você responder.",
    importance: AndroidImportance.HIGH,
    /**
     * O arquivo embarcado, **sem extensão** — é assim que o Android resolve um recurso de
     * `res/raw`. Aqui a string é um nome de arquivo de verdade, ao contrário do que acontecia no
     * `expo-notifications` (ver o comentário sobre "default" no topo).
     */
    sound: "alarme_de_dose",
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
    // `sound` omitido: ausência significa "som padrão do sistema". É o que separa esta opção da de
    // cima — aqui o uso é de notificação mesmo, sai pelo volume de avisos e respeita o silencioso.
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
    return `❌ Canal ${CANAL_ALARME} NÃO EXISTE — nenhum alarme vai tocar.`;
  }

  /**
   * O diagnóstico **conclui**, em vez de só despejar valores. Na validação de 01/09 ele imprimiu
   * `som: default · bypassDnd: false` e essa linha continha a resposta inteira — mas exigia saber
   * de cor o que "default" significava ali. Quem testa não deveria precisar decorar a semântica
   * interna da biblioteca para saber se o alarme vai tocar.
   */
  const problemas: string[] = [];

  if (canal.sound === undefined || canal.sound === null) {
    problemas.push("SEM SOM (canal mudo)");
  }
  // `importance` é opcional na tipagem: um canal lido do sistema pode não trazê-la. Ausente conta
  // como problema — não saber a importância é o mesmo que não poder afirmar que o alarme interrompe.
  if ((canal.importance ?? 0) < AndroidImportance.HIGH) {
    problemas.push(`importance ${canal.importance ?? "?"} < HIGH — não interrompe a tela`);
  }
  if (!canal.bypassDnd) {
    // Não é defeito do código: depende de permissão que o Android não concede sozinho.
    problemas.push("bypassDnd desligado — não fura o Não Perturbe (falta a permissão do sistema)");
  }

  const estado = problemas.length === 0 ? "✅ OK" : `⚠️ ${problemas.join(" | ")}`;

  return [
    estado,
    `id: ${canal.id}`,
    `importance: ${canal.importance}`,
    `som: ${canal.sound ?? "NENHUM"}`,
    `bypassDnd: ${canal.bypassDnd}`,
  ].join(" · ");
}
