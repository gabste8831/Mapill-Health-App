
import {
  estilosDoTema,
  listGap,
  radius,
  screenPadding,
  spacing,
  superficieDeCartao,
  typography,
} from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  conteudo: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.gutter,
  },

  aviso: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.xs,
  },
  avisoTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  secao: {
    gap: listGap,
  },
  secaoTitulo: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  secaoNota: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  cartao: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.sm,
  },

  linha: {
    flexDirection: "row",
    // `flex-start` e não `center`: com o valor ocupando duas ou três linhas, centralizar deixaria o
    // rótulo flutuando no meio em vez de alinhado à primeira linha dele.
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  /**
   * O rótulo tem um piso de largura, e é isso que o impede de virar uma coluna de letras.
   *
   * Antes ele tinha só `flexShrink: 1` e o valor não tinha limite nenhum: um valor longo - como
   * "Mídia (o esperado é despertador - ver E.1)" - tomava toda a largura e espremia o rótulo até
   * "Volume do alarme" quebrar letra por letra, uma por linha. Apareceu em aparelho em 13/09.
   *
   * `flexBasis` reserva o espaço, `flexShrink: 0` impede que ele seja tomado, e o valor encolhe no
   * lugar. Rótulo é texto curto e conhecido; valor é o que varia.
   */
  rotulo: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    flexBasis: "40%",
    flexShrink: 0,
  },
  /**
   * O valor cede espaço e quebra em linhas - o oposto do rótulo.
   *
   * `flex: 1` com `textAlign` à direita mantém o alinhamento à direita que a tela tem, e deixa o
   * texto longo quebrar dentro da largura que sobra em vez de empurrar o rótulo.
   */
  valor: {
    ...typography.bodyMd,
    color: cores.onSurface,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  valorOk: {
    color: cores.success,
  },
  valorRuim: {
    color: cores.error,
  },

  agendado: {
    gap: 2,
    paddingVertical: spacing.sm,
  },
  agendadoComDivisoria: {
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
  },
  agendadoQuando: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  agendadoTitulo: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  agendadoId: {
    ...typography.caption,
    textTransform: "none",
    color: cores.onSurfaceVariant,
    opacity: 0.7,
  },
  selo: {
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.primaryContainer,
  },
  seloTexto: {
    ...typography.caption,
    color: cores.onPrimaryContainer,
  },

  vazio: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    paddingVertical: spacing.md,
    textAlign: "center",
  },

  acoes: {
    gap: spacing.sm,
  },
}));
