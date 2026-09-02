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
module.exports = function withAlarmeEmTelaCheia(config) {
  return withAndroidManifest(config, (config) => {
    const aplicacao = config.modResults.manifest.application?.[0];
    if (!aplicacao) return config;

    const principal = aplicacao.activity?.find(
      (activity) => activity.$["android:name"] === ".MainActivity",
    );
    if (!principal) return config;

    principal.$["android:showWhenLocked"] = "true";
    principal.$["android:turnScreenOn"] = "true";

    return config;
  });
};
