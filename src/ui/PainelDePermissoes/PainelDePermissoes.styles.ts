
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  painel: {
    backgroundColor: cores.warningSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  /** Falta uma permissão essencial: o alarme não toca. */
  painelCritico: {
    backgroundColor: cores.errorSurface,
  },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  titulo: {
    ...typography.label,
    color: cores.onWarningSurface,
    flex: 1,
  },
  tituloCritico: {
    // Par de `errorSurface`. Com `onErrorContainer` daria 1.12:1 no tema escuro.
    color: cores.onErrorSurface,
  },
  explicacao: {
    ...typography.bodyMd,
    color: cores.onWarningSurface,
    lineHeight: 22,
  },
  explicacaoCritica: {
    color: cores.onErrorSurface,
  },
  /**
   * O "Todas são necessárias" dentro da frase.
   *
   * Negrito e não cor: a frase inteira já vive num painel de alerta, e uma segunda cor aqui
   * competiria com o vermelho do título sem acrescentar significado. O peso basta para a vista
   * parar na parte que muda a leitura do resto.
   */
  enfase: {
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  botaoPedir: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: cores.primary,
    marginTop: spacing.xs,
  },
  botaoPedirTexto: {
    ...typography.label,
    color: cores.onPrimary,
  },
}));
