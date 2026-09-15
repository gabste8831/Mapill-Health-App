const { withMainActivity } = require("expo/config-plugins");

/**
 * Faz a `MainActivity` perguntar ao Notifee **qual** componente montar — e é isto que põe a tela
 * azul no ar.
 *
 * ## O defeito que isto resolve
 *
 * A tela azul não subia em cenário nenhum: nem com o celular bloqueado, nem em uso, nem dentro ou
 * fora dos recentes. O alarme tocava, e o que aparecia era a tela "Hora do remédio". O padrão
 * idêntico nos dois cenários foi o que derrubou a hipótese de corrida de tempo — caminhos de código
 * diferentes não falham igual por acaso.
 *
 * O logcat do disparo de 14/09 às 19:59 mostrou o que acontecia de verdade:
 *
 * ```
 * 19:59:00.220  No subscribers registered for MainComponentEvent   ← o pedido da tela azul
 * 19:59:00.300  initialize ReactContext
 * 19:59:00.661  occludedChanged mOccluded=true ... MainActivity    ← a tela cheia SUBIU
 * 19:59:01.432  launched taskId: 1                                 ← o index.js roda só aqui
 * 19:59:02.200  Displayed .MainActivity: +1s559ms
 * ```
 *
 * **O `fullScreenAction` funcionou.** A Activity irrompeu sobre o bloqueio em 660 ms e ficou 28
 * segundos na frente. O que subiu foi a `MainActivity` com o componente **padrão** — o app inteiro —
 * e não `AlarmeRaiz`. Daí a tela de horário aparecer "no lugar" da azul: nunca houve troca, a azul é
 * que nunca foi escolhida.
 *
 * ## Por que o registro no `index.js` não bastava
 *
 * `NotificationManager.java:418` posta um `MainComponentEvent` **sticky** com o nome do componente,
 * e `Notifee.getMainComponent(defaultComponent)` (`Notifee.java:101`) o consome. Só que esse método
 * é `@KeepForSdk`: é API para o **app** chamar, não uso interno da biblioteca. Quem tem de chamá-lo
 * é a `MainActivity`, ao responder que componente montar.
 *
 * Sem o override, `getMainComponentName()` devolve `"main"` — o app — e o evento sticky fica sem
 * ninguém para consumir. O `AppRegistry.registerComponent` do `index.js` está correto e continua
 * necessário: ele é quem faz o nome `AlarmeRaiz` existir. Mas registrar o componente não adianta se
 * ninguém **pede** por ele.
 *
 * Isso também explica o histórico. A tela azul já apareceu em builds anteriores — por outro caminho,
 * o `PRESS` e a navegação do listener, nunca pelo `fullScreenAction`. As correções de 12/09 e 13/09
 * mexeram nas guardas de corrida entre esses caminhos, e por isso o comportamento oscilava: o
 * mecanismo primário nunca esteve ligado.
 *
 * ## Por que um plugin, e por que a própria lib não faz isso
 *
 * O config plugin da `react-native-notify-kit` aplica manifesto Android, ícones e os mods de NSE do
 * iOS — nada que toque a `MainActivity`. E a `android/` do projeto é gerada pelo prebuild (CNG), não
 * versionada: editar na mão se perde na próxima build.
 *
 * A biblioteca **avisa** que este passo existe, no JSDoc de `mainComponent`:
 *
 * > *"For this to correctly function on Android, a minor native code change is required."*
 *
 * E aponta para uma página (`/react-native/android/behaviour#full-screen`) que **não vem no pacote**
 * — só existe no site. É por isso que o passo passou despercebido: o aviso está lá, a instrução não.
 *
 * ## Por que é seguro chamar tão cedo
 *
 * `getInstance()` (`Notifee.java:68`) nunca devolve `null`: sem inicialização ele registra um aviso
 * e devolve uma instância nova. E `getMainComponent` cai no padrão quando não há evento. Os dois
 * casos em que o alarme mais importa — processo subindo do zero de madrugada, app fora dos recentes
 * — são exatamente os que chamariam isto antes de tudo, e nenhum deles quebra.
 */

/** O que a `MainActivity` responde hoje: o componente padrão do app. */
const ORIGINAL = `override fun getMainComponentName(): String = "main"`;

/**
 * O que ela passa a responder: o que o Notifee pediu, ou o app quando não há pedido.
 *
 * `"main"` continua sendo o padrão, então **toda abertura normal do app segue idêntica** — o desvio
 * só acontece quando há um alarme de tela cheia esperando, que é quando o sticky existe.
 */
const PATCH = `// [Mapill] Quem decide o componente é o Notifee, não a Activity.
  //
  // Com um alarme de tela cheia esperando, o `+"`getMainComponent`"+` devolve `+"`AlarmeRaiz`"+` — a tela azul —, e
  // é este override que a põe no ar. Sem ele a MainActivity monta "main" (o app inteiro) e a tela
  // azul nunca sobe, ainda que o fullScreenAction funcione: foi o defeito medido em 14/09.
  //
  // Ver plugins/tela-do-alarme-na-main-activity.js
  override fun getMainComponentName(): String =
    Notifee.getInstance().getMainComponent("main")`;

/**
 * O corpo vazio do delegate que o Expo gera — é onde o `getLaunchOptions` entra.
 *
 * Casar o `){}` fechado, e não criar um `createReactActivityDelegate` próprio: o Expo já tem o
 * dele, envolto em `ReactActivityDelegateWrapper`, e dois overrides do mesmo método não compilam.
 * O wrapper precisa ser preservado — é ele que liga os módulos do Expo ao ciclo da Activity.
 */
const DELEGATE_ORIGINAL = `          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})`;

/**
 * O delegate com o horário do alarme entrando como prop.
 *
 * ## O defeito que isto resolve
 *
 * A tela azul subia **vazia** com o app fechado, e a causa é de ordem, não de corrida: o Notifee
 * emite o `DELIVERED` no instante do disparo, quando ainda não há JavaScript de pé — o bundle só
 * executa ~1,2 s depois. O evento não é retido (`EventBus.post`, não `postSticky`), então quem
 * assina depois nunca o vê. As três fontes que `AlarmeRaiz` consultava chegavam todas vazias, e a
 * tela caía no último recurso: o horário atual, que não tem dose agendada.
 *
 * ## Por que aqui, e não numa quarta fonte
 *
 * Porque o dado **sempre esteve aqui**. O Notifee põe o bundle inteiro da notificação no intent que
 * abre esta Activity (`NotificationManager.java:417`), e ninguém o lia. Lê-lo no `getLaunchOptions`
 * entrega o horário **na montagem, síncrono** — sem `await`, sem depender de evento, de sticky
 * consumível ou de a notificação ainda estar na bandeja.
 *
 * Vale para os dois caminhos, porque os dois passam por esta Activity: o `fullScreenAction` põe o
 * extra no intent, e o toque na notificação também.
 */
const DELEGATE_PATCH = `          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){
            // [Mapill] O horário do alarme chega à tela como prop, na montagem.
            //
            // Sem isto a tela azul sobe vazia com o app fechado: o DELIVERED que alimentava as
            // buscas do AlarmeRaiz é emitido antes de existir JavaScript para ouvi-lo, e não é
            // retido. O bundle da notificação, porém, vem no intent que abriu esta Activity.
            //
            // Ver plugins/tela-do-alarme-na-main-activity.js
            override fun getLaunchOptions(): Bundle? {
              val daNotificacao = intent?.getBundleExtra("notification")
                ?: return super.getLaunchOptions()
              return Bundle().apply {
                super.getLaunchOptions()?.let { putAll(it) }
                putBundle("notificacaoDoAlarme", daNotificacao)
              }
            }
          })`;

/** O import que o patch exige. */
const IMPORT = "import app.notifee.core.Notifee";

/**
 * A marca dos patches, para não aplicar duas vezes. `prebuild` roda mais de uma vez.
 *
 * É a do **segundo** patch, e não a do primeiro: os dois são aplicados juntos, então a presença do
 * último prova que ambos entraram. Marcando pelo primeiro, um arquivo com só ele — de uma versão
 * anterior do plugin — seria dado por pronto, e o horário nunca chegaria à tela.
 */
const MARCA = "notificacaoDoAlarme";

function withTelaDoAlarmeNaMainActivity(config) {
  return withMainActivity(config, (config) => {
    const { language, contents } = config.modResults;

    /**
     * Kotlin é o que o Expo 57 gera. Falhar em vez de tentar adivinhar a sintaxe do Java é
     * deliberado: um patch que erra o alvo e segue calado devolve a tela azul ao defeito de 14/09,
     * sem nada na build para denunciar.
     */
    if (language !== "kt") {
      throw new Error(
        `[tela-do-alarme] a MainActivity está em '${language}', e este plugin só sabe Kotlin. ` +
          `Sem o override de getMainComponentName a tela cheia do alarme não sobe.`,
      );
    }

    if (contents.includes(MARCA)) return config;

    if (!contents.includes(ORIGINAL)) {
      throw new Error(
        `[tela-do-alarme] não encontrei '${ORIGINAL}' na MainActivity. O template do Expo mudou. ` +
          `Confira o arquivo gerado em android/app/src/main/java/.../MainActivity.kt e ajuste o ` +
          `plugin — sem este override a tela azul do alarme não sobe, e nada na build avisa.`,
      );
    }

    let novo = contents.replace(ORIGINAL, PATCH);

    /**
     * O import entra depois do `package`, que é o único lugar válido em Kotlin.
     *
     * `addImports` do `AndroidConfig.CodeMod` faria isto, mas ele insere depois do último import já
     * existente — e a ordem alfabética do arquivo gerado não é garantida. Fazer à mão aqui é uma
     * linha, e falha de forma visível se o `package` sumir.
     */
    if (!novo.includes(IMPORT)) {
      const pacote = novo.match(/^package .+$/m);
      if (pacote === null) {
        throw new Error(
          "[tela-do-alarme] a MainActivity não tem declaração de package — não sei onde pôr o import.",
        );
      }
      novo = novo.replace(pacote[0], `${pacote[0]}\n\n${IMPORT}`);
    }

    /**
     * O segundo patch: o horário do alarme entrando como prop.
     *
     * Falha a build se o alvo sumir, como o primeiro. Sem ele a tela azul volta a subir vazia com o
     * app fechado — e esse é o tipo de defeito que só aparece em aparelho, depois da build inteira.
     */
    if (!novo.includes(DELEGATE_ORIGINAL)) {
      throw new Error(
        `[tela-do-alarme] não encontrei o corpo do ReactActivityDelegate na MainActivity. O ` +
          `template do Expo mudou. Sem o getLaunchOptions a tela azul sobe vazia com o app ` +
          `fechado, porque o horário do alarme não chega a ela.`,
      );
    }
    novo = novo.replace(DELEGATE_ORIGINAL, DELEGATE_PATCH);

    console.log(
      "[tela-do-alarme] MainActivity agora pergunta o componente ao Notifee, e passa o horário.",
    );
    config.modResults.contents = novo;

    return config;
  });
}

module.exports = withTelaDoAlarmeNaMainActivity;
