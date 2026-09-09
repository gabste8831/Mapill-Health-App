import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  /**
   * O fundo escurecido. Cobre a tela inteira, mas **não** é preto opaco: o que está atrás continua
   * insinuado, e é isso que diz "você ainda está no cadastro, isto é uma camada por cima" em vez de
   * "você mudou de tela".
   */
  fundo: {
    flex: 1,
    /**
     * Preto a 80%, e não `onSurface` a 75%.
     *
     * Aqui o véu não separa: ele é o que faz a foto ser **lida** — uma receita manuscrita com um
     * formulário claro competindo por trás não se decifra. E `onSurface` invertia no tema escuro,
     * onde ele é quase branco: o fundo do visualizador clareava em vez de sumir, justamente no
     * tema em que a tela já está escura e a foto deveria dominar.
     *
     * Escuro de verdade em todo tema, como qualquer visualizador de imagem: uma foto se olha
     * contra o escuro, independente do resto do app.
     */
    backgroundColor: "rgba(0, 0, 0, 0.8)",
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
    // Branco translucido, e nao `onSurface` a 35%: o X e branco, e no tema escuro `onSurface`
    // tambem — o botao virava branco sobre branco. Sobre o fundo preto do visualizador, o disco
    // claro e o que da forma ao icone.
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  /** A legenda de apoio, quando há algo a dizer sobre o arquivo (a validade da receita). */
  legenda: {
    ...typography.bodyMd,
    color: colors.onPrimary,
    textAlign: "center",
    opacity: 0.85,
  },
});
