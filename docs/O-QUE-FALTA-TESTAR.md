# O que falta testar

> Documento de trabalho, criado em 12/09. Só o que ainda não foi validado em aparelho.
>
> O [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md) continua sendo o registro completo — o que passou,
> quando, e o que cada achado revelou. Este aqui é a lista curta do que falta fazer.

## Resumo

**As Partes A, B e D foram validadas em 13/09** — a A em aparelho com a preview, a B e a D na build
de desenvolvimento. O que sobrou está listado abaixo, e **tudo espera uma build de preview nova**.

| O que falta | Por que espera a preview |
|---|---|
| **A tela azul** — B.4, B.7, B.8, B.17b, B.20 e o D.5 fora dos recentes | Numa build de desenvolvimento o bundle vem do Metro: tirar o app dos recentes mata o processo, e a Activity precisa rebaixar tudo antes de a tela montar. O cenário fica muito mais lento do que numa build real |
| **B.9** — a notificação de estoque às 00:01 | Depende de virar o dia |
| **E.1** — o alarme no volume de despertador | Patch nativo. Ainda **não implementado** — ver a Parte E |
| **C.1 e C.2** — os dois bugs conhecidos | Código nativo Android. Ainda **sem correção** |

> **O fuso (E.2) foi decidido em 13/09:** a dose segue o **instante**, então 21:00 em São Paulo toca
> às 20:00 em Manaus, e isso está certo. Saiu da fila de testes.

> **Ao testar o alarme, deixe o volume de mídia alto** — enquanto o E.1 não for feito, o som sai por
> ele, e com a mídia baixa o passo não mede o que deveria.

---

# PARTE D — As correções de 13/09

Saíram da rodada da Parte A, que fechou nesse dia. Dos cinco itens originais, quatro já foram
validados ou decididos — resta **D.5**.

| # | O que conferir | Como saber que passou |
|---|---|---|
| D.1 | ⏸️ **O volume do alarme saiu da fila.** Testado em 13/09 nesta build: continua no volume de mídia. Não é ajuste, é mudança de arquitetura — ver **E.1** | — |
| D.2 | ⏸️ Depende do D.1, pelo mesmo motivo | — |
| D.3 | ✅ **Passou em 13/09.** Relógio adiantado de 13/09 para 14/10: a Home abriu vazia e **se preencheu sozinha em segundos**, e o Diagnóstico mostrou `Grade vai até 13/10/2026 (30d)`. Não precisou reabrir o cadastro — que era o defeito | — |
| D.4 | ✅ **Fechado em 13/09 — o comportamento atual é o correto.** A dose acontece no **instante** marcado, então 21:00 em São Paulo toca às 20:00 em Manaus. Ver E.2 | — |
| D.5 | ⚠️ **Parcial em 13/09, e o resto não dá para testar nesta build.** Com o app **nos recentes**: a tela azul apareceu e ficou, o alarme tocou — e esse era o caso que falhava em 12/09. Com o app **fora dos recentes**: inconclusivo, ver a nota abaixo | Fecha na build de **preview**, não nesta |

> **Sobre o D.5, e por que ele não fecha nesta build.** Achado do Gabriel em 13/09: numa build de
> **desenvolvimento** o JavaScript vem do Metro, não do APK. Tirar o app dos recentes mata o
> processo, e quando o alarme dispara a Activity precisa reconectar no Metro e rebaixar o bundle
> inteiro antes de montar. O que ele observou — a tela azul piscando, o som por um segundo, e tudo
> parando — é essa carga não terminando, não a guarda falhando.
>
> É justamente o cenário que a guarda protege, e ele fica muito mais lento aqui do que jamais seria
> numa build real. **O passo com o app fora dos recentes só vale na preview**, onde o bundle está
> dentro do APK.
>
> O que já foi observado vale: **com o app nos recentes, a tela azul apareceu e ficou**. Era esse o
> caso que a tela "Hora do remédio" substituía em 12/09, então a correção da corrida está funcionando
> onde dava para ver.

> **Enquanto o E.1 não for feito, o alarme toca no volume de mídia.** Para testar o D.5 e a Parte B,
> deixe o volume de mídia alto — senão o alarme não toca e o passo não diz nada sobre o que ele
> deveria estar medindo.

**Não precisa testar:** o empilhamento de alarmes atrasados (dose vencida há mais de 4 h não irrompe
mais em tela cheia). Foi corrigido junto, por decisão do Gabriel em 13/09 não entra na fila de
validação — o cenário é raro e a falha, se houver, é recusar um alarme velho, não perder um atual.
No teste do D.3, adiantar o relógio um mês **não** produziu pilha de telas azuis, o que é essa
correção funcionando de passagem.

---

# PARTE B — As correções de 11–12/09

**✅ Validada em 13/09**, na build de desenvolvimento, com as exceções marcadas abaixo. As telas, os
painéis de permissão, o tema escuro e os cartões da Home estão conferidos.

O que **não** foi fechado são os passos que dependem da **tela azul** (B.4, B.7, B.8, B.20) e o
aviso de estoque das 00:01 (B.9) — os primeiros porque o Metro atrapalha o cenário, o último porque
depende de virar o dia. Ficam para a próxima preview, junto do D.5.

| # | O que conferir | Estado |
|---|---|---|
| B.1 | Marcar "me avisar" sem prazo, salvar, reabrir em editar → estoque → alterar: a caixa continua marcada | ✅ |
| B.2 | O agendamento do aviso de estoque aparece no Diagnóstico e continua lá | ✅ |
| B.3 | Aviso **sem prazo**: o cartão aparece na tela inicial na semana em que o estoque acaba | ✅ |
| B.4 | Alarme → editar para notificação → salvar → voltar para alarme: a tela azul sobe nas duas vezes | ⏳ **preview** |
| B.5 | Só aviso de estoque ou compromisso, sem alarme, com a permissão negada: o painel da Home aparece | ✅ |
| B.6 | `Ajustes → como funcionam os alertas`: parágrafo do início automático e a nota do fabricante | ✅ |
| B.7 | **2 ou 3 remédios** no mesmo horário: a tela azul lista cada um, legível sem rolar | ⏳ **preview** |
| B.8 | **4 ou mais** no mesmo horário: a tela azul mostra a contagem e o botão de abrir o app | ⏳ **preview** |
| B.9 | 🔴 **A notificação de estoque chega às 00:01.** Tratamento com data de fim e estoque que dê conta dele, com 3 dias de antecedência — e repita **sem** antecedência | ⏳ **vira o dia** |
| B.10 | **Alertas e permissões**: fundo branco com sombra, sem itálico, seta cinza; toque abre a tela do sistema e o estado volta atualizado | ✅ |
| B.11 | O bloco "Confira as permissões" nas cinco telas, vermelho enquanto o painel da Home estiver lá | ✅ |
| B.12 | Na tela inicial: sem lista de permissões e sem placar "2 de 3"; o rodapé leva à tela de alertas | ✅ |
| B.13 | A tela de Alertas e permissões no **tema escuro** e no alto contraste | ✅ |

## Os ajustes de 12/09 (tarde)

Levantados pelo Gabriel usando a build `489a67a`. **✅ Validados em 13/09**, com as exceções abaixo.

| # | O que conferir | Estado |
|---|---|---|
| B.14 | O alarme no volume de despertador | ⏸️ **Virou E.1** |
| B.15 | O alarme toca no silencioso | ⏸️ Depende do E.1 |
| B.16 | O lembrete continua no volume de aviso e respeita o silencioso | ⏸️ Depende do E.1 |
| B.17 | A tela azul com o app nos recentes | ✅ *(o caso que falhava em 12/09; ver D.5)* |
| B.17b | 🔴 **A contraprova do D.5:** celular **desbloqueado**, usando outro app, e o alarme dispara. Deve chegar a notificação com som em loop, e **não** uma tela invisível | ⏳ **preview** |
| B.18 | Na seção de lembretes, com permissões pendentes: **um** bloco de permissão, não dois | ✅ |
| B.19 | No tema escuro, o subtítulo do botão azul de lembrete é legível | ✅ |
| B.20 | **4 ou mais remédios** no mesmo horário: a tela azul mostra nome e dose de cada um | ⏳ **preview** |
| B.21 | Na tela "Hora do remédio": foto, dose, orientação, **onde está guardado** e a observação | ✅ |
| B.22 | Na lista de remédios, o sino ao lado de quem tem lembrete | ✅ |

E o **bloco 20 do estoque**, que depende de B.1 e B.9: cadastrar na véspera e conferir se a
notificação chega às 00:01. Vai junto com o B.9.

---

# PARTE E — Decisões tomadas, e o que fica fora de escopo

## E.1 — 🔊 O alarme no volume de despertador

**Decisão do Gabriel em 13/09:** fica para depois de todo o resto estar validado. Duas builds foram
gastas nisso sem resultado, e o motivo é que o caminho tentado não leva lá — não é questão de
insistir mais.

**Até lá, o alarme toca no volume de mídia.** É a única característica do app que fica sabidamente
incompleta.

### Por que as duas tentativas falharam

O `AudioAttributes` do canal **foi** aplicado. Verificado em 13/09 rodando `expo prebuild`
localmente: o [`plugins/volume-de-despertador.js`](../plugins/volume-de-despertador.js) transforma o
`ChannelManager.java` corretamente, `USAGE_NOTIFICATION` vira `USAGE_ALARM`. O plugin funciona.

O problema é que **quem toca o som da notificação é o NotificationManager, não o app** — e ele usa o
stream dele independentemente do que o canal peça. O `AudioAttributes` ali é uma dica, não uma
ordem.

Não é defeito do Notifee: a [issue #297](https://github.com/invertase/notifee/issues/297), pedindo
exatamente isto, foi fechada como *not planned*. E os [requisitos do Google Play para apps de
alarme](https://support.google.com/googleplay/android-developer/answer/13392821) descrevem a
arquitetura esperada — o app toca som próprio, e a notificação serve ao full-screen intent, não ao
áudio.

### O caminho que funciona

Separar quem mostra de quem toca:

1. **O canal do alarme fica mudo** (`sound: null`). A notificação continua fazendo a tela azul
   irromper e continua na bandeja — só não emite som.
2. **A tela do alarme toca o som**, com `expo-audio` (já instalado e registrado no `app.json`), em
   loop, parando quando a dose é respondida.
3. **Um segundo config plugin** põe `USAGE_ALARM` no player. É necessário porque o `expo-audio`
   [não expõe a escolha de stream](https://docs.expo.dev/versions/v57.0.0/sdk/audio/) — tem
   `interruptionMode` e `playsInSilentMode`, e nada de `androidAudioUsage`.

**O alvo do patch já está localizado:** `node_modules/expo-audio/android/src/main/java/expo/modules/
audio/AudioPlayer.kt`, linha 39 — `.setAudioAttributes(AudioAttributes.DEFAULT, false)`, onde
`DEFAULT` é `USAGE_MEDIA`. Uma linha, no mesmo formato do patch que já existe e comprovadamente
aplica.

### O que ganha junto

O loop do som passa a ser do app, e não do canal; e parar o som vira uma chamada direta em vez de
cancelar notificação. Os dois são contornos que existem hoje só porque o som é do sistema.

### O risco a tratar

Se o Android matar o processo antes de a tela montar, o som não toca — hoje quem toca é o sistema, e
isso não acontece. A defesa é um **foreground service**, que é o que os requisitos do Play descrevem
para apps de alarme e que este app ainda não usa. Entra no mesmo trabalho.

### Tamanho

Mudança de arquitetura do alarme, não ajuste. Merece build dedicada e uma rodada de teste própria —
foi por isso que ficou para depois, e não por ser difícil.

## E.2 — ✅ A dose segue o instante, não a hora de parede

**Decisão do Gabriel em 13/09, e o comportamento atual está correto.** Um remédio cadastrado para as
21:00 em São Paulo toca às **20:00** em Manaus — é o mesmo momento, visto de outro fuso.

### O que foi tentado, e por que saiu

A suposição de 13/09 era a oposta: que "tomo às 8 da manhã" fosse uma promessa sobre o **relógio de
parede**, e que o horário devesse se manter ao trocar de fuso. Foi implementado — o app guardava o
fuso da última geração e regerava as doses futuras quando ele mudava.

Não funcionou, e a caçada consumiu a tarde. Três causas reais foram encontradas no caminho (todas
corrigidas e mantidas, porque valem por si):

- A manutenção da grade rodava **depois** da guarda de permissão, então nunca rodava com a permissão
  negada.
- O offset que o `Date` aplica **demora a acompanhar** o nome do fuso, então a regeração usava o
  deslocamento antigo.
- `scheduled_for` tinha **duas formas de ISO** no banco, e a comparação de texto do SQLite deixava
  escapar metade das linhas.

### Por que o comportamento atual é defensável

Não é só desistência — o instante absoluto tem um argumento próprio, e num app de medicação ele é
forte: **quem toma de 12 em 12 horas não deve encurtar o intervalo porque atravessou um fuso.**
Manter a hora de parede numa viagem de três fusos comprimiria ou esticaria o intervalo entre doses,
que é justamente o que a posologia estabelece.

Para viagem curta — o caso real de quem usa este app — seguir o instante é o mais seguro.

### O que fica registrado

O código da tentativa foi removido (`fuso-da-grade.ts`). A tabela `app_state` (migration 019) fica:
migration publicada não se remove, e um lugar para estado interno é útil.

**Se um dia isto for revisitado**, o caminho rigoroso é gravar a hora local pretendida (`"21:00"`)
ao lado do instante e derivar um do outro — não detectar troca de fuso e regerar. Custa uma coluna,
backfill e a revisão dos ~35 arquivos que leem `scheduledFor`, e foi o que se evitou em 13/09.

---

# PARTE C — Bugs conhecidos, ainda sem correção

Estes dois **não** foram corrigidos. Você vai encontrá-los se testar, e é esperado — não são
regressão.

Os dois precisam de código nativo, então são os únicos itens além do E.1 que **não** se resolvem
recarregando o Metro.

Os bugs que saíram da rodada de 13/09 — grade de 30 dias, tela azul e alarmes empilhados — foram
corrigidos: o da grade já passou (D.3), e a tela azul espera o D.5. O fuso virou decisão, não
correção: ver **E.2**.

## C.1 — 🔴 Responder o alarme dá acesso ao app sem desbloquear

Tela bloqueada, o alarme toca, a tela azul sobe. Ao tocar em "Tomei", o app fica acessível na tela
inicial **sem pedir desbloqueio**.

**Por que acontece:** o `showWhenLocked` é aplicado à MainActivity — o app inteiro — e o `index.js`
monta o app junto da tela do alarme. Fechar a tela azul revela o que estava atrás.

**Por que importa:** qualquer pessoa com o aparelho na mão pode esperar um alarme, tocar em "Tomei",
e chegar aos medicamentos, ao histórico de doses e à ficha de saúde. É exposição de dado sensível.

**A correção certa** é uma Activity nativa exclusiva do alarme, com `showWhenLocked` só nela. É
código nativo Android, e precisa de build para validar.

## C.2 — 🔴 Alarme adiado sobrevive ao apagamento de dados

Adiar um alarme e apagar todos os dados de saúde antes dos 5 minutos: ele toca mesmo assim.

**Investigado em 12/09, e é maior que o relatado:** `eraseHealthData` apaga tabelas e arquivos e
**não cancela agendamento nenhum**. Não é só o adiamento — as doses da grade também continuam
agendadas. É alarme órfão por um caminho que o bloco 16 não testa.

---

# Como reportar

Só o que falhar, com o número do passo:

```
D.5 passou nas 4 tentativas, fora dos recentes
B.7 falhou — o local do remedio nao apareceu na tela azul
B.9 passou — o aviso chegou as 00:01
resto ok
```

Os passos marcados 🔴 valem anotar **mesmo quando passam** — são eles que fecham o C1 formalmente no
plano de desenvolvimento.

**No D.5, diga quantas vezes tentou.** "Passou" e "passou nas 4 tentativas" são informações
diferentes num defeito que é corrida de tempo: o primeiro não distingue correção de sorte.
