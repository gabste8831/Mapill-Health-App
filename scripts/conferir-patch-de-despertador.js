/**
 * Confere que o patch do volume de despertador está no arquivo — e **falha a build** se não estiver.
 *
 * ## Por que isto existe
 *
 * Porque três caminhos aplicam o patch (prebuild, `postinstall`, `eas-build-post-install`) e
 * nenhum deles é prova. O que decide é o estado do `AudioPlayer.kt` no instante em que o **Gradle**
 * lê o arquivo, e só uma conferência nesse ponto sabe disso.
 *
 * A build de 14/09 saiu com o alarme no volume de mídia e **nada no log denunciou**: o plugin
 * aplicou o patch, disse que aplicou, e o `yarn install` seguinte o apagou. O Gabriel descobriu no
 * aparelho, depois de esperar a build inteira — tendo pedido o volume de despertador várias vezes.
 *
 * Um patch que falha em silêncio é pior que patch nenhum: sem ele a gente sabe que não tem, e com
 * ele a gente **acha** que tem. Esta conferência é o que troca "achar" por "saber".
 *
 * ## Por que falhar a build, e não avisar
 *
 * Porque um aviso no log de uma build de 17 minutos é um aviso que ninguém lê. E o custo de deixar
 * passar é uma build inteira gasta (a cota é de 30 por mês) mais um teste em aparelho que reprova
 * pelo mesmo motivo de sempre. Falhar aqui custa segundos e diz exatamente o que fazer.
 */

const fs = require("node:fs");
const path = require("node:path");

const { ARQUIVO_ALVO, MARCA } = require("./patch-som-de-despertador");

function conferir(raizDoProjeto) {
  const alvo = path.join(raizDoProjeto, ARQUIVO_ALVO);

  if (!fs.existsSync(alvo)) {
    throw new Error(
      `[conferir-despertador] ${ARQUIVO_ALVO} não existe. Sem o expo-audio instalado não há o que ` +
        `conferir — e não há alarme.`,
    );
  }

  if (!fs.readFileSync(alvo, "utf8").includes(MARCA)) {
    throw new Error(
      `[conferir-despertador] O PATCH DO VOLUME DE DESPERTADOR NÃO ESTÁ NO ARQUIVO.\n\n` +
        `  ${ARQUIVO_ALVO} chegou à compilação sem a marca '${MARCA}'.\n\n` +
        `  Compilar assim produz um APK em que o alarme toca no volume de MÍDIA — o defeito de\n` +
        `  14/09. A build para aqui de propósito.\n\n` +
        `  Algum dos três caminhos que aplicam o patch não rodou:\n` +
        `    1. plugins/som-do-alarme-em-despertador.js  (prebuild)\n` +
        `    2. "postinstall" no package.json            (todo npm/yarn install)\n` +
        `    3. "eas-build-post-install" no package.json (EAS, antes do gradlew)\n\n` +
        `  Rode 'node scripts/patch-som-de-despertador.js' e confira o log da build para ver qual.`,
    );
  }

  return true;
}

module.exports = { conferir };

if (require.main === module) {
  conferir(process.cwd());
  console.log("[conferir-despertador] ok: o alarme vai sair no volume de despertador.");
}
