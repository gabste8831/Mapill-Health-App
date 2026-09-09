import type { ParDeEstado } from "./pares-de-estado";
import { PAR_PADRAO } from "./pares-de-estado";
import type { PaletaDeTema } from "./temas/tipos";

/** `#RRGGBB` → os três canais. */
function canais(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function paraHex([r, g, b]: [number, number, number]): string {
  const dois = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0").toUpperCase();
  return `#${dois(r)}${dois(g)}${dois(b)}`;
}

/** A cor misturada com branco (`peso` 0 = branco puro, 1 = a cor cheia). */
function clarear(hex: string, peso: number): string {
  const [r, g, b] = canais(hex);
  return paraHex([r * peso + 255 * (1 - peso), g * peso + 255 * (1 - peso), b * peso + 255 * (1 - peso)]);
}

/** A cor misturada com preto. */
function escurecer(hex: string, peso: number): string {
  const [r, g, b] = canais(hex);
  return paraHex([r * peso, g * peso, b * peso]);
}

/**
 * Reescreve os tokens de estado da paleta com o par que a pessoa escolheu.
 *
 * ## Por que derivar, e não listar
 *
 * O par tem duas cores, mas o app usa **onze** tokens de estado: a cor de texto, a viva (para
 * ícone e barra de gráfico), a preenchida (fundo de card), a superfície tingida, e os "on" de cada
 * uma. Pedir onze cores por par seria pedir que alguém escolhesse uma paleta inteira a cada opção
 * nova — e a chance de uma delas reprovar em contraste cresce com cada valor escrito à mão.
 *
 * Aqui os vizinhos saem da cor escolhida por mistura com branco ou preto, nas mesmas proporções
 * que separam os tons do tema padrão. Assim um par novo entra em `pares-de-estado.ts` com duas
 * cores e o resto se resolve, mantendo as relações que já foram validadas.
 *
 * ## O que **não** é derivado
 *
 * Os pesos abaixo pressupõem uma superfície clara (fundo quase branco, texto escuro). No tema
 * escuro as superfícies de estado são escuras, e clarear a cor produziria o inverso do que se quer
 * — por isso a derivação só entra em tema de esquema claro, e no escuro o par escolhido muda
 * apenas o que é **tinta** (`success`, `error` e as versões vivas). Quem chama decide, passando
 * `esquema`.
 */
export function aplicarParDeEstado(
  paleta: PaletaDeTema,
  par: ParDeEstado,
  esquema: "claro" | "escuro",
): PaletaDeTema {
  if (par.id === PAR_PADRAO.id) return paleta;

  const { afirmativo, negativo, atencao } = par;

  /**
   * No escuro só a tinta muda.
   *
   * As superfícies de estado ali são tons escuros calibrados contra o fundo da tela, e clarear a
   * cor escolhida geraria pastéis que não pertencem àquele tema. A cor de texto e a viva são o que
   * carregam a distinção que a pessoa veio buscar, e as duas já leem sobre fundo escuro porque o
   * par é validado sobre branco — o mesmo contraste que as torna legíveis lá as separa aqui.
   */
  if (esquema === "escuro") {
    return {
      ...paleta,
      success: clarear(afirmativo, 0.55),
      successVivo: clarear(afirmativo, 0.7),
      error: clarear(negativo, 0.55),
      errorVivo: clarear(negativo, 0.7),
      warning: clarear(atencao, 0.55),
      warningVivo: clarear(atencao, 0.7),
    };
  }

  return {
    ...paleta,
    success: afirmativo,
    successVivo: afirmativo,
    successContainer: clarear(afirmativo, 0.28),
    onSuccessContainer: escurecer(afirmativo, 0.55),
    // 0.18 e nao 0.06: a 6% a superficie ficava a 1.10:1 do cartao branco — o bloco tingido
    // sumia, e o lembrete que era amarelo virava um retangulo da cor do fundo. O ambar fixo do
    // app da 1.12, e este peso da 1.33: visivel sem virar area de cor cheia.
    successSurface: clarear(afirmativo, 0.18),

    error: negativo,
    errorVivo: negativo,
    errorContainer: clarear(negativo, 0.22),
    onErrorContainer: escurecer(negativo, 0.6),
    // O mesmo peso do `successSurface`, pelo mesmo motivo: a 6% o bloco nao se distinguia do
    // cartao. O texto sobre ela continua folgado (9.5:1 no pior par).
    errorSurface: clarear(negativo, 0.18),
    onErrorSurface: escurecer(negativo, 0.6),
    // O preenchido é o fundo de card com texto branco por cima: precisa ser o mais fechado dos
    // três, senão o branco reprova em AA. 0.72 é a proporção que o par padrão já usava.
    errorPreenchido: escurecer(negativo, 0.72),

    /**
     * O terceiro estado. `warningVivo` é a **lâmpada acesa** (ver `colors.ts`), e por isso não
     * segue a regra dos outros dois: ele é fundo de selo com texto escuro por cima, então clarear
     * é o que o mantém legível. `onWarningVivo` acompanha, quase-preto.
     */
    warning: atencao,
    warningSurface: clarear(atencao, 0.18),
    onWarningSurface: escurecer(atencao, 0.6),
    warningVivo: clarear(atencao, 0.45),
    onWarningVivo: escurecer(atencao, 0.3),
  };
}
