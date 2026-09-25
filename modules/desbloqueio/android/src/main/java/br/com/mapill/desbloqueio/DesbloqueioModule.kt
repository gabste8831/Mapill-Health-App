package br.com.mapill.desbloqueio

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Pede o desbloqueio antes de a tela azul deixar alguém entrar no app.
 *
 * ## Por que existe
 *
 * O `showWhenLocked` vale para a **MainActivity**, e o `index.js` monta a tela do alarme e o app
 * inteiro no mesmo processo. A permissão de aparecer sobre o bloqueio, então, é do app todo: sair
 * da tela azul para dentro do app revelava medicamentos, histórico e ficha de saúde sem que
 * ninguém digitasse a senha.
 *
 * Nem o Expo 57 nem o Notifee expõem o keyguard, então o pedido precisa ser feito daqui.
 *
 * ## O que ele não faz
 *
 * Não desbloqueia nada por conta própria - só **pede**, e quem decide é o sistema, com a senha ou a
 * biometria que a pessoa já configurou. Num aparelho sem bloqueio o Android dispensa na hora, que é
 * o certo: não há segredo a proteger onde a pessoa optou por não ter um.
 */
class DesbloqueioModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Desbloqueio")

    /**
     * `true` quando a tela de bloqueio está na frente agora.
     *
     * Serve para a tela do alarme não pedir autenticação a quem já está com o aparelho aberto -
     * pedir ali seria atrito sem ganho, já que a pessoa acabou de passar pelo bloqueio.
     */
    AsyncFunction("estaBloqueado") {
      return@AsyncFunction keyguardManager()?.isKeyguardLocked ?: false
    }

    /**
     * Encerra **esta** Activity e a tira dos recentes - sem matar o processo.
     *
     * A tela do alarme vive numa Activity própria, em task própria (`AlarmeActivity`,
     * `launchMode=singleInstance`). `BackHandler.exitApp()` não serve aqui: ele encerra o processo
     * inteiro, e com ele o app que pode estar aberto atrás - além de derrubar o serviço que toca o
     * som antes de ele se despedir.
     *
     * `finishAndRemoveTask` fecha a task do alarme e devolve o aparelho ao que estava antes: o
     * bloqueio, se era dali que a tela veio. É o que torna "Tomei" com o celular bloqueado não
     * revelar o app - junto com o `showWhenLocked` ter saído da `MainActivity`.
     */
    AsyncFunction("fecharTelaDoAlarme") {
      val activity = appContext.currentActivity ?: return@AsyncFunction false
      activity.runOnUiThread { activity.finishAndRemoveTask() }
      return@AsyncFunction true
    }

    /**
     * **Não existe função para reimpor o bloqueio**, e isto é uma nota para quem vier procurá-la.
     *
     * `finishAndRemoveTask` foi tentado em 15/09 e não resolve: quando a Activity sobe com
     * `showWhenLocked` e `turnScreenOn`, o Android **já dispensou o keyguard** para ela, e remover a
     * task depois não desfaz isso. O Android não expõe API de re-bloqueio para app nenhum.
     *
     * A causa do problema (responder a dose deixa o app acessível) é a do topo deste arquivo: o
     * `showWhenLocked` vale para a `MainActivity`, onde o app inteiro vive. A saída foi a
     * `AlarmeActivity`, separada só para o alarme - ver `.claude/skills/mapill-dev/references/alarm.md`.
     */

    /**
     * Pede o desbloqueio e responde se ele aconteceu.
     *
     * **Resolve `false` em vez de rejeitar quando a pessoa desiste.** Cancelar não é erro: é uma
     * resposta legítima, e quem chama precisa apenas não abrir o app. Rejeitar obrigaria cada
     * chamador a distinguir "desistiu" de "quebrou" dentro de um `catch`, e o risco de alguém tratar
     * os dois como sucesso é exatamente o defeito que este módulo existe para fechar.
     */
    AsyncFunction("pedirDesbloqueio") { promise: Promise ->
      val activity = appContext.currentActivity
      val keyguard = keyguardManager()

      if (activity == null || keyguard == null) {
        // Sem Activity não há a quem pedir. Negar é a resposta segura: o chamador não abre o app.
        promise.resolve(false)
        return@AsyncFunction
      }

      if (!keyguard.isKeyguardLocked) {
        promise.resolve(true)
        return@AsyncFunction
      }

      /**
       * `requestDismissKeyguard` só existe da API 26 em diante, e o app atende a partir da 24.
       *
       * No 24 e no 25 a resposta é `false`, e não `true`: sem como pedir a autenticação, deixar
       * passar seria entregar o dado - e é melhor a pessoa desbloquear por fora e abrir o app pela
       * própria mão do que o alarme abrir sozinho por cima do bloqueio.
       */
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
        promise.resolve(false)
        return@AsyncFunction
      }

      // O callback do keyguard chega na thread principal, e é de lá que o Android quer o pedido.
      activity.runOnUiThread {
        keyguard.requestDismissKeyguard(
          activity,
          object : KeyguardManager.KeyguardDismissCallback() {
            override fun onDismissSucceeded() {
              promise.resolve(true)
            }

            override fun onDismissCancelled() {
              promise.resolve(false)
            }

            override fun onDismissError() {
              promise.resolve(false)
            }
          },
        )
      }
    }
  }

  private fun keyguardManager(): KeyguardManager? =
    appContext.reactContext?.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
}
