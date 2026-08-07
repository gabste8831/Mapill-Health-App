---
name: mapill-dev
description: Use this skill whenever the user is developing, coding, planning, or discussing "Mapill" — a mobile medication-adherence/health app built as a TCC (undergraduate thesis) project for Sistemas de Informação at UNIDAVI. Trigger this for ANY work on the app's code, architecture, data model, UI/UX, database (SQLite/Supabase), medication lookup via CMED data, notifications/alarms, or offline-first sync logic — even if the user just says "adiciona uma tela", "cria a tabela de X", "como estruturar isso", or references features like remédios, doses, estoque, consultas, receitas, sem mencionar "Mapill" explicitly. Also use when the user wants to align app implementation with their TCC article's theoretical framework (Clean Architecture, SOLID, heurísticas de Nielsen, LGPD, ACID, offline-first, eventual consistency).
---

# Mapill — Dev Skill

Mapill é um app móvel de saúde (TCC de Sistemas de Informação, UNIDAVI) que atua como
**Single Source of Truth (SSoT)** para a rotina terapêutica do paciente: registro de ingestão de
medicamentos, controle de estoque de fármacos, agendamento de consultas/renovação de
receitas, tudo isso sob os paradigmas **offline-first** e guiado pelas **heurísticas de Nielsen**.

Este documento é o contexto obrigatório para qualquer trabalho de código nesse projeto. Ele
existe para que as decisões técnicas tomadas no dia a dia do desenvolvimento **continuem
alinhadas com a fundamentação teórica já escrita no artigo do TCC** — o código é, na prática,
a materialização do que já foi argumentado no Referencial Teórico.

## Antes de codificar, sempre confira

1. Isso está de acordo com o **paradigma offline-first**? (a lógica crítica roda 100% local, sem
   depender de rede)
2. Isso respeita **SRP/SOLID**? (não misturar lógica de agendamento com renderização de UI,
   por exemplo — ver `2.6.1` do artigo)
3. Isso segue **Clean Code** (nomes descritivos, sem números mágicos, sem abreviações)?
4. Se envolve dado sensível de saúde: está sendo tratado sob a ótica da **LGPD** (minimização,
   consentimento, direito à exclusão)?
5. Se envolve UI: segue as heurísticas de Nielsen prioritárias do projeto — **prevenção de
   erros** e **reconhecimento em vez de recordação**? (checklist completo:
   `usability-heuristics-health-ui`)
6. Se envolve entrada de dado clínico (dose, posologia, estoque): a validação segue os padrões
   de `medication-safety-validation` — sem nunca inferir um valor clínico por conta própria?

Quando uma decisão técnica tiver respaldo direto no artigo, **cite o trecho/seção relevante**
brevemente ao explicar a escolha (ex: "isso implementa o LWW descrito na seção 2.9.3"), para
que o código e o texto acadêmico fiquem rastreáveis um ao outro.

---

## Skills complementares (usar em conjunto)

O `mapill-dev` cobre o que é específico do projeto (stack fixa, arquitetura, modelo de dados,
regras do artigo). Para o resto, usar em conjunto com:

- **`usability-heuristics-health-ui`** — fonte definitiva para heurísticas de Nielsen e
  acessibilidade em apps de saúde. A seção "UX/UI" abaixo lista só as prioridades do Mapill;
  para o checklist completo (contraste, toques, confirmação, gamificação cuidadosa), consultar
  essa skill em vez de duplicar aqui.
- **`medication-safety-validation`** — usar sempre que a tarefa envolver validação de dose,
  posologia, conflito de horários ou matemática de estoque. Importante: essa skill nunca
  fornece valor clínico (dose correta, interação medicamentosa) — só valida se o dado inserido
  está bem formado e plausível. Se uma tarefa pedir um valor clínico de verdade, ela mesma vai
  sinalizar o limite.
- **`react-native-mobile-dev`** — guia técnico genérico de RN/Expo (navegação, performance,
  permissões, testes, build). O `references/architecture.md` do Mapill continua sendo a
  autoridade sobre a Clean Architecture específica do projeto; essa skill cobre tudo que é
  RN/Expo "puro" e não é particular do Mapill.

---

## Stack (fixa — não sugerir alternativas sem o usuário pedir)

| Camada | Tecnologia | Observação |
|---|---|---|
| Runtime/Framework | React Native + Expo (Expo Go) | Sempre usar APIs gerenciadas pelo Expo quando existirem (ex: `expo-notifications`, `expo-sqlite`) antes de buscar libs externas |
| Linguagem | TypeScript | Tipagem estrita. Nunca usar `any` — ver seção 2.7.1 do artigo sobre confiabilidade algorítmica |
| Estilização | Componentizada, **sem Tailwind** | Ver `references/styling.md` para o padrão a seguir |
| Persistência local | SQLite (via `expo-sqlite`) | Fonte de verdade imediata do dispositivo — ver `references/architecture.md` |
| Sync remoto | Supabase (PostgreSQL) | Backup/sincronização via conta Google — não é a fonte primária de verdade |
| Dados de medicamentos | Base pública CMED (Anvisa), importada e indexada localmente | Ver `references/cmed-data.md` |

Não proponha trocar SQLite por Realm/WatermelonDB, ou Tailwind/NativeWind, ou Firebase no
lugar de Supabase, a menos que o usuário peça explicitamente — essas escolhas já foram
justificadas teoricamente no artigo e são decisões fechadas do projeto.

---

## Arquitetura

Ver `references/architecture.md` para a estrutura de pastas completa e o mapeamento
Clean Architecture / SOLID → camadas do projeto. Resumo rápido:

- **Camadas separadas**: domínio (regras de negócio puras) → dados (SQLite + Supabase) →
  apresentação (telas/componentes). Nenhuma tela deve ter SQL embutido diretamente; sempre
  passar por um repositório.
- **Offline-first na prática**: toda escrita vai primeiro pro SQLite local; a sincronização com
  Supabase é assíncrona, em segundo plano, e nunca bloqueia a interação do usuário.
- **Resolução de conflito**: Last-Write-Wins (LWW) por timestamp, conforme seção 2.9.3 do
  artigo. Todo registro sincronizável precisa de um campo `updated_at` confiável.
- **Notificações**: usar APIs nativas de agendamento (via Expo) para os alarmes de dose,
  nunca lógica em JS que depende do app estar aberto — ver seção 2.8 do artigo.

---

## Modelo de dados (núcleo)

As entidades centrais do domínio (ajustar conforme o desenvolvimento avança, mas manter
esse núcleo coerente com os objetivos específicos do artigo):

- **Medicamento** (`medications`): nome, princípio ativo, apresentação, EAN, dados vindos do
  CMED quando disponíveis (ver `references/cmed-data.md`)
- **Prescrição/Tratamento** (`prescriptions`): vínculo paciente-medicamento, posologia,
  duração, data de início/fim
- **Agendamento de dose** (`dose_schedules`): horários derivados da posologia
- **Registro de ingestão** (`intake_logs`): timestamp exato de confirmação/omissão —
  implementa o conceito de monitoramento eletrônico (eMEM) da seção 2.3.3
- **Estoque** (`inventory`): quantidade restante, calculada a partir das doses confirmadas
- **Compromissos clínicos** (`appointments`): consultas e renovação de receitas

Todas as tabelas sincronizáveis precisam de: `id` (UUID gerado no cliente, não autoincrement,
para evitar conflito de merge), `updated_at`, `synced_at` (nullable), `deleted_at` (soft delete,
importante para o direito de exclusão da LGPD).

---

## UX / UI

Prioridades específicas do Mapill (checklist completo de heurísticas e acessibilidade está na
skill `usability-heuristics-health-ui` — não duplicar aqui, só reforçar o que é crítico pro
projeto):

- Público-alvo majoritário: idosos e pacientes polimedicados — priorizar contraste alto,
  toques grandes, textos claros, **reconhecimento visual (ícones) em vez de recordação**.
- Toda ação destrutiva ou crítica (ex: marcar dose como tomada, excluir tratamento) precisa de
  confirmação visual explícita — prevenção de erros (Nielsen).
- Gamificação leve é bem-vinda (streaks, indicadores de progresso), mas nunca deve **bloquear**
  ou complicar o fluxo principal de registro de dose — reforço positivo é acessório, não
  obrigatório.
- Ver `references/styling.md` antes de estilizar qualquer componente novo.
- Ver `references/screens-and-flows.md` para o mapeamento de telas já definidas (com protótipo)
  e as que ainda estão em aberto — consultar antes de implementar ou propor uma tela nova.
- **Conta**: uma conta por paciente. Um cuidador/familiar que acompanhe o tratamento usa a
  mesma conta do paciente — não há papel de usuário duplo nem tela de login separada para
  cuidador. Não introduzir esse conceito no modelo de dados a menos que o usuário peça.

---

## LGPD / Dados sensíveis

- Todo dado de saúde é sensível por definição legal (art. 5º da LGPD) — tratar com o mesmo
  rigor: nunca logar dados clínicos em `console.log` de produção, nunca enviar para
  analytics/crash-reporting de terceiros sem anonimização.
- Consentimento explícito é obrigatório antes do primeiro registro clínico (tela de
  onboarding/política de privacidade).
- Sempre implementar exclusão real (hard delete no Supabase, soft delete + purge local) quando
  o usuário pedir para apagar seus dados — não apenas ocultar da UI.

---

## Quando o usuário pedir para "implementar uma feature do artigo"

1. Localize a seção do artigo que fundamenta a feature (o texto completo do artigo está
   disponível no histórico da conversa onde essa skill foi criada — se precisar reconsultar
   trechos específicos, peça ao usuário para colar a seção relevante).
2. Extraia a exigência técnica/teórica por trás (ex: "auditoria clínica" → precisa de timestamp
   imutável e histórico consultável).
3. Implemente respeitando a stack fixa e a arquitetura acima.
4. Ao entregar, aponte brevemente qual decisão de código corresponde a qual argumento do
   artigo — isso ajuda o usuário a manter a coerência entre o Capítulo 4 (Resultados) e o que
   foi implementado.

## Reference files

- `references/architecture.md` — estrutura de pastas, Clean Architecture/SOLID aplicado ao RN
- `references/styling.md` — padrão de estilização por componente (sem Tailwind)
- `references/cmed-data.md` — como importar/indexar a base da CMED e mapear colunas → schema local
- `references/sync-and-offline.md` — detalhes de sincronização SQLite ↔ Supabase, LWW, RLS
- `references/screens-and-flows.md` — mapeamento de telas definidas vs. em aberto, fluxos de
  navegação, e perguntas pendentes de UX
