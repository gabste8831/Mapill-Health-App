
import { estilosDoTema, radius, spacing, superficieDeCartao, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  container: {
    ...superficieDeCartao(cores, ajustes),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  icone: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: withOpacity(cores.primary, 0.1),
  },
  texto: {
    flex: 1,
  },
  titulo: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  descricao: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
}));
