
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

const AVATAR_SIZE = 56;

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    /**
     * `gutter` (24) e não `lg` (32).
     *
     * A Home usa 40 entre seções porque lá cada bloco é um assunto independente que disputa
     * atenção. Aqui todas as seções são a mesma coisa — uma lista de opções de configuração —, e o
     * vão grande fazia cada título nascer isolado no meio de um vazio, sobretudo depois do
     * indicador de sincronização, que já tem respiro próprio.
     */
    gap: spacing.gutter,
  },
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
  cartaoDeLinhas: {
    gap: spacing.sm,
    // O padding vertical do `Card` (16) somava ao alvo de toque da primeira e da última linha, que
    // já têm 44 próprios. `sm` mantém o texto descolado da borda sem inflar o cartão.
    paddingVertical: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  /** Um degrau abaixo na escala — a mesma decisão do cadastro de medicação. */
  sectionTitle: {
    ...typography.bodyLg,
    color: cores.onSurfaceVariant,
    paddingLeft: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 44,
  },
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
  rowLabelDestrutiva: {
    color: cores.error,
  },
  rowHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
}));
