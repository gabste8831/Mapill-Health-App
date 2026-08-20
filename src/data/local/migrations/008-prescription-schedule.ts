/**
 * `frequency_minutes` só expressava posologia por intervalo. As outras três formas que o app
 * aceita — horários fixos diários, dias da semana e "se necessário" — não cabiam num número,
 * então a coluna vira um JSON com a união discriminada de `PosologySchedule`.
 *
 * Mesmo padrão de `allergies`/`emergency_contacts`: JSON serializado numa coluna, sem tabela
 * relacional. O backfill monta o JSON por concatenação em vez de `json_object()` porque o
 * JSON1 não é garantido entre builds do SQLite. Na prática não há linha nenhuma pra migrar —
 * nunca existiu tela capaz de criar prescrição — mas a conversão fica correta de qualquer forma.
 */
export const MIGRATION_008_PRESCRIPTION_SCHEDULE = `
ALTER TABLE prescriptions ADD COLUMN schedule TEXT NOT NULL DEFAULT '{"kind":"asNeeded"}';
UPDATE prescriptions
   SET schedule = '{"kind":"interval","everyMinutes":' || frequency_minutes || ',"firstTime":"08:00"}'
 WHERE frequency_minutes > 0;
ALTER TABLE prescriptions DROP COLUMN frequency_minutes;
`;
