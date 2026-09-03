
import { estilosDoTema, spacing, typography } from "@/shared/theme";

const ICON_SLOT_SIZE = 44;

export const criarEstilos = estilosDoTema(({ cores }) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingHorizontal: spacing.sm,
    // `surfaceContainerLowest`, e não `onPrimary`: aquele é o token de "texto sobre primary", não
    // uma cor neutra de fundo — só parecia certo por coincidência enquanto `onPrimary` era escuro
    // no tema escuro. Virou branco puro quando `primary` escureceu, e o header ficava branco
    // sobre um app inteiro escuro. `surfaceContainerLowest` é a mesma cor que os cartões usam.
    backgroundColor: cores.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: cores.outlineVariant,
  },
  /**
   * Largura fixa nos dois lados, mesmo vazio: é o que mantém o título opticamente centrado
   * independente de haver ou não botão. Sem isso o título desloca conforme os ícones.
   */
  iconSlot: {
    width: ICON_SLOT_SIZE,
    height: ICON_SLOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  brandSlot: {
    flex: 1,
    marginLeft: spacing.sm,
  },
}));
