/**
 * Põe `scheduled_for` numa forma só - `...T02:00:00.000Z` - nas linhas que já existem.
 *
 * A coluna e texto e vinha em duas formas: o cadastro grava terminando em `Z`, e o que volta da
 * sincronizacao vem com `+00:00`. As duas descrevem o mesmo instante.
 *
 * O SQLite compara texto, e `+` vem antes de qualquer digito em ASCII: a comparacao por faixa dava
 * falso mesmo com o momento posterior, e deixava de fora as linhas em `+00:00`. Foi o que fez a
 * regeracao por fuso falhar em silencio, apagando so parte da grade.
 *
 * Sao tres correcoes, e as tres sao necessarias: `normalizarInstante` no `toRow` impede a coluna de
 * voltar a ter duas formas, `julianday` nas consultas alcanca o que ja existe, e esta migration
 * conserta as linhas gravadas, para a comparacao de texto voltar a ser correta e o indice servir.
 *
 * `strftime`, e nao uma reescrita no app: o SQLite faz isso em uma passada, dentro da transacao da
 * migration. Em JavaScript seria ler, converter e regravar linha a linha, com uma janela em que o
 * banco fica meio convertido.
 *
 * O `WHERE` restringe às linhas que precisam: as que já terminam em `Z` ficam intactas. E a terceira
 * condição é a rede de segurança - `strftime` devolve `NULL` para texto que não souber interpretar,
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
