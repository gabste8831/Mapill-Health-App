
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * Fundo **azul cheio**, e não o cinza claro do resto do app.
   *
   * É a única tela do Mapill que não parece o Mapill, e isso é intencional: ela irrompe sobre a
   * tela de bloqueio, muitas vezes no escuro, e precisa ser reconhecida em meio segundo como "o
   * alarme do remédio" — não como mais uma tela do aplicativo. A cor cheia também separa o que
   * exige resposta agora do que se consulta com calma.
   */
  safeArea: {
    flex: 1,
    backgroundColor: cores.primary,
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },

  cabecalho: {
    alignItems: "center",
    gap: spacing.xs,
  },
  icone: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(cores.onPrimary, 0.18),
  },
  titulo: {
    ...typography.label,
    color: cores.onPrimary,
    opacity: 0.8,
    textAlign: "center",
  },
  hora: {
    ...typography.headlineXl,
    fontSize: 72,
    lineHeight: 80,
    color: cores.onPrimary,
  },

  /**
   * Ocupa tudo o que sobra abaixo do cabeçalho, com o remédio centrado nesse espaço.
   *
   * `flex: 1` é o que faz o nome e a foto ficarem no meio da tela em vez de logo abaixo da hora — e
   * com vários remédios a lista simplesmente cresce e empurra o rodapé, que é quando o `ScrollView`
   * passa a rolar.
   */
  lista: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg,
  },
  item: {
    alignItems: "center",
    gap: spacing.xs,
  },
  foto: {
    width: 132,
    height: 132,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  /** Branco sobre o azul: é o texto mais importante do app, lido sem óculos e recém-acordado. */
  nome: {
    ...typography.headlineMd,
    fontSize: 30,
    lineHeight: 38,
    color: cores.onPrimary,
    textAlign: "center",
  },
  nomeCompacto: {
    ...typography.headlineSm,
    color: cores.onPrimary,
    textAlign: "center",
  },
  quantidade: {
    ...typography.headlineSm,
    color: cores.onPrimary,
    opacity: 0.85,
    textAlign: "center",
  },
  orientacao: {
    ...typography.bodyLg,
    color: cores.onPrimary,
    opacity: 0.75,
    lineHeight: 26,
    textAlign: "center",
  },
  local: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  localTexto: {
    ...typography.bodyMd,
    color: cores.onPrimary,
  },

  acoes: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  linhaDeResposta: {
    flexDirection: "row",
    gap: spacing.md,
  },
  botaoTomei: {
    flex: 1,
    flexDirection: "row",
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.onPrimary,
  },
  textoTomei: {
    ...typography.label,
    fontSize: 15,
    color: cores.primary,
  },
  botaoPulei: {
    flex: 1,
    flexDirection: "row",
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: withOpacity(cores.onPrimary, 0.18),
  },
  textoPulei: {
    ...typography.label,
    fontSize: 15,
    color: cores.onPrimary,
  },
  linhaDeSaidas: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  botaoSilenciar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 48,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: withOpacity(cores.onPrimary, 0.35),
  },
  textoSilenciar: {
    ...typography.label,
    color: cores.onPrimary,
    opacity: 0.9,
  },
  botaoDepois: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  textoDepois: {
    ...typography.label,
    color: cores.onPrimary,
    opacity: 0.8,
  },
  silenciadoAviso: {
    ...typography.bodyMd,
    color: cores.onPrimary,
    textAlign: "center",
    opacity: 0.85,
    paddingVertical: spacing.md,
  },
}));
