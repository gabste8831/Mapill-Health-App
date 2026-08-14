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

## Autenticação (Google via Supabase Auth) — implementado em 2026-08-14

- Credenciais (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) ficam em `.env`
  (nunca commitado — ver `.env.example`). Prefixo `EXPO_PUBLIC_` é exigido pelo Expo pra expor a
  variável ao bundle do app. A chave é a `anon public`, nunca a `service_role`.
- `src/data/remote/supabase-client.ts` — cliente único do supabase-js, com `AsyncStorage` como
  storage da sessão (JWT de vida curta + refresh token, não é segredo estático como senha).
  Exporta `isSupabaseConfigured`: `false` enquanto o `.env` não tiver as credenciais — todo
  ponto de entrada de auth checa isso antes de agir, pra login continuar opcional de verdade.
- `src/domain/ports/auth-gateway.ts` (`AuthGateway`) + `src/data/remote/supabase-auth-gateway.ts`
  (`SupabaseAuthGateway`) — mesmo princípio dos outros ports: domínio não conhece Supabase.
- Fluxo OAuth: `expo-auth-session` (`makeRedirectUri`) + `expo-web-browser`
  (`openAuthSessionAsync`) abrem o navegador nativo pro Google, e o Supabase redireciona de
  volta pro app via o `scheme` do `app.json` (`mapillapp://`). Tokens vêm no fragmento da URL de
  retorno — parseados manualmente e aplicados via `supabase.auth.setSession()`.
- `src/app/_layout.tsx`: ao abrir o app, se já existir sessão persistida (`getCurrentUser()`),
  pula a tela de Login automaticamente — sem isso, o usuário logaria de novo a cada abertura
  mesmo com a sessão válida salva.
- `react-native-url-polyfill/auto` importado no topo de `_layout.tsx` — supabase-js depende de
  `URL`/`URLSearchParams`, que o runtime do React Native não implementa nativamente.
- **Ainda não implementado**: a sincronização SQLite↔Supabase em si (seção acima) — hoje o login
  só autentica a conta, não sobe/baixa nenhum dado ainda. Também falta popular as tabelas
  remotas espelhando o schema local e configurar RLS (ver seção "Segurança" acima).

## Notificações/alarmes

- Usar `expo-notifications` para agendar notificações locais nativas — nunca depender de um
  timer em JS rodando com o app em foreground.
- O agendamento de doses (`dose_schedules`) deve gerar as notificações locais no momento em
  que a prescrição é criada/editada, não em tempo real no horário da dose.
- Reagendar notificações sempre que uma prescrição for editada ou uma dose for confirmada
  antecipadamente.
