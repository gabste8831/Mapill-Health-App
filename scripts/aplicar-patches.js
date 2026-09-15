/**
 * Aplica todos os patches de `node_modules` — o ponto único que o `postinstall` e o
 * `eas-build-post-install` chamam.
 *
 * ## Por que existe
 *
 * São dois patches hoje (o volume de despertador e o atraso do foreground service), e encadear
 * `node isto && node aquilo` no `package.json` faz a lista de patches morar num lugar onde ninguém
 * procura por ela. Aqui ela é uma lista, com o nome de cada um e o que quebra sem ele.
 *
 * ## Por que os patches são reaplicados a cada install
 *
 * Porque o install os apaga. A fase PREBUILD do EAS roda `expo prebuild` e **depois**
 * `yarn install`, que reinstala `node_modules` por cima do que o prebuild patcheou — foi o que fez
 * o alarme sair no volume de mídia em 14/09, com o patch aplicado e descartado na mesma build.
 *
 * Ver `scripts/patch-som-de-despertador.js` para o log da build que mostra a ordem.
 */

const { aplicarPatchDeDespertador } = require("./patch-som-de-despertador");
const { aplicarPatchSemAtraso } = require("./patch-servico-sem-atraso");
const { aplicarPatchDoFonte } = require("./patch-expo-audio-do-fonte");

/**
 * Cada patch, com o que se perde sem ele.
 *
 * O texto de `oQueQuebra` vai para a mensagem de erro: quem topar com a falha numa build de 17
 * minutos precisa saber o que está em jogo sem ter de abrir o script.
 */
const PATCHES = [
  /**
   * **Antes do patch do volume**, e a ordem importa: sem isto o `expo-audio` é consumido como AAR
   * pré-compilado e o `AudioPlayer.kt` patcheado nunca chega ao compilador — o patch seguinte vira
   * código morto, aplicado e sem efeito nenhum.
   */
  {
    nome: "expo-audio-do-fonte",
    aplicar: aplicarPatchDoFonte,
    oQueQuebra: "o expo-audio vem pré-compilado e o patch do volume não tem efeito",
  },
  {
    nome: "som-de-despertador",
    aplicar: aplicarPatchDeDespertador,
    oQueQuebra: "o alarme toca no volume de mídia em vez do de despertador",
  },
  {
    nome: "servico-sem-atraso",
    aplicar: aplicarPatchSemAtraso,
    oQueQuebra: "a notificação do alarme pode demorar até 10 s para aparecer no Android 12+",
  },
];

function aplicarTodos(raizDoProjeto = process.cwd()) {
  const resultados = [];

  for (const { nome, aplicar, oQueQuebra } of PATCHES) {
    try {
      const resultado = aplicar(raizDoProjeto);
      resultados.push({ nome, resultado });
      console.log(
        resultado === "aplicado"
          ? `[patches] ${nome}: aplicado.`
          : `[patches] ${nome}: já estava.`,
      );
    } catch (cause) {
      /**
       * Enriquece o erro em vez de engoli-lo: a mensagem do patch diz **o que** mudou no alvo, e
       * esta camada diz **o que se perde** por causa disso. As duas juntas são o que permite decidir
       * entre consertar o patch e removê-lo porque a biblioteca corrigiu o defeito.
       */
      throw new Error(`[patches] ${nome} falhou — sem ele, ${oQueQuebra}.\n\n${cause.message}`, {
        cause,
      });
    }
  }

  return resultados;
}

module.exports = { aplicarTodos, PATCHES };

if (require.main === module) {
  aplicarTodos();
}
