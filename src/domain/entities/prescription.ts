import type { SyncableEntity } from "./syncable";

export type PosologyUnit = "mg" | "ml" | "comprimido" | "gota" | "UI";

export type Prescription = SyncableEntity & {
  medicationId: string;
  doseAmount: number;
  doseUnit: PosologyUnit;
  /** Intervalo entre doses em minutos (a cada 8h = 480). */
  frequencyMinutes: number;
  startDate: string;
  /** null = tratamento contínuo, não "esqueceram de preencher". */
  endDate: string | null;
};
