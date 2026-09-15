# O que falta testar

> Lista de ação. Só o que ainda falta, na ordem de fazer.
>
> O registro completo — o que passou, quando, e o que cada achado revelou — está no
> [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md).

---

> **Atualizado em 15/09, manhã.** A build de 15/09 reprovou os dois passos, e as duas causas foram
> encontradas — **nenhuma delas era o que se supunha**. O passo 1 falhou na compilação, não no
> código; o passo 2 tinha uma causa que só aparece em teste de intervalo curto, e foi a observação
> do Gabriel ("eu sempre cadastrava para 1 minuto depois") que a revelou.
>
> **Tudo abaixo já está corrigido e espera a build seguinte.** Nada aqui é investigação em aberto.

---

## ⚠️ O comando de build mudou — a primeira linha não é opcional

```
node scripts/aplicar-patches.js && npx expo run:android --variant release --device
```

**Foi ela que faltou em 15/09.** O `expo run:android` **pula o prebuild quando `android/` já
existe** — e é o prebuild que aplica os patches. Da segunda compilação em diante, o `expo-audio`
volta a ser consumido como AAR pré-compilado e o alarme sai no volume de mídia, sem nada no log
denunciando.

`npm run android` já faz isso sozinho, e o prebuild agora **confere** antes do Gradle — a
conferência existia só no gancho do EAS, que o caminho do cabo não tem.

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

## Passo 1 — 🔊 O som no volume de despertador

> **Reprovou em 15/09, e a causa era a compilação — o código estava certo o tempo todo.**
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

**Passa se:** o som sai no volume de despertador nos quatro cenários — bloqueado, em uso, app
fechado, e com o volume de **mídia no zero** (a prova de que saiu pelo stream certo).

**E o som tem que parar** em: "Tomei", "Pulei", "Silenciar", "Adiar", "Responder depois", e ao tocar
na notificação. Som que continua depois de respondido é o pior defeito possível aqui.

---

## Passo 2 — A tela azul vazia

**Reprovou em 15/09, e a causa era outra — achada pela observação do Gabriel.**

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

**Passa se:** a tela azul sobe **com o remédio e a dose**, nos dois caminhos — alarme irrompendo
sozinho com a tela bloqueada, e toque na notificação com o celular em uso.

> **Teste também com um intervalo maior** (10 minutos, por exemplo). Se o de 1 minuto passar e o de
> 10 falhar, é defeito novo — e o inverso prova que esta correção pegou.

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
| B.17 | Tela azul com o app nos recentes | ✅ — volta a subir desde a correção de 14/09 |

> **D.5 (tela azul com o app fora dos recentes) e o passo "não sobe com o celular em uso" saíram da
> lista.** Os dois mediam o comportamento de uma tela que nunca subia pelo `fullScreenAction`; com o
> mecanismo primário ligado, refazê-los só faz sentido depois que os passos 1 e 2 passarem.

---

## Decidido, não testado

**E.2 — o fuso.** Decidido, e o comportamento atual está certo: a dose segue o **instante**, então
21:00 em São Paulo toca às 20:00 em Manaus. Não é teste, é decisão.

> **O artigo só pode alegar que o alarme toca no silencioso depois que o passo 1 passar em
> aparelho.** Hoje a alegação não se sustenta: a build testada saiu no volume de mídia.

---

## Como testar sem gastar build do EAS

Descoberto em 14/09, e muda o ciclo inteiro: **dá para compilar aqui e instalar pelo cabo.** A
máquina já tem tudo (JDK 21, SDK, NDK 27.1.12297006), e o EAS passa a ser só para distribuir.

```
node scripts/aplicar-patches.js && npx expo run:android --variant release --device
```

> Sobre a primeira linha, ver o aviso no topo do documento — foi ela que faltou em 15/09.

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
