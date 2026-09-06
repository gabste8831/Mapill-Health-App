
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  /**
   * A faixa de abertura, tingida de azul claro.
   *
   * Cor num tom só e sem sombra: ela enquadra o assunto e não compete com os cartões abaixo. O
   * escudo à esquerda é o que dá o tom da tela de relance — as três seções aqui são sobre
   * proteção de dados, e o ícone diz isso antes de qualquer palavra ser lida.
   */
  intro: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: withOpacity(cores.corDeDestaque, 0.08),
  },
  introIcone: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: withOpacity(cores.corDeDestaque, 0.12),
  },
  introTexto: {
    ...typography.bodyMd,
    color: cores.onSurface,
    flex: 1,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    // 52 é a altura padrão de interação do app (Button, TextField, SelectField). A linha
    // inteira é clicável, o que já dá alvo de sobra pro público idoso.
    minHeight: 52,
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
  /** Só o rótulo em vermelho, não a dica: a dica explica a consequência e precisa ser lida. */
  rowLabelDestrutiva: {
    color: cores.error,
  },
  /**
   * Nota abaixo de um cartão, sobre a seção inteira. É onde o app diz onde os dados moram — dentro
   * de uma linha essa frase pareceria a descrição de um botão, e ela não é.
   */
  sectionFooter: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    paddingHorizontal: spacing.xs,
  },
  /**
   * A dica, menor que o rótulo — a ênfase é o que separa os dois.
   *
   * Estava em `bodyMd`, quase do tamanho do `bodyLg` do rótulo, e as duas linhas liam como um
   * parágrafo de duas frases em vez de título e explicação. Em `bodySm` a hierarquia aparece: o
   * rótulo se lê ao varrer a lista, a dica só quando o olho para naquela linha.
   */
  rowHint: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },
}));
