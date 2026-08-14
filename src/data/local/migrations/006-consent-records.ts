/**
 * Tabela de prova de consentimento LGPD. Sem vínculo com patient_profiles de propósito — o
 * consentimento acontece ANTES da ficha de saúde no fluxo (login → consentimento → ficha), tem
 * que existir mesmo que o paciente ainda não tenha nenhum outro dado salvo.
 */
export const MIGRATION_006_CONSENT_RECORDS = `
CREATE TABLE IF NOT EXISTS consent_records (
  id TEXT PRIMARY KEY NOT NULL,
  terms_version TEXT NOT NULL,
  accepted_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  deleted_at TEXT
);
`;
