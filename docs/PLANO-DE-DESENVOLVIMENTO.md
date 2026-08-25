# Plano de Desenvolvimento — Mapill

> Documento vivo. É o roteiro único de execução do app até a versão de defesa do TCC.
> Regra de uso: **nunca começar um bloco novo sem o anterior estar com o "Pronto quando" 100% marcado.**
> Atualizar os checkboxes a cada commit relevante — este arquivo é o que impede o projeto de se perder.

---

## 0. Como este plano funciona

- O desenvolvimento é dividido em **blocos verticais** (uma funcionalidade completa de ponta a ponta:
  domínio → repositório SQLite → tela → sync → notificação), nunca em camadas horizontais.
  Motivo: cada bloco fechado é uma funcionalidade demonstrável na banca, mesmo se o cronograma apertar.
- Cada bloco tem:
  - **Escopo** — o que entra (e o que explicitamente NÃO entra).
  - **Entregáveis** — arquivos/artefatos concretos.
  - **Pronto quando** — critérios objetivos de aceite (Definition of Done).
  - **Rastreabilidade** — qual seção do artigo aquele código materializa.
- Ordem dos blocos é **dependência técnica**, não preferência. Pular ordem gera retrabalho.
- Branch por bloco: `feat/<slug-do-bloco>`, merge em `master` só com o "Pronto quando" fechado.

### Definition of Done global (vale para TODOS os blocos)

Nenhum bloco fecha sem estes seis itens:

1. Zero `any` no TypeScript novo; `npx tsc --noEmit` limpo.
2. Nenhuma tela com SQL embutido — acesso a dado sempre via repositório (Clean Architecture, §2.6).
3. Escrita crítica funciona **com o avião ligado** (offline-first, §2.8) — testar com Wi-Fi desligado.
4. Toda tabela nova tem `id` UUID (cliente), `updated_at`, `synced_at`, `deleted_at` (§2.9.3 + LGPD).
5. Nenhum `console.log` com dado clínico (LGPD art. 5º).
6. Toda ação destrutiva/crítica tem confirmação visual explícita (Nielsen — prevenção de erros).

---

## 1. Estado atual (atualizado em 2026-08-25)

### Já pronto ✅

| Área | Situação |
|---|---|
| Domínio | Entidades (`medication`, `prescription`, `dose-schedule`, `intake-log`, `inventory-item`, `appointment`, `patient-profile`, `consent`, `auth-user`) + ports fechados |
| Use-cases | `register-intake`, `correct-intake`, `snooze-dose-alarm` |
| SQLite | `database.ts` + migrations 001→014 + 10 repositórios |
| Design system | `src/ui/` (Button, Card, TextField, SelectField, Checkbox, Chip, IconButton, BottomSheet, Header, LegalAccordion, …) + `shared/theme` com paleta M3 real |
| Login | Tela + Google via Supabase Auth (`SupabaseAuthGateway`), sessão persistida, "continuar sem login" |
| Onboarding LGPD | `ConsentimentoScreen` + `consent_records` versionado por `CURRENT_TERMS_VERSION`; bump força reconsentimento |
| Ficha de saúde | `FichaDeSaudeScreen` — nome completo obrigatório, demais campos opcionais, foto (galeria), contatos de emergência em lista. Serve à primeira execução **e** à edição |
| Ajustes | Edição da ficha, vincular/desvincular conta Google, consulta dos termos com data/versão do aceite, e **MEUS DADOS**: apagar o clínico ou apagar tudo (apagamento físico, duas etapas, volta à primeira execução) |
| Home | Agenda do dia, progresso, confirmação/pulo com correção retroativa, adesão semanal e alerta de estoque — **tudo vindo dos repositórios**, sem mock |
| Navegação | Abas reais (Home/Calendário/Remédios/Ajustes) — nativas no aparelho, barra em JS no preview web; grupo `cadastro` como stack modal; rotas `/ficha` e `/termos`; `_layout.tsx` sem lógica de estado — **verificado em device (22/08)** |
| Cadastro de medicamento | Formulário manual completo, gravando medicamento + prescrição + estoque + horários no SQLite — **verificado em device (22/08)**. Horário escolhido no relógio nativo do Android, com preenchimento "de X em X horas", e data de início editável |
| Compromissos | Cadastro de consulta, retorno, exame e renovação de receita, com local, profissional, observação e antecedência do aviso. Aba Calendário lista próximos e passados, com editar, excluir e o registro de "você foi?" mais a anotação do que aconteceu. Só o **disparo** do aviso depende do C1 |
| Medicações | Lista dos cadastros com dose, frequência, horários e estoque, com busca por nome ou princípio ativo; lápis abre a edição no mesmo formulário e lixeira faz exclusão lógica com confirmação |
| Estoque | Tela própria (`/estoque`, pelo ícone no topo de Medicações e pelo card de estoque baixo da Home): quanto resta, quando acaba, recontagem física e reposição. Toda mudança grava um evento (`manual_recount` / `restock`), nunca sobrescreve o número |
| Build em aparelho | Dev build pelo **EAS** (o build local não fecha nesta máquina — ver log de 22/08) |

### Buracos conhecidos ❌

- **Notificações**: `expo-notifications` instalado, mas `src/notifications/` não existe. Zero alarmes.
- **Sync**: login autentica, mas nada sobe/desce. Sem tabelas no Supabase, sem RLS.
- **CMED**: nenhum script de ingestão, nenhum seed embarcado.
- **Histórico**: os `intake_logs` são gravados e alimentam a adesão da semana na Home, mas não há
  tela de histórico nem relatório por período (D2).
- **Direitos LGPD — parcial**: apagar os dados locais (clínicos ou tudo) e revogar consentimento
  já existem em Ajustes → MEUS DADOS, com apagamento físico. Faltam **exportar** e o lado
  servidor da exclusão, que depende do D1 existir.
- **Verificação em aparelho — parcial**: login Google, consentimento, ficha, navegação e cadastro
  foram validados em device (22/08), e a partir daí saíram três bugs que só apareciam ali (foto se
  sobrescrevendo, teclado cobrindo o campo, pílula das abas herdando cor do sistema). Em 24/08
  entraram a Home com dados reais (B4), a correção do fuso na agenda e o botão físico de voltar
  nos modais. Ainda **não** verificados: **listagem, busca, edição e exclusão** na aba Remédios.

---

## 2. Roadmap — visão geral

```
FASE A — FUNDAÇÃO (destrava tudo)
  A1  Navegação e shell do app
  A2  Fechar o bloco Login/Onboarding/Perfil (persistência + edição)

FASE B — NÚCLEO CLÍNICO (o coração do TCC)
  B1  Seed CMED (dicionário de medicamentos offline)
  B2  Cadastro de medicamento + prescrição (manual)
  B3  Cadastro por código de barras (EAN)
  B4  Home com dados reais (agenda do dia + confirmação de dose)
  B5  Estoque (baixa automática + alerta configurável)

FASE C — TEMPO REAL (o diferencial do app)
  C1  Notificações e alarmes de dose
  C2  Tela dedicada de gerenciamento de dose
  C3  Agenda / compromissos clínicos + receitas

FASE D — CONFIABILIDADE (o que a banca vai perguntar)
  D1  Sincronização SQLite ↔ Supabase (LWW + RLS)
  D2  Histórico e relatório de adesão
  D3  Configurações + direitos LGPD (exportar/excluir)

FASE E — ACABAMENTO
  E1  Estados vazios, offline, erro e acessibilidade
  E2  Build EAS, testes em device real, hardening
  E3  Materiais do TCC (prints, roteiro de demo, Capítulo 4)

FASE 2 (pós-defesa, não entra no escopo)
  Agente conversacional / MCP Anvisa
```

**Caminho crítico**: A1 → B2 → B4 → C1 → D1. Se o cronograma apertar, é essa linha que precisa
existir; B3 (código de barras), D2 (relatórios) e E3 podem ser reduzidos.

---

## FASE A — Fundação

### A1. Navegação e shell do app

**Por que primeiro**: sem rotas reais não existe onde encaixar nenhuma tela nova. Hoje toda tela
nova vira gambiarra no `_layout.tsx`.

**Escopo**
- Substituir as tabs de template pelas 4 reais: **Home / Calendário / Remédios / Ajustes**.
- Criar as stacks de cadastro (modal): `cadastro/escolha`, `cadastro/medicamento`, `cadastro/scanner`, `cadastro/compromisso`.
- Remover `explore.tsx`, `web-badge.tsx` e o que mais for resíduo do template Expo.
- Extrair o gate de primeira execução (`login → consent → profile → app`) do `_layout.tsx` para
  um provider/hook próprio (`useFirstRunGate`) — hoje é lógica de fluxo dentro de componente de layout (viola SRP, §2.6.1).
- FAB (+) da Home abrindo o ponto de entrada de cadastro.

**Não entra**: conteúdo das telas novas — só rotas com placeholder.

**Pronto quando**
- [x] As 4 tabs navegam e mantêm estado. — **verificado em device (2026-08-22)**.
- [x] O FAB abre "O que deseja cadastrar? → Medicação | Compromisso" e daí "Como? → Escanear |
      Manual" (ordem já decidida em `screens-and-flows.md` §2). — **verificado em device
      (2026-08-22)**, incluindo o cadastro completando e persistindo.
- [x] Botão físico de voltar (Android) se comporta corretamente em todos os modais. —
      **verificado em device (2026-08-24)**. Não tem equivalente no web — item permanentemente
      dependente do dev build (ver §5).
- [x] `_layout.tsx` não contém mais lógica de decisão de fluxo. — `useFirstRunGate`/`useDatabaseReady` ligados; `_layout.tsx` só decide o que renderizar pro `step` atual.
- [x] Preview web do shell funciona (pré-requisito pra trabalhar layout sem aparelho, §5.1).

**Rastreabilidade**: §2.6 (separação de responsabilidades).

---

### A2. Fechar o bloco Login / Onboarding / Perfil

**Por que**: essas telas existem mas o ciclo não fecha — não dá pra editar o perfil depois, e o
consentimento não tem revogação.

**Escopo**
- Tela de **edição** da ficha de saúde (hoje só existe o preenchimento de primeira execução).
- Foto de perfil (galeria, salva local — anexo com opt-out de nuvem, decisão nº10).
- Estado de conta: logado / anônimo, com opção de vincular conta Google depois (usuário que
  escolheu "continuar sem login" precisa poder mudar de ideia sem perder dado local).
- Consulta dos termos aceitos + reconsentimento quando `CURRENT_TERMS_VERSION` mudar.
- Preencher a seção 7 de `texto-legal.ts` (responsável pelo tratamento e contato).

**Pronto quando**
- [x] Dá pra voltar entre login → consentimento → ficha, inclusive pelo botão físico do Android
      (`useFirstRunGate.goBack`). Verificado no preview web; botão físico pendente de device.
- [x] Foto de perfil funciona: `expo-image-picker` instalado, permissão de galeria declarada no
      `app.json`, e o arquivo copiado pro diretório de documentos antes de salvar. **Verificado em
      device (2026-08-22)**, e o teste achou o bug do nome de arquivo fixo (ver log do dia).
- [x] Perfil editável a qualquer momento pela aba Ajustes (rota `/ficha`, a mesma tela em modo
      edição).
- [x] Usuário anônimo consegue logar depois sem perder os dados locais: Ajustes → CONTA →
      "Entrar com o Google". O login não toca no SQLite. **OAuth verificado em device
      (2026-08-22)** — o fluxo completo volta pro app pelo scheme `mapillapp://`.
- [x] Bump de versão dos termos força reconsentimento na próxima abertura — já funcionava,
      `hasValidConsent()` compara com `CURRENT_TERMS_VERSION`. **Verificado em device (2026-08-22).**
- [x] Nenhum `[PREENCHER]` no texto legal — seção 7 identifica o responsável e o contato.

**Revogação de consentimento — movida para o D3.** A LGPD (art. 8º §5º) exige o direito de
revogar, mas num app assim revogar só tem um significado prático: parar de tratar e apagar os
dados. É a mesma ação do direito de exclusão (art. 18), que já está no escopo do D3. Um botão
"revogar" solto numa tela de leitura, que apenas devolvesse o usuário ao consentimento, seria
pior que não ter. A tela de Ajustes → Termos e privacidade cobre a parte que faz sentido agora:
ler o texto vigente e ver data e versão do aceite.

**Rastreabilidade**: LGPD art. 8º §5º (revogação do consentimento), art. 11 (dado sensível).

---

## FASE B — Núcleo clínico

### B1. Seed CMED — dicionário de medicamentos offline

**Por que antes do cadastro**: o formulário de cadastro depende do autocomplete pra cumprir
"reconhecimento em vez de recordação". Fazer o formulário primeiro e enxertar o autocomplete
depois custa retrabalho no componente de busca.

**Escopo**
- Script Node em `scripts/import-cmed.ts` (roda em dev, **nunca** em runtime): lê o `.xlsx` da
  CMED, normaliza, deduplica por EAN, descarta colunas de preço/regulação.
- Saída: seed enxuto embarcado como asset + importação para o SQLite na primeira inicialização.
- Índices em `commercial_name`, `active_ingredient`, `ean`.
- Busca por trás do `MedicationRepository` (a fonte precisa ser trocável — hoje seed, amanhã API).

**Decisões a tomar aqui**
- Tamanho final do seed vs. peso do APK — se passar de ~15 MB, considerar só os N mais comuns
  + busca por EAN completa.

**Pronto quando**
- [ ] Busca por nome/princípio ativo retorna em < 200 ms com o app offline.
- [ ] Nenhum use-case conhece a origem do dado (seed vs. API).
- [ ] Peso adicionado ao app documentado neste arquivo.

**Rastreabilidade**: §2.4 (redução de carga cognitiva); `cmed-data.md`.

---

### B2. Cadastro de medicamento + prescrição (manual) ⭐ bloco mais importante

**Escopo ampliado em 2026-08-20.** O cadastro precisa cobrir **qualquer apresentação**, não só
comprimido: injeção, pomada, gotas, sublingual, adesivo, inalador, sachê. Isso muda a unidade de
dose (ml, g, mg, UI de insulina, gota, aplicação, jato…) e, por consequência, o modelo de dados.
Local de guarda e anexo de receita **entram aqui** — eram gap em aberto no protótipo e estavam
provisoriamente no C3.

O desafio do bloco é ser completo **sem** ficar difícil de operar. A regra: obrigatório é o
mínimo clínico; todo o resto é opcional e fica recolhido, com o mesmo par de selos
OBRIGATÓRIO/OPCIONAL já usado na ficha de saúde.

**Uma tela, dois estados** (decisão de 2026-08-21, substitui as duas etapas de 20/08). Etapas e
acordeões caem pelo mesmo motivo: obrigam a pessoa a operar a interface antes de responder o que
veio responder. Mas despejar tudo de uma vez polui. Então a tela mostra **só o essencial**, e
quando ele fica completo **o resto aparece de uma vez**, anunciado por "Já dá pra salvar". Uma
transição só, previsível — seções nascendo a cada tecla fariam a tela pular debaixo do dedo.

O botão de salvar é **rodapé fixo**: nasce desabilitado dizendo o que falta e acende no mesmo
instante da revelação. É ele que comunica, sem texto, que dá pra parar de preencher a qualquer
momento.

**O essencial** (o mínimo pro app lembrar o paciente da dose):
1. **Nome*** — onde o B1 (CMED) vai plugar o autocomplete.
2. **Como você toma*** — a forma farmacêutica, com rótulo humano.
3. **Quanto por vez*** — nas formas ambíguas, a unidade vem **antes** da quantidade; nas demais,
   ela já está dentro da pergunta ("quantos comprimidos de cada vez").
4. **Com que frequência*** — todo dia | dias da semana | a cada X dias | só quando precisar. As
   três que agendam respondem à mesma pergunta (**em quais dias**), e os horários do dia são um
   eixo separado, comum às três.
5. **Por quanto tempo** — uso contínuo ou com prazo; no prazo, número + dias/semanas/meses.

**O opcional**, tudo condicional:
6. **Estoque** — quantidade, alerta configurável (decisão nº1) e onde guardo.
7. **Receita** — anexo local (foto ou PDF) com opt-out de nuvem (decisão nº10), validade e
   aviso prévio de vencimento.
8. **Lembrete** — `alarm | notification | both | none` (decisão nº2), num popup próprio.
9. **Foto da caixa** e **Informações adicionais** (como tomar — fichas + texto livre —,
   princípio ativo, observação geral).

**Três regras de dependência** que sustentam o resto:

- **A unidade é consequência da forma, não pergunta.** Só líquido (ml/mg), injeção (ml/UI/mg) e
  "outra" têm ambiguidade real e mostram seletor; nas demais a unidade é derivada e vira selo.
- **Estoque conta na unidade da embalagem, não na da dose.** Gota se toma em gota e se compra em
  ml, e é o ml que está impresso no frasco. Contar na unidade errada quebra a única conta que o
  estoque existe pra fazer: quantos dias ainda dá.
- **A frequência gera os horários.** "3 vezes ao dia" abre exatamente três campos — vazios, nunca
  sugeridos: horário pré-preenchido é o que quem tem pressa aceita sem ler, e aí o app lembra a
  dose na hora errada em silêncio. O erro de salvar 3 doses com um horário só deixa de existir por
  construção.

**Campos que saíram do formulário** (2026-08-21): tarja (quem cadastra à mão não sabe; segue no
domínio esperando a CMED), "precisa de receita?" (anexar a receita já responde), princípio ativo
(desceu pro complemento — o valor dele é comparar preço de genérico depois) e data de início
(inútil em uso contínuo; gravada como hoje, volta quando "tratamentos" virar tela própria).

**Regras de exibição condicional.** O princípio: ninguém deve preencher o que não se aplica ao
seu caso — campo fora de contexto gera dúvida, não completude.

| Situação | O que some |
|---|---|
| Essencial incompleto | todas as seções opcionais, e o botão fica cinza dizendo o que falta |
| Forma sem ambiguidade de unidade | o seletor de unidade (vira selo) |
| Frequência "só quando precisar" | seção de alerta e os campos de horário |
| Frequência ≠ "dias da semana" | seleção de dias |
| Frequência ≠ "a cada X dias" | tamanho do ciclo, dias seguidos e início do ciclo |
| Dose não varia por horário | campo de quantidade em cada horário |
| "Uso contínuo" | duração em dias |
| "Não controlo estoque" | quantidade, alerta e onde guardo |
| Alerta de estoque desmarcado | antecedência do aviso |
| Receita não anexada | validade da receita e aviso de vencimento |
| Receita sem validade preenchida | aviso de vencimento |
| "Outra orientação" não marcada | campo livre de como tomar |

- Geração dos `dose_schedules` a partir da posologia (`generate-dose-schedules`), com a dose de
  cada ocorrência já resolvida.
- Resumo do tratamento em doses e em quantidade (`summarize-treatment`) e previsão de esgotamento
  do estoque (`estimate-stock-depletion`). As duas percorrem as doses geradas em vez de dividir
  quantidade por dose, porque a divisão erra com dose variável e com ciclo que tem pausa.
- Validação seguindo `medication-safety-validation`: faixas plausíveis, sem inferir valor
  clínico, bloqueio de horários duplicados/sobrepostos.

**Mudanças de modelo que o escopo exige**
- `Medication`: `form` (forma farmacêutica), `prescriptionRequirement` (tarja) e `photoUri`.
- `PosologyUnit`: cresce para cobrir todas as apresentações.
- `Prescription`: `notes`, `intakeInstructions` + `intakeNote`, anexo de receita
  (`attachmentUri`, `attachmentKind`, `attachmentValidUntil`, `renewalReminderLeadDays`, opt-out
  de nuvem).
- `DoseSchedule`: `amount` — a dose daquela ocorrência, gravada e não derivada.
- `InventoryItem`: `storageLocation`.
- `PosologySchedule` e `generate-dose-schedules` — ✅ entregues na migration 008.

**Pronto quando**
- [x] Cadastro completo funciona 100% offline. — grava medicamento, prescrição, estoque e os
      horários derivados, tudo em SQLite local. **Verificado em device (2026-08-22)**: o cadastro
      persiste e reaparece na listagem depois de fechar e reabrir o app.
- [x] As formas farmacêuticas cobrem comprimido, líquido, gota, injeção, pomada, sublingual,
      inalador, adesivo e sachê — e a unidade de dose oferecida acompanha a forma escolhida.
- [x] Editar e excluir (soft delete) uma prescrição existente funciona. — aba Remédios lista os
      cadastros; o lápis abre `cadastro/editar/[id]` com o formulário preenchido, e salvar regera
      os horários futuros. Exclusão é lógica (`deletedAt`) em medicamento, prescrição e estoque.
      **Pendente de device** — não entrou na leva de 24/08, é a última pendência de validação.
- [x] Excluir pede confirmação explícita e explica a consequência ("os registros de ingestão serão
      mantidos no histórico"). — o alerta diz o que some (horários futuros) e o que fica
      (histórico), porque é o receio de perder o histórico que trava a decisão.
- [x] Horários gerados batem com a posologia em todas as 4 frequências, incluindo virada de dia.
      — `generate-dose-schedules` verificado contra 8 casos (ver log de 2026-08-20).
- [x] Campo obrigatório vazio dá erro **antes** do submit, com mensagem no campo. Horário
      duplicado é barrado na digitação, e o texto abaixo do botão diz o que falta em vez de
      deixar a pessoa adivinhar por que ele está cinza.
- [x] Seções opcionais só aparecem depois do essencial, e cada uma esconde o que não se aplica
      ao medicamento cadastrado (tabela de regras condicionais acima).
- [x] A frequência decide quantos horários existem — não há como salvar "3 vezes ao dia" com um
      horário só.
- [x] Prazo e estoque conversam: o tratamento é resumido em doses (`summarize-treatment`,
      verificado contra 8 cenários em Node) e o estoque avisa quando não cobre o tratamento.
- [x] Anexo de receita em **PDF** — `expo-document-picker`, com os formatos aceitos escritos na
      tela (PDF, JPG ou PNG) em vez de descobertos no erro.
- [x] Aviso prévio de vencimento da receita, pra renovar sem interromper o tratamento — 7, 15 ou
      30 dias, e a tela mostra a data em que o aviso chega, não a antecedência.
- [x] Seletor nativo de horário (roda de hora/minuto) no popup de horários, no lugar do campo
      mascarado. — `TimePicker` do kit, sobre o `DateTimePicker` do `@expo/ui/jetpack-compose`, com
      irmão `.web.tsx` mantendo o campo mascarado no preview. **Pendente de device**: é componente
      Compose dentro de um `Modal`, e só o aparelho diz se ele desenha ali.
- [x] Intervalo em horas deixou de exigir conta de cabeça: o popup preenche "de X em X horas" a
      partir do primeiro horário, mostrando a lista inteira antes de aplicar.
- [x] Tratamento pode começar em data futura — "QUANDO COMEÇA" vale hoje e fica dito na tela, com
      atalho para alterar.
- [ ] Seção de lembrete a ser retrabalhada em conversa própria (2026-08-21). O que existe hoje —
      quatro modos, aviso de permissão e o acordeão "como funcionam" — fica como está até lá.

**Rastreabilidade**: §2.6 (use-case isolado da UI), §2.7.1 (confiabilidade algorítmica), Nielsen (prevenção de erros).

---

### B3. Cadastro por código de barras (EAN)

**Escopo**: câmera com moldura, entrada manual do código como alternativa obrigatória
(acessibilidade), busca no seed CMED, pré-preenchimento do formulário do B2 — o usuário sempre
revisa e confirma antes de salvar.

**Pronto quando**
- [ ] EAN não encontrado cai graciosamente no cadastro manual, sem beco sem saída.
- [ ] Permissão de câmera negada não quebra a tela — mostra a entrada manual.
- [ ] Nada é salvo sem revisão do usuário.

**Rastreabilidade**: Nielsen (reconhecimento em vez de recordação); §2.4.

---

### B4. Home com dados reais ⭐

**Escopo**
- Trocar todos os `MOCK_*` do `HomeScreen` por dados dos repositórios.
- Agenda do dia via `DoseScheduleRepository.findPendingForDay`.
- Confirmação de dose inline → `register-intake` → baixa de estoque (decisão nº6).
- Estados visuais: concluída / próxima / futura / **atrasada com ênfase forte** (decisão nº11.5).
- Progresso diário + streak (gamificação leve, nunca bloqueante — decisão nº7).
- Alerta de estoque baixo real, com "Ignorar lembrete".
- Correção retroativa: tocar numa dose já registrada permite corrigir → `correct-intake`
  (novo log via `correctsLogId` + `InventoryAdjustment` por delta, nunca sobrescrita).

**Pronto quando**
- [x] Confirmar dose desconta estoque; pular não desconta. — e desconta **a dose**, não uma
      unidade: `RegisterIntake`/`CorrectIntake` recebem `DoseSchedule.amount` (ver log de 22/08).
      A agenda do dia vindo dos repositórios foi **verificada em device (2026-08-24)**; a
      conferência da baixa de estoque contra a caixa física fica para o B5, que é a tela onde o
      número aparece.
- [x] Confirmar dose pede confirmação visual explícita antes de gravar. — diálogo com o
      medicamento, a dose e o horário; pular tem o seu, dizendo que o estoque não é descontado.
- [x] Correção retroativa gera log novo (o antigo continua consultável) e ajusta estoque por delta.
      — tocar numa dose já resolvida abre a troca de desfecho, que passa por `CorrectIntake`.
- [x] Dose não resolvida **nunca** vira "skipped" automaticamente por tempo (decisão nº11.5). —
      garantido por construção: o status vem do último `IntakeLog`, e sem log a dose fica `late`,
      que é um estado que pede resposta, não um desfecho.
- [x] Home sem nenhum medicamento cadastrado mostra estado vazio útil (não uma tela quebrada). —
      e separa "app vazio" (nunca cadastrou) de "dia vazio" (tem tratamento, sem dose hoje), que
      pedem ações diferentes.
- [x] **Confirmar em lote** ("tomei todas as da manhã") — "Confirmar todas" no bloco de atrasadas,
      com o diálogo nomeando cada dose que vai ser gravada. Só nas **atrasadas**: são as únicas em
      que "tomei" descreve algo que já aconteceu, e estender às futuras transformaria o histórico
      em registro de intenção. **Pendente de device.**

**Rastreabilidade**: §2.3.3 (eMEM — monitoramento eletrônico com timestamp auditável); §2.9.3.

---

### B5. Estoque — tela dedicada

**Escopo**: lista de medicamentos com quantidade restante e previsão de esgotamento (derivada da
posologia), recontagem manual (gera `InventoryAdjustment` com motivo próprio), reabastecimento,
e o lembrete periódico "seu estoque físico está alinhado com o app?" (decisão nº6, não obrigatório).

**Entregue em 2026-08-25.** O miolo já existia desde o B2/B4 e não tinha superfície: `estimateStockDepletion`
calculava a data, `applyAdjustment` gravava o evento com clamp em zero, e o único jeito de mexer no
número era reeditando o cadastro inteiro do remédio — que é errado, porque **repor não é reeditar um
tratamento**.

**Duas ações, não uma** (decisão de 25/08). Recontar e repor são acontecimentos diferentes no mundo:
uma é abrir o armário e contar o que está lá; a outra é somar o que acabou de chegar da farmácia.
Um único campo "corrigir" obrigaria a fazer a conta de cabeça em toda compra. O popup mostra a
prévia do resultado antes de confirmar, porque a diferença gravada é justamente o que não se vê
acontecer.

**Onde mora** (decisão de 25/08): rota `/estoque`, alcançada pelo ícone no topo da aba Medicações e
pelo card de estoque baixo da Home. Não virou quinta aba — estoque não é algo que se olha todo dia,
e a barra inferior é o espaço mais caro do app.

**Quem não aparece na lista** (decisão de 25/08): remédio sem controle de estoque ativado **não é
listado** — misturar o que tem número com o que não tem quebraria a única coisa que a tela faz, que
é comparar números. No lugar disso, um rodapé fixo explica que o controle é opcional e leva de volta
à lista de medicações, pra ativar no cadastro do remédio desejado.

**Pronto quando**
- [x] Recontagem manual e correção de ingestão compõem corretamente (eventos somados, nunca
      recálculo do zero). — `adjust-stock` grava **diferença**, nunca valor absoluto; verificado em
      Node contra 12 casos, incluindo a composição dose → recontagem → reposição → correção
      retroativa.
- [x] Previsão de esgotamento respeita o limiar configurado pelo usuário no B2. — a tela usa o mesmo
      `estimateStockDepletion` que alimenta o alerta da Home, e o limiar continua sendo o
      `lowStockAlertLeadDays` escolhido no cadastro.
- [x] A quantidade nunca vai a negativo, nem por recontagem nem por dose confirmada — clamp em zero
      dentro da mesma transação que grava o evento.
- [ ] Lembrete periódico "seu estoque está alinhado com a caixa?" (decisão nº6) — **depende do C1**,
      porque é notificação. Fica anotado aqui e não em aberto na tela.

---

## FASE C — Tempo real

> Esta é a fase mais arriscada e a que mais define se o Mapill entrega a promessa central
> ("o app que não deixa o paciente esquecer"). Por isso ela está detalhada em sub-blocos, e
> **começa por um spike de viabilidade** — não por código de produção.

### C1. Notificações e alarmes de dose ⭐ maior risco técnico do projeto

Referência da API confirmada em `docs.expo.dev/versions/v57.0.0/sdk/notifications` (SDK 57).

---

#### C1.0 — Spike de viabilidade (FAZER PRIMEIRO, timebox de 2 dias)

Nada de produção nesta fase antes de responder estas cinco perguntas em **device Android
físico**. Cada uma muda o escopo do resto da fase.

| # | Pergunta | Como testar | Se a resposta for "não" |
|---|---|---|---|
| 1 | Notificação **local agendada** dispara em Expo Go no Android? | Agendar uma para +2 min, fechar o app, esperar | Development build EAS vira **pré-requisito de toda a Fase C** — reordenar o E2 para cá |
| 2 | Dá pra fazer alarme **full-screen** (acorda a tela, estilo despertador)? | Ver quadro abaixo | Modo `alarm` cai para o Nível B (ver degradação) e o texto da UI muda |
| 3 | Dá pra tocar som **contínuo até o usuário desligar**? | Notificação com som longo + canal de importância máxima | Modo `alarm` vira "som curto + alta prioridade"; a UI não pode prometer despertador |
| 4 | Otimização de bateria de OEM (Xiaomi/Samsung/Motorola) mata o agendamento? | Deixar agendado por 12h com o app em background e a otimização agressiva ligada | Precisa de tela orientando o usuário a desativar a otimização para o Mapill |
| 5 | Quantas notificações pendentes cabem? | Agendar 100+ e listar as pendentes | Confirma o dimensionamento da janela deslizante (C1.2) |

**Sobre a pergunta 2 — o que já se sabe e o que falta confirmar:**
- Alarme full-screen no Android depende da permissão `USE_FULL_SCREEN_INTENT`, e o Android 14+
  **restringe essa permissão a apps de alarme/chamada**, com exigência de declaração na Play
  Store. Isso é restrição de plataforma, não do Expo.
- A API managed do `expo-notifications` **não expõe** full-screen intent — provavelmente exigiria
  config plugin/módulo nativo próprio.
- ⚠️ Tratar como "provavelmente inviável no prazo do TCC" até o spike provar o contrário.
  Não construir UI que prometa isso antes da resposta.

**Sobre a pergunta 1 — o que já se sabe:**
- A doc do SDK 57 registra que **push notifications não funcionam em Expo Go no Android desde o
  SDK 53** (exige development build). O texto fala de *push*; se **local agendada** também caiu
  é exatamente o que o spike precisa determinar — é a diferença entre continuar em Expo Go ou
  não.

**Saída obrigatória do spike**: escrever o resultado neste arquivo (seção "Log de progresso") e
escolher explicitamente um dos três níveis abaixo:

| Nível | O que entrega | Custo |
|---|---|---|
| **A — Despertador real** | Tela cheia, som até desligar, ignora silencioso | Dev build + módulo nativo + permissão restrita pela Play Store |
| **B — Alta prioridade** (mais provável) | Heads-up com som customizado, canal `bypassDnd`, ações rápidas | Dev build EAS |
| **C — Piso garantido** | Notificação padrão + destaque visual forte na Home | Funciona em qualquer cenário |

**Regra inegociável**: o texto da UI descreve o nível **entregue**, nunca o pretendido. Prometer
"alarme que toca até você desligar" e entregar um "pling" é falha de correspondência com o mundo
real (Nielsen) — e, num app de medicação, uma promessa de segurança falsa.

---

#### C1.1 — Camada e ports (domínio continua sem conhecer o Expo)

- `src/notifications/` — implementações concretas, é a única pasta que importa `expo-notifications`.
- `domain/ports/notification-permission-gateway.ts` — port já previsto em `screens-and-flows.md` §11.5.
- `domain/ports/dose-reminder-scheduler.ts` — contrato: `scheduleForPrescription()`,
  `cancelForPrescription()`, `cancelForDose()`, `rescheduleWindow()`.
- Nenhum use-case importa Expo; nenhuma tela agenda notificação direto.

**Rastreabilidade**: §2.6.1 (inversão de dependência — o domínio define o contrato, o Expo o cumpre).

---

#### C1.2 — Estratégia de agendamento: janela deslizante

**O problema**: "diário, 3x ao dia, por 6 meses" = ~540 notificações para **uma** prescrição.
Um paciente polimedicado com 5 tratamentos passaria de 2.500. Nenhuma plataforma aceita isso
(iOS limita notificações pendentes; Android tem limites práticos de alarmes exatos).

**A solução**: agendar só uma **janela deslizante de N dias** (sugestão inicial: 7), reagendada
a cada abertura do app e por background task. Registrar o N escolhido aqui depois do spike #5.

**Decisão técnica a tomar no início do bloco** — dois caminhos, com trade-off real:

| | Trigger `DAILY`/`WEEKLY` repetitivo | Trigger `DATE` por ocorrência |
|---|---|---|
| Custo de agendamento | 1 por horário, para sempre | 1 por dose dentro da janela |
| Sobrevive sozinho sem reagendar | ✅ | ❌ precisa da janela |
| Sabe **qual dose** disparou (para o deep link) | ❌ genérico | ✅ carrega `doseScheduleId` |
| Cancelar uma dose específica (paciente tomou antes) | ❌ | ✅ |

→ **Recomendação: `DATE` por ocorrência**, porque a tela de gerenciamento de dose (C2) precisa
saber exatamente qual dose disparou, e porque "confirmei antes do horário" tem que poder cancelar
aquela notificação específica. O custo é depender da janela — aceitável e controlável.

⚠️ Nota da doc SDK 57: os triggers `DAILY`/`WEEKLY`/`MONTHLY`/`YEARLY` são listados como Android,
e `CALENDAR` como iOS-only. Se o app for rodar em iOS, essa assimetria precisa ser tratada na
implementação do scheduler — mais um motivo para preferir `DATE`, que é comum às duas plataformas.

---

#### C1.3 — Identidade da notificação e deep link

- Toda notificação carrega `data: { doseScheduleId, prescriptionId, scheduledFor }`.
- O `notificationId` devolvido pelo agendamento é **persistido no SQLite** junto da dose — sem
  isso não há como cancelar individualmente depois.
- App aberto → `addNotificationResponseReceivedListener`.
- App fechado → `getLastNotificationResponseAsync()` no bootstrap, **antes** de decidir a rota
  inicial (senão o app abre na Home e o paciente perde o contexto do que tocou).
- ⚠️ A doc do SDK 57 registra um problema conhecido de splash screen em **dev builds** Android ao
  abrir por notificação (~70% das vezes; release não é afetado). Não gastar tempo caçando isso
  como se fosse bug do app — está documentado como comportamento do dev build.

---

#### C1.4 — Ciclo de vida: quando reagendar

Lista fechada de gatilhos que **obrigam** reagendamento — cada um precisa de teste próprio:

1. Criar, editar ou excluir prescrição.
2. Mudar `reminderMode` (`alarm` ↔ `notification` ↔ `none`).
3. Alterar horários ou frequência da posologia.
4. Pausar/retomar um tratamento.
5. Confirmar uma dose **antes** do horário → cancelar a notificação pendente daquela dose.
6. Snooze (respeitando a trava de 1 adiamento de `snooze-dose-alarm`).
7. Virada da janela deslizante (abertura do app + background task).
8. Reboot do device — a doc indica re-registro automático via `RECEIVE_BOOT_COMPLETED`;
   **validar na prática**, não confiar.
9. Mudança de fuso horário ou horário de verão.
10. Restauração de dados vindo do sync (D1) em device novo → reagendar tudo do zero.

**Regra de ouro**: nunca "editar" uma notificação existente. Sempre **cancelar tudo da prescrição
e reagendar a janela** — operação idempotente, que é a única forma barata de garantir zero alarme
órfão (o pior bug possível aqui: o paciente recebe lembrete de um remédio que já parou de tomar).

---

#### C1.5 — Ações rápidas na notificação

Via `setNotificationCategoryAsync`: **Tomei** / **Adiar 5 min** / (abrir o app).

⚠️ **Conflito de heurística a decidir conscientemente**: registrar "Tomei" direto pela notificação
**pula a confirmação visual explícita** que o próprio plano exige para ações críticas (DoD nº6).

→ **Recomendação**: permitir mesmo assim, porque tocar num botão rotulado "Tomei" já é uma ação
deliberada, e a fricção extra num app de adesão é contraproducente — **desde que** a Home ofereça
desfazer/corrigir de forma óbvia (o `correct-intake` já existe para isso). Registrar essa escolha
como decisão de design no Capítulo 4, não deixar implícita.

- "Adiar" precisa respeitar a trava de 1 adiamento **na própria notificação**, não só na tela.

---

#### C1.6 — Canais Android (Android 8+)

- `dose-alarm`: importância máxima, som customizado, `bypassDnd`, visível na tela de bloqueio.
- `dose-reminder`: importância alta/padrão, sem bypass.
- `appointment-reminder`: para o C3.

⚠️ **Armadilha documentada**: depois de criado, um canal só permite alterar **nome e descrição** —
som e importância ficam congelados no device do usuário. Portanto: **versionar o id do canal**
(`dose-alarm-v2`) sempre que som/importância mudarem, senão a mudança simplesmente não aparece
para quem já instalou.

---

#### C1.7 — Permissão

- Pedida **no momento em que o paciente ativa** `alarm`/`notification` numa prescrição — não no
  onboarding (prevenção na raiz, e o pedido chega com contexto de por que é necessário).
- Android 13+ exige `POST_NOTIFICATIONS` em runtime.
- ⚠️ Doc SDK 57: no Android, **o usuário não pode ser perguntado de novo** depois de negar — o app
  precisa explicar e mandar para as configurações do sistema, não insistir num diálogo que nunca
  mais aparece.
- Revogada depois → aviso **persistente e visível** na Home enquanto existir prescrição que
  dependa dela, e no card da própria prescrição. Reverificar sempre que o app volta ao foreground.
- **Nunca falhar em silêncio** (decisão nº11.5).

---

#### C1.8 — Casos de borda obrigatórios (checklist de teste)

- [ ] Fuso horário / horário de verão — dose das 08:00 continua às 08:00.
- [ ] Dose que atravessa a meia-noite (ex: intervalo de 8h começando às 22:00).
- [ ] Usuário muda o relógio do device manualmente.
- [ ] Modo "Não perturbe" / Foco ativo.
- [ ] Notificação dispara com o app **aberto na própria tela de dose** — não duplicar nem
      empilhar tela sobre tela.
- [ ] Dose já confirmada manualmente antes do horário — notificação cancelada, não dispara.
- [ ] Duas doses de medicamentos diferentes no **mesmo horário** — duas notificações distintas
      ou uma agrupada? (decidir; agrupar é melhor UX, mas complica o deep link).
- [ ] Device sem espaço/bateria crítica.
- [ ] App reinstalado — nada agendado até o primeiro boot; reagendar tudo.

---

**C1 está pronto quando**
- [ ] Resultado do spike documentado e nível (A/B/C) escolhido explicitamente.
- [ ] Notificação dispara com o app **fechado**, em device Android físico (não só emulador).
- [ ] Os 10 gatilhos de reagendamento (C1.4) testados um a um, sem alarme órfão.
- [ ] Checklist de borda (C1.8) percorrido.
- [ ] Permissão revogada gera aviso visível na Home.
- [ ] Nenhum `import` de `expo-notifications` fora de `src/notifications/`.
- [ ] Texto da UI condiz com o nível realmente entregue.

**Rastreabilidade**: §2.8 (agendamento nativo, independente do app estar aberto — é o argumento
central do artigo sobre confiabilidade do lembrete).

---

### C2. Tela dedicada de gerenciamento de dose

**Escopo**: destino do toque na notificação/alarme. Mostra a dose que disparou em destaque **+ as
outras pendentes/atrasadas do dia** abaixo (decisão nº2 — não é tela de foco único, não é a Home).

**Ações**: Tomei / Não tomei / Adiar 5 min (máx. 1x) / **Ignorar por agora** (`status: deferred` —
"vi, resolvo depois", que é diferente de nunca ter visto).

**Detalhes que costumam ser esquecidos**
- Como a tela se comporta quando aberta **sem** notificação (pela Home)? Mesma tela, sem destaque.
- O que acontece se o paciente abre a notificação 3 horas depois? A dose está atrasada — a tela
  precisa deixar isso explícito, não fingir que é a hora.
- Voltar dessa tela quando ela foi a **rota inicial** (app aberto pela notificação) precisa levar
  para a Home, não fechar o app.

**Pronto quando**
- [ ] Abre corretamente vindo de notificação com o app fechado (deep link + rota inicial).
- [ ] "Ignorar por agora" grava `deferred`, distinto de "nunca visto" e de "pulou".
- [ ] Segundo adiamento é impossível **na UI**, não só bloqueado no domínio.
- [ ] Nenhuma dose vira `skipped` sozinha por decurso de tempo (decisão nº11.5).

---

### C3. Agenda / compromissos clínicos + receitas

**Escopo**: consultas, exames e renovação de receita (decisão nº8). Calendário mensal + lista.
Upload de foto da receita com validade e data de renovação, gerando lembrete próprio pelo mesmo
mecanismo do C1. Anexos salvos localmente primeiro, nuvem opt-out por registro (decisão nº10).

Local de guarda e anexo de receita **saíram daqui** em 2026-08-20 — foram para o B2, onde o
paciente já está descrevendo o medicamento. O que fica no C3 é a receita como **compromisso**
(a ida ao médico para renovar), não como anexo do remédio.

**Cadastro e agenda entregues em 2026-08-24**, antecipados enquanto a validação em aparelho do
B2/B4 não voltava. Só a parte que **dispara** o aviso depende do C1; cadastrar, listar, editar e
excluir não dependem de nada pendente.

**Contexto de uso** (definido pelo Gabriel em 24/08): retorno ao médico, exames e coleta de
sangue, consultas de psicólogo e terapeuta. "Praticamente igual à agenda do Google" — um ponto no
tempo com lembrete, sem regra que se repete.

**Descrição em texto livre, não lista de tipos** (decisão de 24/08, substitui os quatro tipos
fechados da primeira versão). A lista real não fecha — consulta, retorno, exame, coleta de sangue,
sessão de terapia, fisioterapia —, e cada opção que falta obriga quem cadastra a escolher a menos
errada e explicar o resto na observação. O nome que a pessoa dá é o nome pelo qual ela vai
reconhecer o compromisso na agenda depois.

**Aviso**: só notificação, nunca alarme (decisão de 24/08). Interromper como despertador se
justifica na dose, que tem hora exata e consequência clínica imediata; para uma consulta na semana
que vem seria só barulho.

São **dois canais independentes**, porque são pedidos diferentes: antecedência (para se organizar
— remarcar o trabalho, arrumar carona) e lembrete no próprio dia (para não esquecer o que já
estava planejado). Quem marca consulta costuma querer os dois, e um campo só obrigaria a escolher.
A antecedência é em dias, com atalhos para 1, 3 e 7 e campo livre para o resto, no mesmo padrão do
"quantas vezes por dia" do B2. As escolhas são gravadas desde já (migration 014) e a tela diz, sem
rodeio, que os avisos ainda não chegam.

**Calendário unificado** (decisão de 24/08): a aba mostra **compromissos e horários de dose no
mesmo dia**, porque é assim que o dia acontece — quem tem consulta às 14h e dose às 14h30 precisa
ver isso junto, e não em duas telas que nunca se cruzam. Agrupado por dia, com as doses num bloco
compacto em vez de um cartão cada (três doses por dia em trinta dias seriam noventa cartões, e o
compromisso do dia 27 se perderia no meio). Além dos 30 dias que o app grava de fato
(`SCHEDULE_HORIZON_DAYS`), os horários são **projetados na hora** a partir da posologia, com a
mesma função pura que gera os reais — sem isso a agenda apareceria vazia a partir do dia 31, o que
leria como "não tenho remédio em outubro". Dose projetada não se confirma: não existe registro
para apontar. Confirmar e pular também funcionam aqui, pelo mesmo caminho da Home
(`gravarDesfecho`), e só em hoje e nos dias passados.

**FAB em toda aba que lista algo** (decisão de 24/08): quem está olhando a lista de remédios e
quer cadastrar outro não deveria voltar à Home para achar o botão. O destino muda por tela —
Remédios vai direto para "escanear ou manual", porque estar ali já responde que é remédio;
Calendário e Home abrem a escolha completa.

**Pronto quando**
- [x] Cadastrar, listar, editar e excluir compromissos funciona 100% offline. — aba Calendário
      agrupada por dia, exclusão lógica, e a mesma tela criando e editando.
      **Pendente de device.**
- [x] O calendário mostra compromissos **e** doses no mesmo dia, com projeção além dos 30 dias
      gravados. **Pendente de device.**
- [x] Toda aba que lista algo tem o botão de cadastrar. **Pendente de device.**
- [x] O compromisso confirma com a **data por extenso e o dia da semana** antes de salvar — "dia
      27" não denuncia nada, mas "sábado" denuncia na hora quem quis marcar na sexta.
- [x] Antecedência que não cabe é avisada em vez de gravada em silêncio — "7 dias antes" numa
      consulta que é depois de amanhã descreve um aviso que já passou.
- [x] **Registro do que aconteceu**: compromisso passado pergunta "você foi?" e aceita
      compareceu / não compareceu, mais uma anotação livre do que saiu dali ("médico pediu
      hemograma"). É o histórico de acompanhamento a longo prazo, e a anotação de depois é campo
      separado da observação de preparo escrita antes ("jejum de 12h") — tempos e utilidades
      diferentes. **Nunca vira "faltou" sozinho por decurso de prazo**, mesma regra da dose não
      resolvida (decisão nº11.5): ausência de resposta não é desfecho.
- [ ] Compromisso gera lembrete que dispara como o de dose. — **depende do C1**.
- [ ] Receita vencendo aparece com destaque antes de vencer.
- [ ] Grade de calendário mensal — fora do escopo desta rodada, a lista responde "qual é o
      próximo e quando" sem obrigar a navegar entre meses.

---

## FASE D — Confiabilidade

### D1. Sincronização SQLite ↔ Supabase ⭐

**Escopo**
- Espelhar o schema local no Supabase (PostgreSQL) — todas as tabelas sincronizáveis.
- **RLS obrigatório** em todas: `user_id = auth.uid()`.
- `SyncService`: push (`synced_at IS NULL OR updated_at > synced_at`) + pull (mais novos que a
  última sync), em background, **nunca bloqueando a UI**.
- Conflito: **Last-Write-Wins** por `updated_at`, tudo-ou-nada por registro (sem merge parcial).
- Supabase Storage para anexos que não estejam marcados como opt-out.
- Indicador de status de sync na UI (última sincronização, pendências).

**Pronto quando**
- [ ] Dado criado offline sobe sozinho ao voltar a conexão.
- [ ] Instalar em segundo device com a mesma conta restaura os dados.
- [ ] Editar o mesmo registro nos dois devices resolve por LWW, de forma determinística.
- [ ] RLS testado: token de um usuário não lê linha de outro.
- [ ] Anexo opt-out permanece só no device.

**Rastreabilidade**: §2.9 (consistência eventual — Vogels, 2008), §2.9.3 (LWW — Kleppmann, 2017).

---

### D2. Histórico e relatório de adesão

**Escopo**: tela de histórico mensal e por medicamento, taxa de adesão, doses perdidas com
destaque, e um resumo exportável (PDF/imagem) que o paciente possa mostrar ao médico.

**Pronto quando**
- [ ] Histórico reflete correções retroativas corretamente.
- [ ] Percentual de adesão calculado por um use-case testável, não dentro da tela.

**Rastreabilidade**: §2.3.3 (auditoria clínica).

---

### D3. Configurações + direitos LGPD

**Escopo** (decisão nº9): tema/contraste, permissões do app, **exportar todos os dados**,
**excluir conta** (hard delete no Supabase + purge local real, não só ocultar da UI) e
**revogar consentimento** — herdada do A2, onde ficou claro que revogar e excluir são a mesma
ação: revogar o consentimento retira a base legal de todo o tratamento, então o que resta é
apagar. Vira uma ação só, "Revogar consentimento e apagar meus dados".

A ficha de saúde, o status de conta e a consulta dos termos já foram entregues no A2 —
a aba Ajustes existe, este bloco só acrescenta seções a ela.

**Metade local entregue em 2026-08-24**, antes do bloco, porque ela não depende do D1 e porque
sem ela não há como testar o app sem desinstalar. Ajustes ganhou a seção MEUS DADOS com
"Apagar meus dados de saúde" e "Apagar tudo e recomeçar", ambos com apagamento **físico**
(`LocalDataRepository`), inclusive das fotos e receitas no diretório de documentos.

**Pronto quando**
- [ ] Exportação gera arquivo legível com todos os dados do titular.
- [ ] Exclusão apaga de verdade nos dois lados — verificado no painel do Supabase. — **o lado
      local está feito**; o lado servidor depende do D1 existir, e com sincronização ligada o
      apagamento tem que acontecer **primeiro no servidor**, senão o próximo `pull` traz tudo de
      volta.
- [x] Exclusão tem confirmação em duas etapas. — e a segunda repete o que some em vez de só
      perguntar "tem certeza?", porque é ela que precisa ser lida.
- [x] Revogar consentimento apaga os dados e devolve o app ao estado de primeira execução. —
      "Apagar tudo e recomeçar" apaga `consent_records` junto e chama `restartFirstRun()`. Seguir
      em uso sem consentimento registrado é o que a LGPD não admite, então o retorno ao início não
      é cortesia de UX, é obrigação. **Pendente de device.**
- [x] "Excluir conta" significa **apagar os dados e desvincular o titular do ambiente de nuvem** —
      decisão de escopo confirmada em 2026-08-24. Não significa deletar a linha em `auth.users` do
      Supabase, que exigiria API de admin com service role (impossível a partir do cliente) e que
      o titular não pede: a conta do Google é dele, não do Mapill. A tela diz isso com todas as
      letras — "sua conta do Google não é excluída, só deixa de estar ligada ao Mapill".

**Rastreabilidade**: LGPD art. 18 (direitos do titular), art. 8º §5º (revogação).

---

## FASE E — Acabamento

### E1. Estados vazios, offline, erro e acessibilidade
- [ ] Toda lista tem estado vazio com próxima ação clara.
- [ ] Indicador visual de "dados não sincronizados".
- [ ] Toda operação que pode falhar tem estado de erro com recuperação (nunca só um spinner infinito).
- [ ] Checklist completo de `usability-heuristics-health-ui`: contraste, área de toque ≥ 48dp, escala de fonte do sistema respeitada, leitor de tela nos fluxos críticos.

### E2. Build, device real e hardening
- [ ] Development build EAS gerado e testado em Android físico.
- [ ] Bateria/otimização agressiva (Xiaomi, Samsung) não mata as notificações — ou o app avisa o usuário.
- [ ] Migração de banco testada com dado pré-existente (não só em banco zerado).
- [ ] Nenhuma credencial no repositório; `.env` fora do git.

### E3. Materiais do TCC
- [ ] Prints/roteiro de demonstração das funcionalidades do caminho crítico.
- [ ] Capítulo 4 (Resultados) mapeando: argumento do artigo → arquivo/decisão de código.
- [ ] Limitações e trabalhos futuros (inclui a Fase 2 do agente Anvisa).

---

## 3. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Alarme full-screen não viável (Android 14 restringe `USE_FULL_SCREEN_INTENT`; API managed não expõe) | Alto — afeta a promessa central do app | Spike C1.0 antes de qualquer código da fase; escolher explicitamente o nível A/B/C e ajustar o texto da UI ao que for entregue |
| Expo Go não dispara notificação agendada no Android (push já não dispara desde o SDK 53) | Alto — bloqueia a Fase C inteira | Spike C1.0 pergunta #1; se confirmado, antecipar o dev build EAS (E2) para antes da Fase C |
| Explosão de notificações agendadas (posologia longa × várias prescrições) | Médio — estouro de limite da plataforma, lembrete que some | Janela deslizante de N dias (C1.2) + reagendamento por background task |
| Seed CMED muito pesado | Médio — tamanho do APK | Reduzir dataset ou lazy-load sob demanda (decidir no B1) |
| Sync (D1) subestimado | Alto — é o bloco mais sutil | Não deixar pro fim; se apertar, entregar só push (backup unidirecional) e declarar como limitação |
| OEM matando notificação em background | Médio | Testar em device real cedo (E2); avisar o usuário na configuração |
| Escopo crescendo (agente Anvisa, badges, cuidador) | Alto — clássico de TCC | Congelado: Fase 2. Não abrir enquanto o caminho crítico não fechar |

---

## 4. Regras de escopo congelado

Não entram nesta versão, mesmo que a ideia seja boa:
- Papel de cuidador/usuário duplo (conta é uma por paciente — decisão fechada).
- Agente conversacional / MCP Anvisa (Fase 2).
- Tela de conquistas/badges (gamificação fica em progresso + streak na Home).
- Troca de stack (SQLite, Supabase, sem Tailwind — decisões já justificadas no artigo).

---

## 5. Ambientes de trabalho

O projeto é desenvolvido em dois contextos diferentes, e **eles têm objetivos diferentes**.
Confundir os dois é o que fez o bloco A1 travar em problema de plataforma em vez de avançar em
funcionalidade. A regra abaixo é normativa.

| Ambiente | Onde | Para que serve | Autoridade sobre |
|---|---|---|---|
| **Preview web** | `npm run web`, localhost | **Ver** a tela: layout, fluxo de navegação, texto, espaçamento, cor | Nada. Web nunca decide se uma feature está pronta |
| **Dev build (Android)** | aparelho físico / emulador | Validar comportamento real: SQLite, notificações, OAuth, botão de voltar | Tudo. É o único ambiente que fecha um "Pronto quando" |

### 5.1 Política de plataforma — web é vitrine, não alvo

**Web não é plataforma suportada do Mapill.** É um espelho visual para trabalhar no layout e no
fluxo sem depender de aparelho. Consequências práticas:

- **Nunca** gastar tempo fazendo uma API nativa funcionar de verdade no navegador. SQLite,
  notificações, câmera/scanner e OAuth **não precisam funcionar no web** — precisam só **não
  quebrar o bundle**.
- Se uma lib nativa impedir o app de *renderizar* no web, a correção é **isolar**, não portar:
  criar um arquivo `.web.tsx` irmão com uma versão visual simplificada, ou `Platform.OS === "web"`
  com um caminho neutro. O padrão já está em uso no repo — `useDatabaseReady` pula as migrations
  no web e libera a UI, e `useFirstRunGate` usa `persistsLocally` pra não chamar repositório
  nenhum. **Copiar esse padrão em vez de inventar outro.**
- Um bug que só existe no web **não** é bug do app. Anotar aqui e seguir — nunca vira tarefa de
  bloco.
- **`web.output` deve ser `"single"` no `app.json`** (SPA), nunca `"static"`. Com `"static"` o
  expo-router pré-renderiza cada rota **em Node**, onde não existe `window` — e qualquer lib que
  toque em `window` no import derruba o dev server inteiro. Foi o que aconteceu assim que o
  `.env` do Supabase foi preenchido: o cliente passou a ser criado no carregamento do módulo,
  o `supabase-js` tentou restaurar a sessão via `AsyncStorage` → `window.localStorage`, e o
  servidor morreu com `ReferenceError: window is not defined` antes de servir a página.
  Renderização estática serve pra HTML indexável por buscador; o Mapill não é site, então ela
  só agrega modos de falha. `"single"` é inclusive o padrão do Expo — o `"static"` era resquício
  de template.
- No web o fluxo de primeira execução roda inteiro a cada reload (nada persiste, por design).
  Pra chegar rápido no app: *Continuar sem login* → aceitar consentimento → *Pular* na ficha.

### 5.2 Regra de resolução de módulo (Metro)

Erro `Unable to resolve module X from node_modules/...` no web é **quase sempre** conflito de
resolução, não código do projeto. Antes de mexer em qualquer coisa, checar nesta ordem:

1. A dependência está mesmo instalada? (`npm install` — já mordeu uma vez: `expo-auth-session`
   estava no `package.json` e ausente de `node_modules`, o que derrubava o app no boot em
   **todas** as plataformas, não só no web.)
2. O pacote expõe esse subpath só pelo mapa `exports` do `package.json`? Então
   `unstable_enablePackageExports` **precisa** estar habilitado.
3. Só então considerar um alias no `metro.config.js`.

**`config.resolver.unstable_enablePackageExports` deve permanecer no padrão (habilitado).**
Já foi desabilitado uma vez como workaround pro `react-native-svg`, e isso quebrou o bundle web
inteiro na tela de tabs: o `NativeTabs` no web usa `@radix-ui/react-tabs`, e
`@radix-ui/primitive` expõe `./is-development` **exclusivamente** pelo mapa `exports` — não há
arquivo físico com esse nome. O workaround do svg ficou obsoleto na 15.15.4 (a lib deixou de
declarar `exports`, então a resolução clássica dá conta). Ver comentário em `metro.config.js`.

Lição geral: **kill switch global de resolver é dívida técnica** — ele conserta uma lib e
quebra silenciosamente todas as outras que dependem do comportamento padrão. Preferir sempre o
alias pontual.

### 5.3 Checagem antes de dar um bloco como "visualmente pronto"

```bash
npx tsc --noEmit     # precisa sair limpo
npx expo lint        # 0 erros (1 warning conhecido em inventory-repository.ts)
npm run web          # precisa BUNDLAR e renderizar — não precisa persistir nada
```

Se o `tsc` reclamar de rota (`"/cadastro/x" is not assignable to...`), os tipos de rota em
`.expo/types/router.d.ts` estão obsoletos: **subir o dev server uma vez** regenera. Não é erro
de código.

---

## 5.4 Como rodar em aparelho físico (ambiente de teste)

Estado do projeto: **managed** (sem pastas `android/`/`ios/`), com `expo-dev-client` já instalado
e o perfil `development` já configurado no `eas.json`. Metade do caminho do dev build já está feita.

### Por que dev build, e não Expo Go

Não é só pelas notificações. O OAuth monta o redirect com `makeRedirectUri()`
(`supabase-auth-gateway.ts:47`), que se comporta diferente em cada ambiente:

| Ambiente | Redirect gerado | Consequência |
|---|---|---|
| **Dev build** | `mapillapp://` (scheme do `app.json`) | Fixo — cadastra uma vez no Supabase e esquece |
| **Expo Go** | `exp://192.168.x.x:8081/--/...` | Muda com o **IP da máquina na rede** — teria que atualizar os Redirect URLs do Supabase a cada mudança |

Somado ao fato de que o Expo Go no Android não dispara push desde o SDK 53 (ver C1.0), o dev build
é o ambiente de teste padrão do projeto.

### Opção A — Build na nuvem (EAS) — recomendada

Não depende do Android SDK estar corretamente configurado.

```bash
npm install                       # resolve o expo-auth-session ausente em node_modules
npm install -g eas-cli
eas login                         # conta Expo gratuita
eas build --profile development --platform android
```

Ao final, o EAS devolve link/QR → abrir no celular, baixar o `.apk`, instalar (o Android pede
para permitir instalação de fonte desconhecida).

- **Prós**: independe do ambiente local. **Contras**: fila do plano gratuito pode demorar.

### Opção B — Build local (Android Studio)

Aparelho no cabo USB, com depuração USB ativada:

```bash
npm install
npx expo run:android
```

- **Prós**: sem fila, sem conta Expo; rebuilds seguintes mais rápidos.
- **Contras**: primeira compilação leva 10–20 min e exige `ANDROID_HOME`/SDK configurados.

**Ativar depuração USB**: Configurações → Sobre o telefone → tocar 7× em "Número da versão" →
voltar → Opções do desenvolvedor → Depuração USB. Ao plugar, aceitar o popup "Permitir depuração
USB?" no aparelho. Conferir se o PC enxerga:

```bash
"$LOCALAPPDATA/Android/Sdk/platform-tools/adb" devices   # deve listar o aparelho como "device"
```

### Ciclo de trabalho depois do build

O build é feito **uma vez**. Ele instala um app "Mapill (dev)" que funciona como um Expo Go
exclusivo do projeto. No dia a dia:

```bash
npx expo start --dev-client
```

Só é necessário **rebuildar** ao mudar dependência nativa ou o `app.json`. Mudança de código
JS/TS não exige rebuild — hot reload funciona normalmente.

### Configuração do Supabase + Google (feita uma vez)

O fluxo implementado é **por navegador** (`signInWithOAuth` + `WebBrowser.openAuthSessionAsync`),
não o nativo com Credential Manager. Essa distinção define toda a configuração abaixo: o Google
**nunca fala com o app** — ele redireciona pro Supabase, e o Supabase é que redireciona pro
`mapillapp://`. Por isso **não** é preciso client de Android nem fingerprint SHA-1, ao contrário
do que a documentação do Supabase sugere. Isso também significa que trocar de build (EAS, local,
outro aparelho) **não** exige regerar credencial no Google.

A URL de retorno é `mapillapp://` — vem de `makeRedirectUri()` sem argumentos, que num dev build
resolve pro `scheme` do `app.json`.

1. **Supabase → Authentication → URL Configuration → Redirect URLs**: `mapillapp://` e
   `mapillapp://*` (o wildcard cobre o caso de o redirect vir com path). ✅ configurado.
   O **Site URL** não participa desse fluxo — é só o fallback de quando nada casa na allow list,
   e serve de diagnóstico: parar numa página de erro em `localhost:3000` depois do login
   significa "o redirect não casou com nenhuma entrada".
2. **Supabase → Authentication → Providers → Google**: habilitado, com **Client ID e Client
   Secret**. O secret é a lacuna mais comum — sem ele o Supabase não troca o code com o Google
   e o fluxo morre no meio, mesmo com o Client ID correto.
3. **Google Cloud Console → Credentials**: o OAuth client precisa ser do tipo
   **`Web application`** (não `Android`), com o callback do Supabase
   (`https://<ref>.supabase.co/auth/v1/callback`) em *Authorized redirect URIs*.
4. **Google Cloud Console → OAuth consent screen**: em modo *Testing*, só contas listadas em
   *Test users* conseguem entrar — o Google bloqueia antes mesmo de pedir a senha.

### Checklist do primeiro teste de login

- [x] `npm install` rodado — `expo-auth-session` estava no `package.json` e ausente de
      `node_modules`, o que quebrava o app no import antes de chegar no OAuth (em todas as
      plataformas, não só web).
- [x] `.env` preenchido com `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`
      (ver `.env.example`). A URL é sempre `https://<ref>.supabase.co`, e o `ref` está no
      payload da própria chave anon — dá pra derivar sem procurar no dashboard.
      ⚠️ Depois de editar o `.env`, **reiniciar o `expo start`**: variáveis `EXPO_PUBLIC_` são
      embutidas no bundle em build time, não lidas em runtime.
- [x] Supabase → Redirect URLs contém `mapillapp://`.
- [x] Client Secret preenchido no provider Google — o login completa, o que só acontece com ele.
- [x] OAuth client do tipo `Web application` no Google Cloud — idem: o callback do Supabase só
      fecha com esse tipo.
- [x] Dev build instalado no aparelho (EAS, 22/08).
- [x] Login com Google conclui e o app avança para consentimento/ficha. **Verificado em device
      (2026-08-22)**, reconfirmado em 24/08.
- [x] Fechar e reabrir o app **não** pede login de novo (sessão persistida via AsyncStorage).

Como o perfil `development` do `eas.json` usa `developmentClient: true`, o JS vem do Metro da
máquina local em runtime — então o `.env` local **é** lido normalmente no dev build. A pegadinha
de variável `EXPO_PUBLIC_` faltando só aparece em build `preview`/`production`, onde o bundle é
gerado no servidor do EAS.

---

## 6. Status de plataforma e de paradigma

> Esta seção existe para que "roda no iPhone?", "isso continua offline-first?" e "o que falta
> testar no aparelho?" se respondam **lendo**, e não auditando o código de novo a cada vez.
> Atualizar ao fechar cada bloco. Última varredura: **2026-08-24**.

### 6.1 Plataformas

**Android é a plataforma alvo.** iOS é mantido *compilável*, não verificado: escrever o irmão
`.ios.tsx` quando uma API é de plataforma custa minutos, enquanto descobrir o import quebrado no
primeiro build de iOS custa uma tarde — mas nada disso vira promessa até existir um build.

| Área | Android | iOS | Web (preview) |
|---|---|---|---|
| Navegação (`NativeTabs`) | ✅ verificado em device | ⚙️ código pronto (`sf=` declarado ao lado do `md=`) | ✅ barra em JS |
| SQLite + repositórios | ✅ verificado | ⚙️ código pronto | ⛔ desligado por design (`useDatabaseReady`) |
| Login Google (OAuth) | ✅ verificado | ⚙️ código pronto (redirect sai do `scheme`) | ⛔ não persiste |
| Foto / anexo de receita | ✅ verificado | ⚙️ `photosPermission` vira `NSPhotoLibraryUsageDescription` | ⛔ sem gravação em disco |
| Relógio de horário (`TimePicker`) | ✅ Jetpack Compose | ⚙️ SwiftUI, irmão `.ios.tsx` | ✅ campo mascarado |
| Teclado / rolagem | ✅ | ⚙️ ramo `ios` em `use-keyboard-height` | ✅ |
| Notificações (C1) | ⛔ não iniciado | ⛔ não iniciado, **e com assimetria conhecida**: `DAILY`/`WEEKLY` são Android, `CALENDAR` é iOS-only (ver C1.2) | ⛔ fora de escopo |

Legenda: ✅ verificado em aparelho · ⚙️ escrito, nunca executado · ⛔ não se aplica ou não existe.

**Bloqueio prático do iOS**: o app nunca foi buildado para iPhone, e buildar exige Mac ou EAS com
**conta Apple Developer paga (US$ 99/ano)**. Enquanto isso não acontecer, toda linha ⚙️ da coluna
iOS é hipótese. Não prometer iOS na defesa; citar como trabalho futuro.

### 6.2 Fila de validação em aparelho

Tudo que já está escrito e nunca foi executado em device. **Marcar aqui ao testar** — é esta
lista que o "verificado em device" dos blocos consulta.

➡️ O passo a passo operacional está em
**[`ROTEIRO-DE-TESTE-EM-APARELHO.md`](./ROTEIRO-DE-TESTE-EM-APARELHO.md)**, reescrito em 25/08
para partir do zero, como usuário que nunca abriu o app: 22 blocos em 4 sessões. A tabela abaixo é
o placar; o roteiro é como se joga, e a coluna **Onde** aponta o bloco.

| # | O que validar | Onde | Origem |
|---|---|---|---|
| 1 | Onboarding sem conta, com volta entre as etapas | 2 | A2 |
| 2 | Onboarding com Google, incluindo login cancelado | 3 | A2 |
| 3 | Abrir o app sem conta e cair direto na Home | 4.9, 20.6 | A2, 25/08 |
| 4 | Ficha completa: contatos de emergência, edição, persistência | 4 | A2 |
| 5 | Termos: versão aceita igual à vigente, texto sem promessa de nuvem | 5 | LGPD |
| 6 | FAB nas três abas, com destino certo em cada uma | 6 | UI, 24/08 |
| 7 | Relógio nativo dentro do `Modal` — **o de maior risco** | 7.5 | B2, 24/08 |
| 8 | Horário duplicado barrado na digitação | 7.9 | B2 |
| 9 | Revelação do opcional e rodapé dizendo o que falta | 7.12, 7.13 | B2 |
| 10 | Antecedência de estoque maior que a duração dele | 7.16 | B2 |
| 11 | Unidade ambígua: pergunta antes da quantidade (líquido, injeção) | 8.2 | B2 |
| 12 | Fração aceita em ml e recusada em gota | 8.4, 9.3 | B2 |
| 13 | "Só quando precisar": sem horário, sem início, e "Sempre disponível" | 9.4, 9.5 | B2 |
| 14 | Estoque em unidade diferente da dose: pergunta em ml, e **sem previsão** | 9.6, 9.7, 18.4 | B4/B5, 25/08 |
| 15 | Dose que varia por horário, e a previsão somando as doses reais | 10.5 a 10.8, 18.5 | B2 |
| 16 | Dias da semana | 11 | B2 |
| 17 | Ciclo: cadastrar no meio da cartela, pausa e erro de dias seguidos | 12 | B2 |
| 18 | Preencher "de X em X horas" e o bloqueio de série que não cabe no dia | 13.3 a 13.8 | B2, 24/08 |
| 19 | Data de início futura, e data pela metade travando o salvar | 14 | B2, 24/08 |
| 20 | Anexos: foto, PDF, validade e aviso de renovação em cascata | 15.2 a 15.6 | B2 |
| 21 | Popup de lembrete abre, escolhe e fecha (seção congelada) | 15.7 a 15.9 | B2 |
| 22 | Listagem, busca sem acento, edição preenchida e exclusão lógica | 16 | B2, 23/08 |
| 23 | Botão físico de voltar fechando o formulário | 16.8 | A1 |
| 24 | Confirmar em lote, com os nomes listados no diálogo | 17.3 | B4, 24/08 |
| 25 | Baixa de estoque pela dose, e correção retroativa devolvendo | 17.5, 17.8 | B4, 22/08 |
| 26 | Tela de estoque: ordem por urgência e previsão correta | 18.1 a 18.5 | B5, 25/08 |
| 27 | Recontagem grava diferença, reposição soma | 18.6 a 18.12 | B5, 25/08 |
| 28 | Card de estoque baixo da Home leva pra tela nova | 18.15 | B5, 25/08 |
| 29 | Cadastro de compromisso: texto livre, data passada, cascata de avisos | 19.2 a 19.13 | C3, 24/08 |
| 30 | Calendário unificado: doses junto dos compromissos, projeção além de 30 dias | 19.15, 19.16 | C3, 24/08 |
| 31 | Ação de dose só em hoje e passados, e nunca na projetada | 19.17 a 19.19 | C3, 24/08 |
| 32 | Desfecho no mesmo dia do compromisso | 19.21 | C3, 25/08 |
| 33 | Desfecho: apagar resposta, e editar sem perder o registro | 19.25, 19.26 | C3, 24/08 |
| 34 | Vincular e desvincular conta sem perder dado | 20 | D3, 24/08 |
| 35 | Apagar dados de saúde mantendo ficha e consentimento | 21 | D3, 24/08 |
| 36 | Apagar tudo, voltar ao login e entrar com Google de novo | 22.1 a 22.7 | D3, 25/08 |
| 37 | Nada volta depois de fechar e reabrir, e as fotos sumiram junto | 22.8, 22.9 | D3, 24/08 |

### 6.3 Offline-first

**Nenhuma exceção até aqui.** Toda escrita clínica vai para o SQLite local e nada espera rede.

| Operação | Toca a rede? |
|---|---|
| Cadastro, edição e exclusão de medicamento | Não |
| Agenda do dia, confirmação/pulo/correção de dose | Não |
| Baixa, alerta, recontagem e reposição de estoque | Não |
| Ficha de saúde e consentimento | Não |
| Sessão na abertura do app | **Não** — `getCurrentUser()` usa `getSession()`, que lê do AsyncStorage ([supabase-auth-gateway.ts](../src/data/remote/supabase-auth-gateway.ts)). Sem isso, abrir o app sem sinal travaria a primeira execução |
| Login com Google | Sim — é a natureza do OAuth. **Opcional**: "continuar sem login" mantém o app inteiro utilizável |

⚠️ **O mérito é menor do que parece: não existe nuvem ainda.** O app é offline-*only*, não
offline-*first* posto à prova. A propriedade só será realmente testada no D1, quando houver o que
sincronizar — e é lá que o paradigma pode ser violado sem ninguém notar. Manter esta tabela viva
a partir do D1 é o que impede isso.

---

## 7. Log de progresso
| Data | Bloco | Status | Observação |
|---|---|---|---|
| 2026-08-19 | — | — | Plano criado a partir da auditoria do repositório |
| 2026-08-19 | A1 | Iniciado | Gate de primeira execução extraído para `use-first-run-gate` / `use-database-ready` (ainda não ligados ao `_layout.tsx`) |
| 2026-08-19 | A2 | Pendente | Teste do login com Google em aparelho físico (ver seção 5) |
| 2026-08-19 | A1 | Quase pronto | Hooks ligados ao `_layout.tsx`; tabs reais (`(tabs)/`) + stack modal `cadastro/` (`escolha`→`medicamento`→`scanner`/manual, `compromisso`) criadas; FAB da Home navega pra `cadastro/escolha`; template residual removido (`explore.tsx`, `app-tabs*.tsx`, `web-badge.tsx`, `themed-*.tsx`, `external-link.tsx`, `hint-row.tsx`, `ui/collapsible.tsx`, `use-theme`/`use-color-scheme`). `npx tsc --noEmit` limpo; `npx expo lint` limpo (0 erros — só 1 warning pré-existente em `inventory-repository.ts`, fora de escopo). ESLint não estava configurado no repo; `expo lint` configurou sozinho na primeira execução. Faltam só os 3 itens de "Pronto quando" que dependem de rodar em device/emulador de verdade (tabs navegando, FAB, botão de voltar nos modais) — retomar testando no dev build junto com a A2. |
| 2026-08-19 | A2 (bug fix) | Concluído | Corrigido `assertConfigured` em `supabase-auth-gateway.ts` (TS1225/TS18047 — assertion signature só vale sobre parâmetro, não sobre import de módulo); trocado por `ensureSupabaseConfigured()` que retorna o cliente não-nulo. |
| 2026-08-20 | Ambientes | Concluído | Preview web destravado e política de ambientes documentada (§5, §5.1–5.3). Dois bloqueadores reais corrigidos: (1) `expo-auth-session` estava no `package.json` mas ausente de `node_modules` — como `_layout.tsx` → `useFirstRunGate` → `SupabaseAuthGateway` importa esse módulo, o app quebrava no boot em **todas** as plataformas, não só no web (era a pendência nº1 do checklist de login); (2) `metro.config.js` desabilitava `unstable_enablePackageExports` como workaround do `react-native-svg`, e isso derrubava o bundle web na tela de tabs (`NativeTabs` web → `@radix-ui/react-tabs` → `@radix-ui/primitive/is-development`, subpath que só existe no mapa `exports`). Workaround do svg estava obsoleto desde a 15.15.4 (lib não declara mais `exports`). Verificado: `npx tsc --noEmit` limpo, `npx expo lint` 0 erros, bundle web 200 OK sem erro de resolução. |
| 2026-08-20 | A1 | Fechado no que cabe aqui | Restam só itens que exigem device (botão de voltar nos modais de cadastro, confirmação de estado das tabs). Próximo passo de código: **B2**, com a ressalva de persistência do §5.1. |
| 2026-08-20 | A2 | Parcial | **Retorno entre as etapas da primeira execução** implementado (`useFirstRunGate.goBack`/`canGoBack`): consentimento → login e ficha → consentimento, com botão na tela e botão físico do Android (`BackHandler`) fazendo a mesma coisa. Motivo: a escolha de entrada é arrependível — quem clicou em "continuar sem login" precisa poder voltar e entrar com Google. Nada é desfeito ao voltar; `acceptConsent` passou a não duplicar registro quando já existe consentimento válido da versão vigente. Heurística de Nielsen nº3 (controle e liberdade do usuário). |
| 2026-08-20 | Auditoria | — | **Persistência conferida estaticamente** (não dá pra executar sem device, §5.1): paridade de colunas OK em `consent_records` (6/6) e `patient_profiles` (as 14 colunas gravadas pelo `toRow` existem — base na 002 + `date_of_birth` 003 + `biological_sex` 004 + `emergency_contacts` 005; as 3 colunas soltas da 004 ficam NULL, como já documentado no repositório). `runMigrations` usa `PRAGMA user_version` e é idempotente. Nenhum erro de schema esperado no device. |
| 2026-08-20 | A2 | Pendência confirmada | **Foto de perfil não funciona** — o `Pressable` de "Adicionar foto" em `PatientProfileScreen.tsx` não tem `onPress` (é placeholder visual, com `TODO` no código). `expo-image-picker` não está instalado e não há permissão de galeria/câmera declarada no `app.json`. O campo `photo_uri` existe no schema e no domínio, mas nada escreve nele. Continua no escopo do bloco A2. |
| 2026-08-20 | UI | Concluído | **`Header` padrão do kit** com duas variantes: marca + atalho de conta (Home) e título centrado + voltar (resto). Os dois lados têm largura fixa mesmo vazios — é o que mantém o título opticamente centrado quando só um lado tem botão. Header nativo do Stack de cadastro desligado pra não duplicar. |
| 2026-08-20 | Ficha | Concluído | **Nome e sobrenome viraram um campo só** (migration 007, que remove as colunas antigas de verdade porque eram `NOT NULL` sem default). Só o nome bloqueia o "Salvar e continuar"; a data de nascimento virou opcional, mas ou está vazia ou completa e válida — meia digitada bloqueia, porque descartar dado clínico em silêncio é pior que exigir o campo. Saiu o "Preencher depois", que deixava entrar no app sem dado nenhum. |
| 2026-08-20 | A2 | Quase pronto | **Aba Ajustes entregue**: edição da ficha (rota `/ficha`, a mesma tela em modo edição), estado da conta (entrar depois sem perder dado local) e consulta dos termos com data/versão do aceite. Foto de perfil funcionando (só galeria; `cameraPermission: false` por minimização — o app ainda não tira foto). O arquivo escolhido é copiado pro diretório de documentos: a URI que o picker devolve é de cache e o sistema a limpa, o que faria a foto sumir sozinha depois. Falta só o `[PREENCHER]` do texto legal, que depende de dado do responsável. |
| 2026-08-20 | Preview web | Concluído | Barra de abas do navegador desenhada em JS em vez do tablist do Radix. A ramificação fica **dentro** do `_layout.tsx`: arquivo de rota vem do `require.context` do expo-router, que não resolve sufixo de plataforma (`getRoutes` não trata `.web`) — um `_layout.web.tsx` viraria uma rota chamada "_layout.web" e nunca substituiria a outra. |
| 2026-08-20 | B2 (parte 1) | Concluído | **Domínio da posologia.** `Prescription` só tinha `frequencyMinutes`, que expressa apenas "intervalo" — as outras três formas exigidas não cabiam num número. Virou a união discriminada `PosologySchedule` (`daily`/`interval`/`weekly`/`asNeeded`), migration 008 converte a coluna pra JSON e remove `frequency_minutes`. Novo use-case `generate-dose-schedules`, regra pura, verificado contra 8 casos rodando o arquivo compilado em Node: as 4 frequências, virada de dia (a cada 8h desde 22:00 → 06:00 do dia seguinte), recorte por `endDate`, `startDate` futuro, intervalo zero e horário inválido. É o primeiro pedaço do app que dá pra **provar sem aparelho**. |
| 2026-08-20 | B2 | Escopo ampliado | O cadastro passa a cobrir qualquer apresentação (injeção, pomada, gota, sublingual, adesivo, inalador, sachê), com a unidade de dose acompanhando a forma. **Local de guarda e anexo de receita saíram do C3 e entraram no B2** — o paciente já descreve o medicamento ali, e separar faria ele cadastrar duas vezes. Formulário organizado em 7 seções, com as opcionais recolhidas. Exige `Medication.form`/`photoUri`, `PosologyUnit` maior, anexo e notas em `Prescription`, e `storageLocation` em `InventoryItem`. |
| 2026-08-20 | B2 (parte 2) | Concluído | **Formulário de cadastro manual, em duas etapas.** Wizard puro foi descartado: abandonar no meio perderia tudo, e cadastrar remédio é tarefa feita apressado. O medicamento é gravado **ao avançar** pra etapa 2, então sair nos detalhes deixa um cadastro funcionando. A etapa 2 é toda condicional — tarja "isento" esconde receita, "se necessário" esconde lembrete (corrigindo um bug de lógica: perguntava como avisar de uma posologia que não agenda horário), "contínuo" esconde data de fim, "não controlo estoque" esconde quantidade e alerta. Novo campo de domínio `prescriptionRequirement` (migration 010), que virá da CMED no B1 e segue editável. Extraídos pra compartilhado: máscara de data (`shared/date-input`, com a regra de nascimento ficando na ficha porque início de tratamento pode ser futuro), `shared/time-input` e o seletor de foto (`usePhotoPicker(fileName)`). |
| 2026-08-20 | B2 | Pendências | Falta: anexo de receita em PDF (`expo-document-picker`), e listar/editar/excluir na aba Remédios — adiado a pedido, o foco foi o cadastro. |
| 2026-08-21 | B2 (parte 3) | Concluído | **Formulário reescrito: uma tela, dois estados.** As duas etapas de 20/08 caíram — etapa e acordeão obrigam a pessoa a operar a interface antes de responder o que veio responder. A tela mostra só o essencial e revela o resto de uma vez quando ele fica completo; botão de salvar virou rodapé fixo, cinza dizendo o que falta, aceso no instante da revelação. Três dependências novas sustentam a redução: (a) **a unidade é consequência da forma** — só líquido, injeção e "outra" têm ambiguidade real e mostram seletor, o resto vira selo; (b) **estoque conta na unidade da embalagem** (`stockUnitForMedicationForm`) porque gota se toma em gota mas se compra em ml, e é o ml impresso no frasco que faz a conta de "quantos dias ainda dá" fechar; (c) **a frequência gera os horários** (`suggest-dose-times`, tabela e não cálculo — 12h÷6 dá 10:24 e ninguém toma remédio às 10:24), extinguindo por construção o erro de salvar "3 vezes ao dia" com um horário só. Saíram do formulário: tarja, "precisa de receita?" (anexar já responde), princípio ativo (desceu pro complemento) e data de início (inútil em uso contínuo; gravada como hoje). "Até quando" virou "por quantos dias", que é como o médico fala. Novo `OptionGroup` no kit — escolha única com as opções à vista, pra quando comparar entre elas *é* a decisão. Lembrete saiu do corpo do formulário e virou popup próprio: é a única decisão do cadastro que depende de permissão do sistema. |
| 2026-08-21 | B2 (parte 4) | Concluído | **Ajustes de densidade no formulário.** O que é longo de preencher e curto de rever saiu do corpo da tela e virou popup: horários, estoque e lembrete. Na tela fica o resumo — fichinhas cinza com os horários, uma linha com quantidade e local do estoque. Além de encurtar a página, mata um efeito ruim relatado no teste: marcar o checkbox de estoque fazia nascer quatro campos e empurrava a tela debaixo do dedo de quem acabara de tocar nele. **A tabela de horários sugeridos foi removida** — campo pré-preenchido é o que quem está com pressa aceita sem ler, e aí o app lembra da dose na hora errada em silêncio; errar assim é pior que exigir a digitação. O botão "Mais" da quantidade de doses virou o próprio campo, no fim da fileira de opções (`OptionGroup.trailing`), economizando um toque e uma linha. Barra de completude removida. Anexos viraram seção única (caixa + receita). Dose passou a ser uma frase só — "QUANTOS COMPRIMIDOS DE CADA VEZ", já em 1 — em vez de um campo vazio ao lado de uma caixa "UNIDADE" pedindo o que a forma já respondeu. |
| 2026-08-21 | B2 (parte 5) | Concluído | **Conciliação prazo × estoque, e erro que não some.** Novo use-case `summarize-treatment`: o tratamento com prazo passou a ser dito em **doses**, não em dias de calendário, porque "por 2 dias" começando hoje termina amanhã e isso só faz sentido depois de ver que hoje conta — e conta parcialmente, já que as doses de hoje que passaram não entram. A tela mostra "da próxima dose de hoje até 22/08 — 3 doses", e avisa quando o prazo não alcança dose nenhuma (cadastrar "por 1 dia" às 23h), caso em que antes a linha simplesmente sumia e o silêncio lia como acerto. Verificado contra 8 cenários rodando o arquivo compilado em Node. Com isso, **estoque e prazo passam a conversar**: se o que a pessoa tem cobre menos doses do que o tratamento pede, o card de estoque avisa — em cor de atenção e não de erro, porque comprar no meio do tratamento é normal e o app não sabe o que já está a caminho. A comparação só acontece com unidades iguais; gota se toma em gota e se guarda em ml, e converter exigiria a concentração do frasco. **Máscara de horário passou a recusar o impossível na digitação** (`50:00` não entra mais), em vez de aceitar e reclamar no submit, quando a pessoa já saiu do campo. E o rodapé passou a dizer **o que** falta, por extenso — botão cinza sem explicação faz varrer a tela atrás do campo esquecido, e isso piora justamente porque a tela encolheu em resumos e popups. |
| 2026-08-21 | B2 (parte 6) | Concluído | **Lembrete ganhou "os dois" e explicação de permissão.** `ReminderMode` passou a aceitar `both` — os dois canais fazem coisas diferentes (o alarme interrompe na hora, a notificação **fica** na barra depois de dispensado) e quem precisava das duas estava tendo que escolher uma. Coluna é TEXT, então não houve migration. O popup passou a avisar, antes de salvar, que o aviso depende de permissão do sistema e que o app não tem como contornar a recusa — sem isso a pessoa culpa o Mapill por um lembrete que o Android bloqueou. Junto veio um `Accordion` "Como funcionam os lembretes" dentro do próprio popup (nada de modal aninhado), pronto pra receber prints depois. **Resumo do estoque virou bloco rotulado** (QUANTIDADE / LOCAL / AVISO): "50 comprimidos · em cima da geladeira" numa linha só obrigava a decifrar o que era o quê pelo conteúdo. Aviso de estoque insuficiente ganhou fundo de atenção, e a explicação do intervalo ganhou fundo azul claro. |
| 2026-08-21 | B2 (parte 7) | Concluído | **Duração em dias, semanas ou meses.** "Por 90 dias" não é como ninguém pensa um tratamento de três meses, e mês não tem tamanho fixo — converter pra dias na entrada erraria a conta. `lastDayOfTreatment` passou a receber a unidade e a somar meses de verdade, grudando no fim do mês quando o dia não existe (31/01 + 1 mês = 28/02). O inverso (`treatmentDuration`) reconhece a unidade ao reabrir um cadastro, preferindo dias abaixo de duas semanas pra quem escreveu "7 dias" não reencontrar "1 semana". Verificado contra 9 casos em Node, incluindo mês curto e virada de ano. O checkbox caseiro do estoque (quadrado que só pintava de azul) foi eliminado em favor do `Checkbox` do kit, que tem o "certinho" — agora existe um único checkbox no app. |
| 2026-08-21 | B2 (parte 8) | Concluído | **Nenhum campo vem escolhido de fábrica.** Mesma razão que tirou os horários sugeridos, levada até o fim: um seletor já marcado é indistinguível de uma resposta dada, e a pessoa passa por ele sem tocar — o cadastro sai com uma posologia que o app inventou. Passaram a começar vazios: forma farmacêutica, quantidade da dose, unidade (nas formas ambíguas), frequência, quantas vezes por dia, intervalo, duração e sua unidade, modo de lembrete e antecedência do alerta de estoque. A unidade derivada da forma continua sendo preenchida sozinha — isso não é chute, é consequência. Como efeito colateral bom, o essencial virou cascata: a dose só aparece depois da forma (sem ela o app não sabe se pergunta "quantos comprimidos" ou "quantos ml"), os horários só depois da quantidade de doses, o primeiro horário só depois do intervalo. Trocar de frequência zera o que era da anterior. Cuidado de borda: `every` de lista vazia é `true`, então "nenhum horário" passaria por "todos preenchidos" — daí o teste explícito de `timeInputs.length > 0`. E o alerta de estoque só é gravado ligado se a antecedência foi escolhida, senão ficaria "ativo" sem nunca disparar. |
| 2026-08-21 | B2 (parte 9) | Concluído | **Auditoria de cobertura, e os três buracos que ela achou.** Doze cadastros reais foram passados pelas regras do formulário; oito atravessavam inteiros e três falhavam **em silêncio**, que é o modo de falha que este bloco existe pra evitar. (a) **Dose diferente no mesmo tratamento** — insulina 10 UI de manhã e 8 à noite, varfarina por dia da semana, desmame de corticoide: `doseAmount` era um número por prescrição, então a saída era cadastrar o mesmo remédio duas vezes e quebrar o estoque. Os horários viraram `ScheduledDose { at, amount }`, com `amount: null` significando "o mesmo de sempre" — a dose uniforme continua morando num lugar só, e o número por horário só existe quando alguém o escreveu. `DoseSchedule` passou a gravar a dose já resolvida (migration 012), porque editar a posologia amanhã não pode reescrever o que estava agendado ontem. (b) **Cartela com pausa** — anticoncepcional 21/7 cadastrado como "todo dia" cobrava dose nos sete dias de pausa. Nova frequência `cyclic { daysOn, daysOff }`, ancorada no início do tratamento e não na janela de geração, senão o ciclo escorregaria a cada reabastecimento. Ela também é como "dias alternados" se expressa (1 e 1). (c) **A cada 48 horas** passou a ser oferecido — e só depois que o intervalo virou ancorado no início, pelo mesmo motivo. Efeito colateral: o aviso de estoque insuficiente passou a comparar **quantidade com quantidade** (`TreatmentSummary.totalAmount`) em vez de dividir estoque por dose, conta que deixou de existir quando a dose passou a variar. O JSON antigo (`times: string[]`) é convertido na leitura do repositório, e não numa migration: reescrever JSON dentro do SQLite não é verificável fora do aparelho, e a função é. 16 casos verificados rodando o domínio compilado em Node — cartela, pausa, regeração, dose por horário, herança da dose geral, 48h ancorado, virada de meia-noite, soma do tratamento e ciclo inválido. |
| 2026-08-21 | B2 (parte 9) | Cobertura conhecida | Ainda **não** cabe no cadastro: tratamento que começa em data futura (a data de início segue fixa em hoje, esperando a tela de tratamentos) e intervalo livre em horas — a lista oferece 4/6/8/12/24/48, e "de 3 em 3 horas" se resolve como 8 horários no dia. Caneta de insulina se conta em doses e não em ml, então o estoque dela fica aproximado. **Superado em 24/08** nos dois primeiros itens; o terceiro virou limitação assumida (ver 24/08). |
| 2026-08-21 | B2 (parte 10) | Concluído | **Frequência: cinco opções viraram quatro, e sumiu a que tinha dois caminhos.** "A cada X horas" saiu. Ela era a única opção que misturava os dois eixos da pergunta — *em quais dias* e *em que horários* —, e como todo intervalo oferecido dividia o dia por igual (4, 6, 8, 12, 24), produzia exatamente o mesmo agendamento que "todo dia" com os horários equivalentes: mesmo destino por duas estradas, o que é dúvida na hora de escolher e nada além disso. O que ela tinha de legítimo era o modelo mental de quem ouve "de 8 em 8 horas", e isso se resolve preenchendo os horários, não criando uma frequência. `cyclic` (dias tomando/dias de pausa) virou `cycle` (**a cada N dias, tomando nos M primeiros**), a pedido — a formulação genérica engole três coisas que as pessoas dizem de jeitos diferentes: cartela 28/21, dia sim dia não 2/1 e injeção "de 30 em 30 dias" 30/1. Com isso não é preciso uma frequência mensal separada; o preço, assumido, é que o ciclo escorrega no calendário (a cada 30 dias desde 25/01 cai em 24/02). A âncora deixou de ser um número ("que dia do ciclo é hoje") e virou **a data do primeiro dia do ciclo atual**, perguntada como "começa hoje" ou "já comecei antes" — pra injeção de 30 em 30, "que dia do ciclo é hoje" era pergunta que ninguém sabe responder. A tela confirma com **datas** e não com a regra: "a próxima é em 24/02", "você toma até 17/01 e recomeça em 25/01". E o "só quando precisar" trocou "uso contínuo" por **"sempre disponível"** — o Dorflex da mochila não é um tratamento contínuo, é um remédio sem agenda, e a palavra errada ali fazia a pergunta não encaixar em nada. As gravações antigas são convertidas na leitura do repositório: intervalo que divide o dia vira os horários equivalentes (conversão exata, não aproximação), 48h vira ciclo de dois dias, e o `cyclic` antigo vira `cycle` com a data reconstruída. 24 casos verificados em Node. |
| 2026-08-21 | B2 (parte 11) | Concluído | **Receita ganhou PDF e aviso de vencimento; "como tomar" ganhou saída de emergência.** As fichas de como tomar cobrem o comum, mas lista fechada sempre deixa alguém de fora — entrou um campo livre ao lado delas (`intake_note`, migration 013), separado da observação geral porque tem destino diferente: acompanha a **dose** na hora de tomar ("diluir em meio copo"), não o tratamento. O anexo de receita passou a aceitar **PDF** (`expo-document-picker` 57.0.1), com duas portas de entrada — galeria pra quem tem o papel na mão, arquivo pra quem recebeu a receita digital —, e os formatos aceitos escritos na tela em vez de descobertos no erro. `attachmentKind` deixou de ser gravado fixo como `image`. O **aviso de vencimento** entrou em cascata: anexo → validade → "me avisar antes de vencer" → 7, 15 ou 30 dias. A menor opção é uma semana porque antecedência que não dá tempo de conseguir consulta é só um susto; e a confirmação mostra a **data** em que o aviso chega, não a antecedência, que é o único jeito de conferir se dá tempo. Remover a receita leva junto validade e aviso — sozinhos eles não descrevem nada. A persistência do arquivo escolhido saiu de `usePhotoPicker` e virou `shared/persist-picked-file`, usada pelos dois seletores; o de documento guarda a extensão real, senão um PDF gravado como `.jpg` não abriria. |
| 2026-08-21 | B2 (parte 12) | Concluído | **Validação por tipo de campo, e a seção de alertas.** Número quebrado passava onde não existe: "1,5 gotas" era aceito e viraria estoque descontado com número impossível e um aviso que ninguém cumpre. `allowsFractionalDose` fixa isso na unidade e não no campo, porque é o mundo físico que decide: meio comprimido é rotina e o sulco está lá pra isso; cápsula não se parte sem derramar, gota, adesivo, sachê e jato não se dividem; ml, mg, g e UI são contínuos. A regra vale nos três lugares onde se digita quantidade (dose, dose por horário, estoque), e as máscaras de `shared/number-input` filtram na entrada, porque o teclado decimal do sistema é sugestão e não trava. Duração passou a aceitar só inteiro. **A dose por horário ficou visível**: a regra sempre foi override (horário preenchido manda, em branco herda), mas a tela não contava, e dois números apareciam se contradizendo. Agora, com a variação ligada, uma linha diz se o valor de cima ainda vale ou se todos os horários já têm o seu. O campo de orientação livre virou a ficha **"Outra orientação"** dentro de COMO TOMAR, que abre o campo — como campo fixo, ele parecia cobrar um texto de todo mundo. Na seção de alertas: os quatro modos viraram grade 2×2 com ícone (`OptionGroup` ganhou `icon` e `alto`), o aviso do aparelho virou **condição e não ressalva** ("com permissão, volume e o app fora da economia de bateria, os alertas chegam"), porque dizer "não garantimos" transfere a insegurança sem dar saída; o "como funcionam" ganhou fundo azul claro e passou a descrever o fluxo real: o que o alerta mostra, o que confirmar/adiar/ignorar faz com o status e com o estoque, a soneca de 5 minutos uma vez só, e três tópicos de o que o Mapill não faz. "Lembrete" virou **alerta** no texto de tela. Travessão removido de todo texto visível ao usuário. |
| 2026-08-21 | B2 (parte 13) | Concluído | **Antecedência do alerta de estoque deixou de ser número solto.** Cadastrar "me avise 30 dias antes" com dez comprimidos e duas doses por dia era aceito calado, e o aviso já nascia vencido: o estoque dura quatro dias. Novo use-case `estimate-stock-depletion`, que **percorre as doses de verdade** em vez de dividir quantidade por dose, porque a divisão erra nos dois casos que o app agora suporta: dose que varia por horário (10 UI de manhã e 8 à noite consomem 18 por dia) e ciclo com pausa (uma cartela não consome nada em sete dias de cada vinte e oito). O popup de estoque passou a mostrar a consequência sempre que dá para estimar ("o que você tem dura até 25/08, cerca de 4 dias") e a trocar para cor de atenção quando a antecedência escolhida é maior que isso. Não bloqueia: comprar mais é o que resolve, e o estoque de hoje não pode impedir alguém de configurar o alerta que quer daqui em diante. 9 casos verificados em Node, incluindo estoque menor que uma dose e estoque além do horizonte de busca. Também: a grade de duas colunas voltou a ter o mesmo respiro na horizontal e na vertical (as opções crescem juntas e um preenchedor invisível segura a última linha ímpar, em vez de `space-between`, que engordava só o vão do meio), e o `Accordion` deixou de ser branco sobre branco. |
| 2026-08-22 | Build | Desbloqueado | **Build em aparelho físico funcionando, via EAS.** O build local (`expo run:android`) não fecha nesta máquina: `ninja: manifest 'build.ninja' still dirty after 100 tries` no `react-native-reanimated`, que sobreviveu a limpar o cache do CMake, tirar o espaço do caminho do projeto, desligar o `--build-cache` do Gradle e excluir a pasta do Windows Defender. Antes disso, dois problemas reais foram corrigidos e valem pra qualquer máquina: `JAVA_HOME` apontava pro **JDK 25** do sistema (incompatível com o toolchain nativo — erro "restricted method in java.lang.System"), trocado pelo **JBR 21** do Android Studio; e faltava `ANDROID_HOME`/`android/local.properties`. O EAS Build também falhava, mas por outro motivo, este sim de código: `npm ci` abortava com EUSAGE reclamando de `@emnapi/core` e `@emnapi/runtime`. Causa: o npm rodando no Windows grava o lockfile **sem** as dependências transitivas dos pacotes opcionais que não se aplicam a Windows (aqui, `@unrs/resolver-binding-wasm32-wasi`, puxado por `eslint-config-expo` → `eslint-import-resolver-typescript` → `unrs-resolver`); no Linux do EAS o npm resolve versões diferentes das gravadas e o `npm ci` para. Regerar o lockfile e usar `overrides` não resolve — o buraco nasce na gravação, então todo lockfile gerado no Windows sai igual. Solução: `.easignore` exclui o `package-lock.json` do upload, e o EAS passa a rodar `npm install`, resolvendo no próprio Linux. |
| 2026-08-22 | A1 / A2 | **Fechados** | **Primeira leva de validação em aparelho físico.** Login com Google completa e volta pro app pelo scheme `mapillapp://` — era a pendência que segurava o A2 desde 21/08 e o motivo de o dev build ter virado obrigatório. Também verificados: consentimento aparecendo e persistindo (com reconsentimento ao subir a versão dos termos), ficha gravando no SQLite, as 4 abas navegando e o FAB abrindo o fluxo de cadastro até o fim, com o registro persistido. Restam do A1 apenas o botão físico de voltar nos modais. |
| 2026-08-22 | B2 (parte 14) | Concluído | **Listagem, edição e exclusão — o B2 fecha.** A aba Remédios deixou de ser placeholder: `useMedicationList` junta medicamento + tratamento vigente + estoque em três consultas e agrupa em memória (uma consulta por remédio faria a lista ficar mais lenta a cada cadastro), recarregando no foco da tela — é o que faz o recém-cadastrado já estar lá quando o fluxo de cadastro fecha. Tocar no card abre a edição, que é o **mesmo formulário**: `carregarMedicamento` é o inverso exato de `salvarMedicamento`, e por isso os dois moram no mesmo arquivo. Exclusão é lógica (`deletedAt`) em medicamento, prescrição e estoque, com duas razões que se somam: o registro de ingestão apontaria pra uma prescrição inexistente, e a sincronização (D1) precisa da linha marcada pra contar ao servidor que ela morreu — linha apagada some sem deixar recado e voltaria do servidor na sincronização seguinte. A exceção são os horários **futuros**, apagados de vez pelo mesmo motivo que já valia na edição: dose que nunca aconteceu não é histórico. O alerta de confirmação diz o que some e o que fica, porque é o medo de perder o histórico que trava a decisão. Rótulos de forma, unidade e posologia saíram da tela de cadastro pra `shared/rotulos-de-medicamento`: cadastro e listagem falam do mesmo remédio, e tabelas duplicadas divergiriam sem nada no código denunciar. |
| 2026-08-22 | B2 (bug) | Corrigido | **Foto de medicamento se sobrescrevendo entre cadastros.** Achado ao testar em aparelho: `persistPickedFile` gravava com **nome fixo** por tipo de dono (`medicamento-caixa.jpg`, `medicamento-receita.jpg`, `ficha-foto.jpg`), o que era intencional pra evitar arquivos órfãos — mas o dono real é cada medicamento, não o tipo. O segundo cadastro sobrescrevia a foto do primeiro, e o mesmo valia pro anexo de receita: um documento clínico substituindo outro em silêncio. Junto vinha o sintoma visível que levantou a suspeita: como a URI nunca mudava, o `expo-image` servia a imagem do cache e a foto recém-escolhida não aparecia. Agora o nome é único por escolha e o arquivo anterior é apagado explicitamente (`replacing`), inclusive ao remover a foto ou a receita na tela. |
| 2026-08-22 | B4 | Concluído | **Home ligada aos repositórios — os `MOCK_*` acabaram.** Duas consultas novas sustentam a tela: `findForDay`, que traz as doses do dia **com** o desfecho (o `findPendingForDay` que existia só devolve pendentes, e sem as resolvidas o progresso não tem denominador e a lista encolheria conforme a pessoa confirma), e `findDailyAdherence`, que agrega os sete dias numa consulta só em vez de sete. O status vem do último `IntakeLog` por `updated_at` — é o que faz uma correção retroativa mandar sem apagar nada. `deferred` foi separado dos demais por uma função de domínio (`resolvesDose`): ele deixa log mas **não** encerra a dose, e essa distinção é o que garante a decisão nº11.5 por construção — sem log resolutivo a dose vira `late`, um estado que pede resposta, e nunca "pulada" por decurso de prazo. Atrasadas ganharam bloco próprio no topo, em cor de erro: no meio da agenda elas passavam despercebidas justamente por ocuparem a posição de horário já vencido, no alto da lista. Confirmar e pular pedem confirmação explícita (gravar ingestão é registro clínico, e um toque acidental viraria dado errado no histórico); tocar numa dose já resolvida abre a troca de desfecho via `CorrectIntake`. Botões de ação só aparecem na próxima e nas atrasadas — oferecer "confirmar" numa dose das 22h às 8 da manhã convidaria a marcar o que ainda não aconteceu, e o app passaria a registrar intenção em vez de ingestão. O estado vazio distingue "nunca cadastrou nada" de "tem tratamento, sem dose hoje", que pedem ações diferentes. Na adesão semanal, dia sem dose agendada virou um traço e não uma barra zerada, e ficou fora da média: ausência de dado não é adesão zero, e contá-la como tal faria quem toma remédio só às segundas parecer péssimo aderente. |
| 2026-08-22 | B4 (bug) | Corrigido | **Estoque descontava uma unidade por dose, qualquer que fosse a dose.** `RegisterIntake` e `CorrectIntake` usavam `delta: -1` fixo, escrito quando a dose era um número por prescrição. Desde a migration 012 cada `DoseSchedule` grava a própria `amount`, então confirmar 10 UI de insulina baixava 1 do estoque, e 2 comprimidos baixavam 1 — o erro crescia a cada dose e só apareceria quando o estoque não fechasse com a caixa. Os dois use-cases passaram a receber a quantidade da dose, e o delta da correção é calculado sobre ela. Achado ao ligar a Home nos repositórios: o bug era invisível enquanto ninguém confirmava dose de verdade. |
| 2026-08-22 | B4 (bug) | Corrigido | **Toda dose a partir das 21:00 sumia da agenda do dia.** `generate-dose-schedules` grava `scheduledFor` com `toISOString()`, ou seja em **UTC**, enquanto a agenda pergunta por um dia do calendário **local**. As consultas comparavam os dois com `date(ds.scheduled_for) = date(?)`, então em Brasília (UTC−3) uma dose das 22:00 — gravada como `01:00Z do dia seguinte` — caía no dia errado: sumia de hoje e reaparecia amanhã, com o horário certo, o que é pior que sumir de vez porque parece coerente. A janela de erro é do tamanho do deslocamento do fuso, e cresce em quem está mais a oeste. Corrigido consultando por **faixa de instantes** (`localDayRangeUtc`) em vez de comparar datas: é exato em qualquer fuso, não depende de o SQLite conhecer o fuso do aparelho (`date(..., 'localtime')` dependeria) e ainda aproveita o índice de `scheduled_for`. O mesmo erro existia no `findPendingForDay`, que já estava no repositório e alimentaria a tela de dose do C2 — corrigido junto. `toLocalIsoDay` virou a única conversão instante→dia local do app, no lugar das quatro cópias que existiam. Verificado em Node com 8 horários (incluindo 00:00, 21:00, 23:59 e a virada de meia-noite): 3 falhavam com a regra antiga, 0 com a nova, e nenhuma dose vaza pro dia seguinte. |
| 2026-08-22 | Revisão | Concluído | **Três becos sem saída fechados na revisão do que foi feito hoje.** (a) Medicamento sem prescrição não podia ser excluído — o `return` antecipado deixava um item que a pessoa via e não conseguia remover; `excluirMedicamento` passou a aceitar `prescriptionId: null`. (b) O mesmo item abria a edição e recebia "Medicamento não encontrado", mensagem que descrevia a causa errada; agora o card fica inerte e o texto "Sem tratamento cadastrado" explica. (c) Com todas as doses do dia atrasadas, a Home renderizava o cabeçalho "Hoje" sem nada embaixo, que lê como lista quebrada. Também: o alerta de estoque passou a usar a prescrição mais recente do medicamento em vez da primeira encontrada, e `registrarDose` busca o log anterior por id em vez de varrer todos os do horário. |
| 2026-08-22 | UX | Concluído | **Confirmação de fim de cadastro, retorno em Ajustes e termos justificados.** Cadastro concluído passou a mostrar uma confirmação de tela cheia (`SuccessOverlay`) que some sozinha — não é `Alert` porque confirmar algo que deu certo não deveria exigir um toque de "OK", e não é toast porque o cadastro é o fim de um fluxo longo e merece a pausa que diz "acabou". Ajustes ganhou seta de voltar: é aba, mas também é destino do atalho de conta da Home, e quem chegou por lá esperava poder voltar (volta pelo histórico quando existe, senão vai pra Home). Texto do `LegalAccordion` (Termos e Consentimento) passou a ser justificado — só ali, que é o único texto corrido e denso o bastante pro alinhamento ajudar em vez de abrir rios de espaço. |
| 2026-08-23 | UX (bug) | Corrigido | **Campo ficava embaixo do teclado em qualquer popup.** Ao abrir o popup de horários e tocar num campo, o teclado subia por cima e a pessoa digitava sem ver o que escrevia. `KeyboardAvoidingView` — o padrão que o resto do app usa via `KeyboardAwareScrollView` — não resolve ali: o `Modal` abre em **outra janela** no Android, que não recebe o `adjustResize` da activity. O `BottomSheet` passou a medir a altura real do teclado (`useKeyboardHeight`) e se empurrar, com o conteúdo rolando dentro do que sobrou e altura máxima proporcional à tela. Vale pra todos os popups do app — horários, estoque, alertas e contatos de emergência. `keyboardShouldPersistTaps="handled"` deixa o primeiro toque num botão valer com o teclado aberto, em vez de só fechá-lo. |
| 2026-08-23 | Medicações | Concluído | **A listagem virou tela de verdade, a pedido do teste em aparelho.** Header próprio deu lugar ao `Header` do kit (o mesmo dos Termos). Entrou **busca por nome ou princípio ativo**, ignorando acento e maiúscula — quem procura um remédio digita apressado e no teclado do celular, onde o acento custa dois toques; o princípio ativo entra junto porque quem tem a caixa na mão às vezes lembra do "losartana" e não do nome comercial. A contagem vira "2 de 5" durante a busca, e o estado vazio separa "não achou com esse termo" de "não tem nada cadastrado", que pedem ações diferentes. O card inteiro clicável deu lugar a **dois botões explícitos** (lápis e lixeira): ao lado de uma ação destrutiva, "toca e abre alguma coisa" não diz o que vai acontecer. O card encolheu (foto de 56 pra 40px, espaços internos menores) e **perdeu o quadrado de iniciais** — sem foto não entra nada no lugar, porque ele ocupava o espaço de uma foto pra dizer o que o nome ao lado já diz. Novo `SearchField` no kit, em formato de pílula com lupa: separado do `TextField` porque buscar não é preencher (sem label, sem erro, nada é salvo), e já pensando na busca do dicionário CMED do B1. |
| 2026-08-23 | Abas | Concluído | **A barra de abas deixou de herdar cor do sistema.** A pílula da aba ativa vinha do Material You, que tira a cor do papel de parede do aparelho — no teste saiu verde. A cor da marca não pode depender de qual foto a pessoa colocou no celular, então `indicatorColor` e `rippleColor` passaram a ser fixados. Ícones e rótulos em cinza, azul só na aba ativa. A barra ficou **um tom acima do branco** (`surfaceContainerLow`) em vez de branca como o `Header`: a API da barra nativa não aceita borda — expõe cor de fundo, indicador e ripple, e `shadowColor` só no iOS —, então card ou botão branco encostando nela se fundiam num bloco só, e o degrau de cor faz a separação que a borda faria. Props conferidos na doc versionada do SDK 57 antes de escrever, já que `NativeTabs` ainda é API instável. |
| 2026-08-23 | Cadastro | Concluído | **Fim do cadastro leva à lista.** O `SuccessOverlay` passou de 1,8s pra 2,8s — tempo de ler a frase inteira sem pressa — e passou a levar pra lista de medicações em vez de voltar pra Home: a pessoa vê o que acabou de criar, em vez de voltar ao ponto de partida. Setas de voltar completadas em Medicações e Calendário; as telas empilhadas já tinham, faltavam as abas, que também são destino de atalho de outras telas. |
| 2026-08-24 | A1 | **Fechado** | **Segunda leva de validação em aparelho.** O botão físico de voltar se comporta corretamente nos modais de cadastro — era o único item que ainda segurava o A1, e ele fecha aqui. Também confirmados: a Home puxando dados reais dos repositórios (B4) e a correção do fuso na agenda, com as doses da noite aparecendo no dia certo. **Não** entrou no teste: listagem, busca, edição e exclusão na aba Remédios, que continua sendo a única pendência de validação em device. O checklist de login da §5.4 foi marcado por consequência — o login completa e a sessão persiste, o que só acontece com o Client Secret preenchido e o OAuth client do tipo `Web application`. |
| 2026-08-24 | B2 (parte 15) | Concluído | **Relógio nativo no lugar do campo mascarado.** Novo `TimePicker` no kit, sobre o `DateTimePicker` do `@expo/ui/jetpack-compose` — que já estava no `package.json` desde o primeiro commit, então o dev build de 22/08 o contém e nada precisa ser rebuildado. Digitar "08:00" num teclado numérico custa quatro toques, e um deles é o dois-pontos que a máscara insere sozinha e que a pessoa tenta digitar mesmo assim; a roda é o gesto que quem usa Android já conhece de despertador, e o próprio componente oferece o botão nativo de alternar pra digitação, então quem prefere teclado não perde nada. O relógio ocupa o **mesmo** popup, trocando o conteúdo, em vez de abrir outro por cima: modal dentro de modal empilha dois fundos escurecidos e tira do botão físico de voltar um destino óbvio. **"Confirmar" nasce desabilitado e só acende quando alguém gira** — a posição em que o relógio abre é ponto de partida, não resposta, e aceitá-la com um toque seria reintroduzir pela porta dos fundos o horário sugerido que a parte 8 removeu. O irmão `.web.tsx` mantém o campo mascarado no preview (§5.1: o que se perde no navegador é o gesto, não a informação). |
| 2026-08-24 | B2 (parte 15) | Concluído | **"De X em X horas" virou preenchimento, não frequência.** É assim que o médico fala, e o formulário só entende horários — traduzir "de 3 em 3 horas" em oito horários exigia uma conta de cabeça na frente da tela, e somar errado ali cai direto no lembrete. Dentro do popup, um botão pergunta o intervalo e o primeiro horário e preenche as linhas. **Não é sugestão**: os dois números são de quem preenche, e a lista aparece inteira antes de valer, o que deixa visível justamente a virada da madrugada (23:00 + 3h = 02:00) que a conta mental erra. Continua existindo **uma** frequência só — a parte 10 tirou "a cada X horas" por ser um segundo caminho pro mesmo agendamento, e um preenchedor não é um caminho, é uma calculadora. `serieCabeNoDia` barra o que daria a volta no relógio (4 doses de 8 em 8 horas fariam a quarta cair sobre a primeira), que é o mesmo conflito que o seletor já barra na escolha manual. 10 casos verificados em Node. Junto saíram duas menções órfãs à frequência removida, uma na mensagem de erro de "quantas vezes por dia" e outra no comentário de `MAX_DOSES_PER_DAY` — as duas mandavam a pessoa para uma opção que não existe mais. |
| 2026-08-24 | B2 (parte 15) | Concluído | **Tratamento pode começar em data futura.** A data de início era fixa em hoje e invisível, então quem cadastrava a cartela que começa domingo ou o antibiótico que vai comprar amanhã saía com a data errada sem nada denunciar: os horários nasciam a partir de hoje e o prazo terminava cedo demais. Virou a linha "QUANDO COMEÇA", que vale hoje e **diz isso na tela**, com atalho pra alterar. Aqui "hoje" pode vir preenchido sem ferir a regra da parte 8: ela existe pra impedir o app de inventar posologia, e o dia de hoje não é invenção, é o único fato que ele sabe — cobrar um toque de todo mundo por um caso raro seria pagar caro pela coerência. Data pela metade trava o botão em vez de virar "hoje" por omissão. O domínio já estava certo (`generateDoseSchedules` recorta a janela pelo `startDate`), então a mudança é toda de tela; o que mudou junto foi o que assumia "início = hoje": a mensagem do ciclo passou a falar em "início do tratamento" e a opção "Começa hoje" vira "Começa junto com o tratamento" quando ele começa adiante. 12 casos verificados em Node, incluindo cartela 28/21 ancorada no futuro e início no passado. |
| 2026-08-24 | D3 (parcial) / A2 | Concluído | **Gerenciamento de conta e de dados nos Ajustes, e três promessas de backup que eram falsas.** A regra combinada é "o dado sempre persiste no aparelho e **pode** ir pra nuvem se houver conta", mas a segunda metade não existe: o login autentica e nada sobe. A tela dizia o contrário em três lugares — "Habilita o backup dos seus dados" nos Ajustes, "Login habilita backup e sincronização entre dispositivos" no login, e o comentário do `handleSignIn`. Num app de medicação isso não é exagero de marketing: é o que faz alguém trocar de aparelho confiando e perder o histórico, e é a mesma falha de correspondência com o mundo real que o plano já proíbe no C1. Os textos passaram a descrever o que existe ("seus dados ficam neste aparelho", "a cópia na nuvem ainda não está disponível"). Entrou a seção **MEUS DADOS** com dois apagamentos de alcance diferente: o clínico (medicamentos, tratamentos, horários, histórico, estoque) preservando ficha e consentimento, e o total, que leva junto ficha, consentimento, fotos e receitas e devolve o app ao estado de recém-instalado. É **hard delete** e não `deleted_at` — a exclusão lógica existe pra que o histórico não fique órfão e pra que o D1 saiba contar ao servidor que a linha morreu; aqui a intenção é oposta, o dado sensível não pode continuar no aparelho, e manter a linha escondida seria o que a lei chama de tratamento. Numa transação só, porque apagar metade deixa estado que nenhuma tela sabe desenhar. Os arquivos são apagados **fora** da transação e por prefixo: o sistema de arquivos não participa dela, arquivo órfão é recuperável e banco meio apagado não, e apagar o diretório inteiro levaria junto o próprio banco do `expo-sqlite`. Novo `restartFirstRun()` no `use-first-run-gate` — um ouvinte só, porque o gate é único e dois discordando sobre a etapa atual seria pior que o problema —, já que seguir em uso sem consentimento registrado é o que a LGPD não admite. Desvincular ganhou confirmação e explicação de que nada é apagado; o apagamento total tem duas etapas, e a segunda repete o que some em vez de só perguntar "tem certeza?". |
| 2026-08-24 | C3 (parte 1) | Concluído | **Cadastro e agenda de compromissos.** Antecipado enquanto a validação em aparelho não voltava, e possível porque só o **disparo** do aviso depende do C1 — cadastrar, listar, editar e excluir não dependem de nada pendente. As duas telas eram placeholder `EmConstrucao`; o domínio já existia desde a migration 001. Migration 014 acrescenta local, profissional e antecedência do aviso, e **remove** os três campos de receita: o papel já mora no medicamento desde o B2, e uma segunda cópia aqui criaria duas verdades sobre o mesmo documento, livres para divergir. `retorno` entrou como tipo próprio e não como variação de consulta, porque no Brasil ele é outra coisa na prática — volta ao mesmo profissional dentro de um prazo, e perdê-lo custa a consulta inteira. `exame` não se subdivide por procedimento: o que muda entre sangue e imagem é o preparo, e isso mora na observação. O formulário é curto de propósito: compromisso é um ponto no tempo, não uma regra que se repete, então não há a revelação em dois estados que o B2 usa para conter um formulário que seria longo demais. Confirma com a **data por extenso e o dia da semana** antes de salvar, porque "dia 27" não denuncia nada e "sábado" denuncia na hora quem errou o número. Novo `TimeField` no kit para o caso de um horário só, separado do `SeletorDeHorarios` (que segue intocado, sob teste no roteiro de aparelho); as tabelas de mês e dia da semana saíram da Home para `shared/datas-por-extenso`, já que agora duas telas dizem a mesma data. |
| 2026-08-24 | C3 (parte 1) | Concluído | **Aviso de compromisso: notificação, nunca alarme.** Decisão do Gabriel em 24/08. Interromper como despertador se justifica na dose, que tem hora exata e consequência clínica imediata; para uma consulta na semana que vem seria só barulho. A antecedência é **em dias** (no dia, 1, 3 ou 7 antes) e não um horário, porque o que a pessoa precisa é de tempo para remarcar o trabalho ou arrumar carona. A escolha é gravada desde já, antes do mecanismo que a consome existir, para que quem cadastrar agora não tenha que voltar em cada compromisso depois — e a tela **diz** que os avisos ainda não chegam, em vez de deixar a promessa implícita. O seletor tem três estados e não dois: "não quero ser avisado" é resposta e precisa ficar marcada, senão quem toca em "Não" vê a opção voltar ao cinza de não respondida e não sabe se o toque valeu. |
| 2026-08-24 | C3 (parte 1) | Concluído | **Registro do que aconteceu, a pedido.** Compromisso passado pergunta "você foi?" e aceita compareceu / não compareceu, com anotação livre do que saiu dali. É registro de acompanhamento a longo prazo, não controle de presença: por isso a anotação de depois ("médico pediu hemograma") é campo separado da observação de preparo escrita antes ("jejum de 12h") — mesma razão que separa `intakeNote` de `notes` na prescrição. **Nunca vira "faltou" por decurso de prazo**: ausência de resposta não é desfecho, e registrar uma falta que ninguém confirmou sujaria justamente o histórico que o campo existe para manter confiável. É atualização do próprio registro, e não evento novo como o `IntakeLog` da dose — a ingestão exige auditoria porque dela sai a adesão que o TCC mede; do compromisso o que interessa é o estado final, e quem marca "faltei" por engano quer que fique corrigido, não que fique rastro de dois desfechos. "Fui"/"Não fui" gravam sem diálogo de confirmação, ao contrário da dose: aqui o toque não move estoque nem entra em cálculo nenhum, e é desfeito num toque na linha de baixo — cobrar confirmação por algo tão reversível faria a pessoa parar de responder. |
| 2026-08-24 | C3 (parte 2) | Concluído | **Revisão do formulário a pedido, e o calendário virou agenda de tudo.** Quatro mudanças. (a) Os **tipos fechados caíram**: a lista real não fecha — consulta, retorno, exame, coleta de sangue, terapia, fisioterapia — e cada opção que falta obriga a escolher a menos errada e explicar o resto na observação. Virou texto livre (`type` renomeado para `title` na migration 014, ainda não publicada). (b) **Rótulos mais formais**: "O QUE É?" virou "DESCRIÇÃO DO COMPROMISSO", "COM QUEM" virou "NOME DO PROFISSIONAL", "ONDE" virou "LOCAL DE ATENDIMENTO", "OBSERVAÇÃO" virou "ORIENTAÇÕES E PREPARO". (c) O **aviso virou cascata de dois canais independentes** — lembrar no dia e lembrar com antecedência são pedidos diferentes, e quem marca consulta costuma querer os dois; um campo só obrigava a escolher. A antecedência ganhou campo livre ao lado dos atalhos, no mesmo padrão do "quantas vezes por dia" do B2, porque 15 ou 30 dias são pedidos legítimos. Responder "não" para os dois é barrado: seria o mesmo que não querer aviso, e não descreve nada. (d) O **calendário passou a mostrar as doses junto dos compromissos**, agrupado por dia. |
| 2026-08-24 | C3 (parte 2) | Concluído | **Projeção de doses além do horizonte gravado.** O app grava horários para 30 dias (`SCHEDULE_HORIZON_DAYS`), então uma agenda que fosse até 90 apareceria vazia a partir do dia 31 — e vazio, ali, leria como "não tenho remédio em outubro", que é exatamente o modo de falha silenciosa que este projeto evita. Além do último horário gravado de cada prescrição, o calendário **calcula** as ocorrências na hora, com a mesma função pura já verificada que gera as reais, sem gravar nada. Projetada não se confirma: não há registro para apontar, e por construção ela nunca aparece com botão de ação. Confirmar e pular no calendário passam pelo **mesmo** `gravarDesfecho` da Home — registro clínico com duas implementações divergiria, e a auditoria do histórico é o que o TCC mede. Ação só em hoje e nos dias passados, mesma regra que já governa a Home. |
| 2026-08-24 | UI | Concluído | **FAB em toda aba que lista algo.** Estava só na Home, então quem estava na lista de remédios e queria cadastrar outro tinha que voltar — o lugar de criar é onde se está vendo o que já existe. Extraído para `ui/Fab` em vez de copiado em três telas. O destino muda por tela e por isso não mora no componente: Remédios vai direto para "escanear ou manual", porque estar ali já responde que o que vem é um remédio; Calendário e Home abrem a escolha completa, já que ali cabem os dois. |
| 2026-08-24 | Texto legal | Concluído | **A política de privacidade dizia que o login habilita backup em nuvem, e não habilita.** Era a terceira e última cópia da promessa falsa — as outras duas, nos Ajustes e no login, caíram antes. Aqui o peso é outro: é o documento que o titular aceita, e descrever um tratamento de dado sensível que não acontece corrói o valor do consentimento, que é justamente a base legal do app (art. 7º, I e art. 11, I). O texto passou a separar o que é de hoje do que é previsto: "nesta versão do app, seus dados de saúde não saem do aparelho, mesmo com a conta vinculada", e a cópia em nuvem descrita como futura, com nova consulta ao titular antes de qualquer envio começar. A seção de retenção foi reescrita pra descrever os dois apagamentos que agora existem de verdade, e para dizer que a conta do Google não é excluída, só desvinculada. `CURRENT_TERMS_VERSION` foi de `1.0.1` para `1.1.0` — mudou o que o titular consente, então o aceite antigo não pode valer, e a próxima abertura pede reconsentimento. |
| 2026-08-24 | Docs | Concluído | **§6.2, fila de validação em aparelho.** Dez itens escritos e nunca executados, cada um com o critério de "passou" ao lado. Existe porque a lista vinha sendo reconstruída de memória a cada retomada, e item que ninguém lembra de testar acaba entrando na defesa como se estivesse verificado. |
| 2026-08-24 | Docs | Concluído | **Nova §6, "Status de plataforma e de paradigma".** A pergunta "roda no iPhone?" e "isso continua offline-first?" estavam sendo respondidas por auditoria de código a cada vez. Agora são duas tabelas mantidas ao fim de cada bloco. A varredura achou um import que só funciona no Android (`@expo/ui/jetpack-compose` no `TimePicker`, criado horas antes) e confirmou que o offline-first está intacto — inclusive o ponto que mais poderia tê-lo violado, a sessão na abertura, que usa `getSession()` e lê do AsyncStorage sem rede. Registrado também que o mérito é menor do que parece: o app é offline-*only*, e o paradigma só será posto à prova no D1. |
| 2026-08-24 | iOS | Concluído | **`TimePicker.ios.tsx` com SwiftUI.** Android segue sendo a plataforma alvo, mas deixar um import que quebra em outra plataforma é dívida que não avisa — ela aparece no primeiro build de iOS, longe de quem a criou. As duas APIs não se parecem: o Android recebe `initialDate` em ISO, o iOS recebe `selection` como `Date` controlada e devolve por `onDateChange`. iOS continua **compilável, não verificado**: buildar exige Mac ou conta Apple Developer paga, e nada disso vira promessa até existir um build. |
| 2026-08-24 | B2 | Limitação assumida | **Estoque continua contado na unidade derivada da forma.** A ideia de contar por embalagem ("2 canetas de 300 UI") foi avaliada e descartada a pedido do Gabriel: ela conflita com a dose que varia por horário, que é justamente o que o mesmo medicamento faz quando se toma 10 UI de manhã e 8 à noite, e resolver os dois juntos criaria duas conversões se olhando. Fica registrado como limitação do TCC: caneta de insulina se compra em ml e se toma em UI, então o estoque dela é aproximado. |
| 2026-08-25 | B5 | Concluído | **Estoque ganhou tela — e com ela, superfície pro que já existia.** O bloco parecia grande e era pequeno: `estimateStockDepletion` (previsão percorrendo dose a dose, não divisão), `applyAdjustment` (evento + clamp em zero, em transação) e a baixa automática a cada dose confirmada estavam prontos desde o B2/B4 e não tinham onde aparecer. O número era produzido e descartado: só se via ele no card do remédio, e só se mexia nele reeditando o cadastro inteiro — que é errado, porque **repor não é reeditar um tratamento**. A tela nova (`/estoque`) mostra quanto resta, quando acaba e por que, ordenada pelo que acaba primeiro, e oferece as duas ações que são duas coisas diferentes no mundo: **recontar** (abri o armário e contei) e **repor** (voltei da farmácia). Um campo só, "corrigir", obrigaria a fazer a conta de cabeça em toda compra. |
| 2026-08-25 | B5 | Concluído | **A recontagem grava a diferença, nunca o número contado** (`domain/use-cases/adjust-stock.ts`). O estoque do Mapill é a soma dos seus eventos — é isso que faz a correção retroativa de uma dose compor com o resto em vez de brigar com ele. Gravar o valor absoluto quebraria a soma: uma dose confirmada entre a contagem e a confirmação seria sobrescrita em silêncio. Verificado em Node contra 12 casos, incluindo a cadeia dose → recontagem → reposição → correção retroativa, que fecha no mesmo saldo pelos dois caminhos. Contar o mesmo número que já estava lá não gera evento: recontar e confirmar o que já se sabia não é um acontecimento. O popup mostra a prévia do resultado antes de confirmar, porque a diferença gravada é justamente o que não se vê acontecer. |
| 2026-08-25 | UI | Concluído | **Slot de ação no `Header`, e o "Ignorar lembrete" que não ignorava nada.** O topo já tinha um espaço à direita ocupado só na Home (ícone de conta); virou `action`, e é por ele que Medicações chega ao estoque — sem gastar a quinta aba, que é o espaço mais caro do app, com algo que não se olha todo dia. No mesmo caminho caiu um botão falso: o card de estoque baixo da Home oferecia "Ignorar lembrete" sem nada que guardasse a dispensa, então o card voltava igual na abertura seguinte. Botão que não faz o que diz é pior que botão ausente. O primário virou "Abrir estoque" e leva pra tela nova, no lugar do cadastro do remédio. |
| 2026-08-25 | Auditoria | Concluído | **Repasse do roteiro de teste contra o código, passo a passo.** Motivo: o Gabriel abriu a build, viu o login com Google recusar com "não configurado neste dispositivo", e pediu a conferência de que cada passo do roteiro existe e é teoricamente funcional antes de continuar. Dos 106 passos, 4 apontavam para algo que o app não fazia como descrito — e cada um deles denunciou um defeito real, não um erro de redação. Registrados abaixo, um por linha. Também caiu um comentário obsoleto no `LoginScreen` que dizia que a autenticação era um stub: ela é real desde o A2, e comentário que descreve um passado do arquivo é pior que comentário nenhum. |
| 2026-08-25 | Build | Diagnóstico | **O login com Google não funciona em nenhuma build do EAS, e a causa não é o app.** O `.env` está no `.easignore` e o `eas.json` não declara variável nenhuma, então num build `preview`/`production` o bundle sai com `EXPO_PUBLIC_SUPABASE_URL` e `ANON_KEY` vazias e `isSupabaseConfigured` nasce `false`. Em `development` o JS vem do Metro local e o `.env` é lido, que é por que funcionava até agora. Não se resolve commitando as chaves — resolve-se com `eas env:create` por ambiente, e ficou escrito no roteiro. O que **era** defeito do app é ter escondido isso: o botão convidava, e só depois do toque um alerta explicava. Agora ele nasce apagado com o motivo escrito, no login e nos Ajustes. |
| 2026-08-25 | A2 | Corrigido | **A tela de login reaparecia em toda abertura para quem seguiu sem conta.** O gate da primeira execução só saía de `login` quando havia sessão do Supabase — então "continuar sem login", que é uma escolha que o app oferece de propósito, era esquecida no fechamento seguinte. Num build sem as credenciais o efeito nem rodava, e a tela voltava sempre, para todos, sem que houvesse botão que resolvesse. Agora quem decide pular é o **onboarding cumprido**: ficha preenchida mais consentimento na versão vigente. É prova melhor que a sessão, porque só existe se alguém passou por ali e respondeu — e a sessão pode nunca ter existido por decisão do paciente. O reconsentimento por bump continua passando na frente. |
| 2026-08-25 | C3 | Corrigido | **"Você foi?" só aparecia a partir do dia seguinte.** O card do calendário classificava o compromisso comparando o **dia** (`isoDay < hoje`), então a consulta das 8h de hoje seguia contando como futura até a virada da meia-noite — justamente na janela em que a pessoa sai do consultório e tem o que responder. Passou a comparar o instante. O agrupamento por dia continua sendo por dia, que é o que a lista precisa. |
| 2026-08-25 | Docs | Concluído | **Quatro passos do roteiro reescritos por estarem errados**, dois deles criados no dia anterior. `A.1` afirmava que o app abre pedindo os termos, quando abria pedindo login (e ganhou o `A.1b`, que fecha e reabre o app — o único jeito de flagrar o bug do gate). `I.3` mandava conferir `estoque ÷ 3` na Amoxicilina, ignorando que cada dose são 2 comprimidos: a conta certa é ÷ 6, e o número errado teria "passado" exatamente no caso que o passo existe pra pegar. `I.11` mandava conferir que comprimido recusa vírgula, e ele aceita de propósito desde o B2 — meio comprimido existe; quem recusa fração é gota, adesivo e sachê. `I.10` dependia de uma dose que o Roteiro F já tinha consumido. Somam-se as ressalvas de build em `A.4`, `G.9` e `G.10`. |
| 2026-08-25 | Build | Resolvido | **Credenciais do Supabase cadastradas no EAS**, nos três ambientes (`development`, `preview` e `production`), com `eas env:create`. É o lado que faltava do diagnóstico da manhã: o app já admitia a falta, mas quem tinha que deixar de faltar era o build. Ficam no servidor e não no repositório — a regra do projeto continua valendo, e a `anon key` do Supabase é pública por design, ela viaja dentro de qualquer app cliente. O roteiro deixou de ter ressalva de "login indisponível" em A.4, G.9 e G.10: agora os três cobram o login funcionando, e o G.9 virou o teste de que a conta volta depois do apagamento total, que é onde ela falhou. |
| 2026-08-25 | B4/B5 | Corrigido | **A previsão de esgotamento não checava se estoque e dose estavam na mesma unidade.** Gota se toma em gota e se compra em ml; insulina se toma em UI e vem num frasco de ml. Subtrair "3 gotas" de "20 ml" produz um número que parece previsão e não é nenhuma — e a Home mostrava esse número desde o B4, com o alerta de estoque baixo disparando em cima dele. A tela de estoque de ontem herdou o mesmo esquecimento. O formulário era o único lugar que checava, porque lá a regra foi escrita junto com o campo. A correção foi mover a checagem para dentro de `estimateStockDepletion`, que agora recebe a unidade do estoque e recusa a conta quando ela difere da dose: regra que dá para esquecer é regra que vai ser esquecida, e duas das três telas já tinham esquecido. `SchedulablePrescription` ganhou `doseUnit` por isso, e o compilador apontou os quatro pontos de chamada. Verificado em Node contra 7 casos, incluindo gota/ml e UI/ml. |
| 2026-08-25 | Docs | Concluído | **Roteiro de teste reescrito do zero, para quem nunca abriu o app.** O anterior partia do meio: assumia dados já cadastrados, um único caminho de login e uma única forma farmacêutica — comprimido, todo dia. Passava a impressão de cobertura sem ter. O novo tem **22 blocos em 4 sessões**, começa apagando tudo para chegar ao estado de instalação nova, e termina apagando de novo, agora como teste do direito de exclusão. Cobre **os dois caminhos de entrada** (sem conta e com Google, incluindo o login cancelado no meio do OAuth, que nunca tinha sido exercitado), **todas as frequências** (todo dia, dias da semana, ciclo com pausa, só quando precisar) e **as formas que mudam o formulário**: líquido e injeção, onde a unidade é pergunta e não consequência; gotas, onde estoque e dose são contados em unidades diferentes; dose que varia de um horário para o outro. Também os anexos em cascata (foto, PDF, validade, aviso de renovação), o popup de lembrete e as anotações. A §6.2 virou placar de 37 linhas apontando o bloco de cada uma. |
