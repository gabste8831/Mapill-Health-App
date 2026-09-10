# Roteiro para a seção de Desenvolvimento

> Companion de `EMBASAMENTO-TECNICO.md`. Aquele traz a **evidência levantada do código**; este é
> **proposta de estrutura** para a seção principal do artigo. Use como roteiro, não como texto pronto.
>
> As referências `§x` apontam para seções do documento de embasamento.

---

## 1. A decisão estrutural, antes de tudo

### 1.1 Por que NÃO dividir por funcionalidade

O instinto natural é uma subseção por módulo: estoque, cadastro, notificações, acessibilidade. É a
estrutura mais comum em TCC e é a que produz os textos mais fracos, por um motivo:

**Uma seção por tela vira manual do usuário.** "A tela de estoque permite cadastrar itens, definir
quantidade mínima e receber alertas" descreve *o quê*. O *quê* é documentação de produto, não
contribuição científica. A banca lê e pergunta: *"e o que disso foi difícil?"* — se a resposta não
estiver no texto, a seção não trabalhou.

Há um segundo problema, prático: dividido por funcionalidade, o texto **repete a mesma infraestrutura
em cada subseção**. Offline-first aparece no estoque, de novo no cadastro, de novo nas consultas. O
leitor lê três vezes e não entende nenhuma, porque nunca foi explicada em um lugar só.

### 1.2 O que estrutura um artigo: decisão sob restrição

O que distingue artigo de manual é mostrar **decisão sob restrição**. Você tem isso em abundância —
está espalhado nos comentários do código em vez de organizado no texto.

**A anatomia que recomendo para cada subseção:**

> **1. problema concreto** → **2. alternativas consideradas** → **3. decisão e critério** →
> **4. evidência (código ou figura)** → **5. o que custou**

O item 5 é o que quase ninguém escreve, e é o que mais convence. Decisão sem custo declarado parece
propaganda; com o custo declarado, parece engenharia. Exemplo real seu: *"o app respeita a escala de
fonte do sistema integralmente — o custo é que todo layout precisa aguentar o tamanho máximo, e é por
isso que existe um bloco de teste inteiro dedicado a isso"*.

### 1.3 A estrutura recomendada: híbrida, em três camadas

Nem só por funcionalidade, nem só por decisão. A ordem que funciona:

| | Camada | O que entra | Extensão sugerida |
|---|---|---|---|
| **A** | **Visão geral** | Arquitetura, stack, modelo de dados. Contexto para tudo que vem depois. | ~20% |
| **B** | **Decisões de projeto** | As escolhas não-óbvias, uma subseção cada. **O núcleo do artigo.** | ~55% |
| **C** | **Validação** | Como se provou que funciona: testes em aparelho, o que falhou, o que a falha ensinou. | ~25% |

A funcionalidade **não some** — ela aparece como *contexto* de cada decisão ("no cadastro de
medicamento, o problema era…"), e não como organizador do texto.

---

## 2. Roteiro detalhado, subseção a subseção

## CAMADA A — Visão geral (~20%)

### A.1 Arquitetura e organização do código

**O que dizer:** Clean Architecture aplicada, com domínio isolado de framework e de infraestrutura.

**Evidência que você tem:** `src/domain/` com 11 entidades, **13 ports** e **17 use-cases**. A regra
de dependência apontando para dentro: `domain/` não importa nada de `data/` nem de `telas/`.

**📊 FIGURA 1 — Diagrama de camadas.** Círculos concêntricos ou caixas empilhadas: `domain` no
centro, `data`/`notifications` como adaptadores, `telas`/`ui` na borda, setas de dependência todas
apontando para dentro. É a figura mais importante do artigo, porque toda a seção seguinte se apoia
nela.

**Um exemplo concreto vale mais que a definição.** Sugiro este, curto e que mostra o padrão inteiro:
`src/domain/ports/id-generator.ts` existe porque `register-intake` e `correct-intake` importavam
`expo-crypto` diretamente — o domínio dependendo de biblioteca de framework. O port inverteu a
dependência. É *Dependency Inversion* (o D de SOLID) em quatro linhas.

### A.2 Modelo de dados

**📊 FIGURA 2 — DER.** As nove tabelas sincronizáveis e seus relacionamentos.

**O que destacar, e não é o desenho:** o tipo `SyncableEntity` que toda entidade carrega
(`updated_at`, `synced_at`, `deleted_at`). Ele é o que torna offline-first possível, e explicá-lo uma
vez aqui evita repeti-lo em toda subseção seguinte.

**💻 CÓDIGO 1** — o tipo `SyncableEntity`. Curto, e sustenta a subseção B.2 inteira.

### A.3 Tecnologias empregadas

Tabela seca, sem prosa. Já está pronta em §6 do embasamento.

⚠️ **Aqui é onde a correção do `expo-notifications` precisa entrar** (§0 do embasamento).

---

## CAMADA B — Decisões de projeto (~55%, o núcleo)

Cada subseção segue a anatomia de §1.2. Sugiro **seis**, do mais estrutural ao mais específico.

### B.1 Offline-first: por que o dado nasce local

**Problema:** app de medicação que só funciona conectado falha exatamente quando mais importa. E o
dado é sensível — mandá-lo para a nuvem por padrão é decisão de privacidade, não só de arquitetura.

**Decisão:** SQLite local como fonte da verdade; nuvem é sincronização **opcional**. Sem conta
vinculada, nenhum dado de saúde sai do aparelho.

**Consequência dupla, e é o que faz a subseção valer:** isso resolve disponibilidade *e* atende
minimização (LGPD art. 6º, III) na arquitetura em vez de na política. Uma decisão, dois requisitos —
esse tipo de convergência é ótimo material de artigo.

**Custo:** exige resolver conflito de sincronização, que é o assunto de B.2.

### B.2 Sincronização e consistência eventual

**Problema:** dois aparelhos, ambos offline, ambos editam a mesma linha. Qual vence?

**Alternativas:** CRDT (correto, complexo demais para o escopo), timestamp vetorial, Last-Write-Wins.

**Decisão:** **LWW por `updated_at`** (`src/data/remote/sync-service.ts:296`). A linha remota só
sobrescreve a local se for mais recente.

**O detalhe que mostra rigor** — e recomendo destacar, porque separa quem pensou de quem copiou: **o
empate mantém o local**, e não por preferência. Está justificado no código: o empate só acontece em
situação específica, e manter o local é a escolha que não perde trabalho recém-feito.

**💻 CÓDIGO 2** — o critério de seleção do que subir: `synced_at IS NULL OR updated_at > synced_at`.
Uma linha de SQL que expressa "nunca subiu, ou mudou depois de ter subido".

**Custo:** LWW pode perder uma edição concorrente. Declare isso. É honesto, e a banca respeita.

### B.3 O algoritmo de previsão de estoque ⭐

**Recomendo esta como a subseção mais desenvolvida do artigo.** É o algoritmo mais defensável que
você tem, por uma razão incomum: **ele sabe quando não deve responder**.

**Problema:** quando o estoque acaba?

**A solução ingênua:** `quantidade ÷ dose`. E ela erra em dois casos reais:

- dose que varia por horário — 10 UI de manhã e 8 à noite consomem 18/dia, não 2× a "dose";
- ciclo com pausa — uma cartela 21/7 não consome nada em sete dias de cada vinte e oito.

**A decisão:** percorrer as doses **de verdade**, reusando `generateDoseSchedules` — a mesma função
que agenda os alarmes. Uma regra, dois consumidores.

**O ponto alto, e o que eu colocaria em destaque:** a função **retorna `null` quando estoque e dose
estão em unidades diferentes**. Gota se toma em gota e se compra em ml; converter exigiria a
concentração do frasco, que o app não tem. O comentário do código diz melhor do que eu diria:

> *"Subtrair '3 gotas' de '20 ml' produz um número que parece uma previsão e não é nenhuma."*

**Por que isso é forte num artigo de sistema de saúde:** um número errado numa previsão de estoque de
medicamento não é bug cosmético — é informação clínica falsa apresentada com aparência de certeza.
Recusar-se a responder é a decisão segura, e é rara: a maioria dos sistemas prefere o palpite ao
silêncio.

**💻 CÓDIGO 3** — a assinatura da função e a guarda de unidade, com o comentário junto.

**📊 FIGURA 3** — fluxograma do algoritmo, com o ramo do `null` bem visível.

**Custo declarado:** quem usa medicamento em gotas não recebe previsão. É perda de funcionalidade,
aceita conscientemente em troca de não mentir.

### B.4 Alarme: garantir entrega num sistema que resiste

**Problema:** o Android restringe progressivamente alarmes exatos e execução em segundo plano —
Doze, App Standby, otimização de bateria por fabricante. O app precisa tocar **na hora**, com o
processo morto.

**O que contar:**

1. A delegação ao **AlarmManager** via `TriggerType.TIMESTAMP` — quem guarda o horário é o SO, não o
   app. Por isso o alarme dispara com o app encerrado.
2. As três permissões e por que cada uma é necessária: `SCHEDULE_EXACT_ALARM`,
   `USE_FULL_SCREEN_INTENT`, `SYSTEM_ALERT_WINDOW`.
3. A **migração de biblioteca** (§0 do embasamento) — e aqui há uma boa história: o Notifee foi
   arquivado, e o boot receiver dele nunca era invocado no Android 12+. Consequência: **depois de
   reiniciar o aparelho, os alarmes não voltavam**. Num app de adesão, isso é o app falhando na
   função que o justifica.

**📊 FIGURA 4 — Diagrama de sequência do alarme:** agendamento → AlarmManager → disparo com app
morto → tela cheia sobre o bloqueio → resposta → reagendamento.

**A parte mais interessante tecnicamente** é o defeito da tela dupla (§5.4 do embasamento): dois
pontos de entrada legítimos, mesmo processo JS, som duplicado. A solução em escopo de módulo —
porque os dois lados não compartilham árvore de componentes. É defeito que **só aparece em aparelho
físico**, e isso conecta direto com a Camada C.

### B.5 Integridade do registro clínico

**Problema:** o dado de adesão vira relatório que pode ser mostrado a um profissional de saúde.
Registro errado ou inventado é pior que registro ausente.

**Três decisões que convergem** — apresente-as juntas, porque juntas formam um princípio:

1. **Append-only com `correctsLogId`** (§4.3): correção nunca sobrescreve; cria registro novo
   apontando para o substituído. Histórico reconstruível.
2. **"Adiar" não grava desfecho nenhum** (§5.1): num horário com duas doses, adiar não afirma nada
   sobre nenhuma delas. Registrar ali inventaria resposta que ninguém deu.
3. **Três estados + `null`** (§4.4): `deferred` separa "vi e decidi depois" de "nunca vi". Permite ao
   relatório distinguir **"pulada"** de **"sem registro"** — fatos clínicos diferentes.

**O princípio que emerge, e vale enunciar explicitamente:** *o sistema prefere a ausência de dado ao
dado inventado.* É o mesmo princípio de B.3, aplicado a outro subsistema — e mostrar que uma diretriz
atravessa decisões independentes é o que dá unidade a uma seção de desenvolvimento.

**💻 CÓDIGO 4** — o tipo `IntakeLog` com o comentário do append-only.

### B.6 Acessibilidade como requisito, não como verniz

**Problema:** o público-alvo é quem toma vários medicamentos por dia — faixa etária com alta
incidência de comprometimento visual.

**O que diferencia esta subseção de um checklist de WCAG:** mostre o **raciocínio de projeto**, não a
lista de critérios atendidos.

O melhor exemplo é o tema de daltonismo (§1.4): a solução óbvia — trocar verde por azul — **foi
recusada**, porque azul já é a cor da ação e reusá-lo apagaria a distinção entre "toque aqui" e "isto
está resolvido". A solução adotada foi **redundância** (WCAG 1.4.1): a cor continua, mas nunca
sozinha.

O segundo melhor é o amarelo (§2.3): três tentativas fracassadas, todas pelo mesmo erro — tratar
amarelo como tinta. A solução veio do semáforo: amarelo é a **lâmpada**, e o que se lê contra ela é
escuro. `#FFC107` com texto quase-preto dá **10.68:1**.

**📊 FIGURA 5** — comparativo dos três temas na mesma tela (padrão / alto contraste / daltonismo).
Alto impacto visual e custo baixo: três capturas lado a lado.

**📊 TABELA** — razões de contraste por token contra o mínimo WCAG AA. Os números já estão calculados
(§2 do embasamento).

**Custo:** respeitar a escala de fonte integralmente obriga todo layout a aguentar o tamanho máximo —
e é por isso que existe um bloco de teste dedicado a isso.

---

## CAMADA C — Validação (~25%)

É a camada que a maioria dos TCCs faz mal, e onde você tem vantagem incomum: **um roteiro de teste
versionado e um histórico de falhas reais**.

### C.1 Estratégia de verificação

**O argumento central:** os defeitos mais graves deste app **não aparecem em emulador**. O que está
em jogo é o comportamento do sistema operacional com o app encerrado, sob economia de bateria, após
reinicialização. Isso exige aparelho físico.

Descreva o roteiro (`docs/ROTEIRO-DE-TESTE.md`): 23 blocos, ordenados por dependência e não por
preferência — os que reiniciam o aparelho e mexem no relógio ficam por último, porque depois deles o
estado do celular não serve para mais nada.

### C.2 A ferramenta de diagnóstico ⭐

**Destaque isto como contribuição de processo.** O app tem uma tela de diagnóstico
(`src/notifications/diagnostico-de-avisos.ts`, 11 KB) que mostra permissões, canais e — o essencial —
**compara os avisos agendados no sistema com os esperados pelo banco**.

Por que a comparação importa, e é um bom parágrafo de artigo:

> Esperados sem agendados = falha ao **agendar**. Agendados que não tocam = falha na **entrega**. São
> causas diferentes, e sem os dois números não há como separar uma da outra.

Antes dela, diagnosticar exigia esperar vinte minutos e adivinhar. Depois, cinco segundos.
**Instrumentação como decisão de projeto** — não é comum em TCC e é genuinamente defensável.

**📊 FIGURA 6** — captura da tela de diagnóstico.

### C.3 Defeitos encontrados e o que ensinaram

**Esta é a subseção que mais impressiona banca, e a que a maioria omite por achar que falha é
vergonha.** É o contrário: falha documentada com causa-raiz é evidência de método.

| Defeito | Causa-raiz | O que ensinou |
|---|---|---|
| Cinco toques em "Adiar" geravam cinco lembretes (29/08) | Handler redisparado; ausência de trava | Levou a `snoozeCount` — um adiamento por horário |
| Som duplicado no alarme (09/09) | Dois pontos de entrada no mesmo processo JS | Estado precisa morar no módulo, não no componente |
| Alarmes não voltavam após reboot | Boot receiver do Notifee nunca invocado no Android 12+ | Dependência arquivada é risco arquitetural |
| Canal de notificação mudo persistia entre builds | Canal já criado fica congelado no Android | Instalar por cima mascara defeito de configuração |
| Dia 10 no calendário gravava dia 9 | Fuso horário em `new Date("YYYY-MM-DD")` | Parsing de data local exige construção explícita |

O último é ótimo para o artigo: é um clássico, tem causa técnica clara (`new Date("2026-09-10")`
interpreta a string como UTC), e a correção está no código (`parseIsoDate` em
`generate-dose-schedules.ts`).

### C.4 Limitações e trabalhos futuros

Seja específico, não genérico. O que você tem, verificado:

- `accessibilityHint` não implementado (§1.1);
- LWW pode perder edição concorrente (B.2);
- previsão de estoque indisponível quando as unidades divergem — decisão consciente (B.3);
- validação com usuários reais do público-alvo não realizada.

---

## 3. Recomendações práticas de escrita

### 3.1 Sobre trechos de código

**Regra que eu aplicaria:** código no artigo é **citação**, não anexo. Se o leitor precisa ler mais
de ~15 linhas para entender o ponto, o ponto está mal explicado no texto.

- **Máximo 4 a 6 trechos na seção inteira.** Sugeri 4 acima.
- **Prefira assinaturas e tipos a implementações.** `IntakeLog` com o comentário do append-only diz
  mais que o corpo da função que o grava.
- **Legenda que afirma, não que descreve.** ❌ "Código 3: função de estimativa de estoque." ✅
  "Código 3: a guarda de unidade — a função recusa-se a estimar quando estoque e dose não são
  comparáveis."
- Seus comentários de código são excepcionalmente bons e explicam *por quê*. **Cite-os.** São
  evidência de que a decisão foi deliberada, e não racionalizada depois.

### 3.2 Sobre figuras

Seis, nesta proporção:

| # | Figura | Tipo | Prioridade |
|---|---|---|---|
| 1 | Camadas da arquitetura | Diagrama | **Essencial** |
| 2 | DER | Diagrama | Essencial |
| 3 | Fluxograma da previsão de estoque | Fluxograma | **Alta** — é o diferencial |
| 4 | Sequência do alarme | Diagrama de sequência | Alta |
| 5 | Três temas lado a lado | Captura de tela | **Alta** — impacto visual, custo baixo |
| 6 | Tela de diagnóstico | Captura de tela | Média |

**Capturas de funcionalidade comum** (lista de remédios, formulário de cadastro) só entram se o texto
ao redor **argumentar** sobre elas. Captura decorativa enfraquece a seção: ocupa espaço de figura sem
carregar afirmação.

### 3.3 O erro mais comum, e como evitá-lo

O erro mais frequente nesta seção é **narrar o que foi feito em ordem cronológica**: "primeiro criei o
banco, depois as telas, depois as notificações". Ninguém precisa do seu diário — precisam entender o
sistema.

Organize por **problema resolvido**, não por ordem de execução. O leitor deve conseguir ler a
subseção B.3 sozinha e entendê-la.

### 3.4 O fio condutor

Se a seção precisar de **uma frase** que a unifique, sugiro esta, que emerge de B.3 e B.5 juntas:

> **O sistema prefere a ausência de dado ao dado inventado.**

Ela aparece na previsão de estoque que retorna `null`, no adiamento que não grava desfecho, na
distinção entre "pulada" e "sem registro", e no consentimento versionado que invalida o aceite
antigo. Quatro subsistemas independentes, uma diretriz — e é isso que transforma uma lista de
funcionalidades numa **seção com tese**.

---

## 4. Esqueleto para colar no editor

```
4. DESENVOLVIMENTO
   4.1 Visão geral da solução
       4.1.1 Arquitetura em camadas ................ [FIGURA 1]
       4.1.2 Modelo de dados ....................... [FIGURA 2] [CÓDIGO 1]
       4.1.3 Tecnologias empregadas ................ [TABELA]
   4.2 Decisões de projeto
       4.2.1 Offline-first: o dado nasce local
       4.2.2 Sincronização e consistência eventual . [CÓDIGO 2]
       4.2.3 Previsão de estoque ⭐ ................ [FIGURA 3] [CÓDIGO 3]
       4.2.4 Garantia de entrega do alarme ......... [FIGURA 4]
       4.2.5 Integridade do registro clínico ....... [CÓDIGO 4]
       4.2.6 Acessibilidade como requisito ......... [FIGURA 5] [TABELA]
   4.3 Verificação e validação
       4.3.1 Estratégia de teste em aparelho
       4.3.2 Instrumentação: diagnóstico ⭐ ........ [FIGURA 6]
       4.3.3 Defeitos encontrados e causas-raiz .... [TABELA]
       4.3.4 Limitações e trabalhos futuros
```

⭐ = subseções que recomendo desenvolver mais que as outras: contêm contribuição própria, e não
aplicação de técnica conhecida.
