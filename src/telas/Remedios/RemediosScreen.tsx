import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { excluirMedicamento } from "@/hooks/use-medication-registration";
import type { ItemDaListaDeRemedios } from "@/hooks/use-medication-list";
import { useMedicationList } from "@/hooks/use-medication-list";
import {
  formatarQuantidadeLivre,
  horariosDaPosologia,
  resumirDose,
  resumirFrequencia,
} from "@/shared/rotulos-de-medicamento";
import { colors } from "@/shared/theme";
import { CenteredLoader } from "@/ui";
import { styles } from "./RemediosScreen.styles";

/** Iniciais do nome, pra quando não há foto da embalagem. */
function iniciais(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}

type ItemDeRemedioProps = {
  item: ItemDaListaDeRemedios;
  /** Ausente quando não há tratamento pra editar — o card fica inerte, e o texto explica. */
  onEdit?: () => void;
  onDelete: () => void;
};

function ItemDeRemedio({ item, onEdit, onDelete }: ItemDeRemedioProps) {
  const { medication, prescription, inventory } = item;
  const horarios = prescription === null ? [] : horariosDaPosologia(prescription.schedule);

  return (
    <Pressable
      style={styles.item}
      onPress={onEdit}
      accessibilityRole={onEdit ? "button" : undefined}
      accessibilityLabel={onEdit ? `Editar ${medication.name}` : undefined}>
      <View style={styles.itemHeader}>
        {medication.photoUri !== null ? (
          <Image source={{ uri: medication.photoUri }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={styles.photoFallback}>
            <Text style={styles.photoFallbackText}>{iniciais(medication.name)}</Text>
          </View>
        )}

        <View style={styles.itemHeaderText}>
          <Text style={styles.name}>{medication.name}</Text>
          {medication.activeIngredient.length > 0 ? (
            <Text style={styles.activeIngredient}>{medication.activeIngredient}</Text>
          ) : null}
        </View>

        {/* Excluir fica fora do toque principal do card: destrutivo não se aciona sem querer. */}
        <Pressable
          style={styles.deleteButton}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${medication.name}`}
          hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={colors.outline} />
        </Pressable>
      </View>

      {prescription !== null ? (
        <Text style={styles.posology}>
          {resumirDose(prescription.doseAmount, prescription.doseUnit, prescription.schedule)}
          {" · "}
          {resumirFrequencia(prescription.schedule)}
        </Text>
      ) : (
        <Text style={styles.activeIngredient}>Sem tratamento cadastrado.</Text>
      )}

      {horarios.length > 0 ? (
        <View style={styles.timeRow}>
          {horarios.map((horario) => (
            <View key={horario} style={styles.timeChip}>
              <Text style={styles.timeChipText}>{horario}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {inventory !== null ? (
        <View style={styles.footerRow}>
          {/* Sem estoque é o único caso em que o número vira aviso: o remédio acabou. */}
          <Text style={[styles.stock, inventory.quantity === 0 && styles.stockLow]}>
            {inventory.quantity === 0
              ? "Estoque zerado"
              : `Estoque: ${formatarQuantidadeLivre(inventory.quantity, inventory.unit)}`}
          </Text>
          {inventory.storageLocation !== null ? (
            <Text style={styles.badge}>{inventory.storageLocation}</Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

export function RemediosScreen() {
  const router = useRouter();
  const { items, isLoading, error, reload } = useMedicationList();

  function confirmarExclusao(item: ItemDaListaDeRemedios) {
    Alert.alert(
      `Excluir ${item.medication.name}?`,
      // Dizer o que sobrevive é o que separa "excluir" de "apagar tudo": quem tem receio de
      // perder o histórico precisa saber, antes de confirmar, que ele fica.
      "Os horários futuros deixam de existir e o remédio sai da sua lista. O histórico de doses já registradas é mantido.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await excluirMedicamento({
                medicationId: item.medication.id,
                prescriptionId: item.prescription?.id ?? null,
              });
              await reload();
            } catch (cause) {
              Alert.alert(
                "Não foi possível excluir",
                cause instanceof Error ? cause.message : "Tente novamente em instantes.",
              );
            }
          },
        },
      ],
    );
  }

  if (isLoading) return <CenteredLoader />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Remédios</Text>
        <Text style={styles.subtitle}>
          {items.length === 0
            ? "Nenhum medicamento cadastrado"
            : `${items.length} ${items.length === 1 ? "medicamento cadastrado" : "medicamentos cadastrados"}`}
        </Text>
      </View>

      {error !== null ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.medication.id}
          renderItem={({ item }) => (
            <ItemDeRemedio
              item={item}
              onEdit={
                item.prescription === null
                  ? undefined
                  : () =>
                      router.push({
                        pathname: "/cadastro/editar/[id]",
                        params: { id: item.medication.id },
                      })
              }
              onDelete={() => confirmarExclusao(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>Nenhum remédio por aqui ainda</Text>
              <Text style={styles.emptyDescription}>
                Use o botão + na tela inicial para cadastrar seu primeiro medicamento.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
