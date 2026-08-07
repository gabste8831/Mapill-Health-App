# Offline-first e sincronização — Mapill

Fundamentação: seções 2.8, 2.9 e 2.9.3 do artigo (Allsopp, 2014; SQLite/ACID; Vogels, 2008 —
eventual consistency; Kleppmann, 2017 — LWW).

## Papéis de cada banco

- **SQLite (local)**: fonte de verdade imediata. Toda leitura/escrita da UI acontece aqui,
  com latência zero, independentemente de conectividade.
- **Supabase (remoto/PostgreSQL)**: repositório secundário — usado para backup e para permitir
  que o usuário recupere seus dados em outro dispositivo (vínculo com conta Google). Nunca é
  consultado diretamente pela UI em tempo real; a sincronização acontece em segundo plano.

## Estratégia de sincronização

1. Cada tabela sincronizável tem `id` (UUID gerado no cliente), `updated_at` (timestamp),
   `synced_at` (nullable — null = pendente de sync), `deleted_at` (soft delete).
2. Um serviço de sync roda em background (ex: ao abrir o app, ou periodicamente com conexão
   disponível) e:
   - Envia para o Supabase todos os registros locais com `synced_at IS NULL` ou
     `updated_at > synced_at`.
   - Busca do Supabase registros mais novos que a última sincronização conhecida.
3. **Resolução de conflito: Last-Write-Wins (LWW)** por `updated_at`. Se o mesmo registro foi
   alterado local e remotamente, vence o timestamp mais recente. Não implementar merge de
   campos parcial — é tudo-ou-nada por registro, conforme descrito no artigo.

## Segurança (RLS no Supabase)

- Habilitar Row Level Security em todas as tabelas do Supabase.
- Policy padrão: usuário só pode ler/escrever linhas onde `user_id = auth.uid()`.
- Autenticação via Supabase Auth (JWT) — vincular à conta Google do usuário para permitir
  "backup" entre dispositivos, conforme a intenção original do usuário.

## Notificações/alarmes

- Usar `expo-notifications` para agendar notificações locais nativas — nunca depender de um
  timer em JS rodando com o app em foreground.
- O agendamento de doses (`dose_schedules`) deve gerar as notificações locais no momento em
  que a prescrição é criada/editada, não em tempo real no horário da dose.
- Reagendar notificações sempre que uma prescrição for editada ou uma dose for confirmada
  antecipadamente.
