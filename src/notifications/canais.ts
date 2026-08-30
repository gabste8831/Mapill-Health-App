import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { colors } from "@/shared/theme";

/**
 * Canais de notificação do Android (8+).
 *
 * **O id carrega versão de propósito.** Depois de criado, um canal só aceita mudança de nome e
 * descrição — som, importância e bypass ficam congelados no aparelho de quem já instalou, e uma
 * correção nossa simplesmente não apareceria para essas pessoas. Subir o sufixo cria um canal novo
 * e a mudança passa a valer. A regra: mexeu em som ou importância, sobe a versão.
 */
export const CANAL_ALARME = "dose-alarm-v3";
export const CANAL_LEMBRETE = "dose-reminder-v3";

/**
 * Cria os canais. Idempotente — chamar de novo com o mesmo id não faz nada.
 *
 * A diferença entre os dois é real e é o que sustenta o app oferecer as duas opções no cadastro:
 * o alarme atravessa o Não Perturbe e vibra em padrão longo; o lembrete respeita o silencioso.
 * Prometer duas coisas e entregar a mesma seria falha de correspondência com o mundo real
 * (Nielsen) — num app de medicação, uma promessa de segurança falsa.
 *
 * O que **não** entregamos: despertador de tela cheia com som contínuo até desligar. Isso exige
 * `USE_FULL_SCREEN_INTENT`, que o Android 14+ restringe a apps de alarme e chamada, e que o
 * `expo-notifications` nem expõe. O texto do app descreve o que existe (nível B do plano).
 */
export async function registrarCanais(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(CANAL_ALARME, {
    name: "Alarmes de dose",
    description: "Toca alto na hora da dose, mesmo com o celular no silencioso.",
    importance: Notifications.AndroidImportance.MAX,
    // Longo e espaçado: o padrão curto do sistema se confunde com mensagem, e a diferença entre
    // "chegou um WhatsApp" e "está na hora do remédio" precisa ser sentida sem olhar a tela.
    vibrationPattern: [0, 500, 250, 500],
    /**
     * **`sound` é omitido de propósito — é o que dá o som padrão do sistema.**
     *
     * A tipagem sugere `'default' | 'custom' | null`, mas o nativo não lê assim. Em
     * `AndroidXNotificationsChannelManager.createSoundUriFromArguments`: campo **ausente** →
     * `DEFAULT_NOTIFICATION_URI`; `null` → sem som; **qualquer string** → nome de arquivo a
     * resolver. Passar `"default"` fazia o Android procurar um arquivo chamado `default`, não
     * achar, e criar o canal **mudo** — com o erro "Custom sound 'default' not found in native
     * app" no console.
     *
     * Foi a causa de o alarme não tocar depois da primeira correção. Se um dia um som próprio
     * entrar aqui, ele precisa estar no array `sounds` do plugin no `app.json`.
     */
    /**
     * `usage: "alarm"` é o que faz o Android **tratar isto como despertador**, e não como aviso.
     *
     * Muda três coisas de uma vez: o som sai pelo volume de *alarme* (que a pessoa costuma manter
     * alto mesmo com o de notificação baixo), atravessa o silencioso, e é o que o sistema espera de
     * algo que precisa acordar alguém. É a peça que faltava para o rótulo "Alarme" significar algo
     * diferente de "Notificação".
     *
     * `enforceAudibility` completa: pede ao sistema que não abafe o som por conta de outras regras.
     */
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      flags: { enforceAudibility: true, requestHardwareAudioVideoSynchronization: false },
    },
    /**
     * Atravessar o Não Perturbe **depende de uma permissão que o Android não pede sozinho**
     * (acesso à política do Não Perturbe). Sem ela, esta flag é ignorada em silêncio — o canal é
     * criado, não dá erro, e o alarme simplesmente não fura o DND.
     *
     * Continua declarada porque, concedida a permissão, ela passa a valer sem recriar o canal. Quem
     * conduz a pessoa até lá é a tela de lembrete (ver `useNotificationPermission`).
     */
    bypassDnd: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    lightColor: colors.primary,
    enableVibrate: true,
  });

  await Notifications.setNotificationChannelAsync(CANAL_LEMBRETE, {
    name: "Lembretes de dose",
    description: "Aparece na barra de avisos e respeita o modo silencioso.",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250],
    // `sound` omitido pelo mesmo motivo do canal acima: ausente é o que significa "som padrão".
    // Aqui o uso é de notificação mesmo: sai pelo volume de avisos e respeita o silencioso, que é
    // exatamente o que separa esta opção da de cima no cadastro.
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.NOTIFICATION,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    },
    bypassDnd: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    lightColor: colors.primary,
    enableVibrate: true,
  });
}

/**
 * O que o **sistema** guardou sobre o canal do alarme, e não o que pedimos.
 *
 * Existe porque este bloco já falhou duas vezes em silêncio: o canal era criado, nenhum erro
 * aparecia, e só o teste em aparelho revelava que ele tinha nascido mudo. Um canal congela na
 * primeira criação — som e importância deixam de aceitar mudança — então ler de volta é a única
 * forma de saber o que está valendo de verdade no aparelho de quem testa.
 *
 * `soundUri` nulo significa canal **mudo**. `importance` abaixo de MAX (5) significa que ele não
 * vai interromper. Nos dois casos a saída é subir a versão do id, nunca "corrigir" o canal atual.
 */
export async function diagnosticarCanalDeAlarme(): Promise<string> {
  if (Platform.OS !== "android") return "iOS/web: sem canais.";
  const canal = await Notifications.getNotificationChannelAsync(CANAL_ALARME);
  if (canal === null) return `Canal ${CANAL_ALARME} não existe.`;
  return [
    `id: ${canal.id}`,
    `importance: ${canal.importance}`,
    `som: ${canal.sound ?? "NENHUM (mudo)"}`,
    `bypassDnd: ${canal.bypassDnd}`,
    `audioAttributes.usage: ${canal.audioAttributes?.usage ?? "-"}`,
  ].join(" · ");
}
