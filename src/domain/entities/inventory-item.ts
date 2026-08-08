import type { SyncableEntity } from "./syncable";

export type InventoryItem = SyncableEntity & {
  medicationId: string;
  quantity: number;
  unit: string;
  /** Controle total do paciente: sem alerta automático de estoque baixo por padrão. */
  lowStockAlertEnabled: boolean;
  /** Dias de antecedência pro alerta. Só tem sentido quando `lowStockAlertEnabled` é true. */
  lowStockAlertLeadDays: number | null;
};

export type InventoryAdjustmentReason =
  | "manual_recount"
  | "restock"
  | "intake_consumption"
  /** Gerado quando uma correção retroativa de IntakeLog muda o delta de estoque já aplicado. */
  | "intake_correction";

/** Log de todo evento que mexe em quantity — separado pra distinguir recontagem manual de consumo real. */
export type InventoryAdjustment = SyncableEntity & {
  inventoryItemId: string;
  delta: number;
  reason: InventoryAdjustmentReason;
};
