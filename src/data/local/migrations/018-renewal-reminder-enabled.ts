/**
 * Separa "quero ser avisado" de "quero ser avisado com N dias".
 *
 * `prescriptions.renewal_reminder_enabled` guarda a intenção; `renewal_reminder_lead_days`
 * continua guardando o prazo do aviso **extra**, e volta a poder ser nulo sem que isso signifique
 * silêncio.
 *
 * Enquanto as duas informações moravam na mesma coluna, marcar "me avisar antes de a receita
 * vencer" sem tocar no seletor de antecedência gravava `null` — e o planejador descartava a
 * receita inteira, incluindo o aviso do dia do vencimento. A interface confirmava uma intenção
 * que o app não cumpria, em silêncio.
 *
 * O default `1` para linhas existentes é deliberado, e não a escolha conservadora: quem já tem uma
 * antecedência gravada evidentemente quer ser avisado, e quem tem `null` chegou lá **marcando a
 * caixa** (era o único caminho até agora, já que o formulário gravava ligado com prazo nulo).
 * Migrar para `0` calaria justamente os avisos que este ajuste existe para restaurar.
 *
 * Receitas sem `attachment_valid_until` não são afetadas na prática: sem validade não há data para
 * avisar, e o planejador já as ignora antes de olhar para estas colunas.
 */
export const MIGRATION_018_RENEWAL_REMINDER_ENABLED = `
ALTER TABLE prescriptions ADD COLUMN renewal_reminder_enabled INTEGER NOT NULL DEFAULT 1;
`;
