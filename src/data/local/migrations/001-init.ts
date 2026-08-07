export const MIGRATION_001_INIT = `
CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  active_ingredient TEXT NOT NULL,
  presentation TEXT NOT NULL,
  ean TEXT,
  from_cmed INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY NOT NULL,
  medication_id TEXT NOT NULL REFERENCES medications(id),
  dose_amount REAL NOT NULL,
  dose_unit TEXT NOT NULL,
  frequency_minutes INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS dose_schedules (
  id TEXT PRIMARY KEY NOT NULL,
  prescription_id TEXT NOT NULL REFERENCES prescriptions(id),
  scheduled_for TEXT NOT NULL,
  notification_id TEXT,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS intake_logs (
  id TEXT PRIMARY KEY NOT NULL,
  dose_schedule_id TEXT NOT NULL REFERENCES dose_schedules(id),
  status TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY NOT NULL,
  medication_id TEXT NOT NULL REFERENCES medications(id),
  quantity REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id TEXT PRIMARY KEY NOT NULL,
  inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id),
  delta REAL NOT NULL,
  reason TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  notes TEXT,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);
`;
