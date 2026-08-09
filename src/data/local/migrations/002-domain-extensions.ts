/**
 * Acompanha as entidades adicionadas/alteradas na conferência de contexto de 2026-08-07:
 * reminderMode, snoozeCount, deferred/correctsLogId, alerta de estoque configurável,
 * anexo de receita em appointments, e a nova tabela patient_profiles.
 */
export const MIGRATION_002_DOMAIN_EXTENSIONS = `
ALTER TABLE prescriptions ADD COLUMN reminder_mode TEXT NOT NULL DEFAULT 'none';

ALTER TABLE dose_schedules ADD COLUMN snooze_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE intake_logs ADD COLUMN corrects_log_id TEXT REFERENCES intake_logs(id);

ALTER TABLE inventory_items ADD COLUMN low_stock_alert_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN low_stock_alert_lead_days INTEGER;

ALTER TABLE appointments ADD COLUMN prescription_photo_uri TEXT;
ALTER TABLE appointments ADD COLUMN prescription_valid_until TEXT;
ALTER TABLE appointments ADD COLUMN photo_sync_opt_out INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS patient_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  photo_uri TEXT,
  blood_type TEXT,
  allergies TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  photo_sync_opt_out INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);
`;
