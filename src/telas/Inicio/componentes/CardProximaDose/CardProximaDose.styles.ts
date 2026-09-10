
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    backgroundColor: cores.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: "hidden",
  },
  marcaDagua: {
    position: "absolute",
    right: -30,
    bottom: -34,
    opacity: 0.12,
    transform: [{ rotate: "-20deg" }],
  },
  conteudo: {
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seloDoRotulo: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(cores.onPrimary, 0.2),
  },
  headerEsquerda: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: cores.onPrimary,
    opacity: 0.7,
  },
  remedio: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  time: {
    ...typography.headlineXl,
    color: cores.onPrimary,
  },
  medication: {
    ...typography.headlineSmRegular,
    color: cores.onPrimary,
  },
  /**
   * A dose, abaixo do nome e um degrau mais apagada.
   *
   * Ela responde "quanto", que so importa depois de saber "o que" — a opacidade e o que poe as
   * duas linhas em ordem sem precisar de outro tamanho de fonte.
   */
  dose: {
    ...typography.bodyMd,
    color: cores.onPrimary,
    opacity: 0.8,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: withOpacity(cores.onPrimary, 0.2),
  },
  hintText: {
    ...typography.label,
    color: cores.onPrimary,
    opacity: 0.85,
    flex: 1,
  },
}));
