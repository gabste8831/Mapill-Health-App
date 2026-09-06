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
  /**
   * `bodyLg`, o mesmo das linhas de Conta e Ajustes — e não o `headlineSm` de antes.
   *
   * Estas opções são itens de uma lista de escolha, não títulos de seção. Em headline elas tinham
   * mais peso que os rótulos dos menus que levam até aqui, e o par nome/descrição lia como dois
   * blocos em vez de título e explicação.
   */
  nome: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  nomeSelecionado: {
    ...typography.bodyLg,
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
