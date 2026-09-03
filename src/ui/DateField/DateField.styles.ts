
import { estilosDoTema, radius, spacing } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  campo: {
    flex: 1,
  },
  /**
   * `marginTop` alinha o botão com o input, e não com o rótulo acima dele: sem isso ele sobe e
   * fica na altura do texto "DATA DE NASCIMENTO", longe do campo que abre.
   */
  botaoDeCalendario: {
    marginTop: 22,
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    backgroundColor: cores.surfaceContainerLowest,
  },
  sheetBody: {
    gap: spacing.md,
  },
  linhaDeAcoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  acao: {
    flex: 1,
  },
}));
