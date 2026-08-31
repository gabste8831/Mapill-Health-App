import { StyleSheet } from "react-native";

import { colors, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

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
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.onSurface,
  },
  /**
   * As duas seções são marcadas, não só a obrigatória: o contraste entre "obrigatório" e
   * "opcional" comunica mais rápido do que destacar uma sozinha. Em texto, e não só em cor —
   * cor sozinha não é sinal legível pra quem não a distingue.
   */
  selo: {
    ...typography.label,
    fontSize: 10,
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    // paddingVertical: 2,
  },
  seloObrigatorio: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
  },
  seloOpcional: {
    backgroundColor: colors.surfaceContainerHigh,
    color: colors.onSurfaceVariant,
  },
  sectionHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  footerHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.outline,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  infoBannerText: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.onPrimaryContainer,
    flex: 1,
    padding: spacing.sm,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderStyle: "dashed",
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  // Mesma medida do placeholder, mas com a borda sólida e recortando a imagem.
  photoFrame: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerLow,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoAddLabel: {
    ...typography.label,
    color: colors.primary,
  },
  photoRemoveLabel: {
    ...typography.label,
    color: colors.error,
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
  fieldGroup: {
    gap: fieldLabelGap,
  },
  // Sem marginTop extra (diferente de contactList/allergyChipsRow): é só uma legenda simples,
  // não uma lista dinâmica que precise de respiro a mais — mantém o Card compacto quando ainda
  // não há nenhum contato cadastrado.
  emptyHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  // Mesmo respiro de contactList/allergyChipsRow — separa a ação da lista acima dela.
  addContactButton: {
    marginTop: spacing.sm,
  },
  /** Respiro entre os campos do popup de contato — o BottomSheet não dá espaçamento próprio. */
  sheetBody: {
    gap: spacing.md,
  },
  contactList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  contactMeta: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  /** 44: remover contato de emergência é destrutivo, e alvo de 32 é onde o toque erra. */
  contactRemove: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
