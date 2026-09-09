
import { estilosDoTema, radius, screenPadding, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    padding: screenPadding,
    gap: spacing.md,
    // Espaço pro rodapé fixo não cobrir o último campo quando a tela chega ao fim.
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
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
  selo: {
    ...typography.caption,
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  seloObrigatorio: {
    color: cores.onErrorContainer,
    backgroundColor: cores.errorContainer,
  },
  seloOpcional: {
    color: cores.onSecondaryContainer,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.6),
  },
  hint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /** A confirmação em texto do que foi escolhido — "quarta-feira, 27 de agosto, às 14:30". */
  confirmacao: {
    ...typography.bodyMd,
    color: cores.onSecondaryContainer,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.5),
    padding: spacing.md,
    borderRadius: radius.md,
  },
  /**
   * Cor de atenção, não de erro: escolher outra data resolve, e nada foi perdido.
   *
   * **Amarelo, e não o `tertiaryContainer` de antes.** Aquele token é laranja escuro (`#C05400`), e
   * num bloco de texto ele lê como marrom — uma quinta cor num app que fala quatro: vermelho para o
   * urgente, verde para o que está na hora, azul para o destaque comum, amarelo para o alerta. Era
   * o único lugar do app que consumia o terciário, então ele não padronizava nada; só destoava.
   *
   * `warningSurface` e não `warningVivo` porque isto é um bloco de várias linhas: o amarelo de
   * semáforo funciona em selo e ponto, e agride em área grande (ver o cabeçalho de `warningSurface`
   * em `shared/theme/colors.ts`).
   */
  aviso: {
    ...typography.bodyMd,
    color: cores.onWarningSurface,
    backgroundColor: cores.warningSurface,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  erro: {
    ...typography.bodySm,
    // O bloco e ambar, entao a tinta e a do ambar. `error` e o vermelho sobre a superficie da
    // tela, e no escuro ele e claro: 1.83:1 aqui.
    color: cores.onWarningSurface,
  },
  /**
   * O último lugar da fileira de antecedências: as opções cobrem o comum e este campo cobre o
   * resto, sem gastar um segundo toque nem uma segunda linha. Mesmo padrão do "quantas vezes por
   * dia" do cadastro de medicamento.
   */
  campoLivre: {
    flexGrow: 1,
    minWidth: 72,
    // `minHeight`: é campo de digitação, e altura travada corta o número em fonte ampliada.
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    textAlign: "center",
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLowest,
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  campoLivreAtivo: {
    borderColor: cores.primary,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.4),
  },
  submitHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
}));
