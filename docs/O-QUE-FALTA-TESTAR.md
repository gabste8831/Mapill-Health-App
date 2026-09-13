# O que falta testar

> Documento de trabalho, criado em 12/09. Só o que ainda não foi validado em aparelho.
>
> O [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md) continua sendo o registro completo — o que passou,
> quando, e o que cada achado revelou. Este aqui é a lista curta do que falta fazer.

## Resumo

**Tudo aqui pode ser testado agora**, na build de **desenvolvimento** de 13/09 — versionCode 3, a do
`--dev-client`. Ela conecta no Metro, então correção em TypeScript chega recarregando (`r` no
terminal), sem build nova. A única exceção é o **E.1**, que depende de patch nativo.

A Parte A foi executada inteira em 13/09 e saiu deste documento — o que ela achou virou correção, e
as correções estão listadas abaixo.

| O que conferir | Quantos |
|---|---|
| As correções de 11–12/09 (Parte B) | 13 itens |
| Os ajustes de 12/09 à tarde | 7 itens |
| **As correções de 13/09** | **1 item** (D.5) |
| Bugs conhecidos, ainda sem correção | 2 (C.1, C.2) |
| Decidido e fora de escopo | 2 (**E.1** volume, **E.2** fuso) |

> **Dois assuntos saíram da fila em 13/09.** O **volume do alarme** (E.1) continua no volume de
> mídia — a causa está diagnosticada e o caminho levantado, para depois do resto. E o **fuso** (E.2)
> foi decidido: a dose segue o **instante**, então 21:00 em São Paulo toca às 20:00 em Manaus, e
> isso está certo.

> **Ao testar, deixe o volume de mídia alto** — enquanto o E.1 não for feito, o alarme sai por ele, e
> com a mídia baixa o passo não mede o que deveria.

**Validado o que resta, o app fica funcional em tudo menos o volume do alarme.**

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
| D.5 | 🔴 **A tela azul sobe e fica.** App **fora dos recentes**, celular parado, tela bloqueada, alarme para daqui a alguns minutos | A tela azul aparece e **permanece** — não é trocada pela de "Hora do remédio". **Repita 3 ou 4 vezes, em momentos diferentes:** é uma corrida de tempo, e um acerto isolado não prova nada |

> **Sobre o D.5.** É o item mais frágil da lista e o que mais precisa de repetição. A correção
> anterior (12/09) falhava só no arranque frio — celular parado há horas, processo subindo do zero —,
> que é justamente o cenário de madrugada. Testar com o app recém-usado esconde o defeito.

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

Entraram depois do APK de preview que estava instalado, e por isso o documento dizia "espera a
próxima build". **Isso não vale mais desde 13/09:** com a build de desenvolvimento, este código
chega pelo Metro — é só recarregar (`r` no terminal do Expo). Tudo aqui é TypeScript.

| # | O que conferir | Commit |
|---|---|---|
| B.1 | Marcar "me avisar" **sem escolher prazo**, salvar, reabrir em editar → estoque → alterar: **a caixa continua marcada** | `8e85dfb` |
| B.2 | ✅ *Conferido em 12/09 no Diagnóstico* — o agendamento aparece e continua lá. Falta a **notificação chegar** (ver B.9) | `4cc90e6` `41640b4` |
| B.3 | Marcar o aviso **sem prazo**: o cartão aparece na tela inicial na semana em que o estoque acaba | `4cc90e6` |
| B.4 | Alarme → editar para notificação → salvar → voltar para alarme: **a tela azul sobe nas duas vezes** | `a3aa220` |
| B.5 | Cadastrar só aviso de estoque ou compromisso, **sem** alarme de dose, e negar a permissão de notificação: o painel da tela inicial aparece | `358e55c` |
| B.6 | `Ajustes → como funcionam os alertas`: há parágrafo próprio sobre o início automático, e o painel de permissões traz a nota do fabricante | `358e55c` |
| B.7 | **2 ou 3 remédios** no mesmo horário: a tela azul lista cada um com miniatura, nome, dose, orientação de tomada e local — tudo legível sem rolar | `930082a` `73df26a` |
| B.8 | **4 ou mais** no mesmo horário: a tela azul mostra só a contagem e o botão de abrir o app | `930082a` |
| B.9 | 🔴 **A notificação de estoque chega.** Cadastre um tratamento **com data de fim** (ex.: 7 dias) e estoque que dê conta dele, com antecedência de 3 dias. O aviso tem de chegar às 00:01 do dia previsto — e repita **sem** antecedência, onde só o aviso do dia em que acaba existe | `41640b4` |
| B.10 | Na tela de **Alertas e permissões**: as linhas têm fundo branco com sombra (não borda), sem itálico, e a seta cinza. Toque numa: ela abre a tela do sistema, e ao voltar o estado já está atualizado | `1f6fb56` `8554f0e` |
| B.11 | O bloco **"Confira as permissões"** aparece nas cinco telas que configuram algo dependente de autorização (lembrete de dose, estoque, compromisso, receita, medicamento) e fica **vermelho** enquanto o painel "Seus alarmes não vão funcionar" estiver na tela inicial | `78771dc` |
| B.12 | Na tela inicial: **não há** lista de permissões nem placar "2 de 3", e a seção "Autorizações do aparelho" no rodapé leva à tela de alertas | `26c557f` |
| B.13 | 🔴 **A tela de Alertas e permissões no tema escuro** e no alto contraste. Até 12/09 ela ignorava o tema por completo — texto claro sobre fundo claro. Vale trocar o tema em Ajustes e voltar nela | `1f6fb56` |

## Os sete ajustes de 12/09 (tarde)

Levantados pelo Gabriel usando a build `489a67a`. Como o resto da Parte B, chegam pelo Metro.

| # | O que conferir | Como saber que passou |
|---|---|---|
| B.14 | ⏸️ **Virou E.1** — adiado por decisão, com a causa diagnosticada | — |
| B.15 | ⏸️ Depende do E.1 | — |
| B.16 | ⏸️ Depende do E.1 — enquanto o alarme sai no volume de mídia, comparar os dois canais não diz nada | — |
| B.17 | ➡️ **Virou D.5** — a correção de 12/09 não fechou o caso, e há uma nova | — |
| B.17b | 🔴 **A contraprova do D.5**, que é onde o risco está: celular **desbloqueado**, usando outro app (navegador, WhatsApp), e o alarme dispara | Chega a notificação com som em loop, e **não** uma tela invisível. Se o som vier duplicado ou sem nada na tela, a guarda errou o caso e eu preciso saber |
| B.18 | Na seção de **lembretes** do cadastro de medicação, com permissões pendentes: aparece **um** bloco de permissão, não dois | Só o painel "Seus alarmes não vão funcionar", com o botão. Concedidas as verificáveis, ele dá lugar ao aviso azul |
| B.19 | No **tema escuro**, a opção de lembrete selecionada: o subtítulo do botão azul é legível | Texto claro sobre o azul. Antes era 2,08:1, escuro sobre escuro |
| B.20 | **4 ou mais remédios** no mesmo horário: a tela azul mostra nome e dose de cada um | Não há mais o vazio entre o horário e os botões |
| B.21 | Na tela **"Hora do remédio"**: foto, dose, orientação de tomada, **onde está guardado** e a observação do tratamento | Os dois últimos são novos. Cadastre um remédio com local e observação para conferir |
| B.22 | Na **lista de remédios**, um sino ao lado do nome de quem tem lembrete | Despertador para alarme, sino para notificação, nada para "nenhum aviso" |

E o **bloco 20 do estoque**, que depende de B.1 e B.9: cadastrar na véspera e conferir se a
notificação chega às 00:01.

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
D.5 passou nas 4 tentativas
B.9 falhou — a notificacao de estoque nao chegou
B.13 falhou — texto claro sobre fundo claro no tema escuro
resto ok
```

Os passos marcados 🔴 valem anotar **mesmo quando passam** — são eles que fecham o C1 formalmente no
plano de desenvolvimento.

**No D.5, diga quantas vezes tentou.** "Passou" e "passou nas 4 tentativas" são informações
diferentes num defeito que é corrida de tempo: o primeiro não distingue correção de sorte.
