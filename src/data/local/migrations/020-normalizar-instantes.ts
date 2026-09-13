/**
 * Põe `scheduled_for` numa forma só — `...T02:00:00.000Z` — nas linhas que já existem.
 *
 * ## O defeito que isto corrige
 *
 * A coluna é texto e vinha em duas formas: o cadastro grava com `toISOString()`, terminando em `Z`,
 * e o que volta da sincronização vem com `+00:00`. As duas descrevem o mesmo instante, e o
 * Diagnóstico do Gabriel em 13/09 mostrou as duas lado a lado na mesma lista de doses.
 *
 * O SQLite compara texto, e `+` (0x2B) vem antes de qualquer dígito em ASCII. Então
 * `'...T02:00:00+00:00' >= '...T20:00:00.000Z'` é **falso** mesmo quando o momento é posterior — e
 * toda consulta por faixa deixava de fora as linhas em `+00:00`.
 *
 * Foi o que fez a regeração por fuso falhar em silêncio: `deleteUpcoming` apagava só parte da
 * grade, o app regravava no fuso novo, e as linhas que escaparam ficavam com o horário antigo. O
 * Gabriel trocou para Manaus e viu as 21:00 virarem 20:00 — a conversão de instante absoluto, que é
 * a assinatura de uma dose que ninguém regerou.
 *
 * ## As três correções, e por que as três são necessárias
 *
 * 1. `normalizarInstante` no `toRow` — impede que a coluna volte a ter duas formas.
 * 2. `julianday(...)` nas consultas — compara instante em vez de texto, alcançando o que já existe.
 * 3. **Esta migration** — conserta as linhas gravadas, para que a comparação de texto volte a ser
 *    correta e o índice da coluna volte a servir.
 *
 * Sem a (3), o banco carregaria as duas formas para sempre e qualquer consulta nova escrita sem
 * `julianday` traria o defeito de volta, calada.
 *
 * ## Por que `strftime` e não uma reescrita no app
 *
 * Porque o SQLite sabe fazer isso sozinho, em uma passada, dentro da transação da migration. Fazer
 * em JavaScript exigiria ler todas as linhas, converter e regravar uma a uma — mais lento e com uma
 * janela em que o banco fica meio convertido.
 *
 * O `WHERE` restringe às linhas que precisam: as que já terminam em `Z` ficam intactas. E a terceira
 * condição é a rede de segurança — `strftime` devolve `NULL` para texto que não souber interpretar,
 * e exigi-la `IS NOT NULL` deixa essas linhas **de fora do UPDATE**, em vez de gravar `NULL` sobre
 * elas. Uma linha corrompida continua como está: visível e consertável, em vez de apagada.
 *
 * A condição vale mais que o cuidado usual porque isto roda uma vez, sem volta, sobre a agenda de
 * medicação de quem já usa o app. Errar aqui apaga horário de dose.
 */
export const MIGRATION_020_NORMALIZAR_INSTANTES = `
UPDATE dose_schedules
SET scheduled_for = strftime('%Y-%m-%dT%H:%M:%f', scheduled_for) || 'Z'
WHERE scheduled_for IS NOT NULL
  AND scheduled_for NOT LIKE '%Z'
  AND strftime('%Y-%m-%dT%H:%M:%f', scheduled_for) IS NOT NULL;

UPDATE appointments
SET scheduled_for = strftime('%Y-%m-%dT%H:%M:%f', scheduled_for) || 'Z'
WHERE scheduled_for IS NOT NULL
  AND scheduled_for NOT LIKE '%Z'
  AND strftime('%Y-%m-%dT%H:%M:%f', scheduled_for) IS NOT NULL;
`;
