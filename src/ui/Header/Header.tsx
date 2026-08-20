import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/shared/theme";
import { styles } from "./Header.styles";

export type HeaderProps = {
  /** Omitir mostra a marca do app no lugar do título — é a variante da Home. */
  title?: string;
  onBack?: () => void;
  /** Atalho pra conta/configurações. Só a Home usa hoje. */
  onAccount?: () => void;
};

/**
 * Topo padrão das telas. Duas variantes: marca (Home) e título com retorno (todo o resto).
 * A tela não decide se há pra onde voltar — quem passa `onBack` é quem conhece a navegação.
 */
export function Header({ title, onBack, onAccount }: HeaderProps) {
  const accountButton = onAccount ? (
    <Pressable
      style={styles.iconSlot}
      onPress={onAccount}
      accessibilityRole="button"
      accessibilityLabel="Abrir configurações da conta">
      <Ionicons name="person-circle-outline" size={28} color={colors.onSurfaceVariant} />
    </Pressable>
  ) : (
    <View style={styles.iconSlot} />
  );

  if (title === undefined) {
    return (
      <View style={styles.header}>
        <View style={styles.brandSlot}>
          <Image
            source={require("@/assets/images/brand/mark-transparent-a.png")}
            style={styles.brand}
            contentFit="contain"
            accessibilityLabel="Mapill"
          />
        </View>
        {accountButton}
      </View>
    );
  }

  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          style={styles.iconSlot}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
      ) : (
        <View style={styles.iconSlot} />
      )}

      {/* numberOfLines evita que um título longo empurre os ícones e quebre o alinhamento. */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {accountButton}
    </View>
  );
}
