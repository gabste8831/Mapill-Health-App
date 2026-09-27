package br.com.mapill.desbloqueio

import android.app.Activity
import java.lang.ref.WeakReference

/**
 * A Activity do alarme, registrada por ela mesma a cada passo do ciclo de vida.
 *
 * O `currentActivity` do React é a última Activity do app que subiu, e as duas dividem o mesmo
 * React: com a `MainActivity` aberta por cima, ele aponta para ela. Fechar "a atual" encerrava o app
 * no lugar do alarme, e o `AppState` compartilhado não distingue qual das duas está na frente.
 */
object TelaDoAlarme {
  @Volatile private var atual: WeakReference<Activity>? = null
  @Volatile private var naFrente = false

  @JvmStatic
  fun nasceu(activity: Activity) {
    atual = WeakReference(activity)
    naFrente = false
  }

  @JvmStatic
  fun voltouAFrente(activity: Activity) {
    if (atual?.get() === activity) naFrente = true
  }

  @JvmStatic
  fun saiuDaFrente(activity: Activity) {
    if (atual?.get() === activity) naFrente = false
  }

  @JvmStatic
  fun morreu(activity: Activity) {
    if (atual?.get() !== activity) return
    atual = null
    naFrente = false
  }

  fun activity(): Activity? = atual?.get()

  /** `null` quando nenhuma Activity do alarme vive neste processo: sem ela não há o que responder. */
  fun estaNaFrente(): Boolean? = if (atual?.get() == null) null else naFrente
}
