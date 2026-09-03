
import { estilosDoTema, radius, spacing, superficieDeCartao, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
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
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.xl,
  },

  cabecalho: {
    alignItems: "center",
    gap: spacing.md,
  },
  icone: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    // Branco translúcido sobre o azul: o ícone se destaca sem precisar de uma segunda cor.
    backgroundColor: withOpacity(cores.onPrimary, 0.18),
  },
  titulo: {
    ...typography.headlineMd,
    color: cores.onPrimary,
    textAlign: "center",
  },
  /** A hora em tamanho de relógio: quem acorda com o alarme quer saber que horas são. */
  /** 56 e display de instancia unica: a hora precisa ser legivel a distancia, de olhos recem-abertos. */
  hora: {
    ...typography.headlineXl,
    fontSize: 56,
    lineHeight: 64,
    color: cores.onPrimary,
  },

  lista: {
    gap: spacing.md,
  },
  /**
   * Cartão branco sobre o azul, com o nome em corpo grande.
   *
   * A pessoa pode estar sem óculos, no escuro, recém-acordada — e o que ela precisa ler aqui
   * decide se vai tomar o remédio certo. É o texto mais importante do aplicativo inteiro.
   */
  item: {
    ...superficieDeCartao(cores, ajustes),
    gap: spacing.xs,
  },
  /**
   * Larga e baixa, como a caixa vista de frente na prateleira — e não um quadrado de miniatura. O
   * objetivo aqui é reconhecer de longe, não identificar num item de lista.
   */
  foto: {
    width: "100%",
    height: 140,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  nome: {
    ...typography.headlineMd,
    color: cores.onSurface,
  },
  quantidade: {
    ...typography.headlineSm,
    color: cores.corDeDestaque,
  },
  orientacao: {
    ...typography.bodyLg,
    color: cores.onSurfaceVariant,
    lineHeight: 26,
  },

  /**
   * Os botões, com respiro entre eles.
   *
   * `gap` maior que o padrão de propósito: são ações que decidem um registro clínico, tomadas por
   * alguém que acabou de acordar. Encostados, o dedo erra — e errar aqui grava "pulei" no lugar de
   * "tomei", num histórico que o médico vai ler.
   */
  acoes: {
    gap: spacing.md,
  },
  /** Fica no lugar do botão de silenciar, para a lista de ações não pular quando ele some. */
  silenciadoAviso: {
    ...typography.bodyMd,
    color: cores.onPrimary,
    textAlign: "center",
    opacity: 0.85,
    paddingVertical: spacing.md,
  },
}));
