import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type {
  MedicationForm,
  PosologyUnit,
  PrescriptionRequirement,
} from "@/domain/entities/medication";
import { unitsForMedicationForm } from "@/domain/entities/medication";
import type { PosologySchedule, TimeOfDay, Weekday } from "@/domain/entities/prescription";
import type { CadastroEssencial } from "@/hooks/use-medication-registration";
import { useScrollToFocusedInput } from "@/hooks/use-scroll-to-focused-input";
import { formatDateInput, parseDateInput, toDateInput, todayIsoDate } from "@/shared/date-input";
import {
  Button,
  Card,
  Header,
  KeyboardAwareScrollView,
  SelectField,
  TextField,
  type SelectOption,
} from "@/ui";
import { EditorDeHorarios } from "./EditorDeHorarios";
import { styles } from "./CadastroDeMedicamento.styles";

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

const REQUIREMENT_OPTIONS: SelectOption<PrescriptionRequirement>[] = [
  { value: "none", label: "Não precisa de receita" },
  { value: "simple", label: "Tarja vermelha — receita simples" },
  { value: "retained", label: "Tarja vermelha — receita retida" },
  { value: "special", label: "Tarja preta — receituário especial" },
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
 * ignorado em vez de virar estado inválido.
 */
function semLimpar<TValue extends string>(set: (value: TValue) => void) {
  return (value: TValue | null) => {
    if (value !== null) set(value);
  };
}

type EtapaEssencialScreenProps = {
  /** Salva e encerra aqui mesmo. */
  onSalvar: (essencial: CadastroEssencial) => void;
  /** Salva e segue pros detalhes — por isso recebe o mesmo essencial. */
  onContinuar: (essencial: CadastroEssencial) => void;
  onBack: () => void;
};

/**
 * Etapa 1: só o que o app precisa pra lembrar o paciente da dose. Quem quer o básico termina
 * aqui; os detalhes são um segundo passo opcional.
 */
export function EtapaEssencialScreen({ onSalvar, onContinuar, onBack }: EtapaEssencialScreenProps) {
  const { scrollViewRef, scrollToFocusedInput, onScroll } = useScrollToFocusedInput();

  const [name, setName] = useState("");
  const [activeIngredient, setActiveIngredient] = useState("");
  const [form, setForm] = useState<MedicationForm>("tablet");
  const [requirement, setRequirement] = useState<PrescriptionRequirement>("none");

  const [doseAmount, setDoseAmount] = useState("");
  const [doseUnit, setDoseUnit] = useState<PosologyUnit>("tablet");

  const [frequency, setFrequency] = useState<FrequencyKind>("daily");
  const [times, setTimes] = useState<TimeOfDay[]>([]);
  const [intervalMinutes, setIntervalMinutes] = useState("480");
  const [firstTime, setFirstTime] = useState<TimeOfDay[]>([]);
  const [weekdays, setWeekdays] = useState<Weekday[]>([]);

  const [startDateInput, setStartDateInput] = useState(toDateInput(todayIsoDate()));
  const [isContinuous, setContinuous] = useState(true);
  const [endDateInput, setEndDateInput] = useState("");

  /**
   * A unidade acompanha a forma: trocar para "pomada" com "comprimido(s)" selecionado deixaria a
   * dose sem sentido. Quando a atual não serve pra forma nova, cai na primeira disponível.
   */
  const unitOptions: SelectOption<PosologyUnit>[] = useMemo(
    () => unitsForMedicationForm(form).map((unit) => ({ value: unit, label: UNIT_LABELS[unit] })),
    [form],
  );
  function handleFormChange(nextForm: MedicationForm) {
    setForm(nextForm);
    const units = unitsForMedicationForm(nextForm);
    if (!units.includes(doseUnit)) setDoseUnit(units[0]);
  }

  const parsedDoseAmount = Number(doseAmount.replace(",", "."));
  const hasDoseAmountError =
    doseAmount.length > 0 && (!Number.isFinite(parsedDoseAmount) || parsedDoseAmount <= 0);

  const startDateIso = parseDateInput(startDateInput);
  const startDateError =
    startDateInput.length === 10 && startDateIso === null ? "Data inválida." : undefined;

  const endDateIso = isContinuous || endDateInput.length === 0 ? null : parseDateInput(endDateInput);
  const endDateError =
    isContinuous || endDateInput.length === 0
      ? undefined
      : endDateIso === null
        ? endDateInput.length === 10
          ? "Data inválida."
          : "Complete a data ou marque como contínuo."
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

  function toggleWeekday(weekday: Weekday) {
    setWeekdays((current) =>
      current.includes(weekday) ? current.filter((day) => day !== weekday) : [...current, weekday].sort(),
    );
  }

  function buildEssencial(): CadastroEssencial | null {
    if (!canSubmit || startDateIso === null) return null;
    return {
      name: name.trim(),
      activeIngredient: activeIngredient.trim(),
      form,
      prescriptionRequirement: requirement,
      doseAmount: parsedDoseAmount,
      doseUnit,
      schedule,
      startDate: startDateIso,
      endDate: endDateIso,
    };
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
        <Text style={styles.stepLabel}>Etapa 1 de 2 · O essencial</Text>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>O REMÉDIO</Text>
            <Text style={[styles.selo, styles.seloObrigatorio]}>OBRIGATÓRIO</Text>
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
          <SelectField
            label="FORMA"
            value={form}
            options={FORM_OPTIONS}
            onChange={semLimpar(handleFormChange)}
          />
          <SelectField
            label="PRECISA DE RECEITA?"
            value={requirement}
            options={REQUIREMENT_OPTIONS}
            onChange={semLimpar((next: PrescriptionRequirement) => setRequirement(next))}
          />
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
              <SelectField
                label="UNIDADE"
                value={doseUnit}
                options={unitOptions}
                onChange={semLimpar((unit: PosologyUnit) => setDoseUnit(unit))}
              />
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

          <TextField
            label="INÍCIO"
            required
            placeholder="DD/MM/AAAA"
            value={startDateInput}
            onChangeText={(value) => setStartDateInput(formatDateInput(value, startDateInput))}
            onFocus={scrollToFocusedInput}
            keyboardType="number-pad"
            maxLength={10}
            error={startDateError}
          />

          {/* Contínuo é o caso mais comum — perguntar "até quando" a quem não tem fim previsto
              seria pedir um dado que não existe. */}
          <Pressable
            style={styles.switchRow}
            onPress={() => setContinuous((current) => !current)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isContinuous }}>
            <View style={[styles.switchBox, isContinuous && styles.switchBoxChecked]} />
            <Text style={styles.switchLabel}>Tratamento contínuo, sem data para acabar</Text>
          </Pressable>

          {!isContinuous ? (
            <TextField
              label="ATÉ QUANDO"
              placeholder="DD/MM/AAAA"
              value={endDateInput}
              onChangeText={(value) => setEndDateInput(formatDateInput(value, endDateInput))}
              onFocus={scrollToFocusedInput}
              keyboardType="number-pad"
              maxLength={10}
              error={endDateError}
            />
          ) : null}
        </Card>

        <Button
          label="Continuar para os detalhes"
          disabled={!canSubmit}
          onPress={() => {
            const essencial = buildEssencial();
            if (essencial !== null) onContinuar(essencial);
          }}
        />
        <Button
          variant="text"
          label="Salvar assim mesmo"
          disabled={!canSubmit}
          onPress={() => {
            const essencial = buildEssencial();
            if (essencial !== null) onSalvar(essencial);
          }}
        />
        {!canSubmit ? (
          <Text style={styles.submitHint}>
            Preencha o nome, a dose e quando tomar para continuar.
          </Text>
        ) : null}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
