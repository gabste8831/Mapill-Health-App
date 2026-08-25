import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { CenteredLoader, Fab, Header, SearchField } from "@/ui";
import { styles } from "./RemediosScreen.styles";

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
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        {/* Sem foto não entra nada no lugar: um quadrado com iniciais ocupa o mesmo espaço de uma
            foto pra dizer o que o nome ao lado já diz. */}
        {medication.photoUri !== null ? (
          <Image source={{ uri: medication.photoUri }} style={styles.photo} contentFit="cover" />
        ) : null}

        <View style={styles.itemHeaderText}>
          <Text style={styles.name}>{medication.name}</Text>
          {medication.activeIngredient.length > 0 ? (
            <Text style={styles.activeIngredient}>{medication.activeIngredient}</Text>
          ) : null}
        </View>

        {/* Duas ações explícitas em vez do card inteiro clicável: "abre alguma coisa" não diz o
            que vai acontecer, e ao lado de um botão de excluir isso pesa. */}
        <View style={styles.acoes}>
          {onEdit ? (
            <Pressable
              style={styles.acaoBotao}
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel={`Ver ou editar ${medication.name}`}
              hitSlop={6}>
              <Ionicons name="pencil-outline" size={20} color={colors.primary} />
            </Pressable>
          ) : null}
          <Pressable
            style={styles.acaoBotao}
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={`Excluir ${medication.name}`}
            hitSlop={6}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </Pressable>
        </View>
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
    </View>
  );
}

/**
 * Minúsculas e sem acento, pra "acido folico" achar "Ácido fólico". Quem procura um remédio
 * digita apressado e no teclado do celular, onde o acento custa dois toques.
 */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function RemediosScreen() {
  const router = useRouter();
  const { items, isLoading, error, reload } = useMedicationList();
  const [busca, setBusca] = useState("");

  const termo = normalizar(busca.trim());
  // O princípio ativo entra na busca junto do nome: quem tem a caixa na mão às vezes lembra do
  // "losartana" e não do nome comercial.
  const visiveis =
    termo.length === 0
      ? items
      : items.filter(
          (item) =>
            normalizar(item.medication.name).includes(termo) ||
            normalizar(item.medication.activeIngredient).includes(termo),
        );

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
      <Header
        title="Medicações"
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        action={{
          icon: "cube-outline",
          label: "Abrir o estoque das suas medicações",
          onPress: () => router.push("/estoque"),
        }}
      />

      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Abaixo, suas medicações cadastradas em nosso sistema. Toque no lápis para ver mais
          informações ou editar o cadastro, e na lixeira caso deseje excluir a medicação.
        </Text>

        {items.length > 0 ? (
          <>
            <SearchField
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome ou princípio ativo"
              style={styles.busca}
            />
            <Text style={styles.contagem}>
              {termo.length > 0
                ? `${visiveis.length} de ${items.length} ${items.length === 1 ? "medicação" : "medicações"}`
                : `${items.length} ${items.length === 1 ? "medicação cadastrada" : "medicações cadastradas"}`}
            </Text>
          </>
        ) : null}
      </View>

      {error !== null ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={visiveis}
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
            // Busca sem resultado e lista vazia pedem respostas diferentes: uma se resolve
            // mudando o que foi digitado, a outra cadastrando algo.
            termo.length > 0 ? (
              <View style={styles.centered}>
                <Text style={styles.emptyTitle}>Nenhuma medicação encontrada</Text>
                <Text style={styles.emptyDescription}>
                  Nada por aqui combina com “{busca.trim()}”. Confira a escrita ou busque pelo
                  princípio ativo.
                </Text>
              </View>
            ) : (
              <View style={styles.centered}>
                <Text style={styles.emptyTitle}>Nenhum remédio por aqui ainda</Text>
                <Text style={styles.emptyDescription}>
                  Toque no + para cadastrar seu primeiro medicamento.
                </Text>
              </View>
            )
          }
        />
      )}

      {/* Vai direto para "escanear ou manual": quem está na lista de remédios já respondeu, ao
          estar aqui, que o que vai cadastrar é um remédio — passar pela pergunta "medicação ou
          compromisso?" seria pedir de novo o que a tela já diz. */}
      <Fab
        accessibilityLabel="Cadastrar medicação"
        onPress={() => router.push("/cadastro/medicamento")}
      />
    </SafeAreaView>
  );
}
