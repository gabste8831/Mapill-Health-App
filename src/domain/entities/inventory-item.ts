import type { SyncableEntity } from "./syncable";

export type InventoryItem = SyncableEntity & {
  medicationId: string;
  quantity: number;
  unit: string;
};

export type InventoryAdjustmentReason = "manual_recount" | "restock" | "intake_consumption";

/** Log de todo evento que mexe em quantity — separado pra distinguir recontagem manual de consumo real. */
export type InventoryAdjustment = SyncableEntity & {
  inventoryItemId: string;
  delta: number;
  reason: InventoryAdjustmentReason;
};
