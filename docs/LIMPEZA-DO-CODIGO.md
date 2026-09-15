# Limpeza do código — o mapa

> Levantamento de 15/09, feito **sem editar nada**. Serve para decidir o que sai, o que fica e o
> que muda de lugar, depois que a build de 15/09 for validada em aparelho.
>
> A ordem aqui é a ordem de fazer: do risco zero ao que exige critério.

---

## O resumo em duas linhas

**Código morto: pouco** — cerca de 100 linhas em todo o projeto, e `src/notifications/` está limpo.

**Comentário: muito** — 2.131 linhas de prosa para 1.422 de código nos arquivos do alarme. O peso
não vem de implementação abandonada; vem da narrativa da investigação escrita dentro do código.

---

## Onde a prosa está

Dez arquivos do alarme, 3.553 linhas, **60% comentário**.

| Arquivo | Linhas | Comentário | % |
|---|---:|---:|---:|
| `src/notifications/alarme-em-cena.ts` | 264 | 218 | **82,6%** |
| `src/domain/ports/notification-gateway.ts` | 122 | 94 | **77,0%** |
| `src/notifications/escutar-avisos.ts` | 495 | 315 | 63,6% |
| `src/notifications/canais-notifee.ts` | 272 | 173 | 63,6% |
| `src/hooks/use-dose-notifications.ts` | 286 | 179 | 62,6% |
| `plugins/tela-do-alarme-na-main-activity.js` | 318 | 197 | 61,9% |
| `src/notifications/notifee-gateway.ts` | 559 | 324 | 58,0% |
| `src/telas/Alarme/AlarmeScreen.tsx` | 825 | 428 | 51,9% |
| `src/telas/Alarme/AlarmeRaiz.tsx` | 223 | 115 | 51,6% |
| `src/hooks/use-doses-do-alarme.ts` | 189 | 88 | 46,6% |

O caso que resume tudo: `alarme-em-cena.ts` tem **46 linhas de código e 218 de prosa**, e em
`alarme-em-cena.ts:41` há **43 linhas de comentário para uma variável booleana**
(`let activityNascendo = false`), com três subtítulos em Markdown.

### O que a prosa contém

- **83 linhas citam datas de teste** — 12/09 (17), 14/09 (15), 10/09 (11), 09/09 (10), 15/09 (8),
  13/09 (7), e outras
- **3 citam hash de commit** — `46eee55`, `8336aec`, `83135de`
- **13 narram o que "o Gabriel relatou/decidiu"**
- **4 falam em primeira pessoa** — "eu a removi", "a hipótese que eu perseguia"
- **23 seções com subtítulo Markdown** (`##`) dentro de JSDoc — estrutura de documento, não de
  comentário
- **3 blocos de logcat colados**, com timestamps
- **5 comentários que corrigem outros comentários** — errata empilhada
- **6 referências a arquivo-fonte de terceiro com linha exata** (`NotificationManager.java:418`),
  que quebram no primeiro upgrade da biblioteca

---

## 1. Os comentários que mentem — fazer primeiro

**Não é questão de estilo: é comentário que descreve um código que não existe mais.** Quem ler vai
entender o sistema errado, e o artigo se apoia nessa leitura.

### 1.1 `loopSound` — três camadas de errata

`src/notifications/notifee-gateway.ts:357` descreve em 17 linhas o `loopSound`, **que saiu do
código**. O JSDoc imediatamente abaixo (`:374`) abre dizendo "`loopSound` saiu junto com o som do
canal". Dois blocos consecutivos, sem código entre eles, um afirmando e o outro negando a mesma
coisa — e o de cima já era a correção de um comentário anterior.

Ecoa em mais três lugares, todos tratando `loopSound` como mecanismo vivo:
`escutar-avisos.ts:305`, `use-dose-notifications.ts:213`, `AlarmeScreen.tsx:140`.

### 1.2 O modelo de áudio antigo

`src/telas/Alarme/AlarmeScreen.tsx:171` afirma que o player é criado dentro do efeito com
`createAudioPlayer`. **Falso** — o efeito em `:184` só chama `comecarASoar()`, e quem toca é o
serviço em primeiro plano. Os próprios comentários de `:187` e `:200`, trinta linhas abaixo, dizem
o contrário.

Mesmo resto em `AlarmeScreen.tsx:408` ("o player é criado e destruído pelo efeito do áudio").

### 1.3 "Carrega uma vez" num hook que recarrega a cada 3 s

`src/hooks/use-doses-do-alarme.ts:56` afirma "este carrega uma vez, na montagem" e "a tela abre, é
respondida e fecha". O efeito em `:158` roda `setInterval(carregar, 3_000)`, e o comentário de
`:144` documenta exatamente isso. Contradição a 88 linhas de distância, no mesmo arquivo.

### 1.4 Comentário descrevendo guarda que não existe

`src/hooks/use-dose-notifications.ts:249` descreve uma checagem de `AppState` que **não está no
código** — a linha seguinte é `abrirTelaDeAlarme(scheduledFor)`, sem guarda alguma. E encerra com
"a distinção não é perfeita — ela erra para o lado de abrir a tela", que é a frase que o bloco de
`:227` cita como **superada** ("Agora não é heurística"). O comentário refutado continua no arquivo,
vinte linhas abaixo da refutação.

### 1.5 Bloco duplicado no lugar errado

`src/hooks/use-dose-notifications.ts:145` é cópia quase literal de `:120` — mesmas duas frases,
mesma citação "10/09, passo 14.5.2" — colada sobre `aoDispararAlarme`, que **não chama `navigate`**.
Quem chama é `abrirTelaDeAlarme`, já documentada em `:120`.

### 1.6 Outros

| Onde | O quê |
|---|---|
| `AlarmeRaiz.tsx:61` | JSDoc órfão (não precede declaração), diz que `getInitialNotification` "é o único caminho" — há quatro |
| `AlarmeRaiz.tsx:157` | "Última saída: o horário atual" colado em `:159`, que diz o oposto |
| `AlarmeScreen.tsx:334` | Bloco deslocado: descreve o efeito de `:403` |
| `AlarmeScreen.tsx:592` | Fala em 48dp; `:20` diz 44dp |
| `alarme-em-cena.ts:31` | "isso não acontece na prática" — contradito pelo caminho tardio em `use-dose-notifications.ts:222` |
| `canais-notifee.ts:29-51` | Changelog do v4 ao v7 e "o alarme sai no volume de mídia, e isso é limitação conhecida" — o v8 resolveu |
| `canais-notifee.ts:59` | "O alarme usa o arquivo próprio" contradiz `:141` ("Mudo de propósito") |
| `escutar-avisos.ts:387` | Abre narrando comportamento removido (`/alarme/[instante]`) |

---

## 2. O código morto — risco zero

| O que | Onde | Tamanho |
|---|---|---|
| Tela sem uso | `src/telas/EmConstrucao/` (2 arquivos) | 54 linhas |
| Hook sem uso | `src/hooks/use-reduzir-movimento.ts` | arquivo inteiro |
| Barrel que ninguém importa | `src/domain/entities/index.ts` | 8 linhas |
| `export` supérfluo | `notifee-gateway.ts:67` e `:76` | 2 palavras |

**`src/notifications/` está limpo.** Todos os 30+ exports têm consumidor real — `jaEstaEmCena` tem
10 usos, `dispensarAlarmeAtivo` 12, `reagendarTodosOsAvisos` 32.

Tipos exportados sem uso externo (14, quase todos em `src/hooks/`): são `export type` que só servem
dentro do próprio arquivo. Remoção cosmética, sem efeito em runtime.

---

## 3. O que exige critério

### 3.1 A prosa histórica — migrar, não apagar

As 83 linhas com data, os 3 hashes e os 23 subtítulos são história do processo. Mas **parte do que
elas guardam é conhecimento real e caro**, e boa parte já é praticamente texto de artigo:

- o `postSticky` acontecer no *display* da notificação, e não no toque
  (`plugins/tela-do-alarme-na-main-activity.js`)
- a armadilha do `sound` ausente criar canal **mudo**, e não "som padrão" (`canais-notifee.ts:177`)
- `SET_ALARM_CLOCK` vencer `SET_EXACT_AND_ALLOW_WHILE_IDLE` no teste em aparelho
  (`notifee-gateway.ts:271`)
- o `foregroundServiceBehavior` que a ponte do Notifee perde por ler `Double` com `getInt()`
  (`notifee-gateway.ts:390`)
- o `ACCESS_NOTIFICATION_POLICY` sem o qual o `bypassDnd` é ignorado em silêncio
  (`canais-notifee.ts:157`)

**Proposta:** esse conteúdo sai do código e vai para `ROTEIRO-DE-TESTE.md` ou para um documento de
decisões técnicas. No código fica o porquê enxuto, com ponteiro para o documento. Preserva o que
serve ao TCC e o código deixa de ser diário.

### 3.2 A duplicação dos dois hooks

`use-doses-do-alarme.ts` (189 linhas) e `use-doses-do-horario.ts` (147) compartilham **86 linhas
idênticas** — o miolo de carregamento é byte a byte igual: mesmas 4 consultas em `Promise.all`,
mesmos 3 `Map`, mesmo loop, mesmo `sort`.

A duplicação **é justificada** e está documentada: a tela de alarme vive fora do roteador, onde
`useFocusEffect` não dispara. O que difere de verdade:

| | `use-doses-do-horario` | `use-doses-do-alarme` |
|---|---|---|
| Recarga | `useFocusEffect` | `useEffect` + `setInterval(3 s)` + anúncio |
| Guarda de web | tem | não tem |
| Estado de erro | tem | **não tem** (deliberado) |
| Campo extra | — | `snoozeCount` |
| Pós-registro | recarrega **e** reagenda | só recarrega |

Dá para extrair o miolo sem tocar na diferença que importa. **Mas é refatoração de código que
funciona** — só depois de tudo validado, e em commit próprio.

### 3.3 Dependências possivelmente órfãs

Sem import e sem entrada em `app.json`: `expo-status-bar`, `expo-symbols`, `expo-system-ui`,
`expo-glass-effect`, `expo-device`, `expo-linking`, `react-native-url-polyfill`.

**Conferir uma a uma antes de remover** — algumas podem ser exigidas indiretamente pelo Expo, e
errar aqui quebra a build.

### 3.4 Um risco silencioso

`scripts/conferir-ids-de-aviso.mjs:22` **copiou** `PREFIXO_ALARME` em vez de importar de
`notifee-gateway.ts:76`. Se o prefixo mudar no código, o script segue conferindo o valor antigo —
e passando. Vale importar de verdade.

### 3.5 Scripts sem dono

Dos 26 scripts em `scripts/`, 7 não são referenciados nem pelo `package.json` nem por documento
nenhum: `conferir-alarme-em-cena`, `conferir-avisos-de-compromisso`, `conferir-avisos-de-estoque`,
`conferir-destino-do-aviso`, `conferir-json-da-sync`, `conferir-resumo-de-adesao`,
`gerar-som-de-alarme`.

Outros 12 são citados só em prosa de `docs/`. Não são morte certa — são verificações manuais que
podem voltar a servir. Decidir caso a caso.

---

## A ordem sugerida

1. **Os comentários que mentem** (seção 1) — antes de qualquer coisa, porque é o que induz a erro
2. **O código morto** (seção 2) — risco zero, ~100 linhas
3. **A migração da prosa** (3.1) — com o conteúdo preservado em documento
4. **O resto** (3.2 a 3.5) — cada um em commit próprio, depois de tudo validado

> **Nada disso antes da validação da build de 15/09 em aparelho.** Limpar antes de saber o que de
> fato funciona confunde as duas coisas: se algo falhar, não se sabe se foi a correção ou a
> limpeza.
