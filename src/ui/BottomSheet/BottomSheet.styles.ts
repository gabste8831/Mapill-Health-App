
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  overlay: {
    flex: 1,
    // `scrim` e nao `onSurface` a 40%: aquele era o cinza do texto, e no tema escuro o texto e
    // quase branco — o veu clareava o fundo em vez de escurece-lo. Ver `shared/theme/colors.ts`.
    backgroundColor: cores.scrim,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: cores.surfaceContainerLowest,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  title: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  /**
   * O respiro de baixo fica aqui, e não no `sheet`: com o padding no container, o conteúdo rolado
   * encostaria na borda do popup em vez de terminar antes dela. O valor vem do componente, que soma
   * a safe area do aparelho — ver `respiroInferior`.
   */
  scrollContent: {
    paddingBottom: spacing.md,
  },
}));
