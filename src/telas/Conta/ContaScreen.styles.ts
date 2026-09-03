
import { estilosDoTema, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    paddingLeft: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    // 52 é a altura padrão de interação do app (Button, TextField, SelectField). A linha
    // inteira é clicável, o que já dá alvo de sobra pro público idoso.
    minHeight: 52,
  },
  /** Largura fixa pra alinhar os rótulos entre linhas, mesmo com ícones de larguras diferentes. */
  rowIcon: {
    width: 28,
    alignItems: "center",
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  rowLabel: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  /** Só o rótulo em vermelho, não a dica: a dica explica a consequência e precisa ser lida. */
  rowLabelDestrutiva: {
    color: cores.error,
  },
  /**
   * Nota abaixo de um cartão, sobre a seção inteira. É onde o app diz onde os dados moram — dentro
   * de uma linha essa frase pareceria a descrição de um botão, e ela não é.
   */
  sectionFooter: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    paddingHorizontal: spacing.xs,
  },
  rowHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
}));
