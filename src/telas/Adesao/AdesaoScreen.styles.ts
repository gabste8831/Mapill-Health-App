
import { estilosDoTema, fieldLabelGap, listGap, radius, screenPadding, spacing, superficieDeCartao, typography, withOpacity } from "@/shared/theme";

/**
 * Altura da barra diária. Exportada porque a tela calcula a altura preenchida com ela.
 *
 * 80, o mesmo `BAR_ROW_HEIGHT` do card semanal da Home: os dois gráficos mostram o mesmo dado e não
 * têm por que ter escalas diferentes.
 */
const ALTURA_DA_BARRA = 80;

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  conteudo: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: spacing.gutter,
    paddingBottom: spacing.xxl,
  },

  destaque: {
    backgroundColor: cores.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
  },
  destaqueTaxa: {
    ...typography.headlineMd,
    fontSize: 48,
    lineHeight: 56,
  },
  destaqueLegenda: {
    ...typography.bodyMd,
    color: withOpacity(cores.onPrimary, 0.85),
  },

  taxa_boa: {
    color: cores.success,
  },
  taxa_media: {
    color: cores.onWarningSurface,
  },
  taxa_baixa: {
    color: cores.error,
  },
  destaqueTaxaTexto: {
    color: cores.onPrimary,
  },

  contagens: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  contagem: {
    ...superficieDeCartao(cores, ajustes),
    flex: 1,
    padding: spacing.md,
    gap: 2,
  },
  contagemValor: {
    ...typography.headlineMd,
    color: cores.onSurface,
  },
  contagemRotulo: {
    ...typography.label,
    color: cores.onSurface,
  },
  contagemDica: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },

  secao: {
    gap: listGap,
  },
  secaoTitulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },

  linha: {
    ...superficieDeCartao(cores, ajustes),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  linhaTexto: {
    flex: 1,
    gap: 2,
  },
  linhaNome: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  linhaDetalhe: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  linhaTaxa: {
    ...typography.headlineSm,
  },
  diaFaixa: {
    ...superficieDeCartao(cores, ajustes),
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.sm,
  },
  diaColuna: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  diaTrilho: {
    width: "100%",
    height: ALTURA_DA_BARRA,
    justifyContent: "flex-end",
  },
  diaBarra: {
    width: "100%",
    backgroundColor: cores.primary,
    borderRadius: 2,
    opacity: 0.2,
  },
  diaBarraHoje: {
    opacity: 1,
  },
  diaBarraVazia: {
    height: 2,
    backgroundColor: cores.outlineVariant,
    borderRadius: 2,
  },
  diaSigla: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },
  diaHojeTexto: {
    color: cores.onSurface,
    fontWeight: "700",
  },
  diaValor: {
    ...typography.bodySm,
    fontWeight: "700",
    color: cores.corDeDestaque,
  },
  diaValorUnidade: {
    ...typography.caption,
    fontWeight: "600",
  },
  diaSemDado: {
    ...typography.bodySm,
    fontWeight: "700",
    color: cores.onSurfaceVariant,
    opacity: 0.5,
  },
  diaData: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
    opacity: 0.6,
  },

  perdidasBloco: {
    backgroundColor: cores.surfaceContainerLowest,
    ...(ajustes?.contornarSuperficies
      ? { borderWidth: 1, borderColor: cores.outlineVariant }
      : null),
  },

  perdida: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.surfaceContainerHigh,
  },
  perdidaNome: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  perdidaSelo: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },

  rodape: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    marginTop: spacing.sm,
  },

  vazio: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  vazioTitulo: {
    ...typography.headlineSm,
    color: cores.onSurface,
    textAlign: "center",
  },
  vazioTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  erro: {
    ...typography.bodyMd,
    color: cores.error,
    textAlign: "center",
  },

  divisorDeEscopo: {
    height: 1,
    backgroundColor: cores.outlineVariant,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  secaoDeExportar: {
    gap: spacing.gutter,
  },
  exportarTopo: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  /**
   * O período dentro da seção do relatório: rótulo em cima, fileira embaixo.
   *
   * O `fieldLabelGap` é o mesmo dos formulários — o rótulo pertence ao controle logo abaixo, e
   * qualquer outro valor faria a fileira flutuar longe do que a nomeia.
   */
  periodoDoRelatorio: {
    gap: fieldLabelGap,
  },
  periodoRotulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  gruposDoRelatorio: {
    gap: spacing.sm,
  },
  /**
   * O ícone, **sem o quadrado colorido atrás**.
   *
   * Ele já teve fundo `primaryContainer`, e o conjunto — quadradinho de cor com título em negrito
   * ao lado — é o cabeçalho de card que todo gerador de site produz. Fora isso a cor não fazia
   * trabalho nenhum: azul aqui não distingue esta seção de nada, porque não há outra seção com
   * ícone para ela contrastar. O app reserva cor para função (vermelho é atraso, verde é agora), e
   * um azul decorativo enfraquece essa regra em todo lugar onde ela importa.
   *
   * A largura fixa fica, para o texto ao lado alinhar pela mesma coluna.
   */
  exportarTitulo: {
    ...typography.headlineSmRegular,
    color: cores.onSurface,
  },
  exportarDescricao: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },
  filtro: {
    ...superficieDeCartao(cores, ajustes),
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filtroVazio: {
    opacity: 0.6,
  },
  filtroTexto: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  filtroRotulo: {
    ...typography.bodyMd,
    color: cores.onSurface,
    flexShrink: 1,
  },
  filtroValor: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    marginLeft: "auto",
  },

  folha: {
    gap: listGap,
  },
  folhaAcoes: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  folhaAcao: {
    flex: 1,
  },
  folhaItem: {
    paddingVertical: spacing.xs,
  },
}));

export const alturaDaBarra = ALTURA_DA_BARRA;
