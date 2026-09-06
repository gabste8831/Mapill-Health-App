const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Deixa a Activity principal apta a **aparecer por cima da tela de bloqueio**.
 *
 * ## Por que isto é necessário
 *
 * O `fullScreenAction` do Notifee entrega a intenção ao Android, mas quem decide se a tela pode
 * subir sobre o bloqueio é o **manifesto**. Sem `showWhenLocked` e `turnScreenOn`, o sistema
 * degrada silenciosamente para uma notificação heads-up — que foi exatamente o que aconteceu no
 * primeiro teste em aparelho (02/09): o som tocou, o aviso apareceu, e a tela cheia não.
 *
 * O sintoma engana, porque parece que o alarme funcionou. O que tocou foi o som **do canal**, uma
 * vez só, e não o loop da tela. Sem a tela, não há loop nenhum: o som contínuo mora nela.
 *
 * `turnScreenOn` é o que acende o aparelho apagado — um alarme que espera a pessoa acordar sozinha
 * para olhar a tela não é um alarme.
 *
 * ## Por que um plugin, e não editar o `AndroidManifest.xml`
 *
 * O projeto é *managed*: a pasta `android/` é gerada a cada build e qualquer edição manual nela é
 * perdida. Um config plugin é a forma suportada de alterar o manifesto — ele roda no `prebuild` e
 * a mudança sobrevive.
 */
/**
 * Os receptores de boot da biblioteca de notificação, que precisam ser reexportados.
 *
 * ## O defeito que isto corrige
 *
 * Os dois escutam `BOOT_COMPLETED` e existem para **reagendar os alarmes depois que o aparelho
 * reinicia** — o Android descarta todo alarme no reboot, então sem eles o app volta mudo.
 *
 * O AAR os declara com `android:exported="false"`. Desde o **Android 12**, um receptor com
 * intent-filter de broadcast do sistema precisa de `exported="true"`, ou o sistema simplesmente não
 * o invoca. O app tem alvo API 35, então eles nunca rodam: o alarme agendado some no reboot e nada
 * o traz de volta até alguém abrir o app.
 *
 * Confirmado no teste em aparelho (05/09): alarme agendado, celular reiniciado, horário passou, nada
 * tocou. É o mesmo relato de vários usuários da biblioteca (issues 248, 734 e 991), que segue aberto
 * — o projeto foi arquivado em 07/04/2026 sem correção.
 */
const RECEPTORES_DE_BOOT = [
  "app.notifee.core.RebootBroadcastReceiver",
  "app.notifee.core.NotificationAlarmReceiver",
];

/**
 * Marca os receptores de boot como exportados, sobrescrevendo o que o AAR declara.
 *
 * `tools:replace` é o que autoriza o merge de manifesto a vencer a declaração da biblioteca — sem
 * ele o build falha com conflito, porque os dois lados afirmam valores diferentes para o mesmo
 * atributo.
 *
 * Exportar um receptor é ampliar superfície, e vale dizer por que aqui é aceitável: eles não
 * recebem dado nenhum de fora, só o aviso de que o sistema terminou de iniciar. Um app malicioso
 * que os invocasse conseguiria, no máximo, fazer o Mapill reagendar os próprios alarmes.
 */
function withReceptoresDeBootExportados(manifesto) {
  const aplicacao = manifesto.manifest.application?.[0];
  if (!aplicacao) return;

  aplicacao.receiver ??= [];

  for (const nome of RECEPTORES_DE_BOOT) {
    const existente = aplicacao.receiver.find((receiver) => receiver.$["android:name"] === nome);

    if (existente) {
      existente.$["android:exported"] = "true";
      existente.$["tools:replace"] = "android:exported";
      continue;
    }

    /**
     * O receptor não está no manifesto do app porque vem do AAR, e o merge só acontece na
     * compilação. Declará-lo aqui, vazio e com `tools:replace`, é o que dá ao merge um lado nosso
     * para vencer — sem intent-filter, que continua vindo da biblioteca.
     */
    aplicacao.receiver.push({
      $: {
        "android:name": nome,
        "android:exported": "true",
        "tools:replace": "android:exported",
      },
    });
  }
}

module.exports = function withAlarmeEmTelaCheia(config) {
  return withAndroidManifest(config, (config) => {
    const manifesto = config.modResults;
    const aplicacao = manifesto.manifest.application?.[0];
    if (!aplicacao) return config;

    // O namespace `tools:` precisa existir na raiz para os atributos abaixo serem entendidos. O
    // Expo costuma declará-lo, mas depender disso deixaria o plugin quebrando em silêncio.
    manifesto.manifest.$["xmlns:tools"] ??= "http://schemas.android.com/tools";

    const principal = aplicacao.activity?.find(
      (activity) => activity.$["android:name"] === ".MainActivity",
    );
    if (principal) {
      principal.$["android:showWhenLocked"] = "true";
      principal.$["android:turnScreenOn"] = "true";
    }

    withReceptoresDeBootExportados(manifesto);

    return config;
  });
};
