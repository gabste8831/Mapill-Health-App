/**
 * Tarja do medicamento e validade da receita anexada.
 *
 * `prescription_requirement` default `none` (isento): é o valor que **esconde** os campos de
 * receita. Para uma linha anterior ao campo, esconder é mais seguro que exibir — mostrar
 * "validade da receita" de um remédio que não precisa de receita é justamente o ruído que este
 * campo existe pra eliminar.
 */
export const MIGRATION_010_PRESCRIPTION_REQUIREMENT = `
ALTER TABLE medications ADD COLUMN prescription_requirement TEXT NOT NULL DEFAULT 'none';
ALTER TABLE prescriptions ADD COLUMN attachment_valid_until TEXT;
`;
