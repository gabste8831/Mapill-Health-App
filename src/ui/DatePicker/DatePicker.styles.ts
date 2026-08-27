import { StyleSheet } from "react-native";

import { spacing } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  // O calendário do Material só se desenha dentro de um host de largura finita — sem os dois, ele
  // colapsa e não aparece nada na tela. Mesmo cuidado do TimePicker.
  host: {
    width: "100%",
  },
});
