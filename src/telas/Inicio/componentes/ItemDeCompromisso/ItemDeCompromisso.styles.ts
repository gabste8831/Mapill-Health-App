import { estilosDoTema, radius, spacing, surfaceShadow, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * O mesmo cartão da linha de dose — arredondado, branco, com sombra —, para os dois tipos de
   * compromisso do dia formarem uma agenda só em vez de duas listas coladas.
   *
   * Em linha e não empilhado como a dose: aqui não há botões embaixo para separar, e o conteúdo é
   * curto o bastante para caber ao lado do ícone.
   */
  base: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: cores.surfaceContainerLowest,
    boxShadow: surfaceShadow,
  },
  /**
   * O ícone ocupa a mesma largura da coluna de hora da dose (64), para o texto das duas linhas
   * começar no mesmo lugar quando elas aparecem uma sob a outra.
   */
  icone: {
    width: 64,
    alignItems: "flex-start",
  },
  conteudo: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    ...typography.headlineSm,
    fontSize: 16,
    color: cores.onSurface,
  },
  detalhe: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /** Compareceu: verde discreto, porque é o desfecho esperado e não uma conquista. */
  selo: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.successSurface,
  },
  seloAusente: {
    backgroundColor: cores.errorSurface,
  },
  seloTexto: {
    ...typography.caption,
    color: cores.onSuccessContainer,
  },
  seloTextoAusente: {
    // O par de `errorSurface`, que e o fundo deste selo. `onErrorContainer` acompanha o
    // `errorContainer` — outro fundo — e no escuro e claro: 1.12:1 aqui.
    color: cores.onErrorSurface,
  },
}));
