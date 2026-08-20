/**
 * Nome e sobrenome viram um campo só. Separar os dois só faz sentido se algo consumir as
 * partes, e nada consome — o app exibe o nome inteiro e, quando precisa saudar, deriva o
 * primeiro nome do texto. Guardar como o paciente digitou também evita a ambiguidade de
 * nome composto ("Ana Maria") e de sobrenome com partícula ("da Silva").
 *
 * As colunas antigas são removidas de verdade, e não deixadas para trás como na 005: aqui
 * elas são `NOT NULL` sem default, então continuariam obrigando todo INSERT a preenchê-las.
 * DROP COLUMN exige SQLite 3.35+ e que a coluna não esteja em índice — nenhuma das duas está.
 */
export const MIGRATION_007_PATIENT_FULL_NAME = `
ALTER TABLE patient_profiles ADD COLUMN full_name TEXT NOT NULL DEFAULT '';
UPDATE patient_profiles SET full_name = TRIM(first_name || ' ' || last_name);
ALTER TABLE patient_profiles DROP COLUMN first_name;
ALTER TABLE patient_profiles DROP COLUMN last_name;
`;
