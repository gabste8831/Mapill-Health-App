# Base técnica para o artigo — Mapill

Material de apoio para o capítulo técnico. Seis temas levantados do código, cada um
estruturado em quatro momentos: **problema → alternativas descartadas → solução (com trecho)
→ o que sustenta**.

Não é texto pronto para o artigo. É insumo: os fatos estão verificados no código, as
citações conferidas linha a linha, e o recorte de cada trecho já está marcado.

**Convenção de referência:** os caminhos são relativos à raiz do repositório. Números de
linha conferidos no commit `d3f3b23`.

---

## Sumário e recorte sugerido

| # | Tema | Peso sugerido | Sustenta |
|---|---|---|---|
| 1 | Alarme com tela bloqueada | Seção inteira | Confiabilidade, ciclo de vida Android, requisitos de plataforma |
| 2 | Sincronização offline-first | Seção inteira | Offline-first, eventual consistency, LWW, ACID |
| 3 | Config plugins nativos | Parágrafo dentro do tema 1 | Pipeline de build, falha-rápido, hipótese refutada |
| 4 | Regra pura e testabilidade | Meia página | Clean Architecture, inversão de dependência, testabilidade |
| 5 | CMED / dado público | Se sobrar espaço | Fonte de dados pública, integridade de entrada |
| 6 | Migrations versionadas | Se sobrar espaço | ACID, versionamento de esquema |

**Recomendação:** 1 e 2 em profundidade, 4 curto como ilustração de arquitetura, 3 como
parágrafo dentro de 1. Cobre o referencial inteiro sem virar catálogo.

**Sobreposições a evitar:** o tema 3 é subordinado ao 1 — não rende seção própria. Os temas
2 e 6 dividem o eixo ACID: se usar os dois, deixe 2 com consistência distribuída e 6 com
transação local.

---

# Tema 1 — O alarme com a tela bloqueada

> O mais forte dos seis, e o único que atravessa todas as camadas: JS → config plugin →
> Kotlin → Android.

## Momento 1 — O problema

Um app de medicação tem uma exigência que um app comum não tem: **o alarme precisa aparecer
mesmo com o celular bloqueado**, porque é justamente aí que a pessoa está dormindo e a dose
vence. Mas isso cria um conflito com privacidade: se responder a dose deixa o app acessível
por cima do bloqueio, os dados de saúde ficam expostos a quem pegar o aparelho.

Três defeitos concretos, observados em aparelho:

1. O alarme não tocava com o celular em uso — o Android rebaixava a tela cheia e não emitia som.
2. O alarme tocava no **volume de mídia**, não no de despertador.
3. Responder a dose com o celular bloqueado **revelava o app**.

## Momento 2 — Alternativas descartadas

| Alternativa | Por que caiu |
|---|---|
| Som pelo canal da notificação | O `AudioAttributes` do canal pede `USAGE_ALARM`, e o Android trata como **dica, não ordem** |
| `BackHandler.exitApp()` para fechar | Encerra o processo inteiro — derruba o app aberto atrás e o serviço que toca o som |
| Player preso ao ciclo de vida da tela | A tela do alarme nem sempre monta; o som emudeceria nos casos em que o alarme mais importa |
| Reimpor o bloqueio ao sair | **O Android não expõe API de re-bloqueio para app nenhum** (ver nota no Kotlin) |

A quarta linha é a mais interessante para o artigo: é uma limitação de plataforma
documentada no código, com data de tentativa. Vale citar como exemplo de restrição não
contornável.

## Momento 3 — A solução

A solução tem três níveis. Sugiro citar **um trecho de cada** para mostrar a travessia de
camadas.

### 3.1 — Nível JS: trava de concorrência

`src/notifications/alarme-em-cena.ts` (77 linhas)

A tela tem dois pontos de entrada — a Activity do `fullScreenAction` e a rota
`/alarme/[instante]` — e os dois vivem no mesmo processo JS, então um alarme em segundo
plano dispara ambos. A Activity tem precedência; a rota cede lugar.

**Trecho para citar (o mais denso do arquivo):**

```ts
/**
 * Se já há tela na frente para este horário, ou uma Activity a caminho.
 *
 * Errar para "sim" custa um toque ignorado enquanto a tela sobe; errar para "não" custa a
 * tela inteira. A resposta cega vale só até a Activity se registrar.
 */
export function jaEstaEmCena(scheduledFor: string): boolean {
  if (activityNascendo && !activityConhecida) return true;
  return emCena.has(scheduledFor);
}
```

**Por que é relevante:** é uma **decisão assimétrica de custo de erro** — o tipo de raciocínio
que distingue engenharia de codificação. O código não busca a resposta correta, busca a
resposta cujo erro é mais barato. Rende parágrafo próprio.

Vale mencionar junto que o estado é de módulo (`const emCena = new Map<...>()`), e o porquê
está no cabeçalho: *"os dois lados não compartilham árvore de componentes"* — ou seja, o
estado do React não alcança o problema.

### 3.2 — Nível nativo: fechar sem matar o processo

`modules/desbloqueio/android/src/main/java/br/com/mapill/desbloqueio/DesbloqueioModule.kt`

```kotlin
AsyncFunction("fecharTelaDoAlarme") {
  val activity = appContext.currentActivity ?: return@AsyncFunction false
  activity.runOnUiThread { activity.finishAndRemoveTask() }
  return@AsyncFunction true
}
```

**Por que é relevante:** quatro linhas de código com um parágrafo de justificativa. A tela do
alarme vive em Activity própria, em task própria (`launchMode=singleInstance`).
`finishAndRemoveTask` fecha a task e **devolve o aparelho ao que estava antes** — o bloqueio,
se era dali que a tela veio. É o que faz "Tomei" com o celular bloqueado não revelar o app,
junto com o `showWhenLocked` ter saído da `MainActivity`.

**Nota de honestidade técnica** (forte para a banca): o mesmo arquivo documenta uma função
que **não existe** e o motivo:

> *"**Não existe função para reimpor o bloqueio**, e isto é uma nota para quem vier
> procurá-la. [...] quando a Activity sobe com `showWhenLocked` e `turnScreenOn`, o Android
> **já dispensou o keyguard** para ela, e remover a task depois não desfaz isso. O Android
> não expõe API de re-bloqueio para app nenhum."*

### 3.3 — Nível de áudio: quem toca é o app

`src/notifications/som-do-alarme.ts` (94 linhas)

A decisão central: **o app toca o som, não o sistema**. O canal do alarme fica mudo de
propósito (`sound: undefined` em `canais-notifee.ts:74`).

```ts
/**
 * Rede de segurança do loop.
 *
 * `loop` é resolvido do lado nativo e funciona, mas um alarme de medicação não pode depender
 * de uma garantia só: com o foco de áudio disputado por outro app, o player pausa sem sinal
 * nenhum e a pessoa continua dormindo.
 */
let vigia: ReturnType<typeof setInterval> | null = null;
```

**Por que é relevante:** *"não pode depender de uma garantia só"* é um princípio de
**redundância em sistema crítico**, aplicado numa decisão pequena e concreta. Conecta com
confiabilidade sem precisar de citação teórica forçada.

O player roda dentro de um **foreground service** porque a tela nem sempre monta — e isso é
o que os requisitos do Google Play para apps de alarme descrevem.

## Momento 4 — O que sustenta

- **Confiabilidade em sistema crítico** — redundância do loop, serviço desacoplado da UI.
- **Ciclo de vida do Android** — Activity, task, `launchMode`, keyguard.
- **Requisitos de plataforma** — política do Google Play para apps de alarme.
- **Decisão sob custo assimétrico de erro** — o `jaEstaEmCena`.

---

# Tema 2 — Sincronização offline-first

> O maior arquivo de lógica do projeto: `src/data/remote/sync-service.ts`, 411 linhas.
> É o que encaixa mais direto com o referencial (eventual consistency, ACID).

## Momento 1 — O problema

O app precisa funcionar **sem rede** — quem toma remédio não deixa de tomar porque o Wi-Fi
caiu. Mas o dado também precisa chegar ao servidor, e o mesmo registro pode ser editado em
dois lugares antes de qualquer sincronização acontecer. Quando os dois lados se encontram,
alguém tem de decidir quem vence.

## Momento 2 — Alternativas descartadas

| Alternativa | Por que caiu |
|---|---|
| Merge por campo | Poderia produzir **"uma posologia que ninguém escreveu"** — combinação de dois estados válidos resultando num terceiro inválido |
| CRDT | Complexidade desproporcional ao caso de uso (um usuário, poucos dispositivos) |
| Servidor sempre vence | Descartaria edição feita offline, que é o cenário principal |

A primeira linha é a mais citável: num app de medicação, **merge silencioso é risco clínico**.
A escolha por "tudo-ou-nada" não é preguiça, é segurança.

## Momento 3 — A solução: LWW tudo-ou-nada por registro

**Trecho central para citar** — `sync-service.ts`, função `receber`:

```ts
const local = await database.getFirstAsync<{ updated_at: string }>(
  `SELECT updated_at FROM ${tabela} WHERE id = ?`,
  [id],
);

// LWW por `updated_at`, tudo-ou-nada por registro: local igual ou mais novo vence. Sem merge
// de campos, que poderia produzir uma posologia que ninguém escreveu. O empate fica com o local
// porque empate só acontece quando os dois lados já têm a mesma coisa.
if (local !== null && local.updated_at >= remotaUpdatedAt) {
  // ...
  continue;
}
```

**Por que é relevante:** o algoritmo está **nomeado no código** (LWW), com a granularidade
declarada (por registro, não por campo) e o critério de desempate justificado. É raro achar
isso explícito — normalmente a política de conflito é implícita e só descoberta quando dá
errado.

### Mecanismos de apoio (mencionar, sem trecho longo)

**Marca d'água por tabela** — o pull só busca o que mudou desde a última vez:

```ts
let consulta = supabase!.from(tabela).select("*").order("updated_at", { ascending: true });
if (desde !== null) consulta = consulta.gt("updated_at", desde);
```

A marca vive em `sync_state`, **tabela do banco e não `AsyncStorage`** — porque precisa sumir
junto no "apagar tudo", senão o app acha que já baixou dados que não tem mais. Boa
ilustração de coerência transacional.

**Quebra do vaivém infinito** — uma linha com comentário que vale citar:

```ts
// Veio do servidor, logo já está sincronizada: sem isto, o próximo push a devolveria de volta
// num vaivém infinito.
linha.synced_at = remotaUpdatedAt;
```

**Lotes de 200** — `const TAMANHO_DO_LOTE = 200;` com o porquê: *"para que uma linha ruim
derrube só o lote, e não a sincronização inicial inteira"*. Isolamento de falha.

**Conversão na borda** — o SQLite aceita `""` numa coluna de data; o Postgres recusa o lote
inteiro com `invalid input syntax for type date: ""`. A conversão fica na fronteira porque o
`""` nasce na apresentação e atravessa o app. Exemplo concreto de **impedância entre dois
SGBDs**.

**Push seletivo** — o critério do que sobe:

```sql
SELECT * FROM ${tabela} WHERE synced_at IS NULL OR updated_at > synced_at
```

## Momento 4 — O que sustenta

- **Offline-first** — o local é a fonte de verdade; a nuvem é espelho.
- **Eventual consistency** — convergência por LWW, sem coordenação síncrona.
- **ACID** — no lado local, e o contraste com a consistência eventual do lado distribuído.
- **Impedância entre SGBDs** — SQLite × PostgreSQL, tipagem de data e booleano.

---

# Tema 3 — Config plugins nativos

> Subordinado ao tema 1. Vira parágrafo, não seção.

## O que é

Cinco config plugins que modificam o projeto Android na prebuild, porque o Expo não expõe o
que o alarme precisava:

```
plugins/activity-propria-do-alarme.js
plugins/alarme-em-tela-cheia.js
plugins/som-do-alarme-em-despertador.js
plugins/tela-do-alarme-na-main-activity.js
plugins/volume-de-despertador.js
```

Mais `scripts/aplicar-patches.js` e `scripts/conferir-patches.js`.

## Por que é relevante: falha-rápido no pipeline

`conferir-patches.js` **lança erro e derruba a build** se não encontrar o alvo do patch
(linha 82). Roda em `npm run android` e em `eas-build-post-install`. O argumento: um patch
que silenciosamente não aplica é pior que patch nenhum — o app compila e o alarme falha em
produção.

## O achado mais valioso: uma hipótese refutada por medição

`plugins/volume-de-despertador.js` abre com um aviso em que o autor **documenta o próprio
erro**:

> *"⚠️ **ESTE PLUGIN NÃO ALCANÇA O QUE PROMETE — e o motivo está medido, não suposto.**
>
> Ele aplica corretamente (verificado em 13/09 rodando `expo prebuild`: o `ChannelManager.java`
> sai transformado, `USAGE_NOTIFICATION` vira `USAGE_ALARM`), e **mesmo assim o alarme toca no
> volume de mídia**. Duas builds foram gastas confirmando isso.
>
> A razão é que **quem toca o som da notificação é o NotificationManager, não o app**, e ele
> usa o stream dele independentemente do que o `AudioAttributes` do canal peça — ali o atributo
> é dica, não ordem. Não é limitação do Notifee: a issue #297, pedindo exatamente isto, foi
> fechada como *not planned*."*

**Por que isso é ouro num TCC:** é método científico aplicado à engenharia — hipótese,
experimento (duas builds), medição, refutação, e a conclusão anterior mantida no texto e
marcada como superada. Além disso há **evidência externa** (issue upstream fechada como *not
planned*), que é o que transforma "não consegui" em "não é possível por este caminho".

O plugin continua no repositório porque *"não custa nada e passa a valer no dia em que o
Android tratar o atributo como ordem"* — decisão de manutenção justificada.

## O que sustenta

- **Pipeline de build e falha-rápido.**
- **Método experimental** — hipótese refutada por medição, com evidência externa.
- **Limitação de plataforma documentada**, em vez de contornada por gambiarra.

---

# Tema 4 — Regra pura e testabilidade

> Curto. Meia página. É o melhor exemplo pequeno de Clean Architecture do projeto.

## Momento 1 — O problema

O toque numa notificação de estoque, receita ou compromisso abria a **Home**, e a pessoa
tinha de reencontrar sozinha o assunto que a notificação acabara de nomear — pior justamente
no caso que o aviso existe para cobrir: quem abriu o celular por causa dele e não estava no
app.

## Momento 2 — Alternativas descartadas

Gravar um campo de destino em cada aviso. Caiu porque *"um campo a mais é mais uma coisa que
pode divergir do que o planejador escreveu"* — a chave do aviso **já carrega** tipo e id.

## Momento 3 — A solução

`src/notifications/destino-do-aviso.ts` (59 linhas)

O cabeçalho do arquivo **já enuncia a tese** — é a melhor citação de arquitetura do projeto:

> *"Mora em arquivo próprio, separado de `escutar-avisos`, porque é **regra pura**: não toca
> no Notifee nem em navegação, e é isso que permite verificá-la em Node
> (`scripts/conferir-destino-do-aviso.mjs`). O listener importa daqui."*

**Trecho de código:**

```ts
export type DestinoDoAviso =
  | { tela: "estoque" }
  | { tela: "medicamento"; prescriptionId: string }
  | { tela: "compromissos"; appointmentId: string };

export function destinoDaChave(chave: string): DestinoDoAviso | null {
  if (chave.startsWith("estoque-")) {
    return { tela: "estoque" };
  }
  if (chave.startsWith("receita-")) {
    const prescriptionId = chave.slice("receita-".length).replace(SUFIXOS, "");
    if (prescriptionId.length === 0) return null;
    return { tela: "medicamento", prescriptionId };
  }
  // ...
  return null;
}
```

**Detalhe que rende nota de rodapé** — o regex dos sufixos:

```ts
const SUFIXOS = /-(baixo|acabou|antes|no-dia)$/;
```

Removidos por **âncora de fim**, e não cortando no primeiro hífen: os ids são UUID e têm
hífen dentro, então `split("-")` devolveria `3f2504e0` no lugar do id inteiro. Exemplo
pequeno e verificável de erro evitado por conhecer o formato do dado.

## A contrapartida: 16 scripts de verificação

A regra pura se paga porque permite verificação **sem emulador, sem React, sem SQLite**:

```
conferir-adesao-por-dia      conferir-alarme-em-cena       conferir-avisos-de-compromisso
conferir-avisos-de-estoque   conferir-compromissos-na-home conferir-cores-de-estado
conferir-destino-do-aviso    conferir-edicao-em-cadeia     conferir-ids-de-aviso
conferir-json-da-sync        conferir-previsao-de-estoque  conferir-reagendamento
conferir-relatorio           conferir-resumo-de-adesao     conferir-rotulos-cmed
conferir-schemas
```

O argumento para o artigo: a separação de camadas **não é ornamento arquitetural**, é o que
torna 16 regras de negócio verificáveis em Node puro, em segundos, sem subir o app.

## Momento 4 — O que sustenta

- **Clean Architecture** — regra de negócio sem dependência de framework.
- **Inversão de dependência** — o listener importa da regra, não o contrário.
- **Testabilidade como consequência da arquitetura**, não como esforço adicional.

---

# Tema 5 — CMED e dado público

> Se sobrar espaço. Rende se o capítulo tiver seção sobre fonte de dados.

**Arquivos:** `src/data/local/importar-cmed.ts` (150 linhas),
`src/shared/rotulos-de-medicamento.ts` (236 linhas).

**O problema:** digitar nome de remédio à mão erra — e erro de nome em app de medicação tem
consequência.

**A solução:** importação da tabela CMED (Câmara de Regulação do Mercado de Medicamentos),
dado público do governo, com leitura por código de barras da caixa.

**Ganchos:** fonte de dados pública e oficial, integridade de entrada, redução de erro por
digitação. Conecta com LGPD se o capítulo tocar nisso — o dado do medicamento é público, o
dado de uso é local.

---

# Tema 6 — Migrations versionadas

> Se sobrar espaço. O mais genérico dos seis.

**Arquivos:** `src/data/local/migrations/` — 21 migrations versionadas, com runner em
`index.ts` e transação.

**O problema:** o banco no aparelho de quem já usa o app não pode ser recriado a cada versão.

**Ganchos:** ACID (transação por migration), versionamento de esquema, evolução sem perda de
dado.

**Cuidado:** divide o eixo ACID com o tema 2. Se usar os dois, deixe este com **transação
local** e o tema 2 com **consistência distribuída**.

---

# Notas de uso

**Sobre os comentários no código.** Boa parte do valor citável está nos comentários, que
explicam *por quê* e não *o quê*. Ao citar, vale preservá-los — são o que mostra raciocínio.

**Atenção à acentuação.** A refatoração de comentários removeu acentos em parte do código:
605 linhas sem acento contra 2.279 com acento, e 77 arquivos misturam as duas grafias. Ao
copiar trechos para o artigo, **normalize a acentuação** — neste documento os trechos já
estão com acentuação corrigida.

**Trechos longos.** Se for citar arquivo inteiro, `alarme-em-cena.ts` (77 linhas) e
`destino-do-aviso.ts` (59 linhas) são os únicos que cabem em apêndice sem corte.

**Verificação.** Todos os trechos foram conferidos no commit `d3f3b23`. Os números de linha
podem mudar se o código for editado depois.
