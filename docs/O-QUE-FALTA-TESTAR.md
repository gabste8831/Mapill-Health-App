# O que falta testar

> Lista de ação. Só o que ainda falta, na ordem de fazer.
>
> O registro completo — o que passou, quando, e o que cada achado revelou — está no
> [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md).

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

## Passo 2 — A tela azul não sobe (bloqueia C.1 e D.5)

**Sem correção ainda. É o que falta investigar antes da próxima build.**

### O que já foi descartado

Estas três hipóteses **foram verificadas e eliminadas** lendo o APK da build 15 com `aapt2` — não
por raciocínio, pelo manifesto real que está no aparelho:

- **`MissingForegroundServiceTypeException`** (era a suspeita principal): o manifesto final traz
  `app.notifee.core.ForegroundService` com `foregroundServiceType=0x2` (`mediaPlayback`). O
  `tools:replace` funcionou. Não há exceção — coerente com o som sair, que prova que o serviço sobe.
- **Permissões ausentes:** `USE_FULL_SCREEN_INTENT`, `SYSTEM_ALERT_WINDOW`, `FOREGROUND_SERVICE` e
  `FOREGROUND_SERVICE_MEDIA_PLAYBACK` estão todas declaradas.
- **Atributos da Activity:** `MainActivity` tem `showWhenLocked=true`, `turnScreenOn=true` e
  `launchMode=2`. Nada no manifesto explica a tela sumir.

**Nada na configuração nativa explica o defeito.** Ele é de runtime.

### O dado que mais aponta

Os dois cenários falham **de forma idêntica**. Bloqueado e em uso são caminhos de código diferentes
(Activity nativa vs. rota do roteador), e uma corrida de tempo não atinge os dois igual — foi essa
observação, do Gabriel, que descartou a hipótese de corrida. O que atinge os dois é algo comum, e o
que entrou junto da regressão, comum aos dois, é o serviço de som.

Uma pista concreta, ainda não confirmada: `index.js` chama `registrarServicoDeSom()` **antes** de
`import "expo-router/entry"`, e `som-do-alarme.ts` importa `expo-audio` no topo do módulo. Se esse
carregamento lançar ou travar no arranque, ele derruba o processo antes de a Activity montar — e o
sintoma seria exatamente este: a notificação chega (é do sistema), o som toca (é do serviço), e a
tela cheia não sobe.

### O que falta para ter certeza

**O logcat do momento do disparo.** É o que separa "o processo morreu ao subir" de "a Activity foi
recusada" de "algo a fechou depois". Sem ele, a próxima build é chute — e chutar aqui é o que já
consumiu builds da cota.

```
powershell -ExecutionPolicy Bypass -File scripts\logcat-alarme.ps1
```

O `adb` existe nesta máquina mas **não está no PATH** (era por isso que `adb logcat` respondia
*command not found*); o script o encontra sozinho. Ligue o celular no cabo com a depuração USB
ativada, rode, dispare o alarme, `Ctrl+C`. Sai em `docs/logcat-alarme.txt`.

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

## Como reportar

Só o que falhar, com o número do passo:

```
passo 1 falhou — tocou, mas ainda no volume de midia
passo 2 — mandei o logcat
resto ok
```
