/**
 * Quanto se toma em cada dose agendada.
 *
 * Estava implícito na prescrição, o que funcionava só enquanto toda dose de um tratamento era
 * igual. Insulina 10 UI de manhã e 8 UI à noite não cabe num número por prescrição — e ler da
 * prescrição na hora de exibir traria um segundo problema: editar a posologia amanhã reescreveria
 * o que estava agendado ontem.
 *
 * O `UPDATE` preenche o passado com a dose da prescrição, que é exatamente o que ele valia
 * enquanto a dose era única. O default 0 só existe porque a coluna é NOT NULL na criação; nenhuma
 * linha fica com ele depois do UPDATE, e as novas vêm sempre preenchidas pelo gerador.
 */
export const MIGRATION_012_DOSE_SCHEDULE_AMOUNT = `
ALTER TABLE dose_schedules ADD COLUMN amount REAL NOT NULL DEFAULT 0;
UPDATE dose_schedules
SET amount = COALESCE(
  (SELECT dose_amount FROM prescriptions WHERE prescriptions.id = dose_schedules.prescription_id),
  0
);
`;
