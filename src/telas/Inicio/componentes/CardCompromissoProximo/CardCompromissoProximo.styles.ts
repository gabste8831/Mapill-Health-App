
import {
  estilosDoTema,
  radius,
  spacing,
  superficieDeCartao,
  typography,
  withOpacity,
} from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  container: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: cores.corDeDestaque,
    overflow: "hidden",
  },
  containerHoje: {
    borderLeftColor: cores.success,
  },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dataColuna: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: cores.corDeDestaque,
  },
  dataColunaHoje: {
    backgroundColor: cores.success,
  },
  diaDoMes: {
    ...typography.headlineSm,
    color: cores.onPrimary,
  },
  mesAbreviado: {
    ...typography.caption,
    color: cores.onPrimary,
  },

  texto: {
    flex: 1,
    gap: 2,
  },
  distancia: {
    ...typography.label,
    color: cores.corDeDestaque,
  },
  distanciaHoje: {
    color: cores.success,
  },
  titulo: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  quando: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },

  preparo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: withOpacity(cores.onSurface, 0.1),
  },
  preparoTexto: {
    ...typography.bodyMd,
    color: cores.onSurface,
    flex: 1,
  },

  pergunta: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: withOpacity(cores.onSurface, 0.1),
  },
  perguntaTexto: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },
  botoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  botao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  botaoFui: {
    backgroundColor: cores.primary,
  },
  botaoFuiTexto: {
    ...typography.caption,
    color: cores.onPrimary,
  },
  botaoNaoFui: {
    backgroundColor: cores.surfaceContainer,
  },
  botaoNaoFuiTexto: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },

  selo: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: cores.successSurface,
  },
  seloAusente: {
    backgroundColor: cores.errorSurface,
  },
  seloTexto: {
    ...typography.caption,
    color: cores.onSuccessContainer,
  },
  seloTextoAusente: {
    color: cores.onErrorSurface,
  },
}));
