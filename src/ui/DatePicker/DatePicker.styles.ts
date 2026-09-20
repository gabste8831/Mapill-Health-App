import { StyleSheet } from "react-native";

import { spacing } from "@/shared/theme";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  /**
   * O calendário do Material só se desenha dentro de um host de dimensões finitas - sem largura,
   * ele colapsa e não aparece nada na tela. Mesmo cuidado do TimePicker.
   *
   * O `minHeight` vale pelo mesmo motivo que lá: dentro do `ScrollView` do `BottomSheet` a altura
   * disponível é ilimitada, e o `matchContents` vertical não tem contra o que se medir. 420 porque
   * a grade de seis semanas mais o cabeçalho pedem mais que o relógio.
   */
  host: {
    width: "100%",
    minHeight: 420,
  },
});
