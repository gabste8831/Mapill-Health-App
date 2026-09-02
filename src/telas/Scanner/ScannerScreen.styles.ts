import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
    position: "relative",
  },
  preview: {
    flex: 1,
  },
  /**
   * A moldura de mira, centralizada por porcentagem para acompanhar qualquer tela.
   *
   * Larga e baixa porque é a proporção de um código de barras — um quadrado convidaria a enquadrar
   * a caixa inteira, que é justamente onde a leitura falha.
   */
  alvo: {
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "35%",
    height: "20%",
    borderWidth: 2,
    borderColor: colors.onPrimary,
    borderRadius: radius.md,
  },
  instrucao: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: spacing.xl,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  /** Fundo escuro atrás do texto: sobre a imagem da câmera, texto sem fundo some. */
  instrucaoTexto: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    backgroundColor: withOpacity(colors.onSurface, 0.75),
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    textAlign: "center",
    overflow: "hidden",
  },

  centro: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  rotulo: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  titulo: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  nome: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  texto: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  /** O número lido, em destaque discreto: serve para conferir se a leitura pegou o código certo. */
  ean: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.sm,
    borderRadius: radius.sm,
    textAlign: "center",
    letterSpacing: 1,
  },
});
