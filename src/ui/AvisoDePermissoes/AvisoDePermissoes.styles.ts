import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
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
    // `gap` e altura acompanham o selo de 40dp: com os 8 de antes ele encostava no texto, e 48 de
    // altura não dava respiro acima e abaixo dele.
    gap: spacing.md,
    minHeight: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: cores.primarySurface,
    /**
     * A borda do `CardDeAtalho`, e pelo mesmo motivo: **isto é um caminho, não um conteúdo.**
     *
     * Pedida pelo Gabriel em 12/09, comparando com o atalho de estoque. Sem ela o bloco lia como
     * um aviso a ser lido, e não como algo a ser tocado — o mesmo problema que as linhas da tela de
     * permissões tinham, em outra escala.
     *
     * `corDeDestaque` e não `primary`: no tema escuro `primary` é o navy de fundo, e uma borda dele
     * sobre superfície escura não se distingue de nada. No alto contraste ela vira azul cheio de
     * 2px, junto com os demais contornos do tema (ver `contornarSuperficies`).
     */
    ...(ajustes.contornarSuperficies
      ? { borderWidth: 2, borderColor: cores.corDeDestaque }
      : { borderWidth: 1, borderColor: withOpacity(cores.corDeDestaque, 0.35) }),
  },
  /**
   * O estado urgente: **vermelho enquanto o app comprova que falta autorização.**
   *
   * Decisão do Gabriel em 12/09, e ela é coerente com tudo o que a gente corrigiu hoje: a cor só
   * afirma o que o app sabe. Enquanto o painel "Seus alarmes não vão funcionar" estiver na Home,
   * existe pendência **provada** — e aí o vermelho é factual, não dramatização.
   *
   * Quando as verificáveis são atendidas, volta ao azul. As três restantes o app não consegue ler, e
   * manter o vermelho por elas seria pintar de erro um estado desconhecido.
   *
   * A borda é `error` cheio (6,03:1 sobre branco, medido) porque aqui ela carrega significado, e não
   * só separação — é o mesmo critério que faz o painel crítico usar a cor cheia.
   */
  avisoUrgente: {
    backgroundColor: cores.errorSurface,
    borderWidth: 1.5,
    borderColor: cores.error,
  },
  seloUrgente: {
    backgroundColor: withOpacity(cores.error, 0.12),
  },
  tituloUrgente: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: cores.onErrorSurface,
  },
  descricaoUrgente: {
    color: cores.onErrorSurface,
  },
  /**
   * O selo redondo do ícone, igual ao `introIcone` da tela de Conta e dados.
   *
   * 40dp com o azul a 12% sobre a superfície do bloco. `corDeDestaque` e não `primary` pelo mesmo
   * motivo da borda: no tema escuro `primary` é o navy de fundo, e 12% dele sobre superfície escura
   * não se distingue do fundo.
   */
  selo: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: withOpacity(cores.corDeDestaque, 0.12),
  },
  /** Ocupa o que sobra entre o selo e a seta. */
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
