import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { PrescriptionRequirement } from "@/domain/entities/medication";
import { requiresPrescription } from "@/domain/entities/medication";
import type { PosologySchedule, ReminderMode } from "@/domain/entities/prescription";
import type { CadastroDetalhes } from "@/hooks/use-medication-registration";
import { usePhotoPicker } from "@/hooks/use-photo-picker";
import { useScrollToFocusedInput } from "@/hooks/use-scroll-to-focused-input";
import { formatDateInput, parseDateInput } from "@/shared/date-input";
import { colors } from "@/shared/theme";
import {
  Accordion,
  Button,
  Card,
  Header,
  KeyboardAwareScrollView,
  SelectField,
  TextField,
  type SelectOption,
} from "@/ui";
import { styles } from "./CadastroDeMedicamento.styles";

const REMINDER_OPTIONS: SelectOption<ReminderMode>[] = [
  { value: "alarm", label: "Alarme (som, mesmo no silencioso)" },
  { value: "notification", label: "Notificação comum" },
  { value: "none", label: "Sem lembrete" },
];

const LEAD_DAYS_OPTIONS: SelectOption<string>[] = [
  { value: "3", label: "3 dias antes de acabar" },
  { value: "7", label: "7 dias antes de acabar" },
  { value: "15", label: "15 dias antes de acabar" },
  { value: "30", label: "30 dias antes de acabar" },
];

type EtapaDetalhesScreenProps = {
  /** Vem da etapa 1 e decide o que faz sentido perguntar aqui. */
  medicationName: string;
  prescriptionRequirement: PrescriptionRequirement;
  scheduleKind: PosologySchedule["kind"];
  onConcluir: (detalhes: CadastroDetalhes) => void;
  onBack: () => void;
};

function semLimpar<TValue extends string>(set: (value: TValue) => void) {
  return (value: TValue | null) => {
    if (value !== null) set(value);
  };
}

/**
 * Etapa 2: tudo opcional. O medicamento já foi salvo na etapa anterior, então sair daqui não
 * perde nada — e cada seção só aparece se fizer sentido para o que foi cadastrado.
 */
export function EtapaDetalhesScreen({
  medicationName,
  prescriptionRequirement,
  scheduleKind,
  onConcluir,
  onBack,
}: EtapaDetalhesScreenProps) {
  const { scrollViewRef, scrollToFocusedInput, onScroll } = useScrollToFocusedInput();
  const boxPhoto = usePhotoPicker("medicamento-caixa.jpg");
  const prescriptionPhoto = usePhotoPicker("medicamento-receita.jpg");

  const [reminderMode, setReminderMode] = useState<ReminderMode>("notification");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [attachmentUri, setAttachmentUri] = useState<string | null>(null);
  const [validUntilInput, setValidUntilInput] = useState("");
  const [tracksStock, setTracksStock] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("");
  const [wantsLowStockAlert, setWantsLowStockAlert] = useState(false);
  const [leadDays, setLeadDays] = useState("7");
  const [storageLocation, setStorageLocation] = useState("");
  const [notes, setNotes] = useState("");

  // "Se necessário" não tem horário agendado, então não há o que lembrar — perguntar como avisar
  // criaria uma configuração que nunca dispararia.
  const showsReminder = scheduleKind !== "asNeeded";
  const showsPrescription = requiresPrescription(prescriptionRequirement);

  const validUntilIso = validUntilInput.length === 0 ? null : parseDateInput(validUntilInput);
  const validUntilError =
    validUntilInput.length === 10 && validUntilIso === null ? "Data inválida." : undefined;

  async function pick(picker: ReturnType<typeof usePhotoPicker>, apply: (uri: string) => void) {
    const result = await picker.pickPhoto();
    if (result.status === "picked") {
      apply(result.uri);
      return;
    }
    if (result.reason === "cancelled") return;
    Alert.alert(
      result.reason === "permission-denied" ? "Sem acesso às fotos" : "Não foi possível usar a foto",
      result.reason === "permission-denied"
        ? "Para escolher uma imagem, libere o acesso às fotos nas configurações do aparelho."
        : "Tente novamente com outra imagem.",
    );
  }

  function handleConcluir() {
    const parsedStock = Number(stockQuantity.replace(",", "."));
    onConcluir({
      photoUri,
      reminderMode: showsReminder ? reminderMode : "none",
      notes: notes.trim().length > 0 ? notes.trim() : null,
      stockQuantity: tracksStock && Number.isFinite(parsedStock) && parsedStock > 0 ? parsedStock : null,
      lowStockAlertEnabled: tracksStock && wantsLowStockAlert,
      lowStockAlertLeadDays: tracksStock && wantsLowStockAlert ? Number(leadDays) : null,
      storageLocation: storageLocation.trim().length > 0 ? storageLocation.trim() : null,
      attachmentUri: showsPrescription ? attachmentUri : null,
      attachmentValidUntil: showsPrescription ? validUntilIso : null,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Detalhes" onBack={onBack} />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <Text style={styles.stepLabel}>Etapa 2 de 2 · Detalhes</Text>
        <Text style={styles.sectionHint}>
          {medicationName} já está salvo. Tudo aqui é opcional — pode sair a qualquer momento.
        </Text>

        {showsReminder ? (
          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>LEMBRETE</Text>
              <Text style={[styles.selo, styles.seloOpcional]}>OPCIONAL</Text>
            </View>
            <SelectField
              label="COMO AVISAR"
              value={reminderMode}
              options={REMINDER_OPTIONS}
              onChange={semLimpar((mode: ReminderMode) => setReminderMode(mode))}
            />
          </Card>
        ) : null}

        <Accordion title="Anexos">
          <View style={styles.photoRow}>
            <Pressable
              style={photoUri ? styles.photoFrame : styles.photoPlaceholder}
              onPress={() => pick(boxPhoto, setPhotoUri)}
              disabled={boxPhoto.isPicking}
              accessibilityRole="button"
              accessibilityLabel="Foto da embalagem">
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
              ) : (
                <MaterialCommunityIcons name="camera-plus" size={24} color={colors.onSurfaceVariant} />
              )}
            </Pressable>
            <View style={styles.photoTextGroup}>
              <Pressable onPress={() => pick(boxPhoto, setPhotoUri)} accessibilityRole="button">
                <Text style={styles.photoAddLabel}>
                  {photoUri ? "Trocar foto da caixa" : "Adicionar foto da caixa"}
                </Text>
              </Pressable>
              <Text style={styles.photoHint}>Ajuda a reconhecer o remédio de relance.</Text>
            </View>
          </View>

          {showsPrescription ? (
            <>
              <View style={styles.photoRow}>
                <Pressable
                  style={attachmentUri ? styles.photoFrame : styles.photoPlaceholder}
                  onPress={() => pick(prescriptionPhoto, setAttachmentUri)}
                  disabled={prescriptionPhoto.isPicking}
                  accessibilityRole="button"
                  accessibilityLabel="Foto da receita">
                  {attachmentUri ? (
                    <Image source={{ uri: attachmentUri }} style={styles.photo} contentFit="cover" />
                  ) : (
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={24}
                      color={colors.onSurfaceVariant}
                    />
                  )}
                </Pressable>
                <View style={styles.photoTextGroup}>
                  <Pressable
                    onPress={() => pick(prescriptionPhoto, setAttachmentUri)}
                    accessibilityRole="button">
                    <Text style={styles.photoAddLabel}>
                      {attachmentUri ? "Trocar foto da receita" : "Adicionar foto da receita"}
                    </Text>
                  </Pressable>
                  <Text style={styles.photoHint}>Fica só no aparelho, não sobe pra nuvem.</Text>
                </View>
              </View>

              <TextField
                label="RECEITA VÁLIDA ATÉ"
                placeholder="DD/MM/AAAA"
                value={validUntilInput}
                onChangeText={(value) => setValidUntilInput(formatDateInput(value, validUntilInput))}
                onFocus={scrollToFocusedInput}
                keyboardType="number-pad"
                maxLength={10}
                error={validUntilError}
              />
            </>
          ) : null}
        </Accordion>

        <Accordion title="Estoque">
          <Pressable
            style={styles.switchRow}
            onPress={() => setTracksStock((current) => !current)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: tracksStock }}>
            <View style={[styles.switchBox, tracksStock && styles.switchBoxChecked]} />
            <Text style={styles.switchLabel}>Quero controlar quanto tenho em casa</Text>
          </Pressable>

          {tracksStock ? (
            <>
              <TextField
                label="QUANTIDADE EM MÃOS"
                placeholder="Ex: 30"
                value={stockQuantity}
                onChangeText={setStockQuantity}
                onFocus={scrollToFocusedInput}
                keyboardType="decimal-pad"
                maxLength={8}
              />
              {/* Alerta é escolha explícita, nunca ligado sozinho (decisão nº1 do projeto). */}
              <Pressable
                style={styles.switchRow}
                onPress={() => setWantsLowStockAlert((current) => !current)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: wantsLowStockAlert }}>
                <View style={[styles.switchBox, wantsLowStockAlert && styles.switchBoxChecked]} />
                <Text style={styles.switchLabel}>Me avisar quando estiver acabando</Text>
              </Pressable>
              {wantsLowStockAlert ? (
                <SelectField
                  label="AVISAR COM"
                  value={leadDays}
                  options={LEAD_DAYS_OPTIONS}
                  onChange={semLimpar((days: string) => setLeadDays(days))}
                />
              ) : null}
            </>
          ) : null}
        </Accordion>

        <Accordion title="Onde guardo">
          <TextField
            label="LOCAL"
            placeholder="Ex: caixa sobre a geladeira"
            value={storageLocation}
            onChangeText={setStorageLocation}
            onFocus={scrollToFocusedInput}
            maxLength={120}
          />
        </Accordion>

        <Accordion title="Observações">
          <TextField
            label="ANOTAÇÃO"
            placeholder="Ex: tomar em jejum"
            value={notes}
            onChangeText={setNotes}
            onFocus={scrollToFocusedInput}
            multiline
            maxLength={500}
          />
        </Accordion>

        <Button label="Concluir cadastro" onPress={handleConcluir} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
