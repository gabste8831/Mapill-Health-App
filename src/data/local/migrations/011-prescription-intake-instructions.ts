/**
 * Como tomar (jejum, com água, não deitar depois) numa coluna própria.
 *
 * JSON e não uma tabela de ligação: são poucos valores de uma lista fechada, sempre lidos junto
 * com a prescrição e nunca consultados sozinhos — mesma razão de `schedule` na migration 008.
 *
 * Default `'[]'` e não `NULL`: nenhuma marcada é uma resposta, e deixar nulo obrigaria todo
 * leitor a decidir de novo o que a ausência significa.
 */
export const MIGRATION_011_PRESCRIPTION_INTAKE_INSTRUCTIONS = `
ALTER TABLE prescriptions ADD COLUMN intake_instructions TEXT NOT NULL DEFAULT '[]';
`;
