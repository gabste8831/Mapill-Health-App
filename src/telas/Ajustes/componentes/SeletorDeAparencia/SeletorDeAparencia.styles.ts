import {
  estilosDoTema,
  radius,
  spacing,
  superficieDeCartao,
  typography,
} from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  cartao: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.sm,
    gap: spacing.xs,
  },
  /**
   * Uma opção por linha, e não chips lado a lado.
   *
   * Cada tema precisa de um nome **e** de uma frase que diga para quem ele serve — "Alto
   * contraste" sozinho não informa que é para baixa visão. Numa fileira de chips não cabe a frase,
   * e sem ela a pessoa escolhe por tentativa.
   */
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  opcaoSelecionada: {
    backgroundColor: cores.primarySurface,
  },
  /**
   * A amostra do tema: um círculo pequeno mostrando o fundo e a cor de ação daquele tema.
   *
   * Vale mais que qualquer descrição — a pessoa vê o escuro antes de escolher o escuro. O contorno
   * é obrigatório: sem ele, a amostra do tema claro sobre o cartão branco seria invisível.
   */
  amostra: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    overflow: "hidden",
    flexDirection: "row",
  },
  amostraFundo: {
    flex: 1,
  },
  amostraAcao: {
    width: 10,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  nome: {
    ...typography.headlineSmRegular,
    color: cores.onSurface,
  },
  nomeSelecionado: {
    ...typography.headlineSmRegular,
    color: cores.onPrimarySurface,
  },
  descricao: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },
  descricaoSelecionada: {
    color: cores.onPrimarySurface,
  },
}));
