
import { estilosDoTema, radius, spacing, surfaceShadow, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * `minHeight`, e nunca `height`.
   *
   * Com altura travada em 52, o rótulo de **todo botão do app** era recortado quando a pessoa
   * aumenta a fonte nas configurações do Android — inclusive o "Confirmar" da dose, que é a ação
   * mais importante que existe aqui. E quem aumenta a fonte do sistema é exatamente o público que
   * este app atende: a acessibilidade quebrava justo em quem mais depende dela.
   *
   * O `paddingVertical` é o que deixa o botão crescer junto com o texto em vez de cortá-lo; os 52
   * viram o piso, que continua sendo um alvo de toque folgado.
   */
  base: {
    minHeight: 52,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  primary: {
    backgroundColor: cores.primary,
  },
  /** Sombra em vez de borda, mesma lógica do Card: lê como superfície, não como contorno. */
  outline: {
    backgroundColor: cores.surfaceContainerLowest,
    boxShadow: surfaceShadow,
  },
  /**
   * O mesmo botão, mas dentro de um `BottomSheet` — onde a sombra desaparece.
   *
   * A folha já é uma superfície clara elevada, então uma sombra sutil sobre ela não se vê, e o
   * botão sumia junto: "Cancelar" virava um texto solto ao lado do "Confirmar", justamente onde
   * ninguém pode hesitar sobre o que é clicável. O contorno entra **só aqui**, e não no `outline`
   * inteiro, porque sobre o fundo da tela a sombra funciona e a borda contraria a linguagem
   * visual do app (sombra no lugar de borda, decisão de 21/08).
   */
  outlineEmFolha: {
    borderWidth: 1,
    borderColor: cores.outlineVariant,
  },
  /**
   * O botão de texto não reserva os 52: ele é uma saída discreta ("Agora não"), e com o piso do
   * `base` ficaria com a mesma presença de uma ação principal.
   */
  text: {
    backgroundColor: "transparent",
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...typography.headlineSm,
    fontSize: 16,
  },
  primaryLabel: {
    color: cores.onPrimary,
  },
  outlineLabel: {
    color: cores.onSurface,
  },
  textLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
}));
