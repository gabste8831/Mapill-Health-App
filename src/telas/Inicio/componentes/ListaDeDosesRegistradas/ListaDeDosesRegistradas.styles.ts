
import { estilosDoTema, spacing, superficieDeCartao, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  /**
   * Um cartão só para todas as registradas, e não um por dose.
   *
   * O que já foi respondido é registro, não tarefa: serve para conferir ("já tomei o das 8?") e não
   * para agir. Em cartões separados, cinco doses tomadas ocupavam mais tela que as que ainda faltam
   * — a Home ficava mais cheia quanto mais em dia a pessoa estivesse, o que é o contrário do que
   * deveria acontecer.
   *
   * É a mesma forma da agenda do Calendário, onde esse enxugamento já tinha dado certo.
   */
  container: {
    ...superficieDeCartao(cores, ajustes),
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    /**
     * Recuada, e não em opacidade cheia.
     *
     * O mesmo 0.55 da agenda do Calendário: continua legível para quem foi conferir, e para de
     * disputar atenção com o que ainda espera resposta logo acima.
     */
    opacity: 0.55,
  },
  /** Divisória entre doses, mais leve que um cartão por dose. */
  linhaComDivisoria: {
    borderTopWidth: 1,
    borderTopColor: cores.surfaceContainerHigh,
  },
  /** Largura fixa: as horas alinham em coluna, e a lista lê como uma grade. */
  hora: {
    ...typography.label,
    color: cores.onSurfaceVariant,
    width: 44,
  },
  texto: {
    flex: 1,
  },
  nome: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  /**
   * A dose e a orientação, numa linha só.
   *
   * `numberOfLines={1}`: aqui a orientação já foi lida na hora de tomar — repeti-la por extenso num
   * registro faria a linha compacta crescer de volta ao tamanho do cartão que ela substitui.
   */
  nota: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
}));
