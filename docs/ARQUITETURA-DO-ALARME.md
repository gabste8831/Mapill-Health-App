# A arquitetura do alarme

> Como o módulo funciona **hoje** — não como se chegou até aqui. O histórico das investigações está
> em [`O-QUE-FALTA-TESTAR.md`](O-QUE-FALTA-TESTAR.md) e no [`ROTEIRO-DE-TESTE.md`](ROTEIRO-DE-TESTE.md).
>
> Escrito em 16/09, depois de os quatro cenários passarem em aparelho.

---

## Por que este módulo é o mais complexo do app

Um alarme de medicação promete algo que o resto do aplicativo não precisa prometer: **funcionar
quando o app não está rodando**. Às 6h da manhã, com o celular bloqueado na mesa de cabeceira e o
Mapill fechado desde a noite anterior, alguma coisa tem de acender a tela, tocar alto, e mostrar
qual remédio tomar.

Isso põe o módulo num território onde quase nada do React Native ajuda: não há componente montado
para ouvir eventos, não há rota para navegar, não há contexto para ler. Cada peça abaixo existe por
causa de uma dessas ausências.

---

## O caminho de um alarme, do cadastro ao som

```
  planejar-avisos-de-dose          decide QUANDO avisar     (domínio puro)
            ↓
  notifee-gateway.agendar          registra no AlarmManager (infraestrutura)
            ↓
  [ o aparelho espera ]
            ↓
  ┌─────────────────────┬──────────────────────────┐
  │ aparelho BLOQUEADO  │ aparelho EM USO          │
  │ fullScreenAction    │ Android rebaixa p/ heads-up │
  │        ↓            │        ↓                 │
  │  AlarmeActivity     │  notificação na bandeja  │
  │  (tela cheia azul)  │  toque → tela do horário │
  └─────────────────────┴──────────────────────────┘
    ↓
  foreground service toca o som (independe de tela)
```

### 1. Quem decide quando — `src/domain/use-cases/planejar-avisos-de-dose.ts`

Use-case **puro**: sem Expo, sem banco, sem relógio do sistema — o `agora` é injetado. Isso o torna
verificável fora do aparelho, que é o ponto: a regra de *quando* avisar é aritmética de datas, e
conferi-la não pode exigir um Android na mesa.

**Um aviso por horário, não por dose.** Quem toma quatro remédios às 08:00 receberia quatro
notificações idênticas em sequência, e a quarta ensina a ignorar a primeira.

**A janela.** "3× ao dia por 6 meses" são 540 avisos numa prescrição só — acima do que o sistema
mantém pendente. A grade é reabastecida a cada abertura do app.

**A tolerância de 2 minutos.** Reabrir o app às 08:00:30 não pode cancelar o aviso das 08:00 sem
reagendar. Doses vencidas há até 2 minutos continuam valendo.

**O piso do gatilho** — e é aqui que mora a sutileza que custou mais caro:

```ts
const pisoDoGatilho = new Date(input.agora.getTime() + 1_000);
const quando = instanteDaDose < pisoDoGatilho ? pisoDoGatilho : instanteDaDose;
```

O Notifee **recusa** um timestamp no passado, e a exceção derrubaria o laço inteiro de
reagendamento. Mas a tolerância acima deixa passar doses recém-vencidas. O piso reconcilia os dois:
uma dose vencida é agendada para "agora + 1 s".

**A consequência disso é `instanteDasDoses`**, e ela não é óbvia: quando o piso age, *a hora de
tocar deixa de ser a hora da dose*. A grade tem `10:31:00.000`; o gatilho vira `10:31:00.500`. Como
a tela busca doses numa janela de 60 s a partir do que recebe, mandar o gatilho a faria procurar
**depois** da dose que a originou — e subir vazia. Por isso o aviso carrega os dois, e a notificação
leva o instante da **dose**.

### 2. Quem agenda — `src/notifications/notifee-gateway.ts`

```ts
type: TriggerType.TIMESTAMP,
alarmManager: { type: AlarmType.SET_ALARM_CLOCK }
```

**`SET_ALARM_CLOCK` é a categoria do despertador** — a mesma que o relógio nativo usa. É imune ao
agrupamento do Doze, diferente de `SET_EXACT_AND_ALLOW_WHILE_IDLE`, que o Android pode adiar para
economizar bateria. É o que justifica a permissão `USE_EXACT_ALARM`.

**Os dois modos usam a mesma categoria.** Alarme e lembrete são igualmente pontuais; o que os separa
é o **canal**, não a precisão.

O `data` da notificação carrega três strings — e a terceira é a que importa:

| Campo | Conteúdo |
|---|---|
| `chave` | identifica o aviso, derivada do horário |
| `doseScheduleIds` | as doses cobertas, em JSON |
| `scheduledFor` | **o instante da dose**, não o de tocar |

### 3. O disparo

**Aparelho bloqueado** → `fullScreenAction` abre a `AlarmeActivity` diretamente:

```ts
fullScreenAction: {
  id: "alarme",
  launchActivity: ACTIVITY_DO_ALARME,   // "com.gabsteffens.mapillapp.AlarmeActivity"
  launchActivityFlags: [NEW_TASK],
  mainComponent: COMPONENTE_DE_ALARME,  // "alarme-de-dose"
}
```

Três detalhes, todos necessários:
- `launchActivity` recebe o **nome completo da classe**, e a biblioteca o usa literalmente
- `NEW_TASK` é **explícito** porque o caminho do full-screen não o aplica sozinho — sem ele a
  Activity não nasce em task própria, e fechá-la revelaria o app
- `mainComponent` **não é redundância**: o extra `notification`, que leva o horário à tela, só é
  anexado ao intent quando ele está presente

**Aparelho em uso** → o Android rebaixa a tela cheia para heads-up. Sobem então o serviço de som, a
notificação na bandeja com "Tomei"/"Pulei", e o toque no corpo leva à tela do horário — nunca à tela
azul.

---

## As duas Activities, e por que são duas

Esta é a decisão estrutural do módulo, e ela resolve quatro problemas de uma vez.

```
MainActivity                      AlarmeActivity
├─ getMainComponentName = "main"  ├─ getMainComponentName = "alarme-de-dose"
├─ splash do Expo                 ├─ sem splash
├─ SEM showWhenLocked             ├─ showWhenLocked + turnScreenOn
└─ task normal                    └─ singleInstance, taskAffinity="", excludeFromRecents
```

**`showWhenLocked` é atributo de Activity, não de tela.** Enquanto as duas telas dividiam a
`MainActivity`, a licença de aparecer sobre o bloqueio era do **app inteiro** — responder "Tomei"
com o celular bloqueado deixava medicamentos, histórico e ficha de saúde acessíveis sem senha.

E não havia como consertar depois do fato: quando a Activity sobe com `showWhenLocked` +
`turnScreenOn`, o Android **já dispensou o keyguard**, e não existe API de re-bloqueio para app
nenhum. `finishAndRemoveTask` sozinho não desfaz isso.

Com as tasks separadas, fechar o alarme devolve o aparelho ao bloqueio — porque o app nunca teve
permissão de estar ali.

**O componente de cada uma é literal**, e isso elimina uma classe inteira de defeitos. O Notifee
posta um evento *sticky* dizendo qual componente montar, mas ele é postado quando a notificação é
**exibida**, não quando alguém toca — então ficava pendurado e era consumido pela abertura seguinte,
qualquer que fosse. Nenhuma guarda nativa resolvia: no ponto em que o componente é decidido, o
`intent` ainda é `null`.

Quando cada Activity já é a de um dono só, não há o que adivinhar.

---

## Como o som funciona — e por que não é o som do canal

**Quem toca o som é o app, não o sistema.** O canal do alarme é criado **mudo** de propósito.

Isso resolve dois defeitos que são o mesmo defeito:

1. **O volume errado.** O `AudioAttributes` do canal pede `USAGE_ALARM` e o Android ignora — ali o
   atributo é dica, não ordem. O som saía no volume de **mídia**, então quem baixasse a mídia não
   ouviria o alarme.
2. **O silêncio com o celular em uso.** Com o aparelho destravado o Android rebaixa a tela cheia
   para heads-up e **não toca som nenhum** — com o canal sonoro e o volume alto.

Tocando do app, o stream é escolha nossa e o disparo não depende de o Android decidir tocar.

**Dentro de um foreground service**, porque a tela do alarme nem sempre monta: com o celular em uso
o Android rebaixa a tela cheia, e com o app fechado não há processo para navegar. Um player preso ao
ciclo de vida de uma tela emudeceria exatamente nos casos em que o alarme mais importa. O serviço
também é o que mantém o processo vivo enquanto o som toca.

`comecarASoar()` é **idempotente** porque dois caminhos podem pedir o som — o serviço, na entrega, e
a tela, ao montar. E um `setInterval` de 6 s vigia o player: se ele tiver sido pausado por disputa
de foco de áudio, toca de novo. Um alarme de medicação não pode depender de uma garantia só.

---

## O estado que vive fora do React

Dois módulos guardam estado em variáveis de módulo, e não em componentes. O motivo é o mesmo nos
dois: **quem precisa do estado nem sempre é um componente**.

### `alarme-em-cena.ts` — impede duas telas ao mesmo tempo

A tela do alarme tem dois pontos de entrada **no mesmo processo JavaScript**: a Activity nativa e a
rota `/alarme/[instante]`. O `index.js` registra o componente nativo e logo abaixo importa
`expo-router/entry`, que sobe o app inteiro. Quando o alarme irrompe com o app em segundo plano, as
duas coisas acontecem — e o sintoma é som duplicado, com uma tela por cima da outra.

Os dois lados não compartilham árvore de componentes (um é `AppRegistry`, o outro é o roteador). O
que eles compartilham é o módulo.

A peça mais sutil aqui é o sinalizador **"a Activity está nascendo"**: entre o nascimento da Activity
e o momento em que a tela se registra há uma janela assíncrona (abrir o banco, descobrir o horário).
Nessa janela o app ficava cego, e um toque que chegasse ali fechava a tela que estava subindo.

### `doses-resolvidas.ts` — a tela reage na hora

A tela do alarme é a única do app que **não pode esperar**: enquanto toca, ela está afirmando que há
resposta pendente. Ela revalida sozinha a cada 3 s, mas alguns segundos de alarme tocando depois de
respondido leem como defeito.

Nada aqui é fonte de verdade — o banco é. Se um aviso se perder, a revalidação periódica ainda
corrige; o custo é o atraso, não um estado errado.

---

## Os patches, e por que eles existem

Três correções em `node_modules/`, aplicadas por `scripts/aplicar-patches.js` e **conferidas** por
`scripts/conferir-patches.js`, que falha a build se faltarem.

A conferência não é zelo excessivo: a fase de instalação do EAS roda `expo prebuild` e **depois**
`yarn install`, que reinstala `node_modules` por cima. O patch é aplicado, o log diz que foi, e o
install seguinte o apaga — falha silenciosa, que só aparece como "o alarme saiu no volume errado"
depois de 40 minutos de build e um teste em aparelho.

| Patch | O que corrige |
|---|---|
| `patch-expo-audio-do-fonte.js` | O Expo 57 consome `expo-audio` como **AAR pré-compilado** — o Kotlin patcheado nunca chegaria ao compilador. Remove a `publication`. **Roda primeiro:** sem ele o patch seguinte é código morto. |
| `patch-som-de-despertador.js` | Faz o player nascer com usage de **alarme** em vez do padrão (mídia). É o que põe o som no volume de despertador. |
| `patch-servico-sem-atraso.js` | A biblioteca envia `foregroundServiceBehavior: IMMEDIATE`, mas todo número em JS é ponto flutuante e chega como `Double`; o lado Java lê com `getInt()`, que devolve `0` — o adiamento de até 10 s que o `IMMEDIATE` existia para evitar. |

O terceiro é um bom exemplo de defeito que só o logcat revela: nada falha, nada avisa, e o alarme
simplesmente chega atrasado.

---

## Os plugins

Cinco, todos em `plugins/`, aplicados pelo prebuild — a pasta `android/` é gerada, então editar o
Kotlin à mão se perde na próxima build.

| Plugin | O que faz |
|---|---|
| `activity-propria-do-alarme.js` | **Escreve** a `AlarmeActivity.kt` e a declara no manifesto; **remove** `showWhenLocked` da `MainActivity`. É o plugin que separa a licença de aparecer sobre o bloqueio. |
| `tela-do-alarme-na-main-activity.js` | Fixa o componente da `MainActivity` em `"main"`, injeta `onNewIntent` e `getLaunchOptions`. |
| `alarme-em-tela-cheia.js` | Declara o tipo do serviço de som e reexporta os receptores de boot do Notifee — sem eles o alarme agendado **some no reboot**. |
| `som-do-alarme-em-despertador.js` | O gancho que aplica e confere os patches no prebuild. |
| `volume-de-despertador.js` | Patch do `AudioAttributes` do canal. **Não alcança o que promete** (o atributo é dica, não ordem) — ficou porque não custa nada, e o som real vem do serviço. |

---

## A tela, e as três formas

`AlarmeRaiz` é o **segundo ponto de entrada do app**, e precisa refazer tudo o que o `_layout.tsx`
prepara para o resto — porque quando ele sobe, o roteador pode nem existir:

- abre o banco
- **carrega as fontes** (sem elas o Android usa a do sistema, e as métricas fixas da folha cortam o
  texto no meio)
- **esconde a splash** (o `_layout` trava o auto-hide no topo do módulo, o que vale em qualquer
  processo; mas quem a esconde vive dentro do roteador — e o fundo dela é o mesmo azul do tema, o
  que a fazia passar por "tela azul vazia")

O que ele deliberadamente **não** repete é o gate de primeira execução. Um alarme só existe se
alguém já cadastrou um remédio — repetir o gate seria pedir consentimento às três da manhã a quem já
consentiu.

**A tela tem três formas, e a quantidade de doses escolhe qual:**

| Doses | Forma |
|---|---|
| 1 | Detalhada — foto grande, nome em corpo 30, botões na própria tela |
| 2 ou 3 | Lista com miniatura, nome, quantidade e orientação |
| 4+ | Só nome e dose, mais o caminho para o app |

**E a forma é congelada na primeira renderização.** O hook revalida a cada 3 s, e uma dose
confirmada em outro lugar sai da lista — sem congelar, quatro remédios virariam três **no meio do
uso**: o botão único viraria dois, o rodapé mudaria de tamanho. Congela-se a forma, não a lista: os
remédios mostrados são sempre os de verdade.

---

## O módulo nativo `desbloqueio`

Três funções, e o que elas respondem:

| Função | Para quê |
|---|---|
| `estaBloqueado()` | Se a tela de bloqueio está na frente. **Três estados**, e isso importa: `null` é "não consegui perguntar" (build sem o módulo), e tratá-lo como `false` faria a tela cheia parar de subir. |
| `pedirDesbloqueio()` | Pede a autenticação antes de entrar no app a partir do alarme. `false` quando a pessoa desiste — desistir não é erro. |
| `fecharTelaDoAlarme()` | Fecha a Activity do alarme sem matar o processo. `BackHandler.exitApp()` levaria junto o app aberto atrás e o serviço que toca o som. |

**Não existe função para reimpor o bloqueio**, e isso está anotado no próprio módulo para quem for
procurá-la: o Android não expõe essa API para app nenhum. A solução teve de ser arquitetural.

---

## O que este módulo ensina sobre o resto do app

Três padrões que valem além do alarme:

**1. O segundo ponto de entrada.** Tudo o que o `_layout.tsx` prepara — fontes, splash, tema, banco
— não existe fora da árvore do `expo-router`. Quem escrever outra tela que monte por `AppRegistry`
vai reencontrar exatamente os mesmos quatro problemas.

**2. Estado que sobrevive ao React.** Quando dois caminhos precisam se coordenar e um deles roda com
o app fechado, o estado tem de morar no módulo. Um `useState` seria zerado a cada montagem.

**3. Medir antes de deduzir.** Três tentativas de guarda nativa falharam por uma suposição sobre
*quando* o `intent` está disponível. Um `Log.i` dentro do método respondeu em um disparo o que duas
builds de dedução não resolveram.
