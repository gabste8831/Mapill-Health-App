import { NativeModule, requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";

type ModuloDeDesbloqueio = NativeModule & {
  estaBloqueado(): Promise<boolean>;
  pedirDesbloqueio(): Promise<boolean>;
};

/**
 * `requireOptional…` e não `requireNativeModule`: no Expo Go e no web o módulo não existe, e a
 * versão estrita derrubaria o app na importação — antes de qualquer tela poder tratar a ausência.
 */
const modulo = requireOptionalNativeModule<ModuloDeDesbloqueio>("Desbloqueio");

/** Se a tela de bloqueio está na frente agora. */
export async function estaBloqueado(): Promise<boolean> {
  if (Platform.OS !== "android" || modulo === null) return false;
  return modulo.estaBloqueado().catch(() => false);
}

/**
 * Pede o desbloqueio e diz se ele aconteceu. `false` quando a pessoa desiste.
 *
 * **Sem o módulo nativo, responde `false`.** É o Expo Go e o web, onde não há keyguard a consultar —
 * e negar ali é o mesmo princípio do lado Kotlin: quem não consegue perguntar não deve deixar
 * passar. Em desenvolvimento isso aparece como o botão não abrindo o app, que é visível na hora;
 * o inverso — deixar passar calado — é o defeito que este caminho existe para fechar.
 */
export async function pedirDesbloqueio(): Promise<boolean> {
  if (Platform.OS !== "android" || modulo === null) return false;
  return modulo.pedirDesbloqueio().catch(() => false);
}
