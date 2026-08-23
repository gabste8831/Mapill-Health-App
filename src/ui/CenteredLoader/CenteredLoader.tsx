import { ActivityIndicator, View } from "react-native";

import { colors } from "@/shared/theme";
import { styles } from "./CenteredLoader.styles";

/** Tela inteira ocupada só pela espera — usada enquanto o SQLite é lido. */
export function CenteredLoader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
