# O que falta testar

> Lista de ação. Só o que ainda falta, na ordem de fazer.
>
> O registro completo — o que passou, quando, e o que cada achado revelou — está no
> [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md).

---

> **Atualizado em 14/09, fim da noite.** A sessão com o celular no cabo resolveu a tela azul e o
> desbloqueio, e achou a causa real do volume. O relato completo está no
> [achado de 14/09](ROTEIRO-DE-TESTE.md#-achado-de-1409--a-tela-azul-nunca-foi-escolhida-e-faltava-uma-linha-na-mainactivity).
>
> **Tudo o que falta abaixo já está corrigido no código e espera uma build nova** — a ser gerada em
> 15/09. Nada aqui é investigação em aberto.

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

**Corrigido, esperando build.** Duas causas, e a segunda só apareceu no teste em aparelho:

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

## Passo 2 — A tela azul vazia ao tocar na notificação

**Corrigido, esperando build.** Defeito **novo**, criado pela correção da tela azul: antes ela nunca
subia por esse caminho, então nunca disputava com o cancelamento.

Relatado em aparelho em 14/09: a tela azul sobe, mas fica **"literalmente só uma tela azul"**, sem
remédio nenhum. Acontece quando se **toca na notificação** em vez de esperar o alarme irromper.

O logcat mostra a corrida em 70 ms:

```
21:19:05.753  Running "alarme-de-dose"              ← a tela monta
21:19:05.822  Removing notification alarme:dose-…   ← a notificação é apagada
```

`AlarmeRaiz` descobre de qual horário é lendo a notificação, e o caminho do `PRESS` a cancela ao
tratar o toque. Quando a tela vai procurar, não há mais o que procurar, e ela cai no último recurso
— o horário atual, que não tem dose agendada.

A correção anota o horário no `DELIVERED` (antes de existir toque para cancelar), e a tela usa isso
como penúltimo recurso. Ver `anotarHorarioEntregue` em `src/notifications/alarme-em-cena.ts`.

**Passa se:** tocar na notificação do alarme abre a tela azul **com o remédio e a dose**, e não só o
fundo azul.

> Aconteceu em 2 dos 3 testes de 14/09. Quando o alarme irrompeu sozinho com a tela bloqueada,
> funcionou perfeito — a notificação ainda estava lá.

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
npx expo run:android --variant release --device
```

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
