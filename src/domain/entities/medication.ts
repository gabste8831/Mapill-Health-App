import type { SyncableEntity } from "./syncable";

export type Medication = SyncableEntity & {
  name: string;
  activeIngredient: string;
  presentation: string;
  ean: string | null;
  fromCmed: boolean;
};
