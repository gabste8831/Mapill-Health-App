
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  // A roda do Material (iOS) só se desenha dentro de um host de largura finita — sem os dois, ela
  // colapsa e não aparece nada na tela. Continua aqui porque o irmão `.ios.tsx` a usa.
  host: {
    width: "100%",
  },

  // --- Campos de digitação (Android e web) ---
  campos: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  campo: {
    alignItems: "center",
    gap: spacing.xs,
  },
  /**
   * Caixas grandes, como as do Material 3 em modo digitação. O tamanho não é enfeite: são dois
   * números de dois dígitos que precisam ser conferidos de relance por quem tem a caixa do remédio
   * na outra mão, e o alvo de toque precisa perdoar o dedo.
   */
  entrada: {
    ...typography.headlineSm,
    fontSize: 34,
    lineHeight: 42,
    textAlign: "center",
    width: 92,
    paddingVertical: spacing.sm,
    color: cores.onSurface,
    backgroundColor: cores.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 2,
    // Transparente e não zero: a borda do foco não pode mudar a altura da caixa, senão os dois
    // campos pulam de tamanho conforme se anda entre eles.
    borderColor: "transparent",
  },
  entradaFocada: {
    borderColor: cores.primary,
    backgroundColor: cores.surfaceContainerLowest,
  },
  rotulo: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },
  /** Os dois pontos entre as caixas, alinhados com os números e não com os rótulos. */
  separador: {
    ...typography.headlineSm,
    fontSize: 30,
    color: cores.onSurfaceVariant,
    // Sobe o mesmo tanto que a altura do rótulo abaixo empurraria para baixo.
    marginBottom: spacing.md,
  },
  ajuda: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
}));
