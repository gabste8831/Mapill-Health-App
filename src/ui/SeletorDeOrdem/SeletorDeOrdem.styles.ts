
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  fileira: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  ficha: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    // 40 de altura: menor que o alvo de 44 dos botões de ação, porque errar aqui só reordena a
    // lista — é reversível num toque, diferente de confirmar uma dose.
    height: 40,
    borderRadius: radius.full,
    backgroundColor: cores.surfaceContainerLow,
  },
  fichaSelecionada: {
    backgroundColor: cores.primary,
  },
  rotulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  rotuloSelecionado: {
    color: cores.onPrimary,
  },
}));
