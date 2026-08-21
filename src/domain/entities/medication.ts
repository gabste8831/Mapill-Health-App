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

/** A unidade mais provável da forma — a primeira da lista. */
export function defaultUnitForMedicationForm(form: MedicationForm): PosologyUnit {
  return UNITS_BY_FORM[form][0];
}

/**
 * Formas em que a unidade da dose é genuinamente ambígua: líquido pode ser medido em ml ou mg,
 * injeção em ml, UI ou mg. Nas demais a unidade é consequência da forma, e perguntar seria pedir
 * pro paciente confirmar o óbvio — quem marcou adesivo toma adesivo.
 */
const FORMS_WITH_AMBIGUOUS_UNIT: readonly MedicationForm[] = ["liquid", "injection", "other"];

export function needsUnitChoice(form: MedicationForm): boolean {
  return FORMS_WITH_AMBIGUOUS_UNIT.includes(form);
}

/**
 * Unidades que aceitam fração. Não é preferência de formato: é o que existe no mundo físico.
 *
 * Meio comprimido é rotina e o sulco no meio dele está lá pra isso; meia gota não existe, meio
 * adesivo não existe, meio sachê é sachê aberto. Cápsula fica de fora porque não se parte sem
 * derramar o conteúdo. ml, mg, g e UI são medidas contínuas.
 *
 * Deixar passar "1,5 gotas" não é só feio: vira estoque descontado com número quebrado e um
 * aviso de dose que ninguém consegue cumprir.
 */
const UNITS_WITH_FRACTION: readonly PosologyUnit[] = ["tablet", "ml", "mg", "g", "IU"];

export function allowsFractionalDose(unit: PosologyUnit): boolean {
  return UNITS_WITH_FRACTION.includes(unit);
}

/**
 * Unidade em que o estoque é contado — nem sempre a da dose. Gota se toma em gota mas se compra
 * em ml, e é o ml que está impresso no frasco. `null` = a forma é livre demais pra supor, então
 * segue a dose.
 *
 * Contar na unidade errada quebra a única conta que o estoque existe pra fazer: quantos dias
 * ainda dá.
 */
const STOCK_UNIT_BY_FORM: Record<MedicationForm, PosologyUnit | null> = {
  tablet: "tablet",
  liquid: null,
  drops: "ml",
  injection: null,
  ointment: "g",
  sublingual: "tablet",
  inhaler: "puff",
  patch: "patch",
  sachet: "sachet",
  other: null,
};

export function stockUnitForMedicationForm(
  form: MedicationForm,
  doseUnit: PosologyUnit,
): PosologyUnit {
  return STOCK_UNIT_BY_FORM[form] ?? doseUnit;
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
