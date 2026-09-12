
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  painel: {
    backgroundColor: cores.warningSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  /** Falta uma permissão essencial: o alarme não toca. */
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
    color: cores.onWarningSurface,
    flex: 1,
  },
  tituloCritico: {
    // Par de `errorSurface`. Com `onErrorContainer` daria 1.12:1 no tema escuro.
    color: cores.onErrorSurface,
  },
  explicacao: {
    ...typography.bodyMd,
    color: cores.onWarningSurface,
    lineHeight: 22,
  },
  explicacaoCritica: {
    color: cores.onErrorSurface,
  },
  /**
   * O "Todas são necessárias" dentro da frase.
   *
   * Negrito e não cor: a frase inteira já vive num painel de alerta, e uma segunda cor aqui
   * competiria com o vermelho do título sem acrescentar significado. O peso basta para a vista
   * parar na parte que muda a leitura do resto.
   */
  enfase: {
    fontFamily: "PlusJakartaSans_600SemiBold",
  },

  /**
   * Os estilos da lista de itens saíram em 12/09, com a lista.
   *
   * Eram dez (`lista`, `item`, `itemTexto`, `itemTopo`, `itemTitulo`, `itemDescricao`,
   * `itemComoFazer`, `selo`, `seloTexto` e o respiro do topo), e carregavam decisões de contraste
   * que valem registro caso a lista volte: a tinta era sempre `onWarningSurface`, porque no tema
   * escuro o `onSurface` é quase branco e sobre o âmbar dava 1.09:1. O fundo do item era branco
   * cravado pelo mesmo motivo — token de superfície vira escuro no tema escuro.
   *
   * O histórico completo está no git; aqui fica só a razão de não existirem mais: uma lista parcial
   * de permissões obrigatórias enganava sobre o que faltava fazer (ver `PainelDePermissoes`).
   */
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
