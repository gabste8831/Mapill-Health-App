import type { InventoryAdjustment, InventoryItem } from "../entities/inventory-item";
import type { Repository } from "./repository";

export interface InventoryRepository extends Repository<InventoryItem> {
  findByMedication(medicationId: string): Promise<InventoryItem | null>;
  /** Nunca deixa quantity ir a negativo — implementação faz clamp em zero. */
  applyAdjustment(adjustment: InventoryAdjustment): Promise<void>;
}
