import type { SyncableEntity } from "./syncable";

/**
 * Forma farmacêutica. Define quais unidades de dose fazem sentido — filtrar não é inferir valor
 * clínico, é evitar combinação sem significado como "3 jatos de pomada".
 */
export type MedicationForm =
  | "tablet"
  | "liquid"
  | "drops"
  | "injection"
  | "ointment"
  | "sublingual"
  | "inhaler"
  | "patch"
  | "sachet"
  | "other";

/** Unidade em que a dose é medida. Universais (mg, ml, UI) convivem com as de contagem. */
export type PosologyUnit =
  | "tablet"
  | "capsule"
  | "drop"
  | "ml"
  | "mg"
  | "g"
  | "IU"
  | "application"
  | "puff"
  | "patch"
  | "sachet";

/**
 * Unidades oferecidas para cada forma, na ordem em que aparecem — a primeira é a mais provável.
 * `other` oferece tudo: se o app não reconhece a apresentação, quem sabe é o paciente.
 */
const UNITS_BY_FORM: Record<MedicationForm, PosologyUnit[]> = {
  tablet: ["tablet", "capsule", "mg"],
  liquid: ["ml", "mg", "g"],
  drops: ["drop", "ml"],
  injection: ["ml", "IU", "mg"],
  ointment: ["application", "g"],
  sublingual: ["tablet", "drop", "mg"],
  inhaler: ["puff"],
  patch: ["patch"],
  sachet: ["sachet", "g", "mg"],
  other: ["tablet", "capsule", "drop", "ml", "mg", "g", "IU", "application", "puff", "patch", "sachet"],
};

export function unitsForMedicationForm(form: MedicationForm): PosologyUnit[] {
  return UNITS_BY_FORM[form];
}

/**
 * Tarja / exigência de receita. Comanda quais campos de receita o cadastro mostra: quem cadastra
 * dipirona não deveria nem ver "validade da receita".
 *
 * Vem preenchido da CMED quando o medicamento está na base (bloco B1), e continua editável — a
 * base pode estar desatualizada, e quem tem a caixa na mão é o paciente.
 */
export type PrescriptionRequirement =
  /** Isento de prescrição (MIP). */
  | "none"
  /** Tarja vermelha, receita simples. */
  | "simple"
  /** Tarja vermelha com retenção. */
  | "retained"
  /** Tarja preta, receituário de controle especial. */
  | "special";

/** Se vale a pena pedir dados de receita para esta exigência. */
export function requiresPrescription(requirement: PrescriptionRequirement): boolean {
  return requirement !== "none";
}

export type Medication = SyncableEntity & {
  name: string;
  activeIngredient: string;
  presentation: string;
  form: MedicationForm;
  prescriptionRequirement: PrescriptionRequirement;
  /** Foto da embalagem — identificação visual, não documento. Caminho local. */
  photoUri: string | null;
  ean: string | null;
  fromCmed: boolean;
};
