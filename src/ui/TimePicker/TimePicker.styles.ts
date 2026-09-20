
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  /**
   * A roda do Material só se desenha dentro de um host de dimensões finitas - sem largura, ela
   * colapsa e não aparece nada na tela.
   *
   * O `minHeight` resolve o mesmo problema no outro eixo: o host abre dentro do `ScrollView` do
   * `BottomSheet`, que oferece altura ilimitada aos filhos para medir. O `matchContents` vertical
   * então não tem contra o que se medir, e o mostrador saía esmagado atrás dos botões. 320 é o que
   * o relógio do Material 3 pede; abaixo disso ele corta os números.
   */
  host: {
    width: "100%",
    minHeight: 320,
  },

  // --- Campos de digitação (só a web; os nativos usam o relógio da plataforma) ---
  campos: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  campo: {
    alignItems: "center",
    gap: spacing.xs,
  },
  /**
   * Caixas grandes, como as do Material 3 em modo digitação. O tamanho não é enfeite: são dois
   * números de dois dígitos que precisam ser conferidos de relance por quem tem a caixa do remédio
   * na outra mão, e o alvo de toque precisa perdoar o dedo.
   */
  entrada: {
    ...typography.headlineSm,
    fontSize: 34,
    lineHeight: 42,
    textAlign: "center",
    width: 92,
    paddingVertical: spacing.sm,
    color: cores.onSurface,
    backgroundColor: cores.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 2,
    // Transparente e não zero: a borda do foco não pode mudar a altura da caixa, senão os dois
    // campos pulam de tamanho conforme se anda entre eles.
    borderColor: "transparent",
  },
  entradaFocada: {
    borderColor: cores.primary,
    backgroundColor: cores.surfaceContainerLowest,
  },
  rotulo: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },
  /** Os dois pontos entre as caixas, alinhados com os números e não com os rótulos. */
  separador: {
    ...typography.headlineSm,
    fontSize: 30,
    // Sem isto a caixa da linha (24) e menor que a letra (30) e o ":" sobe em relacao aos numeros.
    lineHeight: 38,
    color: cores.onSurfaceVariant,
    // Sobe o mesmo tanto que a altura do rótulo abaixo empurraria para baixo.
    marginBottom: spacing.md,
  },
  ajuda: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
}));
