
import { estilosDoTema, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  /**
   * `paddingTop` igual ao `gap`: o primeiro filho é um parágrafo solto, e com o padrão de 16 no
   * topo contra 48 de gap ele ficava colado no header e afastado do que vem abaixo.
   */
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.gutter,
    gap: 28,
    paddingBottom: spacing.xxl,
  },
  purposeText: {
    ...typography.bodySm,
    color: cores.outline,
  },
  /**
   * Mesma régua do divisor da tela de login. Não encosta nas laterais de propósito: a linha
   * curta separa sem virar mais uma borda dura na tela.
   */
  divider: {
    width: "90%",
    alignSelf: "center",
    height: 1,
    backgroundColor: cores.outlineVariant,
    opacity: 0.5,
  },
  highlightList: {
    gap: spacing.sm,
  },
  /** Texto sobre o azul do bloco — precisa do contraste invertido em relação ao resto da tela. */
  highlightDescription: {
    ...typography.bodyMd,
    color: cores.onPrimary,
  },
  // Gap menor entre os dois (Termos de Uso / Política de Privacidade) do que o resto da tela —
  // são irmãos do mesmo assunto, faz sentido ficarem visualmente mais próximos um do outro.
  legalSectionsGroup: {
    gap: spacing.sm,
  },
  consentGroup: {
    gap: spacing.md,
  },
}));
