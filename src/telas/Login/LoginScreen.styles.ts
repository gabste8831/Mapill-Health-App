
import { estilosDoTema, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    justifyContent: "center",
    gap: spacing.lg,
  },
  brand: {
    alignItems: "center",
    gap: spacing.sm,
  },
  brandLogo: {
    width: 220,
    height: 68,
  },
  brandSubtitle: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 400,
  },
  form: {
    alignItems: "center",
    gap: spacing.md,
  },
  // Largura máxima acompanhando a logo (mesmos 220 de brandLogo) — os dois botões de ação
  // ficam visualmente ancorados à marca em vez de esticar a largura toda da tela.
  actionButtonWidth: {
    width: "100%",
    maxWidth: 350,
  },
  footer: {
    alignItems: "center",
  },
  footerDivider: {
    width: "100%",
    maxWidth: 350,
    height: 1,
    backgroundColor: cores.outlineVariant,
    opacity: 0.6,
    marginBottom: spacing.lg,
  },
  footerCaption: {
    ...typography.bodysm,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    opacity: 0.6,
    maxWidth: 350,
  },
}));
