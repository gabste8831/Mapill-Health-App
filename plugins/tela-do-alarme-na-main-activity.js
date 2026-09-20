const { withMainActivity } = require("expo/config-plugins");

/**
 * Faz a `MainActivity` perguntar ao Notifee **qual** componente montar - e é isto que põe a tela
 * azul no ar.
 *
 * ## O defeito que isto resolve
 *
 * A tela azul não subia em cenário nenhum: nem com o celular bloqueado, nem em uso, nem dentro ou
 * fora dos recentes. O alarme tocava, e o que aparecia era a tela "Hora do remédio". O padrão
 * idêntico nos dois cenários foi o que derrubou a hipótese de corrida de tempo - caminhos de código
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
 * segundos na frente. O que subiu foi a `MainActivity` com o componente **padrão** - o app inteiro -
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
 * Sem o override, `getMainComponentName()` devolve `"main"` - o app - e o evento sticky fica sem
 * ninguém para consumir. O `AppRegistry.registerComponent` do `index.js` está correto e continua
 * necessário: ele é quem faz o nome `AlarmeRaiz` existir. Mas registrar o componente não adianta se
 * ninguém **pede** por ele.
 *
 * Isso também explica o histórico. A tela azul já apareceu em builds anteriores - por outro caminho,
 * o `PRESS` e a navegação do listener, nunca pelo `fullScreenAction`. As correções de 12/09 e 13/09
 * mexeram nas guardas de corrida entre esses caminhos, e por isso o comportamento oscilava: o
 * mecanismo primário nunca esteve ligado.
 *
 * ## Por que um plugin, e por que a própria lib não faz isso
 *
 * O config plugin da `react-native-notify-kit` aplica manifesto Android, ícones e os mods de NSE do
 * iOS - nada que toque a `MainActivity`. E a `android/` do projeto é gerada pelo prebuild (CNG), não
 * versionada: editar na mão se perde na próxima build.
 *
 * A biblioteca **avisa** que este passo existe, no JSDoc de `mainComponent`:
 *
 * > *"For this to correctly function on Android, a minor native code change is required."*
 *
 * E aponta para uma página (`/react-native/android/behaviour#full-screen`) que **não vem no pacote**
 * - só existe no site. É por isso que o passo passou despercebido: o aviso está lá, a instrução não.
 *
 * ## Por que é seguro chamar tão cedo
 *
 * `getInstance()` (`Notifee.java:68`) nunca devolve `null`: sem inicialização ele registra um aviso
 * e devolve uma instância nova. E `getMainComponent` cai no padrão quando não há evento. Os dois
 * casos em que o alarme mais importa - processo subindo do zero de madrugada, app fora dos recentes
 * - são exatamente os que chamariam isto antes de tudo, e nenhum deles quebra.
 */

/** O que a `MainActivity` responde hoje: o componente padrão do app. */
const ORIGINAL = `override fun getMainComponentName(): String = "main"`;

/**
 * O que ela passa a responder: o componente que **este intent** pediu, ou o app.
 *
 * ## Por que o sticky sozinho não serve
 *
 * `getMainComponent` lê um evento sticky do EventBus da lib, e o sticky é postado no **display**
 * da notificação (`NotificationManager.java:418`), não no toque. Ele fica pendurado até alguém
 * consumi-lo, e nada o vincula ao intent que de fato abriu a Activity.
 *
 * Duas consequências, as duas medidas em 15/09:
 *
 * 1. **O alarme ignorado contamina a abertura seguinte.** Tocou, ninguém respondeu, o sticky
 *    ficou. Abrir o app pelo ícone depois disso montava a tela azul - sem alarme nenhum, e vazia.
 * 2. **O toque na notificação caía na tela azul.** O `pressAction` é `"default"`, sem
 *    `mainComponent`, então o toque não posta sticky algum - mas consumia o que o display havia
 *    deixado. Era a tela azul vazia com o celular em uso, o defeito que sobrou do teste de 15/09.
 *
 * ## Por que não há guarda - e por que a que existiu barrava tudo
 *
 * A versão de 15/09 (`cdac0b2`) condicionava a chamada a um extra do intent:
 *
 * ```kotlin
 * if (intent?.hasExtra("mainComponent") == true) Notifee.getInstance().getMainComponent("main")
 * else "main"
 * ```
 *
 * **Ela negava sempre**, e com isso a tela azul não subiu em nenhum disparo daquele dia. A causa só
 * apareceu com um log dentro do método, e é mais simples do que qualquer hipótese que se levantou:
 *
 * ```
 * 20:12:00.827  getMainComponentName: intent=null extras=null temMainComponent=null
 * 20:12:00.827  getMainComponent devolveu: alarme-de-dose
 * 20:12:01.923  Running "alarme-de-dose"
 * ```
 *
 * **`intent` é `null` aqui.** `ReactActivity` consulta `getMainComponentName()` durante o
 * `onCreate`, antes de o intent estar disponível na Activity. Então `intent?.hasExtra(...)` devolve
 * `null`, `null == true` é `false`, e o ramo do alarme nunca roda. Não importava *qual* extra a
 * guarda checasse - duas tentativas se gastaram nisso antes do log existir.
 *
 * ## Por que o sticky sozinho basta
 *
 * A mesma medição mostra `getMainComponent` devolvendo `alarme-de-dose` no disparo e `main` na
 * abertura normal do app. Ele **já** distingue os dois casos, porque `removeStickEvent`
 * (`Notifee.java:103`) consome o evento: existe um sticky se, e só se, um `fullScreenAction` acabou
 * de pedir esta tela.
 *
 * O caso que a guarda queria cobrir - sticky pendurado de um alarme ignorado contaminando a próxima
 * abertura - é real, mas o preço cobrado foi a funcionalidade inteira. Se ele voltar a aparecer, a
 * correção é do lado do JS (a tela sai de cena ao ver que não há dose), nunca uma condição sobre um
 * intent que não existe neste ponto do ciclo de vida.
 */
const PATCH = `// [Mapill] O componente é FIXO: esta Activity é só do app.
  //
  // Perguntar ao Notifee (getMainComponent, que consome o sticky MainComponentEvent) fazia sentido
  // quando esta Activity servia aos dois donos. Desde a AlarmeActivity (16/09) ela não serve: o
  // fullScreenAction abre a Activity do alarme, e esta só sobe pelo ícone ou por toque na
  // notificação.
  //
  // E o sticky é postado quando a notificação é EXIBIDA, não quando alguém toca. Com o celular em
  // uso o Android rebaixa para heads-up, ninguém monta a AlarmeActivity, e o evento fica pendurado:
  // consumi-lo aqui montava a tela azul no lugar da tela do horário, com o app fora dos recentes.
  // Medido em aparelho em 16/09.
  //
  // Ver plugins/tela-do-alarme-na-main-activity.js
  override fun getMainComponentName(): String = "main"`;

/**
 * O corpo vazio do delegate que o Expo gera - é onde o `getLaunchOptions` entra.
 *
 * Casar o `){}` fechado, e não criar um `createReactActivityDelegate` próprio: o Expo já tem o
 * dele, envolto em `ReactActivityDelegateWrapper`, e dois overrides do mesmo método não compilam.
 * O wrapper precisa ser preservado - é ele que liga os módulos do Expo ao ciclo da Activity.
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
 * emite o `DELIVERED` no instante do disparo, quando ainda não há JavaScript de pé - o bundle só
 * executa ~1,2 s depois. O evento não é retido (`EventBus.post`, não `postSticky`), então quem
 * assina depois nunca o vê. As três fontes que `AlarmeRaiz` consultava chegavam todas vazias, e a
 * tela caía no último recurso: o horário atual, que não tem dose agendada.
 *
 * ## Por que aqui, e não numa quarta fonte
 *
 * Porque o dado **sempre esteve aqui**. O Notifee põe o bundle inteiro da notificação no intent que
 * abre esta Activity (`NotificationManager.java:417`), e ninguém o lia. Lê-lo no `getLaunchOptions`
 * entrega o horário **na montagem, síncrono** - sem `await`, sem depender de evento, de sticky
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
              // this@MainActivity.intent, e não \`intent\`: dentro deste object o nome resolveria
              // para o delegate. E é lido AQUI, não no onCreate - quando o delegate pede as
              // launch options o intent da Activity já está posto, ao contrário do que acontece em
              // getMainComponentName (ver o comentário lá em cima).
              val daNotificacao = this@MainActivity.intent?.getBundleExtra("notification")
                ?: return super.getLaunchOptions()
              return Bundle().apply {
                super.getLaunchOptions()?.let { putAll(it) }
                putBundle("notificacaoDoAlarme", daNotificacao)
              }
            }
          })`;

/**
 * A âncora do `onNewIntent`: o fim do `onCreate` gerado pelo Expo.
 *
 * O método não existe no template, então não há o que substituir - ele é **acrescentado** logo
 * depois do `onCreate`, que é onde ele pertence por simetria.
 */
const ONCREATE_ORIGINAL = `    super.onCreate(null)
  }`;

/**
 * O `onNewIntent`, que o template do Expo não tem - e cuja ausência era o defeito de 15/09.
 *
 * ## O que ele resolve
 *
 * `getMainComponentName` e `getLaunchOptions` são consultados **uma vez, no `onCreate`**. Quando a
 * Activity já existe - app nos recentes, ou em uso -, o Android entrega o alarme por `onNewIntent`
 * e nenhum dos dois volta a rodar. O `intent` do delegate continua sendo o **antigo**.
 *
 * Foi o que o teste em aparelho mostrou, em três sintomas de uma causa só: a tela do app piscando
 * antes da tela azul (o componente montado ainda era `"main"`), os botões aparecendo sem conteúdo,
 * e a tela azul subindo vazia de forma intermitente - o horário não chegava por prop, e a tela caía
 * nas três buscas de `AlarmeRaiz`, que são corridas.
 *
 * ## Por que `setIntent` basta
 *
 * `setIntent` troca o intent que a Activity expõe, e é dele que os dois métodos leem. Vem **antes**
 * do `super`, que repassa o intent ao delegate: na ordem inversa o delegate ainda veria o antigo.
 */
const ONCREATE_PATCH = `    // [Mapill] Quem abriu esta Activity: o alarme de tela cheia, ou um toque/o ícone?
    //
    // Gravado AQUI porque aqui o intent existe - em getMainComponentName ele ainda é null (o
    // ReactActivity o consulta antes). Ver o comentário daquele método.
    //
    super.onCreate(null)
  }

  // [Mapill] O alarme que chega a uma Activity JÁ EXISTENTE.
  //
  // Sem isto, app nos recentes ou em uso significava: componente decidido pelo intent antigo (a
  // tela do app piscando antes da azul), horário não chegando por prop (tela azul vazia), e os
  // botões renderizando antes dos dados. Um defeito, três sintomas - medidos em 15/09.
  //
  // Ver plugins/tela-do-alarme-na-main-activity.js
  override fun onNewIntent(intent: Intent) {
    // setIntent ANTES do super: o ReactActivity repassa o intent ao delegate, e getLaunchOptions
    // lê de getIntent(). Na ordem inversa, o delegate ainda veria o intent anterior.
    setIntent(intent)
    super.onNewIntent(intent)
  }`;

/** O import do `Intent`, que o `onNewIntent` exige. */
const IMPORT_INTENT = "import android.content.Intent";

/** O import que o patch exige. */

/**
 * A marca dos patches, para não aplicar duas vezes. `prebuild` roda mais de uma vez.
 *
 * **É um trecho que muda quando o conteúdo do patch muda**, e não um nome de método estável. A
 * versão anterior marcava por `onNewIntent`, e isso escondeu a correção da guarda em 15/09: o
 * arquivo gerado já tinha o `onNewIntent` da build anterior, o plugin se deu por aplicado, e a
 * `MainActivity` seguiu com a guarda velha - a que barra a tela azul. Marcar pelo nome do método
 * responde "algum patch já entrou"; o que precisa ser sabido é "o patch **desta versão** entrou".
 */
const MARCA = "O componente é FIXO";

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
          `plugin - sem este override a tela azul do alarme não sobe, e nada na build avisa.`,
      );
    }

    let novo = contents.replace(ORIGINAL, PATCH);

    // Nenhum import a acrescentar por este patch: o componente é uma string literal.

    /**
     * O segundo patch: o horário do alarme entrando como prop.
     *
     * Falha a build se o alvo sumir, como o primeiro. Sem ele a tela azul volta a subir vazia com o
     * app fechado - e esse é o tipo de defeito que só aparece em aparelho, depois da build inteira.
     */
    if (!novo.includes(DELEGATE_ORIGINAL)) {
      throw new Error(
        `[tela-do-alarme] não encontrei o corpo do ReactActivityDelegate na MainActivity. O ` +
          `template do Expo mudou. Sem o getLaunchOptions a tela azul sobe vazia com o app ` +
          `fechado, porque o horário do alarme não chega a ela.`,
      );
    }
    novo = novo.replace(DELEGATE_ORIGINAL, DELEGATE_PATCH);

    /**
     * O terceiro patch: o alarme que chega a uma Activity já viva.
     *
     * Falha a build se o alvo sumir, como os outros dois. Sem ele, app nos recentes volta a ser o
     * caso quebrado - e é o caso comum, não a exceção.
     */
    if (!novo.includes(ONCREATE_ORIGINAL)) {
      throw new Error(
        `[tela-do-alarme] não encontrei o fim do onCreate na MainActivity. O template do Expo ` +
          `mudou. Sem o onNewIntent, o alarme que chega com o app nos recentes monta o componente ` +
          `errado e a tela azul sobe vazia.`,
      );
    }
    novo = novo.replace(ONCREATE_ORIGINAL, ONCREATE_PATCH);

    /** O `Intent` do `onNewIntent` - mesmo cuidado do import do Notifee. */
    if (!novo.includes(IMPORT_INTENT)) {
      const pacote = novo.match(/^package .+$/m);
      if (pacote === null) {
        throw new Error(
          "[tela-do-alarme] a MainActivity não tem declaração de package - não sei onde pôr o import.",
        );
      }
      novo = novo.replace(pacote[0], `${pacote[0]}

${IMPORT_INTENT}`);
    }

    console.log(
      "[tela-do-alarme] MainActivity: componente pelo intent, horário por prop, e onNewIntent.",
    );
    config.modResults.contents = novo;

    return config;
  });
}

module.exports = withTelaDoAlarmeNaMainActivity;
