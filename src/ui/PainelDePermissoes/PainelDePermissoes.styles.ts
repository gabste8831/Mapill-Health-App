
import { estilosDoTema, misturarCores, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Âmbar, a mesma linguagem da `Dica` — é apoio, não erro: falta um ajuste do sistema, e o app
   * funciona. Quem diz de que estado se trata é o par fundo + ícone (ver `estadoVisual` em
   * shared/theme/cores.ts), e não uma barra de 4px na borda: ela deslocava o painel inteiro em
   * relação ao card de dose logo abaixo.
   *
   * ## Por que o fundo não é o `warningSurface` puro
   *
   * Ele é quase branco por natureza (`#FEF6E7`), e dentro de um popup — que já é uma superfície
   * branca sobre a tela — o bloco sumia: lia como um retângulo desbotado, não como um aviso. Trocar
   * o token resolveria aqui e estragaria a `Dica`, que o usa sobre fundo cinza, onde ele funciona.
   *
   * A saída é misturar um pouco da **cor do texto do próprio estado** no fundo: o âmbar continua
   * âmbar, só que com corpo suficiente para se sustentar contra o branco. Vindo do token, cada tema
   * se resolve sozinho — o escuro tem superfícies tingidas em vez de pastel, e o alto contraste já
   * encorpa `warningSurface` de propósito, então lá a mistura parte de uma base que já é forte.
   */
  painel: {
    backgroundColor: misturarCores(cores.onWarningSurface, cores.warningSurface, 0.12),
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  /** Falta uma essencial: o alarme não toca, e aí é erro mesmo. */
  painelCritico: {
    backgroundColor: misturarCores(cores.onErrorContainer, cores.errorSurface, 0.12),
  },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  /**
   * O texto acompanha o estado em vez de ficar no cinza padrão.
   *
   * Com `onSurface`, o conteúdo não pertencia ao bloco que o cerca — o fundo era âmbar e as letras,
   * do mesmo cinza de qualquer outro texto da tela. Tingir o título e a explicação é o que faz o
   * painel ler como uma peça só, e é o que sustenta o fundo claro sem precisar escurecê-lo.
   */
  titulo: {
    ...typography.label,
    color: cores.onWarningSurface,
    flex: 1,
  },
  tituloCritico: {
    color: cores.onErrorContainer,
  },
  explicacao: {
    ...typography.bodyMd,
    color: cores.onWarningSurface,
    lineHeight: 22,
  },
  explicacaoCritica: {
    color: cores.onErrorContainer,
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
  /**
   * O título da linha, em semibold.
   *
   * Ele e a descrição eram os dois `400Regular`, separados por 2px de tamanho — diferença que não
   * se lê como hierarquia, e a linha virava um bloco de texto uniforme onde nada dizia o que era o
   * assunto e o que era o apoio. O peso faz esse trabalho melhor que o tamanho: dá para ver de
   * relance qual permissão a linha trata, sem precisar ler a frase inteira.
   */
  itemTitulo: {
    ...typography.bodyLg,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: cores.onSurface,
  },
  itemDescricao: {
    ...typography.bodyMd,
    // 13, entre o `bodyMd` (14) e o `bodySm` (12): um degrau abaixo do título sem chegar ao tamanho
    // que o app reserva a rodapé e legenda — esta frase é a consequência, e precisa ser lida.
    fontSize: 13,
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
