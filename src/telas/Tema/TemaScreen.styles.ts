import { estilosDoTema, radius, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.gutter,
    paddingBottom: spacing.xxl,
  },
  aviso: {
    backgroundColor: cores.primarySurface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  avisoTexto: {
    ...typography.bodyMd,
    color: cores.onPrimarySurface,
    lineHeight: 21,
  },
  secao: {
    gap: spacing.sm,
  },
  rotuloDaSecao: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  cartao: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.md,
  },
  paragrafo: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    lineHeight: 21,
  },
  /**
   * O nome de cada cor dentro do parágrafo.
   *
   * `Text` aninhado, e não `<b>`: aquilo é HTML e o React Native não o conhece — ele tenta resolver
   * "b" como componente e derruba a tela. O que existe aqui é herança de estilo em `Text` dentro de
   * `Text`, e o peso vem da família da fonte, porque `fontWeight` não escolhe o arquivo certo numa
   * fonte carregada por peso.
   */
  paragrafoForte: {
    fontFamily: typography.label.fontFamily,
    color: cores.onSurface,
  },
}));
