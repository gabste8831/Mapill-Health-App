import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
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
import type { CatalogEntry } from "@/domain/ports/medication-catalog";
import { doseFaltanteDoPrazo } from "@/domain/use-cases/dose-faltante-do-prazo";
import { dosesDeHojeJaPassadas } from "@/domain/use-cases/doses-de-hoje-ja-passadas";
import { estimateStockDepletion } from "@/domain/use-cases/estimate-stock-depletion";
import { generateDoseSchedules } from "@/domain/use-cases/generate-dose-schedules";
import { summarizeTreatment } from "@/domain/use-cases/summarize-treatment";
import {
  ACCEPTED_DOCUMENT_LABEL,
  useDocumentPicker,
} from "@/hooks/use-document-picker";
import { useMedicationCatalog } from "@/hooks/use-medication-catalog";
import { usePhotoPicker, type PhotoOrigin } from "@/hooks/use-photo-picker";
import { useScrollToFocusedInput } from "@/hooks/use-scroll-to-focused-input";
import { abrirDocumento } from "@/shared/abrir-anexo";
import { dataPorExtenso } from "@/shared/datas-por-extenso";
import {
  cycleTurningPoints,
  lastDayOfTreatment,
  parseDateInput,
  toDateInput,
  todayIsoDate,
  toLocalIsoDay,
  treatmentDuration,
  type DurationUnit,
} from "@/shared/date-input";
import {
  formatDecimalInput,
  formatIntegerInput,
  parseDecimalInput,
} from "@/shared/number-input";
import { deletePersistedFile } from "@/shared/persist-picked-file";
import {
  capitalizarNome,
  MEDICATION_FORM_LABELS,
  UNIT_LABELS,
} from "@/shared/rotulos-de-medicamento";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { parseTimeInput } from "@/shared/time-input";
import {
  Button,
  Card,
  Checkbox,
  DateField,
  Dica,
  EscolhaDeOrigemDaFoto,
  FotoLocal,
  Header,
  KeyboardAwareScrollView,
  OptionGroup,
  RodapeDeFormulario,
  SelectField,
  SugestoesDeMedicamento,
  TextField,
  ToggleChips,
  VisualizadorDeMidia,
  type OptionGroupOption,
  type SelectOption,
  type ToggleChipOption,
} from "@/ui";
import { criarEstilos } from "./CadastroDeMedicamento.styles";
import { ConfiguracaoDeEstoque } from "./ConfiguracaoDeEstoque";
import { ConfiguracaoDeLembrete } from "./ConfiguracaoDeLembrete";
import {
  entradasVazias,
  SeletorDeHorarios,
  type EntradaDeDose,
} from "./SeletorDeHorarios";

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

/** Sem isso a pergunta sai "quantos gotas". */
const UNIDADES_FEMININAS: readonly PosologyUnit[] = [
  "capsule",
  "drop",
  "IU",
  "application",
];

function quantosDe(unit: PosologyUnit): string {
  return UNIDADES_FEMININAS.includes(unit) ? "Quantas" : "Quantos";
}

/** Onde ler a unidade no próprio remédio. Não é orientação de dose. */
const DICA_DA_UNIDADE: Partial<Record<MedicationForm, string>> = {
  injection:
    "Caneta de insulina marca em UI; ampola e seringa costumam vir em ml.",
  liquid: "O copinho ou a seringa que vem na caixa marcam em ml.",
};

type FrequencyKind = PosologySchedule["kind"];

const FREQUENCY_OPTIONS: OptionGroupOption<FrequencyKind>[] = [
  { value: "daily", label: "Todo dia" },
  { value: "weekly", label: "Dias da semana" },
  { value: "cycle", label: "A cada X dias" },
  { value: "asNeeded", label: "Só quando precisar" },
];

/** De onde o ciclo conta. Sem isso a pausa cai no dia errado. */
type CycleStartKind = "today" | "earlier";

/** "Hoje" só serve quando o tratamento começa hoje; adiante, a referência é o dia do início. */
function opcoesDeInicioDoCiclo(
  comecaDepoisDeHoje: boolean,
): OptionGroupOption<CycleStartKind>[] {
  return [
    {
      value: "today",
      label: comecaDepoisDeHoje
        ? "Começa junto com o tratamento"
        : "Começa hoje",
    },
    { value: "earlier", label: "Já comecei antes" },
  ];
}

type DurationKind = "continuous" | "fixed";

const DURATION_OPTIONS: OptionGroupOption<DurationKind>[] = [
  { value: "continuous", label: "Uso contínuo" },
  { value: "fixed", label: "Tem prazo" },
];

/** Sem agenda, "contínuo" não descreve o caso: é permanente e sob demanda. */
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

/** `nome` é para o leitor de tela: o TalkBack lê "Seg" letra a letra. */
const WEEKDAYS: { value: Weekday; label: string; nome: string }[] = [
  { value: 0, label: "Dom", nome: "domingo" },
  { value: 1, label: "Seg", nome: "segunda-feira" },
  { value: 2, label: "Ter", nome: "terça-feira" },
  { value: 3, label: "Qua", nome: "quarta-feira" },
  { value: 4, label: "Qui", nome: "quinta-feira" },
  { value: 5, label: "Sex", nome: "sexta-feira" },
  { value: 6, label: "Sáb", nome: "sábado" },
];

const INTAKE_INSTRUCTION_LABELS: Record<IntakeInstruction, string> = {
  fasting: "Em jejum",
  withMeal: "Junto da refeição",
  afterMeal: "Depois de comer",
  plentyOfWater: "Com bastante água",
  stayUpright: "Não deitar depois",
  avoidAlcohol: "Evitar álcool",
};

/** Ficha que só abre o campo livre; não é valor do domínio. */
const OUTRA_ORIENTACAO = "other";
type OrientacaoChip = IntakeInstruction | typeof OUTRA_ORIENTACAO;

const INTAKE_INSTRUCTION_OPTIONS: ToggleChipOption<OrientacaoChip>[] = [
  ...INTAKE_INSTRUCTIONS.map((instruction) => ({
    value: instruction as OrientacaoChip,
    label: INTAKE_INSTRUCTION_LABELS[instruction],
  })),
  { value: OUTRA_ORIENTACAO, label: "Outra orientação" },
];

/** Mínimo de 7 dias: conseguir consulta e passar na farmácia leva tempo. */
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

/** A frase de previsão do lembrete: "O alarme tocará hoje às 12:08". */
function previsaoDoLembrete(mode: ReminderMode, quando: Date): string {
  const sujeito =
    mode === "alarm"
      ? "O alarme tocará"
      : mode === "notification"
        ? "A notificação chegará"
        : "O alarme e a notificação virão";

  const horas = String(quando.getHours()).padStart(2, "0");
  const minutos = String(quando.getMinutes()).padStart(2, "0");

  const hoje = new Date();
  const amanha = new Date(hoje.getTime() + 24 * 60 * 60_000);
  const mesmoDia = (a: Date, b: Date) => toLocalIsoDay(a) === toLocalIsoDay(b);

  const dia = mesmoDia(quando, hoje)
    ? "hoje"
    : mesmoDia(quando, amanha)
      ? "amanhã"
      : dataPorExtenso(quando).toLowerCase();

  return `${sujeito} ${dia} às ${horas}:${minutos}`;
}

/** Cadastro inteiro numa estrutura só: a mesma tela cria e edita. */
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
  /**
   * Horários de hoje (`HH:MM`) que o paciente diz já ter tomado. Viram `IntakeLog` confirmado no
   * salvamento. Vazio na edição: registrar ingestão não é o que aquela tela faz.
   */
  dosesJaTomadasHoje: string[];
  attachmentValidUntil: string | null;
  renewalReminderLeadDays: number | null;
  /** Se quer ser avisada. Sozinho, garante o aviso no dia do vencimento. */
  renewalReminderEnabled: boolean;
};

/** O `SelectField` devolve `null` ao limpar; aqui limpar não é opção válida, então é ignorado. */
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

/** Frequências que pedem lista de horários. */
function temHorariosFixos(frequency: FrequencyKind | null): boolean {
  return frequency !== null && frequency !== "asNeeded";
}

/** Olha o texto cru, e não o número, porque é o texto que continua na tela. */
function temFracao(valor: string): boolean {
  return /[.,]/.test(valor);
}

/** Lista em português, com "e" antes do último. */
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
  /**
   * O que o scanner leu da caixa. Separado de `initialValue`: aqui é cadastro novo com três campos
   * adiantados pela CMED, que sabe qual remédio é e nunca quanto a pessoa toma.
   */
  preenchidoDaCmed?: {
    name: string;
    activeIngredient: string;
    prescriptionRequirement: PrescriptionRequirement;
  };
  onSubmit: (draft: MedicamentoDraft) => void;
  onBack: () => void;
};

/**
 * Cadastro e edição na mesma tela. Cada pergunta é consequência da anterior: a forma decide a
 * unidade, a frequência decide quantos horários existem, e é isso que impede cadastrar 3 doses
 * por dia com um horário só.
 */
export function FormularioDeMedicamentoScreen({
  initialValue,
  preenchidoDaCmed,
  onSubmit,
  onBack,
}: FormularioDeMedicamentoScreenProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const router = useRouter();
  const { scrollViewRef, scrollToFocusedInput, onScroll } =
    useScrollToFocusedInput();
  const boxPhoto = usePhotoPicker("medicamento-caixa");
  const prescriptionPhoto = usePhotoPicker("medicamento-receita");
  const prescriptionFile = useDocumentPicker("medicamento-receita");

  /**
   * Tudo que descreve a posologia começa vazio: seletor já marcado é indistinguível de resposta
   * dada, e o cadastro sairia com uma posologia que o app inventou.
   */
  const [name, setName] = useState(
    initialValue?.name ?? preenchidoDaCmed?.name ?? "",
  );
  /**
   * `requisitoDaCmed` guarda a tarja, que o formulário não pergunta. Numa edição nasce com o valor
   * gravado, senão reabrir o cadastro rebaixaria um controlado para isento sem ninguém mexer nisso.
   */
  const [sugestaoAceita, setSugestaoAceita] = useState(
    preenchidoDaCmed !== undefined,
  );
  const [requisitoDaCmed, setRequisitoDaCmed] =
    useState<PrescriptionRequirement>(
      initialValue?.prescriptionRequirement ??
        preenchidoDaCmed?.prescriptionRequirement ??
        "none",
    );
  const sugestoes = useMedicationCatalog(sugestaoAceita ? "" : name);

  /**
   * Preenche nome, princípio ativo e tarja, e para por aí. Forma e posologia não vêm da CMED: a
   * apresentação é texto livre, e adivinhar forma farmacêutica é palpite que este app não dá.
   */
  function aceitarSugestao(entrada: CatalogEntry) {
    // A CMED escreve tudo em maiúsculas, e é este valor que fica gravado para sempre.
    const nome = capitalizarNome(entrada.name);
    const nomeComDosagem =
      entrada.strength.length > 0 ? `${nome} ${entrada.strength}` : nome;
    setName(nomeComDosagem);
    setActiveIngredient(capitalizarNome(entrada.activeIngredient));
    setRequisitoDaCmed(entrada.prescriptionRequirement);
    setSugestaoAceita(true);
    Keyboard.dismiss();
  }
  const [form, setForm] = useState<MedicationForm | null>(
    initialValue?.form ?? null,
  );
  const [doseAmount, setDoseAmount] = useState(
    initialValue === undefined ? "" : String(initialValue.doseAmount),
  );
  const [doseUnit, setDoseUnit] = useState<PosologyUnit | null>(
    initialValue?.doseUnit ?? null,
  );

  const initialSchedule = initialValue?.schedule;
  const initialDoses =
    initialSchedule === undefined ? [] : dosesOfSchedule(initialSchedule);
  const [frequency, setFrequency] = useState<FrequencyKind | null>(
    initialSchedule?.kind ?? null,
  );
  const [doseInputs, setDoseInputs] = useState<EntradaDeDose[]>(() =>
    initialDoses.map((dose) => ({
      at: dose.at,
      amount: dose.amount === null ? "" : String(dose.amount),
    })),
  );
  // Reaberto já ligado se algum horário tem dose própria: senão os números gravados sumiriam da
  // tela enquanto continuariam valendo no agendamento.
  const [dosesVariam, setDosesVariam] = useState(() =>
    initialDoses.some((dose) => dose.amount !== null),
  );
  const [weekdays, setWeekdays] = useState<Weekday[]>(
    initialSchedule?.kind === "weekly" ? initialSchedule.weekdays : [],
  );
  const [cycleLengthInput, setCycleLengthInput] = useState(
    initialSchedule?.kind === "cycle"
      ? String(initialSchedule.cycleLengthDays)
      : "",
  );
  const [activeDaysInput, setActiveDaysInput] = useState(
    initialSchedule?.kind === "cycle" ? String(initialSchedule.activeDays) : "",
  );
  // `null` = ainda não respondido. "Hoje" é resposta, não padrão.
  const [cycleStart, setCycleStart] = useState<CycleStartKind | null>(
    initialSchedule?.kind !== "cycle"
      ? null
      : initialSchedule.cycleStartDate === todayIsoDate()
        ? "today"
        : "earlier",
  );
  const [cycleStartInput, setCycleStartInput] = useState(
    initialSchedule?.kind === "cycle"
      ? toDateInput(initialSchedule.cycleStartDate)
      : "",
  );
  const [customDosesInput, setCustomDosesInput] = useState(() =>
    initialDoses.length > COMMON_DOSES_PER_DAY
      ? String(initialDoses.length)
      : "",
  );

  /**
   * Única exceção à regra de não trazer nada de fábrica: hoje não é posologia inventada, é o
   * único fato que o app sabe. Fica dito na tela, com atalho pra alterar.
   */
  const [startDateInput, setStartDateInput] = useState(() =>
    toDateInput(initialValue?.startDate ?? todayIsoDate()),
  );
  const [alteraInicio, setAlteraInicio] = useState(
    () => (initialValue?.startDate ?? todayIsoDate()) !== todayIsoDate(),
  );
  const inicioEscolhido = alteraInicio
    ? parseDateInput(startDateInput)
    : todayIsoDate();
  // Data pela metade não vira "hoje" por omissão: trava o botão até fechar.
  const inicioIncompleto = inicioEscolhido === null;
  const startDateError =
    alteraInicio && startDateInput.length === 10 && inicioEscolhido === null
      ? "Data inválida."
      : undefined;
  const startDate = inicioEscolhido ?? todayIsoDate();
  const comecaDepoisDeHoje = startDate > todayIsoDate();
  // Num cadastro novo, "contínuo" pré-marcado seria o app decidindo que o tratamento não acaba.
  const [duration, setDuration] = useState<DurationKind | null>(
    initialValue === undefined
      ? null
      : initialValue.endDate == null
        ? "continuous"
        : "fixed",
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

  const [photoUri, setPhotoUri] = useState<string | null>(
    initialValue?.photoUri ?? null,
  );
  const [attachmentUri, setAttachmentUri] = useState<string | null>(
    initialValue?.attachmentUri ?? null,
  );
  const [attachmentKind, setAttachmentKind] =
    useState<PrescriptionAttachmentKind | null>(
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

  const [tracksStock, setTracksStock] = useState(
    initialValue?.stockQuantity != null,
  );
  const [isStockSheetOpen, setStockSheetOpen] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(
    initialValue?.stockQuantity == null
      ? ""
      : String(initialValue.stockQuantity),
  );
  const [wantsLowStockAlert, setWantsLowStockAlert] = useState(
    initialValue?.lowStockAlertEnabled ?? false,
  );
  const [leadDays, setLeadDays] = useState<string | null>(
    initialValue?.lowStockAlertLeadDays == null
      ? null
      : String(initialValue.lowStockAlertLeadDays),
  );
  const [storageLocation, setStorageLocation] = useState(
    initialValue?.storageLocation ?? "",
  );

  const [activeIngredient, setActiveIngredient] = useState(
    initialValue?.activeIngredient ?? preenchidoDaCmed?.activeIngredient ?? "",
  );
  const [intakeInstructions, setIntakeInstructions] = useState<
    IntakeInstruction[]
  >(initialValue?.intakeInstructions ?? []);
  const [intakeNote, setIntakeNote] = useState(initialValue?.intakeNote ?? "");
  const [mostraOutraOrientacao, setMostraOutraOrientacao] = useState(
    (initialValue?.intakeNote ?? "").length > 0,
  );

  /** Desmarcar apaga o texto junto, senão a anotação seguiria valendo escondida. */
  function handleOrientacoesChange(values: OrientacaoChip[]) {
    const querOutra = values.includes(OUTRA_ORIENTACAO);
    setMostraOutraOrientacao(querOutra);
    if (!querOutra) setIntakeNote("");
    setIntakeInstructions(
      values.filter((v): v is IntakeInstruction => v !== OUTRA_ORIENTACAO),
    );
  }
  const [notes, setNotes] = useState(initialValue?.notes ?? "");

  const showsUnitChoice = form !== null && needsUnitChoice(form);
  const unitOptions: OptionGroupOption<PosologyUnit>[] = useMemo(
    () =>
      form === null
        ? []
        : unitsForMedicationForm(form).map((unit) => ({
            value: unit,
            label: UNIT_LABELS[unit],
          })),
    [form],
  );
  const stockUnit =
    form === null || doseUnit === null
      ? null
      : stockUnitForMedicationForm(form, doseUnit);

  /**
   * Trocar a forma reescreve a unidade e, se preciso, a quantidade: a máscara do campo decide
   * inteiro ou decimal pela unidade vigente na digitação, então 7,5 ml sobreviveria à troca para
   * comprimido e salvaria sete comprimidos e meio. Limpar, e não converter: não há equivalência.
   */
  function handleFormChange(nextForm: MedicationForm) {
    setForm(nextForm);
    const proximaUnidade = needsUnitChoice(nextForm)
      ? null
      : defaultUnitForMedicationForm(nextForm);
    setDoseUnit(proximaUnidade);
    descartarFracaoSeNaoCabe(proximaUnidade);
  }

  /** Mesmo problema da troca de forma: em Líquido, `7,5` ml é válido e `7,5` mg não é. */
  function handleDoseUnitChange(unit: PosologyUnit) {
    setDoseUnit(unit);
    descartarFracaoSeNaoCabe(unit);
  }

  /**
   * Apaga a quantidade fracionada quando a unidade nova não aceita fração. Unidade `null` também
   * apaga: sem unidade não há regra vigente para o número esperar.
   */
  function descartarFracaoSeNaoCabe(unidade: PosologyUnit | null) {
    if (unidade !== null && allowsFractionalDose(unidade)) return;
    setDoseAmount((atual) => (temFracao(atual) ? "" : atual));
    setDoseInputs((entradas) =>
      entradas.map((entrada) =>
        temFracao(entrada.amount) ? { ...entrada, amount: "" } : entrada,
      ),
    );
  }

  /**
   * Desmarcar apaga as doses por horário: mantidas no estado, voltariam preenchidas se a variação
   * fosse remarcada, exibindo como escolha números que a pessoa abandonou.
   */
  function handleDosesVariamChange(ativa: boolean) {
    setDosesVariam(ativa);
    if (!ativa) {
      setDoseInputs((entradas) =>
        entradas.map((entrada) => ({ ...entrada, amount: "" })),
      );
    }
  }

  /** Sair de "prazo definido" apaga o prazo, senão ele reapareceria preenchido ao voltar atrás. */
  function handleDurationChange(nextDuration: DurationKind) {
    setDuration(nextDuration);
    if (nextDuration !== "fixed") {
      setDurationAmount("");
      setDurationUnit(null);
    }
  }

  /** Recomeça a lista: os horários antigos eram de outra posologia. */
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
    if (doses >= 1 && doses <= MAX_DOSES_PER_DAY)
      setDoseInputs(entradasVazias(doses));
  }

  function apenasDigitos(raw: string, setter: (value: string) => void) {
    setter(formatIntegerInput(raw, 3));
  }

  /**
   * Com dose em todos os horários, o número de cima deixa de ser usado. Continua no estado porque
   * volta a valer se a variação for desmarcada, e é dele que a conta de estoque parte.
   */
  const todosHorariosComDose =
    dosesVariam &&
    doseInputs.length > 0 &&
    doseInputs.every((dose) => dose.amount.trim().length > 0);

  /** Meio comprimido existe, meia gota não. */
  const doseAceitaFracao = doseUnit !== null && allowsFractionalDose(doseUnit);

  function handleDoseAmountChange(raw: string) {
    setDoseAmount(
      doseAceitaFracao ? formatDecimalInput(raw) : formatIntegerInput(raw),
    );
  }

  const isCustomDoses = customDosesInput.length > 0;
  const parsedCustomDoses = Number(customDosesInput);
  const customDosesError =
    isCustomDoses &&
    (parsedCustomDoses < 1 || parsedCustomDoses > MAX_DOSES_PER_DAY)
      ? `Entre 1 e ${MAX_DOSES_PER_DAY} vezes por dia. De duas em duas horas já é o limite do que se cumpre acordado.`
      : undefined;

  const parsedDoseAmount = parseDecimalInput(doseAmount);
  const hasDoseAmountError =
    doseAmount.length > 0 &&
    (!Number.isFinite(parsedDoseAmount) || parsedDoseAmount <= 0);

  const duplicateTimeIndexes = indicesDuplicados(doseInputs);
  const parsedTimes = doseInputs.map((dose) => parseTimeInput(dose.at));
  const areTimesComplete =
    parsedTimes.every((time): time is TimeOfDay => time !== null) &&
    duplicateTimeIndexes.length === 0;

  const parsedCycleLength = Number(cycleLengthInput);
  // Ciclo de um dia é "todo dia", que já tem opção própria, daí o mínimo de 2.
  const cycleLengthDefinido = parsedCycleLength >= 2;
  // Campo ausente significa 1 por construção, não por padrão.
  const parsedActiveDays =
    activeDaysInput.length === 0 ? 1 : Number(activeDaysInput);
  const activeDaysError =
    cycleLengthDefinido &&
    activeDaysInput.length > 0 &&
    (parsedActiveDays < 1 || parsedActiveDays >= parsedCycleLength)
      ? `Entre 1 e ${parsedCycleLength - 1}. Tomar todos os dias do ciclo é "todo dia".`
      : undefined;

  // Memoizado porque o `schedule` depende dele e alimenta a geração de doses: recriar a data a
  // cada tecla regeraria o tratamento inteiro sem nada ter mudado.
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
    cycleStart === "earlier" &&
    cycleStartInput.length === 10 &&
    cycleStartIso === null
      ? "Data inválida."
      : cycleStartIso !== null && cycleStartIso > startDate
        ? "O ciclo não pode começar depois do início do tratamento."
        : undefined;

  // Bloqueio e não aviso: sem saber onde o ciclo começou, a pausa seria agendada no lugar errado.
  const cicloCompleto =
    cycleLengthDefinido &&
    activeDaysError === undefined &&
    cycleStartIso !== null &&
    cycleStartError === undefined;
  const viradasDoCiclo = cicloCompleto
    ? cycleTurningPoints(
        startDate,
        cycleStartIso,
        parsedCycleLength,
        parsedActiveDays,
      )
    : null;

  const parsedDurationAmount = Number(durationAmount);
  const hasDurationError =
    duration === "fixed" &&
    durationAmount.length > 0 &&
    (!Number.isInteger(parsedDurationAmount) || parsedDurationAmount < 1);
  const endDate =
    duration !== "fixed" ||
    durationAmount.length === 0 ||
    hasDurationError ||
    durationUnit === null
      ? null
      : lastDayOfTreatment(startDate, parsedDurationAmount, durationUnit);

  const validUntilIso =
    validUntilInput.length === 0 ? null : parseDateInput(validUntilInput);
  /**
   * Receita vencida é recusada, não só sinalizada: o aviso de renovação seria agendado para uma
   * data passada e nunca dispararia.
   */
  const receitaVencida =
    validUntilIso !== null && validUntilIso < todayIsoDate();
  const validUntilError =
    validUntilInput.length === 10 && validUntilIso === null
      ? "Data inválida."
      : receitaVencida
        ? "Essa receita já venceu. Anexe uma receita dentro da validade."
        : undefined;

  const avisoDeRenovacao = (() => {
    if (validUntilIso === null || receitaVencida || !wantsRenewalReminder)
      return null;
    if (renewalLeadDays === null) return null;

    const chegaEm = diasAntes(validUntilIso, Number(renewalLeadDays));
    // Antecedência que cai antes de hoje é lembrete que nunca vai disparar.
    return chegaEm < todayIsoDate()
      ? `Com ${renewalLeadDays} dias de antecedência o aviso já teria passado. Escolha um prazo menor para ser avisado a tempo.`
      : `Você será avisado em ${toDateInput(chegaEm)}, com ${renewalLeadDays} dias pra renovar.`;
  })();

  /** `null` enquanto a frequência não foi escolhida: não existe posologia padrão. */
  const schedule = useMemo<PosologySchedule | null>(() => {
    if (frequency === null) return null;
    if (frequency === "asNeeded") return { kind: "asNeeded" };

    // Dose por horário só é gravada com a variação ligada, senão valeria no agendamento sem
    // aparecer em lugar nenhum.
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

  // `every` de lista vazia é `true`: sem o teste de tamanho, "nada respondido" passaria por completo.
  const horariosCompletos = doseInputs.length > 0 && areTimesComplete;
  const isScheduleComplete =
    frequency === "asNeeded" ||
    (frequency === "daily" && horariosCompletos) ||
    (frequency === "weekly" && horariosCompletos && weekdays.length > 0) ||
    (frequency === "cycle" && horariosCompletos && cicloCompleto);

  /** Não inclui `endDate`: prazo em branco é "ainda não sei", não erro. */
  const doseCompleta =
    doseUnit !== null && parsedDoseAmount > 0 && !hasDoseAmountError;
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

  /** O que ainda falta, por extenso, para o rodapé. */
  const pendencias = [
    name.trim().length === 0 ? "o nome" : null,
    form === null ? "como você toma" : null,
    form !== null && !doseCompleta ? "a dose" : null,
    frequency === null ? "a frequência" : null,
    frequency === "weekly" && weekdays.length === 0
      ? "os dias da semana"
      : null,
    frequency === "cycle" && !cycleLengthDefinido
      ? "de quantos em quantos dias"
      : null,
    frequency === "cycle" && cycleLengthDefinido && !cicloCompleto
      ? "quando o ciclo começou"
      : null,
    temHorariosFixos(frequency) && doseInputs.length === 0
      ? "quantas vezes por dia"
      : null,
    temHorariosFixos(frequency) && doseInputs.length > 0 && !areTimesComplete
      ? "os horários"
      : null,
    inicioIncompleto ? "a data de início" : null,
    duration === null ? "por quanto tempo" : null,
    duration === "fixed" && !duracaoCompleta ? "a duração do tratamento" : null,
  ].filter((pendencia): pendencia is string => pendencia !== null);

  /** O tratamento com prazo, dito em doses. Ver `summarizeTreatment`. */
  const resumoDoTratamento = useMemo(
    () =>
      schedule === null || doseUnit === null
        ? null
        : summarizeTreatment(
            {
              id: "",
              schedule,
              startDate,
              endDate,
              doseAmount: parsedDoseAmount,
              doseUnit,
            },
            new Date(),
          ),
    [schedule, startDate, endDate, parsedDoseAmount, doseUnit],
  );

  const prazoSemDose =
    endDate !== null &&
    frequency !== "asNeeded" &&
    isScheduleComplete &&
    resumoDoTratamento === null;

  /**
   * Prescrição se conta em doses, não em dias: "3x ao dia por 7 dias" são 21 doses, e cadastrar às
   * 15h entrega 19. Em antibiótico isso é ciclo interrompido, então a tela mostra a diferença.
   */
  const faltaDeDose = useMemo(
    () =>
      schedule === null ||
      doseUnit === null ||
      endDate === null ||
      !isScheduleComplete
        ? null
        : doseFaltanteDoPrazo(
            {
              id: "",
              schedule,
              startDate,
              endDate,
              doseAmount: parsedDoseAmount,
              doseUnit,
            },
            new Date(),
          ),
    [
      schedule,
      doseUnit,
      endDate,
      isScheduleComplete,
      startDate,
      parsedDoseAmount,
    ],
  );

  /**
   * Quais dos horários já vencidos de hoje o paciente diz ter tomado. Só no cadastro novo: editar
   * um tratamento antigo não é o momento de registrar ingestão.
   */
  const [horariosJaTomados, setHorariosJaTomados] = useState<string[]>([]);

  /** Qual foto espera a escolha de origem; `null` com o popup fechado. */
  const [origemPendente, setOrigemPendente] = useState<
    "caixa" | "receita" | null
  >(null);

  async function escolherOrigem(origin: PhotoOrigin) {
    const alvo = origemPendente;
    setOrigemPendente(null);
    if (alvo === "caixa") await pick(boxPhoto, setPhotoUri, photoUri, origin);
    else if (alvo === "receita")
      await pick(prescriptionPhoto, guardarFoto, attachmentUri, origin);
  }

  /** A mídia aberta em tela cheia. Só imagens: PDF vai para o leitor do sistema. */
  const [midiaAberta, setMidiaAberta] = useState<{
    uri: string;
    titulo: string;
  } | null>(null);

  /**
   * Sem anexo pergunta a origem, com imagem amplia aqui, com PDF entrega ao leitor do aparelho:
   * renderizar PDF exigiria dependência nativa.
   */
  async function verReceita() {
    if (attachmentUri === null) {
      setOrigemPendente("receita");
      return;
    }

    if (attachmentKind === "image") {
      setMidiaAberta({ uri: attachmentUri, titulo: "Receita médica" });
      return;
    }

    const abriu = await abrirDocumento(attachmentUri);
    if (!abriu) {
      Alert.alert(
        "Não foi possível abrir",
        "Nenhum aplicativo deste aparelho abre PDF. O arquivo continua guardado aqui.",
      );
    }
  }

  const horariosDeHojeDescartados = useMemo(
    () =>
      schedule === null || doseUnit === null || !isScheduleComplete
        ? []
        : dosesDeHojeJaPassadas(
            {
              id: "",
              schedule,
              startDate,
              endDate,
              doseAmount: parsedDoseAmount,
              doseUnit,
            },
            new Date(),
          ),
    [
      schedule,
      doseUnit,
      isScheduleComplete,
      startDate,
      endDate,
      parsedDoseAmount,
    ],
  );

  /**
   * Derivado, e não guardado: marcar 06:00 e depois trocar para 18:00 gravaria ingestão de um
   * horário que não existe mais no tratamento.
   */
  const jaTomadosValidos = horariosJaTomados.filter((horario) =>
    horariosDeHojeDescartados.includes(horario),
  );

  const parsedStock = parseDecimalInput(stockQuantity);
  /**
   * Quantidade contra quantidade, não estoque contra número de doses: com dose variando por
   * horário, 10 UI de manhã e 8 à noite consomem 18 por dia, e não 2 x a dose padrão. Só compara
   * com as unidades iguais, porque converter exigiria a concentração do frasco.
   */
  const consumoDoTratamento =
    tracksStock && stockUnit === doseUnit
      ? (resumoDoTratamento?.totalAmount ?? null)
      : null;
  const estoqueInsuficiente =
    consumoDoTratamento !== null &&
    parsedStock > 0 &&
    parsedStock < consumoDoTratamento;

  /** Só faz sentido com estoque e dose na mesma unidade: gota se toma em gota e se guarda em ml. */
  const esgotamento = useMemo(
    () =>
      schedule === null ||
      stockUnit === null ||
      doseUnit === null ||
      !tracksStock
        ? null
        : estimateStockDepletion(
            {
              id: "",
              schedule,
              startDate,
              endDate,
              doseAmount: parsedDoseAmount,
              doseUnit,
            },
            { amount: parsedStock, unit: stockUnit },
            new Date(),
          ),
    [
      schedule,
      startDate,
      endDate,
      parsedDoseAmount,
      parsedStock,
      stockUnit,
      doseUnit,
      tracksStock,
    ],
  );

  /**
   * Antecedência maior que a duração do estoque é aviso que já nasceu vencido. Avisa mas não
   * bloqueia: comprar mais é o que resolve, e o estoque de hoje não deve travar a configuração.
   */
  const avisoDeAntecedencia =
    esgotamento === null
      ? null
      : wantsLowStockAlert &&
          leadDays !== null &&
          Number(leadDays) >= esgotamento.daysRemaining
        ? `Seu estoque atual dura cerca de ${esgotamento.daysRemaining} ${esgotamento.daysRemaining === 1 ? "dia" : "dias"}, portanto um aviso de ${leadDays} dias de antecedência não é possível.`
        : `No ritmo desta posologia, seu estoque suporta até o dia ${toDateInput(esgotamento.lastDay)}, cerca de ${esgotamento.daysRemaining} ${esgotamento.daysRemaining === 1 ? "dia" : "dias"}.`;

  const antecedenciaConflita =
    esgotamento !== null &&
    wantsLowStockAlert &&
    leadDays !== null &&
    Number(leadDays) >= esgotamento.daysRemaining;

  /**
   * O primeiro horário que este lembrete alcançaria. Usa a mesma `generateDoseSchedules` do
   * salvamento, e não uma conta paralela que poderia divergir justamente no caso a diagnosticar.
   * `null` quando não há horário futuro na janela, que é o caso do horário de hoje já passado.
   */
  const proximaDoseAgendavel = useMemo(() => {
    if (schedule === null || reminderMode === null || reminderMode === "none")
      return null;
    // A unidade não muda os horários gerados, mas o tipo a exige.
    if (doseUnit === null) return null;

    const de = new Date();
    const ate = new Date(de.getTime() + 7 * 24 * 60 * 60_000);
    const [primeira] = generateDoseSchedules({
      prescription: {
        id: "",
        schedule,
        startDate,
        endDate,
        doseAmount: parsedDoseAmount,
        doseUnit,
      },
      from: de,
      until: ate,
    });
    return primeira === undefined ? null : new Date(primeira.scheduledFor);
  }, [schedule, reminderMode, startDate, endDate, parsedDoseAmount, doseUnit]);

  /** Só o que foi preenchido; quem cobra o que falta é o popup. */
  const linhasDoEstoque = [
    stockQuantity.trim().length > 0 && stockUnit !== null
      ? {
          rotulo: "Quantidade",
          valor: `${stockQuantity} ${UNIT_NOUNS[stockUnit]}`,
        }
      : null,
    storageLocation.trim().length > 0
      ? { rotulo: "Local", valor: storageLocation.trim() }
      : null,
    wantsLowStockAlert && leadDays !== null
      ? { rotulo: "Aviso", valor: `${leadDays} dias antes de acabar` }
      : null,
  ].filter(
    (linha): linha is { rotulo: string; valor: string } => linha !== null,
  );

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
    origin: PhotoOrigin = "galeria",
  ) {
    const result = await picker.pickPhoto(origin, replacing);
    if (result.status === "picked") {
      apply(result.uri);
      return;
    }
    if (result.reason === "cancelled") return;
    const semPermissao = result.reason === "permission-denied";
    Alert.alert(
      semPermissao
        ? origin === "camera"
          ? "Sem acesso à câmera"
          : "Sem acesso às fotos"
        : "Não foi possível usar a foto",
      semPermissao
        ? `Para ${origin === "camera" ? "tirar uma foto" : "escolher uma imagem"}, libere o acesso nas configurações do aparelho.`
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

  /** Apaga a foto e o arquivo que ela deixou no diretório de documentos. */
  function removerFotoDaCaixa() {
    deletePersistedFile(photoUri);
    setPhotoUri(null);
  }

  /** Leva junto o que só existia por causa dela: validade e aviso de renovação. */
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
    // Os três `null` são impossíveis com `canSubmit` verdadeiro; o teste é para o compilador.
    if (!canSubmit || form === null || doseUnit === null || schedule === null)
      return;
    onSubmit({
      name: name.trim(),
      activeIngredient: activeIngredient.trim(),
      form,
      // A tarja não é perguntada: vem da CMED, e fica em "none" no cadastro livre.
      prescriptionRequirement: requisitoDaCmed,
      doseAmount: parsedDoseAmount,
      doseUnit,
      schedule,
      startDate,
      endDate,
      photoUri,
      // Não configurado grava "none": o app não decide sozinho que vai te acordar.
      reminderMode:
        frequency === "asNeeded" || reminderMode === null
          ? "none"
          : reminderMode,
      intakeInstructions,
      intakeNote: intakeNote.trim().length > 0 ? intakeNote.trim() : null,
      notes: notes.trim().length > 0 ? notes.trim() : null,
      stockQuantity:
        tracksStock && Number.isFinite(parsedStock) && parsedStock > 0
          ? parsedStock
          : null,
      stockUnit: stockUnitForMedicationForm(form, doseUnit),
      /**
       * **Marcar a caixa basta** — a antecedência é separada, e opcional.
       *
       * Havia um `&& leadDays !== null` aqui, com a justificativa de que "alerta sem antecedência
       * não dispara nunca, então não fica ligado mentindo". Era verdade antes de 08/09, quando o
       * planejador descartava o estoque sem prazo; deixou de ser quando "quero ser avisado" foi
       * separado de "quero ser avisado com N dias" — hoje `planejar-avisos-de-estoque` agenda o
       * aviso do **fim** só com `querAviso`, sem olhar o prazo.
       *
       * A condição sobreviveu à correção e virou o defeito oposto: marcar sem escolher prazo
       * gravava `false`, e a interface confirmava uma intenção que o banco negava. Visto em
       * aparelho em 11/09, e é o mesmo caso que a receita (`renewalReminderEnabled`) já tratava
       * certo — o que mostra que a correção passou por lá e não por aqui.
       */
      lowStockAlertEnabled: tracksStock && wantsLowStockAlert,
      lowStockAlertLeadDays:
        tracksStock && wantsLowStockAlert && leadDays !== null
          ? Number(leadDays)
          : null,
      storageLocation:
        tracksStock && storageLocation.trim().length > 0
          ? storageLocation.trim()
          : null,
      attachmentUri,
      attachmentKind: attachmentUri === null ? null : attachmentKind,
      // Só no cadastro novo: `initialValue` presente significa edição, e ali a pergunta nem aparece.
      dosesJaTomadasHoje: initialValue === undefined ? jaTomadosValidos : [],
      attachmentValidUntil: attachmentUri === null ? null : validUntilIso,
      /**
       * Querer o aviso e escolher a antecedência são duas perguntas: marcado sem prazo, o aviso
       * sai no dia do vencimento. A validade é condição das duas, senão não há de quando contar.
       */
      renewalReminderEnabled:
        attachmentUri !== null && validUntilIso !== null && wantsRenewalReminder,
      renewalReminderLeadDays:
        attachmentUri !== null &&
        validUntilIso !== null &&
        wantsRenewalReminder &&
        renewalLeadDays !== null
          ? Number(renewalLeadDays)
          : null,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header
        title={
          initialValue === undefined ? "Nova medicação" : "Editar medicação"
        }
        onBack={onBack}
      />
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>O essencial</Text>
            <Text style={[styles.selo, styles.seloObrigatorio]}>
              OBRIGATÓRIO
            </Text>
          </View>

          <TextField
            label="Nome da medicação"
            required
            placeholder="Ex: Losartana 50mg"
            value={name}
            onChangeText={(valor) => {
              setName(valor);
              // Digitar de novo reabre as sugestões, senão o catálogo fica calado até sair da tela.
              setSugestaoAceita(false);
            }}
            onFocus={scrollToFocusedInput}
            maxLength={120}
          />

          {!sugestaoAceita ? (
            <SugestoesDeMedicamento
              sugestoes={sugestoes}
              onEscolher={aceitarSugestao}
            />
          ) : null}
          <SelectField
            label="Como você toma?"
            value={form}
            options={FORM_OPTIONS}
            onChange={semLimpar(handleFormChange)}
          />

          {showsUnitChoice ? (
            <>
              <OptionGroup
                label="Como a dose é medida?"
                value={doseUnit}
                options={unitOptions}
                onChange={handleDoseUnitChange}
              />
              {form !== null && DICA_DA_UNIDADE[form] ? (
                <Dica>{DICA_DA_UNIDADE[form] as string}</Dica>
              ) : null}
            </>
          ) : null}

          {/* Só depois da unidade: quantidade de unidade indefinida não significa nada. */}
          {doseUnit !== null ? (
            <TextField
              label={`${quantosDe(doseUnit)} ${UNIT_NOUNS[doseUnit]} de cada vez`}
              required
              placeholder="Ex: 1"
              value={doseAmount}
              onChangeText={handleDoseAmountChange}
              onFocus={scrollToFocusedInput}
              keyboardType={doseAceitaFracao ? "decimal-pad" : "number-pad"}
              maxLength={8}
              error={
                hasDoseAmountError
                  ? "Informe um número maior que zero."
                  : undefined
              }
            />
          ) : null}

          {/* Com um horário só não há "de um para o outro". */}
          {doseUnit !== null &&
          parsedDoseAmount > 0 &&
          doseInputs.length > 1 ? (
            <Checkbox
              checked={dosesVariam}
              onChange={handleDosesVariamChange}
              label="A dose muda de um horário para o outro"
              accessibilityLabel="A dose muda de um horário para o outro"
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
            label="Qual a frequência?"
            layout="grade"
            value={frequency}
            options={FREQUENCY_OPTIONS}
            onChange={handleFrequencyChange}
          />

          {frequency === "weekly" ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Em quais dias?</Text>
              <View style={styles.weekdayRow}>
                {WEEKDAYS.map((weekday) => {
                  const isSelected = weekdays.includes(weekday.value);
                  return (
                    <Pressable
                      key={weekday.value}
                      style={estadoDePressao(
                        [styles.weekday, isSelected && styles.weekdaySelected],
                        {
                          escala: true,
                        },
                      )}
                      onPress={() => toggleWeekday(weekday.value)}
                      // `checkbox` e não `button`: são opções que se acumulam, e o leitor precisa
                      // anunciar "marcado/desmarcado" em vez de deixar o estado só na cor da ficha.
                      accessibilityRole="checkbox"
                      accessibilityLabel={weekday.nome}
                      accessibilityState={{ checked: isSelected }}
                    >
                      <Text
                        style={[
                          styles.weekdayText,
                          isSelected && styles.weekdayTextSelected,
                        ]}
                      >
                        {weekday.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Um mecanismo só para cartela, dia sim dia não e injeção "de 30 em 30 dias". */}
          {frequency === "cycle" ? (
            <>
              <TextField
                label="A cada quantos dias?"
                required
                placeholder="Ex: 28 na cartela, 30 na injeção mensal"
                value={cycleLengthInput}
                onChangeText={(raw) => apenasDigitos(raw, setCycleLengthInput)}
                onFocus={scrollToFocusedInput}
                keyboardType="number-pad"
                maxLength={3}
              />

              {/* Só depois do tamanho do ciclo, que é quem dá escala e limite. Em branco vale 1. */}
              {cycleLengthDefinido ? (
                <TextField
                  label="Por quantos dias seguidos?"
                  placeholder="1 dia, se for dose única"
                  value={activeDaysInput}
                  onChangeText={(raw) => apenasDigitos(raw, setActiveDaysInput)}
                  onFocus={scrollToFocusedInput}
                  keyboardType="number-pad"
                  maxLength={3}
                  error={activeDaysError}
                />
              ) : null}

              {/* Sem ela o app assumiria hoje, e quem cadastra no meio da cartela receberia a
                  pausa deslocada em silêncio. */}
              {cycleLengthDefinido && activeDaysError === undefined ? (
                <OptionGroup
                  label="Este ciclo começou quando?"
                  value={cycleStart}
                  options={opcoesDeInicioDoCiclo(comecaDepoisDeHoje)}
                  onChange={setCycleStart}
                />
              ) : null}

              {cycleStart === "earlier" ? (
                // "Já comecei antes" é sempre data passada, então o calendário trava o futuro.
                <DateField
                  label="Primeiro dia deste ciclo"
                  value={cycleStartInput}
                  onChangeText={setCycleStartInput}
                  onFocus={scrollToFocusedInput}
                  error={cycleStartError}
                  maximo={new Date()}
                />
              ) : null}

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
                label={
                  frequency === "daily"
                    ? "Quantas vezes por dia?"
                    : "Quantas vezes no dia?"
                }
                value={isCustomDoses ? null : String(doseInputs.length)}
                options={DOSES_PER_DAY_OPTIONS}
                onChange={handleDosesPerDayChange}
                trailing={
                  <TextInput
                    style={[
                      styles.dosesInput,
                      isCustomDoses && styles.dosesInputAtivo,
                    ]}
                    value={customDosesInput}
                    onChangeText={handleCustomDosesChange}
                    onFocus={scrollToFocusedInput}
                    placeholder="Mais"
                    // Sem opacidade: a 0.8 o contraste dava 3.41:1, abaixo do AA.
                    placeholderTextColor={cores.outline}
                    keyboardType="number-pad"
                    maxLength={2}
                    accessibilityLabel="Outra quantidade de doses por dia"
                  />
                }
              />
              {customDosesError ? (
                <Text style={styles.fieldErrorText}>{customDosesError}</Text>
              ) : null}
              {doseInputs.length > 0 ? (
                <SeletorDeHorarios
                  label="Em que horários?"
                  values={doseInputs}
                  onChange={setDoseInputs}
                  duplicateIndexes={duplicateTimeIndexes}
                  // Dose por horário só depois da dose geral: é ela que cada horário herda.
                  variacao={
                    doseUnit !== null && parsedDoseAmount > 0
                      ? {
                          ativa: dosesVariam,
                          onChange: handleDosesVariamChange,
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

          {/* Em "só quando precisar" não há dia de começar. */}
          {frequency !== null && frequency !== "asNeeded" ? (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Quando começa</Text>
              {alteraInicio ? (
                // Sem limite: começar adiante ou retomar tratamento antigo são casos legítimos.
                <DateField
                  label=""
                  value={startDateInput}
                  onChangeText={setStartDateInput}
                  onFocus={scrollToFocusedInput}
                  error={startDateError}
                />
              ) : (
                <Pressable
                  style={estadoDePressao(styles.rowValue)}
                  onPress={() => setAlteraInicio(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Alterar a data de início do tratamento"
                >
                  <Text style={styles.rowValueText}>Hoje</Text>
                  <Text style={styles.rowValueAction}>Alterar</Text>
                </Pressable>
              )}
            </View>
          ) : null}

          <OptionGroup
            label="Qual o tempo do tratamento?"
            value={duration}
            options={
              frequency === "asNeeded"
                ? DURATION_OPTIONS_SEM_AGENDA
                : DURATION_OPTIONS
            }
            onChange={handleDurationChange}
          />

          {/* Mês não tem tamanho fixo, então a conta é feita em meses e não convertida pra dias. */}
          {duration === "fixed" ? (
            <View style={styles.fieldGroup}>
              <TextField
                label="Quanto tempo dura"
                placeholder="Ex: 7"
                value={durationAmount}
                onChangeText={(raw) =>
                  setDurationAmount(formatIntegerInput(raw, 3))
                }
                onFocus={scrollToFocusedInput}
                keyboardType="number-pad"
                maxLength={3}
                error={
                  hasDurationError ? "Informe um número inteiro." : undefined
                }
              />
              <OptionGroup
                value={durationUnit}
                options={DURATION_UNIT_OPTIONS}
                onChange={setDurationUnit}
              />
            </View>
          ) : null}
          {/* Hoje conta, e conta parcialmente: as doses que já passaram não entram. */}
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

          {/* "Por 1 dia" cadastrado depois do último horário não alcança dose nenhuma, e sem este
              aviso a linha de resumo só sumia. */}
          {prazoSemDose ? (
            <Text style={styles.avisoDeConflito}>
              Nesse prazo não sobra nenhuma dose: os horários de hoje já
              passaram. Aumente os dias ou revise os horários.
            </Text>
          ) : null}

          {faltaDeDose !== null ? (
            <View style={styles.avisoDePrazo}>
              <Text style={styles.sectionHintDestaque}>
                Esse prazo entrega {faltaDeDose.planejadas} das{" "}
                {faltaDeDose.nominais} doses do tratamento, porque os horários
                de hoje que já passaram não entram.
              </Text>
              <Button
                label={`Estender até ${toDateInput(faltaDeDose.fimQueCompleta)} e completar as ${faltaDeDose.nominais} doses`}
                variant="outline"
                onPress={() => {
                  const nova = treatmentDuration(
                    startDate,
                    faltaDeDose.fimQueCompleta,
                  );
                  // `null` só sairia com data inválida, e esta veio do próprio domínio.
                  if (nova === null) return;
                  setDurationUnit(nova.unit);
                  setDurationAmount(String(nova.amount));
                }}
              />
            </View>
          ) : null}

          {/* O app não agenda dose que já passou, mas descartar em silêncio faria a pessoa sair
              achando que agendou o dia inteiro. */}
          {horariosDeHojeDescartados.length > 0 &&
          !prazoSemDose &&
          initialValue === undefined ? (
            <>
              <Text style={styles.sectionHintDestaque}>
                {horariosDeHojeDescartados.length === 1
                  ? `O horário de hoje às ${horariosDeHojeDescartados[0]} já passou e não será agendado.`
                  : `Os horários de hoje às ${emLista(horariosDeHojeDescartados)} já passaram e não serão agendados.`}{" "}
                O acompanhamento começa na próxima dose, e amanhã o dia inteiro
                entra normalmente.
              </Text>

              {/* Nada vem marcado: marcar pelo paciente seria inventar registro clínico. */}
              <Text style={styles.fieldLabel}>
                VOCÊ JÁ TOMOU ALGUMA DELAS HOJE?
              </Text>
              <ToggleChips
                label=""
                values={jaTomadosValidos}
                options={horariosDeHojeDescartados.map((horario) => ({
                  value: horario,
                  label: horario,
                }))}
                onChange={setHorariosJaTomados}
              />
              <Text style={styles.sectionHint}>
                {jaTomadosValidos.length === 0
                  ? "Marque só o que você realmente tomou. Deixar em branco não registra nada."
                  : `${jaTomadosValidos.length === 1 ? "1 dose entra" : `${jaTomadosValidos.length} doses entram`} no seu histórico de hoje. O estoque não muda: o que você informou acima já é o que tem na caixa agora.`}
              </Text>
            </>
          ) : null}
        </Card>

        {essencialCompleto ? (
          <>
            <View style={styles.revelacao}>
              <Text style={styles.revelacaoTitulo}>Já pode cadastrar!</Text>
              <Text style={styles.revelacaoHint}>
                O resto abaixo é opcional.
              </Text>
            </View>

            <Card>
              <Text style={styles.sectionTitle}>Estoque</Text>
              {tracksStock ? (
                <>
                  <Pressable
                    style={estadoDePressao([
                      styles.rowValue,
                      styles.rowValueAtivo,
                    ])}
                    onPress={() => setStockSheetOpen(true)}
                    accessibilityRole="button"
                    // Sem rótulo, o leitor concatena os filhos e anuncia "Controle ativo Editar".
                    accessibilityLabel="Editar o controle de estoque"
                  >
                    <Text style={styles.rowValueText}>
                      {linhasDoEstoque.length > 0
                        ? "Controle ativo"
                        : "Nada preenchido ainda"}
                    </Text>
                    <Text style={styles.rowValueAction}>Editar</Text>
                  </Pressable>
                  {linhasDoEstoque.length > 0 ? (
                    <View style={styles.resumoBloco}>
                      {linhasDoEstoque.map((linha) => (
                        <View key={linha.rotulo} style={styles.resumoLinha}>
                          <Text style={styles.resumoRotulo}>
                            {linha.rotulo}
                          </Text>
                          <Text style={styles.resumoValor}>{linha.valor}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {/* Aviso, não bloqueio: o app não sabe o que já está a caminho da farmácia. */}
                  {estoqueInsuficiente ? (
                    <Text style={styles.avisoDeConflito}>
                      O tratamento inteiro consome {consumoDoTratamento}{" "}
                      {stockUnit === null ? "" : UNIT_NOUNS[stockUnit]} e você
                      tem {parsedStock}. Vale comprar antes de acabar.
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  <Text style={styles.sectionHint}>
                    O Mapill desconta cada dose tomada e avisa antes de acabar,
                    pra você comprar sem interromper o tratamento.
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
              <Text style={styles.sectionTitle}>Anexos</Text>

              {/* `key` na presença da foto: dentro do `Pressable` que dispensa o teclado esta linha
                  não recompunha na estreia, e a miniatura ficava invisível. Ver `FichaDeSaudeScreen`. */}
              <View
                style={styles.photoRow}
                key={photoUri === null ? "sem-caixa" : "com-caixa"}
              >
                <Pressable
                  style={estadoDePressao(
                    [
                      styles.photoQuadro,
                      photoUri === null && styles.photoVazio,
                    ],
                    {
                      escala: !boxPhoto.isPicking,
                      opacidade: !boxPhoto.isPicking,
                    },
                  )}
                  onPress={() =>
                    photoUri
                      ? setMidiaAberta({
                          uri: photoUri,
                          titulo: "Foto da caixa",
                        })
                      : setOrigemPendente("caixa")
                  }
                  disabled={boxPhoto.isPicking}
                  accessibilityRole="button"
                  accessibilityLabel={
                    photoUri
                      ? "Ver a foto da embalagem"
                      : "Adicionar foto da embalagem"
                  }
                >
                  {photoUri ? (
                    <FotoLocal uri={photoUri} style={styles.photo} />
                  ) : (
                    <MaterialCommunityIcons
                      name="camera-plus"
                      size={24}
                      color={cores.onSurfaceVariant}
                    />
                  )}
                </Pressable>
                <View style={styles.photoTextGroup}>
                  {photoUri === null ? (
                    <Pressable
                      style={estadoDePressao(styles.alvoDeLinkRente)}
                      onPress={() => setOrigemPendente("caixa")}
                      accessibilityRole="button"
                      hitSlop={12}
                    >
                      <Text style={styles.photoAddLabel}>Adicionar foto da caixa</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.acoesDeAnexo}>
                      <Pressable
                        style={estadoDePressao(styles.alvoDeLinkRente)}
                        onPress={() => setOrigemPendente("caixa")}
                        accessibilityRole="button"
                        accessibilityLabel="Alterar a foto da caixa"
                        hitSlop={12}
                      >
                        <Text style={styles.photoAddLabel}>Alterar anexo</Text>
                      </Pressable>
                      <Pressable
                        style={estadoDePressao(styles.alvoDeLinkRente)}
                        onPress={removerFotoDaCaixa}
                        accessibilityRole="button"
                        accessibilityLabel="Excluir a foto da caixa"
                        hitSlop={12}
                      >
                        <Text style={styles.photoExcluirLabel}>Excluir</Text>
                      </Pressable>
                    </View>
                  )}
                  <Text style={styles.photoHint}>
                    Ajuda a reconhecer o remédio de relance.
                  </Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Receita médica</Text>

              {/* `key` nos três estados do anexo, e não só em "tem ou não tem": trocar um PDF por
                  uma foto é uma estreia de imagem como as outras, e sem o `kind` ficaria invisível.
                  Mesma remontagem da ficha de saúde. */}
              <View
                style={styles.photoRow}
                key={
                  attachmentUri === null
                    ? "sem-receita"
                    : `com-receita-${attachmentKind}`
                }
              >
                <Pressable
                  style={estadoDePressao(
                    [
                      styles.photoQuadro,
                      attachmentUri === null && styles.photoVazio,
                    ],
                    {
                      escala:
                        !prescriptionPhoto.isPicking &&
                        !prescriptionFile.isPicking,
                      opacidade:
                        !prescriptionPhoto.isPicking &&
                        !prescriptionFile.isPicking,
                    },
                  )}
                  onPress={() => void verReceita()}
                  disabled={
                    prescriptionPhoto.isPicking || prescriptionFile.isPicking
                  }
                  accessibilityRole="button"
                  accessibilityLabel={
                    attachmentUri === null
                      ? "Adicionar anexo da receita médica"
                      : "Ver a receita médica"
                  }
                >
                  {attachmentUri !== null && attachmentKind === "image" ? (
                    <FotoLocal uri={attachmentUri} style={styles.photo} />
                  ) : (
                    <MaterialCommunityIcons
                      name={
                        attachmentUri === null
                          ? "file-document-outline"
                          : "file-pdf-box"
                      }
                      size={24}
                      color={
                        attachmentUri === null
                          ? cores.onSurfaceVariant
                          : cores.primary
                      }
                    />
                  )}
                </Pressable>
                <View style={styles.photoTextGroup}>
                  {attachmentUri === null ? (
                    <Pressable
                      style={estadoDePressao(styles.alvoDeLinkRente, {
                        opacidade:
                          !prescriptionPhoto.isPicking &&
                          !prescriptionFile.isPicking,
                      })}
                      onPress={() => setOrigemPendente("receita")}
                      disabled={
                        prescriptionPhoto.isPicking ||
                        prescriptionFile.isPicking
                      }
                      accessibilityRole="button"
                      hitSlop={12}
                    >
                      <Text style={styles.photoAddLabel}>
                        Adicionar arquivo
                      </Text>
                    </Pressable>
                  ) : (
                    // Trocar existe além de remover porque remover leva junto a validade e o aviso.
                    <View style={styles.acoesDeAnexo}>
                      <Pressable
                        style={estadoDePressao(styles.alvoDeLinkRente)}
                        onPress={() => setOrigemPendente("receita")}
                        accessibilityRole="button"
                        hitSlop={12}
                      >
                        <Text style={styles.photoAddLabel}>Alterar anexo</Text>
                      </Pressable>
                      {/* Rótulo igual nos dois tipos de anexo; o `accessibilityLabel` diz qual é qual. */}
                      <Pressable
                        style={estadoDePressao(styles.alvoDeLinkRente)}
                        onPress={removerReceita}
                        accessibilityRole="button"
                        accessibilityLabel={
                          attachmentKind === "document"
                            ? "Excluir a receita"
                            : "Excluir a foto da receita"
                        }
                        hitSlop={12}
                      >
                        <Text style={styles.photoExcluirLabel}>Excluir</Text>
                      </Pressable>
                    </View>
                  )}
                  <Text style={styles.photoHint}>
                    {attachmentUri !== null && attachmentName.length > 0
                      ? attachmentName
                      : `Aceita ${ACCEPTED_DOCUMENT_LABEL}.`}
                  </Text>
                </View>
              </View>

              {/* Validade só depois do anexo: sem receita guardada, não há o que vencer. */}
              {attachmentUri !== null ? (
                // Receita vencida não é aceita, então o calendário nem oferece os dias passados.
                <DateField
                  /* `key` que muda com o tipo do anexo: o que força a remontagem é o valor mudar,
                     e aqui ele muda ao trocar um PDF por uma foto sem passar por "sem anexo". */
                  key={`validade-${attachmentKind ?? "sem"}`}
                  label="Receita válida até"
                  value={validUntilInput}
                  onChangeText={setValidUntilInput}
                  onFocus={scrollToFocusedInput}
                  error={validUntilError}
                  minimo={new Date()}
                />
              ) : null}

              {/* Só depois da validade: sem data, o aviso não tem de quando contar. */}
              {attachmentUri !== null && validUntilIso !== null ? (
                <>
                  {/* Marcar já basta: sem prazo escolhido, o aviso sai no dia do vencimento. */}
                  <Checkbox
                    checked={wantsRenewalReminder}
                    onChange={setWantsRenewalReminder}
                    label="Me avisar quando a receita vencer"
                    accessibilityLabel="Me avisar quando a receita vencer"
                  />
                  {wantsRenewalReminder ? (
                    <>
                      <OptionGroup
                        label="Avisar antes também (opcional)"
                        value={renewalLeadDays}
                        options={RENEWAL_LEAD_OPTIONS}
                        /**
                         * Tocar na opção já marcada desmarca — a mesma regra da antecedência de
                         * estoque.
                         *
                         * O rótulo diz "(opcional)" e o texto abaixo descreve os dois estados, mas
                         * não havia como **voltar** ao sem prazo: escolhido um, a única saída era
                         * desmarcar o aviso inteiro e marcar de novo. Onde o vazio é um estado
                         * válido, ele precisa ser alcançável pelo mesmo gesto que o abandonou.
                         */
                        onChange={(dias) =>
                          setRenewalLeadDays(dias === renewalLeadDays ? null : dias)
                        }
                      />
                      {/* A promessa muda: sem prazo é um aviso, com prazo são dois. */}
                      <Text style={styles.sectionHint}>
                        {renewalLeadDays === null
                          ? "Você será avisado no dia em que a receita vencer. Se quiser saber antes, escolha um prazo acima."
                          : `Você será avisado ${renewalLeadDays} dias antes e também no dia em que a receita vencer.`}
                      </Text>
                    </>
                  ) : null}
                  {avisoDeRenovacao !== null ? (
                    <Text style={styles.sectionHintDestaque}>
                      {avisoDeRenovacao}
                    </Text>
                  ) : null}
                </>
              ) : null}
            </Card>

            {frequency !== "asNeeded" ? (
              <Card>
                <Text style={styles.sectionTitle}>Lembrete</Text>
                {reminderMode !== null ? (
                  <Pressable
                    style={estadoDePressao([
                      styles.rowValue,
                      styles.rowValueAtivo,
                    ])}
                    onPress={() => setReminderSheetOpen(true)}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar o lembrete, hoje em ${REMINDER_LABELS[reminderMode]}`}
                  >
                    <Text style={styles.rowValueText}>
                      {REMINDER_LABELS[reminderMode]}
                    </Text>
                    <Text style={styles.rowValueAction}>Editar</Text>
                  </Pressable>
                ) : null}
                {/* Sem horário futuro a linha diz isso em vez de sumir: é o caso do horário
                    editado para uma hora de hoje que já passou, e o silêncio pareceria defeito. */}
                {reminderMode !== null && reminderMode !== "none" ? (
                  <Text
                    style={
                      proximaDoseAgendavel === null
                        ? styles.previsaoDoLembreteVazia
                        : styles.previsaoDoLembrete
                    }
                  >
                    {proximaDoseAgendavel === null
                      ? "Não há horário futuro nos próximos 7 dias, então nada seria agendado. Confira os horários e a data de início."
                      : `Ao salvar: ${previsaoDoLembrete(reminderMode, proximaDoseAgendavel)}.`}
                  </Text>
                ) : null}
                {reminderMode === null ? (
                  <>
                    <Text style={styles.sectionHint}>
                      O Mapill pode te procurar na hora da dose, com notificação
                      ou com alarme de despertador. Você escolhe o quanto ele
                      insiste.
                    </Text>
                    <Button
                      label="Configurar lembrete"
                      onPress={() => setReminderSheetOpen(true)}
                    />
                  </>
                ) : null}
              </Card>
            ) : null}

            <Card>
              <Text style={styles.sectionTitle}>Informações adicionais</Text>
              <Text style={styles.sectionHint}>
                Só anotação, pra você lembrar depois. Nada aqui altera os
                horários.
              </Text>

              <ToggleChips
                label="Como tomar"
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
                  label="Qual orientação?"
                  placeholder="Ex: diluir em meio copo d'água"
                  value={intakeNote}
                  onChangeText={setIntakeNote}
                  onFocus={scrollToFocusedInput}
                  maxLength={300}
                />
              ) : null}

              <TextField
                label="Princípio ativo"
                placeholder="Ex: Losartana potássica"
                value={activeIngredient}
                onChangeText={setActiveIngredient}
                onFocus={scrollToFocusedInput}
                maxLength={120}
              />
              <TextField
                label="Observação geral"
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

      <RodapeDeFormulario>
        <Button
          label={
            initialValue === undefined
              ? "Salvar medicação"
              : "Salvar alterações"
          }
          onPress={handleSubmit}
          disabled={!canSubmit}
        />
        {pendencias.length > 0 ? (
          <Text style={styles.submitHint}>
            Falta preencher {emLista(pendencias)}.
          </Text>
        ) : null}
      </RodapeDeFormulario>

      <ConfiguracaoDeEstoque
        visible={isStockSheetOpen}
        onClose={() => setStockSheetOpen(false)}
        onDisable={handleStockDisable}
        aceitaFracao={stockUnit !== null && allowsFractionalDose(stockUnit)}
        aviso={avisoDeAntecedencia}
        avisoEhConflito={antecedenciaConflita}
        quantityLabel={
          stockUnit === null
            ? "Quantas unidades você tem"
            : `${quantosDe(stockUnit)} ${UNIT_NOUNS[stockUnit]} você tem`
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
        /* Rota no mesmo stack do cadastro, e não um segundo modal por cima: no Android dois modais
           empilhados travam a tela. */
        onAbrirAjuda={() => {
          setReminderSheetOpen(false);
          router.push("/cadastro/ajuda-de-alertas");
        }}
        /* `none` é o mesmo valor de quem nunca configurou, e o reagendamento já ignora esse modo. */
        onRemover={() => {
          setReminderMode("none");
          setReminderSheetOpen(false);
        }}
      />

      <VisualizadorDeMidia
        uri={midiaAberta?.uri ?? null}
        titulo={midiaAberta?.titulo ?? ""}
        onClose={() => setMidiaAberta(null)}
      />

      <EscolhaDeOrigemDaFoto
        visible={origemPendente !== null}
        title={
          origemPendente === "receita" ? "Anexo da receita" : "Foto da caixa"
        }
        onClose={() => setOrigemPendente(null)}
        onEscolher={(origin) => void escolherOrigem(origin)}
        // Só a receita aceita arquivo: PDF da caixa do remédio não existe.
        onEscolherArquivo={
          origemPendente === "receita"
            ? () => {
                setOrigemPendente(null);
                void escolherArquivoDaReceita();
              }
            : undefined
        }
      />
    </SafeAreaView>
  );
}
