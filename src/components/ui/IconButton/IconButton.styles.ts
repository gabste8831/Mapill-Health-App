import { StyleSheet } from "react-native";

import { colors, radius } from "@/shared/theme";

export const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
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
