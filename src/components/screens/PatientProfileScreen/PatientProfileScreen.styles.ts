import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography } from "@/shared/theme";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    // `flexGrow: 1` faz o conteúdo ocupar pelo menos a altura da tela; `justifyContent: "center"`
    // só tem efeito nesse caso (conteúdo mais curto que a tela) — se o formulário crescer (ex:
    // mais campos, teclado aberto), o ScrollView volta a rolar normalmente sem quebrar isso.
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    paddingTop: spacing.sm,
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  infoBannerText: {
    ...typography.bodyMd,
    fontSize: 12,
    color: colors.onSecondaryContainer,
    flex: 1,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.full * 3,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderStyle: "dashed",
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  photoAddLabel: {
    ...typography.label,
    color: colors.primary,
  },
  // Label "solta" usada dentro de um Card quando o campo abaixo não é um TextField com label
  // própria (ex: título da seção "Alergias"/"Contato de emergência" acima de um grupo de campos).
  fieldLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  allergyChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  allergyInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  allergyInputField: {
    flex: 1,
  },
});
