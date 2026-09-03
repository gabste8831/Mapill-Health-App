
import { estilosDoTema, radius, spacing, typography } from "@/shared/theme";

export const criarEstilos = estilosDoTema(({ cores }) => ({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  box: {
    // Do tamanho exato da linha do label. Com isso, alinhar pelo topo já sai opticamente
    // centrado no texto quando o label cabe numa linha, e continua grudado na primeira linha
    // quando ele quebra — que é o comportamento das duas plataformas. Quadrado maior que a
    // linha (24 contra 22) descia visivelmente, e era o desalinhamento que incomodava.
    // O alvo de toque não depende desse tamanho: a área clicável é a row inteira (Checkbox.tsx).
    width: typography.bodyMd.lineHeight,
    height: typography.bodyMd.lineHeight,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: cores.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    backgroundColor: cores.primary,
    borderColor: cores.primary,
  },
  label: {
    ...typography.bodyMd,
    color: cores.onSurface,
    flex: 1,
  },
}));
