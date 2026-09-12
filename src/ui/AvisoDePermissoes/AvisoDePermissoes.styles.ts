import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  /**
   * **Azul informativo, e não o amarelo de atenção.**
   *
   * Era `warningSurface`, o mesmo amarelo do alerta de recontagem de estoque e do painel de
   * permissões. O Gabriel apontou o problema em 12/09: no vocabulário do app, amarelo significa
   * "algo está pendente" — e aqui não há pendência conhecida. Este aviso aparece **sempre**, porque
   * o app não consegue saber se as três autorizações foram atendidas.
   *
   * Amarelo permanente numa tela de cadastro lê como "você deixou algo em branco", inclusive para
   * quem preencheu tudo. A cor estava afirmando um estado que o app não tem como verificar, que é o
   * mesmo erro do placar e da lista da Home, em outra forma.
   *
   * `primarySurface` é a superfície de informação do app, e o par `onPrimarySurface` dá **8,73:1**
   * sobre ela (medido) — folgado para AA. Azul aqui também diz a coisa certa: é a cor dos caminhos,
   * e este bloco é um caminho.
   *
   * 48dp de altura mínima pelo alvo de toque, e uma linha só de conteúdo: ele mora em telas cheias
   * de campos, e o lugar dele é lembrar, não tomar a tela.
   */
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 48,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: cores.primarySurface,
  },
  /** Ocupa o que sobra entre o escudo e a seta. */
  texto: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    ...typography.bodyMd,
    color: cores.onPrimarySurface,
  },
  descricao: {
    ...typography.bodySm,
    color: cores.onPrimarySurface,
    opacity: 0.85,
  },
}));
