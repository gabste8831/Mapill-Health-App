/**
 * Faz o som que **o app** toca sair no volume de DESPERTADOR, e não no de mídia.
 *
 * ## Por que isto é um script, e não só um config plugin
 *
 * Era só um plugin (`plugins/som-do-alarme-em-despertador.js`), e o patch **nunca chegou ao
 * aparelho**. A ordem da fase PREBUILD do EAS, lida no log da build de 14/09, é esta:
 *
 * ```
 * expo prebuild --no-install   ← o plugin aplica o patch em node_modules/expo-audio
 * ✔ Finished prebuild
 * yarn install                 ← node_modules REINSTALADO: o patch morre aqui
 * info No lockfile found.
 * ```
 *
 * O prebuild patcheia, e o install roda **depois** e restaura o arquivo original. O Gradle compila
 * o `AudioPlayer.kt` limpo, onde o player nasce com `AudioAttributes.DEFAULT` - que é
 * `USAGE_MEDIA`. O alarme sai no volume de música, que foi o que o Gabriel ouviu em 14/09.
 *
 * O `throw` do plugin não denuncia isso: ele falha a build quando o **alvo some**, e o install
 * devolve o arquivo original intacto - alvo perfeito, sem o patch. É o modo de falha silencioso que
 * o comentário do plugin jurava não existir, por um caminho que ele não previu.
 *
 * ## Por que o `eas-build-post-install`
 *
 * Porque é o único gancho que roda **depois de todo install** e **antes do gradlew**
 * (https://docs.expo.dev/build-reference/npm-hooks/). Rodar aqui é o que faz o patch existir no
 * instante em que o Gradle lê o arquivo, que é o único instante que importa.
 *
 * O plugin continua chamando este mesmo código: no `expo run:android` local não há segundo install,
 * e ali é o prebuild que precisa aplicar. Uma regra, um arquivo - a duplicação é justamente como as
 * duas metades divergiriam em silêncio.
 *
 * ## Por que não `patch-package`
 *
 * Ele resolveria, e ao custo de uma dependência nova e de um `.patch` gerado que ninguém lê. O
 * patch aqui é uma substituição de texto de dez linhas, com o motivo escrito ao lado - e é o motivo
 * que se perde num arquivo gerado.
 */

const fs = require("node:fs");
const path = require("node:path");

/** O arquivo do `expo-audio` onde todo player nasce. */
const ARQUIVO_ALVO = path.join(
  "node_modules",
  "expo-audio",
  "android",
  "src",
  "main",
  "java",
  "expo",
  "modules",
  "audio",
  "AudioPlayer.kt",
);

/**
 * O trecho exato a substituir, com a indentação do arquivo.
 *
 * Casar a linha inteira, e não só `AudioAttributes.DEFAULT`, é deliberado: se o `expo-audio` for
 * atualizado e esta construção mudar, o patch não encontra o alvo e a build para com uma mensagem -
 * em vez de aplicar no lugar errado ou deixar passar em silêncio.
 */
const ORIGINAL = `    .setAudioAttributes(AudioAttributes.DEFAULT, false)`;

/**
 * O bloco novo.
 *
 * `C.USAGE_ALARM` é o que faz o botão de volume do despertador mandar no som, o silencioso não o
 * cortar e o Não Perturbe respeitá-lo como alarme. `CONTENT_TYPE_SONIFICATION` descreve o que ele é:
 * um aviso funcional, não música - é o mesmo par que o canal do alarme já pede.
 *
 * O segundo argumento (`handleAudioFocus`) segue `false`, como estava. Ligá-lo faria o player
 * devolver o foco a outro app que o peça, e um alarme de medicação que se cala porque um vídeo
 * começou é exatamente o que ele não pode fazer.
 *
 * As duas classes já estão importadas no arquivo (`androidx.media3.common.AudioAttributes` e
 * `androidx.media3.common.C`), então o patch não precisa mexer nos imports.
 */
const PATCH = `    // [Mapill] O som do alarme sai no volume de DESPERTADOR, e não no de mídia.
    // Sem isto o alarme fica no volume de música: com a mídia baixa, ele não acorda ninguém.
    // Ver scripts/patch-som-de-despertador.js
    .setAudioAttributes(
      AudioAttributes.Builder()
        .setUsage(C.USAGE_ALARM)
        .setContentType(C.AUDIO_CONTENT_TYPE_SONIFICATION)
        .build(),
      false,
    )`;

/** A marca do patch no arquivo, para não aplicar duas vezes. */
const MARCA = "C.USAGE_ALARM";

/**
 * Aplica o patch. Idempotente: com a marca já no arquivo, não faz nada.
 *
 * Devolve `"aplicado"` ou `"ja-estava"` para quem chama poder registrar o que houve - numa build
 * remota, a linha no log é a única prova de que o patch entrou.
 *
 * **Lança** se o alvo não existe ou mudou de forma. Falhar a build é o comportamento certo: sem
 * este patch o alarme toca no volume errado, e um despertador no volume de música é o defeito que
 * o app existe para não ter. Passar em silêncio é o que já custou a build de 14/09.
 */
function aplicarPatchDeDespertador(raizDoProjeto) {
  const alvo = path.join(raizDoProjeto, ARQUIVO_ALVO);

  if (!fs.existsSync(alvo)) {
    throw new Error(
      `[som-de-despertador] ${ARQUIVO_ALVO} não existe. O expo-audio mudou de estrutura ou não ` +
        `foi instalado - sem este patch o alarme toca no volume de mídia.`,
    );
  }

  const conteudo = fs.readFileSync(alvo, "utf8");

  if (conteudo.includes(MARCA)) return "ja-estava";

  if (!conteudo.includes(ORIGINAL)) {
    throw new Error(
      `[som-de-despertador] a linha de setAudioAttributes não foi encontrada em ${ARQUIVO_ALVO}. ` +
        `O expo-audio provavelmente foi atualizado. Confira o arquivo e ajuste o patch - sem ele o ` +
        `alarme volta ao volume de mídia.`,
    );
  }

  fs.writeFileSync(alvo, conteudo.replace(ORIGINAL, PATCH), "utf8");
  return "aplicado";
}

module.exports = { aplicarPatchDeDespertador, ARQUIVO_ALVO, MARCA };

/**
 * Rodando direto (`node scripts/patch-som-de-despertador.js`), que é como o
 * `eas-build-post-install` o chama.
 *
 * O log importa: numa build remota é a única janela para saber se o patch entrou. "ja-estava" no
 * EAS significaria que o install **não** desfez o patch - e aí este script é redundante, o que é
 * informação, não ruído.
 */
if (require.main === module) {
  const resultado = aplicarPatchDeDespertador(process.cwd());
  console.log(
    resultado === "aplicado"
      ? "[som-de-despertador] patch aplicado: o alarme sai no volume de despertador."
      : "[som-de-despertador] o patch já estava no arquivo - nada a fazer.",
  );
}
