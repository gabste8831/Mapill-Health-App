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
export const TEMAS_EM_ORDEM: readonly Tema[] = [
  temaPadrao,
  temaEscuro,
  temaAltoContraste,
  temaDaltonismo,
];
