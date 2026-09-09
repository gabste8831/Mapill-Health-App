
import { estilosDoTema, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  /**
   * Os acordeões legais com a superfície dos cartões da tela.
   *
   * O padrão do `Accordion` é `surfaceContainerLow`, quase igual ao fundo — certo dentro de um
   * fluxo de texto longo, errado aqui, onde eles são blocos tocáveis logo abaixo de um cartão
   * branco. Sem cor própria, o único bloco clicável da tela era o que menos parecia clicável.
   */
  blocoLegal: {
    backgroundColor: cores.surfaceContainerLowest,
  },
  /**
   * Titulo de secao. `headlineSmRegular` e nao `label`: enquanto os rotulos eram maiusculos o
   * `label` bastava — a caixa alta dava presenca de titulo ao menor tamanho da escala. Em caixa de
   * frase a muleta acabou, e o cabecalho ficava em 13px abaixo do texto de apoio que ele encabeca.
   */
  sectionTitle: {
    ...typography.headlineSmRegular,
    color: cores.onSurfaceVariant,
  },
  statusList: {
    gap: spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  statusValue: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },
  statusText: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },
  statusHint: {
    ...typography.bodyMd,
    color: cores.outline,
  },
}));
