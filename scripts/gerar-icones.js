/**
 * Gera os ícones do app a partir dos SVGs da marca em `assets/images/brand/`.
 *
 * Existe como script, e não como arquivos soltos no repositório, porque a marca é a fonte: mudou
 * o SVG, roda de novo e tudo acompanha. Editar seis PNGs à mão faria eles divergirem entre si com
 * o tempo — e o ícone é a única peça do app que a pessoa vê antes de abrir.
 *
 * Uso: `node scripts/gerar-icones.js`
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OUT = "assets/images";
const AZUL = "#196FF3";
const TRANSPARENTE = { r: 0, g: 0, b: 0, alpha: 0 };

/** Pílula branca e azul-clara, sem fundo — o que vai sobre o azul da marca. */
const markAlt = fs.readFileSync("assets/images/brand/mark-alt.svg");
/** Pílula azul sobre transparente — para o favicon, que fica sobre fundo claro. */
const mark = fs.readFileSync("assets/images/brand/mark.svg");

/**
 * A arte da pílula recortada na sua própria caixa, no tamanho pedido.
 *
 * O SVG tem 1000×1000 mas a pílula ocupa só o miolo dele, na diagonal. Um `resize` direto encolhe
 * a tela inteira — margem vazia inclusa —, e a pílula sai bem menor do que o número pedido sugere.
 * `trim` corta o vazio antes, então o tamanho passa a valer para a **forma**, que é o que importa
 * quando o Android vai recortar as bordas.
 */
async function pilula(fonte, tamanho) {
  return sharp(fonte, { density: 600 })
    .trim({ threshold: 1 })
    .resize(tamanho, tamanho, { fit: "contain", background: TRANSPARENTE })
    .toBuffer();
}

/**
 * A silhueta para o ícone monocromático do Android 13+.
 *
 * O sistema pinta a forma com a cor do tema do aparelho, então só o **alfa** importa: qualquer cor
 * que eu colocasse aqui seria descartada. Extrair o canal alfa e usá-lo como máscara de um branco
 * chapado é o que transforma a arte de duas cores numa silhueta sólida — sem isso, a divisão entre
 * as duas metades da pílula vira um risco vazado no meio do desenho.
 */
async function silhueta(tamanho) {
  const arte = await pilula(markAlt, tamanho);
  const alfa = await sharp(arte).extractChannel("alpha").toBuffer();

  return sharp({
    create: { width: tamanho, height: tamanho, channels: 3, background: "#FFFFFF" },
  })
    .joinChannel(alfa)
    .png()
    .toBuffer();
}

async function sobreFundo(tamanho, fundo, conteudo) {
  return sharp({ create: { width: tamanho, height: tamanho, channels: 4, background: fundo } })
    .composite([{ input: conteudo }])
    .png();
}

async function main() {
  // Ícone principal (iOS e fallback). A pílula ocupa ~72% — o resto é respiro, senão ela encosta
  // no arredondamento que o sistema aplica por cima.
  await (await sobreFundo(1024, AZUL, await pilula(markAlt, 620))).toFile(
    path.join(OUT, "icon.png"),
  );

  // Android adaptativo: o sistema recorta as bordas em círculo, quadrado ou gota conforme o
  // launcher, e só os 66% centrais são zona segura. Daí a pílula bem menor aqui.
  await (await sobreFundo(1024, TRANSPARENTE, await pilula(markAlt, 440))).toFile(
    path.join(OUT, "android-icon-foreground.png"),
  );
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: AZUL } })
    .png()
    .toFile(path.join(OUT, "android-icon-background.png"));
  await (await sobreFundo(1024, TRANSPARENTE, await silhueta(440))).toFile(
    path.join(OUT, "android-icon-monochrome.png"),
  );

  // Splash: a pílula sozinha, transparente. O fundo azul vem do `app.json`.
  await sharp(await pilula(markAlt, 512)).png().toFile(path.join(OUT, "splash-icon.png"));

  // Favicon do preview web: pílula azul, porque a aba do navegador é clara.
  await sharp(await pilula(mark, 196)).png().toFile(path.join(OUT, "favicon.png"));

  console.log("Ícones gerados a partir de assets/images/brand/.");
}

main().catch((erro) => {
  console.error(erro.message);
  process.exit(1);
});
