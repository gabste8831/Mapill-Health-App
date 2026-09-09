
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    /**
     * O vermelho **cheio** do alerta, e não o `error` de texto.
     *
     * Quando a cor vira área grande, quem precisa de contraste é o branco por cima — e aí a
     * exigência se inverte: quanto mais vivo o fundo, menos legível o texto. Por isso não é o
     * `errorVivo` (que daria 3.94:1 no branco e reprovaria), mas o `errorPreenchido`, calibrado
     * para este uso: mais sangue que o `error`, e ainda 4.83:1 com o texto branco.
     */
    backgroundColor: cores.errorPreenchido,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    // `hidden` é o que recorta a marca-d'água na curva do cartão — sem ele o ícone gigante
    // vazaria por fora da borda arredondada.
    overflow: "hidden",
  },
  /**
   * O ícone gigante sangrando pelo canto, atrás do conteúdo.
   *
   * Vale como composição e não como informação: ele repete em escala o mesmo símbolo do rótulo, e
   * é o que tira o cartão da aparência de caixa de texto colorida. Por isso a opacidade é baixa —
   * a 0.13 ele se lê como textura do fundo, e não como um segundo elemento disputando leitura.
   *
   * Posicionado com valores negativos para ser **cortado**: um ícone inteiro dentro do cartão
   * pareceria uma ilustração mal centrada; cortado, parece papel timbrado.
   */
  marcaDagua: {
    position: "absolute",
    right: -28,
    bottom: -32,
    opacity: 0.13,
  },
  /** O conteúdo acima da marca-d'água, que é irmã e vem antes na ordem de pintura. */
  conteudo: {
    gap: spacing.md,
  },
  /** O quadradinho do ícone no rótulo, como na referência. */
  seloDoRotulo: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(cores.onErrorPreenchido, 0.2),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: cores.onErrorPreenchido,
    opacity: 0.85,
  },
  medicationName: {
    ...typography.headlineMd,
    color: cores.onErrorPreenchido,
  },
  daysRemaining: {
    ...typography.bodyMd,
    color: cores.onErrorPreenchido,
    opacity: 0.9,
  },
  primaryButton: {
    backgroundColor: cores.onErrorPreenchido,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  /**
   * O texto do botão é o **`errorPreenchido`**, a mesma cor do cartão atrás dele.
   *
   * Já foi o `error`, com o argumento de que ele é "o token de texto". A regra era boa no tema
   * claro e falsa no escuro: ali `error` é um salmão claro (`#FF9A92`), e sobre o botão branco
   * dava **2.04:1** — o rótulo "Repor" praticamente sumia dentro do próprio botão.
   *
   * O que decide a cor aqui não é a categoria do token, é o fundo: o botão é uma janela clara
   * recortada no cartão, então quem se lê dentro dele é a cor do cartão. 9.54:1 no escuro,
   * 8.55:1 no claro — e a regra passa a valer nos quatro temas em vez de em dois.
   */
  primaryButtonText: {
    ...typography.label,
    color: cores.errorPreenchido,
  },
  secondaryButton: {
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  secondaryButtonText: {
    ...typography.label,
    color: cores.onErrorPreenchido,
    opacity: 0.85,
  },
}));
