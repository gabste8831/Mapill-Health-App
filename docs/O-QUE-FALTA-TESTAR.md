# O que falta testar

> Lista de ação. Só o que ainda falta, na ordem de fazer.
>
> O registro completo — o que passou, quando, e o que cada achado revelou — está no
> [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md).

---

> **Atualizado em 16/09, manhã — o módulo do alarme está fechado.**
>
> **Os quatro cenários passaram em aparelho**, e com eles os dois pontos que ainda estavam em
> aberto. A correção foi arquitetural: a tela do alarme ganhou **Activity própria**.
>
> | Cenário | Resultado |
> |---|---|
> | Tela bloqueada, **fora** dos recentes | ✅ tela azul completa |
> | Tela bloqueada, **nos** recentes | ✅ tela azul completa |
> | Em uso, **nos** recentes | ✅ heads-up → toque → tela do horário |
> | Em uso, **fora** dos recentes | ✅ heads-up → toque → tela do horário |
> | **Responder com o aparelho bloqueado** | ✅ **pede o desbloqueio** |
> | Som no volume de despertador | ✅ os cinco cenários (15/09) |
>
> **O que falta é acabamento, não funcionalidade:** a limpeza do código
> ([`LIMPEZA-DO-CODIGO.md`](LIMPEZA-DO-CODIGO.md)), a documentação de arquitetura, e a build
> preview do EAS para a validação final — a cota reseta em 01/10.

---

## O que 15/09 (noite) resolveu

Quatro defeitos, na ordem em que apareceram — cada um só ficou visível depois que o anterior saiu.

| # | O sintoma | A causa | Commit |
|---|---|---|---|
| 1 | Tela azul piscava e era trocada pela de "Hora do remédio" | O bootstrap navegava pelo alarme: `getInitialNotification` responde ao `fullScreenAction` como se fosse toque | `c4543be` |
| 2 | Tela azul **não subia** — montava `main` | A guarda de `cdac0b2` lia `intent` em `getMainComponentName`, onde ele é **`null`**: negava 100% das vezes | `f21f3f9` |
| 3 | Tela azul subia **vazia**, e persistia após desbloquear | Era a **splash do Expo** por cima (`#196FF3`, o mesmo azul). O `_layout` trava o auto-hide e quem esconde vive no expo-router | `24130ae` |
| 4 | Textos **truncados** ("Hora do seu", "Tome", "Sem") | A fonte Plus Jakarta não é carregada na Activity do alarme — mesmo motivo da splash | `9b2a868` |

**O padrão que liga 3 e 4:** tudo o que o `_layout.tsx` prepara para o app (splash, fontes, tema)
**não existe** na Activity do alarme, que monta por `AppRegistry` fora da árvore do `expo-router`.
Quem for mexer nessa tela, comece por aí.

**A lição do #2:** três tentativas de guarda no nativo falharam, e só um `Log.i` dentro do método
revelou o `intent=null`. Duas builds foram gastas deduzindo antes disso.

### Validado em aparelho, na build de 21:19

| Cenário | Resultado |
|---|---|
| Bloqueada, **fora** dos recentes | ✅ tela azul completa — 3x seguidas |
| Bloqueada, **nos** recentes | ✅ tela azul completa, textos inteiros |
| **Em uso**, nos recentes | ✅ heads-up, toque leva à tela do horário |
| Som no volume de despertador | ✅ os cinco cenários |

---

## ✅ Como os dois últimos pontos foram fechados

Os dois tinham a **mesma raiz**, e por isso uma correção só resolveu ambos: `showWhenLocked` é
atributo de **Activity**, não de tela, e o alarme dividia a `MainActivity` com o app inteiro.

### A. O app ficava acessível depois de responder com a tela bloqueada

Alarme dispara com o celular bloqueado, a tela azul sobe, toca-se em "Tomei" — e o Mapill ficava na
frente, navegável, **sem pedir senha**. Medido duas vezes em 15/09 (21:10 e 21:21).

A licença de aparecer sobre o bloqueio era do **app todo**, porque a Activity era uma só.
`finishAndRemoveTask` não resolvia e foi tentado: o Android já dispensou o keyguard quando a
Activity sobe com `showWhenLocked` + `turnScreenOn`, e **não existe API de re-bloqueio**.

**Corrigido em `fcf6c91`:** a `AlarmeActivity` tem a licença, e a `MainActivity` não. Em task
própria (`singleInstance`, `taskAffinity` vazio, `excludeFromRecents`), fechar o alarme devolve o
aparelho ao bloqueio — o app nunca teve permissão de estar ali.

### B. Em uso e fora dos recentes, o toque abria a tela azul

Celular destravado, app fora dos recentes: a notificação aparecia como heads-up (correto), mas
tocar nela abria a **tela azul** em vez da tela do horário, e o som só parava depois de responder.

Duas sobras da arquitetura antiga, as duas visíveis **só no arranque frio** — e era esse o contraste
que as apontava: nos recentes o caminho passava pelo listener já vivo e funcionava.

1. **A `MainActivity` ainda perguntava ao sticky** qual componente montar. O `MainComponentEvent` é
   postado quando a notificação é **exibida**, não quando alguém toca: com o celular em uso o
   Android rebaixa para heads-up, ninguém monta a Activity do alarme, e o evento fica pendurado até
   o toque seguinte consumi-lo.
2. **A guarda do bootstrap barrava a navegação.** Ela previa não alcançar o toque real "porque o
   `PRESS` é tratado pelo listener, que cancela a notificação antes" — mas com o processo frio **não
   há listener de pé para cancelar coisa alguma**.

**Corrigido em `f6ddda7`:** cada Activity devolve um componente **literal** (`"main"` e
`"alarme-de-dose"`), e a guarda saiu. A pergunta não precisa mais ser feita: o `fullScreenAction`
abre a `AlarmeActivity`, e o bootstrap só roda dentro do `_layout` do `expo-router`, que monta na
`MainActivity` — se ele está rodando, ela subiu, e ela só sobe por toque.

### O que some junto

A classe de defeitos que custou três builds em 15/09 **deixa de existir por construção**: sticky
órfão decidindo qual tela montar, `intent` nulo em `getMainComponentName`, extra que não sobrevive
ao `PendingIntent`. Não há o que adivinhar quando cada Activity já é a de um dono só.

---

## ⚠️ O comando de build — o `expo run:android` **não serve** quando o `android/` é recriado

```powershell
# compila (3-4 min incremental)
$init = (Resolve-Path "gradle\cmake-do-windows.gradle").Path
.\android\gradlew.bat -p android assembleRelease -I $init

# instala
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r android\app\build\outputs\apk\release\app-release.apk
```

**Descoberto em 15/09, à noite.** O `npx expo run:android` chama o Gradle por conta própria e **não
passa o `-I`** — então o init script que força o CMake 3.31 não vale, e a build morre no loop
`ninja: error: manifest 'build.ninja' still dirty after 100 tries`, em `expo-modules-core` e
`react-native-reanimated`.

Só aparece quando o `android/` é recriado do zero (um `prebuild`); com a pasta já compilada o
problema fica escondido.

**O caminho do `-I` precisa ser absoluto.** Relativo, o Gradle o resolve contra o `-p android` e
procura em `android/gradle/` — o próprio script avisa disso no comentário.

**Se o `android/` for recriado**, rodar `node scripts/aplicar-patches.js` antes: é o prebuild que
aplica os patches do `expo-audio`, e sem eles o alarme volta ao volume de mídia sem nada no log
denunciando.

---

## O que 14/09 resolveu

| # | O que era | Resultado |
|---|---|---|
| C.2 | Apagar os dados cancela os alarmes | ✅ passou |
| **Tela azul** | Não subia em cenário nenhum | ✅ **sobe** — `Running "alarme-de-dose"` no logcat |
| **C.1** | Desbloqueio ao entrar pela tela azul | ✅ **passou** — pede a senha na hora |
| Atraso do serviço | `foregroundServiceBehavior` descartado | ✅ warning sumiu do log |

A tela azul era o passo que bloqueava todos os outros, e ela **nunca tinha subido pelo
`fullScreenAction`** — faltava uma linha na `MainActivity`. O C.1 só pôde ser testado depois disso:
o módulo de desbloqueio existia desde 13/09, mas o botão que pede a senha vive na tela que não
aparecia.

---

## Passo 1 — 🔊 O som no volume de despertador — ✅ **PASSOU em 15/09**

> **Aprovado na build das 14:55, nos cinco cenários testados.** O som saiu no volume de despertador
> em todos — app nos recentes e fora, tela bloqueada e em uso. As duas correções abaixo (o patch que
> sobrevive ao build, e o `expo-audio` compilando do fonte) eram as certas.
>
> O som também **parou** corretamente em "Silenciar" e ao tocar na notificação. Os demais botões
> ("Tomei", "Pulei", "Adiar", "Responder depois") ainda não foram exercitados um a um.
>
> **O artigo já pode alegar que o alarme toca no volume de despertador** — a alegação agora se
> sustenta em aparelho.

<details>
<summary>O histórico das duas causas, para o registro</summary>

> **Reprovou em 15/09 de manhã, e a causa era a compilação — o código estava certo o tempo todo.**
>
> A prova está nas datas dos arquivos: o patch do `AudioPlayer.kt` era de **14/09 14:22** e
> sobreviveu; a remoção da `publication` só aconteceu em **15/09 08:12**, quando foi rodada à mão.
> Ou seja: durante a compilação testada, o `expo-audio` ainda declarava a `publication`, veio como
> AAR pré-compilado, e o Kotlin patcheado **não foi compilado**.
>
> É a causa nº 2 abaixo, chegando por um caminho novo: o do `expo run:android` que pula o prebuild.
> Ver o aviso do comando no topo.

**As duas causas originais, ambas corrigidas:**

1. **O patch era apagado pelo próprio build.** A fase PREBUILD do EAS roda `expo prebuild` e
   **depois** `yarn install`, que reinstala `node_modules` por cima. Corrigido: três caminhos
   aplicam o patch e `scripts/conferir-patches.js` falha a build se faltar.
2. **O arquivo patcheado nunca era compilado.** O `expo-audio` declara uma `publication` no
   `expo-module.config.json`, e o Expo 57 consome um **AAR pré-compilado** — a build tinha **zero
   tasks `:expo-audio:`**. O `AudioPlayer.kt` era código morto. Corrigido em
   `scripts/patch-expo-audio-do-fonte.js`, que tira a publicação; a build seguinte compilou 49
   tasks do módulo.

A prova de que ainda falhava, no logcat de 21:19: `requestAudioFocus AA=USAGE_UNKNOWN/CONTENT_TYPE_MUSIC`
e `mStreamType 3` (3 é música; alarme é 4).

</details>

**O que resta deste passo:** conferir que o som para em **"Tomei", "Pulei", "Adiar" e "Responder
depois"** — "Silenciar" e o toque na notificação já foram confirmados. Som que continua depois de
respondido é o pior defeito possível aqui.

---

<details>
<summary>Passos 2 e 3 (da tarde de 15/09) — superados pelos quatro defeitos da noite, para o registro</summary>

## Passo 2 — A tela azul trocada pela de "Hora do remédio"

> **Reprovou na build das 14:55, e a causa é nova — o defeito não é o que o nome deste passo dizia.**
>
> A tela azul **não está vazia, e não deixa de subir**. Ela sobe com o conteúdo certo e é
> **substituída** pela tela de "Hora do remédio" logo depois. Foi o "pisca" que o Gabriel descreveu
> nos testes da noite de 15/09.

### O que os cinco testes de 15/09 mostraram

| # | Recentes | Tela | Resultado |
|---|---|---|---|
| 1 | fora | bloqueada | tela azul **pisca** e some; abre "Hora do remédio" |
| 2 | fora | bloqueada | igual, e a de "Hora do remédio" apareceu **duplicada** |
| 3 | **nos** | bloqueada | ✅ tela azul **aparece e fica**; "Silenciar" funcionou |
| 4 | fora | em uso | ✅ heads-up, som certo, toque abre "Hora do remédio" |
| 5 | nos | em uso | ✅ idem |

**O eixo que decide é "recentes", não o bloqueio** — e isso **inverte** o padrão de 12/09, que dizia
o contrário. A inversão é a prova de que `activityNascendo` fez o trabalho dele: a corrida que ele
fechava é justamente a que passou agora (caso 3). O que sobrou é uma falha diferente.

Os casos 4 e 5 estão **integralmente resolvidos** e saem da lista.

### A causa

`consultarRespostaDeAbertura`, chamada no **bootstrap** do app, não passava por guarda nenhuma —
nem `jaEstaEmCena`, nem `jaAbertos`, nem `estaBloqueado`. Ela perguntava ao Notifee "tem notificação
inicial?" e navegava.

E `getInitialNotification` responde a **duas perguntas diferentes com a mesma resposta**. Ela diz
"esta notificação abriu a Activity" — e quando o `fullScreenAction` monta a `MainActivity`, isso é
literalmente verdade: o intent que a abriu **é** o do alarme, sem ninguém ter tocado em nada. O
`AlarmeRaiz` já sabia disso e lê o mesmo intent pelos `initialProps`; era o bootstrap que continuava
lendo como toque.

O filtro de ação não alcançava: um full-screen intent não tem `pressAction`, então a ação vem vazia
e passava como "toque no corpo".

**Por que só fora dos recentes:** o eixo real não é a lista de recentes, é **se o processo sobe do
zero**. Com o app nos recentes o `useDoseNotifications` já montou, o efeito não roda de novo, e o
bootstrap não dispara. É por isso que o caso 3 passou.

**A duplicação do caso 2** tem a mesma raiz: no arranque frio o `PRESS` da MIUI também chega, e os
dois caminhos pediam a mesma rota com `router.push`, que empilha sempre.

### As duas correções

1. **O bootstrap não navega pelo alarme de tela cheia.** `consultarRespostaDeAbertura` devolve `null`
   quando a notificação inicial tem o prefixo `alarme:`. Síncrono, sem corrida — uma guarda de cena
   responderia à pergunta certa, mas o bootstrap pode rodar antes de `AlarmeRaiz` se anunciar.
2. **`abrirHorarioDe` passa a usar `navigate`**, não `push` — segunda camada contra empilhar, igual
   ao que `abrirTelaDeAlarme` já fazia.

**Passa se:** nos casos 1 e 2 (app **fora dos recentes**, tela bloqueada) a tela azul sobe **com o
remédio** e **fica** — sem piscar e sem ser trocada. O caso 3 tem que continuar passando.

---

## Passo 3 — O desbloqueio no "Tomei"

**Investigado em 15/09 à noite, e virou o item A** da lista de pendências no topo. A hipótese
registrada aqui (de que a tela fosse a rota e não a Activity) estava errada: a causa é o
`showWhenLocked` da `MainActivity`, e não há conserto sem separar a Activity do alarme.

---

</details>

---

<details>
<summary>O passo 2 anterior (a tela azul vazia) — resolvido, para o registro</summary>

**Reprovou em 15/09 de manhã, e a causa era outra — achada pela observação do Gabriel.**

Ele notou que **sempre cadastrava a medicação para 1 minuto depois**. Era exatamente isso:

- A dose é gravada sempre em `:00.000` — a grade nasce de `HH:MM`, sem segundos.
- Mas `planejar-avisos-de-dose` tem um **piso**: uma dose vencida, ou que vence em menos de um
  segundo, é agendada para `agora + 1 s` em vez do horário dela.
- A notificação carregava **o gatilho**, não a dose. Os dois divergiam por segundos:
  `10:31:00.000` na grade, `10:31:00.500` no aviso.
- A tela busca doses numa janela de 60 s **a partir do que recebe** — então ela começava a procurar
  *depois* da dose que a originou. Lista vazia, tela azul sem remédio nenhum.

**Só aparece em teste de intervalo curto.** Com a dose daqui a horas, `quando` e `scheduledFor`
coincidem e nada denuncia a diferença. O caminho que funciona nunca tinha sido testado.

> O diagnóstico de 14/09 — a corrida entre a tela montar e a notificação ser cancelada — descrevia
> um problema real, mas não este. A correção daquele dia (`anotarHorarioEntregue`) também não podia
> funcionar com o app fechado: ela depende de um evento que o Notifee emite **antes de existir
> JavaScript para ouvi-lo**, e que não é retido.

**As três correções:**

1. **O aviso passa a carregar o instante da dose** (`instanteDasDoses`). O campo já existia e o
   lembrete adiado já o preenchia, pelo mesmo motivo — faltava a grade fazer o mesmo.
2. **As duas telas alinham a janela ao minuto**, para o defeito não voltar por um caminho novo.
3. **O horário chega por `initialProps`**, lido do intent que abriu a `MainActivity` — síncrono, sem
   depender de evento nenhum. E o último recurso busca a dose pendente mais próxima, em vez de cair
   no instante atual, que garantia lista vazia.

> As três correções valeram: em 15/09 a tela azul subiu **com o remédio** sempre que subiu (caso 3).
> O que falhou foi outra coisa vindo por cima — ver o passo 2 atual.

</details>

---

## Validado — não precisa repetir

| # | O que era | Resultado |
|---|---|---|
| C.2 | Apagar os dados cancela os alarmes | ✅ 14/09 |
| B.7 | 2 ou 3 remédios na tela azul | ✅ com os ajustes de layout do dia |
| B.8 | 4 ou mais: contagem e botão | ✅ |
| B.20 | 4 ou mais: nome e dose de cada | ✅ |
| B.4 | Alarme → notificação → alarme | ✅ nos dois sentidos |
| B.9 | Aviso de estoque às 00:01 | ✅ |
| B.17 | Tela azul com o app nos recentes | ✅ — reconfirmado em 15/09 |
| — | Som no volume de despertador, 5 cenários | ✅ 15/09 — ver passo 1 |
| — | Tela azul, bloqueada e **fora** dos recentes | ✅ 15/09 noite — 3x seguidas |
| — | Tela azul, bloqueada e **nos** recentes | ✅ 15/09 noite — com os textos completos |
| — | Alarme com o celular **em uso**, nos recentes | ✅ 15/09 noite — heads-up, toque abre a tela do horário |

> **Em uso e FORA dos recentes ainda não passa** — é o item B das pendências, no topo.

---

## Decidido, não testado

**E.2 — o fuso.** Decidido, e o comportamento atual está certo: a dose segue o **instante**, então
21:00 em São Paulo toca às 20:00 em Manaus. Não é teste, é decisão.

> **A alegação do artigo sobre o volume de despertador está liberada** desde 15/09 — o passo 1 passou
> em aparelho, nos cinco cenários.

---

## Como testar sem gastar build do EAS

Descoberto em 14/09, e muda o ciclo inteiro: **dá para compilar aqui e instalar pelo cabo.** A
máquina já tem tudo (JDK 21, SDK, NDK 27.1.12297006), e o EAS passa a ser só para distribuir.

**O comando está no topo do documento** — e não é o `expo run:android`, que não passa o init script
do CMake. Ver o aviso lá.

- **`--variant release` é essencial.** Em debug o JavaScript vem do Metro, e o arranque do processo
  muda — justamente o que estes passos medem. Release embute o bundle, como a preview.
- **A primeira compilação demora** (20-40 min, baixando o Gradle). As seguintes ficam em 2-5 min.
- A assinatura difere da do EAS, então pode ser preciso **desinstalar o app antes**. Em 14/09 o
  `adb install -r` preservou os dados; se recusar por assinatura, aí sim os dados de teste se perdem.
- **Duas pedras do caminho, já resolvidas nesta máquina:** o Gradle precisa do
  `android/local.properties` apontando o SDK, e o CMake 3.22.1 (padrão do AGP) trava num loop de
  `Re-running CMake` no Windows — instalar o 3.31.0 pelo `sdkmanager` resolve.

Para ler o que o aparelho faz no disparo:

```
powershell -ExecutionPolicy Bypass -File scripts\logcat-alarme.ps1
```

O `adb` está na máquina mas **fora do PATH** — era por isso que `adb logcat` respondia *command not
found*. O script o encontra sozinho.

---

## Como reportar

Só o que falhar, com o número do passo:

```
passo 1 falhou — tocou, mas ainda no volume de midia
passo 2 — mandei o logcat
resto ok
```
