
import { bottomTabInset, estilosDoTema, radius, spacing, surfaceShadowFlutuante } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  fab: {
    position: "absolute",
    right: spacing.md,
    // Sobe a altura da barra de abas: sem isso ele fica atrás dela e metade do alvo some.
    bottom: bottomTabInset + spacing.md,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: cores.primary,
    alignItems: "center",
    justifyContent: "center",
    // `boxShadow` como o resto do app, e não `shadowColor`/`elevation`: preto puro dava um cinza
    // mais frio que o das outras sombras, e a API antiga não aceita o token.
    boxShadow: surfaceShadowFlutuante,
    // `elevation` fica: no Android é ele que resolve a ordem de empilhamento, e sem isso o FAB
    // pode ficar *atrás* de um cartão que role por baixo.
    elevation: 4,
  },
  icon: {
    color: cores.onPrimary,
    fontSize: 28,
    lineHeight: 28,
  },
}));
