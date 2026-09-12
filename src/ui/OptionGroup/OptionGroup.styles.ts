
import {
  estilosDoTema,
  fieldLabelGap,
  radius,
  spacing,
  typography,
  withOpacity,
} from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  fieldGroup: {
    gap: fieldLabelGap,
  },
  fieldLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  /**
   * Duas colunas com o mesmo respiro na horizontal e na vertical: um `gap` só, e as opções
   * crescendo para ocupar o que sobra da divisão. Empurrar as colunas para as bordas
   * (`space-between`) também alinharia, mas engordaria só o vão do meio, e vão maior no meio que
   * embaixo lê como desalinho.
   */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  column: {
    gap: spacing.sm,
  },
  option: {
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLow,
    justifyContent: "center",
  },
  /**
   * Cresce pra dividir a linha igualmente. A base é estreita de propósito: é ela que decide
   * quantas opções cabem antes de quebrar, e cinco botões curtos ("1×", "Mais") têm que caber
   * numa linha só de celular.
   */
  optionInline: {
    flexGrow: 1,
    flexBasis: 48,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  /**
   * Base estreita o suficiente para caberem duas por linha e larga o suficiente para não caberem
   * três. Crescem juntas para fechar a linha inteira; quem impede a última linha ímpar de esticar
   * na largura toda é o preenchedor invisível (`espacoDaGrade`), e não um `flexGrow: 0` que
   * deixaria uma folga permanente na direita.
   */
  optionGrid: {
    flexBasis: "40%",
    flexGrow: 1,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  /** Ocupa a coluna que sobrou, sem desenhar nada. */
  espacoDaGrade: {
    flexBasis: "40%",
    flexGrow: 1,
  },
  /**
   * A opção que fecha a grade ocupando a linha toda (`ultimaOcupaLinha`). `flexBasis: "100%"` é o
   * que força a quebra: com 40% ela subiria para o lado da anterior, e é justamente por baixo
   * delas que ela precisa ficar — "Os dois" só faz sentido lido depois das duas que ele soma.
   */
  optionLinhaInteira: {
    flexBasis: "100%",
  },
  /**
   * Cartão da grade quando ela carrega ícone e apoio: alinhado à esquerda como texto se lê, e
   * com altura livre. Centralizar viraria quatro blocos decorativos difíceis de comparar.
   */
  optionAlto: {
    minHeight: 108,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  optionStacked: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  optionSelected: {
    backgroundColor: cores.primary,
  },
  optionLabel: {
    ...typography.bodyMd,
    color: cores.onSurface,
  },
  optionLabelSelected: {
    color: cores.onPrimary,
  },
  optionHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /**
   * Não é o branco cheio do label: continua sendo texto de apoio depois de selecionado, e igualar
   * os dois apagaria a hierarquia que o hint tem quando o cartão está apagado.
   *
   * **`onPrimary` a 85%, e não `secondaryContainer`** (12/09). O token anterior é uma cor de
   * *fundo*, e o valor dele muda de papel conforme o tema: no escuro ele é `#2C374A`, um navy
   * escuro, e como o cartão selecionado é azul em todos os temas, o resultado era **2,08:1**
   * (medido) — texto escuro sobre fundo escuro. Foi o que o Gabriel encontrou ao testar o cadastro
   * de medicação no modo escuro.
   *
   * O defeito também existia no tema claro, em 4,34:1, abaixo dos 4,5 que a WCAG pede para texto
   * normal — só era menos visível. A lição é a mesma da tela de alertas: uma cor só está segura
   * quando é definida **contra a superfície em que vai pousar**, e um `container` nunca foi isso.
   *
   * Com `onPrimary` a 85% o par é sempre o mesmo par, em qualquer tema: 4,59:1 nos três de fundo
   * azul e 6,88:1 no alto contraste, com o título cheio em 5,75:1 e 8,91:1 — a hierarquia continua
   * legível porque a diferença entre os dois textos é de peso, não de legibilidade.
   */
  optionHintSelected: {
    color: withOpacity(cores.onPrimary, 0.85),
  },
}));
