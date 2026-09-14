const { withDangerousMod } = require("expo/config-plugins");
const path = require("node:path");

const { ARQUIVO_ALVO, MARCA } = require("../scripts/patch-som-de-despertador");
const { aplicarTodos } = require("../scripts/aplicar-patches");
const fs = require("node:fs");

/**
 * Faz o som que **o app** toca sair no volume de despertador.
 *
 * ## A regra mora em `scripts/patch-som-de-despertador.js`
 *
 * Aqui ficou só o gancho do prebuild. O patch precisa ser aplicado de **três** lugares (ver abaixo),
 * e a mesma substituição escrita três vezes é como as cópias divergiriam em silêncio.
 *
 * ## Por que três lugares, e não um
 *
 * Porque este plugin sozinho **nunca chegou ao aparelho**. A ordem da fase PREBUILD do EAS, lida no
 * log da build de 14/09:
 *
 * ```
 * expo prebuild --no-install   ← este plugin aplica o patch
 * ✔ Finished prebuild
 * yarn install                 ← node_modules REINSTALADO: o patch morre aqui
 * ```
 *
 * O install roda **depois** do prebuild e restaura o `AudioPlayer.kt` original. O Gradle compila o
 * arquivo limpo, o player nasce `USAGE_MEDIA`, e o alarme sai no volume de música — o defeito que o
 * Gabriel relatou em 14/09 depois de pedir o volume de despertador várias vezes.
 *
 * O `throw` daqui não denunciava nada: ele falha quando o **alvo some**, e o install devolve o
 * arquivo original intacto — alvo perfeito, sem o patch.
 *
 * Então o patch passou a ser aplicado por todo caminho que existe:
 *
 * 1. **Este plugin**, no prebuild — cobre o `expo run:android` local, onde não há segundo install.
 * 2. **`postinstall`** no `package.json` — roda junto de todo `npm/yarn install`, inclusive o que
 *    apaga o patch. Fecha a janela no próprio instante em que ela abre.
 * 3. **`eas-build-post-install`** — o gancho que roda depois de todo install e antes do gradlew
 *    (https://docs.expo.dev/build-reference/npm-hooks/). É a última linha antes da compilação.
 *
 * E, como nenhum dos três é prova, **`scripts/conferir-patches.js` falha a build** se o arquivo
 * chegar ao Gradle sem a marca. Um caminho pode falhar; o que não pode é sair um APK com o alarme
 * mudo sem ninguém saber.
 *
 * ## Por que o patch é global, e por que isso é seguro
 *
 * O alvo é o construtor do `AudioPlayer`, então **todo** player do app nasce como alarme. O único
 * `expo-audio` do projeto é o som do alarme (`som-do-alarme.ts`) — todo player do app já é o do
 * alarme.
 *
 * **Se algum dia o app tocar outro som**, ele herdaria `USAGE_ALARM` e sairia no volume errado,
 * atravessando o silencioso. O sinal de que este comentário precisa virar código é um segundo
 * `createAudioPlayer` no projeto.
 */
function withSomDoAlarmeEmDespertador(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      /**
       * Aplica **todos** os patches, e não só o do volume.
       *
       * O prebuild é um dos três caminhos, e ele não pode conhecer só metade da lista — um patch
       * que só o `postinstall` aplica ficaria de fora no `expo run:android` local, onde não há
       * segundo install. A lista mora em `scripts/aplicar-patches.js`.
       *
       * O log é a única janela numa build remota: `ja-estava` diz que o `postinstall` chegou
       * primeiro, que é o esperado no EAS — informação, não ruído.
       */
      aplicarTodos(config.modRequest.projectRoot);

      /**
       * **Reaplica depois de o prebuild terminar**, porque o `yarn install` do EAS vem em seguida.
       *
       * Os `withDangerousMod` rodam dentro do prebuild, e o install que apaga o patch é posterior a
       * todos eles — não há mod que rode depois. O `postinstall` e o `eas-build-post-install` são o
       * que cobre isso, e esta nota existe para ninguém remover aqueles dois achando que este
       * plugin basta. Ele não basta: foi exatamente essa suposição que produziu a build muda.
       */
      const alvo = path.join(config.modRequest.projectRoot, ARQUIVO_ALVO);
      if (!fs.readFileSync(alvo, "utf8").includes(MARCA)) {
        throw new Error(
          "[som-do-alarme-em-despertador] o patch não sobreviveu à própria aplicação. " +
            "Isto não deveria acontecer — confira o script em scripts/patch-som-de-despertador.js.",
        );
      }

      return config;
    },
  ]);
}

module.exports = withSomDoAlarmeEmDespertador;
