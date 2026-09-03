
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

const AVATAR_SIZE = 56;

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  /**
   * Faixa colorida no topo, com o canto inferior arredondado. É o que tira a tela do aspecto de
   * lista uniforme: dá um ponto de entrada com peso visual antes das seções, que seguem neutras.
   */
  hero: {
    backgroundColor: cores.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.gutter,
    borderBottomLeftRadius: radius.lg * 2,
    borderBottomRightRadius: radius.lg * 2,
    gap: spacing.gutter,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  /** Alvo de toque de 44px (mínimo recomendado) sem empurrar o título com padding visível. */
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    ...typography.headlineMd,
    color: cores.onPrimary,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.primaryContainer,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    ...typography.headlineSm,
    color: cores.onPrimary,
  },
  identityText: {
    flex: 1,
    gap: spacing.xs,
  },
  identityGreeting: {
    ...typography.bodyMd,
    color: cores.onPrimaryContainer,
    opacity: 0.85,
  },
  identityName: {
    ...typography.headlineSm,
    color: cores.onPrimary,
  },
  identityEdit: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.primaryContainer,
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
  /** Só o rótulo em vermelho, não a dica: a dica é o que explica a consequência e precisa ser lida. */
  rowLabelDestrutiva: {
    color: cores.error,
  },
  rowHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
}));
