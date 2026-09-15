/**
 * Faz o `expo-audio` ser compilado **do código-fonte**, e não do AAR pronto — sem isto o patch do
 * volume de despertador é código morto.
 *
 * ## O defeito que isto resolve
 *
 * O `patch-som-de-despertador.js` edita `AudioPlayer.kt`, e o teste em aparelho de 14/09 mostrou o
 * alarme **ainda** saindo no volume de mídia, com o patch comprovadamente aplicado:
 *
 * ```
 * Usage: AUDIO_USAGE_MEDIA      ← devia ser AUDIO_USAGE_ALARM
 * mStreamType 3                 ← 3 é STREAM_MUSIC; alarme é 4
 * ```
 *
 * A build explica: **zero tasks `:expo-audio:`**. O módulo não é compilado — ele declara uma
 * `publication` no `expo-module.config.json`, e o Expo 57 consome um AAR pré-compilado de
 * `local-maven-repo`. O `.kt` patcheado nunca chega ao compilador.
 *
 * É a peça que faltava para entender por que o volume "nunca funcionou". O diagnóstico de 14/09 de
 * manhã — o `yarn install` apagando o patch antes do Gradle — era real e está corrigido, mas era
 * **metade**: mesmo sobrevivendo ao install, o arquivo não seria compilado.
 *
 * ## O que ele faz
 *
 * Remove o bloco `publication` do `expo-module.config.json`. Sem ele o autolinking trata o
 * `expo-audio` como projeto Gradle comum e compila o fonte — onde o patch está.
 *
 * ## O custo, e por que vale
 *
 * Compilar o módulo do fonte é mais lento que baixar um AAR. Por um módulo só, são segundos, e o
 * Gradle cacheia depois da primeira vez.
 *
 * A alternativa seria reescrever bytecode dentro do AAR, o que é frágil de um jeito diferente: um
 * patch binário quebra em silêncio quando o artefato muda, e não há fonte para conferir. Aqui o que
 * se compila é o Kotlin que está no disco, legível, com o patch visível ao lado do comentário que o
 * explica.
 */

const fs = require("node:fs");
const path = require("node:path");

/** O arquivo que declara como o módulo é consumido. */
const ARQUIVO_ALVO = path.join("node_modules", "expo-audio", "expo-module.config.json");

/**
 * A marca é a **ausência** da publicação, então não há string para procurar.
 *
 * `conferir-patches.js` usa isto para saber se o patch está no lugar: ler o JSON e olhar se o bloco
 * saiu é a única pergunta honesta aqui.
 */
const MARCA = null;

function publicacaoRemovida(raizDoProjeto) {
  const alvo = path.join(raizDoProjeto, ARQUIVO_ALVO);
  if (!fs.existsSync(alvo)) return false;
  const config = JSON.parse(fs.readFileSync(alvo, "utf8"));
  return config.android?.publication === undefined;
}

/**
 * Tira a publicação. Idempotente.
 *
 * **Lança** se o arquivo sumir ou mudar de forma: sem este patch o volume volta ao stream de mídia
 * sem nada na build denunciar, que é exatamente o modo de falha que custou as builds de 13 e 14/09.
 */
function aplicarPatchDoFonte(raizDoProjeto) {
  const alvo = path.join(raizDoProjeto, ARQUIVO_ALVO);

  if (!fs.existsSync(alvo)) {
    throw new Error(
      `[expo-audio-do-fonte] ${ARQUIVO_ALVO} não existe. O expo-audio mudou de estrutura ou não ` +
        `foi instalado.`,
    );
  }

  const config = JSON.parse(fs.readFileSync(alvo, "utf8"));

  if (config.android?.publication === undefined) return "ja-estava";

  delete config.android.publication;
  fs.writeFileSync(alvo, `${JSON.stringify(config, null, 2)}\n`, "utf8");

  return "aplicado";
}

module.exports = { aplicarPatchDoFonte, publicacaoRemovida, ARQUIVO_ALVO, MARCA };

if (require.main === module) {
  const resultado = aplicarPatchDoFonte(process.cwd());
  console.log(
    resultado === "aplicado"
      ? "[expo-audio-do-fonte] publicacao removida: o modulo passa a compilar do fonte."
      : "[expo-audio-do-fonte] a publicacao já estava fora — nada a fazer.",
  );
}
