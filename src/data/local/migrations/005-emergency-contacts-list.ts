/**
 * Substitui o contato de emergência único (colunas soltas da migration 004) por uma lista —
 * mesmo padrão de `allergies`: JSON array serializado numa única coluna, sem tabela relacional.
 *
 * As colunas antigas (`emergency_contact_name/phone/relationship`) ficam para trás, sem uso —
 * não há dado real de paciente em produção ainda nesta fase do projeto, então não vale o risco
 * de uma migração de dados via SQL puro (JSON1 nem sempre disponível/consistente entre builds
 * do SQLite). Nunca editar a migration 004 já publicada, só seguir em frente.
 */
export const MIGRATION_005_EMERGENCY_CONTACTS_LIST = `
ALTER TABLE patient_profiles ADD COLUMN emergency_contacts TEXT NOT NULL DEFAULT '[]';
`;
