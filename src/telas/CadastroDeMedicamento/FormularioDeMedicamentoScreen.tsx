import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type {
  MedicationForm,
  PosologyUnit,
  PrescriptionRequirement,
} from "@/domain/entities/medication";
import {
  defaultUnitForMedicationForm,
  needsUnitChoice,
  stockUnitForMedicationForm,
  unitsForMedicationForm,
} from "@/domain/entities/medication";
import type {
  PosologySchedule,
  ReminderMode,
  TimeOfDay,
  Weekday,
} from "@/domain/entities/prescription";
import { COMMON_DOSES_PER_DAY, MAX_DOSES_PER_DAY } from "@/domain/entities/prescription";
import { summarizeTreatment } from "@/domain/use-cases/summarize-treatment";
import { usePhotoPicker } from "@/hooks/use-photo-picker";
import { useScrollToFocusedInput } from "@/hooks/use-scroll-to-focused-input";
import {
  formatDateInput,
  lastDayOfTreatment,
  parseDateInput,
  toDateInput,
  todayIsoDate,
  treatmentDuration,
  type DurationUnit,
} from "@/shared/date-input";
import { parseTimeInput } from "@/shared/time-input";
import { colors, withOpacity } from "@/shared/theme";
import {
  Button,
  Card,
  Header,
  KeyboardAwareScrollView,
  OptionGroup,
  SelectField,
  TextField,
  type OptionGroupOption,
  type SelectOption,
} from "@/ui";
import { ConfiguracaoDeEstoque } from "./ConfiguracaoDeEstoque";
import { ConfiguracaoDeLembrete } from "./ConfiguracaoDeLembrete";
import { SeletorDeHorarios } from "./SeletorDeHorarios";
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

/** Como a unidade aparece no meio de uma frase ("Quantos comprimidos você tem?"). */
const UNIT_NOUNS: Record<PosologyUnit, string> = {
  tablet: "comprimidos",
  capsule: "cápsulas",
  drop: "gotas",
  ml: "ml",
  mg: "mg",
  g: "g",
  IU: "unidades (UI)",
  application: "aplicações",
  puff: "jatos",
  patch: "adesivos",
  sachet: "sachês",
};

type FrequencyKind = PosologySchedule["kind"];

const FREQUENCY_OPTIONS: OptionGroupOption<FrequencyKind>[] = [
  { value: "daily", label: "Todo dia" },
  { value: "weekly", label: "Dias da semana" },
  { value: "interval", label: "A cada X horas" },
  { value: "asNeeded", label: "Só quando precisar" },
];

const INTERVAL_OPTIONS: SelectOption<string>[] = [
  { value: "240", label: "A cada 4 horas" },
  { value: "360", label: "A cada 6 horas" },
  { value: "480", label: "A cada 8 horas" },
  { value: "720", label: "A cada 12 horas" },
  { value: "1440", label: "A cada 24 horas" },
];

type DurationKind = "continuous" | "fixed";

const DURATION_OPTIONS: OptionGroupOption<DurationKind>[] = [
  { value: "continuous", label: "Uso contínuo" },
  { value: "fixed", label: "Tem prazo" },
];

const DURATION_UNIT_OPTIONS: OptionGroupOption<DurationUnit>[] = [
  { value: "days", label: "dias" },
  { value: "weeks", label: "semanas" },
  { value: "months", label: "meses" },
];

const DOSES_PER_DAY_OPTIONS: OptionGroupOption<string>[] = Array.from(
  { length: COMMON_DOSES_PER_DAY },
  (_, index) => ({ value: String(index + 1), label: `${index + 1}×` }),
);

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

const REMINDER_LABELS: Record<ReminderMode, string> = {
  alarm: "Alarme, toca mesmo no silencioso",
  notification: "Notificação comum",
  both: "Alarme e notificação",
  none: "Sem aviso",
};

/** Cadastro inteiro numa estrutura só — a mesma tela cria e edita. */
export type MedicamentoDraft = {
  name: string;
  activeIngredient: string;
  form: MedicationForm;
  prescriptionRequirement: PrescriptionRequirement;
  doseAmount: number;
  doseUnit: PosologyUnit;
  schedule: PosologySchedule;
  startDate: string;
  endDate: string | null;
  photoUri: string | null;
  reminderMode: ReminderMode;
  notes: string | null;
  stockQuantity: number | null;
  /** Nem sempre igual a `doseUnit`: gota se toma em gota mas se compra em ml. */
  stockUnit: PosologyUnit;
  lowStockAlertEnabled: boolean;
  lowStockAlertLeadDays: number | null;
  storageLocation: string | null;
  attachmentUri: string | null;
  attachmentValidUntil: string | null;
};

/**
 * O `SelectField` permite limpar, devolvendo `null`. Nestes campos limpar não é opção que faça
 * sentido — não existe medicamento sem forma nem dose sem unidade —, então o `null` é ignorado.
 */
function semLimpar<TValue extends string>(set: (value: TValue) => void) {
  return (value: TValue | null) => {
    if (value !== null) set(value);
  };
}

/**
 * N campos vazios. A frequência decide *quantos*; o conteúdo é sempre do paciente — sugerir
 * horário é convidar quem está com pressa a aceitar sem ler, e aí o app lembra a dose na hora
 * errada em silêncio.
 */
function horariosVazios(doses: number): string[] {
  return Array.from({ length: doses }, () => "");
}

/** "o nome, a dose e os horários" — lista em português, com "e" antes do último. */
function emLista(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

/** Índices que repetem um horário já usado antes na lista. */
function indicesDuplicados(times: string[]): number[] {
  const vistos = new Set<string>();
  const repetidos: number[] = [];
  times.forEach((time, index) => {
    if (parseTimeInput(time) === null) return;
    if (vistos.has(time)) repetidos.push(index);
    vistos.add(time);
  });
  return repetidos;
}

type FormularioDeMedicamentoScreenProps = {
  /** Ausente = cadastro novo. Presente = edição, com a tela já preenchida. */
  initialValue?: MedicamentoDraft;
  onSubmit: (draft: MedicamentoDraft) => void;
  onBack: () => void;
};

/**
 * Cadastro e edição de medicamento na mesma tela, em dois estados: primeiro só o essencial, e o
 * resto aparece de uma vez quando ele fica completo. A transição é única e anunciada — seções
 * nascendo conforme se digita fariam a tela pular debaixo do dedo, virando um acordeão disfarçado.
 *
 * Dentro de cada seção, a pergunta seguinte é consequência da resposta anterior: a forma decide a
 * unidade, a frequência decide quantos horários existem. É isso que impede o erro clássico de
 * cadastrar 3 doses por dia com um horário só.
 *
 * O que é longo de preencher e curto de rever — horários, estoque, lembrete — mora em popup, e a
 * tela guarda só o resumo. Assim nenhuma decisão empurra a página para baixo debaixo do dedo de
 * quem acabou de tocar nela.
 */
export function FormularioDeMedicamentoScreen({
  initialValue,
  onSubmit,
  onBack,
}: FormularioDeMedicamentoScreenProps) {
  const { scrollViewRef, scrollToFocusedInput, onScroll } = useScrollToFocusedInput();
  const boxPhoto = usePhotoPicker("medicamento-caixa.jpg");
  const prescriptionPhoto = usePhotoPicker("medicamento-receita.jpg");

  /**
   * Tudo que descreve a posologia começa **vazio**, sem valor de fábrica. Um seletor já marcado
   * é indistinguível de uma resposta dada: a pessoa passa por ele sem tocar e o cadastro sai com
   * uma posologia que o app inventou. Vale para forma, dose, frequência e duração — e é a mesma
   * razão que tirou os horários sugeridos.
   */
  const [name, setName] = useState(initialValue?.name ?? "");
  const [form, setForm] = useState<MedicationForm | null>(initialValue?.form ?? null);
  const [doseAmount, setDoseAmount] = useState(
    initialValue === undefined ? "" : String(initialValue.doseAmount),
  );
  const [doseUnit, setDoseUnit] = useState<PosologyUnit | null>(initialValue?.doseUnit ?? null);

  const initialSchedule = initialValue?.schedule;
  const [frequency, setFrequency] = useState<FrequencyKind | null>(initialSchedule?.kind ?? null);
  const [timeInputs, setTimeInputs] = useState<string[]>(
    initialSchedule?.kind === "daily" || initialSchedule?.kind === "weekly"
      ? initialSchedule.times
      : [],
  );
  const [intervalMinutes, setIntervalMinutes] = useState<string | null>(
    initialSchedule?.kind === "interval" ? String(initialSchedule.everyMinutes) : null,
  );
  const [firstTimeInput, setFirstTimeInput] = useState(
    initialSchedule?.kind === "interval" ? initialSchedule.firstTime : "",
  );
  const [weekdays, setWeekdays] = useState<Weekday[]>(
    initialSchedule?.kind === "weekly" ? initialSchedule.weekdays : [],
  );
  const [customDosesInput, setCustomDosesInput] = useState(() =>
    (initialSchedule?.kind === "daily" || initialSchedule?.kind === "weekly") &&
    initialSchedule.times.length > COMMON_DOSES_PER_DAY
      ? String(initialSchedule.times.length)
      : "",
  );

  /**
   * Data de início não é campo: em uso contínuo ela é inútil, e para tratamento com prazo o que
   * a pessoa sabe é a duração ("tome por 7 dias"), não a data final. Ela existe porque a geração
   * de horários parte dela, e volta a ser editável quando os tratamentos virarem tela própria.
   */
  const [startDate] = useState(() => initialValue?.startDate ?? todayIsoDate());
  // Numa edição o `endDate` gravado já é a resposta; num cadastro novo ninguém respondeu ainda,
  // e "contínuo" pré-marcado seria o app decidindo que o tratamento não acaba.
  const [duration, setDuration] = useState<DurationKind | null>(
    initialValue === undefined ? null : initialValue.endDate == null ? "continuous" : "fixed",
  );
  const duracaoGravada =
    initialValue?.endDate == null
      ? null
      : treatmentDuration(initialValue.startDate, initialValue.endDate);
  const [durationAmount, setDurationAmount] = useState(
    duracaoGravada === null ? "" : String(duracaoGravada.amount),
  );
  const [durationUnit, setDurationUnit] = useState<DurationUnit | null>(
    duracaoGravada?.unit ?? null,
  );

  const [reminderMode, setReminderMode] = useState<ReminderMode | null>(
    initialValue?.reminderMode ?? null,
  );
  const [isReminderSheetOpen, setReminderSheetOpen] = useState(false);

  const [photoUri, setPhotoUri] = useState<string | null>(initialValue?.photoUri ?? null);
  const [attachmentUri, setAttachmentUri] = useState<string | null>(
    initialValue?.attachmentUri ?? null,
  );
  const [validUntilInput, setValidUntilInput] = useState(
    toDateInput(initialValue?.attachmentValidUntil ?? ""),
  );

  const [tracksStock, setTracksStock] = useState(initialValue?.stockQuantity != null);
  const [isStockSheetOpen, setStockSheetOpen] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(
    initialValue?.stockQuantity == null ? "" : String(initialValue.stockQuantity),
  );
  const [wantsLowStockAlert, setWantsLowStockAlert] = useState(
    initialValue?.lowStockAlertEnabled ?? false,
  );
  const [leadDays, setLeadDays] = useState<string | null>(
    initialValue?.lowStockAlertLeadDays == null
      ? null
      : String(initialValue.lowStockAlertLeadDays),
  );
  const [storageLocation, setStorageLocation] = useState(initialValue?.storageLocation ?? "");

  const [activeIngredient, setActiveIngredient] = useState(initialValue?.activeIngredient ?? "");
  const [notes, setNotes] = useState(initialValue?.notes ?? "");

  const showsUnitChoice = form !== null && needsUnitChoice(form);
  const unitOptions: SelectOption<PosologyUnit>[] = useMemo(
    () =>
      form === null
        ? []
        : unitsForMedicationForm(form).map((unit) => ({ value: unit, label: UNIT_LABELS[unit] })),
    [form],
  );
  const stockUnit =
    form === null || doseUnit === null ? null : stockUnitForMedicationForm(form, doseUnit);

  /**
   * Trocar a forma reescreve a unidade: "3 jatos de pomada" não é dose, é combinação sem sentido.
   * Onde a forma resolve a unidade sozinha, ela é derivada — isso não é chute, é consequência.
   * Onde há ambiguidade real (líquido, injeção, outra), volta a ficar em branco pra ser escolhida.
   */
  function handleFormChange(nextForm: MedicationForm) {
    setForm(nextForm);
    setDoseUnit(needsUnitChoice(nextForm) ? null : defaultUnitForMedicationForm(nextForm));
  }

  /** Mudar a quantidade de doses recomeça a lista: os horários antigos eram de outra posologia. */
  function handleDosesPerDayChange(value: string) {
    setCustomDosesInput("");
    setTimeInputs(horariosVazios(Number(value)));
  }

  /** Trocar de frequência zera o que era da anterior, senão sobra horário de outra posologia. */
  function handleFrequencyChange(nextFrequency: FrequencyKind) {
    setFrequency(nextFrequency);
    setTimeInputs([]);
    setCustomDosesInput("");
    setFirstTimeInput("");
    setIntervalMinutes(null);
    setWeekdays([]);
  }

  function handleCustomDosesChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setCustomDosesInput(digits);
    const doses = Number(digits);
    if (doses >= 1 && doses <= MAX_DOSES_PER_DAY) setTimeInputs(horariosVazios(doses));
  }

  const isCustomDoses = customDosesInput.length > 0;
  const parsedCustomDoses = Number(customDosesInput);
  const customDosesError =
    isCustomDoses && (parsedCustomDoses < 1 || parsedCustomDoses > MAX_DOSES_PER_DAY)
      ? `Entre 1 e ${MAX_DOSES_PER_DAY} vezes por dia. Mais que isso é "a cada X horas".`
      : undefined;

  const parsedDoseAmount = Number(doseAmount.replace(",", "."));
  const hasDoseAmountError =
    doseAmount.length > 0 && (!Number.isFinite(parsedDoseAmount) || parsedDoseAmount <= 0);

  const duplicateTimeIndexes = indicesDuplicados(timeInputs);
  const parsedTimes = timeInputs.map(parseTimeInput);
  const areTimesComplete =
    parsedTimes.every((time): time is TimeOfDay => time !== null) &&
    duplicateTimeIndexes.length === 0;
  const parsedFirstTime = parseTimeInput(firstTimeInput);

  const parsedDurationAmount = Number(durationAmount);
  const hasDurationError =
    duration === "fixed" &&
    durationAmount.length > 0 &&
    (!Number.isInteger(parsedDurationAmount) || parsedDurationAmount < 1);
  const endDate =
    duration !== "fixed" || durationAmount.length === 0 || hasDurationError || durationUnit === null
      ? null
      : lastDayOfTreatment(startDate, parsedDurationAmount, durationUnit);

  const validUntilIso = validUntilInput.length === 0 ? null : parseDateInput(validUntilInput);
  const validUntilError =
    validUntilInput.length === 10 && validUntilIso === null ? "Data inválida." : undefined;

  /** `null` enquanto a frequência não foi escolhida — não existe posologia padrão. */
  const schedule = useMemo<PosologySchedule | null>(() => {
    if (frequency === null) return null;
    if (frequency === "asNeeded") return { kind: "asNeeded" };
    if (frequency === "interval") {
      if (intervalMinutes === null) return null;
      return { kind: "interval", everyMinutes: Number(intervalMinutes), firstTime: firstTimeInput };
    }
    const times = [...timeInputs].sort();
    if (frequency === "weekly") return { kind: "weekly", weekdays, times };
    return { kind: "daily", times };
  }, [frequency, intervalMinutes, firstTimeInput, weekdays, timeInputs]);

  const isScheduleComplete =
    frequency === "asNeeded" ||
    (frequency === "interval" && intervalMinutes !== null && parsedFirstTime !== null) ||
    // `timeInputs` vazio significa que a quantidade de doses ainda não foi escolhida, e
    // `every` de lista vazia é `true` — sem este teste, "nada respondido" passaria por completo.
    (frequency === "daily" && timeInputs.length > 0 && areTimesComplete) ||
    (frequency === "weekly" && timeInputs.length > 0 && areTimesComplete && weekdays.length > 0);

  /**
   * O essencial completo é o que dispara a revelação do resto e destrava o botão. Não inclui
   * `endDate`: prazo em branco é "ainda não sei", não erro — só duração inválida trava.
   */
  const doseCompleta = doseUnit !== null && parsedDoseAmount > 0 && !hasDoseAmountError;
  const duracaoCompleta =
    duration === "continuous" ||
    (duration === "fixed" && endDate !== null && durationUnit !== null);
  const essencialCompleto =
    name.trim().length > 0 &&
    form !== null &&
    doseCompleta &&
    isScheduleComplete &&
    duracaoCompleta;
  const canSubmit =
    essencialCompleto &&
    !hasDurationError &&
    customDosesError === undefined &&
    validUntilError === undefined;

  /**
   * O que ainda falta, por extenso. Botão cinza sem explicação faz a pessoa varrer a tela
   * procurando o campo esquecido — e quanto mais a tela encolhe em resumos e popups, mais fácil
   * é justamente o esquecimento passar batido.
   */
  const pendencias = [
    name.trim().length === 0 ? "o nome" : null,
    form === null ? "como você toma" : null,
    form !== null && !doseCompleta ? "a dose" : null,
    frequency === null ? "a frequência" : null,
    frequency === "interval" && intervalMinutes === null ? "o intervalo" : null,
    frequency === "weekly" && weekdays.length === 0 ? "os dias da semana" : null,
    (frequency === "daily" || frequency === "weekly") && timeInputs.length === 0
      ? "quantas vezes por dia"
      : null,
    (frequency === "daily" || frequency === "weekly") && timeInputs.length > 0 && !areTimesComplete
      ? "os horários"
      : null,
    frequency === "interval" && intervalMinutes !== null && parsedFirstTime === null
      ? "o horário da primeira dose"
      : null,
    duration === null ? "por quanto tempo" : null,
    duration === "fixed" && !duracaoCompleta ? "a duração do tratamento" : null,
  ].filter((pendencia): pendencia is string => pendencia !== null);

  /** O tratamento com prazo, dito em doses. Ver `summarizeTreatment` pra por que em doses. */
  const resumoDoTratamento = useMemo(
    () =>
      schedule === null
        ? null
        : summarizeTreatment({ id: "", schedule, startDate, endDate }, new Date()),
    [schedule, startDate, endDate],
  );

  const prazoSemDose =
    endDate !== null && frequency !== "asNeeded" && isScheduleComplete && resumoDoTratamento === null;

  /**
   * Só compara quando as unidades batem. Gota se toma em gota e se guarda em ml, e converter
   * exigiria a concentração do frasco — que o app não tem e não deve chutar num aviso sobre
   * remédio acabar.
   */
  const parsedStock = Number(stockQuantity.replace(",", "."));
  const dosesQueOEstoqueCobre =
    tracksStock && stockUnit === doseUnit && parsedStock > 0 && parsedDoseAmount > 0
      ? Math.floor(parsedStock / parsedDoseAmount)
      : null;
  const estoqueInsuficiente =
    resumoDoTratamento !== null &&
    dosesQueOEstoqueCobre !== null &&
    dosesQueOEstoqueCobre < resumoDoTratamento.totalDoses;

  /** Só o que foi preenchido — linha com "—" é ruído, e o popup é quem cobra o que falta. */
  const linhasDoEstoque = [
    stockQuantity.trim().length > 0 && stockUnit !== null
      ? { rotulo: "QUANTIDADE", valor: `${stockQuantity} ${UNIT_NOUNS[stockUnit]}` }
      : null,
    storageLocation.trim().length > 0
      ? { rotulo: "LOCAL", valor: storageLocation.trim() }
      : null,
    wantsLowStockAlert && leadDays !== null
      ? { rotulo: "AVISO", valor: `${leadDays} dias antes de acabar` }
      : null,
  ].filter((linha): linha is { rotulo: string; valor: string } => linha !== null);

  function toggleWeekday(weekday: Weekday) {
    setWeekdays((current) =>
      current.includes(weekday)
        ? current.filter((day) => day !== weekday)
        : [...current, weekday].sort(),
    );
  }

  function handleStockDisable() {
    setTracksStock(false);
    setStockSheetOpen(false);
    setStockQuantity("");
    setStorageLocation("");
    setWantsLowStockAlert(false);
    setLeadDays(null);
  }

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

  function handleSubmit() {
    // Os três `null` são impossíveis com `canSubmit` verdadeiro; o teste está aqui pro
    // compilador, e pra que uma mudança futura em `essencialCompleto` quebre alto e não calado.
    if (!canSubmit || form === null || doseUnit === null || schedule === null) return;
    onSubmit({
      name: name.trim(),
      activeIngredient: activeIngredient.trim(),
      form,
      // A tarja não é perguntada: quem cadastra à mão não tem como saber, e o que ela comandaria
      // (mostrar campos de receita) já é decidido pelo paciente anexar ou não a receita. Continua
      // no domínio esperando a CMED preencher (bloco B1).
      prescriptionRequirement: initialValue?.prescriptionRequirement ?? "none",
      doseAmount: parsedDoseAmount,
      doseUnit,
      schedule,
      startDate,
      endDate,
      photoUri,
      // Não configurado grava "none": o app não decide sozinho que vai te acordar.
      reminderMode: frequency === "asNeeded" || reminderMode === null ? "none" : reminderMode,
      notes: notes.trim().length > 0 ? notes.trim() : null,
      stockQuantity:
        tracksStock && Number.isFinite(parsedStock) && parsedStock > 0 ? parsedStock : null,
      stockUnit: stockUnitForMedicationForm(form, doseUnit),
      // Alerta sem antecedência escolhida não dispara nunca — então não fica "ligado" mentindo.
      lowStockAlertEnabled: tracksStock && wantsLowStockAlert && leadDays !== null,
      lowStockAlertLeadDays:
        tracksStock && wantsLowStockAlert && leadDays !== null ? Number(leadDays) : null,
      storageLocation:
        tracksStock && storageLocation.trim().length > 0 ? storageLocation.trim() : null,
      attachmentUri,
      attachmentValidUntil: attachmentUri === null ? null : validUntilIso,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header
        title={initialValue === undefined ? "Nova medicação" : "Editar medicação"}
        onBack={onBack}
      />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}>
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>O ESSENCIAL</Text>
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
            label="COMO VOCÊ TOMA?"
            value={form}
            options={FORM_OPTIONS}
            onChange={semLimpar(handleFormChange)}
          />

          {/* Sem seletor de unidade, o rótulo carrega a unidade e a pergunta vira uma frase só:
              "quantos comprimidos de cada vez". Dois campos lado a lado, um deles pedindo algo
              que a forma já respondeu, era o que fazia a dose parecer duas perguntas. */}
          {/* Só depois da forma: sem ela o app não sabe se a pergunta é "quantos comprimidos" ou
              "quantos ml", e perguntar a quantidade de uma unidade indefinida não significa nada. */}
          {showsUnitChoice ? (
            <View style={styles.doseRow}>
              <TextField
                label="QUANTO DE CADA VEZ"
                required
                containerStyle={styles.doseAmountField}
                placeholder="Ex: 10"
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
          ) : doseUnit !== null ? (
            <TextField
              label={`QUANTOS ${UNIT_NOUNS[doseUnit].toUpperCase()} DE CADA VEZ`}
              required
              placeholder="Ex: 1"
              value={doseAmount}
              onChangeText={setDoseAmount}
              onFocus={scrollToFocusedInput}
              keyboardType="decimal-pad"
              maxLength={8}
              error={hasDoseAmountError ? "Informe um número maior que zero." : undefined}
            />
          ) : null}

          <OptionGroup
            label="COM QUE FREQUÊNCIA?"
            layout="grade"
            value={frequency}
            options={FREQUENCY_OPTIONS}
            onChange={handleFrequencyChange}
          />

          {frequency === "weekly" ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>EM QUAIS DIAS?</Text>
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
          ) : null}

          {frequency === "daily" || frequency === "weekly" ? (
            <>
              <OptionGroup
                label={frequency === "daily" ? "QUANTAS VEZES POR DIA?" : "QUANTAS VEZES NO DIA?"}
                value={isCustomDoses ? null : String(timeInputs.length)}
                options={DOSES_PER_DAY_OPTIONS}
                onChange={handleDosesPerDayChange}
                trailing={
                  <TextInput
                    style={[styles.dosesInput, isCustomDoses && styles.dosesInputAtivo]}
                    value={customDosesInput}
                    onChangeText={handleCustomDosesChange}
                    onFocus={scrollToFocusedInput}
                    placeholder="Mais"
                    placeholderTextColor={withOpacity(colors.outline, 0.8)}
                    keyboardType="number-pad"
                    maxLength={2}
                    accessibilityLabel="Outra quantidade de doses por dia"
                  />
                }
              />
              {customDosesError ? (
                <Text style={styles.fieldErrorText}>{customDosesError}</Text>
              ) : null}
              {/* Sem quantidade escolhida não há quantos campos abrir — a pergunta ainda não existe. */}
              {timeInputs.length > 0 ? (
                <SeletorDeHorarios
                  label="EM QUE HORÁRIOS?"
                  values={timeInputs}
                  onChange={setTimeInputs}
                  duplicateIndexes={duplicateTimeIndexes}
                />
              ) : null}
            </>
          ) : null}

          {frequency === "interval" ? (
            <>
              <SelectField
                label="DE QUANTO EM QUANTO TEMPO?"
                value={intervalMinutes}
                options={INTERVAL_OPTIONS}
                onChange={semLimpar((minutes: string) => setIntervalMinutes(minutes))}
              />
              {intervalMinutes !== null ? (
                <>
                  <SeletorDeHorarios
                    label="PRIMEIRA DOSE DO DIA"
                    values={[firstTimeInput]}
                    onChange={(values) => setFirstTimeInput(values[0])}
                  />
                  <Text style={styles.sectionHintDestaque}>
                    As doses seguintes saem daí, somando o intervalo.
                  </Text>
                </>
              ) : null}
            </>
          ) : null}

          {frequency === "asNeeded" ? (
            <Text style={styles.sectionHint}>
              Nenhum horário será agendado. Você registra a dose quando tomar.
            </Text>
          ) : null}

          <OptionGroup
            label="POR QUANTO TEMPO?"
            value={duration}
            options={DURATION_OPTIONS}
            onChange={setDuration}
          />

          {/* Número + unidade porque "por 90 dias" não é como ninguém pensa um tratamento de
              três meses. Mês não tem tamanho fixo, então a conta é feita em meses de verdade e
              não convertida pra dias na entrada. */}
          {duration === "fixed" ? (
            <View style={styles.fieldGroup}>
              <TextField
                label="QUANTO TEMPO DURA"
                placeholder="Ex: 7"
                value={durationAmount}
                onChangeText={setDurationAmount}
                onFocus={scrollToFocusedInput}
                keyboardType="number-pad"
                maxLength={3}
                error={hasDurationError ? "Informe um número inteiro." : undefined}
              />
              <OptionGroup
                value={durationUnit}
                options={DURATION_UNIT_OPTIONS}
                onChange={setDurationUnit}
              />
            </View>
          ) : null}
          {/* Diz a primeira dose, e não só a data final: "por 2 dias" começando hoje termina
              amanhã, o que só faz sentido depois de ver que hoje conta — e conta parcialmente,
              porque as doses de hoje que já passaram não entram. */}
          {resumoDoTratamento !== null ? (
            <Text style={styles.sectionHint}>
              {resumoDoTratamento.firstDay === todayIsoDate()
                ? "Da próxima dose de hoje"
                : `De ${toDateInput(resumoDoTratamento.firstDay)}`}{" "}
              até {toDateInput(resumoDoTratamento.lastDay)} —{" "}
              {resumoDoTratamento.totalDoses === 1
                ? "1 dose"
                : `${resumoDoTratamento.totalDoses} doses`}
              .
            </Text>
          ) : null}

          {/* "Por 1 dia" cadastrado depois do último horário do dia não alcança dose nenhuma.
              Sem isso a linha de resumo simplesmente não aparecia, e o silêncio lê como acerto. */}
          {prazoSemDose ? (
            <Text style={styles.avisoDeConflito}>
              Nesse prazo não sobra nenhuma dose — os horários de hoje já passaram. Aumente os
              dias ou revise os horários.
            </Text>
          ) : null}
        </Card>

        {essencialCompleto ? (
          <>
            <View style={styles.revelacao}>
              <Text style={styles.revelacaoTitulo}>Seu medicamento já pode ser cadastrado!</Text>
              <Text style={styles.revelacaoHint}>
                O que vem abaixo é opcional e serve pra você ter mais controle: saber quando o
                estoque está acabando, guardar a receita à mão e ser lembrado na hora certa.
              </Text>
            </View>

            <Card>
              <Text style={styles.sectionTitle}>ESTOQUE</Text>
              {tracksStock ? (
                <>
                  <Pressable
                    style={styles.rowValue}
                    onPress={() => setStockSheetOpen(true)}
                    accessibilityRole="button">
                    <Text style={styles.rowValueText}>
                      {linhasDoEstoque.length > 0 ? "Controle ativo" : "Nada preenchido ainda"}
                    </Text>
                    <Text style={styles.rowValueAction}>Editar</Text>
                  </Pressable>
                  {linhasDoEstoque.length > 0 ? (
                    <View style={styles.resumoBloco}>
                      {linhasDoEstoque.map((linha) => (
                        <View key={linha.rotulo} style={styles.resumoLinha}>
                          <Text style={styles.resumoRotulo}>{linha.rotulo}</Text>
                          <Text style={styles.resumoValor}>{linha.valor}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {/* Aviso, não bloqueio: comprar no meio do tratamento é normal, e o app não
                      tem como saber o que já está a caminho da farmácia. */}
                  {estoqueInsuficiente ? (
                    <Text style={styles.avisoDeConflito}>
                      O tratamento pede {resumoDoTratamento?.totalDoses} doses e o que você tem dá
                      pra {dosesQueOEstoqueCobre}. Vale comprar antes de acabar.
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  <Text style={styles.sectionHint}>
                    O Mapill desconta cada dose tomada e avisa antes de acabar, pra você comprar
                    sem interromper o tratamento.
                  </Text>
                  <Button
                    label="Controlar meu estoque"
                    onPress={() => {
                      setTracksStock(true);
                      setStockSheetOpen(true);
                    }}
                  />
                </>
              )}
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>ANEXOS</Text>

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
                    <MaterialCommunityIcons
                      name="camera-plus"
                      size={24}
                      color={colors.onSurfaceVariant}
                    />
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
                      {attachmentUri ? "Trocar foto da receita" : "Anexar receita"}
                    </Text>
                  </Pressable>
                  <Text style={styles.photoHint}>Fica só no aparelho, não sobe pra nuvem.</Text>
                </View>
              </View>

              {/* Validade só depois do anexo: sem receita guardada, não há o que vencer. */}
              {attachmentUri !== null ? (
                <TextField
                  label="RECEITA VÁLIDA ATÉ"
                  placeholder="DD/MM/AAAA"
                  value={validUntilInput}
                  onChangeText={(value) =>
                    setValidUntilInput(formatDateInput(value, validUntilInput))
                  }
                  onFocus={scrollToFocusedInput}
                  keyboardType="number-pad"
                  maxLength={10}
                  error={validUntilError}
                />
              ) : null}
            </Card>

            {frequency !== "asNeeded" ? (
              <Card>
                <Text style={styles.sectionTitle}>LEMBRETE</Text>
                {reminderMode !== null ? (
                  <Pressable
                    style={styles.rowValue}
                    onPress={() => setReminderSheetOpen(true)}
                    accessibilityRole="button">
                    <Text style={styles.rowValueText}>{REMINDER_LABELS[reminderMode]}</Text>
                    <Text style={styles.rowValueAction}>Editar</Text>
                  </Pressable>
                ) : (
                  <>
                    <Text style={styles.sectionHint}>
                      O Mapill pode te procurar na hora da dose, com notificação ou com alarme de
                      despertador — você escolhe o quanto ele insiste.
                    </Text>
                    <Button
                      label="Configurar lembrete"
                      onPress={() => setReminderSheetOpen(true)}
                    />
                  </>
                )}
              </Card>
            ) : null}

            <Card>
              <Text style={styles.sectionTitle}>COMPLEMENTO</Text>
              <TextField
                label="PRINCÍPIO ATIVO"
                placeholder="Ex: Losartana potássica"
                value={activeIngredient}
                onChangeText={setActiveIngredient}
                onFocus={scrollToFocusedInput}
                maxLength={120}
              />
              <TextField
                label="OBSERVAÇÕES"
                placeholder="Ex: tomar em jejum"
                value={notes}
                onChangeText={setNotes}
                onFocus={scrollToFocusedInput}
                multiline
                maxLength={500}
              />
            </Card>
          </>
        ) : null}
      </KeyboardAwareScrollView>

      <SafeAreaView style={styles.footer} edges={["bottom"]}>
        <Button
          label={initialValue === undefined ? "Salvar medicação" : "Salvar alterações"}
          onPress={handleSubmit}
          disabled={!canSubmit}
        />
        {pendencias.length > 0 ? (
          <Text style={styles.submitHint}>Falta preencher {emLista(pendencias)}.</Text>
        ) : null}
      </SafeAreaView>

      <ConfiguracaoDeEstoque
        visible={isStockSheetOpen}
        onClose={() => setStockSheetOpen(false)}
        onDisable={handleStockDisable}
        unitNoun={stockUnit === null ? "unidades" : UNIT_NOUNS[stockUnit]}
        quantity={stockQuantity}
        onQuantityChange={setStockQuantity}
        alertEnabled={wantsLowStockAlert}
        onAlertEnabledChange={setWantsLowStockAlert}
        leadDays={leadDays}
        onLeadDaysChange={setLeadDays}
        storageLocation={storageLocation}
        onStorageLocationChange={setStorageLocation}
      />

      <ConfiguracaoDeLembrete
        visible={isReminderSheetOpen}
        value={reminderMode}
        onChange={setReminderMode}
        onClose={() => setReminderSheetOpen(false)}
      />
    </SafeAreaView>
  );
}
