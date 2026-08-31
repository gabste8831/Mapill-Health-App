-- =============================================================================
-- Mapill — schema do Supabase (PostgreSQL)
--
-- COMO USAR: painel do Supabase → SQL Editor → colar tudo → Run. Uma vez só.
-- É idempotente (`IF NOT EXISTS` / `DROP POLICY IF EXISTS`), então rodar de novo
-- não quebra nada.
--
-- -----------------------------------------------------------------------------
-- O QUE ESTE SCHEMA É, E O QUE NÃO É
--
-- Ele **espelha** o SQLite local (migrations 001–014), com três diferenças que
-- existem por razões específicas:
--
-- 1. `user_id` em toda tabela. No aparelho não existe: o banco é de uma pessoa
--    só. No servidor, é o que separa os dados de um paciente dos de outro — e é
--    a coluna sobre a qual todo o RLS é escrito.
--
-- 2. Tipos reais. O SQLite guarda tudo como TEXT/INTEGER; aqui datas são
--    `timestamptz` e booleanos são `boolean`. O cliente converte na borda
--    (`sync-service.ts`), e o ganho é o banco recusar lixo em vez de aceitá-lo
--    calado.
--
-- 3. Sem as tabelas `cmed_*`. O catálogo da Anvisa é dado de referência embutido
--    no app, igual em todo aparelho — subir 7 mil linhas idênticas por usuário
--    seria replicar um dicionário, não sincronizar dado de paciente.
--
-- -----------------------------------------------------------------------------
-- RLS: A REGRA É UMA SÓ
--
-- Toda tabela tem `user_id = auth.uid()` para SELECT, INSERT, UPDATE e DELETE.
-- Não há exceção, não há tabela pública, não há política "somente leitura para
-- todos". Num app que guarda dado de saúde, a única pergunta que o banco precisa
-- responder é "isto é seu?" — e a resposta é sempre a mesma coluna.
--
-- `DELETE` é permitido, mas o app não o usa: exclusão é lógica (`deleted_at`),
-- porque uma linha apagada some sem deixar recado e voltaria do servidor na
-- sincronização seguinte. A política existe para o direito de exclusão da LGPD,
-- que é o único caso em que o dado sai de verdade.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MEDICAMENTOS
-- -----------------------------------------------------------------------------
create table if not exists public.medications (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  active_ingredient text not null default '',
  presentation text not null default '',
  form text not null default 'other',
  prescription_requirement text not null default 'none',
  photo_uri text,
  ean text,
  from_cmed boolean not null default false,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- -----------------------------------------------------------------------------
-- PRESCRIÇÕES (tratamentos)
-- -----------------------------------------------------------------------------
create table if not exists public.prescriptions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null,
  dose_amount real not null,
  dose_unit text not null,
  -- A posologia inteira, como JSON: `{"kind":"daily","doses":[…]}`. É união
  -- discriminada no domínio, e normalizá-la em tabelas aqui obrigaria o servidor
  -- a conhecer uma regra que só o app aplica.
  schedule jsonb not null default '{"kind":"asNeeded"}'::jsonb,
  start_date date not null,
  end_date date,
  reminder_mode text not null default 'none',
  intake_instructions jsonb not null default '[]'::jsonb,
  intake_note text,
  notes text,
  attachment_uri text,
  attachment_kind text,
  attachment_valid_until date,
  renewal_reminder_lead_days integer,
  -- LGPD: quando true, o anexo nunca sobe para o Storage. Hoje nenhum anexo sobe
  -- (E9 ainda não implementado), e a coluna existe para quando subirem.
  attachment_sync_opt_out boolean not null default false,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- -----------------------------------------------------------------------------
-- HORÁRIOS DE DOSE
-- -----------------------------------------------------------------------------
create table if not exists public.dose_schedules (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  prescription_id uuid not null,
  scheduled_for timestamptz not null,
  amount real not null default 0,
  -- Id da notificação no sistema operacional. **Local por natureza**: o id do
  -- aparelho A não significa nada no aparelho B. Sobe junto porque a linha sobe
  -- inteira, e o outro aparelho o ignora ao reagendar do zero.
  notification_id text,
  snooze_count integer not null default 0,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- -----------------------------------------------------------------------------
-- REGISTROS DE INGESTÃO — o coração do histórico clínico
-- -----------------------------------------------------------------------------
create table if not exists public.intake_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  dose_schedule_id uuid not null,
  status text not null,
  occurred_at timestamptz not null,
  -- Correção retroativa aponta para o log que ela corrige; o antigo continua
  -- existindo. É o que torna o histórico auditável em vez de reescrito.
  corrects_log_id uuid,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- -----------------------------------------------------------------------------
-- ESTOQUE
-- -----------------------------------------------------------------------------
create table if not exists public.inventory_items (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null,
  quantity real not null default 0,
  unit text not null,
  low_stock_alert_enabled boolean not null default false,
  low_stock_alert_lead_days integer,
  storage_location text,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- Cada movimento é um evento somado, nunca um `quantity = X`: recontagem,
-- reposição e baixa por dose compõem, e sobrescrever perderia a composição.
create table if not exists public.inventory_adjustments (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  inventory_item_id uuid not null,
  delta real not null,
  reason text not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- -----------------------------------------------------------------------------
-- COMPROMISSOS CLÍNICOS
-- -----------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  scheduled_for timestamptz not null,
  location text,
  professional text,
  notes text,
  reminder_lead_days integer,
  reminder_on_day boolean not null default false,
  outcome text,
  outcome_notes text,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- -----------------------------------------------------------------------------
-- FICHA DE SAÚDE
-- -----------------------------------------------------------------------------
create table if not exists public.patient_profiles (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null default '',
  date_of_birth date,
  biological_sex text,
  photo_uri text,
  blood_type text,
  allergies jsonb not null default '[]'::jsonb,
  emergency_contacts jsonb not null default '[]'::jsonb,
  notes text,
  photo_sync_opt_out boolean not null default false,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- -----------------------------------------------------------------------------
-- CONSENTIMENTO LGPD — a prova de que houve aceite, e de qual versão
-- -----------------------------------------------------------------------------
create table if not exists public.consent_records (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  accepted_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- =============================================================================
-- ÍNDICES
--
-- Um por tabela, sobre `(user_id, updated_at)`. É exatamente a consulta do pull:
-- "meus registros mais novos que a última sincronização". Sem ele, cada pull
-- varreria a tabela inteira de todos os usuários.
-- =============================================================================
create index if not exists idx_medications_sync on public.medications (user_id, updated_at);
create index if not exists idx_prescriptions_sync on public.prescriptions (user_id, updated_at);
create index if not exists idx_dose_schedules_sync on public.dose_schedules (user_id, updated_at);
create index if not exists idx_intake_logs_sync on public.intake_logs (user_id, updated_at);
create index if not exists idx_inventory_items_sync on public.inventory_items (user_id, updated_at);
create index if not exists idx_inventory_adjustments_sync on public.inventory_adjustments (user_id, updated_at);
create index if not exists idx_appointments_sync on public.appointments (user_id, updated_at);
create index if not exists idx_patient_profiles_sync on public.patient_profiles (user_id, updated_at);
create index if not exists idx_consent_records_sync on public.consent_records (user_id, updated_at);

-- =============================================================================
-- ROW LEVEL SECURITY
--
-- A mesma política em todas as nove tabelas. `auth.uid()` é o id do usuário
-- autenticado no token JWT — sem token, `auth.uid()` é NULL e nenhuma linha
-- casa, então o banco nasce fechado.
--
-- `with check` no INSERT/UPDATE é o que impede alguém de gravar uma linha
-- **em nome de outro**: sem ele, o RLS protegeria a leitura e deixaria a escrita
-- aberta, que é o erro clássico desta configuração.
-- =============================================================================

do $$
declare
  tabela text;
begin
  foreach tabela in array array[
    'medications', 'prescriptions', 'dose_schedules', 'intake_logs',
    'inventory_items', 'inventory_adjustments', 'appointments',
    'patient_profiles', 'consent_records'
  ]
  loop
    execute format('alter table public.%I enable row level security', tabela);

    execute format('drop policy if exists "own_select" on public.%I', tabela);
    execute format(
      'create policy "own_select" on public.%I for select using (user_id = auth.uid())',
      tabela
    );

    execute format('drop policy if exists "own_insert" on public.%I', tabela);
    execute format(
      'create policy "own_insert" on public.%I for insert with check (user_id = auth.uid())',
      tabela
    );

    execute format('drop policy if exists "own_update" on public.%I', tabela);
    execute format(
      'create policy "own_update" on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())',
      tabela
    );

    execute format('drop policy if exists "own_delete" on public.%I', tabela);
    execute format(
      'create policy "own_delete" on public.%I for delete using (user_id = auth.uid())',
      tabela
    );
  end loop;
end $$;

-- =============================================================================
-- CONFERÊNCIA
--
-- Depois de rodar, esta consulta tem que devolver **9 linhas, todas com
-- rowsecurity = true**. Se alguma vier `false`, o RLS não pegou naquela tabela e
-- os dados dela estariam legíveis por qualquer usuário autenticado.
-- =============================================================================
-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
--   and tablename in (
--     'medications', 'prescriptions', 'dose_schedules', 'intake_logs',
--     'inventory_items', 'inventory_adjustments', 'appointments',
--     'patient_profiles', 'consent_records'
--   )
-- order by tablename;
