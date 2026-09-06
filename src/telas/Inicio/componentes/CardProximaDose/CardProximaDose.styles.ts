
import { estilosDoTema, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    backgroundColor: cores.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    // Sem `gap`: quem espaça agora é o `conteudo`. Aqui ele empurraria a marca-d'água, que é
    // posicionada em absoluto e não deve participar do fluxo.
    overflow: "hidden",
  },
  /**
   * A pílula gigante sangrando pelo canto, atrás do conteúdo.
   *
   * Composição, não informação: repete em escala o ícone do cabeçalho e tira o card da aparência de
   * retângulo azul com texto. A 0.12 ela lê como textura; mais que isso e o horário — que é o que
   * este card existe para mostrar — passa a competir com ela.
   *
   * Girada e cortada de propósito: uma pílula inteira e reta pareceria um ícone mal posicionado.
   */
  marcaDagua: {
    position: "absolute",
    right: -30,
    bottom: -34,
    opacity: 0.12,
    transform: [{ rotate: "-20deg" }],
  },
  /** O conteúdo, acima da marca-d'água — ela é irmã e vem antes na ordem de pintura. */
  conteudo: {
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  /** O selo do ícone no cabeçalho, como no card de estoque. */
  seloDoRotulo: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withOpacity(cores.onPrimary, 0.2),
  },
  /** Ícone e rótulo juntos, à esquerda. */
  headerEsquerda: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: cores.onPrimary,
    opacity: 0.7,
  },
  time: {
    ...typography.headlineXlBold,
    color: cores.onPrimary,
  },
  medication: {
    ...typography.bodyLg,
    color: cores.onPrimary,
  },
  hintRow: {
    flexDirection: "row",
    // `flex-start`: com duas linhas de texto, `center` deixava o ícone no meio delas em vez de
    // junto da primeira palavra.
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: withOpacity(cores.onPrimary, 0.2),
  },
  hintText: {
    ...typography.label,
    textTransform: "none",
    color: cores.onPrimary,
    opacity: 0.85,
    // Para a segunda linha quebrar sob o texto, e não sob o ícone.
    flex: 1,
  },
}));
