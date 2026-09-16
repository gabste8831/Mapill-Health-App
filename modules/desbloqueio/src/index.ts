import { NativeModule, requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";

type ModuloDeDesbloqueio = NativeModule & {
  estaBloqueado(): Promise<boolean>;
  pedirDesbloqueio(): Promise<boolean>;
  fecharTelaDoAlarme(): Promise<boolean>;
};

/**
 * `requireOptional…` e não `requireNativeModule`: no Expo Go e no web o módulo não existe, e a
 * versão estrita derrubaria o app na importação — antes de qualquer tela poder tratar a ausência.
 */
const modulo = requireOptionalNativeModule<ModuloDeDesbloqueio>("Desbloqueio");

/**
 * Se a tela de bloqueio está na frente agora — `null` quando não há como perguntar.
 *
 * **Os três estados importam, e reduzi-los a dois já custou caro.** `false` significa "o aparelho
 * está destravado"; `null` significa "não sei" — build sem o módulo nativo, Expo Go, web. Quem
 * chama decide o que fazer com a dúvida, e a resposta costuma ser diferente da do `false`.
 *
 * O caso concreto: a tela cheia do alarme só sobe com o aparelho bloqueado. Tratar "não sei" como
 * "destravado" faria ela parar de subir em toda build que ainda não tem o módulo — o alarme
 * deixaria de aparecer justamente onde ele mais importa, por causa de uma pergunta sem resposta.
 */
export async function estaBloqueado(): Promise<boolean | null> {
  if (Platform.OS !== "android" || modulo === null) return null;
  return modulo.estaBloqueado().catch(() => null);
}

/**
 * Pede o desbloqueio e diz se ele aconteceu. `false` quando a pessoa desiste.
 *
 * **Sem o módulo nativo, responde `true`** — Expo Go, web, e toda build anterior a 14/09. Não é
 * "deixar passar": é que ali não existe nem o pedido nem a tela cheia sobre o bloqueio que o
 * justifica, e recusar tornaria o botão de abrir o app inerte em toda build sem o módulo, sem nada
 * na tela explicando por quê.
 *
 * Quem chama trata a dúvida do `estaBloqueado` (o `null`) pedindo assim mesmo — e é lá, na soma das
 * duas respostas, que a decisão de segurança acontece.
 */
export async function pedirDesbloqueio(): Promise<boolean> {
  if (Platform.OS !== "android" || modulo === null) return true;
  return modulo.pedirDesbloqueio().catch(() => false);
}

/**
 * **Não há como reimpor o bloqueio**, e esta nota existe para quem vier procurar a função.
 *
 * Tentado em 15/09 com `finishAndRemoveTask`, e não resolve: o Android **já dispensou o keyguard**
 * quando a Activity do alarme sobe com `showWhenLocked` e `turnScreenOn`, e remover a task depois
 * não desfaz isso. Não existe API de re-bloqueio para app nenhum.
 *
 * O defeito que isso deixa em aberto — responder a dose deixa o app acessível sem autenticação —
 * está em `docs/O-QUE-FALTA-TESTAR.md`, com a saída proposta: uma Activity separada só para o
 * alarme, com o `showWhenLocked` nela e não na `MainActivity`.
 */

/**
 * Fecha a Activity do alarme e a tira dos recentes — **sem matar o processo**.
 *
 * `BackHandler.exitApp()` fazia isso antes, e deixou de servir quando a tela ganhou Activity
 * própria (16/09): ele encerra o processo inteiro, levando junto o app que pode estar aberto atrás
 * e o serviço que toca o som.
 *
 * **`false` quando não há módulo nativo** — Expo Go, web, build antiga. Quem chama cai no
 * `BackHandler.exitApp()`, que é o comportamento de antes: pior, mas melhor que uma tela de alarme
 * que não fecha.
 */
export async function fecharTelaDoAlarme(): Promise<boolean> {
  if (Platform.OS !== "android" || modulo === null) return false;
  return modulo.fecharTelaDoAlarme().catch(() => false);
}
