# O que falta testar

> Lista de ação. Só o que ainda falta, na ordem de fazer.
>
> O registro completo — o que passou, quando, e o que cada achado revelou — está no
> [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md).

---

> **As três causas foram encontradas e corrigidas em 14/09 à noite**, com o celular no cabo e o
> logcat gravando. O relato completo está no
> [achado de 14/09](ROTEIRO-DE-TESTE.md#-achado-de-1409--a-tela-azul-nunca-foi-escolhida-e-faltava-uma-linha-na-mainactivity).
> Falta validar em aparelho — agora por build local, sem gastar a cota do EAS.

---

## O que a build 15 (14/09, noite) mostrou

A build 15 foi a primeira que compilou com o módulo de desbloqueio dentro. O teste em aparelho
derrubou duas suposições e **deixou um defeito novo**, que é o que manda agora.

| # | O que era | Resultado em 14/09 |
|---|---|---|
| C.2 | Apagar os dados cancela os alarmes | ✅ **passou** |
| C.1 | Desbloqueio ao entrar pela tela azul | ⛔ **não testável** — a tela azul não sobe |
| 3 | Tela azul não sobe com o celular em uso | ⚠️ "correto" por acidente — ver abaixo |
| E.1 | Som no volume de despertador | ❌ **falhou** — saiu no volume de mídia |
| D.5 | Tela azul com o app fora dos recentes | ⛔ **não testável** — a tela azul não sobe |

**A tela azul não sobe em cenário nenhum.** Bloqueado ou em uso, com o app nos recentes ou fora
deles: o alarme toca e a notificação leva direto a "Hora do remédio". É regressão — antes ela subia
nos dois casos.

O passo 3 "passar" não é resultado: ele pede que a tela azul **não** suba com o celular em uso, e
ela não sobe em lugar nenhum. Passou pelo motivo errado, e volta para a fila quando a azul voltar.

---

## Passo 1 — E.1: o som no volume de despertador

**Corrigido no código em 14/09 (commit `fa68477`), esperando build.**

O patch que escolhe o stream existia e estava certo desde 14/09 de tarde — e **nunca chegou ao
aparelho**. A ordem da fase PREBUILD do EAS, lida no log da build:

```
expo prebuild --no-install   ← o plugin aplica o patch em node_modules/expo-audio
✔ Finished prebuild
yarn install                 ← node_modules reinstalado: o patch morre aqui
```

O install roda **depois** do prebuild e restaura o `AudioPlayer.kt` original. O Gradle compila o
arquivo limpo, o player nasce `USAGE_MEDIA`, e o alarme sai no volume de música. O `throw` do plugin
não denunciava nada: ele falha quando o **alvo some**, e o install devolve o arquivo original
intacto — alvo perfeito, sem o patch.

Agora o patch é aplicado por três caminhos (prebuild, `postinstall`, `eas-build-post-install`) e uma
quarta peça **falha a build** se o arquivo chegar ao Gradle sem a marca. O cenário que quebrou —
`node_modules` reinstalado — foi reproduzido em terra e o `postinstall` recuperou sozinho.

**O que ainda não foi verificado:** que `USAGE_ALARM` produz o volume de despertador **neste
aparelho**. A API é a correta e o Kotlin compila, mas isso é inferência até alguém ouvir.

**Passa se:** o som sai no volume de despertador nos quatro cenários — bloqueado, em uso, app
fechado, e com o volume de **mídia no zero** (a prova de que saiu pelo stream certo).

**E o som tem que parar** em: "Tomei", "Pulei", "Silenciar", "Adiar", "Responder depois", e ao tocar
na notificação. Som que continua depois de respondido é o pior defeito possível aqui — se
acontecer, diga em qual botão.

---

## Passo 2 — A tela azul

**Causa encontrada e corrigida em 14/09. Falta validar.**

A tela cheia **sempre funcionou** — o que subia era o app, não `AlarmeRaiz`. Faltava a
`MainActivity` perguntar ao Notifee qual componente montar, um passo que a biblioteca exige e cuja
instrução não vem no pacote. Corrigido em `plugins/tela-do-alarme-na-main-activity.js`.

O relato completo, com o logcat que mostrou a sequência, está no
[achado de 14/09](ROTEIRO-DE-TESTE.md#-achado-de-1409--a-tela-azul-nunca-foi-escolhida-e-faltava-uma-linha-na-mainactivity).

**Passa se:** com o celular **bloqueado**, o alarme toca e a **tela azul** sobe — não a tela "Hora
do remédio".

> Descartados pela leitura do APK da build 15 com `aapt2`, para ninguém reinvestigar: o
> `foregroundServiceType` está no manifesto final (`mediaPlayback`), as permissões estão todas
> declaradas (`USE_FULL_SCREEN_INTENT` inclusive), e a `MainActivity` tem `showWhenLocked` e
> `turnScreenOn`. Nada na configuração nativa explicava o defeito.

---

## Passo 3 — C.1: entrar no app pela tela azul exige desbloqueio

**Bloqueado pelo passo 2.** O módulo de desbloqueio compilou e está no APK, mas o botão que pede a
senha vive na tela azul — sem ela, não há o que testar. **C.1 não reprovou: não foi exercitado.**

Celular **bloqueado**, o alarme toca, a tela azul sobe.

**Passa se:**
- **"Tomei"**, **"Pulei"**, **silenciar** e **adiar** funcionam **sem pedir senha**, e o celular
  volta para o bloqueio depois — sem mostrar o app
- **"Ver e confirmar no app"** → o celular **pede a senha ou a biometria** antes de abrir
- **Cancelando a senha** → volta para a tela azul com o alarme ainda tocando, e o app não aparece

> Confira também com o celular **desbloqueado**: aí o botão abre o app direto, sem pedir nada.

---

## Passo 4 — D.5: a tela azul com o app fora dos recentes

**Bloqueado pelo passo 2.** Ele mede a estabilidade de uma tela que hoje não sobe em cenário nenhum.

Tire o app dos recentes e espere o alarme. **Tente 4 vezes** — é defeito de corrida de tempo, e
"passou" e "passou nas 4 tentativas" não são a mesma informação.

**Passa se:** a tela azul sobe e fica, nas 4.

---

## Passo 5 — A tela azul não sobe com o celular em uso

**Volta à fila quando o passo 2 for resolvido.** Em 14/09 ele "passou", mas pelo motivo errado: pede
que a azul não suba com o celular em uso, e ela não subia em lugar nenhum. Só vale como resultado
quando a azul voltar a subir com o celular bloqueado.

Celular **desbloqueado**, usando outro app, e o alarme dispara. Toque na notificação.

**Passa se:** abre a tela **"Hora do remédio"**, e não a tela azul.

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
| B.17 | Tela azul com o app nos recentes | ✅ na build 13 — **regrediu na 15** |

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
npx expo run:android --variant release --device
```

- **`--variant release` é essencial.** Em debug o JavaScript vem do Metro, e o arranque do processo
  muda — justamente o que estes passos medem. Release embute o bundle, como a preview.
- **A primeira compilação demora** (20-40 min, baixando o Gradle). As seguintes ficam em 2-5 min.
- A assinatura difere da do EAS, então pode ser preciso **desinstalar o app antes**. Os dados de
  teste se perdem.

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
