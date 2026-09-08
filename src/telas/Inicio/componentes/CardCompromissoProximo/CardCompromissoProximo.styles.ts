
import {
  estilosDoTema,
  radius,
  spacing,
  superficieDeCartao,
  typography,
  withOpacity,
} from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  /**
   * Superfície clara com uma barra lateral colorida, e não o azul cheio da próxima dose.
   *
   * O card azul é a única quebra da paleta neutra da Home, e é o que faz a próxima dose se destacar
   * de tudo. Um segundo azul não somaria destaque — dividiria o que existe. A barra lateral dá
   * presença de card sem disputar essa vaga, e é a mesma linguagem do cartão de dose do dia.
   */
  container: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: cores.corDeDestaque,
    overflow: "hidden",
  },
  /** No dia, a barra vira verde — o mesmo sinal de "é agora" do cartão de dose. */
  containerHoje: {
    borderLeftColor: cores.success,
  },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  /**
   * O bloco de data, 52×52 como na listagem de compromissos.
   *
   * É a assinatura visual do compromisso no app: quem viu a lista reconhece o card sem ler. Quadrado
   * fixo porque "3 JAN" e "24 DEZ" precisam ocupar o mesmo espaço.
   */
  dataColuna: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: cores.corDeDestaque,
  },
  dataColunaHoje: {
    backgroundColor: cores.success,
  },
  diaDoMes: {
    ...typography.headlineSm,
    color: cores.onPrimary,
  },
  mesAbreviado: {
    ...typography.caption,
    color: cores.onPrimary,
  },

  texto: {
    flex: 1,
    gap: 2,
  },
  /**
   * A distância em dias, acima do título.
   *
   * É a resposta que a pessoa procura primeiro num card que não é de hoje — "quando?" vem antes de
   * "o quê?" quando a data ainda não chegou.
   */
  distancia: {
    ...typography.label,
    color: cores.corDeDestaque,
  },
  distanciaHoje: {
    // Sobre o cartão branco, então o token de texto — o de container é quase preto e destoaria da
    // barra lateral verde ao lado.
    color: cores.success,
  },
  titulo: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  quando: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  /**
   * O preparo, separado por um traço.
   *
   * É a única informação do compromisso que **exige** ação antecipada: jejum, levar exames, chegar
   * meia hora antes. Dar a ela uma faixa própria é o que justifica este card existir em vez de uma
   * linha — descobrir "jejum de 12h" só ao abrir o detalhe é descobrir tarde.
   */
  preparo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: withOpacity(cores.onSurface, 0.1),
  },
  preparoTexto: {
    ...typography.bodyMd,
    color: cores.onSurface,
    flex: 1,
  },

  /**
   * "Você foi?", quando o horário já passou.
   *
   * Separado por um traço como o preparo, e pelo mesmo motivo: é outra coisa que o card diz, e
   * colada ao texto acima ela leria como parte do compromisso em vez de uma pergunta sobre ele.
   */
  pergunta: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: withOpacity(cores.onSurface, 0.1),
  },
  perguntaTexto: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },
  /**
   * Os dois botões, **exatamente os da linha de dose**: mesma pílula, mesma altura de 36, mesma
   * divisão de largura. Responder "fui" a uma consulta e "tomei" a um remédio são o mesmo gesto no
   * mesmo lugar da tela, e desenhá-los diferente obrigaria a reaprender o que já se sabe.
   *
   * A ordem também é a de lá: **o negativo à esquerda, o positivo à direita** — a ordem de
   * Cancelar/OK do sistema, com a resposta esperada onde o polegar chega.
   */
  botoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  botao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    // 44 continua sendo o alvo real, garantido pelo `hitSlop` no componente — igual à dose.
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  /** "Fui": pílula cheia, como "Confirmar". É o desfecho esperado. */
  botaoFui: {
    backgroundColor: cores.primary,
  },
  botaoFuiTexto: {
    ...typography.caption,
    color: cores.onPrimary,
  },
  /** "Não fui": fundo suave, como "Pular". Saída legítima, não atalho a incentivar. */
  botaoNaoFui: {
    backgroundColor: cores.surfaceContainer,
  },
  botaoNaoFuiTexto: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },

  /** O desfecho já registrado, no canto onde estava o chevron. */
  selo: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.successSurface,
  },
  seloAusente: {
    backgroundColor: cores.errorSurface,
  },
  seloTexto: {
    ...typography.caption,
    color: cores.onSuccessContainer,
  },
  seloTextoAusente: {
    color: cores.onErrorContainer,
  },
}));
