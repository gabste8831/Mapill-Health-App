import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useCores, useEstilos } from "@/shared/theme";
import { MarcaDoMapill } from "@/ui/MarcaDoMapill/MarcaDoMapill";
import { criarEstilos } from "./Header.styles";

export type HeaderAction = {
  icon: keyof typeof Ionicons.glyphMap;
  /** O que o ícone faz, para quem não enxerga o ícone. */
  label: string;
  onPress: () => void;
};

export type HeaderProps = {
  /** Omitir mostra a marca do app no lugar do título — é a variante da Home. */
  title?: string;
  onBack?: () => void;
  /** Atalho pra conta/configurações. Só a Home usa hoje. */
  onAccount?: () => void;
  /**
   * Ação própria da tela, no mesmo slot direito da conta. As duas não convivem: ou a tela é a
   * Home e oferece a conta, ou ela tem um destino seu — e nesse caso `action` tem precedência,
   * porque é dela que a tela está falando.
   */
  action?: HeaderAction;
};

/**
 * Topo padrão das telas. Duas variantes: marca (Home) e título com retorno (todo o resto).
 * A tela não decide se há pra onde voltar — quem passa `onBack` é quem conhece a navegação.
 */
export function Header({ title, onBack, onAccount, action }: HeaderProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const accountButton = action ? (
    <Pressable
      style={styles.iconSlot}
      onPress={action.onPress}
      accessibilityRole="button"
      accessibilityLabel={action.label}>
      <Ionicons name={action.icon} size={24} color={cores.primary} />
    </Pressable>
  ) : onAccount ? (
    <Pressable
      style={styles.iconSlot}
      onPress={onAccount}
      accessibilityRole="button"
      accessibilityLabel="Abrir configurações da conta">
      <Ionicons name="person-circle-outline" size={28} color={cores.onSurfaceVariant} />
    </Pressable>
  ) : (
    <View style={styles.iconSlot} />
  );

  if (title === undefined) {
    return (
      <View style={styles.header}>
        <View style={styles.brandSlot}>
          <MarcaDoMapill />
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
          <Ionicons name="arrow-back" size={24} color={cores.onSurface} />
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
