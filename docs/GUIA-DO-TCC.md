# Mapill — Guia completo do desenvolvimento

> **O que é este documento.** É o relato do desenvolvimento do Mapill, escrito para servir de base
> à parte escrita do TCC — principalmente ao Capítulo 4 (Resultados). Ele reúne o que foi
> construído, em que ordem, sob quais regras, e **por que cada decisão foi tomada daquele jeito e
> não de outro**.
>
> A fonte primária é o [`PLANO-DE-DESENVOLVIMENTO.md`](./PLANO-DE-DESENVOLVIMENTO.md), mantido
> desde 19/08/2026, com as decisões datadas no momento em que foram tomadas — não reconstruídas
> depois. Este guia organiza aquele material em forma de argumento.
>
> **Autor:** Gabriel Steffens · Sistemas de Informação — UNIDAVI · 2026

---

## Sumário

1. [O problema e a tese](#1-o-problema-e-a-tese)
2. [Requisitos](#2-requisitos)
3. [Regras de negócio](#3-regras-de-negócio)
4. [Arquitetura](#4-arquitetura)
5. [O desenvolvimento, fase a fase](#5-o-desenvolvimento-fase-a-fase)
6. [As decisões difíceis](#6-as-decisões-difíceis)
7. [Método de trabalho](#7-método-de-trabalho)
8. [Conformidade legal](#8-conformidade-legal-lgpd)
9. [Resultados](#9-resultados)
10. [Limitações e trabalhos futuros](#10-limitações-e-trabalhos-futuros)
11. [Mapa: argumento → código](#11-mapa-argumento--código)

---

# 1. O problema e a tese

## 1.1 O problema

A não adesão ao tratamento medicamentoso é um problema de saúde pública documentado: pacientes que
esquecem doses, tomam na hora errada, perdem a conta do que já tomaram, ou ficam sem o remédio
porque não perceberam que a caixa estava acabando. O problema se agrava em pacientes
**polimedicados** — quem toma cinco medicamentos diferentes, em horários diferentes, com regras
diferentes — e em pacientes idosos, que somam à complexidade do tratamento as limitações de visão,
memória e destreza.

O mercado tem aplicativos de lembrete de medicação. O que observei ao delimitar o escopo deste
trabalho é que a maioria falha em pelo menos um destes pontos:

- **Dependem de conexão.** Um app que precisa de internet para mostrar a agenda do dia falha
  exatamente quando o paciente mais precisa dele.
- **Simplificam demais o modelo clínico.** Assumem "um comprimido, uma vez por dia" e não
  representam insulina com dose variável por horário, xarope medido em ml, ou tratamento em ciclo
  com pausa.
- **Não são confiáveis no lembrete.** Notificação que depende do app estar aberto não é lembrete,
  é sorte.
- **Tratam dado de saúde como dado comum.** Sem consentimento informado, sem direito de exclusão,
  sem dizer onde o dado está.

## 1.2 A tese

**O Mapill é um aplicativo de adesão medicamentosa que funciona integralmente offline, modela o
tratamento com fidelidade clínica, e entrega o lembrete pelo agendamento nativo do sistema
operacional — não pelo aplicativo.**

Três afirmações, e cada uma é verificável no código:

| Afirmação | Como se verifica |
|---|---|
| **Funciona offline** | Nenhuma escrita clínica toca a rede. A tabela em [6.3 do plano](./PLANO-DE-DESENVOLVIMENTO.md) lista operação por operação |
| **Modela com fidelidade** | Nove formas farmacêuticas, quatro frequências, dose variável por horário, estoque em unidade de embalagem |
| **O lembrete é do sistema** | `expo-notifications` agenda no Android; o alarme dispara com o app fechado, e sobrevive ao reboot |

## 1.3 O foco: o que o app é e o que ele não é

Delimitar isso cedo foi o que impediu o escopo de crescer sem controle — o risco clássico de um
TCC de desenvolvimento.

**O Mapill é** um registro clínico pessoal que lembra o paciente da dose e mantém o histórico do
que aconteceu.

**O Mapill não é**, e as exclusões são deliberadas:

- **Não é um app de prescrição.** Ele não sugere dose, não corrige posologia, não valida se o
  tratamento faz sentido clinicamente. Quem prescreve é o médico; o app registra o que foi
  prescrito. Toda validação implementada é de **plausibilidade de dado**, nunca de adequação
  clínica.
- **Não é um app de cuidador.** Uma conta é de um paciente. O papel de cuidador — alguém que
  acompanha o tratamento de outra pessoa — foi congelado por decisão de escopo, porque muda o
  modelo de permissão inteiro.
- **Não é um app social.** Sem compartilhamento, sem comparação com outros pacientes, sem ranking.
- **Não julga o paciente.** A gamificação existe (progresso do dia, adesão semanal), mas nunca
  bloqueia e nunca repreende. Uma lista de doses perdidas é registro clínico, não uma fileira de
  repreensões — quem lê isso sobre a própria semana tende a parar de registrar, não a parar de
  esquecer.

---

# 2. Requisitos

## 2.1 Requisitos funcionais

Numerados para referência no texto do TCC. A coluna "bloco" aponta a fase do roadmap onde foi
entregue.

### Identidade e consentimento

| # | Requisito | Bloco |
|---|---|---|
| RF01 | O sistema deve permitir uso **sem conta**, mantendo toda a funcionalidade clínica | A2 |
| RF02 | O sistema deve permitir autenticação via Google (OAuth), como opção | A2 |
| RF03 | O usuário anônimo deve poder vincular conta depois, **sem perder dados locais** | A2 |
| RF04 | O sistema deve registrar consentimento informado, com data e versão do texto aceito | A2 |
| RF05 | Mudança na versão dos termos deve forçar novo consentimento | A2 |
| RF06 | O sistema deve manter ficha de saúde (nome, nascimento, foto, contatos de emergência) | A2 |

### Cadastro clínico

| # | Requisito | Bloco |
|---|---|---|
| RF07 | O sistema deve cadastrar medicamentos em **nove formas farmacêuticas**: comprimido, líquido, gota, injeção, pomada, sublingual, inalador, adesivo e sachê | B2 |
| RF08 | A unidade de dose deve acompanhar a forma farmacêutica escolhida | B2 |
| RF09 | O sistema deve suportar **quatro frequências**: todo dia, dias da semana, ciclo com pausa, e sob demanda | B2 |
| RF10 | O sistema deve suportar **dose variável por horário** (ex.: insulina 10 UI de manhã, 8 UI à noite) | B2 |
| RF11 | O sistema deve gerar os horários de dose a partir da posologia | B2 |
| RF12 | O sistema deve aceitar anexo de receita (foto ou PDF), com validade e aviso de renovação | B2 |
| RF13 | O sistema deve sugerir medicamentos a partir da base da CMED/Anvisa, offline | B1 |
| RF14 | O sistema deve permitir cadastro por leitura de código de barras (EAN) | B3 |
| RF15 | O sistema deve permitir editar e excluir cadastros, **preservando o histórico de ingestão** | B2 |

### Operação diária

| # | Requisito | Bloco |
|---|---|---|
| RF16 | O sistema deve apresentar a agenda de doses do dia, com estado visual por dose | B4 |
| RF17 | O usuário deve poder confirmar ou pular cada dose | B4 |
| RF18 | Confirmar dose deve descontar do estoque **a quantidade da dose**, não uma unidade | B4 |
| RF19 | Pular dose **não** desconta estoque | B4 |
| RF20 | O sistema deve permitir **correção retroativa**, gerando novo registro sem apagar o anterior | B4 |
| RF21 | O sistema deve permitir confirmação em lote das doses atrasadas | B4 |
| RF22 | O sistema deve controlar estoque com previsão de esgotamento derivada da posologia | B5 |
| RF23 | O sistema deve distinguir **recontagem** (conferir a caixa) de **reposição** (comprar mais) | B5 |
| RF24 | O sistema deve lembrar de conferir o estoque físico após 30 dias sem recontagem | B5 |

### Lembretes

| # | Requisito | Bloco |
|---|---|---|
| RF25 | O sistema deve disparar lembrete no horário da dose **com o aplicativo fechado** | C1 |
| RF26 | O sistema deve oferecer dois modos: alarme (som alto, ignora silencioso) e notificação | C1 |
| RF27 | A notificação deve oferecer ações rápidas: confirmar e adiar | C1 |
| RF28 | O adiamento deve ser permitido **uma única vez** por horário | C1/C2 |
| RF29 | Doses de medicamentos diferentes no mesmo horário devem gerar **um único** aviso agrupado | C1 |
| RF30 | Alterar ou excluir um tratamento deve cancelar os avisos correspondentes | C1 |
| RF31 | O sistema deve avisar, de forma visível, quando a permissão de notificação estiver revogada | C1 |
| RF32 | O toque na notificação deve abrir a tela da dose que disparou | C2 |
| RF33 | O sistema deve oferecer "ignorar por agora" — distinto de pular e de nunca ter visto | C2 |

### Agenda clínica

| # | Requisito | Bloco |
|---|---|---|
| RF34 | O sistema deve cadastrar compromissos (consultas, exames, terapia) com lembrete próprio | C3 |
| RF35 | O calendário deve exibir compromissos **e** doses no mesmo dia | C3 |
| RF36 | O sistema deve projetar doses futuras além do horizonte gravado | C3 |
| RF37 | Compromisso passado deve registrar desfecho (compareceu / não compareceu) com anotação | C3 |
| RF38 | O sistema deve avisar sobre receita próxima do vencimento | C3 |

### Dados e direitos

| # | Requisito | Bloco |
|---|---|---|
| RF39 | O sistema deve sincronizar com a nuvem quando houver conta vinculada | D1 |
| RF40 | Conflito de edição deve resolver por **Last-Write-Wins**, de forma determinística | D1 |
| RF41 | O sistema deve calcular taxa de adesão por período e por medicamento | D2 |
| RF42 | O sistema deve exportar todos os dados do titular em formato legível e portável | D3 |
| RF43 | O sistema deve apagar os dados do titular **no aparelho e na nuvem** | D3 |
| RF44 | Revogar consentimento deve apagar os dados e retornar à primeira execução | D3 |

## 2.2 Requisitos não funcionais

| # | Requisito | Como foi atendido |
|---|---|---|
| RNF01 | **Offline-first**: nenhuma operação clínica pode depender de rede | Toda escrita vai ao SQLite local; a sincronização é posterior e opcional |
| RNF02 | O lembrete deve funcionar com o app fechado e após reinicialização | Agendamento nativo via `expo-notifications`, re-registro em `RECEIVE_BOOT_COMPLETED` |
| RNF03 | A busca no catálogo deve responder em menos de 200 ms | Coluna normalizada e indexada; 6.992 registros |
| RNF04 | O acréscimo de peso do catálogo ao aplicativo deve ser documentado e mínimo | 782 KB, contra 12 MB do arquivo original da CMED |
| RNF05 | O domínio não pode conhecer framework, banco ou biblioteca externa | Nenhum `import` de Expo, SQLite ou Supabase em `src/domain/` |
| RNF06 | Toda tabela na nuvem deve ter isolamento por usuário | RLS em nove tabelas: `user_id = auth.uid()`, com `with check` |
| RNF07 | Migrações de banco devem ser aditivas e reversíveis por versão | 16 migrações sequenciais, controladas por `PRAGMA user_version` |
| RNF08 | Alvos de toque de no mínimo 44 pt | Verificado por varredura de código em 31/08 |
| RNF09 | Contraste mínimo WCAG AA (4,5:1) para texto | Medido por script sobre os 18 pares reais da interface |
| RNF10 | A interface deve respeitar a escala de fonte do sistema | Nenhum componente desativa `allowFontScaling`; alturas mínimas em vez de fixas |
| RNF11 | Nenhuma credencial no repositório | `.env` fora do controle de versão; apenas `.env.example` versionado |
| RNF12 | Nenhuma operação pode falhar em silêncio | Todo estado de erro tem mensagem e caminho de recuperação |

---

# 3. Regras de negócio

Estas são as regras que governam o comportamento do sistema. Cada uma nasceu de uma decisão
registrada com data no plano, e várias existem porque a alternativa produzia dado clinicamente
incorreto.

## RN01 — A ausência de resposta nunca é um desfecho

**Uma dose não respondida jamais vira "pulada" por decurso de tempo.**

Esta é a regra mais importante do sistema. O registro de ingestão é um documento clínico: ele diz
o que o paciente fez. Se o app marcasse como "pulada" toda dose não confirmada até meia-noite,
estaria **inventando um fato** — o paciente pode ter tomado e esquecido de registrar.

Está garantido por construção, não por verificação: o status de uma dose deriva do último
`IntakeLog` associado a ela. Sem log, a dose fica no estado `late`, que é um estado que **pede
resposta**, não um desfecho. Nenhuma linha do código escreve `skipped` sem um toque do usuário.

A mesma regra vale para compromissos: um compromisso passado sem resposta não vira "faltou".

## RN02 — O estoque desconta a dose, não a unidade

Quem toma dois comprimidos por vez consome dois da caixa. Descontar um por confirmação produziria
uma previsão de esgotamento sistematicamente otimista — e o paciente ficaria sem remédio antes do
app avisar.

`RegisterIntake` e `CorrectIntake` recebem `DoseSchedule.amount`, a quantidade daquela ocorrência.

## RN03 — O estoque conta na unidade da embalagem

Gota se toma em gota e se compra em ml. É o ml que está impresso no frasco, e é em ml que a pessoa
consegue conferir. Contar na unidade da dose quebraria a única conta que o estoque existe para
fazer.

**Consequência:** quando estoque e dose usam unidades incompatíveis, o sistema **recusa** dar
previsão de término, em vez de calcular um número errado. Dizer "sem previsão" é honesto; dizer
"faltam 12 dias" quando a conversão é desconhecida seria falso.

## RN04 — Ajuste de estoque é evento, nunca valor absoluto

Toda alteração de estoque grava uma **diferença** (`InventoryAdjustment`), nunca sobrescreve o
total. Isso permite que dose confirmada, recontagem, reposição e correção retroativa se componham
sem que nenhuma apague a outra.

A quantidade tem *clamp* em zero dentro da mesma transação que grava o evento — nunca fica
negativa.

## RN05 — Recontar e repor são ações diferentes

Recontar é abrir o armário e contar o que está lá. Repor é somar o que chegou da farmácia. Um
único campo "corrigir" obrigaria o paciente a fazer a conta de cabeça a cada compra.

Só a **recontagem manual** conta como "conferir a caixa" para efeito do lembrete de 30 dias: baixa
por dose e reposição mexem no número sem que ninguém tenha aberto a embalagem.

## RN06 — Correção nunca sobrescreve

Corrigir um registro de ingestão gera um **novo** log, ligado ao anterior por `correctsLogId`, e
um ajuste de estoque por delta. O registro original continua consultável.

É o que torna o histórico auditável: dá para reconstruir não só o que o paciente fez, mas o que ele
declarou e quando corrigiu.

## RN07 — Exclusão de tratamento preserva o histórico

Excluir um medicamento é exclusão **lógica** (`deletedAt`). Os horários futuros somem; os registros
de ingestão passados permanecem.

O diálogo de confirmação diz exatamente isso, porque é o receio de perder o histórico que trava a
decisão do paciente.

## RN08 — A frequência determina os horários

"Três vezes ao dia" abre exatamente três campos de horário, **vazios**. Nunca pré-preenchidos:
horário sugerido é o que quem tem pressa aceita sem ler, e aí o app passa a lembrar a dose na hora
errada, em silêncio.

O erro de salvar "3 vezes ao dia" com um horário só deixa de existir por construção.

## RN09 — A unidade é consequência da forma, não pergunta

Só líquido, injeção e "outra" têm ambiguidade real de unidade e mostram seletor. Nas demais formas
a unidade é derivada e vira apenas um selo informativo.

Perguntar o que não é ambíguo aumenta a carga cognitiva sem aumentar a precisão.

## RN10 — Campo que muda de significado é limpo

Se o paciente preenche `7,5 ml` e depois troca a forma para comprimido, o campo de dose **esvazia**
— comprimido não aceita fração.

Esta regra nasceu de um defeito real, encontrado na validação de 27/08: o valor sobrevivia à troca
e era gravado no banco. Era dado inválido, e **não aparecia como erro em tela nenhuma**.

## RN11 — Um aviso por horário, não por dose

Quem toma quatro remédios às 08:00 receberia quatro notificações simultâneas. O aviso é agrupado
por horário, listando um remédio por linha, e o botão muda de "Tomei" para "Tomei todas".

## RN12 — Adiamento é permitido uma vez

Um adiamento por horário. Na segunda vez, o botão **desaparece** da notificação, em vez de aparecer
e recusar a ação.

Botão que existe e não funciona é pior que botão ausente.

## RN13 — Adiar não registra desfecho

Adiar reagenda o aviso e não grava nada. A dose continua pendente. É diferente de "ignorar por
agora" (`deferred`), que registra que o paciente **viu** e decidiu resolver depois — e diferente de
pular, que é um desfecho.

Três estados distintos porque são três coisas distintas no mundo.

## RN14 — O reagendamento é sempre reconstrução completa

Nunca se "edita" um aviso agendado. Qualquer alteração cancela **todos** os avisos da prescrição e
reagenda a janela inteira.

É uma operação idempotente, e é a única forma barata de garantir zero **alarme órfão** — o pior
defeito possível neste domínio: o paciente receber lembrete de um remédio que já parou de tomar.

## RN15 — O texto da interface descreve o que foi entregue

Regra inegociável. O aplicativo diz "toca alto e vibra, mesmo no silencioso", e não "como um
despertador", porque o despertador de tela cheia **não** foi entregue — o Android 14 restringe
`USE_FULL_SCREEN_INTENT` a aplicativos de alarme e chamada.

Prometer uma garantia de segurança que não existe, num app de medicação, é mais grave que uma falha
de usabilidade.

## RN16 — Compromisso avisa por notificação, nunca por alarme

Interromper como despertador se justifica na dose, que tem hora exata e consequência clínica
imediata. Para uma consulta na semana que vem, seria só barulho.

## RN17 — Sincronização resolve por Last-Write-Wins, tudo ou nada

Conflito entre dois aparelhos resolve pela versão com `updated_at` mais recente, **por registro
inteiro** — nunca mesclando campos. Meia edição de um lado com meia do outro produziria um registro
que nunca existiu em lugar nenhum.

Empate mantém o local, porque empate só acontece quando os dois lados já têm a mesma coisa.

## RN18 — A exclusão alcança a nuvem primeiro

Apagar só o local faria o próximo `pull` trazer tudo de volta — o paciente veria reaparecer sozinho
o que mandou apagar.

A ordem é **inversa** à da sincronização: lá é pai antes de filho, para nada chegar órfão; aqui é
filho antes de pai, para nada ficar órfão. E é `DELETE` de verdade, não `deleted_at`: uma linha
marcada como apagada continua sendo dado pessoal guardado num servidor.

## RN19 — Doses futuras não entram no cálculo de adesão

Uma dose marcada para as 22h não pode contar contra o paciente às 15h. O cálculo considera apenas
doses cujo horário já passou.

Sem essa regra, a taxa de adesão começaria o dia em 0% e subiria ao longo do dia — o que mediria a
hora do dia, não a adesão.

## RN20 — Sem dose vencida, não há percentual

Um aplicativo recém-instalado mostra "ainda não há o que medir", nunca "0%". Zero por cento é uma
afirmação sobre o comportamento do paciente; ausência de dados não é.

---

# 4. Arquitetura

## 4.1 A decisão estrutural

O sistema segue **Clean Architecture** com quatro camadas, e a regra de dependência aponta sempre
para dentro: o domínio não conhece ninguém, e todo mundo conhece o domínio.

```
┌───────────────────────────────────────────────────────────────┐
│  APRESENTAÇÃO   src/telas/  src/ui/  src/hooks/  src/app/     │
│                 React Native, Expo Router, componentes        │
└───────────────────────────────────────────────────────────────┘
                            │  usa
                            ▼
┌───────────────────────────────────────────────────────────────┐
│  DOMÍNIO        src/domain/entities/    (11 arquivos)         │
│                 src/domain/ports/       (12 contratos)        │
│                 src/domain/use-cases/   (13 casos de uso)     │
│                                                               │
│          TypeScript puro. Zero import de framework.           │
└───────────────────────────────────────────────────────────────┘
                            ▲  implementa
                            │
┌───────────────────────────────────────────────────────────────┐
│  DADOS          src/data/local/     SQLite + 16 migrações     │
│                 src/data/remote/    Supabase + sincronização  │
│                 src/notifications/  expo-notifications        │
└───────────────────────────────────────────────────────────────┘
```

**Por que Clean Architecture, e não MVC ou uma organização por feature.** A justificativa não é
acadêmica, é prática: o núcleo deste aplicativo é um conjunto de **regras de cálculo clínico** —
gerar horários a partir da posologia, resumir um tratamento em doses, prever esgotamento de
estoque, calcular adesão. Essas regras precisam ser testáveis sem simulador, sem banco e sem
interface.

Como são funções puras em TypeScript, eu as verifico executando Node diretamente. Foi assim que
`generate-dose-schedules` foi conferido contra 8 casos, `summarize-treatment` contra 8 cenários,
`adjust-stock` contra 12 composições e `resumir-adesao` contra 24 casos — tudo antes de qualquer
tela existir.

## 4.2 As camadas

### Domínio (`src/domain/`)

**Entidades** — as 11 estruturas que representam o mundo clínico:

| Entidade | Representa |
|---|---|
| `medication` | O medicamento em si: nome, forma farmacêutica, princípio ativo, foto |
| `prescription` | Como esse medicamento é tomado: posologia, duração, anexo de receita |
| `dose-schedule` | Uma ocorrência específica: dia, hora e a quantidade daquela dose |
| `intake-log` | O registro do que aconteceu: tomou, pulou, corrigiu |
| `inventory-item` | O estoque: quantidade, unidade da embalagem, local de guarda |
| `appointment` | Compromisso clínico: consulta, exame, terapia |
| `patient-profile` | A ficha de saúde do titular |
| `consent` | O aceite dos termos, com versão e data |
| `auth-user` | A identidade, quando existe conta vinculada |
| `syncable` | O contrato de sincronização (`updatedAt`, `syncedAt`, `deletedAt`) |

A separação entre `medication` e `prescription` é deliberada: **o mesmo medicamento pode ser tomado
de formas diferentes** ao longo do tempo, e trocar a posologia não deveria criar um remédio novo no
sistema.

**Ports** — 12 interfaces que o domínio declara e as camadas externas cumprem. É aqui que a
**inversão de dependência** acontece: `DoseScheduleRepository` é definido pelo domínio, e o SQLite
o implementa. Trocar SQLite por outro banco não tocaria em nenhuma regra de negócio.

**Use-cases** — os 13 casos de uso, todos funções puras com o tempo injetado:

| Use-case | O que resolve |
|---|---|
| `generate-dose-schedules` | Transforma posologia em ocorrências datadas |
| `register-intake` | Grava o desfecho de uma dose e desconta estoque |
| `correct-intake` | Corrige um registro sem apagar o anterior |
| `adjust-stock` | Aplica um evento de estoque como diferença |
| `estimate-stock-depletion` | Prevê quando o estoque acaba |
| `summarize-treatment` | Resume um tratamento em doses e quantidade total |
| `resumir-adesao` | Calcula taxa de adesão por período e medicamento |
| `planejar-avisos-de-dose` | Decide quais avisos existem, agrupados por horário |
| `planejar-avisos-de-compromisso` | O mesmo, para consultas e receitas |
| `snooze-dose-alarm` | Aplica a trava de um adiamento |
| `doses-de-hoje-ja-passadas` | Identifica horários já vencidos no cadastro |
| `dose-faltante-do-prazo` | Detecta prazo de tratamento que o estoque não cobre |
| `estoques-a-recontar` | Aplica o corte de 30 dias do lembrete de conferência |

**O tempo é sempre injetado.** Nenhum use-case chama `new Date()` internamente — `agora` é
parâmetro. É o que os torna determinísticos e verificáveis: dá para simular a virada da meia-noite,
o horário de verão e a dose atrasada sem mexer no relógio do computador.

### Dados (`src/data/`)

**Local** — SQLite via `expo-sqlite`, com 16 migrações sequenciais controladas por
`PRAGMA user_version`. Toda migração é **aditiva**: adiciona coluna ou tabela, nunca remove nem
renomeia.

A razão é a atualização em campo. O aplicativo já rodou em aparelho com dados reais; uma migração
destrutiva significaria perder o histórico clínico de quem já usava. Antes de liberar a migração
015, verifiquei a sequência inteira com `node:sqlite`: banco zerado, banco na versão 14 com dados,
e os 14 passos intermediários — 41 verificações, todas passando.

**Remoto** — Supabase (PostgreSQL) com Row Level Security em todas as nove tabelas sincronizáveis.

A política é `user_id = auth.uid()`, **com `with check` no insert e no update**. Sem o `with check`,
o RLS protegeria a leitura e deixaria a escrita aberta — e essa é a falha clássica desta
configuração: um usuário autenticado poderia inserir linhas atribuídas a outro.

**Sincronização** — `sync-service.ts`, com quatro propriedades:

1. **Push antes de pull.** O que foi criado offline sobe antes de qualquer coisa descer.
2. **Marca por linha.** O `synced_at` de cada registro é carimbado após confirmação do servidor,
   usando o próprio `updated_at` da linha — não o relógio local, que pode divergir.
3. **Ordem de dependência.** Pai antes de filho, para nenhuma linha chegar órfã.
4. **Marca d'água local.** A última sincronização fica numa tabela local (`sync_state`), para ser
   apagada junto no "apagar tudo".

### Notificações (`src/notifications/`)

A **única** pasta do projeto que importa `expo-notifications` — verificado por varredura. O domínio
define o conteúdo (`planejar-avisos-de-dose` decide *quais* avisos existem, como função pura); esta
camada apenas executa o agendamento.

Essa separação permitiu verificar toda a lógica de agrupamento e de conteúdo dos avisos em Node,
sem aparelho.

### Apresentação (`src/telas/`, `src/ui/`, `src/hooks/`)

17 telas, e um design system próprio com mais de 30 componentes. Nenhuma tela conversa com o banco
diretamente: elas falam com hooks, e os hooks com os repositórios.

## 4.3 O sistema de design

O `src/ui/` existe para que a interface seja consistente por construção. Botão, campo, cartão,
seletor — todos vêm de um lugar só, com os tokens em `src/shared/theme/`.

A lição aprendida aqui vale registro: em 30/08 descobri que **sete telas desenhavam o próprio
cartão** com borda cinza, enquanto o `Card` do kit já usava sombra. A divergência nasceu de copiar
o estilo em vez de importar o componente, e o resultado era que as listas pareciam planilha.

A correção foi transformar a decisão em token (`surfaceCard`, `surfaceShadow`), o que impede a
cópia de reaparecer.

## 4.4 Stack e justificativa

| Tecnologia | Por quê |
|---|---|
| **React Native + Expo (SDK 57)** | Uma base de código, com acesso a APIs nativas via módulos. O Expo Router dá roteamento por arquivo, e o EAS resolve build sem Android Studio local |
| **TypeScript** | Tipagem estática em código que manipula dado clínico. Um `amount` trocado por `quantity` é erro de compilação, não defeito em produção |
| **SQLite** (`expo-sqlite`) | Banco relacional embarcado, transacional. O modelo clínico tem relações reais entre medicamento, prescrição, horário e registro — chave-valor não serviria |
| **Supabase** | PostgreSQL gerenciado com autenticação e RLS. O isolamento por usuário é declarado no banco, não na aplicação |
| **expo-notifications** | Agendamento pelo sistema operacional. É o que faz o lembrete existir sem o app estar rodando |

**O que foi deliberadamente recusado:** framework de estilo utilitário (o design system próprio
cumpre o papel com menos indireção), biblioteca de estado global (os hooks com repositório dão
conta), e ORM (as consultas são poucas e específicas; SQL direto é mais legível aqui).

---

# 5. O desenvolvimento, fase a fase

O roadmap teve **cinco fases**, e a ordem não foi arbitrária: cada uma destrava a seguinte. O
caminho crítico declarado no início foi `A1 → B2 → B4 → C1 → D1` — se o cronograma apertasse, era
essa linha que precisava existir.

| Fase | O que resolve | Blocos |
|---|---|---|
| **A — Fundação** | Navegação e identidade. Sem isso não há onde encaixar tela nenhuma | A1, A2 |
| **B — Núcleo clínico** | O coração: cadastrar tratamento, ver a agenda, controlar estoque | B1 a B5 |
| **C — Tempo real** | O diferencial: o lembrete que dispara sozinho | C1, C2, C3 |
| **D — Confiabilidade** | Nuvem, histórico e direitos do titular | D1, D2, D3 |
| **E — Acabamento** | Estados de erro, acessibilidade, build e material acadêmico | E1, E2, E3 |

## Fase A — Fundação

**A1 (Navegação).** Substituição do template do Expo pelas quatro abas reais (Home, Calendário,
Remédios, Ajustes) e pelas rotas de cadastro como pilha modal.

O trabalho de fundo foi extrair o **gate de primeira execução** (`login → consentimento → ficha →
app`) para um hook próprio. Ele estava dentro do componente de layout, o que violava separação de
responsabilidades: um arquivo que deveria decidir *o que renderizar* estava decidindo *em que ponto
do fluxo o usuário está*.

**A2 (Identidade).** Login com Google via Supabase Auth, sessão persistida, e a opção de
**continuar sem login** — que mantém o aplicativo inteiro utilizável.

Duas decisões importantes aqui. A primeira: quem entra sem conta pode **vincular depois sem perder
dado**, porque o login não toca no SQLite. A segunda: uma build sem credenciais **diz isso na
tela**, em vez de aceitar o toque e falhar depois.

## Fase B — Núcleo clínico

**B1 (Catálogo CMED).** Importação da base da Câmara de Regulação do Mercado de Medicamentos:
6.992 registros, reduzidos de **12 MB para 782 KB** pela remoção das colunas de preço e regulação,
que o aplicativo não usa.

A importação roda **depois** da interface aparecer, sem `await` — a primeira abertura não pode
esperar por um dicionário.

**B2 (Cadastro de medicamento) — o bloco mais importante.** O desafio era cobrir qualquer
apresentação clínica sem virar um formulário intimidador.

A solução foi **uma tela, dois estados**: mostra só o essencial (nome, forma, dose, frequência,
duração) e, quando isso fica completo, o restante aparece de uma vez, anunciado por "já dá pra
salvar". Uma transição só, previsível — seções nascendo a cada tecla fariam a tela pular debaixo
do dedo.

O rodapé fixo com o botão de salvar comunica, sem texto, que dá para parar de preencher a qualquer
momento: ele nasce desabilitado dizendo **o que falta**, e acende no instante da revelação.

Doze regras de exibição condicional garantem que ninguém preencha o que não se aplica ao próprio
caso. As três estruturais estão em RN08, RN09 e RN03.

**B3 (Código de barras).** Câmera com moldura, leitura de EAN e consulta ao catálogo local. Código
não encontrado cai graciosamente no cadastro manual, explicando por que acontece — manipulados,
importados, base desatualizada.

**B4 (Home com dados reais).** A agenda do dia, com estado visual por dose, confirmação e correção
retroativa. As regras RN01, RN02 e RN06 vivem aqui.

**B5 (Estoque).** Tela dedicada com previsão de esgotamento, recontagem e reposição. O cálculo já
existia desde o B2; o que faltava era superfície — o único jeito de mexer no número era reeditando
o cadastro inteiro do remédio, o que é errado porque **repor não é reeditar um tratamento**.

## Fase C — Tempo real

Esta é a fase que define se o aplicativo cumpre a promessa central. Por isso ela **começou por um
spike de viabilidade**, não por código de produção.

### O spike (C1.0)

Cinco perguntas que só o aparelho responde, com prazo fechado de dois dias. A mais importante: **dá
para fazer alarme de tela cheia, estilo despertador?**

**Resposta: não.** O Android 14 restringe `USE_FULL_SCREEN_INTENT` a aplicativos de alarme e
chamada, com exigência de declaração na loja. É restrição de plataforma, não limitação do Expo.

O plano previa três níveis de entrega, e a escolha ficou registrada:

| Nível | O que seria | Situação |
|---|---|---|
| A — Despertador real | Tela cheia, som até desligar | **Descartado** por restrição de plataforma |
| B — Alta prioridade | Heads-up com som, canal que ignora o silencioso, ações rápidas | **Entregue** |
| C — Piso garantido | Notificação padrão | Não foi necessário |

A consequência direta é a RN15: o texto do aplicativo diz "toca alto e vibra, mesmo no silencioso",
e não "como um despertador".

### C1 — Notificações

A estratégia de agendamento é uma **janela deslizante de sete dias**, reagendada a cada abertura.
A razão é de escala: "diário, 3× ao dia, por 6 meses" dá 540 notificações para *uma* prescrição; um
paciente polimedicado passaria de 2.500, o que nenhuma plataforma aceita.

Cada aviso é agendado por **data específica**, e não por repetição, porque a tela de dose precisa
saber exatamente qual dose disparou, e porque "confirmei antes da hora" tem que poder cancelar
aquele aviso específico.

Dez gatilhos obrigam reagendamento — criar, editar, excluir, mudar horário, confirmar antes da
hora, adiar, virar a janela, reiniciar o aparelho, mudar fuso, restaurar da nuvem. A regra que
sustenta todos é a RN14: **nunca editar, sempre reconstruir**.

### C2 — Tela da dose

O destino do toque na notificação. Mostra a dose que disparou em destaque, e as demais pendentes do
dia abaixo — porque quem abre às 8h costuma ter mais de uma coisa a resolver.

É onde vive a RN13: três estados distintos (tomou, pulou, adiou/ignorou) porque são três coisas
distintas no mundo.

### C3 — Agenda clínica

Compromissos com descrição em **texto livre**, e não lista fechada de tipos. A lista real não
fecha — consulta, retorno, exame, coleta, terapia, fisioterapia — e cada opção que falta obriga a
escolher a menos errada.

O calendário é **unificado**: compromissos e doses no mesmo dia, porque é assim que o dia acontece.
Além dos 30 dias gravados, as doses são **projetadas na hora** pela mesma função pura que gera as
reais — sem isso a agenda apareceria vazia a partir do dia 31, o que leria como "não tenho remédio
em outubro".

## Fase D — Confiabilidade

**D1 (Sincronização).** Espelhamento no Supabase com RLS nas nove tabelas, push antes de pull, e
Last-Write-Wins por registro (RN17).

Um cuidado que vale registro: o **texto legal mudou antes do primeiro upload existir**. O texto
anterior afirmava que os dados não saíam do aparelho e prometia consultar de novo antes de qualquer
envio — então o bump para a versão 1.2.0 *é* essa consulta. Subir dado antes disso repetiria
exatamente o problema que corrigi em 24/08, quando três telas prometiam um backup que não existia.

**D2 (Adesão).** Taxa por período e por medicamento, calculada por use-case puro (24 casos
verificados). As regras RN19 e RN20 vivem aqui. A lista de doses perdidas usa cinza, não vermelho —
ver seção 6.4.

**D3 (Direitos do titular).** Exportação em JSON e exclusão que alcança a nuvem primeiro (RN18).

## Fase E — Acabamento

**E1.** Estados vazios, de erro e de carregamento; passe de design; varredura de acessibilidade.

**E2.** Build de desenvolvimento pelo EAS, validação em aparelho físico, verificação das migrações
com dado pré-existente, e credenciais fora do repositório.

**E3.** Material acadêmico — este documento inclusive.

---

# 6. As decisões difíceis

Cinco escolhas em que havia um caminho óbvio e eu segui outro. São as que rendem discussão numa
defesa.

## 6.1 Confirmar dose pela notificação pula a confirmação visual — e permiti mesmo assim

O plano exige confirmação visual explícita para ações críticas. O botão "Tomei" na notificação
grava direto, sem abrir o aplicativo.

**Por que decidi assim:** tocar num botão rotulado "Tomei" já é uma ação deliberada, e fricção
extra num app de adesão é contraproducente — se confirmar custa cinco toques, o paciente para de
confirmar, e o histórico deixa de existir.

**O que torna a decisão aceitável:** a correção retroativa é óbvia e sempre disponível (RN06). O
erro é reversível, e o registro anterior nunca se perde.

## 6.2 O consentimento vem antes da ficha, não depois do login

Seria mais rápido pedir os dados primeiro e o aceite depois. Mas o consentimento é a **base legal**
para tratar o dado; coletar antes de consentir inverte a ordem que a LGPD estabelece.

O usuário pode voltar do consentimento para o login — a escolha de entrada é arrependível.

## 6.3 Recusei a exclusão da conta no provedor de identidade

"Excluir conta" no Mapill apaga os dados e desvincula o titular. **Não** deleta a linha em
`auth.users` do Supabase.

Duas razões. A técnica: exigiria API de administração com chave de serviço, impossível a partir do
cliente e inseguro de embarcar. A conceitual, que é a que importa: **a conta do Google é do
titular, não do Mapill**. O aplicativo não tem legitimidade para encerrar uma identidade que ele
não criou.

A tela diz isso com todas as letras.

## 6.4 A lista de doses perdidas usa cinza, não vermelho

A tela de adesão mostra as doses não tomadas. Pintar cada linha de vermelho seria o óbvio.

**Não fiz.** A lista inteira já é de doses perdidas — colorir cada uma transformaria um registro
clínico numa fileira de repreensões. Quem lê isso sobre a própria semana tende a parar de
registrar, não a parar de esquecer.

O mesmo princípio governa a gamificação: progresso e adesão semanal existem, mas nunca bloqueiam
nada e nunca cobram.

## 6.5 O lembrete de conferir estoque não notifica

Ele aparece **só na tela de estoque**, e não como notificação.

Conferir uma caixa se faz de pé na frente do armário. Um aviso no meio do dia interromperia para
pedir algo que só se resolve em casa — e o que a pessoa faz é dispensar o aviso, o que a treina a
ignorar os avisos do aplicativo. Quem abre a tela de estoque já está pensando nisso.

O corte é de **30 dias**, e não de sete: o erro que ele corrige se acumula devagar, e perguntar
toda semana viraria tarefa doméstica com resposta automática.

---

# 7. Método de trabalho

## 7.1 O plano como documento vivo

O `PLANO-DE-DESENVOLVIMENTO.md` foi criado em 19/08 e atualizado a cada bloco fechado. Ele tem três
partes que se sustentam:

- **Roadmap com "Pronto quando"** — cada bloco declara suas condições de conclusão *antes* de
  começar. Não dá para se convencer depois de que ficou pronto.
- **Log de progresso datado** — toda decisão registrada no dia, com a justificativa. É a
  matéria-prima deste guia.
- **Fila de validação em aparelho** — o que está escrito mas nunca foi executado, separado do que
  já rodou.

Essa terceira parte é o que impediu a confusão entre "implementado" e "funciona". São coisas
diferentes, e a distância entre elas foi medida em defeitos reais.

## 7.2 Verificação sem aparelho

O núcleo clínico é composto de funções puras, então executo Node diretamente sobre elas.

| O que verifiquei | Casos |
|---|---|
| `generate-dose-schedules` — geração de horários | 8 |
| `summarize-treatment` — resumo do tratamento | 8 |
| `adjust-stock` — composição de eventos de estoque | 12 |
| `resumir-adesao` — cálculo de adesão | 24 |
| Sequência de migrações 001 a 015 | 41 |
| Contraste WCAG dos pares reais da interface | 18 |

Verificar a migração antes de liberar era obrigatório: o aplicativo já rodava em aparelho com dados
reais, e uma migração ruim significaria perder histórico clínico de verdade.

## 7.3 Validação em aparelho

Sete rodadas entre 22/08 e 31/08. As mais relevantes:

| Data | O que apurou |
|---|---|
| **22/08** | Login, consentimento, ficha e cadastro validados. Três defeitos que só aparecem em aparelho: foto se sobrescrevendo, teclado cobrindo o campo, cor de aba herdada do sistema |
| **26/08** | Primeira execução completa do roteiro: **37 achados** |
| **27/08** | **36 dos 37 fechados**. Os dois graves eram dado inválido gravado sem erro em tela (a RN10 nasceu aqui) |
| **29/08** | O alarme **não tocou**. Ver seção 7.4 |

## 7.4 O defeito mais instrutivo

Na rodada de 29/08 o alarme chegou **mudo**. A causa foi uma correção que eu mesmo havia feito:
adicionar `sound: "default"` ao canal de notificação.

No Android, o campo **ausente** significa som padrão. Qualquer **string** é tratada como nome de
arquivo — e o arquivo "default" não existe. A correção anterior tinha silenciado o canal.

Duas lições que valem o registro:

1. **A correção precisa ser verificada com o mesmo rigor do defeito.** Eu havia corrigido algo
   "obviamente certo" sem testar.
2. **Canal de notificação no Android fica congelado após criado.** Som e importância não mudam por
   atualização — é por isso que o identificador precisa ser versionado (`dose-alarm-v3`), e por
   isso que o roteiro manda desinstalar antes de reinstalar.

## 7.5 O que a leitura de código achou sem aparelho

Em 31/08, com a cota de builds esgotada, fiz uma varredura de acessibilidade **por leitura de
código**. Seis defeitos reais, o mais grave deles:

**Altura fixa de 52 px no componente de botão.** Com a fonte do sistema ampliada, o rótulo de
**todo botão do aplicativo** era recortado — inclusive o "Confirmar" da dose. E quem amplia a fonte
do Android é exatamente o público deste aplicativo: a acessibilidade quebrava em quem mais depende
dela.

O contraste foi **medido**, não estimado: script sobre os 18 pares texto/fundo reais. Um deles
reprovava por margem de 0,03 — exatamente o tipo de erro que olho nenhum pega, e a razão pela qual
o item pede medição.

---

# 8. Conformidade legal (LGPD)

Dado de saúde é **dado pessoal sensível** (art. 5º, II), com proteção reforçada pelo art. 11. As
decisões de tratamento foram tomadas com isso em vista, e não adaptadas depois.

| Exigência | Artigo | Como o Mapill atende |
|---|---|---|
| Consentimento específico e destacado | art. 11, I | Tela própria antes de qualquer coleta, com o texto integral e aceite explícito |
| Registro do consentimento | art. 8º | Tabela `consent_records` com data, hora e versão do texto |
| Informação sobre finalidade | art. 9º | O texto legal descreve o que é coletado, para quê, e onde fica |
| Revogação | art. 8º, §5º | "Apagar tudo e recomeçar": revogar retira a base legal, então o que resta é apagar |
| Direito de acesso e portabilidade | art. 18, II e V | Exportação em JSON legível e importável |
| Direito de exclusão | art. 18, VI | Exclusão no aparelho **e** na nuvem, com `DELETE` real |
| Minimização | art. 6º, III | Todo campo além do nome é opcional; anexos não sobem |
| Segurança | art. 46 | RLS por usuário no banco; credenciais fora do repositório |

**Três práticas que merecem destaque na defesa:**

1. **O texto legal muda antes da funcionalidade existir.** Quando a sincronização entrou, o bump
   para a versão 1.2.0 veio primeiro — porque o texto anterior prometia consultar o titular antes
   de qualquer envio, e esse bump *é* a consulta.

2. **A exportação inclui o que foi apagado.** Registros com `deleted_at` preenchido entram no
   arquivo: ainda são dados do titular guardados pelo aplicativo, e escondê-los não seria a cópia
   completa que a lei pede.

3. **A exclusão é física, não lógica.** Uma linha marcada como apagada continua sendo dado pessoal
   num servidor. O `deleted_at` serve para a sincronização contar ao outro aparelho que a linha
   morreu — mas o direito de exclusão exige `DELETE`.

---

# 9. Resultados

## 9.1 O que foi construído

| Métrica | Valor |
|---|---|
| Linhas de TypeScript | ~21.200 |
| Telas | 17 |
| Componentes de interface reutilizáveis | 30+ |
| Entidades de domínio | 11 |
| Contratos (ports) | 12 |
| Casos de uso | 13 |
| Migrações de banco | 16 |
| Tabelas sincronizadas com RLS | 9 |
| Registros no catálogo CMED | 6.992 (782 KB) |

## 9.2 Situação dos requisitos

**Os 44 requisitos funcionais estão implementados.** Duas exclusões deliberadas, ambas com motivo
registrado:

- **Anexos no armazenamento em nuvem** — exigiria um segundo bump dos termos, e o reconsentimento
  acontece uma vez só. O texto 1.2.0 declara explicitamente que fotos e receitas **não** sobem.
- **Checklist formal de acessibilidade** — a varredura por código foi feita e corrigiu seis
  defeitos; o teste manual com leitor de tela exige aparelho e ficou para a validação final.

## 9.3 O que a validação já confirmou

Trinta e sete itens validados em aparelho físico entre 22 e 27/08, cobrindo o cadastro completo, a
operação diária, o estoque, o calendário e os direitos do titular.

## 9.4 O que ainda depende de aparelho

Honestidade metodológica: **treze blocos foram escritos entre 29 e 31/08 e não rodaram em
aparelho** — a cota mensal de builds se esgotou. O risco do projeto deixou de ser falta de código e
passou a ser validação concentrada.

O que falta confirmar:

- O alarme tocando com o aplicativo fechado (corrigido após falhar em 29/08)
- Sobrevivência à reinicialização e à economia agressiva de bateria
- A sincronização restaurando dados num segundo aparelho
- O passe de design e a varredura de acessibilidade, que só se validam vendo

---

# 10. Limitações e trabalhos futuros

## 10.1 Limitações declaradas

**iOS não foi verificado.** O código é mantido compilável — quando uma API é de plataforma, escrevo
o irmão `.ios.tsx` —, mas o aplicativo nunca foi construído para iPhone, o que exigiria conta paga
de desenvolvedor Apple. Toda afirmação sobre iOS é hipótese, e não deve ser prometida na defesa.

**Alarme de tela cheia não é possível.** Restrição do Android 14, não do Expo. O aplicativo entrega
o nível B (som alto que ignora o silencioso) e **diz isso** na interface.

**Economia de bateria de fabricante é um risco conhecido.** Xiaomi, Samsung e Motorola são
agressivos com agendamentos em segundo plano. O comportamento precisa ser medido; se matar o
lembrete, a mitigação é orientar o usuário a isentar o aplicativo.

**Anexos permanecem locais.** Foto da ficha, foto da caixa e receita não sobem — e a interface e o
texto legal declaram isso explicitamente, em vez de deixar implícito.

**Nenhum dado clínico sai para serviços de terceiros.** Não há integração com calendário externo,
nem exportação automática para outro aplicativo. O que sai, sai por ação explícita do titular: a
exportação em JSON, pela folha de compartilhamento do sistema, onde é ele quem decide o destino.

**Uma conta é um paciente.** Sem papel de cuidador.

## 10.2 Trabalhos futuros

Organizados por natureza. Todos foram identificados durante o desenvolvimento e **excluídos por
decisão**, não por esquecimento — cada um tem o motivo registrado no plano, na data em que foi
adiado. Essa é a diferença entre um recorte e uma lacuna.

### Integrações

**Agente conversacional com integração à Anvisa.** Consultar bula, interações medicamentosas e
alternativas genéricas por linguagem natural. Era a ideia original da Fase 2, congelada logo no
início para não comprometer o caminho crítico — e o congelamento foi registrado como *regra de
escopo*, não como intenção vaga.

**Exportar compromissos para o Google Agenda.** O encaixe é natural: o Mapill já modela consulta,
exame e terapia como "um ponto no tempo com lembrete", que é exatamente um evento de calendário. E
resolveria um problema real — hoje o compromisso clínico só existe dentro do aplicativo, enquanto a
pessoa organiza a vida no calendário que já usa. A conta do Google já está vinculada, então a
identidade não seria obstáculo.

**Duas ressalvas, e a segunda é a que decide.**

A primeira é de produto: exportar as **doses** seria um erro. Três por dia, todos os dias,
poluiriam o calendário a ponto de a pessoa desligar a integração inteira — e a dose já tem o
mecanismo certo, que é o alarme nativo. Só os compromissos fazem sentido ali.

A segunda é de proteção de dados. Um evento "consulta com cardiologista" é **dado pessoal sensível
saindo do aplicativo para um serviço de terceiro**, fora do controle do titular e do meu. Isso
exigiria escopo OAuth adicional, consentimento **específico** para esse envio — não dá para embutir
no aceite geral, porque a LGPD pede destaque para dado sensível (art. 11, I) — e um novo bump da
versão dos termos.

E aqui está a razão concreta de ter ficado de fora: **o reconsentimento acontece uma vez só**. A
versão 1.2.0 foi gasta para descrever a sincronização, e forçar o titular a reler os termos duas
vezes em semanas seguidas transforma o consentimento informado em ruído — a pessoa passa a aceitar
sem ler, que é o oposto do que a lei pretende.

É a mesma razão pela qual os anexos ficaram fora do armazenamento em nuvem. Vale registrar que o
critério não foi técnico nas duas vezes: foi o custo de gastar a atenção do titular.

**Anexos no armazenamento em nuvem.** Foto da ficha, foto da caixa e receita. Mesmo raciocínio
acima; a receita é o dado mais sensível que o aplicativo guarda.

### Plataforma

**iOS.** O código é mantido compilável, mas exige conta paga de desenvolvedor Apple. Há uma
assimetria já mapeada a tratar: os gatilhos de notificação `DAILY` e `WEEKLY` são do Android, e
`CALENDAR` é exclusivo do iOS — mais um motivo pelo qual o agendamento por data específica foi a
escolha certa, já que é comum às duas plataformas.

**Orientação sobre economia de bateria.** Se a validação confirmar que fabricantes agressivos matam
o agendamento, o aplicativo precisa de uma tela ensinando a isentá-lo — sem isso, o lembrete falha
em silêncio, que é o pior modo de falhar num app de medicação.

### Funcionalidades adiadas com decisão registrada

**Papel de cuidador.** Alguém que acompanha o tratamento de outra pessoa. Foi congelado porque muda
o modelo de permissão inteiro: hoje uma conta é um paciente, e introduzir um segundo papel
significaria repensar autenticação, sincronização e o consentimento — quem consente pelo dado de
quem.

**Relatório em PDF formatado para o médico.** A tela de adesão já cumpre a função em print, e a
exportação em JSON garante a portabilidade que a lei exige. O PDF formatado é apresentação, não
capacidade nova.

**Sininho de notificações pendentes**, com contagem no cabeçalho. Melhoria, não defeito — o que
está pendente já aparece na Home.

**Botão `+` central na barra de navegação.** Adiado por uma razão técnica específica: as abas usam
`NativeTabs`, que não aceita item central, e trocar por uma barra própria devolveria um problema de
tema do Material You que já havia sido resolvido. O acesso ao cadastro existe em todas as abas que
listam algo.

**Tela de conquistas e medalhas.** Descartada por princípio, não por prazo: a gamificação do
aplicativo é deliberadamente discreta (progresso do dia e adesão semanal), e um sistema de
recompensas empurraria na direção contrária à decisão registrada em 6.4 — não transformar registro
clínico em julgamento.

### Verificação

**Teste automatizado de interface.** Hoje a verificação automatizada cobre o domínio — funções
puras executadas em Node — e a interface é validada manualmente por roteiro. Automatizar os fluxos
críticos (cadastrar, confirmar dose, corrigir) reduziria o custo de cada rodada de validação.

**Teste com leitor de tela.** A varredura de acessibilidade de 31/08 foi feita por leitura de
código e corrigiu seis defeitos, mas percorrer os fluxos críticos com o TalkBack ligado exige
aparelho e continua pendente.

---

# 11. Mapa: argumento → código

Para o Capítulo 4, ligando cada afirmação do trabalho ao lugar onde ela se verifica.

| Argumento | Onde se verifica |
|---|---|
| Arquitetura limpa com inversão de dependência | `src/domain/ports/` — 12 contratos que o domínio declara e a infraestrutura cumpre |
| Domínio isolado e testável | `src/domain/use-cases/` — 13 funções puras, tempo injetado |
| Offline-first sem exceção | Seção 6.3 do plano: tabela operação por operação |
| Modelagem clínica fiel | `medication.ts` + `prescription.ts` + `dose-schedule.ts` — nove formas, quatro frequências, dose por ocorrência |
| Histórico auditável | `correct-intake.ts` — correção cria log novo, nunca sobrescreve |
| Confiabilidade do lembrete | `src/notifications/` — agendamento pelo sistema, sobrevive ao fechamento |
| Separação entre decisão e execução | `planejar-avisos-de-dose.ts` (puro) decide; `expo-notification-gateway.ts` executa |
| Consistência eventual e LWW | `sync-service.ts` — push antes de pull, resolução por `updated_at` |
| Isolamento de dados por usuário | `docs/supabase-schema.sql` — RLS com `with check` em nove tabelas |
| Conformidade LGPD | `texto-legal.ts` (versionado), `local-data-repository.ts` (exclusão física) |
| Prevenção de erro (Nielsen) | Regras condicionais do cadastro; RN08 e RN10 |
| Reconhecimento em vez de recordação | Catálogo CMED com sugestão por nome; leitura de código de barras |
| Acessibilidade | Varredura de 31/08: alturas mínimas, alvos de 44 pt, contraste medido |
| Integridade de dados na evolução | 16 migrações aditivas, verificadas contra banco com dado pré-existente |

---

> **Nota final sobre este documento.** Ele foi escrito a partir do log de progresso do plano de
> desenvolvimento, que registrou cada decisão no dia em que foi tomada. Não é uma racionalização
> construída depois: as datas, as alternativas descartadas e os defeitos encontrados estão
> registrados como aconteceram — inclusive os que foram causados por correções minhas anteriores.
>
> É essa rastreabilidade que sustenta o Capítulo 4.
