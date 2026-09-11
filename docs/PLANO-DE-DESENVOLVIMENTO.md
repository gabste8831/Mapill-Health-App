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

## 0.0 RETOMADA — onde parei (11/09)

> **Leia esta seção primeiro se estiver voltando ao projeto, ou abrindo em outra máquina.** Ela diz
> o que está em andamento agora. O índice de 02/09 logo abaixo ficou como registro histórico —
> a seção "0.0" é sempre a que manda.

### Onde o projeto está

**A revisão de frontend e o passe visual terminaram** (o que era `AJUSTES-POR-TELA.md`, removido em
11/09 por estar 100% concluído — só sobrava um item de exemplo do template). Os quatro temas foram
revisados em aparelho e aprovados; a miniatura que não aparecia na hora foi corrigida e confirmada.

**A validação em aparelho está em andamento, guiada pelo [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md)
— esse é o documento de trabalho agora, não este.** Estado na rodada de 11/09:

- A maior parte do roteiro (blocos 10, 12, 13.2–13.5, 15, 16, 21, 22, 23) **passou** e já saiu do
  roteiro.
- **Achado novo e não resolvido:** com o app fora dos recentes (removido da lista, não só
  minimizado), nem o alarme nem a notificação disparam — trava os blocos de reboot/bateria, casos de
  borda e avisos de estoque/receita até ser investigado (checar se é efeito do dev client ou defeito
  real numa build preview/produção).
- **Bug confirmado, a corrigir:** um alarme adiado continuou tocando mesmo depois de apagar todos os
  dados de saúde — o adiamento é agendado direto no sistema (Notifee), fora da grade normal, e o
  apagamento de dados não está cancelando os adiamentos pendentes.
- **Bloco 17** (vários remédios no mesmo horário, resposta em lote) ficou parado por decisão do
  Gabriel: precisa ser desenvolvido de novo antes de voltar a ser testado.

### O que saiu nesta rodada (05/09)

Nove commits. Nada disso exigiu build nova exceto onde marcado — é tudo JavaScript, e rodou pelo
Metro durante a revisão.

| Frente | O que mudou |
|---|---|
| **Cores de estado** | Verde e vermelho ganharam tom de semáforo, separados por papel: `errorVivo` (#FF0000) em forma, `errorPreenchido` (#9E0008) em área, `error` (#C90000) em texto. O amarelo saiu do âmbar-terroso, e o texto do aviso virou cinza-quente |
| **Adesão** | Faixa "Seus últimos sete dias", com a mesma barra do gráfico da Home. Regra pura em `adesao-por-dia.ts`, 7 verificações |
| **Compromissos** | A antecedência do lembrete passou a governar quando o card aparece na Home. Regra em `compromissos-a-mostrar-na-home.ts`, 13 verificações. Busca e histórico dobrado na listagem |
| **Home** | Doses registradas em lista compacta, seções com rótulo, marca-d'água nos cards cheios, pílula da aba removida |
| **Listas** | Seletor de ordem sem rolagem, contagem junto da lista, card de estoque enxugado, ordem "menos na caixa" removida |
| **Conta** | A exportação virou `.zip` com uma planilha CSV por tabela — o JSON cumpria a LGPD mas não servia a quem quer abrir e olhar |
| **Alarme** | Mostra onde a caixa está guardada — é a única hora em que essa informação vale |

**Duas regras de domínio novas**, ambas com verificação em Node:
`src/domain/use-cases/adesao-por-dia.ts` e `compromissos-a-mostrar-na-home.ts`.

**Uma dependência nova**: `fflate`, para compactar o export. JS puro, sem módulo nativo — não exige
build. *(A regra que ficou do incidente do `expo-intent-launcher`: dependência nativa não entra no
caminho de execução antes da build que a contém.)*

### Pendência anotada para o refinamento

**Os quatro temas.** ✅ **Resolvido em 11/09** — os quatro temas (padrão, escuro, alto contraste e
daltonismo) foram revisados em aparelho e aprovados.

⚠️ **Desinstale a versão anterior antes de instalar a nova.** Canal do Android congela na criação, e
o canal de lembrete mudou (era criado **mudo** por um engano de leitura da documentação). Instalar
por cima manteria o defeito, e a sessão seria gasta diagnosticando algo já corrigido.

### O passe de design — **14 de 14 frentes entregues** ✅

Todas commitadas e no GitHub. O plano completo, com o raciocínio de cada uma, está em
`~/.claude/plans/tender-plotting-river.md` (arquivo local, não versionado — o resumo abaixo basta
para continuar).

| # | O que | Estado |
|---|---|---|
| 7 | Relógio nativo (mostrador redondo atrás do ícone) | ✅ |
| 0 | Três cores divergentes (splash, sombra do FAB, rgba manuais) | ✅ |
| 10 | A foto que ficava branca | ✅ código — **só o aparelho confirma** |
| 8 | Teclado: o gesto de tocar em área vazia | ✅ |
| 9 | Rodapé que saía colado no teclado | ✅ |
| 1 | Feedback de toque + busca viva + ícones de Remédios | ✅ |
| 2 | Escala tipográfica (`bodySm`, `caption`) | ✅ |
| 12 | Sugestões da CMED capitalizadas e enxutas | ✅ |
| 13 | Foto do medicamento na tela de alarme | ✅ |
| 4 | Azul nas telas brancas + respiro da Home | ✅ |

### As 4 últimas — entregues em 02/09 (tarde)

**Nenhuma exigiu build nova** — são JavaScript puro e rodam pelo Metro (`npx expo start --dev-client`)
sobre a build acima. `tsc` e `expo lint` limpos.

| # | O que | Como ficou |
|---|---|---|
| **5** | Movimento | `BarraDeProgresso` no kit (`withTiming`); a linha da dose se acomoda em 260 ms; entrada escalonada nas duas listas com teto de 6; `SuccessOverlay` **só quando o dia fecha em 100%**, disparado pela transição e não pelo estado. Tudo com `useReducedMotion` |
| **3** | Unificar os botões desenhados à mão | 23 alvos em 10 telas (a estimativa era ~8) + `PainelDePermissoes`. Inclui "Confirmar"/"Pular" do `ItemDeDose`, os mais tocados do app |
| **6** | Desafogar `ConfiguracaoDeLembrete` | A folha ficou com a decisão + painel + "Pronto". A ajuda virou `cadastro/ajuda-de-alertas` (rota **dentro** do stack do cadastro, não modal sobre modal). O aviso "Depende do seu aparelho" saiu e virou seção na tela nova |
| **11** | Visualizador de mídia | `VisualizadorDeMidia` no kit, em 4 pontos: ficha, caixa, receita e miniatura de Remédios. PDF vai ao leitor do sistema via `expo-sharing` (`shared/abrir-anexo.ts`) — renderizar PDF exigiria dependência nativa |

**Decisões que fugiram da letra do plano, e por quê:**

- **O `SuccessOverlay` não entrou em cada confirmação de dose.** Ele é de tela cheia e dura ~3 s;
  emendá-lo no gesto mais repetido do app o tornaria o mais demorado, e no lote de atrasadas
  dispararia várias vezes seguidas. A linha que se acomoda dá a confirmação do gesto; o overlay
  ficou para o marco real — a última dose do dia.
- **PDF não abre dentro do app.** `expo-image` não o renderiza, e um leitor exigiria build nativa.
  O leitor do aparelho ainda entrega mais: zoom, páginas, imprimir e encaminhar ao médico.

**Achados de borda corrigidos no caminho:**

- Links de foto ("Trocar foto", "Remover", "Alterar anexo") tinham a **altura da letra** (~20 pt) como
  alvo de toque. Agora têm 44 pt, com fundo ao pressionar.
- O quadrado da receita **abria o seletor de arquivo mesmo com anexo** — não havia como ver o que
  estava anexado sem substituí-lo.
- `Linha` está **duplicado** entre `AjustesScreen` e `ContaScreen` (componente idêntico, mesmos
  comentários). Corrigido nos dois; **não** extraído para o kit — fica como dívida anotada.

### Decisões deste passe que valem lembrar

- **O azul entra por tela, não por template.** Cheguei a extrair um `HeroDeTela` genérico e ele foi
  descartado: o que agradou no Ajustes foi a *presença* da cor, não o formato. Repetir a faixa em
  todas deixaria as telas iguais entre si.
- **Login, EscolhaDeCadastro e as telas de cadastro não se mexem** — decisão do Gabriel, ficaram bons.
- **O dia selecionado do calendário continua círculo.**
- **O plugin `expo-notifications` fica no `app.json`** mesmo sem nenhuma linha importar a biblioteca:
  ele é de *build* e gera o ícone de notificação e o som do alarme, os dois consumidos pelo Notifee
  pelo nome.

### Verificação antes de qualquer commit

```
npx tsc --noEmit && npx expo lint
node scripts/conferir-relatorio.mjs               # 28
node scripts/conferir-ids-de-aviso.mjs            # 14
node scripts/conferir-rotulos-cmed.mjs            # 12
node scripts/conferir-edicao-em-cadeia.mjs        # 11
node scripts/conferir-reagendamento.mjs           #  7
node scripts/conferir-adesao-por-dia.mjs          #  7
node scripts/conferir-compromissos-na-home.mjs    # 13
node scripts/conferir-schemas.mjs                 # 0 tabelas com problema
```

Os que dependem de `.ts` do domínio precisam de `node --experimental-strip-types`. Todos rodam em
Node puro porque as regras são funções sem React nem SQLite — é o que permite testá-las sem
aparelho.

---

## 0.1 O QUE FALTA — quadro único (atualizado em 2026-09-02)

> ### 🔄 Revisão de escopo — 02/09
>
> Três itens foram reexaminados. **Dois entraram, um ficou fora** — e o motivo de cada um está
> registrado ao lado do motivo antigo, porque o que mudou foi o raciocínio, não só a conclusão:
>
> | O que | Situação | Por quê |
> |---|---|---|
> | **Alarme nível A** | ✅ **Entregue** | O descarte no spike confundiu limite da **biblioteca** com limite da **plataforma**. Validado em aparelho em 01/09 — ver [C1.9](#c1-notificações-e-alarmes-de-dose--maior-risco-técnico-do-projeto) |
> | **Resumo em PDF** | ✅ **Entra** como [D4](#d4-relatório-em-pdf--o-resumo-que-sai-do-celular) | O argumento de 30/08 ("a tela serve em print") subestimava o buraco: o JSON cumpre a lei e é **ilegível para um médico**. Os dois não competem — um é a saída para máquina, o outro para humano |
> | **Anexos no Storage (E9)** | ❌ **Fica fora** | ⚠️ **Não por dificuldade técnica** — é um upload, e a infra já existe. Fica fora porque o ganho é **invisível na defesa**, porque o RLS de Storage é superfície nova que erra em silêncio sobre o dado mais sensível do app, e porque "anexos não sobem" é um argumento de minimização **melhor** que o que o substituiria. Detalhe em [E9](#e9-anexos-no-armazenamento-em-nuvem--fora-de-escopo-confirmado-em-0209) |
>
> O **checklist formal de acessibilidade** continua por último — mas por **sequência**, não por
> corte: vem depois do passe de front tela a tela, porque medir contraste de tela que ainda vai
> mudar é medir duas vezes.

### Estado do alarme (o que mudou)

✅ **O alarme funciona.** Validado em aparelho em **01/09**: tela cheia por cima do bloqueio, som em
loop, app fechado. O risco número um do projeto deixou de existir.

O que sobra do C1 é o **bloco 11 do roteiro** — os casos de borda do C1.8. A pergunta mudou de
*"funciona?"* para *"falha bem?"*, e é ela que fecha o bloco formalmente.

---

## 0.1.1 O que falta — índice (02/09)

> **Esta seção é o índice do que sobrou.** O resto do documento explica *por quê*; aqui está *o
> quê*. Cada linha aponta o bloco onde está detalhada.
>
> Prazo declarado: defesa dentro de um mês.

### ✅ Código: nada obrigatório em aberto

**Todos os blocos do roadmap estão escritos**, incluindo os dois reabertos em 02/09: o alarme em
tela cheia ([C1.9](#c1-notificações-e-alarmes-de-dose--maior-risco-técnico-do-projeto), validado em
aparelho em 01/09) e o [relatório em PDF](#d4-relatório-em-pdf--o-resumo-que-sai-do-celular).

Sobram **duas exclusões deliberadas**, ambas com motivo registrado — e nenhuma delas é dificuldade
técnica:

| O que | Bloco | Por que fica de fora |
|---|---|---|
| **Anexos no Storage** | [E9](#e9-anexos-no-armazenamento-em-nuvem--fora-de-escopo-confirmado-em-0209) | **Confirmado fora em 02/09, com motivo novo.** Não é dificuldade técnica: o ganho é invisível na defesa, o RLS de Storage é superfície nova que erra em silêncio sobre a receita médica, e "anexos não sobem" é minimização demonstrada por ausência — argumento mais forte que o que o substituiria. O texto 1.2.0 já declara isso ao titular. |
| **Passe de front + acessibilidade** | [E1](#e1-estados-vazios-offline-erro-e-acessibilidade) | Não é corte, é **sequência**: é o último item do projeto. A varredura por leitura de código (31/08) já mediu contraste e corrigiu alturas e alvos de toque; o que falta é o passe tela a tela e, depois dele, o TalkBack. Medir contraste de tela que ainda vai mudar é medir duas vezes. |

> ⚠️ **"Escrito" não é "validado".** Treze blocos foram implementados entre 29/08 e 02/09 e a maior
> parte **nunca rodou em aparelho**. O risco do projeto deixou de ser falta de código: é a validação
> concentrada em poucas sessões.

### 📱 Validação em aparelho — o risco número um

✅ **O alarme já foi validado em 01/09** (tela cheia sobre o bloqueio, som em loop, app fechado). O
que resta são os modos de **falhar**, o que nunca rodou, e o que só o tempo responde.

Ordem sugerida da próxima rodada — o bloco 11 fica por último porque mexe no relógio e reinstala o
app, e depois dele o estado do aparelho não serve para os outros:

| # | O que | Por que importa |
|---|---|---|
| **3** | Alarme órfão | Ficou mais arriscado: agora são **dois agendadores** (Notifee e `expo-notifications`), e cada um só enxerga a própria lista |
| **5** | Sincronização (D1) | Nunca rodou |
| **12** | Relatório em PDF (D4) | Nunca rodou. O passo 12.3 confere que o número do papel bate com o da tela |
| **7** | Sobrevivência 🔬 | Reboot e economia de bateria do fabricante — as duas perguntas do spike que só o tempo responde |
| **11** | Casos de borda do C1.8 | Fecha o C1 formalmente. Prova que o alarme não **mente** quando as condições não são normais |
| **Parte 2** | Passada geral | Antes da defesa, com o app fechado, do zero |

### 📄 Entrega acadêmica — o que sobra além do aparelho

| O que | Situação |
|---|---|
| **Capítulo 4** — argumento → decisão de código | Base em [`docs/tcc/`](./tcc/) — `EMBASAMENTO-TECNICO.md`, `INVENTARIO-FUNCIONAL.md` e `ROTEIRO-SECAO-DESENVOLVIMENTO.md` (esta última é a estrutura proposta para o texto, não texto pronto). O antigo `GUIA-DO-TCC.md` foi removido em 11/09 por estar superado por esses três. |
| Prints do caminho crítico | A capturar na sessão de validação, seguindo a Parte 2 do [`ROTEIRO-DE-TESTE.md`](./ROTEIRO-DE-TESTE.md) |
| Limitações e trabalhos futuros | Ver `docs/tcc/EMBASAMENTO-TECNICO.md` |
| Acessibilidade (E1) | O que foi medido entra no artigo; o passe de front e o TalkBack ficam para o fim |

### ❌ Fora de escopo, com motivo registrado

- **iOS** — exige conta Apple Developer paga. Citar como trabalho futuro, nunca prometer na defesa.
- **Botão `+` no centro da barra** — `NativeTabs` não aceita item central, e trocar por barra
  própria devolveria o risco do Material You resolvido em 23/08.
- **Sininho de notificações pendentes** — melhoria, não defeito.
- **Grade de calendário mensal** — já entregue no E1, apesar de estar escrita como fora de escopo
  no C3.

---

## 1.0 A pilha, em uma tabela

> Para citar no artigo sem precisar abrir o `package.json`. Versões conferidas em **05/09/2026**.

| Camada | O que | Versão | Por quê |
|---|---|---|---|
| **Runtime** | React Native | 0.86.2 | Nova arquitetura (TurboModules) ativa |
| | Expo SDK | 57 | Managed workflow com *continuous native generation* — a pasta `android/` é gerada, nunca editada à mão |
| | TypeScript | 6.0.3, `strict` | O domínio é verificável em Node por ser só função pura |
| | React Compiler | ativo | Memoização automática; é ele que recusa `setState` dentro de efeito que só deriva props |
| **Navegação** | expo-router | typed routes | Rotas por arquivo, com tipos gerados |
| **Persistência local** | expo-sqlite | 57.0.1 | 16 migrations, 13 repositórios, `PRAGMA user_version` idempotente |
| **Nuvem** | Supabase (PostgreSQL) | SDK 2.112.2 | RLS `user_id = auth.uid()` nas nove tabelas sincronizáveis |
| | Supabase Auth | Google OAuth | Sessão persistida; o app funciona inteiro sem ela |
| **Avisos** | react-native-notify-kit | 10.7.0 | Fork mantido do Notifee, que foi **arquivado em 07/04/2026**. API idêntica; corrige o boot receiver que o original deixou `exported="false"` |
| **Compressão** | fflate | 0.8.3 | JS puro (sem módulo nativo) — é o que permite o `.zip` do export sem exigir build nova |
| **Câmera** | expo-camera | — | Leitura de EAN-13 da caixa |
| **Documentos** | expo-print, expo-sharing | — | PDF gerado offline e entregue pela folha do sistema |
| **Catálogo** | CMED / Anvisa | 6.992 linhas | Embarcado como JSON de 782 KB (contra 12 MB do xlsx) |
| **Distribuição** | EAS Build | perfis `development`, `preview`, `production` | 30 builds/mês no plano gratuito |

**Regras de arquitetura que a pilha serve** (§2.6):

- O domínio (`src/domain/`) **não importa nada** de React, Expo ou SQLite. É o que permite verificar
  as regras com `node --experimental-strip-types`, sem aparelho — hoje são **92 verificações** em
  sete arquivos de conferência, mais o de schema.
- Toda dependência externa entra por **porta** (`src/domain/ports/`): `NotificationGateway`,
  `MedicationCatalog`, `AuthGateway`. Trocar o Notifee pelo fork mexeu em cinco arquivos de
  implementação e em nenhum use-case.
- Persistência é **offline-first**: o app funciona inteiro sem rede, e a sincronização é backup e
  troca entre aparelhos, nunca caminho crítico.

---

## 1. Estado atual (atualizado em 2026-09-05)

### Já pronto

| Área | Situação |
|---|---|
| Domínio | Entidades (`medication`, `prescription`, `dose-schedule`, `intake-log`, `inventory-item`, `appointment`, `patient-profile`, `consent`, `auth-user`) + ports fechados |
| Use-cases | `register-intake`, `correct-intake`, `generate-dose-schedules`, `summarize-treatment`, `estimate-stock-depletion`, `adjust-stock`, `doses-de-hoje-ja-passadas`, `dose-faltante-do-prazo`, `snooze-dose-alarm` (este último órfão, fundação do C1) |
| SQLite | `database.ts` + migrations 001→014 + 10 repositórios |
| Design system | `src/ui/` — Button, Card, TextField, SelectField, DateField, DatePicker, TimeField, TimePicker, Checkbox, Chip, ToggleChips, OptionGroup, SeletorDeOrdem, IconButton, Fab, BottomSheet, Header, Dica, FotoLocal, GradeDeMes, EscolhaDeOrigemDaFoto, SearchField, Accordion, LegalAccordion, SplashOverlay, SuccessOverlay, CenteredLoader, KeyboardAwareScrollView + `shared/theme` com paleta M3 real |
| Login | Tela + Google via Supabase Auth, sessão persistida, "continuar sem login" lembrado entre aberturas. Build sem credenciais **diz isso na tela**, em vez de recusar depois do toque |
| Onboarding LGPD | `ConsentimentoScreen` + `consent_records` versionado; bump força reconsentimento. Vincular conta **reapresenta os termos e registra novo aceite** com a data |
| Ficha de saúde | Nome obrigatório, demais opcionais, foto (câmera **ou** galeria), data com calendário, contatos de emergência em lista. Serve à primeira execução e à edição |
| Ajustes | Ficha + uma linha para **Conta e dados** |
| Conta e dados (`/conta`) | Vincular/desvincular Google, consulta dos termos com data e versão do aceite, e **MEUS DADOS**: apagar o clínico ou apagar tudo (apagamento físico, duas etapas, volta à primeira execução) |
| Home | Agenda do dia, progresso, confirmação/pulo com correção retroativa, adesão semanal, alerta de estoque e card de acesso ao estoque — tudo vindo dos repositórios, sem mock |
| Navegação | Abas reais (Home/Calendário/Remédios/Ajustes); grupo `cadastro` como stack modal; rotas `/ficha`, `/termos`, `/estoque`, `/conta`; `_layout.tsx` sem lógica de estado |
| Cadastro de medicamento | Todas as formas farmacêuticas, todas as frequências (todo dia, dias da semana, ciclo com pausa, só quando precisar), dose variável por horário, preenchimento "de X em X horas", data de início editável, anexos (foto e PDF) com validade e aviso de renovação, estoque e informações adicionais. Avisa quais horários de hoje já passaram e **pergunta se foram tomados** |
| Compromissos | Descrição em texto livre, local, profissional, orientações e cascata de lembretes. Aceita data no passado com aviso, para registro retroativo |
| Calendário | **Grade mensal** com pontinhos por tipo, filtros (tudo / compromissos / remédios), lista do dia selecionado, doses projetadas além dos 30 dias gravados e registro de "você foi?" com anotação |
| Medicações | Lista com dose, frequência, horários e estoque, busca por nome ou princípio ativo, **ordenação** (A–Z, recentes, acabando), edição e exclusão lógica |
| Estoque | Tela própria com previsão de término, recontagem e reposição por evento, e **ordenação**. Recusa a previsão quando estoque e dose usam unidades diferentes |
| Build em aparelho | Dev build pelo EAS, com as credenciais do Supabase nas variáveis de ambiente dos três perfis |

Além do que a tabela acima lista, entraram depois de 27/08: **alarmes e notificações**
(`src/notifications/`, com o Notifee — depois o fork mantido), **sincronização** com Supabase e RLS
nas nove tabelas, **catálogo CMED** embarcado (782 KB), **relatório de adesão** com PDF para a
consulta, **direitos LGPD completos** (exportar e apagar nos dois lados), **sistema de temas** com
quatro paletas, e o **passe de design** em catorze frentes.

### Buracos conhecidos

- **iOS**: compilável, nunca buildado. Toda linha ⚙️ da §6.1 é hipótese. Vale registrar que a
  restrição a Android **não é do app nem da biblioteca**: até o iOS 26 a Apple não permitia alarme
  confiável de terceiros, e o mecanismo equivalente (AlarmKit) só existe a partir dele. A fronteira
  que permitiria migrar já está no lugar — `NotificationGateway` é porta de domínio, e a biblioteca
  é só uma implementação dela.
- ~~Os três temas não-padrão não foram vistos em aparelho~~ — ✅ resolvido em 11/09, os quatro
  temas foram revisados e aprovados.
- **A adesão conta só doses vencidas** (RN20), e isso esconde resposta antecipada — quem confirma às
  13h um remédio das 13h05 não se vê no acompanhamento até o horário chegar. Achado em 05/09.

### Validação em aparelho

| Rodada | O que aconteceu |
|---|---|
| **22/08** | Login, consentimento, ficha, navegação e cadastro validados. Saíram três bugs que só apareciam ali: foto se sobrescrevendo, teclado cobrindo o campo, pílula das abas herdando cor do sistema |
| **24/08** | Home com dados reais, correção do fuso na agenda, botão físico de voltar nos modais |
| **26–27/08** | Primeira execução completa do roteiro: **37 achados**, 36 fechados e 1 recusado |
| **01/09** | **O alarme em tela cheia funcionou** — sobre o bloqueio, som em loop, app fechado. O maior risco do projeto deixou de existir |
| **05/09** | Revisão de frontend tela a tela, e o **primeiro teste sério em binário**. Aprovou estética, cadastro, calendário, estoque, adesão e PDF; reprovou **sincronização** e **alarme após reboot** — os dois corrigidos no mesmo dia |

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
  D4  Relatório em PDF — o resumo que sai do celular        ← reaberto em 02/09

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

✅ **Entregue e verificado em aparelho (22 e 24/08).** As quatro abas navegam mantendo estado, o FAB
abre a escolha de cadastro, o botão físico de voltar se comporta em todos os modais, e o
`_layout.tsx` só decide o que renderizar — a lógica de fluxo mora em `useFirstRunGate`.

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

✅ **Entregue, com OAuth verificado em aparelho (22/08).** O retorno entre as etapas funciona
inclusive pelo botão físico, a ficha é editável a qualquer momento pela mesma tela, e o login
posterior não toca no SQLite — quem começou sem conta não perde nada ao vincular. O bump de
`CURRENT_TERMS_VERSION` força reconsentimento na abertura seguinte.

⚠️ **Uma correção veio depois, em 05/09**: o login restaurava tarde demais. Ver
[o defeito e a correção](#a-ordem-do-login--corrigido-em-0509).

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

✅ **Entregue.** Busca por `LIKE` sobre coluna normalizada e indexada, com 6.992 linhas curtas.
Nenhum use-case conhece a origem do dado — o port `MedicationCatalog` define o contrato, a tela fala
com o hook e o hook com o repositório. **Peso adicionado ao app: 782 KB** (`assets/data/cmed.json`),
contra 12 MB do xlsx original da Anvisa.

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

✅ **Entregue, verificado em aparelho em 22/08 e revisado em 05/09.** O cadastro funciona 100%
offline — grava medicamento, prescrição, estoque e horários derivados em SQLite, e reaparece na
listagem depois de fechar e reabrir.

As decisões que valem registro:

- **Nove formas farmacêuticas** (comprimido, líquido, gota, injeção, pomada, sublingual, inalador,
  adesivo, sachê), e a unidade de dose acompanha a forma escolhida.
- **Exclusão é lógica** (`deletedAt`) em medicamento, prescrição e estoque, e o alerta diz o que some
  (horários futuros) e o que fica (histórico) — é o receio de perder o histórico que trava a decisão.
- **A frequência decide quantos horários existem**: não há como salvar "3 vezes ao dia" com um
  horário só. `generate-dose-schedules` verificado contra 8 casos, incluindo virada de dia.
- **Erro antes do submit**, com mensagem no campo, e o texto abaixo do botão dizendo o que falta em
  vez de deixar a pessoa adivinhar por que ele está cinza.
- **Revelação progressiva**: seções opcionais só aparecem depois do essencial, e cada uma esconde o
  que não se aplica ao medicamento cadastrado.
- **Prazo e estoque conversam** — `summarize-treatment` (8 cenários em Node) resume o tratamento em
  doses, e o estoque avisa quando não o cobre.
- **O aviso de receita mostra a data em que chega**, não a antecedência: "7 dias antes" obriga a
  fazer a conta; "chega em 12/09" não.
- **O intervalo em horas deixou de exigir conta de cabeça** — o popup preenche "de X em X horas" a
  partir do primeiro horário e mostra a lista inteira antes de aplicar.
- **"Nenhum aviso" saiu da seção de lembrete**: não configurar já é recusar, e a permissão passou a
  ser pedida no toque que escolhe o modo — pedido sem contexto é pedido negado, e no Android a
  negativa não se desfaz.

**Rastreabilidade**: §2.6 (use-case isolado da UI), §2.7.1 (confiabilidade algorítmica), Nielsen (prevenção de erros).

---

### B3. Cadastro por código de barras (EAN)

**Escopo**: câmera com moldura, entrada manual do código como alternativa obrigatória
(acessibilidade), busca no seed CMED, pré-preenchimento do formulário do B2 — o usuário sempre
revisa e confirma antes de salvar.

✅ **Entregue, e validado em aparelho em 05/09.** EAN não encontrado cai no cadastro manual com a
explicação do porquê (manipulados, importados, base velha) e os dois caminhos com o mesmo peso;
permissão de câmera negada mostra a entrada manual em vez de quebrar. Nada é salvo sem revisão — o
scanner lê e passa adiante, e quem salva é o formulário de sempre, com a posologia ainda por
responder.

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

✅ **Entregue, com a agenda do dia verificada em aparelho (24/08).** As decisões que valem registro:

- **Confirmar desconta a dose, não uma unidade.** `RegisterIntake`/`CorrectIntake` recebem
  `DoseSchedule.amount` — quem toma dois comprimidos por vez desconta dois. Pular não desconta.
- **Dose não resolvida nunca vira "skipped" sozinha** (decisão nº11.5), e isso é garantido *por
  construção*: o status vem do último `IntakeLog`, e sem log a dose fica `late` — um estado que pede
  resposta, não um desfecho. O app não inventa histórico clínico.
- **Correção retroativa gera log novo** e ajusta o estoque por delta; o log antigo continua
  consultável.
- **"Confirmar todas" só nas atrasadas.** São as únicas em que "tomei" descreve algo que já
  aconteceu; estender às futuras transformaria o histórico em registro de intenção.
- O estado vazio separa **"app vazio"** (nunca cadastrou) de **"dia vazio"** (tem tratamento, sem
  dose hoje) — pedem ações diferentes.

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

✅ **Entregue, e validado em aparelho em 05/09.** As decisões que valem registro:

- **O estoque é event-sourced**: `adjust-stock` grava **diferença**, nunca valor absoluto. É o que
  faz recontagem manual e correção de ingestão comporem em vez de se atropelarem. Verificado em Node
  contra 12 casos, incluindo a cadeia dose → recontagem → reposição → correção retroativa.
- **A quantidade nunca vai a negativo**, por recontagem ou por dose — clamp em zero dentro da mesma
  transação que grava o evento.
- **O lembrete de recontagem não notifica** (decisão nº6). Conferir uma caixa se faz de pé na frente
  do armário, e quem abre a tela de estoque já está pensando nisso; um aviso no meio do dia
  interromperia para pedir algo que só se resolve em casa. O corte é de **30 dias desde a última
  recontagem manual** — baixa por dose e reposição não contam, porque mexem no número sem que
  ninguém tenha aberto a caixa.

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

> ### 🔄 C1.9 — Nível A reaberto (02/09): o despertador de verdade
>
> **O nível B não cumpre a promessa do app.** A validação em aparelho mostrou o que o texto do
> plano não tinha capturado: uma notificação de alta prioridade toca **uma vez e para**, e o
> Gabriel foi direto ao ponto — *"o alarme precisa ser contínuo, o usuário precisa vir desligar"*.
> É o diferencial do trabalho, a alternativa a usar o despertador do celular para lembrar de
> remédio. Sem isso o Mapill é mais um app de notificação.
>
> **Por que o nível A tinha sido descartado, e por que volta.** O spike concluiu "inviável" porque
> o `expo-notifications` não expõe `fullScreenIntent` — o que continua verdade, confirmado na doc
> do SDK 57 e no código nativo do pacote. O erro foi tratar isso como limite da **plataforma**,
> quando era limite da **biblioteca**. O Android permite; o `expo-notifications` é que não oferece.
>
> **O caminho.** Três peças, e nenhuma exige escrever Kotlin:
>
> | Peça | Como |
> |---|---|
> | Disparar no horário | `expo-notifications`, que já funciona — a notificação chega |
> | Abrir tela cheia com o celular bloqueado | **Notifee**, `fullScreenAction` com `mainComponent` |
> | Som **contínuo** até desligar | `expo-audio` em loop, dentro da tela |
>
> A peça que destrava é o `mainComponent`: ele aceita um componente React registrado, então a tela
> de alarme é escrita em TypeScript como qualquer outra. E o som contínuo **não é da notificação** —
> é da tela. Notificação nenhuma toca em loop, em biblioteca nenhuma; quem toca é o app depois de
> aberto. Foi essa distinção que faltou no spike.
>
> Notifee é Apache 2.0, tem plugin oficial de Expo, e a tela `Horario` já existe com Tomei/Pulei —
> ela é a base do que vai aparecer em tela cheia.
>
> **Riscos aceitos:** `USE_FULL_SCREEN_INTENT` exige autorização em "Alarmes e lembretes" no
> Android 14+ (o app conduz até lá, como já faz com as outras permissões); e a Play Store restringe
> a permissão a apps de alarme — irrelevante aqui, porque a entrega é dev build, não publicação.
>
> **O nível B continua existindo** como o modo `notification` do cadastro. As duas opções que o app
> oferece passam a ser reais: uma avisa, a outra acorda.

---

> ### 🔧 C1.10 — Um agendador só (02/09)
>
> **O que mudou.** Entre 01 e 02/09 o app teve **duas** bibliotecas de notificação: o Notifee para o
> alarme de tela cheia (a única coisa que o `expo-notifications` não faz) e o `expo-notifications`
> para todo o resto — lembretes, compromissos, receitas, permissões. Agora é uma só.
>
> **Por que não bastava funcionar.** A escrita no banco já era única: as duas chamavam
> `confirmarDosesDoAviso`, com a mesma guarda contra confirmação repetida, então o **estoque nunca
> esteve em risco** por causa da duplicidade. O problema vivia no **cancelamento**.
>
> Cada biblioteca só enxerga a própria lista de agendamentos. A [RN14](#rn14) ("nunca editar, sempre
> reconstruir") dependia de lembrar de cancelar dos dois lados — e isso é **convenção, não
> construção**. Um terceiro ponto de cancelamento que esquecesse uma das chamadas traria de volta o
> **alarme órfão**, o pior defeito deste domínio, sem que o compilador denunciasse nada.
>
> Com um agendador só, `cancelarTudo` é literalmente tudo. O defeito deixou de ser possível em vez de
> ser evitado por atenção.
>
> **O ganho que não era só arrumação.** `onBackgroundEvent` processa a resposta **com o app
> fechado**. O caminho anterior dependia de `getLastNotificationResponseAsync` no bootstrap — isto é,
> de a pessoa **abrir o app** para o toque em "Tomei" ser processado. Para um botão que promete não
> abrir o app, isso não era detalhe: era a promessa. Registrado em `index.js`, fora do ciclo de vida
> do React, porque com o app fechado não há componente montado para assinar nada.
>
> **O que encolheu**
>
> | Antes | Agora |
> |---|---|
> | `expo-notification-gateway.ts` + `alarme-em-tela-cheia.ts` | `notifee-gateway.ts` |
> | `escutar-respostas.ts` + `escutar-alarme.ts` | `escutar-avisos.ts` |
> | `canais.ts` (Expo) | `canais-notifee.ts` |
> | 4 categorias pré-registradas no sistema | botões montados na própria notificação |
>
> As categorias sumiram porque no Notifee as ações vão **na notificação**. Antes era preciso
> registrar quatro combinações ("uma ou várias doses" × "pode adiar ou não") *antes* do agendamento,
> e escolher a certa por uma função tradutora — com a chance de agendar apontando para uma categoria
> que não corresponde ao que o aviso oferece.
>
> **O bug que a migração revelou.** O lembrete adiado é agendado com `modo: "alarm"` (precisa
> interromper como o aviso original), então seu id ficou com **os dois** prefixos:
> `alarme:adiado-…`. O filtro óbvio de `cancelarTudo` — comparar o id cru com `adiado-` — falharia, e
> o aviso que a função existe para **preservar** seria apagado a cada reagendamento, em silêncio. A
> pessoa perderia o lembrete que ela mesma pediu cinco minutos antes. Corrigido, e virou
> `scripts/conferir-ids-de-aviso.mjs` — 14 verificações de regra de string, em Node.
>
> ⚠️ **O plugin `expo-notifications` continua no `app.json`, e não pode sair.** Nenhuma linha importa
> a biblioteca, mas o plugin é de **build**: é ele que gera o drawable `notification_icon` e embarca
> `alarme_de_dose` em `res/raw` — os dois consumidos pelo Notifee **pelo nome**. Removê-lo achando
> que é dependência morta apagaria o som do alarme, sem erro de compilação.
>
> **Custo assumido:** os 10 gatilhos de reagendamento e o fluxo de permissões, que já haviam passado
> em 01/09, voltam a precisar de validação. É o preço de trocar a fundação — e a razão de o bloco 3
> do roteiro subir na ordem da próxima rodada.

**C1 está pronto quando**
- [x] Resultado do spike documentado e nível (A/B/C) escolhido explicitamente. — foi **nível B**,
      e o **A foi reaberto em 02/09** (ver C1.9): o descarte tinha confundido limite da biblioteca
      com limite da plataforma.
- [x] **Alarme em tela cheia, com som contínuo até o usuário desligar** — o diferencial do app.
      — **verificado em device (2026-09-01)**: a tela sobe por cima do bloqueio, com o app fechado,
      e o som toca em loop até alguém vir desligar. É o nível A entregue. ⚠️ Confirmado no código
      **anterior** à unificação; o caminho do alarme mudou pouco (o Notifee já era quem o agendava),
      mas o canal subiu para `v5` e exige build nova.
- [x] Notificação dispara com o app **fechado**, em device Android físico (não só emulador).
      — havia **falhado em 29/08** (canal sem `sound` e sem categoria de despertador); **passou em
      01/09** junto do alarme em tela cheia. ⚠️ O modo `notification` **mudou de biblioteca** na
      unificação — esta é a metade que mais precisa de reteste (bloco 2 do roteiro).
- [ ] Os 10 gatilhos de reagendamento (C1.4) testados um a um, sem alarme órfão. — tinham passado
      em 01/09 (excluir, mudar horário e desligar o lembrete, os três com o app fechado), mas a
      [unificação em torno do Notifee](#-c110--um-agendador-só-0209) **trocou a fundação** e
      invalida aquela validação. Reabre para a próxima rodada — bloco 3 do roteiro.
      *(A unificação reduz o risco desta caixa: `cancelarTudo` agora vê tudo. Mas é justamente por
      ser mudança estrutural que ela precisa ser reconfirmada.)*
- [ ] Checklist de borda (C1.8) percorrido. — **bloco 11 do roteiro**, escrito em 02/09 e ainda não
      executado. É a última caixa do C1: os blocos 1 a 4 provam que o alarme funciona quando tudo
      está normal; o 11 prova que ele não **mente** quando não está (dose já confirmada, meia-noite,
      Não perturbe, relógio mudado, fuso, reinstalação).
- [x] Permissão revogada gera aviso visível na Home. — card que exige **as duas** condições
      (permissão negada **e** tratamento esperando aviso), antes da agenda. **Pendente de device.**
- [x] Nenhum `import` de `expo-notifications` fora de `src/notifications/`. — verificado por
      varredura.
- [x] Texto da UI condiz com o nível realmente entregue. — "toca alto e vibra", e não "como
      despertador"; o que depende de permissão à parte é dito e ensinado.

> **O que falta, em uma frase:** os casos de borda (bloco 11 do roteiro), e as duas perguntas do
> spike que só o tempo responde — sobreviver ao reboot e à economia de bateria do fabricante.
>
> *(Atualizado em 02/09: o alarme **tocou de verdade** em 01/09 — tela cheia sobre o bloqueio, som
> em loop, app fechado. O que sobra deixou de ser "funciona?" e passou a ser "falha bem?".)*

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

✅ **Entregue, e validado em aparelho em 05/09.** As decisões que valem registro:

- **A tela abre vindo da notificação com o app fechado**, e tem saída explícita para a Home — vindo
  dali não há pilha atrás, e "voltar" fecharia o app.
- **"Ignorar por agora" grava `deferred`**, distinto de "nunca visto" e de "pulou". É saída legítima,
  não atalho: a dose continua pendente e a tela diz isso.
- **O segundo adiamento é impossível na UI**, não só recusado pelo domínio — o botão *some* da
  notificação em vez de aparecer e falhar.
- **Nenhuma dose vira `skipped` por decurso de tempo** (decisão nº11.5): nada no código escreve
  `skipped` sem toque, e o tempo só muda a **cor** na Home (`late`), nunca o registro.

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

✅ **Entregue, e validado em aparelho em 05/09.** As decisões que valem registro:

- **O compromisso confirma com a data por extenso e o dia da semana** antes de salvar — "dia 27" não
  denuncia nada, mas "sábado" denuncia na hora quem quis marcar na sexta.
- **Antecedência que não cabe é avisada, não gravada em silêncio**: "7 dias antes" numa consulta que
  é depois de amanhã descreve um aviso que já passou.
- **O desfecho é registrado, nunca inferido.** Compromisso passado pergunta "você foi?" e aceita a
  resposta mais uma anotação livre do que saiu dali. A anotação de depois é campo **separado** da
  observação de preparo escrita antes ("jejum de 12h") — tempos e utilidades diferentes. E nunca vira
  "faltou" por decurso de prazo, mesma regra da dose (decisão nº11.5).
- **O lembrete usa o mesmo mecanismo da dose**, e não um paralelo: `planejarAvisosDeCompromisso`
  devolve o mesmo `AvisoDeDose` e entra na mesma reconstrução. Dois canais independentes
  (antecedência e no dia), sempre às 8h, sempre notificação e **nunca alarme** — interromper como
  despertador se justifica na dose, que tem hora exata e consequência clínica imediata; para uma
  consulta na semana que vem seria só barulho.
- A **grade de calendário mensal** foi entregue no E1 (27/08), depois de esta linha ter sido escrita
  como fora de escopo.

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

**Anexos entram no backup (E9, confirmado em 2026-08-27).** Era "talvez" na revisão de 26/08 e
virou requisito: *"vamos ter que implementar"*. Foto da ficha, foto da caixa e receita passam a
subir. Três coisas mudam por causa disso, e nenhuma é técnica:

1. A **decisão nº10** (anexo é local, por minimização) ganha exceção explícita — deixa de ser
   regra e vira padrão com opt-out de verdade.
2. `attachmentSyncOptOut` deixa de ser sempre `false` e passa a ser escolha do paciente, com a
   pergunta em algum lugar do cadastro.
3. O **texto legal precisa mudar antes do primeiro upload**. Hoje ele afirma que os dados de saúde
   não saem do aparelho — e receita é o dado mais sensível que o app guarda. Subir antes de o
   texto descrever isso seria repetir exatamente o problema corrigido em 24/08, quando três telas
   prometiam backup inexistente. Bump de `CURRENT_TERMS_VERSION` obrigatório.

✅ **Entregue.** O push roda a cada volta ao primeiro plano, com o critério
`synced_at IS NULL OR updated_at > synced_at`; o pull usa marca d'água guardada em `sync_state` —
tabela **local**, para sumir junto no "apagar tudo" (guardada fora do banco, ela sobreviveria ao
apagamento e o app concluiria que já baixou dados que não tem mais).

**RLS conferido no painel em 30/08**: `pg_tables` devolve `rowsecurity = true` nas nove tabelas, com
`with check` no insert/update — sem ele a leitura estaria protegida e a escrita aberta.

**Anexos não sobem**, e isso é recorte declarado, não caixa a fechar
([E9](#e9-anexos-no-armazenamento-em-nuvem--fora-de-escopo-confirmado-em-0209)). O texto legal subiu
para **1.2.0** para dizê-lo ao titular: o anterior afirmava que os dados não saíam do aparelho e
prometia consultar de novo antes de qualquer envio — este bump é essa consulta.

<a id="a-ordem-do-login--corrigido-em-0509"></a>

#### ⚠️ A ordem do login — defeito achado e corrigido em 05/09

O primeiro teste em binário (05/09) reprovou o cenário principal: reinstalar o app, entrar com a
mesma conta, e **nada voltava** — o app pedia termos e ficha de novo, sem nenhum remédio. O export
de dados trouxe o rastro: **duas fichas de saúde**.

As duas coisas eram o mesmo defeito, e ele não era falta de sincronização — era **ordem**. O gate
perguntava ao banco local *"tem ficha? tem consentimento?"* logo depois de o Google autenticar. Banco
recém-instalado responde não, então mandava preencher tudo; só depois o pull rodava, na volta ao
foco, e trazia a ficha antiga. Duas linhas, uma da nuvem e uma recém-digitada. A UI mostrava só a
mais recente (`getCurrent` ordena por `updated_at`), e por isso o sintoma aparecia no export e não
na tela.

**A correção**: `sincronizar()` roda **antes** de decidir a etapa, nos dois caminhos — no login com
Google e na abertura com sessão válida mas sem ficha local. Quem já tem ficha não passa por ali,
então a abertura do dia a dia não espera rede nenhuma. Falha de rede não bloqueia: cai no
onboarding, e o pull seguinte reconcilia pelo LWW.

Junto veio o que faltava para a restauração servir: `sincronizar` passou a **refazer a janela de
avisos** quando algo desce do servidor. As doses chegavam ao SQLite, mas o agendamento vive no
sistema operacional — o aparelho novo mostrava os remédios certos e não tocava nenhum. É o pior modo
de falhar, porque parece que está tudo bem.

**Rastreabilidade**: §2.9 (consistência eventual — Vogels, 2008), §2.9.3 (LWW — Kleppmann, 2017).

---

### D2. Histórico e relatório de adesão

**Escopo**: tela de histórico mensal e por medicamento, taxa de adesão, doses perdidas com
destaque, e um resumo exportável (PDF/imagem) que o paciente possa mostrar ao médico.

✅ **Entregue, e validado em aparelho em 05/09.** O percentual é calculado por use-case puro com
`agora` injetado (`resumir-adesao.ts`, 24 casos em Node), e não dentro da tela — é o que permite
verificá-lo sem aparelho. O histórico reflete correções retroativas porque a consulta usa o
**último** log por dose, o mesmo caminho da Home e do calendário.

**Ampliado em 05/09** com a faixa "Seus últimos sete dias" (`adesao-por-dia.ts`, 7 verificações): a
taxa geral descreve o conjunto e esconde a forma dele — seis dias perfeitos com um zerado dão quase
o mesmo número que sete dias irregulares, e as duas situações pedem conversas clínicas diferentes.

⚠️ **Um defeito achado no teste de 05/09 e ainda em aberto**: a adesão só conta doses cujo horário
**já passou** (RN20). Quem confirma às 13h um remédio agendado para 13h05 não o vê no
acompanhamento até o horário chegar — mas ele **já respondeu**, e resposta dada deveria contar na
hora. A regra existe para não penalizar doses futuras; o que falta é distinguir "ainda não venceu e
não foi respondida" de "ainda não venceu **mas** foi respondida".

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

✅ **Entregue, e validado em aparelho em 05/09.** As decisões que valem registro:

- **A exportação inclui o que foi apagado** (`deleted_at` preenchido): ainda é dado do titular, e
  escondê-lo não seria a cópia completa que a lei pede.
- **Sai pela folha de compartilhamento do sistema**, e não para uma pasta escolhida pelo app — quem
  decide onde um arquivo com dado de saúde vai parar é a pessoa.
- **A exclusão apaga a nuvem primeiro**, e a ordem não é detalhe: apagar só o local faria o próximo
  `pull` trazer tudo de volta, e a pessoa veria reaparecer o que mandou apagar. É `DELETE` de
  verdade, não `deleted_at` — linha marcada como apagada continua sendo dado pessoal num servidor.
  A marca d'água da sincronização é limpa junto.
- **A segunda confirmação repete o que some**, em vez de perguntar "tem certeza?" — é ela que
  precisa ser lida.
- **Revogar consentimento apaga os dados e volta ao estado de primeira execução.** Seguir em uso sem
  consentimento registrado é o que a LGPD não admite: o retorno ao início não é cortesia de UX, é
  obrigação.
- **"Excluir conta" = apagar os dados e desvincular**, não deletar a linha em `auth.users` — isso
  exigiria API de admin com service role (impossível a partir do cliente) e o titular não pede: a
  conta do Google é dele, não do Mapill. A tela diz isso com todas as letras.

**Mudado em 05/09**: o formato passou de JSON para **`.zip` com uma planilha CSV por tabela**, mais
um LEIA-ME. O JSON cumpria a portabilidade do art. 18, V, mas só a metade que interessa a um
programador — quem baixa a própria cópia quer *abrir e olhar*, e nove tabelas aninhadas não se leem
no celular. Dois detalhes decidem se o arquivo serve: **BOM** no início de cada CSV (sem ele o Excel
no Windows lê como ANSI e "Medicação" vira "MedicaÃ§Ã£o") e **escape RFC 4180** (sem ele uma
observação com vírgula desloca todas as colunas seguintes).

**Rastreabilidade**: LGPD art. 18 (direitos do titular), art. 8º §5º (revogação).

---

### D4. Relatório em PDF — o resumo que sai do celular

**Reaberto em 02/09.** Estava fora desde 30/08 com o argumento "a tela de adesão já serve em print,
e o JSON cumpre a portabilidade". O argumento subestimava o buraco: **o JSON cumpre a lei e é
ilegível para um médico.** Os dois não competem, completam um par.

| Saída | Para quê | Leitor |
|---|---|---|
| **JSON** (D3, existe) | Direito de portabilidade — o dado migra para outro sistema | Máquina |
| **PDF** (D4) | Levar na consulta, mostrar para alguém | Humano |

É também o **único artefato do app que existe fora do celular** — e, por isso, o único que continua
servindo se o paciente estiver sem bateria na sala do médico.

**O princípio que decide o conteúdo:** o relatório é lido em **consulta de quinze minutos**, não
estudado. Cada item que entra precisa responder a pergunta que o médico faz de fato — *o que você
está tomando, e você está tomando?* O resto compete com essa resposta.

**O que entra**, em ordem de importância:

1. **Cabeçalho** — nome do paciente, período coberto, data de emissão. Sem isso o papel não vale
   nada numa consulta: um relatório sem período é um relatório sem afirmação.
2. **Tratamentos ativos** — nome, dose e posologia **em português** ("1 comprimido, 3× ao dia"), não
   na estrutura interna. É o que o médico mais quer ver.
3. **Adesão do período** — percentual geral e por medicamento, do `resumir-adesao`. Vale aqui a
   **RN20**: sem dose vencida, o relatório diz "ainda não há o que medir", nunca "0%".
4. **Compromissos do período** — consultas e exames com o desfecho registrado.
5. **Doses não tomadas** — **agrupadas e contadas por medicamento**, nunca linha a linha. "Losartana:
   4 doses não tomadas em 30 dias" informa; quatro linhas vermelhas julgam. É a
   [decisão 6.4](#64-linguagem-visual--sombra-e-não-borda) aplicada ao papel: registro clínico não
   vira fileira de repreensões, e um documento que envergonha é um documento que não se mostra.

**O que fica de fora, e por quê**

| O que | Por quê |
|---|---|
| Histórico dose a dose | É o que o JSON faz. Em PDF viraria dezenas de páginas que ninguém lê |
| Estoque | É operacional do paciente ("preciso comprar?"), não informação clínica |
| Gráficos | Número em texto sobrevive a impressão em preto e branco; gráfico não |
| Foto e anexos | Peso e sensibilidade, sem ganho para a conversa da consulta |

**Filtros** (decidido em 02/09). Dois eixos, e **só dois** — cada filtro a mais é uma decisão que a
pessoa precisa tomar antes de conseguir o papel que veio buscar:

- **Período** — o eixo principal, porque adesão sem período não significa nada. **7 / 30 / 90 dias,
  os mesmos da tela de adesão**, e 30 como padrão. O intervalo livre foi cogitado e descartado na
  implementação: a tela já registrava, desde o D2, que "de 12/07 a 09/08" é trabalho e ninguém tem
  essa pergunta — as reais são "como foi esta semana", "como foi o mês" e "como tem sido". Dar ao
  papel um eixo de tempo diferente do da tela criaria duas respostas para a mesma pergunta.
- **Medicamento** — todos (padrão) ou uma seleção. Serve ao caso real do paciente polimedicado que
  vai ao **especialista**: quem consulta o cardiologista leva o que é do coração, e não a lista
  inteira. Um relatório mais curto é mais lido.

  Quatro regras sustentam o seletor, e as três primeiras existem para que ele não produza um estado
  que ninguém quis:

  | Regra | Por quê |
  |---|---|
  | **Ausência de filtro é lista vazia**, não "todos marcados" | Com a lista cheia, um remédio cadastrado amanhã **nasceria fora** do relatório, e ninguém entenderia por quê |
  | **Desmarcar o último volta ao padrão** | Um PDF sem tratamento nenhum não é uma escolha, é um beco |
  | **Marcar todos de volta grava como "sem filtro"** | Senão o cabeçalho declararia um recorte de "5 de 5", afirmando um corte que não existe |
  | **O seletor só aparece com mais de um medicamento** | Escolher entre um item é uma decisão que não existe |

  O aviso de que um relatório parcial afirma menos vem **antes** da lista, e não depois: quem já
  desmarcou tudo e está saindo do popup não volta para ler um rodapé.

⚠️ **O filtro por medicamento muda o que o documento afirma.** Um PDF com dois de cinco tratamentos
não é "a adesão do paciente" — é a adesão *daqueles dois*. O cabeçalho precisa dizer isso
explicitamente ("2 de 5 tratamentos"), senão o documento induz o leitor a uma conclusão que os
dados não sustentam. É o mesmo princípio da RN20: o app não afirma sobre o paciente o que os dados
não dizem.

✅ **Entregue em 02/09, e validado em aparelho em 05/09** — o PDF abre, o texto não corta, e a folha
de compartilhamento oferece salvar e enviar. As decisões que valem registro:

- **O conteúdo vem de use-case puro**, não montado na tela: `montar-relatorio.ts` recebe as doses e
  devolve o conteúdo, e o gerador só o veste em HTML. **28 verificações** em Node.
- **Legível impresso em preto e branco**, por construção: sem cor e sem gráfico. A impressora da
  clínica é P&B, e cor que vira cinza perde a distinção que deveria criar.
- **Gerado 100% offline** — o HTML é montado no app e o `expo-print` o renderiza no aparelho.
- **Sem dose vencida no período, diz "ainda não há o que medir"** (RN20) — nunca "0%".
- **Doses não tomadas vêm contadas por medicamento**, nunca em lista linha a linha.

**Ampliado em 05/09**: além dos medicamentos, o relatório passou a permitir escolher **compromissos**
— duas listas independentes, porque o sistema não vincula um ao outro. Quem toma seis medicações e
vai ao médico de uma delas não leva as outras cinco, e quem sabe da relação é o paciente. Três arquivos: [`montar-relatorio.ts`](../src/domain/use-cases/montar-relatorio.ts)
(o conteúdo, puro), [`gerar-relatorio-pdf.ts`](../src/data/repositories/gerar-relatorio-pdf.ts) (o
documento) e [`use-relatorio-pdf.ts`](../src/hooks/use-relatorio-pdf.ts) (a costura com os
repositórios). O botão fica na tela **Minha adesão**, e **fora** do bloco condicional da taxa: um
relatório de tratamentos em curso serve na consulta mesmo quando nenhuma dose venceu ainda — e é
justamente quem acabou de começar o tratamento que costuma ter a próxima consulta marcada.

Dois cuidados que só apareceram ao escrever:

- **Escape do texto do paciente.** Nome de remédio e título de compromisso são texto livre. Um `&`
  em "Vitamina A & D" quebraria o documento e um `<` o truncaria **em silêncio** — que é o pior modo
  de falhar aqui, porque um PDF que gera sem erro e perde uma linha de tratamento não denuncia nada.
- **Os rótulos vêm de `rotulos-de-medicamento`**, os mesmos da lista de remédios. Se o relatório
  tivesse a própria tradução, o que foi cadastrado como "Comprimido ou cápsula" apareceria no papel
  com outro nome, e nada no código denunciaria.

**Rastreabilidade**: §2.3.3 (auditoria clínica); Nielsen nº2 (correspondência com o mundo real — o
documento fala a língua da consulta, não a do banco de dados).

---

### E9. Anexos no armazenamento em nuvem — **fora de escopo, confirmado em 02/09**

**Reaberto e fechado no mesmo dia.** Vale registrar o caminho da decisão, porque o motivo mudou —
e o motivo certo importa mais que a conclusão.

**O que ele NÃO é.** Não é dificuldade técnica: subir arquivo para o Supabase Storage é uma chamada,
e a infraestrutura já existe (cliente configurado, usuário autenticado, arquivo já em disco no
diretório de documentos). Não é custo nem capacidade: 1 GB no plano gratuito, contra centenas de KB
por foto. Registrar isso é necessário — um item excluído por "seria difícil" quando não seria vira
uma lacuna disfarçada de recorte.

**Por que fica fora, então.** Três razões que se somam, e nenhuma é a implementação em si:

1. **O ganho é invisível na defesa.** Ninguém vê uma foto subindo. O E9 não produz nada que se
   mostre à banca, enquanto o [D4](#d4-relatório-em-pdf--o-resumo-que-sai-do-celular) produz um
   documento na mão.
2. **A única parte que erra em silêncio é a que mais custa se errar.** O RLS de Storage protege
   **caminhos de arquivo**, mecanismo distinto do RLS de tabela já dominado no D1. O erro clássico —
   bucket público com RLS só na tabela — deixaria a **receita médica**, o dado mais sensível que o
   app guarda, acessível por URL a quem a tivesse. É testável e resolvível, mas é superfície nova a
   duas semanas da defesa.
3. **O argumento do artigo é melhor sem ele.** "Anexos não sobem" é minimização (art. 6º, III)
   demonstrada por ausência de funcionalidade — verificável em uma linha, impossível de contestar.

**O que sustenta a exclusão perante a banca**: o texto legal 1.2.0 **já declara** que fotos e
receita não sobem, e já prevê o caminho caso venham a subir — *"será opt-out por item e este texto
será atualizado antes"*. A promessa e a implementação dizem a mesma coisa, que é a regra RN15
aplicada ao consentimento.

> **Nota sobre o motivo original.** Até 02/09 este bloco estava fora por um argumento diferente: o
> segundo bump dos termos gastaria a atenção do titular, e o reconsentimento acontece uma vez só.
> Esse argumento **caiu** — o app não está em produção, não há base instalada para quem o
> reconsentimento custe algo. Ele continua válido para o dia em que o app for publicado, e é por
> isso que fica escrito aqui em vez de ser apagado.

**Se voltar** (pós-defesa): bucket com política sobre o caminho do arquivo, opt-out por item com
padrão em não subir, exclusão alcançando o Storage antes do local (RN18), texto 1.3.0 com
reconsentimento **antes** do primeiro upload, e o texto do TCC em `docs/tcc/` reescrito — a
minimização passa a ser "sobem por escolha explícita", que é outra afirmação.

**Rastreabilidade**: LGPD art. 6º III (minimização), art. 11 (dado sensível).

---

## FASE E — Acabamento

> **Caixas conferidas em 02/09.** Boa parte desta fase estava marcada como aberta enquanto o log
> registrava a entrega — dívida do documento, não do código. Conferidas uma a uma contra o
> repositório e corrigidas abaixo.

### E1. Estados vazios, offline, erro e acessibilidade
- [x] Toda lista tem estado vazio com próxima ação clara. — 14 telas com estado vazio próprio; a
      Home ainda separa "app vazio" (nunca cadastrou) de "dia vazio" (tem tratamento, sem dose
      hoje), que pedem ações diferentes.
- [x] Indicador visual de "dados não sincronizados". — `IndicadorDeSync` no kit, usado em
      Conta e dados.
- [x] Toda operação que pode falhar tem estado de erro com recuperação (nunca só um spinner
      infinito). — `EstadoDeErro` com "tentar de novo" nas telas que leem do banco.
- [x] Checklist de `usability-heuristics-health-ui` — **segunda varredura, 02/09**. A de 31/08
      cobriu o kit (`src/ui/`); esta cobriu as **telas**, que é onde os defeitos restantes estavam.
      Sete corrigidos, ver [6.6](#66-segunda-varredura-de-acessibilidade--0209).
- [ ] **Teste com TalkBack** nos fluxos críticos — precisa de aparelho, entra na próxima rodada
      (bloco 13 do roteiro).

### E2. Build, device real e hardening
- [x] Development build EAS gerado e testado em Android físico. — sete rodadas entre 22/08 e
      01/09.
- [ ] Bateria/otimização agressiva (Xiaomi, Samsung) não mata as notificações — ou o app avisa o
      usuário. — **bloco 7 do roteiro**, e é a pergunta do spike que só o tempo responde. O painel
      de permissões já conduz à isenção de bateria; falta medir se basta.
- [x] Migração de banco testada com dado pré-existente (não só em banco zerado). — sequência 001 a
      015 verificada com `node:sqlite`: banco zerado, banco na versão 14 **com dados**, e os 14
      passos intermediários. 41 verificações.
- [x] Nenhuma credencial no repositório; `.env` fora do git. — conferido: `.env` é ignorado, e só
      o `.env.example` está versionado.

### E3. Materiais do TCC
- [ ] Prints/roteiro de demonstração das funcionalidades do caminho crítico. — a capturar na
      sessão de validação, seguindo a ordem da Parte 2 do roteiro.
- [ ] Capítulo 4 (Resultados) mapeando: argumento do artigo → arquivo/decisão de código. — a base
      está em [`docs/tcc/`](./tcc/) (`EMBASAMENTO-TECNICO.md`, `INVENTARIO-FUNCIONAL.md`,
      `ROTEIRO-SECAO-DESENVOLVIMENTO.md`). Falta redigir o texto corrido.
- [x] Limitações e trabalhos futuros (inclui a Fase 2 do agente Anvisa). — ver
      `docs/tcc/EMBASAMENTO-TECNICO.md`, com o motivo de cada exclusão registrado na data em que foi
      decidida.

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

---

#### ⏳ Em aberto agora: reteste do C1 (rodada de 29/08)

A primeira execução da Parte 1 do [`ROTEIRO-DE-TESTE.md`](./ROTEIRO-DE-TESTE.md) rendeu sete
correções, três delas de defeito real que só o aparelho revelaria. **O bloco não fecha até o
reteste**, e ele é curto: só o que mudou.

| Bloco | Status | O que refazer |
|---|---|---|
| **1 — Permissão** | ⚠️ refazer | O bloco amarelo passou a trazer o passo a passo de como religar. Conferir se o caminho descrito bate com o que o aparelho mostra. |
| **2 — App fechado** | 🔴 refazer | Falhou por completo: o alarme não tocou. Faltava `sound` no canal e a categoria de despertador (`usage: ALARM`). É o item que decide se o C1 existe. |
| **3 — Mesmo horário** | ✅ passou | Não mexi na lógica. Só o visual dos botões da tela do horário mudou. |
| **4 — Botões** | 🔴 refazer | Toque repetido repetia a resposta inteira. Refazer com atenção ao 4.3 (adiar **uma** vez só gera **um** lembrete). |
| **5 — Alarme órfão** | ✅ passou | Intocado. |
| **6 — App aberto** | ✅ passou | Intocado. |
| **7 — Alarme × Notificação** | 🔴 refazer | O alarme não tocava. Agora existe também o pedido de acesso ao Não Perturbe, que é permissão à parte. |
| **8 — Sobrevivência** 🔬 | ⏸️ não testado | Depende do alarme funcionar. É o que fecha o spike: reboot, economia de bateria e dimensionamento da janela. |
| **9 — Casos de borda** | ⏸️ não testado | Fuso da madrugada, dose confirmada antes do horário, atraso na Home. |

**Fora do roteiro, também vale conferir** — são correções que nasceram da mesma revisão:

- A miniatura do anexo aparece **na hora**, e não branca (era `copy()` sem `await`).
- O teclado fecha ao tocar fora do campo e ao arrastar a lista, em qualquer formulário.
- Definir horário virou **uma etapa**: campo digitável com ícone de relógio ao lado.
- Na Home, a dose vira **ATRASADA** sozinha 30 minutos depois do horário, com a tela aberta.

⚠️ **Exige build nova e desinstalar a anterior**: os canais de notificação subiram para `v2`, e
canal já criado fica congelado no aparelho — som e importância não mudam por atualização.

**Entrou na fila de reteste depois de 29/08** — implementado, nunca visto em aparelho:

- **Aviso de permissão revogada na Home** (30/08), fechando o último item do C1 que faltava
  escrever.
- **Avisos de compromisso e de receita vencendo** (C3, 30/08).
- **Relatório de adesão** (D2, 30/08), pelo card de acompanhamento semanal da Home.
- **Sugestão de medicamento pelo nome** (B1) e **leitura de código de barras** (B3, 30/08).
  ⚠️ O B3 exige build nova: `expo-camera` é dependência nativa.
- **"Ignorar por agora"** na tela do horário (C2, 30/08).
- **Sincronização com o Supabase** (D1, 30/08) — inclui o reconsentimento dos termos 1.2.0, que
  aparece na primeira abertura depois de atualizar. ⚠️ Precisa de **dois aparelhos** (ou instalar,
  apagar e reinstalar) para valer como teste de verdade.
- **Sistema de temas** (03/09) — os quatro temas escolhíveis em Ajustes (Padrão, Escuro, Alto
  contraste, Sem depender de cor). Testado no navegador sem erro de runtime, mas nunca em aparelho:
  falta conferir toque real no seletor, leitura em TalkBack com cada tema ativo, e — o mais
  importante para Alto contraste — legibilidade sob luz solar direta, que é justamente o cenário
  que motivou o tema e que o navegador não reproduz. Ver [6.7](#67-sistema-de-temas--escuro-alto-contraste-sem-depender-de-cor).

**Adiado com decisão registrada:** o botão `+` no centro da barra de navegação (as abas usam
`NativeTabs`, e trocar por barra própria devolveria o risco do Material You resolvido em 23/08) e o
sininho de pendentes com contagem — os dois são melhoria, não defeito, e entram depois de o C1
fechar.

---

> **Rodada de 26/08.** Primeira execução completa. Passaram os itens **1 a 13, 16, 17, 19 a 22 e
> 29 a 37**; o **7** (relógio nativo, o de maior risco técnico do projeto) abre e funciona, com
> ressalva de usabilidade — resolvida em 27/08. Falharam ou ficaram bloqueados: **24, 25 e 28**,
> todos por causa do F1 (sem dose gerada não há o que confirmar, descontar ou alertar). Os três
> foram corrigidos e aguardam reteste; o **25 exige método novo** — cadastrar para dali a minutos
> e esperar o horário virar, porque horário passado nunca gera dose atrasada, e isso é o
> comportamento correto.

> **Resultado da rodada de 27/08.** **Onze dos treze blocos passaram**, e nenhum
> achado impede o uso do app — o que valida os itens **24, 25 e 28**, que estavam bloqueados pelo F1
> desde 26/08. Saíram 22 itens novos: 7 de funcionalidade, 13 de interface e 2 esclarecimentos.
>
> Os dois graves eram de **dado inválido gravado no banco**, e nenhum dos dois aparecia como erro na
> tela: o compromisso vencido que salvava lembrete (a validação olhava só a data, e ignorava o
> horário) e o campo dependente que guardava o valor de quando a pergunta era outra — `7,5 ml` que
> sobrevivia à troca para comprimido, unidade que não aceita fração.
>
> O **F1 (relógio analógico)** encerra uma pendência que vinha de 26/08 e se explica sozinha: não
> era build antiga nem uso errado da API. O `@expo/ui` aceita `variant="input"` no TypeScript mas o
> **ignora no Android para hora** — em `DatePickerView.kt`, o `ExpoTimePicker` chama sempre o
> mostrador do Material 3 e só o caminho da *data* lê `props.variant`. As cores funcionavam porque
> passam por outro caminho, o que fazia o sintoma parecer de build. O seletor passou a ser escrito
> em React Native, o que de quebra eliminou o `TimePicker.web.tsx`.
>
> O **F7 (splash eterna)** tinha três causas somadas, todas do mesmo tipo — uma espera que podia
> nunca terminar: `SplashOverlay` só existia no ramo `login`, então quem já passou pelo onboarding
> nunca chamava `hideAsync`; e `useDatabaseReady` e `useFirstRunGate` deixavam promessas rejeitadas
> sem tratamento, travando o app antes de qualquer tela montar. É o achado de maior risco para a
> defesa: app preso no azul, sem saída a não ser fechar.

➡️ **O passo a passo operacional está em [`ROTEIRO-DE-TESTE.md`](./ROTEIRO-DE-TESTE.md)** — o único
roteiro do projeto, dividido em duas partes: a **Parte 1** é o que se valida agora (C1,
notificações); a **Parte 2** é a passada completa antes da defesa, do zero, como quem nunca abriu o
app. Os roteiros datados das rodadas anteriores foram removidos depois de cumpridos; o que eles
apuraram está aqui, nesta seção e no log de progresso.

A tabela abaixo é o placar do que já foi validado em aparelho.

| # | O que validar | Origem |
|---|---|---|
| 1 | Onboarding sem conta, com volta entre as etapas | A2 |
| 2 | Onboarding com Google, incluindo login cancelado | A2 |
| 3 | Abrir o app sem conta e cair direto na Home | A2, 25/08 |
| 4 | Ficha completa: contatos de emergência, edição, persistência | A2 |
| 5 | Termos: versão aceita igual à vigente, texto sem promessa de nuvem | LGPD |
| 6 | FAB nas três abas, com destino certo em cada uma | UI, 24/08 |
| 7 | Relógio nativo dentro do `Modal` — **o de maior risco** | B2, 24/08 |
| 8 | Horário duplicado barrado na digitação | B2 |
| 9 | Revelação do opcional e rodapé dizendo o que falta | B2 |
| 10 | Antecedência de estoque maior que a duração dele | B2 |
| 11 | Unidade ambígua: pergunta antes da quantidade (líquido, injeção) | B2 |
| 12 | Fração aceita em ml e recusada em gota | B2 |
| 13 | "Só quando precisar": sem horário, sem início, e "Sempre disponível" | B2 |
| 14 | Estoque em unidade diferente da dose: pergunta em ml, e **sem previsão** | B4/B5, 25/08 |
| 15 | Dose que varia por horário, e a previsão somando as doses reais | B2 |
| 16 | Dias da semana | B2 |
| 17 | Ciclo: cadastrar no meio da cartela, pausa e erro de dias seguidos | B2 |
| 18 | Preencher "de X em X horas" e o bloqueio de série que não cabe no dia | B2, 24/08 |
| 19 | Data de início futura, e data pela metade travando o salvar | B2, 24/08 |
| 20 | Anexos: foto, PDF, validade e aviso de renovação em cascata | B2 |
| 21 | Popup de lembrete abre, escolhe e fecha (seção congelada) | B2 |
| 22 | Listagem, busca sem acento, edição preenchida e exclusão lógica | B2, 23/08 |
| 23 | Botão físico de voltar fechando o formulário | A1 |
| 24 | Confirmar em lote, com os nomes listados no diálogo | B4, 24/08 |
| 25 | Baixa de estoque pela dose, e correção retroativa devolvendo | B4, 22/08 |
| 26 | Tela de estoque: ordem por urgência e previsão correta | B5, 25/08 |
| 27 | Recontagem grava diferença, reposição soma | B5, 25/08 |
| 28 | Card de estoque baixo da Home leva pra tela nova | B5, 25/08 |
| 29 | Cadastro de compromisso: texto livre, data passada, cascata de avisos | C3, 24/08 |
| 30 | Calendário unificado: doses junto dos compromissos, projeção além de 30 dias | C3, 24/08 |
| 31 | Ação de dose só em hoje e passados, e nunca na projetada | C3, 24/08 |
| 32 | Desfecho no mesmo dia do compromisso | C3, 25/08 |
| 33 | Desfecho: apagar resposta, e editar sem perder o registro | C3, 24/08 |
| 34 | Vincular e desvincular conta sem perder dado | D3, 24/08 |
| 35 | Apagar dados de saúde mantendo ficha e consentimento | D3, 24/08 |
| 36 | Apagar tudo, voltar ao login e entrar com Google de novo | D3, 25/08 |
| 37 | Nada volta depois de fechar e reabrir, e as fotos sumiram junto | D3, 24/08 |

### 6.3 Offline-first

**Nenhuma exceção até aqui.** Toda escrita clínica vai para o SQLite local e nada espera rede.

| Operação | Toca a rede? |
|---|---|
| Cadastro, edição e exclusão de medicamento | Não |
| Agenda do dia, confirmação/pulo/correção de dose | Não |
| Baixa, alerta, recontagem e reposição de estoque | Não |
| Ficha de saúde e consentimento | Não |
| Seletores nativos de hora e data (Material 3, via `@expo/ui`) | **Não** — Jetpack Compose é parte do Android e vem compilado dentro do APK. `@expo/ui` é ponte JS para o que já está no aparelho: sem CDN, sem tema remoto, sem fonte baixada. Funcionam em modo avião |
| Sessão na abertura do app | **Não** — `getCurrentUser()` usa `getSession()`, que lê do AsyncStorage ([supabase-auth-gateway.ts](../src/data/remote/supabase-auth-gateway.ts)). Sem isso, abrir o app sem sinal travaria a primeira execução |
| Login com Google | Sim — é a natureza do OAuth. **Opcional**: "continuar sem login" mantém o app inteiro utilizável |

⚠️ **O mérito é menor do que parece: não existe nuvem ainda.** O app é offline-*only*, não
offline-*first* posto à prova. A propriedade só será realmente testada no D1, quando houver o que
sincronizar — e é lá que o paradigma pode ser violado sem ninguém notar. Manter esta tabela viva
a partir do D1 é o que impede isso.

---

### 6.4 Linguagem visual — sombra, e não borda

Decidido em 30/08, a partir da leitura das telas em aparelho. As referências foram as telas que já
tinham acertado o tom: **Login** (respiro), **Ajustes** (organização) e **Calendário** (hierarquia).

**A causa.** O `Card` do kit já usava sombra sem borda, mas sete telas desenhavam o próprio cartão
com `borderWidth: 1, borderColor: outlineVariant`. Como o fundo da tela (`#F7F9FB`) e o cartão
(`#FFFFFF`) são quase da mesma cor, o contorno de 1px não lê como "superfície acima" — lê como
célula desenhada. Era essa divergência, e não o espaçamento, que dava às listas o aspecto de
planilha.

| Regra | Onde vive |
|---|---|
| Cartão = fundo branco + `radius.lg` + sombra + `padding: gutter` | `surfaceCard` |
| Sombra discreta: diz "está acima", não empilha camadas | `surfaceShadow` |
| Respiro entre itens de lista > respiro dentro do item | `listGap` |
| Uma margem lateral só, para o conteúdo não pular ao trocar de aba | `screenPadding` |

**As exceções, que continuam certas:**

- **Campos de formulário** (`TextField`, `SelectField`, `DateField`, `TimeField`, `SearchField`)
  mantêm a borda: ali ela não decora, ela informa que aquilo é editável.
- **Divisor interno** continua onde separa registros curtos e repetidos (as doses perdidas na
  Adesão), porque vinte cartões seguidos viram escada. Só clareou para `surfaceContainerHigh` —
  `outlineVariant` como divisor pesa feito moldura de tabela.

**Os ajustes de cor e de alvo, na mesma passada:**

- Os estados da dose na Home deixaram de usar **borda colorida em volta** e passaram a **faixa
  lateral de 4px** — a mesma linguagem que a `Dica` e os blocos de permissão já falavam. O contorno
  inteiro somado a fundo colorido dava a cada linha o peso de um alerta de sistema.
- Nasceram `successSurface` e `errorSurface`. `successContainer` (`#A6F4C0`) é tom de chip, não de
  cartão: numa área grande ele grita, e a dose atrasada logo acima da dose de agora punha dois
  blocos saturados em sequência, anulando a hierarquia que a cor deveria criar.
- O cartão de dose **não tinha `borderRadius` nenhum** — era o único retângulo de canto reto do
  app.
- A barra de progresso do dia subiu de 4 para 8px, e o trilho vazio clareou.
- Alvos de toque em lista foram para 40–44px, e os botões secundários trocaram contorno por fundo
  suave.

---

### 6.5 Varredura de acessibilidade — 31/08

Feita **por leitura de código**, sem build, enquanto a cota do EAS não voltava. A ideia era achar
agora o que viraria retrabalho depois: corrigido antes da build de 01/09, entra na mesma validação
em vez de exigir uma terceira rodada.

O ponto de partida foi o checklist do `usability-heuristics-health-ui`. Seis defeitos reais:

| # | O que estava errado | Por que importa | Correção |
|---|---|---|---|
| 1 | **`height: 52` fixo no `Button` base** — e o mesmo em `TextField` e `SelectField` | Com a fonte do sistema ampliada, o rótulo de **todo botão do app** era recortado, incluindo o "Confirmar" da dose. Quem amplia a fonte do Android é exatamente o público deste app: a acessibilidade quebrava em quem mais depende dela | `minHeight` + `paddingVertical`, para crescer junto com o texto |
| 2 | Altura travada também em `Chip`, `ToggleChips`, `SearchField` e no campo livre do compromisso | Mesmo recorte de texto | idem |
| 3 | **Alvos de toque abaixo do piso**: 28px no editar/excluir do Calendário, 36px no confirmar/pular da dose, 32px no remover contato de emergência, 20px no "×" da chip | Todos ao lado de uma ação **destrutiva** ou de um par confirmar/pular, que é onde errar o toque falseia o registro clínico | 44px, e `hitSlop` de 12 onde crescer o botão incharia o layout |
| 4 | **`outline` reprovava no WCAG AA**: 4.47:1 sobre branco | Ele não é só cor de borda — quatro telas o usam como **texto de apoio**. Reprovava por uma margem que olho nenhum pega, que é a razão de o checklist mandar medir | `#727786` → `#696E7C` (5.09:1) |
| 5 | **Placeholder a 2.38:1** (`outline` a 60% de opacidade) | Ilegível para baixa visão, e um deles é a dica de um campo de dose | Opacidade removida; continua mais leve que o texto preenchido |
| 6 | **Ordem de leitura do `ItemDeDose`** | O TalkBack parava quatro vezes por linha e anunciava o estado **antes** do nome do remédio — o contrário de como se pensa. O rótulo visual ("ATRASADA") também soa como grito lido em voz alta | Bloco de informação agrupado com `accessible`, lido como frase: *"Dipirona, 08:00, atrasada. 1 comprimido"*. O agrupamento fica no bloco, **não** no cartão, senão engoliria os botões |

**O que já estava certo, e vale registrar no artigo:** nenhum componente desativa `allowFontScaling`;
`accessibilityLabel` cobre todos os botões de ícone; `accessibilityState` está presente onde há
seleção; os formulários usam **rótulo persistente** acima do campo, nunca placeholder como rótulo;
não existe interação com prazo que penalize quem responde devagar; e o estado da dose nunca dependeu
só de cor — o texto do status sempre esteve lá.

O contraste foi **medido**, não estimado: script em Node sobre os 18 pares texto/fundo que o app usa
de fato. Depois da correção, todos passam no AA. As duas cores criadas no passe de design de 30/08
(`successSurface`, `errorSurface`) passam com folga — 8.53:1 e 8.18:1 para os rótulos de estado.

⚠️ **O que isto não cobre:** teste manual com TalkBack ligado, percorrendo os fluxos críticos. Isso
exige aparelho e fica para a sessão de validação.

---

### 6.6 Segunda varredura de acessibilidade — 02/09

A de [31/08](#65-varredura-de-acessibilidade--3108) cobriu o **kit** (`Button`, `TextField`,
`SelectField`, contraste). Esta cobriu as **telas** — e é ali que estavam os defeitos restantes,
justamente porque o que a tela desenha sozinha não herda a correção do componente.

Sete achados, todos corrigidos. Os três primeiros são os que importam.

**1. Alvo de 32pt em "Confirmar" e "Pular" — o pior da lista.**
`ItemDeDose` tinha só `paddingVertical: spacing.sm` sobre `typography.label` (linha de 16): 8 + 16 +
8 = **32pt**, contra os 44 exigidos. São os **dois botões mais tocados do aplicativo**, empilhados a
8px um do outro, na tela onde a dose se confirma. Errar o toque aqui não é incômodo: **falseia o
registro clínico**, gravando uma dose que não foi tomada. Escapou em 31/08 porque aquela varredura
corrigiu o kit, e estes botões são desenhados pela própria tela.

**2. Estado do registro só por cor, na tela da notificação.**
Em `HorarioScreen`, "Tomei" e "Pulei" indicavam a resposta já registrada **apenas** pela variante
visual (preenchido × contornado). Para quem usa leitor de tela os dois soavam idênticos antes e
depois de responder. Corrigido com `accessibilityState.selected` e rótulo que diz o que está
registrado.

Isso exigiu consertar o `Button` do kit junto: ele fixava `accessibilityState` **antes** do spread,
então quem passasse `{ selected }` apagava o `disabled` sem perceber — e um botão desabilitado
deixava de ser anunciado como tal.

**3. Ícone mudo carregando o desfecho da dose.**
No calendário, dose resolvida virava só um `<Ionicons>` sem rótulo. Ícones do `@expo/vector-icons`
são glifos de fonte: o TalkBack lê nada. A linha era anunciada como *"08:00, Losartana, 1
comprimido"* — **sem dizer se foi tomada ou pulada**, que é exatamente o que se foi ali buscar.

**Os outros quatro:** `height: 52` travado no campo de horário do cadastro (mesmo defeito de 31/08,
fora do kit); horário duplicado sinalizado só por fundo vermelho, sem dizer **qual**; dois "Editar"
que o leitor anunciava como *"Controle ativo Editar"*, sem dizer o que se edita; e os chips de dia
da semana com papel `button` em vez de `checkbox`, lendo a abreviação em vez do nome do dia.

**O que a varredura confirmou intacto:** as correções de 31/08 seguem no lugar (`minHeight` em
Button/TextField/SelectField, `hitSlop` nos alvos destrutivos, contraste do placeholder), e
**`allowFontScaling={false}` não aparece em lugar nenhum** do `src/`.

> **A lição, para o artigo.** Duas varreduras acharam o **mesmo** defeito — altura travada cortando
> texto com fonte ampliada — em lugares diferentes: primeiro no kit, depois na tela que desenhou o
> próprio botão em vez de importar o componente. É a mesma causa raiz do passe de design de 30/08,
> quando sete telas desenhavam o próprio cartão com borda cinza. **Copiar o estilo em vez de
> importar o componente é o que faz a correção não chegar** — e num app cujo público amplia a fonte
> do sistema, o custo disso é a acessibilidade quebrar exatamente em quem mais depende dela.

### 6.7 Sistema de temas — escuro, alto contraste, e a escolha das cores de estado

Nasceu de um pedido concreto do Gabriel: dark mode como as pessoas conhecem de outros apps, e
junto dele outras estratégias de acessibilidade ligadas à cor — porque um app de saúde com público
idoso e polimedicado tem em baixa visão e daltonismo um público real, não hipotético. A escolha de
implementação não foi "trocar duas cores": foi decidir **onde mora a cor do app inteiro**.

> **Atualizado em 09/09.** O tema "Sem depender de cor" **saiu da lista**: a medição mostrou que a
> paleta fixa dele (turquesa/magenta) não separava melhor que a que substituía, e que o amarelo de
> atenção colidia com o vermelho de urgência **no próprio tema padrão** (ΔE 7,8 sob deuteranopia).
> A escolha do trio de cores virou preferência independente do tema, e vale em qualquer aparência —
> inclusive no escuro, que antes era inacessível a quem precisava daquele modo. Ver
> `docs/tcc/EMBASAMENTO-TECNICO.md` e `scripts/conferir-cores-de-estado.mjs`.

**A barreira técnica, medida antes de começar.** 567 usos de cor em 99 arquivos, todos dentro de
`StyleSheet.create` — que roda **uma vez**, na importação do módulo, e nunca mais. Trocar de tema
depois disso não repinta nada: a cor já está congelada num objeto que o React Native nem olha de
novo. Não existia atalho: qualquer tema de verdade exige que a cor pare de ser lida no import e
passe a ser lida a cada render.

#### A arquitetura

| Peça | Arquivo | Papel |
|---|---|---|
| Contrato de tema | `shared/theme/temas/tipos.ts` | `PaletaDeTema` é derivado de `typeof colors` — acrescentar uma cor na paleta padrão **quebra a compilação** de todo tema que não a definiu. Impossível esquecer uma cor num tema. |
| Os 4 temas | `shared/theme/temas/{padrao,escuro,alto-contraste,daltonismo}.ts` | Cada um com o próprio cabeçalho explicando a decisão de cor — ver abaixo. |
| Provedor | `shared/theme/tema-contexto.tsx` | `ProvedorDeTema` envolve a raiz do app (`_layout.tsx`), **acima** até das telas de onboarding — senão login/consentimento/ficha renderizariam sem tema e trocar para escuro deixaria o começo do app claro. Persiste a escolha via `AsyncStorage`. |
| Migração mecânica | `shared/theme/usar-estilos.ts` | `estilosDoTema(({ cores, ajustes }) => ({...}))` no lugar de `StyleSheet.create({...})`; `useEstilos(criarEstilos)` no componente. Três linhas mudam por arquivo, o corpo do objeto de estilos fica idêntico. |
| Rastreador de pendência | `scripts/tema-pendente.mjs` | Varre `src/` e lista, **por arquivo e por linha**, todo `colors.` fora do motor de temas — a resposta à pergunta "o que ainda não foi migrado", sem depender de abrir tela por tela. |

Os tokens de superfície que várias telas compartilhavam (`surfaceCard`, `blocoInterno`,
`estadoVisual`) viraram funções que recebem `cores` (`superficieDeCartao(cores, ajustes)`,
`estadosVisuais(cores)`), com uma versão estática mantida só para o código ainda não migrado — o
andaime que permite migrar telas uma a uma sem quebrar as que ainda não passaram.

#### Os quatro temas

- **Padrão** — o visual do Mapill de sempre, sem mudança nenhuma.
- **Escuro** — pensado para o uso real do app à noite: a dose das 22h, o alarme de madrugada.
  Nada de preto absoluto (`#0F1319`, evita halo em tela OLED); elevação por **luz, não sombra**
  (superfície mais alta = mais clara, o inverso do tema claro); cores fortes **clareiam** em vez
  de escurecer (`#0B5FD9` para `#7FB2FF`, porque azul escuro contra fundo escuro só some).
- **Alto contraste** — para catarata e degeneração macular, que passam de 50% de incidência acima
  dos 65 anos — a faixa etária que mais toma remédio todo dia. Preto e branco absolutos (21:1);
  contorno **substitui** a sombra (`contornarSuperficies: true`, porque quem não enxerga 8% de
  opacidade não vê onde um cartão termina); reforço de forma e ícone ligado, porque baixa visão
  vem frequentemente acompanhada de percepção de cor reduzida.
- **Sem depender de cor** (daltonismo) — deuteranopia e protanopia atingem cerca de 1 homem em 12,
  e as duas confundem justamente vermelho com verde: as duas cores mais carregadas de significado
  no app ("atrasada" e "é agora"). A saída não foi trocar a paleta por completo (verde não pode
  virar azul, porque azul já é a cor da ação) — foi ligar `reforcarFormaEIcone`, que obriga todo
  estado que hoje só usa cor a repetir o sinal em ícone e texto. Os ajustes de tinta que sobraram:
  verde puxa para teal, vermelho puxa para magenta, âmbar escurece — pares que sobrevivem à
  confusão onde o vermelho-tijolo/verde-grama original colapsava.

A tela de Ajustes ganhou a seção **Aparência**, com um seletor de 5 opções (Automático + os 4
temas) — cada linha mostra nome, descrição de para quem serve, e uma amostra de duas cores. A
troca é instantânea, sem confirmação: é reversível num toque.

#### Os dois bugs que a própria migração revelou

Nenhum dos dois existia antes — os dois só existem porque cor congelada num asset ou num token
estático é invisível até o dia em que o fundo ao redor muda. É o motivo de valer registrar aqui e
não só no commit.

**1. A wordmark "Mapill" desaparecia por completo no header do tema escuro.** Ela era uma imagem
PNG (`mark-transparent-a.png`) com o texto "Mapill" pintado em preto sobre fundo transparente.
Enquanto só existia o tema claro, preto bastava. No escuro o header vira quase-preto, e texto preto
sobre quase-preto é invisível — sem erro, sem warning, só ausência. Corrigido desenhando a marca
(`ui/MarcaDoMapill`): o ícone da cápsula vem de `react-native-svg` (já usado no `GoogleLogo`, cores
próprias, não depende de tema), e a palavra "Mapill" virou `<Text>` de verdade, com cor lida do
tema como qualquer outro texto do app. Nunca mais uma segunda imagem por tema.

**2. O cartão "Nenhum remédio cadastrado" ficava branco (ilegível) no tema escuro.** Quatro
arquivos recém-migrados (`InicioScreen`, `EstadoVazio`, `CardAdesaoSemanal`, `CardEstoque`) ainda
faziam `...surfaceCard` — a versão **estática** do token, congelada no tema padrão — em vez de
`...superficieDeCartao(cores, ajustes)`. O `StyleSheet` reagia ao tema em tudo, menos no fundo do
próprio cartão, porque aquele valor específico nunca tinha sido convertido. Sintoma: card branco
sólido com texto cinza-claro por cima, no meio de uma tela inteiramente escura — o tipo de defeito
que só aparece testando o tema de verdade, nunca lendo o código.

> **A lição, para o artigo.** É a mesma classe de erro que as duas varreduras de acessibilidade
> (6.5, 6.6) já tinham documentado: um valor copiado em vez de importado é o que faz a correção
> não chegar a todo lugar. Ali era estilo copiado entre telas; aqui é o mesmo token existindo em
> duas versões (a reativa e a congelada) e o código pegando a errada sem avisar. A saída nas três
> vezes foi a mesma — um lugar só de onde ler, e um jeito mecânico (aqui, um script) de achar quem
> ainda não lê dali.

#### Estado da migração

Rastreado por `node scripts/tema-pendente.mjs`, não por memória:

| Momento | Arquivos pendentes | Ocorrências |
|---|---|---|
| Início (motor pronto, nada migrado) | 99 | 607 |
| Depois do kit de UI + Home | 64 | 432 |
| Depois das telas de cadastro e listas | 32 | 93 |
| Depois da varredura final | **3** | **4** |

Os 3 arquivos finais são exceções corretas, não pendência disfarçada: `canais-notifee.ts` e
`notifee-gateway.ts` definem a cor do LED de notificação do Android num código imperativo que roda
uma vez na criação do canal, fora de qualquer render — não há hook de React ali para reagir a tema.
`SplashOverlay.tsx` roda **antes** de o `ProvedorDeTema` conseguir carregar a preferência salva do
disco, então precisa de uma cor fixa por definição — o próprio texto do componente já dizia isso
antes desta rodada.

`npx tsc --noEmit` e `npx expo lint` limpos ao final. Testado no navegador (Playwright, sem
console.error nem exceção não tratada) percorrendo onboarding completo até Home, Remédios,
Calendário e Ajustes, nos temas Padrão e Escuro, com o card de estado vazio, a wordmark do header,
a grade do calendário e os chips de filtro conferidos visualmente nos dois.

⚠️ **O que isto não cobre:** os temas Alto contraste e Sem depender de cor não foram conferidos
visualmente por screenshot em todas as telas nesta rodada (o motor foi testado — a seleção troca a
paleta corretamente, incluindo o contorno do alto contraste no lugar da sombra). E nenhum teste
aqui usa TalkBack ligado. Os quatro temas entram na fila de validação em aparelho (6.2).

---

## 7. Log de progresso

> **O diário completo mora em [`HISTORICO-DE-PROGRESSO.md`](HISTORICO-DE-PROGRESSO.md)** — 150+
> entradas com o raciocínio de cada dia, inclusive os erros. Aqui fica só a linha do tempo, para
> situar sem precisar lê-lo.

| Período | O que aconteceu |
|---|---|
| **19–20/08** | Fundação: shell de navegação, gate de primeira execução extraído do layout, ambientes de trabalho destravados. Dois bloqueadores reais no caminho — `expo-auth-session` ausente de `node_modules` derrubava o boot em todas as plataformas, e um workaround obsoleto do `metro.config.js` quebrava o bundle web |
| **21–24/08** | Núcleo clínico: cadastro de medicamento com revelação progressiva, catálogo CMED da Anvisa embutido (7 mil linhas), estoque event-sourced, calendário e compromissos. A busca por EAN nasceu aqui |
| **25–28/08** | Confiabilidade: sincronização com Supabase (LWW por `updated_at`), exportação de dados, apagamento em dois níveis, relatório de adesão |
| **29/08–01/09** | **O C1 fechou.** O alarme em tela cheia foi validado em aparelho em 01/09: sobre o bloqueio, som em loop, app fechado. O spike havia concluído "nível A inviável" — a conclusão estava errada, e o erro foi confundir limite da **biblioteca** com limite da **plataforma** |
| **02/09** | Passe de design em dez frentes. Nasceu de três incômodos nomeados pelo Gabriel, e o levantamento achou a causa técnica do principal: **75 `Pressable` e zero feedback de toque**. Num público que duvida da própria memória, a resposta a essa dúvida é tocar de novo — e no botão de confirmar dose isso registrava duas vezes |
| **03/09** | Sistema de temas: escuro, alto contraste e um modo sem depender de cor. A barreira era técnica antes de visual — 567 usos de cor em 99 arquivos dentro de `StyleSheet.create`, que roda uma vez na importação. O motor faz `PaletaDeTema` ser **derivado** do tema padrão, então é impossível um tema ficar pela metade |
| **05/09** | **Revisão de frontend, tela a tela**, com o Gabriel navegando em aparelho. Nove commits. As cores de estado viraram três tokens por cor (a régua da WCAG muda conforme o papel), a exportação virou planilhas CSV, e duas regras de domínio novas nasceram com verificação em Node |
| **05/09 (noite)** | **A validação em binário começou, e achou dois defeitos graves.** A sincronização não restaurava nada ao reinstalar, e o alarme não sobrevivia ao reboot. Os dois estão corrigidos — o segundo levou à migração para fora do Notifee, que foi arquivado em 07/04/2026 |
