import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * O fundo escurecido. Cobre a tela inteira, mas **não** é preto opaco: o que está atrás continua
   * insinuado, e é isso que diz "você ainda está no cadastro, isto é uma camada por cima" em vez de
   * "você mudou de tela".
   */
  fundo: {
    flex: 1,
    /**
     * O mesmo cinza-azulado do `BottomSheet`, mas mais fechado (0.75 contra 0.4): lá o scrim só
     * separa a folha do fundo, e aqui ele é o que faz a foto ser **lida** — uma receita manuscrita
     * sobre um formulário claro competindo por trás não se decifra.
     */
    backgroundColor: withOpacity(colors.onSurface, 0.75),
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  /**
   * O quadro da imagem — largura toda, altura limitada a 70% da tela.
   *
   * Não ocupa tudo de propósito: a moldura visível em volta é o que mantém o gesto de "tocar fora
   * para sair" descobrível. Uma imagem sangrando até as bordas não teria "fora" onde tocar.
   */
  quadro: {
    width: "100%",
    maxHeight: "70%",
    aspectRatio: 3 / 4,
    alignSelf: "center",
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerLowest,
  },
  imagem: {
    width: "100%",
    height: "100%",
  },
  /** Barra de cima: o nome do que se está vendo, e a saída explícita. */
  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  titulo: {
    ...typography.label,
    color: colors.onPrimary,
    flex: 1,
  },
  /**
   * O X. Fundo próprio porque ele flutua sobre a imagem e sobre o fundo escuro — sem superfície,
   * um ícone claro sobre uma foto clara desaparece.
   */
  fechar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(colors.onSurface, 0.35),
  },
  /** A legenda de apoio, quando há algo a dizer sobre o arquivo (a validade da receita). */
  legenda: {
    ...typography.bodyMd,
    color: colors.onPrimary,
    textAlign: "center",
    opacity: 0.85,
  },
});
