import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useTema } from "./tema-contexto";
import type { Tema } from "./temas";

/**
 * # Como migrar uma tela para temas
 *
 * Esta é a peça que torna a migração mecânica. Um arquivo de estilos hoje é assim:
 *
 * ```ts
 * export const styles = StyleSheet.create({
 *   card: { backgroundColor: colors.surfaceContainerLowest },
 * });
 * ```
 *
 * Vira assim — **três linhas mudam**, o corpo do objeto fica idêntico:
 *
 * ```ts
 * export const criarEstilos = estilosDoTema(({ cores }) => ({
 *   card: { backgroundColor: cores.surfaceContainerLowest },
 * }));
 * ```
 *
 * E no componente, a linha do import vira:
 *
 * ```tsx
 * const styles = useEstilos(criarEstilos);
 * ```
 *
 * ## Por que uma função, e não `StyleSheet.create` direto
 *
 * `StyleSheet.create` roda **uma vez**, quando o módulo é importado. As cores lidas ali ficam
 * congeladas para sempre — trocar de tema não repinta nada. É a razão de a migração ser
 * necessária, e não apenas conveniente.
 *
 * O `useMemo` por tema garante que a folha só é recriada quando o tema muda de fato: rolar uma
 * lista de 200 doses não reconstrói estilo nenhum.
 */

/** A "receita" de uma folha de estilos: recebe o tema, devolve o objeto de estilos. */
export type ReceitaDeEstilos<T extends StyleSheet.NamedStyles<T>> = (tema: Tema) => T;

/**
 * Marca uma função como receita de estilos. Só existe para dar inferência de tipo ao objeto
 * devolvido — sem isso, cada arquivo teria de anotar o próprio tipo à mão.
 */
export function estilosDoTema<T extends StyleSheet.NamedStyles<T>>(
  receita: (tema: Tema) => T,
): ReceitaDeEstilos<T> {
  return receita;
}

/** Resolve uma receita no tema em vigor. Recalcula só quando o tema muda. */
export function useEstilos<T extends StyleSheet.NamedStyles<T>>(receita: ReceitaDeEstilos<T>): T {
  const { tema } = useTema();
  return useMemo(() => StyleSheet.create(receita(tema)), [receita, tema]);
}

/**
 * As cores do tema em vigor, para uso **fora** de uma folha de estilos — a cor de um `Ionicons`,
 * o `color` de um `ActivityIndicator`, o `tintColor` de uma barra de abas.
 *
 * São 123 usos assim hoje, e eles precisam do mesmo cuidado que os estilos: um ícone que continua
 * azul-escuro no tema escuro é tão quebrado quanto um cartão que continua branco.
 */
export function useCores() {
  return useTema().tema.cores;
}

/** Os ajustes não-cromáticos do tema (contorno, reforço de forma). Ver `temas/tipos.ts`. */
export function useAjustesDeTema() {
  return useTema().tema.ajustes;
}
