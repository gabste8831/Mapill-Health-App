const path = require("node:path");
const fs = require("node:fs");

const { withDangerousMod, withAndroidManifest } = require("expo/config-plugins");

/**
 * Dá ao alarme uma **Activity própria** — e é isso que devolve o aparelho ao bloqueio.
 *
 * ## O defeito que isto resolve
 *
 * `showWhenLocked` é atributo de **Activity**, não de tela. Com uma Activity só, a licença de
 * aparecer sobre o bloqueio era do app inteiro: o alarme disparava, a tela azul subia, e ao
 * responder "Tomei" o Mapill ficava na frente — navegável, sem senha, com medicamentos, histórico e
 * ficha de saúde à mão de quem pegasse o aparelho. Medido em aparelho em 15/09, duas vezes.
 *
 * `finishAndRemoveTask` não resolve, e foi tentado: quando a Activity sobe com `showWhenLocked` +
 * `turnScreenOn`, o Android **já dispensou o keyguard** para ela, e não existe API de re-bloqueio.
 * O que precisa mudar é quem tem a licença, não o que se faz depois.
 *
 * Com a `AlarmeActivity`, a `MainActivity` deixa de tê-la: fechar o alarme não revela o app, porque
 * o app nunca teve permissão de estar ali.
 *
 * ## O que some junto
 *
 * Três defeitos custaram builds em 14 e 15/09 por causa da mesma raiz — decidir **qual componente
 * montar** dentro de uma Activity que serve a dois donos:
 *
 * - o sticky `MainComponentEvent` é postado quando a notificação é **exibida**, e ficava pendurado
 *   para o próximo toque consumir, abrindo a tela azul no lugar da tela do horário;
 * - `getMainComponentName()` é chamado com o `intent` ainda **nulo**, então nenhuma guarda que o
 *   lesse podia funcionar (três tentativas mediram isso);
 * - o extra que distinguiria os caminhos não sobrevive ao `PendingIntent` neste aparelho.
 *
 * Nada disso existe aqui: cada Activity devolve um nome **fixo**. A `AlarmeActivity` monta a tela
 * do alarme porque é a Activity do alarme, não porque adivinhou quem a abriu.
 *
 * ## Por que o Notifee aceita
 *
 * O `fullScreenAction` tem um campo `launchActivity` que recebe o nome completo da classe, e a lib
 * o usa literalmente: `IntentUtils.getLaunchActivity` só cai na launcher activity quando o valor é
 * ausente ou `"default"`, e `NotificationManager` monta um `new Intent(context, classe)` — intent
 * explícito. É o caminho oficial da biblioteca, não um contorno.
 *
 * O `mainComponent` **continua sendo enviado junto**, e não por redundância: o extra `notification`
 * — que carrega o horário da dose até a tela, por `initialProps` — só é anexado ao intent quando
 * ele está presente.
 */

/** Onde o Kotlin da Activity é escrito, relativo à raiz do projeto Android. */
const CAMINHO_NO_ANDROID = ["app", "src", "main", "java"];

/**
 * A Activity, em Kotlin.
 *
 * Herda de `ReactActivity` como a principal, e difere em três pontos, todos deliberados:
 *
 * 1. `getMainComponentName` devolve o componente do alarme, **fixo**. Sem Notifee, sem sticky, sem
 *    intent — nada a decidir.
 * 2. `getLaunchOptions` entrega o bundle da notificação como prop, que é como o horário da dose
 *    chega à tela sem depender de evento nenhum.
 * 3. `onNewIntent` troca o intent antes do `super`, para um segundo alarme chegando a esta Activity
 *    ser lido corretamente.
 *
 * O `ReactActivityDelegateWrapper` do Expo é preservado — é ele que liga os módulos do Expo ao
 * ciclo de vida da Activity, e sem ele nada do `expo-*` funciona aqui dentro.
 */
function kotlinDaActivity(pacote, componente) {
  return `package ${pacote}

import android.content.Intent
import android.os.Bundle

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

/**
 * A tela do alarme, na própria Activity.
 *
 * É ela que tem \`showWhenLocked\` e \`turnScreenOn\` — a MainActivity não tem, e é isso que faz
 * responder a dose com o celular bloqueado **não** deixar o app acessível depois.
 *
 * Gerada por plugins/activity-propria-do-alarme.js. Não editar aqui: o prebuild reescreve.
 */
class AlarmeActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Sem a splash do Expo: ela é registrada na MainActivity e cobria esta tela com o mesmo azul
    // do tema, o que por dias pareceu "tela azul vazia" (15/09).
    super.onCreate(null)
  }

  // O componente é fixo porque esta Activity só existe para o alarme. Era a decisão que o sticky
  // do Notifee tomava por adivinhação, e errava.
  override fun getMainComponentName(): String = "${componente}"

  override fun onNewIntent(intent: Intent) {
    // Antes do super: o ReactActivity repassa o intent ao delegate, e o delegate lê de getIntent().
    setIntent(intent)
    super.onNewIntent(intent)
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
      this,
      BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
      object : DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled) {
        /**
         * O horário da dose chega à tela como prop, na montagem.
         *
         * O Notifee põe o bundle da notificação no intent que abre esta Activity. Ler daqui é
         * síncrono: não depende do \`DELIVERED\`, que é emitido antes de existir JavaScript para
         * ouvi-lo e não é retido.
         */
        override fun getLaunchOptions(): Bundle? {
          val daNotificacao = this@AlarmeActivity.intent?.getBundleExtra("notification")
            ?: return super.getLaunchOptions()
          return Bundle().apply {
            super.getLaunchOptions()?.let { putAll(it) }
            putBundle("notificacaoDoAlarme", daNotificacao)
          }
        }
      },
    )
  }
}
`;
}

/** Escreve o Kotlin ao lado da `MainActivity`, no pacote do app. */
function withArquivoDaActivity(config, componente) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const pacote = config.android?.package;
      if (!pacote) {
        throw new Error(
          "[activity-do-alarme] o app.json não declara android.package — sem ele não sei em que " +
            "pacote escrever a AlarmeActivity, e o alarme perde a Activity própria.",
        );
      }

      const destino = path.join(
        config.modRequest.platformProjectRoot,
        ...CAMINHO_NO_ANDROID,
        ...pacote.split("."),
      );
      fs.mkdirSync(destino, { recursive: true });
      fs.writeFileSync(
        path.join(destino, "AlarmeActivity.kt"),
        kotlinDaActivity(pacote, componente),
        "utf8",
      );

      console.log("[activity-do-alarme] AlarmeActivity.kt escrita em", pacote);
      return config;
    },
  ]);
}

/**
 * Declara a Activity e **tira da principal** o que dava ao app a licença sobre o bloqueio.
 *
 * A remoção é a metade que importa: declarar a nova sem limpar a antiga deixaria as duas podendo
 * aparecer sobre o keyguard, e o defeito continuaria exatamente igual.
 */
function withDeclaracaoNoManifesto(config) {
  return withAndroidManifest(config, (config) => {
    const manifesto = config.modResults;
    const aplicacao = manifesto.manifest.application?.[0];
    if (!aplicacao) return config;

    const principal = aplicacao.activity?.find(
      (activity) => activity.$["android:name"] === ".MainActivity",
    );
    if (!principal) {
      throw new Error(
        "[activity-do-alarme] não encontrei a .MainActivity no manifesto. Sem ela não sei de onde " +
          "remover o showWhenLocked, e o app seguiria acessível sobre o bloqueio.",
      );
    }

    // A licença sai da principal. Ver o topo deste arquivo: é esta linha que fecha o defeito.
    delete principal.$["android:showWhenLocked"];
    delete principal.$["android:turnScreenOn"];

    aplicacao.activity ??= [];
    const jaDeclarada = aplicacao.activity.find(
      (activity) => activity.$["android:name"] === ".AlarmeActivity",
    );
    const atributos = {
      "android:name": ".AlarmeActivity",
      /**
       * `singleInstance` e não `singleTask`: a Activity fica **sozinha na própria task**.
       *
       * É o que faz fechá-la devolver o aparelho ao bloqueio em vez de revelar o app. Numa task
       * compartilhada, encerrar a de cima mostra a de baixo — que é o defeito que este plugin
       * existe para fechar.
       */
      "android:launchMode": "singleInstance",
      "android:taskAffinity": "",
      "android:showWhenLocked": "true",
      "android:turnScreenOn": "true",
      // Não é ponto de entrada: ninguém a abre a não ser o alarme.
      "android:exported": "false",
      "android:screenOrientation": "portrait",
      // Um alarme respondido não deve ficar na lista de recentes convidando a reabrir.
      "android:excludeFromRecents": "true",
      // Sem o tema da splash: ela é do app, e aqui cobria a tela do alarme.
      "android:theme": "@style/AppTheme",
      "android:configChanges":
        "keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode|smallestScreenSize|assetsPaths",
      "android:windowSoftInputMode": "adjustResize",
    };

    if (jaDeclarada) Object.assign(jaDeclarada.$, atributos);
    else aplicacao.activity.push({ $: atributos });

    console.log("[activity-do-alarme] manifesto: AlarmeActivity declarada, MainActivity limpa.");
    return config;
  });
}

module.exports = function withActivityPropriaDoAlarme(config, opcoes) {
  const componente = opcoes?.componente ?? "alarme-de-dose";
  return withDeclaracaoNoManifesto(withArquivoDaActivity(config, componente));
};
