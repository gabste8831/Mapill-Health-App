/**
 * Colunas que o cadastro ampliado exige (ver B2 no plano):
 *
 * - `medications.form` — forma farmacêutica. Define as unidades de dose oferecidas. Default
 *   `other` porque é o único valor honesto pra uma linha que existia antes do campo: o app não
 *   tem como saber a apresentação retroativamente, e chutar "tablet" inventaria dado clínico.
 * - `medications.photo_uri` — foto da embalagem, para identificação visual.
 * - `prescriptions.notes` — observação livre do tratamento.
 * - `prescriptions.attachment_*` — receita anexada, com opt-out de nuvem por item (decisão nº10).
 * - `inventory_items.storage_location` — onde a caixa está guardada em casa.
 *
 * Todas nuláveis (ou com default) porque `ALTER TABLE ADD COLUMN` não aceita `NOT NULL` sem
 * default em tabela já populada.
 */
export const MIGRATION_009_MEDICATION_FORM_AND_ATTACHMENTS = `
ALTER TABLE medications ADD COLUMN form TEXT NOT NULL DEFAULT 'other';
ALTER TABLE medications ADD COLUMN photo_uri TEXT;
ALTER TABLE prescriptions ADD COLUMN notes TEXT;
ALTER TABLE prescriptions ADD COLUMN attachment_uri TEXT;
ALTER TABLE prescriptions ADD COLUMN attachment_kind TEXT;
ALTER TABLE prescriptions ADD COLUMN attachment_sync_opt_out INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN storage_location TEXT;
`;
