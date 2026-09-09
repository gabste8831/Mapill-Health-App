import { temaAltoContraste } from "./alto-contraste";
import { temaDaltonismo } from "./daltonismo";
import { temaEscuro } from "./escuro";
import { temaPadrao } from "./padrao";
import type { Tema, TemaId } from "./tipos";

export * from "./tipos";
export { temaPadrao, temaEscuro, temaAltoContraste, temaDaltonismo };

/**
 * Todos os temas, indexados pelo id.
 *
 * `Record<TemaId, Tema>` e não um objeto solto: ao acrescentar um id novo em `TemaId`, o
 * TypeScript exige a entrada correspondente aqui. Um tema não pode existir pela metade.
 */
export const TEMAS: Record<TemaId, Tema> = {
  padrao: temaPadrao,
  escuro: temaEscuro,
  altoContraste: temaAltoContraste,
  daltonismo: temaDaltonismo,
};

/** A ordem em que aparecem na tela de Ajustes: o padrão primeiro, depois as alternativas. */
/**
 * Os temas oferecidos em Ajustes.
 *
 * `temaDaltonismo` **não está aqui**, e continua existindo em `TEMAS`. Ele era um tema inteiro
 * para trocar duas cores, e a escolha do par virou uma preferência à parte
 * (`shared/theme/pares-de-estado.ts`) que vale em qualquer aparência — inclusive no escuro, que
 * antes era inacessível a quem precisava daquele modo.
 *
 * O tema segue no mapa porque alguém pode tê-lo escolhido antes desta mudança: removê-lo de
 * `TEMAS` faria o app abrir sem tema nenhum para essa pessoa. Ele simplesmente não é mais
 * ofertado.
 */
export const TEMAS_EM_ORDEM: readonly Tema[] = [temaPadrao, temaEscuro, temaAltoContraste];
