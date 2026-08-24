import { StyleSheet } from "react-native";

import { spacing } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  // A roda do Material só se desenha dentro de um host de largura finita — sem os dois, ela
  // colapsa e não aparece nada na tela.
  host: {
    width: "100%",
  },
});
