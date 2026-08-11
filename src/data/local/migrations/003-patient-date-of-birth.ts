/**
 * Adiciona `date_of_birth` a `patient_profiles`. Nasce nullable por restrição do SQLite
 * (ALTER TABLE ADD COLUMN não aceita NOT NULL sem default fixo em coluna já populada) — a
 * obrigatoriedade do campo é regra de apresentação/use-case, não de schema, igual a outros
 * campos client-side desta tabela.
 */
export const MIGRATION_003_PATIENT_DATE_OF_BIRTH = `
ALTER TABLE patient_profiles ADD COLUMN date_of_birth TEXT;
`;
