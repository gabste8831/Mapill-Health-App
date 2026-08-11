import { StyleSheet } from "react-native";

import { colors, radius } from "@/shared/theme";

export const styles = StyleSheet.create({
  base: {
    // Mesma altura do TextField (52) — hoje o único uso é ao lado do input de alergias, e
    // ficava mais baixo que o campo, com os dois desalinhados na mesma linha.
    width: 52,
    height: 52,
    // borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  disabled: {
    opacity: 0.4,
  },
});
