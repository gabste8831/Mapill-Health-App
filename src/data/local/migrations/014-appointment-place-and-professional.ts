/**
 * Compromisso ganha **onde**, **com quem**, **quando avisar** e **o que aconteceu** — e perde os
 * campos de receita.
 *
 * Onde e com quem são o que a pessoa relê na véspera da consulta, e sem eles a observação livre
 * vira depósito de tudo — endereço, nome do médico e "levar exames antigos" no mesmo parágrafo,
 * que é onde a informação se perde justamente na hora em que ela é procurada.
 *
 * Os três campos de receita saem porque a receita já mora no medicamento desde o B2 (arquivo,
 * validade e aviso de vencimento). Guardar uma segunda cópia aqui criaria duas verdades sobre o
 * mesmo papel, livres para divergir sem nada no código denunciar. O compromisso de renovação
 * continua existindo — ele é "tenho consulta dia tal para renovar", uma data, não um anexo.
 *
 * `type` vira `title` e deixa de ser lista fechada. Consulta, retorno, exame, coleta de sangue,
 * sessão de terapia, fisioterapia — a lista real não fecha, e cada opção que falta obriga quem
 * cadastra a escolher a menos errada e explicar o resto na observação. Texto livre descreve o
 * compromisso do jeito que a pessoa o chama, que é como ela vai reconhecê-lo na agenda depois.
 *
 * O aviso tem **dois canais independentes**, porque são pedidos diferentes: `reminder_lead_days`
 * é a antecedência para se organizar (remarcar o trabalho, arrumar carona) e `reminder_on_day` é
 * a lembrança no próprio dia, para não esquecer o que já estava planejado. Quem marca consulta
 * quer os dois — uma semana antes e no dia —, e um campo só obrigaria a escolher.
 *
 * As colunas nascem antes do mecanismo que as consome, e isso é deliberado: a escolha é do
 * paciente e não muda quando os alertas entrarem no ar (C1), então gravá-la desde já evita que
 * quem cadastrar antes disso precise voltar em cada compromisso para configurar de novo. Quem
 * promete que o aviso vai chegar é a tela — e ela diz que ele ainda não chega.
 *
 * `outcome` e `outcome_notes` são o registro do que aconteceu depois — compareceu ou não, e o que
 * saiu dali ("médico pediu hemograma", "remarquei para o dia 12"). Ficam separados de `notes`
 * porque são de tempos diferentes: `notes` é preparação, escrita **antes** ("jejum de 12h"), e
 * some de utilidade quando o compromisso passa; `outcome_notes` nasce depois e é o que vale a
 * longo prazo, quando alguém quiser reconstruir o histórico de acompanhamento.
 *
 * `outcome` é `NULL` até alguém responder, e **nunca** vira "faltou" por decurso de prazo. Mesma
 * regra da dose não resolvida (decisão nº11.5): ausência de resposta não é desfecho, e registrar
 * uma falta que ninguém confirmou sujaria justamente o histórico que este campo existe para
 * manter confiável.
 *
 * As colunas de receita são removidas de fato, e não deixadas para trás: nunca houve escrita nelas
 * (a tela de compromisso era placeholder), então não há dado a preservar, e coluna morta que
 * contradiz uma decisão é convite para alguém voltar a preenchê-la. DROP COLUMN exige SQLite 3.35+
 * e que a coluna não esteja em índice — nenhuma das três está.
 */
export const MIGRATION_014_APPOINTMENT_PLACE_AND_PROFESSIONAL = `
ALTER TABLE appointments RENAME COLUMN type TO title;
ALTER TABLE appointments ADD COLUMN location TEXT;
ALTER TABLE appointments ADD COLUMN professional TEXT;
ALTER TABLE appointments ADD COLUMN reminder_lead_days INTEGER;
ALTER TABLE appointments ADD COLUMN reminder_on_day INTEGER NOT NULL DEFAULT 0;
ALTER TABLE appointments ADD COLUMN outcome TEXT;
ALTER TABLE appointments ADD COLUMN outcome_notes TEXT;
ALTER TABLE appointments DROP COLUMN prescription_photo_uri;
ALTER TABLE appointments DROP COLUMN prescription_valid_until;
ALTER TABLE appointments DROP COLUMN photo_sync_opt_out;
`;
