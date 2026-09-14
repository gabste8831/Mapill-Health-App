/**
 * Faz o `foregroundServiceBehavior` sobreviver à ponte JS→Java — e é o que tira o atraso de até
 * 10 s entre o alarme disparar e o aviso aparecer.
 *
 * ## O defeito, medido em 14/09
 *
 * O logcat do disparo das 19:59, 220 ms depois de o alarme tocar:
 *
 * ```
 * W/Bundle: Key foregroundServiceBehavior expected Integer but value was a java.lang.Double.
 *           The default value 0 was returned.
 *     at app.notifee.core.model.NotificationAndroidModel.getForegroundServiceBehavior(...:117)
 * ```
 *
 * A biblioteca injeta `IMMEDIATE` (`1`) sozinha quando `asForegroundService` é `true`, para evitar o
 * adiamento que o Android 12+ impõe à notificação de um foreground service. Mas todo número em JS é
 * ponto flutuante, então o valor chega ao Bundle como `Double`; `getInt()` não aceita `Double` e
 * devolve o padrão, `0` — que é `FOREGROUND_SERVICE_DEFAULT`, o adiamento que o `IMMEDIATE` existia
 * para evitar.
 *
 * O defeito é da biblioteca, não do app: nós nunca passamos esse campo, e passá-lo do JS não muda
 * nada — o `Double` continua sendo `Double`. A correção tem de ser de quem lê.
 *
 * ## O que o patch faz
 *
 * Troca `getInt` por uma leitura que aceita qualquer número. `Bundle.get()` devolve o objeto como
 * ele veio, e `Number.intValue()` converte tanto `Double` quanto `Integer` — então funciona se a
 * biblioteca corrigir a ponte um dia, e continua funcionando enquanto ela não corrigir.
 *
 * ## Por que aqui, e não esperando um release
 *
 * Porque o defeito custa até 10 segundos num despertador de medicação, e a correção é de três
 * linhas. Quando a lib consertar, o `throw` abaixo avisa: o alvo muda de forma, a build para, e este
 * arquivo pode ser apagado.
 *
 * Aplicado pelos mesmos três caminhos do patch irmão (prebuild, `postinstall`,
 * `eas-build-post-install`) — ver `scripts/patch-som-de-despertador.js` para o porquê de três.
 */

const fs = require("node:fs");
const path = require("node:path");

/** O arquivo da biblioteca que lê o valor. */
const ARQUIVO_ALVO = path.join(
  "node_modules",
  "react-native-notify-kit",
  "android",
  "src",
  "main",
  "java",
  "app",
  "notifee",
  "core",
  "model",
  "NotificationAndroidModel.java",
);

/** O trecho exato a substituir, com a indentação do arquivo. */
const ORIGINAL = `    return mNotificationAndroidBundle.getInt(
        "foregroundServiceBehavior", NotificationCompat.FOREGROUND_SERVICE_DEFAULT);`;

/**
 * O bloco novo.
 *
 * `instanceof Number` cobre `Double` (como o valor chega hoje) e `Integer` (como chegaria se a
 * ponte fosse corrigida). Qualquer outra coisa — ausente, nulo, um tipo inesperado — cai no padrão,
 * que é o mesmo comportamento de antes.
 */
const PATCH = `    // [Mapill] Aceita Double, e nao so Integer.
    //
    // A ponte JS->Java entrega todo numero como Double, e o getInt() original descartava o valor:
    // "expected Integer but value was a java.lang.Double. The default value 0 was returned".
    // O 0 e FOREGROUND_SERVICE_DEFAULT, que adia a notificacao do servico em ate 10s no Android 12+
    // — justamente o que o IMMEDIATE injetado pela lib existia para evitar.
    //
    // Ver scripts/patch-servico-sem-atraso.js
    Object valor = mNotificationAndroidBundle.get("foregroundServiceBehavior");
    if (valor instanceof Number) {
      return ((Number) valor).intValue();
    }
    return NotificationCompat.FOREGROUND_SERVICE_DEFAULT;`;

/** A marca do patch no arquivo, para não aplicar duas vezes. */
const MARCA = "[Mapill] Aceita Double";

/**
 * Aplica o patch. Idempotente.
 *
 * **Lança** se o alvo não existe ou mudou de forma — que aqui é uma boa notícia disfarçada: se a
 * biblioteca corrigir a ponte, este patch fica obsoleto e a build avisa em vez de aplicar por cima.
 */
function aplicarPatchSemAtraso(raizDoProjeto) {
  const alvo = path.join(raizDoProjeto, ARQUIVO_ALVO);

  if (!fs.existsSync(alvo)) {
    throw new Error(
      `[servico-sem-atraso] ${ARQUIVO_ALVO} não existe. A react-native-notify-kit mudou de ` +
        `estrutura ou não foi instalada.`,
    );
  }

  const conteudo = fs.readFileSync(alvo, "utf8");

  if (conteudo.includes(MARCA)) return "ja-estava";

  if (!conteudo.includes(ORIGINAL)) {
    throw new Error(
      `[servico-sem-atraso] o getInt de foregroundServiceBehavior não foi encontrado em ` +
        `${ARQUIVO_ALVO}. A biblioteca provavelmente foi atualizada — confira se ela já corrigiu a ` +
        `leitura (era um Double lido com getInt). Se corrigiu, este patch e o script podem sair.`,
    );
  }

  fs.writeFileSync(alvo, conteudo.replace(ORIGINAL, PATCH), "utf8");
  return "aplicado";
}

module.exports = { aplicarPatchSemAtraso, ARQUIVO_ALVO, MARCA };

if (require.main === module) {
  const resultado = aplicarPatchSemAtraso(process.cwd());
  console.log(
    resultado === "aplicado"
      ? "[servico-sem-atraso] patch aplicado: a notificacao do servico sai na hora."
      : "[servico-sem-atraso] o patch já estava no arquivo — nada a fazer.",
  );
}
