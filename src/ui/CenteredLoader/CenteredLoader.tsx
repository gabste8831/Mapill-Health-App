import { ActivityIndicator, View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./CenteredLoader.styles";

/** Tela inteira ocupada só pela espera — usada enquanto o SQLite é lido. */
export function CenteredLoader() {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <View style={styles.container}>
      <ActivityIndicator color={cores.primary} />
    </View>
  );
}
