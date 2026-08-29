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
export const CANAL_ALARME = "dose-alarm-v1";
export const CANAL_LEMBRETE = "dose-reminder-v1";

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
    bypassDnd: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    lightColor: colors.primary,
    enableVibrate: true,
  });
}
