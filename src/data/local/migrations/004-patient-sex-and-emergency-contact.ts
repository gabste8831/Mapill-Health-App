/**
 * Adiciona sexo biológico e contato de emergência a `patient_profiles`. Colunas do contato
 * ficam soltas (não em tabela própria) porque é um dado único por perfil, sem histórico —
 * mesmo raciocínio de `allergies` ser texto livre em vez de tabela relacional.
 */
export const MIGRATION_004_PATIENT_SEX_AND_EMERGENCY_CONTACT = `
ALTER TABLE patient_profiles ADD COLUMN biological_sex TEXT;
ALTER TABLE patient_profiles ADD COLUMN emergency_contact_name TEXT;
ALTER TABLE patient_profiles ADD COLUMN emergency_contact_phone TEXT;
ALTER TABLE patient_profiles ADD COLUMN emergency_contact_relationship TEXT;
`;
