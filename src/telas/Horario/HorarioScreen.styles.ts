
import { estilosDoTema, listGap, radius, screenPadding, spacing, superficieDeCartao, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  conteudo: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: listGap,
    paddingBottom: spacing.xxl,
  },
  /** "Sábado, 29 de agosto às 08:00" — situa quem chegou pela notificação horas depois. */
  quando: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  resumo: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },

  // --- Cartão de dose ---
  card: {
    ...superficieDeCartao(cores, ajustes),
    gap: spacing.md,
  },
  /** Respondida fica esmaecida, mas continua legível: é registro, não lixo. */
  cardResolvido: {
    opacity: 0.72,
  },
  cardTopo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  cardTexto: {
    flex: 1,
    gap: 2,
  },
  nome: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  quantidade: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  orientacao: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  selo: {
    alignItems: "center",
    gap: 2,
  },
  seloTexto: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },
  corrigirDica: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  /**
   * O aviso de dose adiada. Fundo azul claro, e não amarelo: adiar não é problema nem pendência
   * de erro — é uma resposta legítima que só não encerra a dose. O amarelo está reservado para o
   * que precisa de ação corretiva.
   */
  adiadaDica: {
    ...typography.bodyMd,
    color: cores.onSecondaryContainer,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.45),
    padding: spacing.md,
    borderRadius: radius.md,
  },

  /**
   * Os dois botões lado a lado e do mesmo tamanho. "Tomei" e "Pulei" são respostas igualmente
   * legítimas — dar mais peso a uma delas é sugerir a resposta, e o registro só vale se for o que
   * de fato aconteceu.
   */
  acoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acao: {
    flex: 1,
  },
  /** Metade do peso das outras: saída legítima, não atalho a ser incentivado. */
  acaoSecundaria: {
    marginTop: spacing.xs,
  },

  /** Afastado da lista: é saída da tela, não mais uma ação de dose. */
  irParaHome: {
    marginTop: spacing.md,
  },

  // --- Estados ---
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
}));
