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

const despertador = require("./patch-som-de-despertador");
const semAtraso = require("./patch-servico-sem-atraso");
const doFonte = require("./patch-expo-audio-do-fonte");

/**
 * Os patches que precisam estar no lugar quando o Gradle ler os arquivos, e o que cada um custa.
 *
 * Um patch ausente não é aviso, é build parada: o custo de deixar passar é um APK que reprova em
 * aparelho pelo mesmo motivo de sempre, mais uma build da cota (30/mês) e o ciclo de espera inteiro.
 */
const OBRIGATORIOS = [
  {
    nome: "volume de despertador",
    modulo: despertador,
    oQueQuebra: "o alarme toca no volume de MÍDIA — o defeito de 14/09",
  },
  {
    nome: "serviço sem atraso",
    modulo: semAtraso,
    oQueQuebra: "a notificação do alarme pode demorar até 10 s para aparecer no Android 12+",
  },
];

function conferir(raizDoProjeto) {
  const faltando = [];

  /**
   * Conferido à parte porque a prova dele é uma **ausência**: não há string para procurar, e sim um
   * bloco `publication` que precisa ter saído do JSON.
   *
   * É o patch mais fácil de esquecer e o mais caro de perder — sem ele o patch do volume é aplicado
   * normalmente, a conferência de texto passa, e o alarme sai no volume errado assim mesmo, porque
   * o arquivo patcheado não foi compilado. Foi o defeito medido em aparelho em 14/09.
   */
  if (!doFonte.publicacaoRemovida(raizDoProjeto)) {
    faltando.push(
      `  - expo-audio do fonte: ${doFonte.ARQUIVO_ALVO} ainda declara 'publication' — o módulo vem ` +
        `pré-compilado e o patch do volume não tem efeito`,
    );
  }

  for (const { nome, modulo, oQueQuebra } of OBRIGATORIOS) {
    const alvo = path.join(raizDoProjeto, modulo.ARQUIVO_ALVO);

    if (!fs.existsSync(alvo)) {
      faltando.push(`  - ${nome}: ${modulo.ARQUIVO_ALVO} não existe`);
      continue;
    }

    if (!fs.readFileSync(alvo, "utf8").includes(modulo.MARCA)) {
      faltando.push(`  - ${nome}: sem a marca '${modulo.MARCA}' — ${oQueQuebra}`);
    }
  }

  if (faltando.length > 0) {
    throw new Error(
      `[conferir-patches] PATCH AUSENTE NA COMPILAÇÃO.\n\n` +
        `${faltando.join("\n")}\n\n` +
        `  A build para aqui de propósito: compilar assim entrega um APK com o defeito de volta,\n` +
        `  e nada no log denunciaria.\n\n` +
        `  Algum dos três caminhos que aplicam os patches não rodou:\n` +
        `    1. plugins/som-do-alarme-em-despertador.js  (prebuild)\n` +
        `    2. "postinstall" no package.json            (todo npm/yarn install)\n` +
        `    3. "eas-build-post-install" no package.json (EAS, antes do gradlew)\n\n` +
        `  Rode 'node scripts/aplicar-patches.js' e confira o log da build para ver qual.`,
    );
  }

  return true;
}

module.exports = { conferir };

if (require.main === module) {
  conferir(process.cwd());
  console.log("[conferir-patches] ok: os patches estao no lugar.");
}
