import { estilosDoTema, radius, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  /**
   * O cartão de uma dose: os dados em cima, as duas ações embaixo dividindo a largura.
   *
   * `superficieDeCartao` sem nada por cima — o mesmo cartão do "Acompanhamento semanal" logo
   * abaixo na Home, e o mesmo de Remédios, Compromissos e Estoque. Repetir fundo, raio e sombra à
   * mão aqui era o que fazia esta linha destoar dos cartões vizinhos, e é a cópia que o token
   * existe para evitar. De quebra, ele troca a sombra por contorno no alto contraste, onde sombra
   * não se enxerga.
   */
  base: {
    ...superficieDeCartao(cores, ajustes),
    gap: spacing.md,
  },
  corpo: {
    gap: spacing.md,
  },
  highlighted: {
    borderLeftWidth: 4,
    borderLeftColor: cores.primary,
  },
  late: {
    borderLeftWidth: 4,
    borderLeftColor: cores.errorVivo,
  },
  now: {
    borderLeftWidth: 4,
    borderLeftColor: cores.successVivo,
  },
  pressionada: {
    backgroundColor: cores.surfaceContainer,
  },

  infoAgrupada: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.sm,
  },
  timeColumn: {
    width: 60,
    gap: 2,
    justifyContent: "center",
  },
  time: {
    ...typography.label,
    fontSize: 16,
    color: cores.onSurface,
  },
  statusLabel: {
    ...typography.caption,
    color: cores.corDeDestaque,
  },
  statusLabelUpcoming: {
    color: cores.onSurfaceVariant,
    opacity: 0.7,
  },
  statusLabelNow: {
    color: cores.success,
  },
  statusLabelLate: {
    color: cores.error,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  medicationName: {
    ...typography.headlineSm,
    fontSize: 16,
    lineHeight: 21,
    color: cores.onSurface,
  },
  medicationNameSkipped: {
    textDecorationLine: "line-through",
  },
  note: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  confirmButton: {
    flex: 1,
    minHeight: 36,
    justifyContent: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.primary,
  },
  confirmButtonText: {
    ...typography.caption,
    color: cores.onPrimary,
    textAlign: "center",
  },
  skipButton: {
    flex: 1,
    minHeight: 36,
    justifyContent: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.surfaceContainer,
  },
  skipButtonText: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
}));
