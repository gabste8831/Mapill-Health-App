import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MedicationForm, PosologyUnit } from "@/domain/entities/medication";
import { unitsForMedicationForm } from "@/domain/entities/medication";
import type { PosologySchedule, ReminderMode, TimeOfDay, Weekday } from "@/domain/entities/prescription";
import { usePhotoPicker } from "@/hooks/use-photo-picker";
import { useScrollToFocusedInput } from "@/hooks/use-scroll-to-focused-input";
import { formatDateInput, parseDateInput, todayIsoDate, toDateInput } from "@/shared/date-input";
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
import { EditorDeHorarios } from "./EditorDeHorarios";
import { styles } from "./CadastroDeMedicamentoScreen.styles";

const FORM_OPTIONS: SelectOption<MedicationForm>[] = [
  { value: "tablet", label: "Comprimido ou cápsula" },
  { value: "liquid", label: "Líquido (xarope, solução)" },
  { value: "drops", label: "Gotas" },
  { value: "injection", label: "Injeção" },
  { value: "ointment", label: "Pomada ou creme" },
  { value: "sublingual", label: "Sublingual" },
  { value: "inhaler", label: "Inalador ou spray" },
  { value: "patch", label: "Adesivo" },
  { value: "sachet", label: "Sachê ou pó" },
  { value: "other", label: "Outra" },
];

const UNIT_LABELS: Record<PosologyUnit, string> = {
  tablet: "comprimido(s)",
  capsule: "cápsula(s)",
  drop: "gota(s)",
  ml: "ml",
  mg: "mg",
  g: "g",
  IU: "UI (unidades)",
  application: "aplicação(ões)",
  puff: "jato(s)",
  patch: "adesivo(s)",
  sachet: "sachê(s)",
};

type FrequencyKind = PosologySchedule["kind"];

const FREQUENCY_OPTIONS: SelectOption<FrequencyKind>[] = [
  { value: "daily", label: "Todo dia, em horários fixos" },
  { value: "interval", label: "De tempos em tempos" },
  { value: "weekly", label: "Em dias específicos da semana" },
  { value: "asNeeded", label: "Só se necessário" },
];

const INTERVAL_OPTIONS: SelectOption<string>[] = [
  { value: "240", label: "A cada 4 horas" },
  { value: "360", label: "A cada 6 horas" },
  { value: "480", label: "A cada 8 horas" },
  { value: "720", label: "A cada 12 horas" },
  { value: "1440", label: "A cada 24 horas" },
];

const REMINDER_OPTIONS: SelectOption<ReminderMode>[] = [
  { value: "alarm", label: "Alarme (som, mesmo no silencioso)" },
  { value: "notification", label: "Notificação comum" },
  { value: "none", label: "Sem lembrete" },
];

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

/**
 * O `SelectField` permite limpar, devolvendo `null`. Nestes campos limpar não é uma opção que
 * faça sentido — não existe medicamento sem forma nem dose sem unidade —, então o `null` é
 * ignorado em vez de virar um estado inválido.
 */
function semLimpar<TValue extends string>(set: (value: TValue) => void) {
  return (value: TValue | null) => {
    if (value !== null) set(value);
  };
}

/** Tudo que a tela produz. A montagem em Medication/Prescription/InventoryItem é da camada de dados. */
export type CadastroDeMedicamentoDraft = {
  name: string;
  activeIngredient: string;
  form: MedicationForm;
  photoUri: string | null;
  doseAmount: number;
  doseUnit: PosologyUnit;
  schedule: PosologySchedule;
  startDate: string;
  endDate: string | null;
  reminderMode: ReminderMode;
  notes: string | null;
  stockQuantity: number | null;
  storageLocation: string | null;
};

type CadastroDeMedicamentoScreenProps = {
  onSubmit: (draft: CadastroDeMedicamentoDraft) => void;
  onBack: () => void;
};

export function CadastroDeMedicamentoScreen({ onSubmit, onBack }: CadastroDeMedicamentoScreenProps) {
  const { scrollViewRef, scrollToFocusedInput, onScroll } = useScrollToFocusedInput();
  const { isPicking, pickPhoto } = usePhotoPicker("medicamento-foto.jpg");

  const [name, setName] = useState("");
  const [activeIngredient, setActiveIngredient] = useState("");
  const [form, setForm] = useState<MedicationForm>("tablet");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [doseAmount, setDoseAmount] = useState("");
  const [doseUnit, setDoseUnit] = useState<PosologyUnit>("tablet");

  const [frequency, setFrequency] = useState<FrequencyKind>("daily");
  const [times, setTimes] = useState<TimeOfDay[]>([]);
  const [intervalMinutes, setIntervalMinutes] = useState("480");
  const [firstTime, setFirstTime] = useState<TimeOfDay[]>([]);
  const [weekdays, setWeekdays] = useState<Weekday[]>([]);

  const [startDateInput, setStartDateInput] = useState(toDateInput(todayIsoDate()));
  const [endDateInput, setEndDateInput] = useState("");
  const [reminderMode, setReminderMode] = useState<ReminderMode>("notification");

  const [notes, setNotes] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [storageLocation, setStorageLocation] = useState("");

  /**
   * A unidade acompanha a forma: trocar para "pomada" com "comprimido(s)" selecionado deixaria a
   * dose sem sentido. Quando a atual não serve pra forma nova, cai na primeira disponível.
   */
  const availableUnits = useMemo(() => unitsForMedicationForm(form), [form]);
  const unitOptions: SelectOption<PosologyUnit>[] = availableUnits.map((unit) => ({
    value: unit,
    label: UNIT_LABELS[unit],
  }));
  function handleFormChange(nextForm: MedicationForm) {
    setForm(nextForm);
    const units = unitsForMedicationForm(nextForm);
    if (!units.includes(doseUnit)) setDoseUnit(units[0]);
  }

  const parsedDoseAmount = Number(doseAmount.replace(",", "."));
  const hasDoseAmountError = doseAmount.length > 0 && (!Number.isFinite(parsedDoseAmount) || parsedDoseAmount <= 0);

  const startDateIso = parseDateInput(startDateInput);
  const startDateError = startDateInput.length === 10 && startDateIso === null ? "Data inválida." : undefined;

  const endDateIso = endDateInput.length === 0 ? null : parseDateInput(endDateInput);
  const endDateError =
    endDateInput.length === 0
      ? undefined
      : endDateIso === null
        ? endDateInput.length === 10
          ? "Data inválida."
          : "Complete a data ou deixe em branco."
        : startDateIso !== null && endDateIso < startDateIso
          ? "O fim não pode ser antes do início."
          : undefined;

  const schedule = useMemo<PosologySchedule>(() => {
    if (frequency === "asNeeded") return { kind: "asNeeded" };
    if (frequency === "interval") {
      return { kind: "interval", everyMinutes: Number(intervalMinutes), firstTime: firstTime[0] ?? "" };
    }
    if (frequency === "weekly") return { kind: "weekly", weekdays, times };
    return { kind: "daily", times };
  }, [frequency, intervalMinutes, firstTime, weekdays, times]);

  const isScheduleComplete =
    schedule.kind === "asNeeded" ||
    (schedule.kind === "interval" && schedule.firstTime.length > 0) ||
    (schedule.kind === "daily" && schedule.times.length > 0) ||
    (schedule.kind === "weekly" && schedule.times.length > 0 && schedule.weekdays.length > 0);

  const canSubmit =
    name.trim().length > 0 &&
    parsedDoseAmount > 0 &&
    !hasDoseAmountError &&
    startDateIso !== null &&
    endDateError === undefined &&
    isScheduleComplete;

  async function handlePickPhoto() {
    const result = await pickPhoto();
    if (result.status === "picked") {
      setPhotoUri(result.uri);
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

  function toggleWeekday(weekday: Weekday) {
    setWeekdays((current) =>
      current.includes(weekday) ? current.filter((day) => day !== weekday) : [...current, weekday].sort(),
    );
  }

  function handleSubmit() {
    if (!canSubmit || startDateIso === null) return;
    const parsedStock = Number(stockQuantity.replace(",", "."));
    onSubmit({
      name: name.trim(),
      activeIngredient: activeIngredient.trim(),
      form,
      photoUri,
      doseAmount: parsedDoseAmount,
      doseUnit,
      schedule,
      startDate: startDateIso,
      endDate: endDateIso,
      reminderMode,
      notes: notes.trim().length > 0 ? notes.trim() : null,
      stockQuantity: Number.isFinite(parsedStock) && parsedStock > 0 ? parsedStock : null,
      storageLocation: storageLocation.trim().length > 0 ? storageLocation.trim() : null,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Nova medicação" onBack={onBack} />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>O REMÉDIO</Text>
            <Text style={[styles.selo, styles.seloObrigatorio]}>OBRIGATÓRIO</Text>
          </View>

          <View style={styles.photoRow}>
            <Pressable
              style={photoUri ? styles.photoFrame : styles.photoPlaceholder}
              onPress={handlePickPhoto}
              disabled={isPicking}
              accessibilityRole="button"
              accessibilityLabel={photoUri ? "Trocar foto da embalagem" : "Adicionar foto da embalagem"}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
              ) : (
                <MaterialCommunityIcons name="camera-plus" size={24} color={colors.onSurfaceVariant} />
              )}
            </Pressable>
            <View style={styles.photoTextGroup}>
              <Pressable onPress={handlePickPhoto} disabled={isPicking} accessibilityRole="button">
                <Text style={styles.photoAddLabel}>
                  {photoUri ? "Trocar foto da caixa" : "Adicionar foto da caixa"}
                </Text>
              </Pressable>
              <Text style={styles.photoHint}>Ajuda a reconhecer o remédio de relance.</Text>
            </View>
          </View>

          <TextField
            label="NOME"
            required
            placeholder="Ex: Losartana 50mg"
            value={name}
            onChangeText={setName}
            onFocus={scrollToFocusedInput}
            maxLength={120}
          />
          <SelectField label="FORMA" value={form} options={FORM_OPTIONS} onChange={semLimpar(handleFormChange)} />
          <TextField
            label="PRINCÍPIO ATIVO"
            placeholder="Ex: Losartana potássica"
            value={activeIngredient}
            onChangeText={setActiveIngredient}
            onFocus={scrollToFocusedInput}
            maxLength={120}
          />
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>A DOSE</Text>
            <Text style={[styles.selo, styles.seloObrigatorio]}>OBRIGATÓRIO</Text>
          </View>
          <Text style={styles.sectionHint}>Quanto você toma de cada vez.</Text>

          <View style={styles.doseRow}>
            <TextField
              label="QUANTIDADE"
              required
              containerStyle={styles.doseAmountField}
              placeholder="Ex: 1"
              value={doseAmount}
              onChangeText={setDoseAmount}
              onFocus={scrollToFocusedInput}
              keyboardType="decimal-pad"
              maxLength={8}
              error={hasDoseAmountError ? "Informe um número maior que zero." : undefined}
            />
            <View style={styles.doseUnitField}>
              <SelectField label="UNIDADE" value={doseUnit} options={unitOptions} onChange={semLimpar((unit: PosologyUnit) => setDoseUnit(unit))} />
            </View>
          </View>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>QUANDO TOMAR</Text>
            <Text style={[styles.selo, styles.seloObrigatorio]}>OBRIGATÓRIO</Text>
          </View>

          <SelectField
            label="FREQUÊNCIA"
            value={frequency}
            options={FREQUENCY_OPTIONS}
            onChange={semLimpar((kind: FrequencyKind) => setFrequency(kind))}
          />

          {frequency === "daily" ? <EditorDeHorarios times={times} onChange={setTimes} /> : null}

          {frequency === "weekly" ? (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DIAS DA SEMANA</Text>
                <View style={styles.weekdayRow}>
                  {WEEKDAYS.map((weekday) => {
                    const isSelected = weekdays.includes(weekday.value);
                    return (
                      <Pressable
                        key={weekday.value}
                        style={[styles.weekday, isSelected && styles.weekdaySelected]}
                        onPress={() => toggleWeekday(weekday.value)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}>
                        <Text style={[styles.weekdayText, isSelected && styles.weekdayTextSelected]}>
                          {weekday.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <EditorDeHorarios times={times} onChange={setTimes} />
            </>
          ) : null}

          {frequency === "interval" ? (
            <>
              <SelectField
                label="INTERVALO"
                value={intervalMinutes}
                options={INTERVAL_OPTIONS}
                onChange={semLimpar((minutes: string) => setIntervalMinutes(minutes))}
              />
              <EditorDeHorarios times={firstTime} onChange={(next) => setFirstTime(next.slice(-1))} />
              <Text style={styles.sectionHint}>
                O primeiro horário do dia. Os seguintes saem dele, somando o intervalo.
              </Text>
            </>
          ) : null}

          {frequency === "asNeeded" ? (
            <Text style={styles.sectionHint}>
              Nenhum horário será agendado. Você registra a dose quando tomar.
            </Text>
          ) : null}

          <View style={styles.doseRow}>
            <TextField
              label="INÍCIO"
              required
              containerStyle={styles.doseAmountField}
              placeholder="DD/MM/AAAA"
              value={startDateInput}
              onChangeText={(value) => setStartDateInput(formatDateInput(value, startDateInput))}
              onFocus={scrollToFocusedInput}
              keyboardType="number-pad"
              maxLength={10}
              error={startDateError}
            />
            <TextField
              label="FIM"
              containerStyle={styles.doseAmountField}
              placeholder="Contínuo"
              value={endDateInput}
              onChangeText={(value) => setEndDateInput(formatDateInput(value, endDateInput))}
              onFocus={scrollToFocusedInput}
              keyboardType="number-pad"
              maxLength={10}
              error={endDateError}
            />
          </View>
        </Card>

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

        <Accordion title="Estoque">
          <TextField
            label="QUANTIDADE EM MÃOS"
            placeholder="Ex: 30"
            value={stockQuantity}
            onChangeText={setStockQuantity}
            onFocus={scrollToFocusedInput}
            keyboardType="decimal-pad"
            maxLength={8}
          />
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

        <Button label="Salvar medicação" onPress={handleSubmit} disabled={!canSubmit} />
        {!canSubmit ? (
          <Text style={styles.submitHint}>
            <Ionicons name="information-circle-outline" size={14} color={colors.onSurfaceVariant} />{" "}
            Preencha o nome, a dose e quando tomar para salvar.
          </Text>
        ) : null}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
