
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Âmbar diluído, sem faixa lateral — a mesma linguagem da `Dica`.
   *
   * É apoio, não erro: falta um ajuste do sistema, e o app funciona. Quem diz de que estado se
   * trata é o par fundo + ícone (ver `estadoVisual` em shared/theme/cores.ts), e não mais uma
   * barra de 4px na borda: ela deslocava o painel inteiro em relação ao card de dose logo abaixo.
   */
  painel: {
    backgroundColor: cores.warningSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  /** Falta uma essencial: o alarme não toca, e aí é erro mesmo. */
  painelCritico: {
    backgroundColor: cores.errorSurface,
  },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  titulo: {
    ...typography.label,
    color: cores.onSurface,
    flex: 1,
  },
  explicacao: {
    ...typography.bodyMd,
    color: cores.onSurface,
    lineHeight: 22,
  },

  lista: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  /**
   * A linha inteira é o alvo, e não um botão no canto.
   *
   * Cada item leva a uma tela diferente do sistema, e um alvo grande é o que separa "resolvo agora"
   * de "depois eu vejo" — que, nesta lista, significa continuar sem alarme.
   */
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLowest,
  },
  itemTexto: {
    flex: 1,
    gap: 2,
  },
  itemTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemTitulo: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  itemDescricao: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    lineHeight: 20,
  },
  /**
   * O passo dentro da tela do sistema, um degrau abaixo da consequência.
   *
   * Cor de destaque e não o cinza da descrição: é a única linha do item que diz o que **fazer**, e
   * precisa se separar do texto que explica por que importa. O respiro em cima marca essa virada de
   * assunto sem precisar de outro elemento.
   */
  itemComoFazer: {
    ...typography.bodySm,
    color: cores.corDeDestaque,
    lineHeight: 18,
    marginTop: spacing.xs,
  },

  /** Separa o que impede o alarme do que só o degrada — as duas coisas pedem urgências diferentes. */
  selo: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: cores.errorSurface,
  },
  seloTexto: {
    ...typography.caption,
    color: cores.error,
  },

  botaoPedir: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: cores.primary,
    marginTop: spacing.xs,
  },
  botaoPedirTexto: {
    ...typography.label,
    color: cores.onPrimary,
  },
}));
