import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

const AVATAR_SIZE = 56;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  /**
   * Faixa colorida no topo, com o canto inferior arredondado. É o que tira a tela do aspecto de
   * lista uniforme: dá um ponto de entrada com peso visual antes das seções, que seguem neutras.
   */
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.gutter,
    borderBottomLeftRadius: radius.lg * 2,
    borderBottomRightRadius: radius.lg * 2,
    gap: spacing.gutter,
  },
  heroTitle: {
    ...typography.headlineMd,
    color: colors.onPrimary,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.full,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryContainer,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    ...typography.headlineSm,
    color: colors.onPrimary,
  },
  identityText: {
    flex: 1,
    gap: spacing.xs,
  },
  identityGreeting: {
    ...typography.bodyMd,
    color: colors.onPrimaryContainer,
    opacity: 0.85,
  },
  identityName: {
    ...typography.headlineSm,
    color: colors.onPrimary,
  },
  identityEdit: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryContainer,
  },
  section: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    paddingLeft: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    // 52 é a altura padrão de interação do app (Button, TextField, SelectField). A linha
    // inteira é clicável, o que já dá alvo de sobra pro público idoso.
    minHeight: 52,
  },
  /** Largura fixa pra alinhar os rótulos entre linhas, mesmo com ícones de larguras diferentes. */
  rowIcon: {
    width: 28,
    alignItems: "center",
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  rowLabel: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  rowHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
