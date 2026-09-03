
import { estilosDoTema, spacing, superficieDeCartao, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  /**
   * O estado vazio mora num cartão, como todo conteúdo do app.
   *
   * Antes, três telas desenhavam o próprio: a Home num cartão branco, Medicações e Estoque em
   * texto solto sobre o fundo. Lado a lado, o vazio da Home parecia um bloco de conteúdo e o das
   * outras parecia a tela não ter carregado — a mesma situação dizendo duas coisas diferentes.
   */
  container: {
    ...superficieDeCartao(cores, ajustes),
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  /**
   * O mesmo bloco sem cartão, para quando ele já está **dentro** de um. Cartão dentro de cartão é
   * sempre errado: duas superfícies elevadas aninhadas fazem o olho procurar uma terceira.
   */
  containerSolto: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  /** O ícone num disco azul claro: dá um centro ao bloco, que sem ele é só texto centralizado. */
  disco: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(cores.primary, 0.09),
  },
  textos: {
    alignItems: "center",
    gap: spacing.xs,
  },
  titulo: {
    ...typography.headlineSm,
    color: cores.onSurface,
    textAlign: "center",
  },
  descricao: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    /** Trava a medida de leitura: linha longa demais faz o olho perder o começo da seguinte. */
    maxWidth: 300,
  },
}));
