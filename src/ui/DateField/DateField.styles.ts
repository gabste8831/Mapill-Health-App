
import { estilosDoTema, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  campo: {
    flex: 1,
  },
  /**
   * O rótulo do campo, repetido **invisível** acima do botão para empurrá-lo até a altura do input.
   *
   * Já foi um `marginTop: 22` cravado, calculado para a altura de um rótulo — e por isso só
   * funcionava onde havia um. Em "QUANDO COMEÇA", que rotula a seção por fora e passa `label=""`
   * ao campo, os 22px empurravam o botão para baixo do input, visivelmente fora de centro.
   *
   * Aqui o espaço é o **próprio rótulo**, com a mesma tipografia e o mesmo `gap` do `TextField`.
   * Ele mede o que precisa medir em vez de adivinhar: rótulo de duas linhas, fonte ampliada pelo
   * sistema, campo sem rótulo nenhum — nos três o botão acompanha o input, porque é a mesma caixa
   * que o empurra nos dois lados. `aria-hidden` porque para quem usa leitor de tela o rótulo já foi
   * anunciado uma vez, e o botão tem o seu próprio.
   */
  rotuloFantasma: {
    ...typography.label,
    marginBottom: fieldLabelGap,
    opacity: 0,
  },
  botaoDeCalendario: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    backgroundColor: cores.surfaceContainerLowest,
  },
  sheetBody: {
    gap: spacing.md,
  },
  linhaDeAcoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acao: {
    flex: 1,
  },
}));
