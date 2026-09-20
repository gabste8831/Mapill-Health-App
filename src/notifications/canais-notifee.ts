import notifee, { AndroidImportance, AndroidVisibility } from "react-native-notify-kit";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { colors } from "@/shared/theme";

/**
 * Os canais de notificacao do Android, criados pelo Notifee.
 *
 * O id carrega versao de proposito: um canal congela na criacao, e depois so aceita mudanca de nome
 * e descricao. Som, importancia e bypass ficam presos no aparelho de quem ja instalou, entao mexeu
 * em algum deles, sobe a versao.
 *
 * O volume de despertador nao se resolve aqui, e nao adianta subir a versao por causa dele: quem
 * toca o som da notificacao e o NotificationManager, que usa o stream dele independentemente do
 * `AudioAttributes` pedido. Por isso o canal do alarme e mudo e quem toca e o app.
 */
export const CANAL_ALARME = "dose-alarm-v8";
export const CANAL_LEMBRETE = "dose-reminder-v8";

/**
 * O plugin `expo-notifications` continua no `app.json` e nao pode ser removido.
 *
 * Nenhuma linha importa a biblioteca, mas o plugin e de build: e ele que gera o `notification_icon`
 * e o `alarme_de_dose` em `res/raw`, os dois consumidos pelo nome. Tirar o pacote pareceria limpar
 * dependencia morta e apagaria o som do alarme, sem erro de compilacao.
 */

/** Acordado com o registro em `index.js`. Errar aqui abre o app na Home em vez da tela de alarme. */
export const COMPONENTE_DE_ALARME = "alarme-de-dose";

/**
 * A Activity propria do alarme, resolvida por `Class.forName`.
 *
 * Errar o nome nao da erro de compilacao: a lib so registra `Launch Activity does not exist` no
 * logcat e a tela cheia nao sobe. E ela que tem `showWhenLocked`, e e por isso que responder com o
 * celular bloqueado nao deixa o app acessivel depois.
 */
export const ACTIVITY_DO_ALARME = "com.gabsteffens.mapillapp.AlarmeActivity";

/**
 * Recria o canal quando o que esta no aparelho diverge do que foi pedido.
 *
 * Quem instalou o app e so depois autorizou a politica do Nao Perturbe ficaria para sempre com um
 * canal que pediu o bypass e nao o tem. Apagar e recriar e a unica recuperacao que nao exige
 * desinstalar na mao.
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
 * Cria os canais. Idempotente.
 *
 * A diferenca entre os dois e o que sustenta as duas opcoes do cadastro: o alarme atravessa o Nao
 * Perturbe e toca ate alguem responder, o lembrete respeita o silencioso.
 */
export async function registrarCanais(): Promise<void> {
  if (Platform.OS !== "android") return;

  await recriarSeDivergente(CANAL_ALARME, { bypassDnd: true, sound: undefined });
  await recriarSeDivergente(CANAL_LEMBRETE, { sound: "default" });

  await notifee.createChannel({
    id: CANAL_ALARME,
    name: "Alarmes de dose",
    description: "Abre a tela do remédio e toca até você responder.",
    importance: AndroidImportance.HIGH,
    // Sem `sound`: o canal nasce mudo de proposito, porque quem toca o alarme e o app, pelo
    // foreground service. Dar som aqui sobreporia duas fontes, e parar uma nao calaria a outra.
    vibration: true,
    // Longo e espacado: o padrao curto se confunde com mensagem, e a diferenca precisa ser sentida
    // sem olhar a tela.
    vibrationPattern: [500, 500, 500, 500],
    /**
     * Exige `android.permission.ACCESS_NOTIFICATION_POLICY` no `app.json`.
     *
     * Sem ela a flag e ignorada em silencio: o canal e criado, nao da erro, e o app sequer aparece
     * na lista do Nao Perturbe para que alguem possa conceder.
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
    // `"default"` explicito: omitir `sound` cria o canal MUDO, e nao com o som do sistema.
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
 * O que o sistema guardou sobre o canal, e nao o que foi pedido.
 *
 * Ler de volta e a unica forma de saber o que vale no aparelho: criar canal errado nao da erro, e
 * o defeito so aparece no teste.
 */
export async function diagnosticarCanalDeAlarme(): Promise<string> {
  if (Platform.OS !== "android") return "iOS/web: sem canais.";

  const canal = await notifee.getChannel(CANAL_ALARME);
  if (canal === null) {
    return `❌ Canal ${CANAL_ALARME} NAO EXISTE: nenhum alarme vai tocar.`;
  }

  // O diagnostico conclui em vez de despejar valores: quem testa nao deveria precisar decorar a
  // semantica da biblioteca para saber se o alarme vai tocar.
  const problemas: string[] = [];

  // Canal mudo e o esperado. Som aqui significa canal antigo sobrevivendo, e o alarme sairia duas
  // vezes, uma delas no volume de midia.
  if (canal.sound !== undefined && canal.sound !== null) {
    problemas.push(`som no canal (${canal.sound}): deveria ser mudo, quem toca e o app`);
  }
  // `importance` é opcional na tipagem: um canal lido do sistema pode não trazê-la. Ausente conta
  // como problema - não saber a importância é o mesmo que não poder afirmar que o alarme interrompe.
  if ((canal.importance ?? 0) < AndroidImportance.HIGH) {
    problemas.push(`importance ${canal.importance ?? "?"} < HIGH: nao interrompe a tela`);
  }
  if (!canal.bypassDnd) {
    // Não é defeito do código: depende de permissão que o Android não concede sozinho.
    problemas.push("bypassDnd desligado: nao fura o Nao Perturbe (falta a permissão do sistema)");
  }

  /**
   * O `AudioAttributes` nao e exposto pela API do Notifee, entao nao da para ler do canal se o som
   * sai no volume de despertador.
   *
   * A marca vem do `extra` do `app.json` e e indireta de proposito: um mod nao escreve no `extra`
   * que chega ao runtime. Quem a sustenta e o plugin falhar a build se nao achar o alvo do patch.
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
