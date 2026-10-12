-- =============================================================================
-- Mapill - histórico para a demonstração da defesa (19/10/2026)
--
-- Mexe só na conta gabrielsteffens2003@gmail.com. Toda instrução filtra pelo id dessa conta, e
-- nenhuma linha de outro usuário é lida ou alterada.
--
-- O QUE FAZ
-- - Tylenol hoje: exclui as respostas de hoje e as doses de teste do atalho de Ajustes (as que
--   estão fora dos horários da posologia), e devolve ao estoque o que esses testes descontaram.
-- - Losartana e Tylenol: cria os horários de dose dos últimos 90 dias a partir da posologia que já
--   está cadastrada, e registra as respostas (tomada, pulada ou sem resposta). O cadastro dos dois
--   não é alterado.
-- - Estoque da Losartana: deixa cinco dias de remédio, com alerta de 7 dias, para o card de estoque
--   aparecer na Home.
-- - Consultas: uma em 21/10 com aviso de 3 dias, que aparece na Home de 18 a 21/10, três passadas
--   com desfecho e um retorno em novembro.
--
-- PODE RODAR MAIS DE UMA VEZ
-- Horário que já existe não é recriado, dose que já tem resposta não ganha outra, e as consultas
-- têm id fixo. A resposta de cada dose sai de um sorteio fixo (hash do horário), então rodar de novo
-- não transforma as "sem resposta" em tomadas. Rodar no dia 19, antes da apresentação, preenche os
-- dias entre hoje e a defesa e repõe o estoque, que terá baixado com as doses confirmadas no
-- celular.
--
-- PASSO A PASSO
-- 1. Abra o app no celular, com internet, para ele subir o que tiver pendente.
-- 2. Supabase > SQL Editor > colar este arquivo > Run. Confira as mensagens (NOTICE) no fim.
-- 3. Feche e abra o app de novo. Ele baixa o histórico, o estoque e as consultas sozinho.
--    Faça isso antes de confirmar qualquer dose: confirmar antes da sincronização grava o estoque
--    antigo com hora mais nova, e ele sobrescreve o estoque que este script deixou.
-- =============================================================================

do $$
declare
  v_email constant text := 'gabrielsteffens2003@gmail.com';
  v_tz constant text := 'America/Sao_Paulo';
  v_dias_de_historico constant int := 90;
  -- Quantos dias de remédio deixar no estoque da Losartana. Abaixo do alerta de 7, então vira card.
  v_dias_de_estoque constant int := 5;

  v_agora timestamptz := now();
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_inicio_de_hoje timestamptz;
  v_uid uuid;
  v_prescricao record;
  v_horarios int;
  v_registros int;
  v_por_dia real;
  v_estoque uuid;
  v_tylenol uuid;
begin
  select id into v_uid from auth.users where email = v_email;
  if v_uid is null then
    raise exception 'Conta % não encontrada.', v_email;
  end if;
  v_inicio_de_hoje := v_hoje::timestamp at time zone v_tz;

  -- ---------------------------------------------------------------------------
  -- LIMPEZA DOS TESTES DE HOJE NO TYLENOL
  -- ---------------------------------------------------------------------------
  -- Os testes do atalho de demonstração (Ajustes) criam doses do Tylenol fora dos horários da
  -- posologia, e cada resposta a elas grava histórico e baixa estoque. Exclusão lógica, como o app
  -- faz, para a remoção chegar ao celular na sincronização: apagada só aqui, a linha continuaria lá.
  --
  -- 1. Devolve ao estoque o que as doses de hoje descontaram: a quantidade de cada dose cuja
  --    resposta valendo (a mais recente) é "tomada". Correções já acertaram o estoque pela diferença,
  --    então a resposta valendo é a conta exata.
  select coalesce(sum(ds.amount), 0), max(m.id::text)::uuid
    into v_por_dia, v_tylenol
  from public.dose_schedules ds
  join public.prescriptions p on p.id = ds.prescription_id and p.user_id = v_uid
  join public.medications m on m.id = p.medication_id and m.user_id = v_uid
  where ds.user_id = v_uid
    and m.name ilike '%tylenol%'
    and ds.scheduled_for >= v_inicio_de_hoje
    and (
      select il.status from public.intake_logs il
      where il.user_id = v_uid and il.dose_schedule_id = ds.id and il.deleted_at is null
      order by il.updated_at desc limit 1
    ) = 'confirmed';

  if v_por_dia > 0 then
    update public.inventory_items
    set quantity = quantity + v_por_dia, updated_at = v_agora
    where user_id = v_uid and medication_id = v_tylenol and deleted_at is null;

    insert into public.inventory_adjustments (id, user_id, inventory_item_id, delta, reason, updated_at)
    select gen_random_uuid(), v_uid, i.id, v_por_dia, 'intake_correction', v_agora
    from public.inventory_items i
    where i.user_id = v_uid and i.medication_id = v_tylenol and i.deleted_at is null;
  end if;

  -- 2. Exclui todas as respostas do Tylenol de hoje.
  update public.intake_logs il
  set deleted_at = v_agora, updated_at = v_agora
  from public.dose_schedules ds, public.prescriptions p, public.medications m
  where il.user_id = v_uid
    and il.deleted_at is null
    and ds.id = il.dose_schedule_id and ds.user_id = v_uid
    and p.id = ds.prescription_id and p.user_id = v_uid
    and m.id = p.medication_id and m.user_id = v_uid
    and m.name ilike '%tylenol%'
    and ds.scheduled_for >= v_inicio_de_hoje;
  get diagnostics v_registros = row_count;

  -- 3. Exclui as doses de teste de hoje: as do Tylenol cujo horário não está na posologia.
  update public.dose_schedules ds
  set deleted_at = v_agora, updated_at = v_agora
  from public.prescriptions p, public.medications m
  where ds.user_id = v_uid
    and ds.deleted_at is null
    and p.id = ds.prescription_id and p.user_id = v_uid
    and m.id = p.medication_id and m.user_id = v_uid
    and m.name ilike '%tylenol%'
    and ds.scheduled_for >= v_inicio_de_hoje
    and to_char(ds.scheduled_for at time zone v_tz, 'HH24:MI') not in (
      select dose ->> 'at'
      from jsonb_array_elements(
        case when p.schedule ->> 'kind' = 'asNeeded' then '[]'::jsonb
             else p.schedule -> 'doses' end
      ) as dose
    );
  get diagnostics v_horarios = row_count;

  raise notice 'Tylenol hoje: % respostas e % doses de teste excluídas, % devolvido ao estoque.',
    v_registros, v_horarios, v_por_dia;

  -- ---------------------------------------------------------------------------
  -- HISTÓRICO DE DOSES
  -- ---------------------------------------------------------------------------
  for v_prescricao in
    select p.*, m.name as remedio
    from public.prescriptions p
    join public.medications m on m.id = p.medication_id and m.user_id = v_uid
    where p.user_id = v_uid
      and p.deleted_at is null
      and m.deleted_at is null
      and (m.name ilike '%losartana%' or m.name ilike '%tylenol%')
  loop
    -- Mesmos instantes que `generateDoseSchedules` gera no app: hora local de Brasília convertida
    -- para UTC. Pula o instante que já existe nessa prescrição, inclusive excluído, que é a mesma
    -- comparação do reabastecimento do app, então nunca há duas doses no mesmo horário.
    insert into public.dose_schedules (
      id, user_id, prescription_id, scheduled_for, amount, notification_id, snooze_count, updated_at
    )
    select gen_random_uuid(), v_uid, v_prescricao.id, inst.quando,
           coalesce((dose ->> 'amount')::real, v_prescricao.dose_amount), null, 0,
           inst.quando - interval '1 day'
    from generate_series(
      (v_hoje - v_dias_de_historico)::timestamp,
      least(coalesce(v_prescricao.end_date, v_hoje), v_hoje)::timestamp,
      interval '1 day'
    ) as d(dia)
    cross join lateral jsonb_array_elements(
      case when v_prescricao.schedule ->> 'kind' = 'asNeeded' then '[]'::jsonb
           else v_prescricao.schedule -> 'doses' end
    ) as dose
    cross join lateral (
      select (d.dia::date + (dose ->> 'at')::time) at time zone v_tz as quando
    ) inst
    where inst.quando < v_agora
      and (
        v_prescricao.schedule ->> 'kind' = 'daily'
        or (
          v_prescricao.schedule ->> 'kind' = 'weekly'
          and extract(dow from d.dia)::int in (
            select jsonb_array_elements_text(v_prescricao.schedule -> 'weekdays')::int
          )
        )
        or (
          v_prescricao.schedule ->> 'kind' = 'cycle'
          and (
            ((d.dia::date - (v_prescricao.schedule ->> 'cycleStartDate')::date)
              % (v_prescricao.schedule ->> 'cycleLengthDays')::int
              + (v_prescricao.schedule ->> 'cycleLengthDays')::int)
            % (v_prescricao.schedule ->> 'cycleLengthDays')::int
          ) < (v_prescricao.schedule ->> 'activeDays')::int
        )
      )
      and not exists (
        select 1 from public.dose_schedules ds
        where ds.user_id = v_uid
          and ds.prescription_id = v_prescricao.id
          and ds.scheduled_for = inst.quando
      );
    get diagnostics v_horarios = row_count;

    -- Respostas só para os dias antes de hoje, e só para dose que ainda não tem nenhuma. Hoje fica
    -- com o que for respondido no celular. 88% tomada, 6% pulada e 6% sem registro, que o app
    -- mostra como "sem resposta" (RN 01). A resposta sai alguns minutos depois do horário.
    insert into public.intake_logs (
      id, user_id, dose_schedule_id, status, occurred_at, corrects_log_id, updated_at
    )
    select gen_random_uuid(), v_uid, s.id, r.status, r.quando, null, r.quando
    from (
      select ds.id, ds.scheduled_for,
             abs(hashtext(ds.prescription_id::text || ds.scheduled_for::text)) as sorteio
      from public.dose_schedules ds
      where ds.user_id = v_uid
        and ds.prescription_id = v_prescricao.id
        and ds.deleted_at is null
        and ds.scheduled_for < v_inicio_de_hoje
        and not exists (
          select 1 from public.intake_logs il
          where il.user_id = v_uid and il.dose_schedule_id = ds.id
        )
    ) s
    cross join lateral (
      select
        case
          when s.sorteio % 100 < 88 then 'confirmed'
          when s.sorteio % 100 < 94 then 'skipped'
        end as status,
        least(s.scheduled_for + (s.sorteio % 25 + 1) * interval '1 minute', v_agora) as quando
    ) r
    where r.status is not null;
    get diagnostics v_registros = row_count;

    raise notice '%: % horários e % respostas criados.', v_prescricao.remedio, v_horarios, v_registros;
    if v_prescricao.schedule ->> 'kind' = 'asNeeded' then
      raise notice '%: está como "se necessário", sem horário, então não há histórico a criar.',
        v_prescricao.remedio;
    end if;
  end loop;

  -- ---------------------------------------------------------------------------
  -- ESTOQUE DA LOSARTANA: card de estoque na Home
  -- ---------------------------------------------------------------------------
  -- A unidade tem de ser a da dose, senão o app não calcula quando acaba e o card não aparece.
  -- `updated_at` agora, para a versão da nuvem vencer a do celular na sincronização (LWW).
  select p.* into v_prescricao
  from public.prescriptions p
  join public.medications m on m.id = p.medication_id and m.user_id = v_uid
  where p.user_id = v_uid and p.deleted_at is null and m.deleted_at is null
    and m.name ilike '%losartana%'
  order by p.updated_at desc
  limit 1;

  if not found then
    raise notice 'Losartana não encontrada: estoque não alterado.';
  else
    select coalesce(sum(coalesce((dose ->> 'amount')::real, v_prescricao.dose_amount)), 0)
      into v_por_dia
    from jsonb_array_elements(
      case when v_prescricao.schedule ->> 'kind' = 'asNeeded' then '[]'::jsonb
           else v_prescricao.schedule -> 'doses' end
    ) as dose;

    select id into v_estoque from public.inventory_items
    where user_id = v_uid and medication_id = v_prescricao.medication_id and deleted_at is null
    order by updated_at desc limit 1;

    if v_estoque is null then
      insert into public.inventory_items (
        id, user_id, medication_id, quantity, unit, low_stock_alert_enabled,
        low_stock_alert_lead_days, low_stock_alerted_at_quantity, storage_location, updated_at
      ) values (
        gen_random_uuid(), v_uid, v_prescricao.medication_id, v_por_dia * v_dias_de_estoque,
        v_prescricao.dose_unit, true, 7, null, 'Armário da cozinha', v_agora
      );
    else
      update public.inventory_items
      set quantity = v_por_dia * v_dias_de_estoque,
          unit = v_prescricao.dose_unit,
          low_stock_alert_enabled = true,
          low_stock_alert_lead_days = 7,
          low_stock_alerted_at_quantity = null,
          updated_at = v_agora
      where id = v_estoque and user_id = v_uid;
    end if;

    raise notice 'Losartana: estoque em % (% por dia), alerta de 7 dias.',
      v_por_dia * v_dias_de_estoque, v_por_dia;
  end if;

  -- ---------------------------------------------------------------------------
  -- CONSULTAS
  -- ---------------------------------------------------------------------------
  -- Id fixo (derivado da conta), para rodar de novo atualizar em vez de duplicar. A Home mostra a
  -- consulta nos `reminder_lead_days` dias antes dela, então a de 21/10 aparece de 18 a 21/10.
  insert into public.appointments (
    id, user_id, title, scheduled_for, location, professional, notes, reminder_lead_days,
    reminder_on_day, outcome, outcome_notes, updated_at
  )
  select md5(v_uid::text || c.chave)::uuid, v_uid, c.titulo,
         c.quando::timestamp at time zone v_tz, c.local, c.profissional, c.observacao,
         c.antecedencia, true, c.desfecho, c.nota_do_desfecho, v_agora
  from (values
    ('cardiologista', 'Consulta com cardiologista', '2026-10-21 14:30', 'Clínica do Coração',
     'Dr. Ricardo Lemos', 'Levar o relatório de adesão.', 3, null, null),
    ('retorno', 'Retorno com cardiologista', '2026-11-18 10:00', 'Clínica do Coração',
     'Dr. Ricardo Lemos', null, 7, null, null),
    ('clinico', 'Consulta com clínico geral', '2026-09-15 09:00', 'UBS Centro',
     'Dra. Helena Duarte', null, 1, 'attended', 'Pressão controlada, manter a Losartana.'),
    ('exame', 'Exames de sangue', '2026-08-20 07:30', 'Laboratório Central', null,
     'Jejum de 8 horas.', 1, 'attended', null),
    ('oftalmo', 'Oftalmologista', '2026-10-02 15:00', 'Centro de Olhos', null, null, 1,
     'missed', 'Remarcar.')
  ) as c(chave, titulo, quando, local, profissional, observacao, antecedencia, desfecho,
         nota_do_desfecho)
  on conflict (id) do update set
    title = excluded.title,
    scheduled_for = excluded.scheduled_for,
    location = excluded.location,
    professional = excluded.professional,
    notes = excluded.notes,
    reminder_lead_days = excluded.reminder_lead_days,
    reminder_on_day = excluded.reminder_on_day,
    outcome = excluded.outcome,
    outcome_notes = excluded.outcome_notes,
    deleted_at = null,
    updated_at = excluded.updated_at
  where public.appointments.user_id = v_uid;

  raise notice 'Consultas: 5 gravadas, a de 21/10 aparece na Home de 18 a 21/10.';
end $$;

-- =============================================================================
-- CONFERÊNCIA (opcional, rodar depois)
-- =============================================================================
-- select m.name, l.status, count(*)
-- from public.intake_logs l
-- join public.dose_schedules d on d.id = l.dose_schedule_id
-- join public.prescriptions p on p.id = d.prescription_id
-- join public.medications m on m.id = p.medication_id
-- join auth.users u on u.id = l.user_id
-- where u.email = 'gabrielsteffens2003@gmail.com'
-- group by m.name, l.status
-- order by m.name, l.status;
