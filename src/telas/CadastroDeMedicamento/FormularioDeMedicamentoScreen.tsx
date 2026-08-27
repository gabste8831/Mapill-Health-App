import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type {
  MedicationForm,
  PosologyUnit,
  PrescriptionRequirement,
} from "@/domain/entities/medication";
import {
  allowsFractionalDose,
  defaultUnitForMedicationForm,
  needsUnitChoice,
  stockUnitForMedicationForm,
  unitsForMedicationForm,
} from "@/domain/entities/medication";
import type {
  IntakeInstruction,
  PosologySchedule,
  PrescriptionAttachmentKind,
  ReminderMode,
  TimeOfDay,
  Weekday,
} from "@/domain/entities/prescription";
import {
  COMMON_DOSES_PER_DAY,
  dosesOfSchedule,
  INTAKE_INSTRUCTIONS,
  MAX_DOSES_PER_DAY,
} from "@/domain/entities/prescription";
import { doseFaltanteDoPrazo } from "@/domain/use-cases/dose-faltante-do-prazo";
import { dosesDeHojeJaPassadas } from "@/domain/use-cases/doses-de-hoje-ja-passadas";
import { estimateStockDepletion } from "@/domain/use-cases/estimate-stock-depletion";
import { summarizeTreatment } from "@/domain/use-cases/summarize-treatment";
import { ACCEPTED_DOCUMENT_LABEL, useDocumentPicker } from "@/hooks/use-document-picker";
import { usePhotoPicker } from "@/hooks/use-photo-picker";
import { useScrollToFocusedInput } from "@/hooks/use-scroll-to-focused-input";
import {
  cycleTurningPoints,
  formatDateInput,
  lastDayOfTreatment,
  parseDateInput,
  toDateInput,
  todayIsoDate,
  treatmentDuration,
  type DurationUnit,
} from "@/shared/date-input";
import {
  formatDecimalInput,
  formatIntegerInput,
  parseDecimalInput,
} from "@/shared/number-input";
import { deletePersistedFile } from "@/shared/persist-picked-file";
import { MEDICATION_FORM_LABELS, UNIT_LABELS } from "@/shared/rotulos-de-medicamento";
import { colors, withOpacity } from "@/shared/theme";
import { parseTimeInput } from "@/shared/time-input";
import {
  Button,
  Card,
  Checkbox,
  Dica,
  FotoLocal,
  Header,
  KeyboardAwareScrollView,
  OptionGroup,
  SelectField,
  TextField,
  ToggleChips,
  type OptionGroupOption,
  type SelectOption,
  type ToggleChipOption,
} from "@/ui";
import { styles } from "./CadastroDeMedicamento.styles";
import { ConfiguracaoDeEstoque } from "./ConfiguracaoDeEstoque";
import { ConfiguracaoDeLembrete } from "./ConfiguracaoDeLembrete";
import { entradasVazias, SeletorDeHorarios, type EntradaDeDose } from "./SeletorDeHorarios";

/** A ordem em que as formas aparecem: da mais comum pra menos, com "Outra" no fim. */
const FORM_OPTIONS: SelectOption<MedicationForm>[] = (
  Object.keys(MEDICATION_FORM_LABELS) as MedicationForm[]
).map((form) => ({ value: form, label: MEDICATION_FORM_LABELS[form] }));

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

/** Gênero do substantivo acima — sem isso a pergunta sai "quantos gotas". */
const UNIDADES_FEMININAS: readonly PosologyUnit[] = ["capsule", "drop", "IU", "application"];

function quantosDe(unit: PosologyUnit): string {
  return UNIDADES_FEMININAS.includes(unit) ? "QUANTAS" : "QUANTOS";
}

/**
 * Onde ler a unidade no próprio remédio. Não é orientação de dose — é dizer onde está escrito,
 * pra quem tem a caneta ou o frasco na mão copiar em vez de adivinhar.
 */
const DICA_DA_UNIDADE: Partial<Record<MedicationForm, string>> = {
  injection: "Caneta de insulina marca em UI; ampola e seringa costumam vir em ml.",
  liquid: "O copinho ou a seringa que vem na caixa marcam em ml.",
};

type FrequencyKind = PosologySchedule["kind"];

const FREQUENCY_OPTIONS: OptionGroupOption<FrequencyKind>[] = [
  { value: "daily", label: "Todo dia" },
  { value: "weekly", label: "Dias da semana" },
  { value: "cycle", label: "A cada X dias" },
  { value: "asNeeded", label: "Só quando precisar" },
];


/** De onde o ciclo conta. Perguntar isso é o que impede a pausa de cair no dia errado. */
type CycleStartKind = "today" | "earlier";

/**
 * "Hoje" só serve quando o tratamento começa hoje. Marcado para começar adiante, a primeira opção
 * passa a ser o dia do início — dizer "hoje" ali descreveria um ciclo que ainda nem existe.
 */
function opcoesDeInicioDoCiclo(comecaDepoisDeHoje: boolean): OptionGroupOption<CycleStartKind>[] {
  return [
    { value: "today", label: comecaDepoisDeHoje ? "Começa junto com o tratamento" : "Começa hoje" },
    { value: "earlier", label: "Já comecei antes" },
  ];
}

type DurationKind = "continuous" | "fixed";

const DURATION_OPTIONS: OptionGroupOption<DurationKind>[] = [
  { value: "continuous", label: "Uso contínuo" },
  { value: "fixed", label: "Tem prazo" },
];

/**
 * "Uso contínuo" descreve quem toma todo dia sem previsão de parar. Não descreve o Dorflex que
 * mora na mochila — esse não é contínuo, é permanente e sem agenda. Mesma pergunta, palavra que
 * corresponde ao caso.
 */
const DURATION_OPTIONS_SEM_AGENDA: OptionGroupOption<DurationKind>[] = [
  { value: "continuous", label: "Sempre disponível" },
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

const INTAKE_INSTRUCTION_LABELS: Record<IntakeInstruction, string> = {
  fasting: "Em jejum",
  withMeal: "Junto da refeição",
  afterMeal: "Depois de comer",
  plentyOfWater: "Com bastante água",
  stayUpright: "Não deitar depois",
  avoidAlcohol: "Evitar álcool",
};

/**
 * A ficha que abre o campo livre. Fica na mesma fileira das outras porque, pra quem está
 * escolhendo, "outra" é mais uma resposta possível — separá-la num campo sempre visível fazia a
 * seção parecer que cobrava um texto de todo mundo.
 */
const OUTRA_ORIENTACAO = "other";
type OrientacaoChip = IntakeInstruction | typeof OUTRA_ORIENTACAO;

const INTAKE_INSTRUCTION_OPTIONS: ToggleChipOption<OrientacaoChip>[] = [
  ...INTAKE_INSTRUCTIONS.map((instruction) => ({
    value: instruction as OrientacaoChip,
    label: INTAKE_INSTRUCTION_LABELS[instruction],
  })),
  { value: OUTRA_ORIENTACAO, label: "Outra orientação" },
];

/**
 * Conseguir consulta e passar na farmácia leva tempo — por isso a menor opção é uma semana, e
 * não um dia. Antecedência que não dá pra agir com ela é só um susto.
 */
const RENEWAL_LEAD_OPTIONS: OptionGroupOption<string>[] = [
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
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
  intakeInstructions: IntakeInstruction[];
  intakeNote: string | null;
  notes: string | null;
  stockQuantity: number | null;
  /** Nem sempre igual a `doseUnit`: gota se toma em gota mas se compra em ml. */
  stockUnit: PosologyUnit;
  lowStockAlertEnabled: boolean;
  lowStockAlertLeadDays: number | null;
  storageLocation: string | null;
  attachmentUri: string | null;
  attachmentKind: PrescriptionAttachmentKind | null;
  attachmentValidUntil: string | null;
  renewalReminderLeadDays: number | null;
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

/** ISO `YYYY-MM-DD` menos N dias, também em ISO. */
function diasAntes(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const alvo = new Date(year, month - 1, day - days);
  const p = (value: number) => String(value).padStart(2, "0");
  return `${alvo.getFullYear()}-${p(alvo.getMonth() + 1)}-${p(alvo.getDate())}`;
}

/** Frequências que agendam horários fixos ao longo do dia — as que pedem a lista de horários. */
function temHorariosFixos(frequency: FrequencyKind | null): boolean {
  return frequency !== null && frequency !== "asNeeded";
}

/** "o nome, a dose e os horários" — lista em português, com "e" antes do último. */
function emLista(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

/** Índices que repetem um horário já usado antes na lista. */
function indicesDuplicados(doses: EntradaDeDose[]): number[] {
  const vistos = new Set<string>();
  const repetidos: number[] = [];
  doses.forEach((dose, index) => {
    if (parseTimeInput(dose.at) === null) return;
    if (vistos.has(dose.at)) repetidos.push(index);
    vistos.add(dose.at);
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
  const router = useRouter();
  const { scrollViewRef, scrollToFocusedInput, onScroll } = useScrollToFocusedInput();
  const boxPhoto = usePhotoPicker("medicamento-caixa");
  const prescriptionPhoto = usePhotoPicker("medicamento-receita");
  const prescriptionFile = useDocumentPicker("medicamento-receita");

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
  const initialDoses = initialSchedule === undefined ? [] : dosesOfSchedule(initialSchedule);
  const [frequency, setFrequency] = useState<FrequencyKind | null>(initialSchedule?.kind ?? null);
  const [doseInputs, setDoseInputs] = useState<EntradaDeDose[]>(() =>
    initialDoses.map((dose) => ({
      at: dose.at,
      amount: dose.amount === null ? "" : String(dose.amount),
    })),
  );
  // Reaberto já ligado se algum horário tem dose própria — senão os números gravados sumiriam
  // da tela enquanto continuariam valendo no agendamento.
  const [dosesVariam, setDosesVariam] = useState(() =>
    initialDoses.some((dose) => dose.amount !== null),
  );
  const [weekdays, setWeekdays] = useState<Weekday[]>(
    initialSchedule?.kind === "weekly" ? initialSchedule.weekdays : [],
  );
  const [cycleLengthInput, setCycleLengthInput] = useState(
    initialSchedule?.kind === "cycle" ? String(initialSchedule.cycleLengthDays) : "",
  );
  const [activeDaysInput, setActiveDaysInput] = useState(
    initialSchedule?.kind === "cycle" ? String(initialSchedule.activeDays) : "",
  );
  // Onde o ciclo atual começou. `null` = ainda não respondido; "hoje" é resposta, não padrão.
  const [cycleStart, setCycleStart] = useState<CycleStartKind | null>(
    initialSchedule?.kind !== "cycle"
      ? null
      : initialSchedule.cycleStartDate === todayIsoDate()
        ? "today"
        : "earlier",
  );
  const [cycleStartInput, setCycleStartInput] = useState(
    initialSchedule?.kind === "cycle" ? toDateInput(initialSchedule.cycleStartDate) : "",
  );
  const [customDosesInput, setCustomDosesInput] = useState(() =>
    initialDoses.length > COMMON_DOSES_PER_DAY ? String(initialDoses.length) : "",
  );

  /**
   * Quando o tratamento começa. Vale hoje, que é o dia em que se está cadastrando — mas a data
   * fica **dita na tela**, com um atalho pra alterar. Antes ela era fixa e invisível, e quem
   * cadastrava a cartela que só começa domingo, ou o antibiótico que vai comprar amanhã, saía com
   * a data errada sem nada denunciar: os horários nasciam a partir de hoje e o prazo terminava
   * cedo demais.
   *
   * Diferente do resto do formulário, aqui "hoje" pode vir preenchido. A regra de não trazer nada
   * de fábrica existe pra impedir o app de **inventar posologia** — e o dia de hoje não é
   * invenção, é o único fato que ele realmente sabe. Cobrar um toque de todo mundo por um caso
   * raro seria pagar caro pela coerência.
   */
  const [startDateInput, setStartDateInput] = useState(() =>
    toDateInput(initialValue?.startDate ?? todayIsoDate()),
  );
  const [alteraInicio, setAlteraInicio] = useState(
    () => (initialValue?.startDate ?? todayIsoDate()) !== todayIsoDate(),
  );
  const inicioEscolhido = alteraInicio ? parseDateInput(startDateInput) : todayIsoDate();
  /**
   * Data pela metade não pode virar "hoje" por omissão: o cadastro sairia com um início que
   * ninguém escreveu. Enquanto ela não fecha, o botão fica travado e o rodapé diz o que falta.
   */
  const inicioIncompleto = inicioEscolhido === null;
  const startDateError =
    alteraInicio && startDateInput.length === 10 && inicioEscolhido === null
      ? "Data inválida."
      : undefined;
  const startDate = inicioEscolhido ?? todayIsoDate();
  const comecaDepoisDeHoje = startDate > todayIsoDate();
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
  const [attachmentKind, setAttachmentKind] = useState<PrescriptionAttachmentKind | null>(
    initialValue?.attachmentKind ?? null,
  );
  const [attachmentName, setAttachmentName] = useState("");
  const [wantsRenewalReminder, setWantsRenewalReminder] = useState(
    initialValue?.renewalReminderLeadDays != null,
  );
  const [renewalLeadDays, setRenewalLeadDays] = useState<string | null>(
    initialValue?.renewalReminderLeadDays == null
      ? null
      : String(initialValue.renewalReminderLeadDays),
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
  const [intakeInstructions, setIntakeInstructions] = useState<IntakeInstruction[]>(
    initialValue?.intakeInstructions ?? [],
  );
  const [intakeNote, setIntakeNote] = useState(initialValue?.intakeNote ?? "");
  const [mostraOutraOrientacao, setMostraOutraOrientacao] = useState(
    (initialValue?.intakeNote ?? "").length > 0,
  );

  /**
   * A ficha "outra orientação" não é um valor do domínio: ela só abre o campo. Desmarcar apaga o
   * texto junto, senão a anotação seguiria valendo escondida.
   */
  function handleOrientacoesChange(values: OrientacaoChip[]) {
    const querOutra = values.includes(OUTRA_ORIENTACAO);
    setMostraOutraOrientacao(querOutra);
    if (!querOutra) setIntakeNote("");
    setIntakeInstructions(values.filter((v): v is IntakeInstruction => v !== OUTRA_ORIENTACAO));
  }
  const [notes, setNotes] = useState(initialValue?.notes ?? "");

  const showsUnitChoice = form !== null && needsUnitChoice(form);
  const unitOptions: OptionGroupOption<PosologyUnit>[] = useMemo(
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
    setDoseInputs(entradasVazias(Number(value)));
  }

  /** Trocar de frequência zera o que era da anterior, senão sobra horário de outra posologia. */
  function handleFrequencyChange(nextFrequency: FrequencyKind) {
    setFrequency(nextFrequency);
    setDoseInputs([]);
    setDosesVariam(false);
    setCustomDosesInput("");
    setWeekdays([]);
    setCycleLengthInput("");
    setActiveDaysInput("");
    setCycleStart(null);
    setCycleStartInput("");
  }

  function handleCustomDosesChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setCustomDosesInput(digits);
    const doses = Number(digits);
    if (doses >= 1 && doses <= MAX_DOSES_PER_DAY) setDoseInputs(entradasVazias(doses));
  }

  function apenasDigitos(raw: string, setter: (value: string) => void) {
    setter(formatIntegerInput(raw, 3));
  }

  /**
   * Quando cada horário tem a sua dose, o número de cima deixa de ser usado. Ele continua na
   * tela porque é ele que volta a valer se a variação for desmarcada, e é dele que a conta de
   * estoque parte enquanto a lista de horários não existe. O que muda é a tela **dizer isso**,
   * em vez de deixar dois números se contradizendo em silêncio.
   */
  const todosHorariosComDose =
    dosesVariam &&
    doseInputs.length > 0 &&
    doseInputs.every((dose) => dose.amount.trim().length > 0);

  /** Fração só onde ela existe: meio comprimido sim, meia gota não. */
  const doseAceitaFracao = doseUnit !== null && allowsFractionalDose(doseUnit);

  function handleDoseAmountChange(raw: string) {
    setDoseAmount(doseAceitaFracao ? formatDecimalInput(raw) : formatIntegerInput(raw));
  }

  const isCustomDoses = customDosesInput.length > 0;
  const parsedCustomDoses = Number(customDosesInput);
  const customDosesError =
    isCustomDoses && (parsedCustomDoses < 1 || parsedCustomDoses > MAX_DOSES_PER_DAY)
      ? `Entre 1 e ${MAX_DOSES_PER_DAY} vezes por dia — de duas em duas horas já é o limite do que se cumpre acordado.`
      : undefined;

  const parsedDoseAmount = parseDecimalInput(doseAmount);
  const hasDoseAmountError =
    doseAmount.length > 0 && (!Number.isFinite(parsedDoseAmount) || parsedDoseAmount <= 0);

  const duplicateTimeIndexes = indicesDuplicados(doseInputs);
  const parsedTimes = doseInputs.map((dose) => parseTimeInput(dose.at));
  const areTimesComplete =
    parsedTimes.every((time): time is TimeOfDay => time !== null) &&
    duplicateTimeIndexes.length === 0;

  const parsedCycleLength = Number(cycleLengthInput);
  // Ciclo de um dia é "todo dia", que já tem opção própria — daí o mínimo de 2.
  const cycleLengthDefinido = parsedCycleLength >= 2;
  // Um dia seguido é o caso comum ("de 30 em 30 dias"), mas continua sendo resposta e não padrão:
  // o campo só some quando não há o que perguntar, e aí a resposta é 1 por construção.
  const parsedActiveDays = activeDaysInput.length === 0 ? 1 : Number(activeDaysInput);
  const activeDaysError =
    cycleLengthDefinido && activeDaysInput.length > 0 &&
    (parsedActiveDays < 1 || parsedActiveDays >= parsedCycleLength)
      ? `Entre 1 e ${parsedCycleLength - 1}. Tomar todos os dias do ciclo é "todo dia".`
      : undefined;

  // Memoizado porque o `schedule` depende dele, e o `schedule` alimenta a geração de doses —
  // recriar a data a cada tecla faria o tratamento inteiro ser regerado sem nada ter mudado.
  const cycleStartIso = useMemo(
    () =>
      cycleStart === "today"
        ? startDate
        : cycleStart === "earlier"
          ? parseDateInput(cycleStartInput)
          : null,
    [cycleStart, cycleStartInput, startDate],
  );
  const cycleStartError =
    cycleStart === "earlier" && cycleStartInput.length === 10 && cycleStartIso === null
      ? "Data inválida."
      : cycleStartIso !== null && cycleStartIso > startDate
        ? "O ciclo não pode começar depois do início do tratamento."
        : undefined;

  // Sem saber onde o ciclo começou, o app agendaria a pausa no lugar errado — então isto é
  // bloqueio, e não aviso. Mesma severidade dos horários: erra em silêncio se passar.
  const cicloCompleto =
    cycleLengthDefinido &&
    activeDaysError === undefined &&
    cycleStartIso !== null &&
    cycleStartError === undefined;
  const viradasDoCiclo = cicloCompleto
    ? cycleTurningPoints(startDate, cycleStartIso, parsedCycleLength, parsedActiveDays)
    : null;

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
  /**
   * Receita vencida é recusada, e não só sinalizada. Aceitar traz dois problemas de uma vez: o
   * aviso de renovação seria agendado para uma data que já passou (nunca dispara), e a pessoa sai
   * da tela achando que está coberta por um documento que não vale mais. Quem já perdeu a
   * validade precisa renovar, não registrar.
   */
  const receitaVencida = validUntilIso !== null && validUntilIso < todayIsoDate();
  const validUntilError =
    validUntilInput.length === 10 && validUntilIso === null
      ? "Data inválida."
      : receitaVencida
        ? "Essa receita já venceu. Anexe uma receita dentro da validade."
        : undefined;

  /**
   * A data em que o aviso chega, e não "15 dias antes". O número sozinho não deixa ninguém
   * conferir se dá tempo de conseguir consulta — a data deixa.
   */
  const avisoDeRenovacao = (() => {
    if (validUntilIso === null || receitaVencida || !wantsRenewalReminder) return null;
    if (renewalLeadDays === null) return null;

    const chegaEm = diasAntes(validUntilIso, Number(renewalLeadDays));
    // Antecedência que cai antes de hoje é aviso que já passou: prometer a data seria mentira, e
    // o silêncio da versão anterior fazia a pessoa contar com um lembrete que nunca viria.
    return chegaEm < todayIsoDate()
      ? `Com ${renewalLeadDays} dias de antecedência o aviso já teria passado. Escolha um prazo menor para ser avisado a tempo.`
      : `Você será avisado em ${toDateInput(chegaEm)}, com ${renewalLeadDays} dias pra renovar.`;
  })();

  /** `null` enquanto a frequência não foi escolhida — não existe posologia padrão. */
  const schedule = useMemo<PosologySchedule | null>(() => {
    if (frequency === null) return null;
    if (frequency === "asNeeded") return { kind: "asNeeded" };

    /**
     * A dose por horário só é gravada quando a variação está ligada — desmarcar tem que apagar
     * de fato, senão o número continuaria valendo no agendamento sem aparecer em lugar nenhum.
     */
    const doses = [...doseInputs]
      .sort((a, b) => a.at.localeCompare(b.at))
      .map((dose) => ({
        at: dose.at,
        amount:
          dosesVariam && dose.amount.trim().length > 0
            ? Number(dose.amount.replace(",", "."))
            : null,
      }));
    if (frequency === "weekly") return { kind: "weekly", weekdays, doses };
    if (frequency === "cycle") {
      if (cycleStartIso === null) return null;
      return {
        kind: "cycle",
        cycleLengthDays: parsedCycleLength,
        activeDays: parsedActiveDays,
        cycleStartDate: cycleStartIso,
        doses,
      };
    }
    return { kind: "daily", doses };
  }, [
    frequency,
    weekdays,
    doseInputs,
    dosesVariam,
    parsedCycleLength,
    parsedActiveDays,
    cycleStartIso,
  ]);

  // `doseInputs` vazio significa que a quantidade de doses ainda não foi escolhida, e `every`
  // de lista vazia é `true` — sem este teste, "nada respondido" passaria por completo.
  const horariosCompletos = doseInputs.length > 0 && areTimesComplete;
  const isScheduleComplete =
    frequency === "asNeeded" ||
    (frequency === "daily" && horariosCompletos) ||
    (frequency === "weekly" && horariosCompletos && weekdays.length > 0) ||
    (frequency === "cycle" && horariosCompletos && cicloCompleto);

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
    !inicioIncompleto &&
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
    frequency === "weekly" && weekdays.length === 0 ? "os dias da semana" : null,
    frequency === "cycle" && !cycleLengthDefinido ? "de quantos em quantos dias" : null,
    frequency === "cycle" && cycleLengthDefinido && !cicloCompleto
      ? "quando o ciclo começou"
      : null,
    temHorariosFixos(frequency) && doseInputs.length === 0 ? "quantas vezes por dia" : null,
    temHorariosFixos(frequency) && doseInputs.length > 0 && !areTimesComplete
      ? "os horários"
      : null,
    inicioIncompleto ? "a data de início" : null,
    duration === null ? "por quanto tempo" : null,
    duration === "fixed" && !duracaoCompleta ? "a duração do tratamento" : null,
  ].filter((pendencia): pendencia is string => pendencia !== null);

  /** O tratamento com prazo, dito em doses. Ver `summarizeTreatment` pra por que em doses. */
  const resumoDoTratamento = useMemo(
    () =>
      schedule === null || doseUnit === null
        ? null
        : summarizeTreatment(
            { id: "", schedule, startDate, endDate, doseAmount: parsedDoseAmount, doseUnit },
            new Date(),
          ),
    [schedule, startDate, endDate, parsedDoseAmount, doseUnit],
  );

  const prazoSemDose =
    endDate !== null && frequency !== "asNeeded" && isScheduleComplete && resumoDoTratamento === null;

  /**
   * Horários de hoje que o cadastro vai descartar por já terem passado. A regra é intencional
   * (dose vencida não vira compromisso), mas descartar calado faz a pessoa sair achando que
   * agendou o dia inteiro — daí o aviso.
   */
  /**
   * "3x ao dia por 7 dias" é uma prescrição de 21 doses; cadastrar às 15h entrega 19 e encerra na
   * mesma data. Em vitamina não muda nada, em antibiótico é ciclo interrompido. A tela mostra a
   * diferença e oferece estender — decidir sozinha sobrescreveria a data que a pessoa digitou.
   */
  const faltaDeDose = useMemo(
    () =>
      schedule === null || doseUnit === null || endDate === null || !isScheduleComplete
        ? null
        : doseFaltanteDoPrazo(
            { id: "", schedule, startDate, endDate, doseAmount: parsedDoseAmount, doseUnit },
            new Date(),
          ),
    [schedule, doseUnit, endDate, isScheduleComplete, startDate, parsedDoseAmount],
  );

  const horariosDeHojeDescartados = useMemo(
    () =>
      schedule === null || doseUnit === null || !isScheduleComplete
        ? []
        : dosesDeHojeJaPassadas(
            { id: "", schedule, startDate, endDate, doseAmount: parsedDoseAmount, doseUnit },
            new Date(),
          ),
    [schedule, doseUnit, isScheduleComplete, startDate, endDate, parsedDoseAmount],
  );

  /**
   * Só compara quando as unidades batem. Gota se toma em gota e se guarda em ml, e converter
   * exigiria a concentração do frasco — que o app não tem e não deve chutar num aviso sobre
   * remédio acabar.
   */
  const parsedStock = parseDecimalInput(stockQuantity);
  /**
   * Compara quantidade com quantidade, e não estoque com número de doses: com dose variando de
   * um horário para outro, "quantas doses o estoque cobre" deixou de ser uma divisão — 10 UI de
   * manhã e 8 à noite consomem 18 por dia, não 2 × a dose padrão.
   */
  const consumoDoTratamento =
    tracksStock && stockUnit === doseUnit ? (resumoDoTratamento?.totalAmount ?? null) : null;
  const estoqueInsuficiente =
    consumoDoTratamento !== null && parsedStock > 0 && parsedStock < consumoDoTratamento;

  /**
   * Quantos dias o que ele tem hoje ainda dá. Só faz sentido quando estoque e dose são contados
   * na mesma unidade: gota se toma em gota e se guarda em ml, e converter exigiria a
   * concentração do frasco, que o app não tem.
   */
  const esgotamento = useMemo(
    () =>
      schedule === null || stockUnit === null || doseUnit === null || !tracksStock
        ? null
        : estimateStockDepletion(
            { id: "", schedule, startDate, endDate, doseAmount: parsedDoseAmount, doseUnit },
            { amount: parsedStock, unit: stockUnit },
            new Date(),
          ),
    [schedule, startDate, endDate, parsedDoseAmount, parsedStock, stockUnit, doseUnit, tracksStock],
  );

  /**
   * Antecedência maior que a duração do estoque é aviso que já nasceu vencido: pedir "me avise 30
   * dias antes" com cinco dias de comprimido na gaveta significa que o momento de avisar já
   * passou. O app aceita mesmo assim, porque comprar mais é o que resolve e ninguém deve ser
   * impedido de configurar por causa do estoque de hoje. Mas cala seria pior: a pessoa sairia
   * achando que tem um mês de folga.
   */
  const avisoDeAntecedencia =
    esgotamento === null
      ? null
      : wantsLowStockAlert && leadDays !== null && Number(leadDays) >= esgotamento.daysRemaining
        ? `Seu estoque atual dura cerca de ${esgotamento.daysRemaining} ${esgotamento.daysRemaining === 1 ? "dia" : "dias"}, portanto um aviso de ${leadDays} dias de antecedência não é possível.`
        : `No ritmo desta posologia, seu estoque suporta até o dia ${toDateInput(esgotamento.lastDay)}, cerca de ${esgotamento.daysRemaining} ${esgotamento.daysRemaining === 1 ? "dia" : "dias"}.`;

  const antecedenciaConflita =
    esgotamento !== null && wantsLowStockAlert && leadDays !== null &&
    Number(leadDays) >= esgotamento.daysRemaining;

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

  async function pick(
    picker: ReturnType<typeof usePhotoPicker>,
    apply: (uri: string) => void,
    replacing: string | null,
  ) {
    const result = await picker.pickPhoto(replacing);
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

  function guardarFoto(uri: string) {
    setAttachmentUri(uri);
    setAttachmentKind("image");
    setAttachmentName("");
  }

  async function escolherArquivoDaReceita() {
    const result = await prescriptionFile.pickDocument(attachmentUri);
    if (result.status === "picked") {
      setAttachmentUri(result.uri);
      setAttachmentKind(result.isPdf ? "document" : "image");
      setAttachmentName(result.name);
      return;
    }
    if (result.reason === "cancelled") return;
    Alert.alert(
      "Não foi possível usar o arquivo",
      `Escolha um arquivo em ${ACCEPTED_DOCUMENT_LABEL}.`,
    );
  }

  /** Tirar a receita leva junto o que só existia por causa dela — validade e aviso. */
  function removerReceita() {
    deletePersistedFile(attachmentUri);
    setAttachmentUri(null);
    setAttachmentKind(null);
    setAttachmentName("");
    setValidUntilInput("");
    setWantsRenewalReminder(false);
    setRenewalLeadDays(null);
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
      intakeInstructions,
      intakeNote: intakeNote.trim().length > 0 ? intakeNote.trim() : null,
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
      attachmentKind: attachmentUri === null ? null : attachmentKind,
      attachmentValidUntil: attachmentUri === null ? null : validUntilIso,
      // Aviso sem validade não tem de quando contar, e sem antecedência escolhida não dispara —
      // nos dois casos gravar "ligado" seria mentir sobre um lembrete que nunca chega.
      renewalReminderLeadDays:
        attachmentUri !== null && validUntilIso !== null && wantsRenewalReminder &&
        renewalLeadDays !== null
          ? Number(renewalLeadDays)
          : null,
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
            label="NOME DA MEDICAÇÃO"
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

          {/* Nas formas ambíguas a unidade vem **antes** da quantidade, e não ao lado dela.
              "Quanto de cada vez" com uma caixa vazia chamada UNIDADE ao lado são duas perguntas
              fingindo ser uma — e a primeira não tem resposta enquanto a segunda está em branco.
              Respondida a unidade, a pergunta seguinte vira a mesma frase única das outras formas.
              Fichas e não select: são três opções, e escolher entre elas *é* comparar as três. */}
          {showsUnitChoice ? (
            <>
              <OptionGroup
                label="COMO A DOSE É MEDIDA?"
                value={doseUnit}
                options={unitOptions}
                onChange={(unit: PosologyUnit) => setDoseUnit(unit)}
              />
              {form !== null && DICA_DA_UNIDADE[form] ? (
                <Dica>{DICA_DA_UNIDADE[form] as string}</Dica>
              ) : null}
            </>
          ) : null}

          {/* Só depois da unidade resolvida — perguntar a quantidade de uma unidade indefinida
              não significa nada, e é o que fazia "1 injeção ué" parecer a resposta certa. */}
          {doseUnit !== null ? (
            <TextField
              label={`${quantosDe(doseUnit)} ${UNIT_NOUNS[doseUnit].toUpperCase()} DE CADA VEZ`}
              required
              placeholder="Ex: 1"
              value={doseAmount}
              onChangeText={handleDoseAmountChange}
              onFocus={scrollToFocusedInput}
              keyboardType={doseAceitaFracao ? "decimal-pad" : "number-pad"}
              maxLength={8}
              error={hasDoseAmountError ? "Informe um número maior que zero." : undefined}
            />
          ) : null}

          {dosesVariam ? (
            <Text style={styles.sectionHint}>
              {todosHorariosComDose
                ? "Cada horário tem a sua dose, então este valor não é usado."
                : "Vale nos horários em que você não informou uma dose diferente."}
            </Text>
          ) : null}

          <OptionGroup
            label="QUAL A FREQUÊNCIA?"
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

          {/* Um mecanismo para três coisas que as pessoas dizem de jeitos diferentes: cartela
              de anticoncepcional, dia sim dia não e injeção "de 30 em 30 dias". Antes eram duas
              opções (ciclo e intervalo) que produziam o mesmo agendamento por caminhos
              diferentes — e escolher entre elas era dúvida, não decisão. */}
          {frequency === "cycle" ? (
            <>
              <TextField
                label="A CADA QUANTOS DIAS?"
                required
                placeholder="Ex: 28 na cartela, 30 na injeção mensal"
                value={cycleLengthInput}
                onChangeText={(raw) => apenasDigitos(raw, setCycleLengthInput)}
                onFocus={scrollToFocusedInput}
                keyboardType="number-pad"
                maxLength={3}
              />

              {/* Só depois do tamanho do ciclo: "por quantos dias seguidos" não tem escala nem
                  limite antes dele. Em branco vale 1, que é o caso de quem pensa "de 30 em 30". */}
              {cycleLengthDefinido ? (
                <TextField
                  label="POR QUANTOS DIAS SEGUIDOS?"
                  placeholder="1 dia, se for dose única"
                  value={activeDaysInput}
                  onChangeText={(raw) => apenasDigitos(raw, setActiveDaysInput)}
                  onFocus={scrollToFocusedInput}
                  keyboardType="number-pad"
                  maxLength={3}
                  error={activeDaysError}
                />
              ) : null}

              {/* A pergunta que faltava. Sem ela o app assume que o ciclo começa hoje, e quem
                  cadastra no meio da cartela recebe a pausa deslocada — em silêncio. */}
              {cycleLengthDefinido && activeDaysError === undefined ? (
                <OptionGroup
                  label="ESTE CICLO COMEÇOU QUANDO?"
                  value={cycleStart}
                  options={opcoesDeInicioDoCiclo(comecaDepoisDeHoje)}
                  onChange={setCycleStart}
                />
              ) : null}

              {cycleStart === "earlier" ? (
                <TextField
                  label="PRIMEIRO DIA DESTE CICLO"
                  placeholder="DD/MM/AAAA"
                  value={cycleStartInput}
                  onChangeText={(value) =>
                    setCycleStartInput(formatDateInput(value, cycleStartInput))
                  }
                  onFocus={scrollToFocusedInput}
                  keyboardType="number-pad"
                  maxLength={10}
                  error={cycleStartError}
                />
              ) : null}

              {/* Datas, não a regra: "28 e 21" é o que a pessoa acabou de digitar, e repetir não
                  confirma nada. O que ela reconhece é o dia em que a cartela dela acaba. */}
              {viradasDoCiclo !== null ? (
                <Text style={styles.sectionHintDestaque}>
                  {viradasDoCiclo.emPausa
                    ? `Você está na pausa. Volta a tomar em ${toDateInput(viradasDoCiclo.resumesOn)}.`
                    : parsedActiveDays === 1
                      ? `A próxima é em ${toDateInput(viradasDoCiclo.resumesOn)}.`
                      : `Você toma até ${toDateInput(viradasDoCiclo.lastDay)}, faz a pausa, e recomeça em ${toDateInput(viradasDoCiclo.resumesOn)}.`}
                </Text>
              ) : null}
            </>
          ) : null}

          {temHorariosFixos(frequency) ? (
            <>
              <OptionGroup
                label={frequency === "daily" ? "QUANTAS VEZES POR DIA?" : "QUANTAS VEZES NO DIA?"}
                value={isCustomDoses ? null : String(doseInputs.length)}
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
              {doseInputs.length > 0 ? (
                <SeletorDeHorarios
                  label="EM QUE HORÁRIOS?"
                  values={doseInputs}
                  onChange={setDoseInputs}
                  duplicateIndexes={duplicateTimeIndexes}
                  // Dose por horário só é oferecida depois que a dose geral existe: ela é o valor
                  // que cada horário herda, e sem ela os campos abririam sem referência nenhuma.
                  variacao={
                    doseUnit !== null && parsedDoseAmount > 0
                      ? {
                          ativa: dosesVariam,
                          onChange: setDosesVariam,
                          unitNoun: UNIT_NOUNS[doseUnit],
                          defaultAmount: doseAmount,
                          aceitaFracao: doseAceitaFracao,
                        }
                      : undefined
                  }
                />
              ) : null}
            </>
          ) : null}

          {frequency === "asNeeded" ? (
            <Text style={styles.sectionHint}>
              Nenhum horário será agendado. Você registra a dose quando tomar.
            </Text>
          ) : null}

          {/* Só onde existe agenda: em "só quando precisar" não há dia de começar, e o campo ali
              cobraria uma resposta que não muda nada. */}
          {frequency !== null && frequency !== "asNeeded" ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>QUANDO COMEÇA</Text>
              {alteraInicio ? (
                <TextField
                  label=""
                  placeholder="DD/MM/AAAA"
                  value={startDateInput}
                  onChangeText={(raw) => setStartDateInput(formatDateInput(raw, startDateInput))}
                  onFocus={scrollToFocusedInput}
                  keyboardType="number-pad"
                  maxLength={10}
                  error={startDateError}
                />
              ) : (
                <Pressable
                  style={styles.rowValue}
                  onPress={() => setAlteraInicio(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Alterar a data de início do tratamento">
                  <Text style={styles.rowValueText}>Hoje</Text>
                  <Text style={styles.rowValueAction}>Alterar</Text>
                </Pressable>
              )}
            </View>
          ) : null}

          <OptionGroup
            label="QUAL O TEMPO DO TRATAMENTO?"
            value={duration}
            options={frequency === "asNeeded" ? DURATION_OPTIONS_SEM_AGENDA : DURATION_OPTIONS}
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
                onChangeText={(raw) => setDurationAmount(formatIntegerInput(raw, 3))}
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
              até {toDateInput(resumoDoTratamento.lastDay)}, num total de{" "}
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

          {/* Prescrição é contada em doses, não em dias de calendário. Se o prazo não entrega o
              tratamento inteiro por ter sido cadastrado com o dia em curso, a tela mostra a
              diferença e oferece a data que completa — em vez de corrigir por conta própria. */}
          {faltaDeDose !== null ? (
            <View style={styles.avisoDePrazo}>
              <Text style={styles.sectionHintDestaque}>
                Esse prazo entrega {faltaDeDose.planejadas} das {faltaDeDose.nominais} doses do
                tratamento, porque os horários de hoje que já passaram não entram.
              </Text>
              <Button
                label={`Estender até ${toDateInput(faltaDeDose.fimQueCompleta)} e completar as ${faltaDeDose.nominais} doses`}
                variant="outline"
                onPress={() => {
                  const nova = treatmentDuration(startDate, faltaDeDose.fimQueCompleta);
                  // `null` só sairia com data inválida, e a data veio do próprio domínio —
                  // mas ignorar em silêncio deixaria o botão sem efeito nenhum.
                  if (nova === null) return;
                  setDurationUnit(nova.unit);
                  setDurationAmount(String(nova.amount));
                }}
              />
            </View>
          ) : null}

          {/* O app não agenda dose que já passou (o controle começa agora, e amanhã o ciclo é
              normal), mas descartar em silêncio faria a pessoa sair achando que agendou o dia
              inteiro. Diz quais horários e a partir de quando o acompanhamento vale. */}
          {horariosDeHojeDescartados.length > 0 && !prazoSemDose ? (
            <Text style={styles.sectionHintDestaque}>
              {horariosDeHojeDescartados.length === 1
                ? `O horário de hoje às ${horariosDeHojeDescartados[0]} já passou e não será agendado.`
                : `Os horários de hoje às ${emLista(horariosDeHojeDescartados)} já passaram e não serão agendados.`}{" "}
              O acompanhamento começa na próxima dose, e amanhã o dia inteiro entra normalmente.
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
                    style={[styles.rowValue, styles.rowValueAtivo]}
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
                      O tratamento inteiro consome {consumoDoTratamento}{" "}
                      {stockUnit === null ? "" : UNIT_NOUNS[stockUnit]} e você tem {parsedStock}.
                      Vale comprar antes de acabar.
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
                  onPress={() => pick(boxPhoto, setPhotoUri, photoUri)}
                  disabled={boxPhoto.isPicking}
                  accessibilityRole="button"
                  accessibilityLabel="Foto da embalagem">
                  {photoUri ? (
                    <FotoLocal uri={photoUri} style={styles.photo} />
                  ) : (
                    <MaterialCommunityIcons
                      name="camera-plus"
                      size={24}
                      color={colors.onSurfaceVariant}
                    />
                  )}
                </Pressable>
                <View style={styles.photoTextGroup}>
                  <Pressable
                    onPress={() => pick(boxPhoto, setPhotoUri, photoUri)}
                    accessibilityRole="button">
                    <Text style={styles.photoAddLabel}>
                      {photoUri ? "Trocar foto da caixa" : "Adicionar foto da caixa"}
                    </Text>
                  </Pressable>
                  <Text style={styles.photoHint}>Ajuda a reconhecer o remédio de relance.</Text>
                </View>
              </View>

              {/* O campo não dizia para que servia: mostrava só as duas formas de escolher, e
                  quem chegava nele não sabia se era outra foto do remédio ou outra coisa. */}
              <Text style={styles.fieldLabel}>RECEITA MÉDICA</Text>

              {/* Duas portas de entrada porque são duas realidades: quem tem o papel na mão
                  fotografa, e quem recebeu a receita digital já tem o PDF salvo. Uma só forçaria
                  metade das pessoas a fotografar a tela do próprio celular. */}
              <View style={styles.photoRow}>
                <View style={attachmentUri ? styles.photoFrame : styles.photoPlaceholder}>
                  {attachmentUri !== null && attachmentKind === "image" ? (
                    <FotoLocal uri={attachmentUri} style={styles.photo} />
                  ) : (
                    <MaterialCommunityIcons
                      name={attachmentUri === null ? "file-document-outline" : "file-pdf-box"}
                      size={24}
                      color={attachmentUri === null ? colors.onSurfaceVariant : colors.primary}
                    />
                  )}
                </View>
                <View style={styles.photoTextGroup}>
                  {attachmentUri === null ? (
                    <View style={styles.acoesDeAnexo}>
                      <Pressable
                        onPress={() => pick(prescriptionPhoto, guardarFoto, attachmentUri)}
                        disabled={prescriptionPhoto.isPicking}
                        accessibilityRole="button">
                        {/* "Tirar da galeria" lia como "tirar foto" e prometia abrir a câmera,
                            que não é o que acontece — o seletor é o da galeria. */}
                        <Text style={styles.photoAddLabel}>Escolher da galeria</Text>
                      </Pressable>
                      <Pressable
                        onPress={escolherArquivoDaReceita}
                        disabled={prescriptionFile.isPicking}
                        accessibilityRole="button">
                        <Text style={styles.photoAddLabel}>Escolher arquivo</Text>
                      </Pressable>
                    </View>
                  ) : (
                    // Anexado, as ações são **trocar** e remover. Antes só havia remover: quem
                    // anexou o arquivo errado precisava apagar para poder escolher de novo, e no
                    // meio disso perdia a validade e o aviso de renovação já preenchidos.
                    <View style={styles.acoesDeAnexo}>
                      <Pressable
                        onPress={() =>
                          attachmentKind === "document"
                            ? escolherArquivoDaReceita()
                            : pick(prescriptionPhoto, guardarFoto, attachmentUri)
                        }
                        accessibilityRole="button">
                        <Text style={styles.photoAddLabel}>Alterar anexo</Text>
                      </Pressable>
                      <Pressable onPress={removerReceita} accessibilityRole="button">
                        <Text style={styles.photoRemoveLabel}>
                          {attachmentKind === "document" ? "Remover receita" : "Remover foto"}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                  <Text style={styles.photoHint}>
                    {attachmentUri !== null && attachmentName.length > 0
                      ? attachmentName
                      : `Aceita ${ACCEPTED_DOCUMENT_LABEL}. Fica só no aparelho, não sobe pra nuvem.`}
                  </Text>
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

              {/* E só depois da validade: sem data, o aviso não tem de quando contar. Perguntar
                  antes seria oferecer um lembrete que o app não teria como disparar. */}
              {attachmentUri !== null && validUntilIso !== null ? (
                <>
                  <Checkbox
                    checked={wantsRenewalReminder}
                    onChange={setWantsRenewalReminder}
                    label="Me avisar antes de a receita vencer"
                    accessibilityLabel="Me avisar antes de a receita vencer"
                  />
                  {wantsRenewalReminder ? (
                    <OptionGroup
                      label="COM QUANTA ANTECEDÊNCIA"
                      value={renewalLeadDays}
                      options={RENEWAL_LEAD_OPTIONS}
                      onChange={setRenewalLeadDays}
                    />
                  ) : null}
                  {avisoDeRenovacao !== null ? (
                    <Text style={styles.sectionHintDestaque}>{avisoDeRenovacao}</Text>
                  ) : null}
                </>
              ) : null}
            </Card>

            {frequency !== "asNeeded" ? (
              <Card>
                <Text style={styles.sectionTitle}>LEMBRETE</Text>
                {reminderMode !== null ? (
                  <Pressable
                    style={[styles.rowValue, styles.rowValueAtivo]}
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

            {/* Nada aqui muda horário, dose ou lembrete — é a anotação que o paciente quer ter à
                mão na hora de tomar. Por isso vem por último e não cobra nada. */}
            <Card>
              <Text style={styles.sectionTitle}>INFORMAÇÕES ADICIONAIS</Text>
              <Text style={styles.sectionHint}>
                Só anotação, pra você lembrar depois. Nada aqui altera os horários.
              </Text>

              {/* Chips no lugar de um terceiro campo de texto: a lista das recomendações comuns é
                  curta e conhecida, e reconhecer custa um toque enquanto escrever custa uma frase. */}
              <ToggleChips
                label="COMO TOMAR"
                values={
                  mostraOutraOrientacao
                    ? [...intakeInstructions, OUTRA_ORIENTACAO]
                    : intakeInstructions
                }
                options={INTAKE_INSTRUCTION_OPTIONS}
                onChange={handleOrientacoesChange}
              />

              {mostraOutraOrientacao ? (
                <TextField
                  label="QUAL ORIENTAÇÃO?"
                  placeholder="Ex: diluir em meio copo d'água"
                  value={intakeNote}
                  onChangeText={setIntakeNote}
                  onFocus={scrollToFocusedInput}
                  maxLength={300}
                />
              ) : null}

              <TextField
                label="PRINCÍPIO ATIVO"
                placeholder="Ex: Losartana potássica"
                value={activeIngredient}
                onChangeText={setActiveIngredient}
                onFocus={scrollToFocusedInput}
                maxLength={120}
              />
              <TextField
                label="OBSERVAÇÃO GERAL"
                placeholder="Ex: o azul é o da manhã"
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
        aceitaFracao={stockUnit !== null && allowsFractionalDose(stockUnit)}
        aviso={avisoDeAntecedencia}
        avisoEhConflito={antecedenciaConflita}
        quantityLabel={
          stockUnit === null
            ? "QUANTAS UNIDADES VOCÊ TEM"
            : `${quantosDe(stockUnit)} ${UNIT_NOUNS[stockUnit].toUpperCase()} VOCÊ TEM`
        }
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
        // Fecha o popup antes de navegar: deixá-lo aberto por baixo dos termos faria ele
        // reaparecer sozinho na volta, sobre um cadastro que a pessoa já tinha deixado de lado.
        onAbrirTermos={() => {
          setReminderSheetOpen(false);
          router.push("/termos");
        }}
      />
    </SafeAreaView>
  );
}
