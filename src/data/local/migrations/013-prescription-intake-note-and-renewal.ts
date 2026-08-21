/**
 * Observação livre de "como tomar" e antecedência do aviso de vencimento da receita.
 *
 * `intake_note` é separado de `notes` porque tem destino diferente: ele acompanha a dose na hora
 * de tomar ("diluir em meio copo"), enquanto `notes` descreve o tratamento. Juntar os dois faria
 * o aviso da dose carregar texto que não tem nada a ver com aquele momento.
 *
 * `renewal_reminder_lead_days` fica nulo por padrão porque querer o aviso é decisão, não
 * consequência de ter anexado a receita — a de um antibiótico de 7 dias vence sem que isso
 * importe.
 */
export const MIGRATION_013_PRESCRIPTION_INTAKE_NOTE_AND_RENEWAL = `
ALTER TABLE prescriptions ADD COLUMN intake_note TEXT;
ALTER TABLE prescriptions ADD COLUMN renewal_reminder_lead_days INTEGER;
`;
