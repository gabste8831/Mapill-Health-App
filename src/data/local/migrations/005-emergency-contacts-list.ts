/**
 * Substitui o contato de emergência único (colunas soltas da migration 004) por uma lista —
 * mesmo padrão de `allergies`: JSON array serializado numa única coluna, sem tabela relacional.
 *
 * As colunas antigas (`emergency_contact_name/phone/relationship`) ficam para trás, sem uso.
 * Não há dado real de paciente ainda, e migrar via SQL puro dependeria do JSON1, que não é
 * consistente entre builds do SQLite. Migration publicada não se edita — a correção vem sempre
 * numa migration nova.
 */
export const MIGRATION_005_EMERGENCY_CONTACTS_LIST = `
ALTER TABLE patient_profiles ADD COLUMN emergency_contacts TEXT NOT NULL DEFAULT '[]';
`;
