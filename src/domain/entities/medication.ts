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

export type Medication = SyncableEntity & {
  name: string;
  activeIngredient: string;
  presentation: string;
  form: MedicationForm;
  /** Foto da embalagem — identificação visual, não documento. Caminho local. */
  photoUri: string | null;
  ean: string | null;
  fromCmed: boolean;
};
