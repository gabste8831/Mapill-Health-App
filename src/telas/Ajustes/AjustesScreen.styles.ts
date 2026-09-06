
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

const AVATAR_SIZE = 56;

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    /**
     * `gutter` (24) e não `lg` (32).
     *
     * A Home usa 40 entre seções porque lá cada bloco é um assunto independente que disputa
     * atenção. Aqui todas as seções são a mesma coisa — uma lista de opções de configuração —, e o
     * vão grande fazia cada título nascer isolado no meio de um vazio, sobretudo depois do
     * indicador de sincronização, que já tem respiro próprio.
     */
    gap: spacing.gutter,
  },
  /**
   * Faixa colorida no topo, com o canto inferior arredondado. É o que tira a tela do aspecto de
   * lista uniforme: dá um ponto de entrada com peso visual antes das seções, que seguem neutras.
   */
  hero: {
    backgroundColor: cores.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.gutter,
    borderBottomLeftRadius: radius.lg * 2,
    borderBottomRightRadius: radius.lg * 2,
    gap: spacing.gutter,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  /** Alvo de toque de 44px (mínimo recomendado) sem empurrar o título com padding visível. */
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    ...typography.headlineMd,
    color: cores.onPrimary,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.primaryContainer,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    ...typography.headlineSm,
    color: cores.onPrimary,
  },
  identityText: {
    flex: 1,
    gap: spacing.xs,
  },
  identityGreeting: {
    ...typography.bodyMd,
    color: cores.onPrimaryContainer,
    opacity: 0.85,
  },
  identityName: {
    ...typography.headlineSm,
    color: cores.onPrimary,
  },
  identityEdit: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.primaryContainer,
  },
  /**
   * O cartão que agrupa linhas de menu, mais apertado que o `Card` padrão.
   *
   * O padrão tem `gap: gutter` (24) entre filhos, pensado para blocos de formulário — campos que
   * precisam de ar entre si. Numa lista de menu isso soma com o `minHeight: 52` de cada linha e dá
   * 76px por item: cada botão ocupava uma faixa de tela sem carregar mais informação por isso.
   *
   * Com `sm` (8) a linha continua com os 52 de alvo de toque, e a lista lê como lista.
   */
  cartaoDeLinhas: {
    gap: spacing.sm,
    // O padding vertical do `Card` (16) somava ao alvo de toque da primeira e da última linha, que
    // já têm 44 próprios. `sm` mantém o texto descolado da borda sem inflar o cartão.
    paddingVertical: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    paddingLeft: spacing.xs,
  },
  /**
   * 44 de altura, e não os 52 dos campos de formulário.
   *
   * Os 52 são a altura de interação de `Button`, `TextField` e `SelectField` — controles que se
   * opera. Estas linhas não têm subtítulo (saiu numa revisão anterior), então o conteúdo é uma
   * única linha de texto de ~24px: sobravam 28px de folga vertical, e cada botão virava uma faixa.
   *
   * 44 continua sendo o alvo de toque mínimo recomendado (WCAG 2.5.5 / Material), e a linha inteira
   * é clicável — o dedo tem a largura da tela para acertar.
   */
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 44,
  },
  /** Largura fixa pra alinhar os rótulos entre linhas, mesmo com ícones de larguras diferentes. */
  rowIcon: {
    width: 28,
    alignItems: "center",
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  rowLabel: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  /** Só o rótulo em vermelho, não a dica: a dica é o que explica a consequência e precisa ser lida. */
  rowLabelDestrutiva: {
    color: cores.error,
  },
  rowHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
}));
