import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * O amarelo do lembrete, e não o vermelho de erro.
   *
   * É o mesmo tom do alerta de recontagem do estoque e do painel de permissões — padronizado em
   * 09/09. Aqui ele importa mais do que em outros lugares: este aviso **nunca desaparece**, porque o
   * app não consegue saber se as três autorizações foram atendidas. Em vermelho, ele leria como
   * erro permanente, e um erro que não sai de tela ensina a ignorar os que saem.
   *
   * 48dp de altura mínima pelo alvo de toque, e uma linha só de conteúdo: ele mora em telas cheias
   * de campos, e o lugar dele é lembrar, não tomar a tela.
   */
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: cores.warningSurface,
  },
  /** Ocupa o que sobra entre o escudo e a seta. */
  texto: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    ...typography.bodyMd,
    color: cores.onWarningSurface,
  },
  descricao: {
    ...typography.bodySm,
    color: cores.onWarningSurface,
    opacity: 0.85,
  },
}));
