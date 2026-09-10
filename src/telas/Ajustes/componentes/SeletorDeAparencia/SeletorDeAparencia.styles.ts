import {
  estilosDoTema,
  radius,
  spacing,
  superficieDeCartao,
  typography,
} from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores, ajustes }) => ({
  cartao: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.sm,
    gap: spacing.xs,
  },
  opcao: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  opcaoSelecionada: {
    backgroundColor: cores.primarySurface,
  },
  amostra: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    overflow: "hidden",
    flexDirection: "row",
  },
  amostraFundo: {
    flex: 1,
  },
  amostraAcao: {
    width: 10,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  nome: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  nomeSelecionado: {
    ...typography.bodyLg,
    color: cores.onPrimarySurface,
  },
  descricao: {
    ...typography.bodySm,
    color: cores.onSurfaceVariant,
  },
  descricaoSelecionada: {
    color: cores.onPrimarySurface,
  },
}));
