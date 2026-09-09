
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  /**
   * Fundo branco como os cartões, **borda azul** e sem sombra.
   *
   * O branco mantém o atalho na mesma família dos cards da tela — ele não é um corpo estranho
   * flutuando sobre o fundo. O que o separa deles é a borda azul e a ausência de sombra: sombra é o
   * que faz uma superfície parecer **conter** algo, e aqui não há conteúdo, há um caminho.
   *
   * Antes era `superficieDeCartao` puro, e a seção exibia dois blocos idênticos: um que informa
   * (o alerta) e outro que leva a outro lugar. A borda resolve isso sem precisar de rótulo.
   */
  container: {
    backgroundColor: cores.surfaceContainerLowest,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    /**
     * A 35% de opacidade a borda é azul **diluído em branco** — `#A6BEDF`, que dá 1.90:1 contra o
     * fundo e não é mais o azul do tema, é um parente pálido dele. No alto contraste isso é o
     * oposto do que o tema promete: a única cor que ele quer forte chegava lavada, e a fronteira
     * do atalho reprovava nos 3:1 que a WCAG pede de elemento gráfico.
     *
     * Ali a borda passa a ser o azul **cheio**, 2px, como nos demais contornos do tema. Nos outros
     * temas a diluição fica: sobre fundo claro ela separa o atalho do cartão sem gritar, que é o
     * papel dele.
     */
    ...(ajustes.contornarSuperficies
      ? { borderWidth: 2, borderColor: cores.corDeDestaque }
      : { borderWidth: 1, borderColor: withOpacity(cores.corDeDestaque, 0.35) }),
  },
  /** Menor que os 44 do cartão: numa linha de uma altura só, o círculo grande domina o texto. */
  icone: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    // `corDeDestaque` e nao `primary`: no tema escuro `primary` e o navy de fundo, e 10% dele
    // sobre um cartao ja escuro nao se distingue do cartao.
    backgroundColor: withOpacity(cores.corDeDestaque, 0.1),
  },
  /**
   * O título ocupa o vão entre o ícone e a seta.
   *
   * `flex: 1` nele mesmo, e não numa `View` em volta: com uma linha só de texto, o contêiner extra
   * existiria apenas para carregar essa regra.
   */
  titulo: {
    ...typography.bodyLg,
    // Azul: num contorno sem preenchimento, é a cor do texto que diz que a linha responde ao toque.
    color: cores.corDeDestaque,
    flex: 1,
  },
}));
