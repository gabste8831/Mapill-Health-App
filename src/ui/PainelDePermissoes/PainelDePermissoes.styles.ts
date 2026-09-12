
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  painel: {
    backgroundColor: cores.warningSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  /** Falta uma permissão essencial: o alarme não toca. */
  painelCritico: {
    backgroundColor: cores.errorSurface,
  },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  titulo: {
    ...typography.label,
    color: cores.onWarningSurface,
    flex: 1,
  },
  tituloCritico: {
    // Par de `errorSurface`. Com `onErrorContainer` daria 1.12:1 no tema escuro.
    color: cores.onErrorSurface,
  },
  explicacao: {
    ...typography.bodyMd,
    color: cores.onWarningSurface,
    lineHeight: 22,
  },
  explicacaoCritica: {
    color: cores.onErrorSurface,
  },
  /**
   * A nota sobre o início automático: menor que as linhas, e depois delas.
   *
   * Hierarquia de propósito — as linhas acima são acionáveis e o app sabe quando somem; esta é
   * orientação que ele não consegue verificar. Com o mesmo peso das outras, ela competiria com o
   * que tem botão; menor e ao pé, ela é o "se ainda assim não chegar, veja isto".
   */
  notaDoFabricante: {
    ...typography.bodySm,
    marginTop: spacing.xs,
  },

  lista: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  /**
   * Branco cravado, e não um token: o painel tem fundo próprio nos quatro temas, e qualquer token
   * de superfície vira escuro no tema escuro, deixando texto escuro sobre fundo escuro.
   */
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "#FFFFFF",
  },
  itemTexto: {
    flex: 1,
    gap: 1,
  },
  itemTopoComRespiro: {
    marginBottom: spacing.sm,
  },
  itemTopo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  /**
   * A tinta vem da superfície do painel, não do `onSurface` da tela: no tema escuro `onSurface` é
   * quase branco e sobre o âmbar daria 1.09:1.
   */
  itemTitulo: {
    ...typography.bodyMd,
    fontFamily: typography.label.fontFamily,
    color: cores.onWarningSurface,
  },
  itemDescricao: {
    ...typography.bodyMd,
    fontSize: 12,
    color: cores.onWarningSurface,
    opacity: 0.85,
    lineHeight: 17,
  },
  itemComoFazer: {
    ...typography.bodySm,
    // Tinta do painel, não `corDeDestaque`: aquele azul dá 1.93:1 sobre o âmbar no tema escuro.
    color: cores.onWarningSurface,
    fontFamily: typography.label.fontFamily,
    lineHeight: 16,
    marginTop: spacing.xs,
  },

  /** Separa o que impede o alarme do que só o degrada. */
  selo: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: cores.errorSurface,
  },
  seloTexto: {
    ...typography.caption,
    // Par de `errorSurface`, o fundo do selo. Com `error` daria 1.76:1 no tema escuro.
    color: cores.onErrorSurface,
  },

  botaoPedir: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: cores.primary,
    marginTop: spacing.xs,
  },
  botaoPedirTexto: {
    ...typography.label,
    color: cores.onPrimary,
  },
}));
