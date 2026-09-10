
import { estilosDoTema, listGap, radius, screenPadding, spacing, superficieDeCartao, typography, withOpacity } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores , ajustes}) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  conteudo: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    gap: listGap,
    paddingBottom: spacing.xxl,
  },
  quando: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  resumo: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },

  // --- Cartão de dose ---
  /** `md` no lugar do `gutter` do token: o mesmo aperto das listas de Remédios e Estoque. */
  card: {
    ...superficieDeCartao(cores, ajustes),
    padding: spacing.md,
    gap: spacing.md,
  },
  cardResolvido: {
    opacity: 0.72,
  },
  cardTopo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  cardTexto: {
    flex: 1,
    gap: 2,
  },
  nome: {
    ...typography.headlineSm,
    color: cores.onSurface,
  },
  quantidade: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  orientacao: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  foto: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: cores.surfaceContainerLow,
  },
  selo: {
    alignItems: "center",
    gap: 2,
  },
  seloTexto: {
    ...typography.caption,
    color: cores.onSurfaceVariant,
  },
  corrigirDica: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  adiadaDica: {
    ...typography.bodyMd,
    color: cores.onSecondaryContainer,
    backgroundColor: withOpacity(cores.secondaryContainer, 0.45),
    padding: spacing.md,
    borderRadius: radius.md,
  },

  acoes: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  botaoTomei: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: cores.primary,
  },
  botaoTomeiMarcado: {
    backgroundColor: cores.primary,
    borderColor: cores.primary,
  },
  textoTomei: {
    ...typography.label,
    color: cores.corDeDestaque,
  },
  botaoPulei: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 44,
    borderRadius: radius.full,
    backgroundColor: cores.surfaceContainer,
  },
  botaoPuleiMarcado: {
    backgroundColor: cores.onSurfaceVariant,
  },
  textoPulei: {
    ...typography.label,
    color: cores.onSurfaceVariant,
  },
  textoMarcado: {
    color: cores.onPrimary,
  },
  acaoSecundaria: {
    marginTop: spacing.xs,
  },

  irParaHome: {
    marginTop: spacing.md,
  },

  // --- Estados ---
  vazio: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  vazioTitulo: {
    ...typography.headlineSm,
    color: cores.onSurface,
    textAlign: "center",
  },
  vazioTexto: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
    maxWidth: 320,
  },
  erro: {
    ...typography.bodyMd,
    color: cores.error,
    textAlign: "center",
  },
}));
