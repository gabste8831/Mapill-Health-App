
import { estilosDoTema, fieldLabelGap, radius, spacing, typography } from "@/shared/theme";

const TAMANHO_DA_FOTO = 72;

export const criarEstilos = estilosDoTema(({ cores }) => ({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
  },
  scrollContent: {
    flexGrow: 1,
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
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  selo: {
    ...typography.caption,
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
  },
  seloObrigatorio: {
    backgroundColor: cores.primary,
    color: cores.onPrimary,
  },
  seloOpcional: {
    backgroundColor: cores.surfaceContainerHigh,
    color: cores.onSurfaceVariant,
  },
  sectionHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  footerHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
    textAlign: "center",
  },
  subtitle: {
    ...typography.bodySm,
    color: cores.outline,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: cores.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  infoBannerText: {
    ...typography.bodyMd,
    color: cores.onPrimaryContainer,
    flex: 1,
    padding: spacing.sm,
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  /**
   * O quadro da foto, **igual com e sem imagem**.
   *
   * Antes eram dois estilos trocados no lugar (`photoPlaceholder` → `photoFrame`), e a diferença
   * entre eles não era só decorativa: um tinha borda tracejada e centralizava o ícone, o outro
   * ligava `overflow: "hidden"` para recortar a imagem no círculo. Trocar de um para o outro
   * recriava o contêiner no mesmo instante em que a `Image` montava — e no Android o recorte
   * chegava depois do primeiro paint, deixando a foto pintada fora da área visível do pai.
   *
   * O sintoma era preciso: a **primeira** foto ficava branca, e trocar uma já existente
   * funcionava. Trocar mantém `photoFrame` nos dois renders; estrear muda de estilo.
   *
   * Com uma base só — mesma medida, mesmo raio, `overflow` sempre ligado — o quadro deixa de ter
   * dois estados de layout. O que muda é a borda, que é pintura e não geometria.
   */
  photoQuadro: {
    width: TAMANHO_DA_FOTO,
    height: TAMANHO_DA_FOTO,
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: cores.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  photoVazio: {
    borderWidth: 1,
    borderColor: cores.outlineVariant,
    borderStyle: "dashed",
  },
  photoToque: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPressionada: {
    opacity: 0.85,
  },
  photo: {
    width: TAMANHO_DA_FOTO,
    height: TAMANHO_DA_FOTO,
  },
  photoAcao: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  photoAddLabel: {
    ...typography.label,
    color: cores.corDeDestaque,
  },
  photoExcluirLabel: {
    ...typography.label,
    color: cores.error,
  },
  fieldLabel: {
    ...typography.label,
    color: cores.onSurfaceVariant,
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
  emptyHint: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  addContactButton: {
    marginTop: spacing.sm,
  },
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
    backgroundColor: cores.surfaceContainerLow,
    borderWidth: 1,
    borderColor: cores.outlineVariant,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    ...typography.bodyLg,
    color: cores.onSurface,
  },
  contactMeta: {
    ...typography.bodyMd,
    color: cores.onSurfaceVariant,
  },
  contactRemove: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
}));
