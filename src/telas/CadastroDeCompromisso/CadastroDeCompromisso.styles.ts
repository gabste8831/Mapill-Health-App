
import { estilosDoTema, radius, screenPadding, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    padding: screenPadding,
    gap: spacing.md,
    // Espaço pro rodapé fixo não cobrir o último campo quando a tela chega ao fim.
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  selo: {
    ...typography.caption,
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  seloObrigatorio: {
    color: cores.onErrorContainer,
    backgroundColor: cores.errorContainer,
  },
  seloOpcional: {
    color: cores.onSecondaryContainer,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.6),
  },
  hint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /** A confirmação em texto do que foi escolhido — "quarta-feira, 27 de agosto, às 14:30". */
  confirmacao: {
    ...typography.bodyMd,
    color: cores.onSecondaryContainer,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.5),
    padding: spacing.md,
    borderRadius: radius.md,
  },
  /** Cor de atenção, não de erro: escolher uma antecedência menor resolve, e nada foi perdido. */
  aviso: {
    ...typography.bodyMd,
    color: cores.onTertiaryContainer,
    backgroundColor: cores.tertiaryContainer,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  erro: {
    ...typography.bodySm,
    color: cores.error,
  },
  /**
   * O último lugar da fileira de antecedências: as opções cobrem o comum e este campo cobre o
   * resto, sem gastar um segundo toque nem uma segunda linha. Mesmo padrão do "quantas vezes por
   * dia" do cadastro de medicamento.
   */
  campoLivre: {
    flexGrow: 1,
    minWidth: 72,
    // `minHeight`: é campo de digitação, e altura travada corta o número em fonte ampliada.
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    textAlign: "center",
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLowest,
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  campoLivreAtivo: {
    borderColor: cores.primary,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.4),
  },
  submitHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
}));
