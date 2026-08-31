/**
 * Um estoque controlado, com a data da última vez que alguém conferiu a caixa de verdade.
 *
 * "Conferir" é só a recontagem manual (`manual_recount`). Baixa por dose e reposição mexem no
 * número sem que ninguém tenha olhado dentro da caixa — e é justamente a distância entre o número
 * do app e o que está lá que este lembrete existe para fechar.
 */
export type EstoqueParaConferir = {
  inventoryItemId: string;
  medicationId: string;
  medicationName: string;
  /** ISO da última recontagem manual. `null` = nunca houve, e vale o marco zero abaixo. */
  ultimaRecontagem: string | null;
  /**
   * O marco zero de quem nunca recontou.
   *
   * É o `updatedAt` do estoque, e não uma data de criação — o schema não tem `created_at`, e
   * acrescentá-lo exigiria uma migration para um lembrete que tolera aproximação. A diferença
   * aparece em um caso: mexer no estoque (repor, tomar dose) empurra o relógio deste lembrete para
   * frente. É aceitável, e até desejável — quem acabou de repor olhou a caixa há pouco.
   */
  referencia: string;
};

export type EstoquesARecontarInput = {
  estoques: EstoqueParaConferir[];
  agora: Date;
};

export type EstoqueARecontar = {
  inventoryItemId: string;
  medicationId: string;
  medicationName: string;
  /** Há quantos dias ninguém confere. Serve ao texto do lembrete. */
  diasSemConferir: number;
};

/**
 * De quanto em quanto tempo vale perguntar.
 *
 * Trinta dias, e não sete. O erro que este lembrete corrige — o app achar que tem 20 comprimidos e
 * a caixa ter 17 — se acumula devagar: nasce de uma dose tomada sem confirmar, de um comprimido
 * que caiu, de uma cartela que veio com um a menos. Perguntar toda semana transformaria uma
 * conferência útil numa tarefa doméstica, e a resposta viraria automática — que é exatamente o
 * oposto de conferir.
 *
 * Um mês também casa com o ritmo de quem compra caixa de 30: a pergunta chega perto de quando a
 * pessoa vai à farmácia de qualquer forma.
 */
const DIAS_ENTRE_CONFERENCIAS = 30;

const DIA_EM_MS = 24 * 60 * 60_000;

/**
 * Quais estoques merecem a pergunta "o que está na caixa bate com o que o app mostra?".
 *
 * **É lembrete, não cobrança.** O plano registra isso como não obrigatório (decisão nº6): o app
 * funciona igual se ninguém nunca recontar, e o número dele continua sendo a melhor estimativa
 * disponível. O que a conferência dá é confiança na previsão de esgotamento — e essa é a única
 * coisa que ela promete.
 *
 * Regra pura, com `agora` injetado: verificável em Node, sem aparelho.
 */
export function estoquesARecontar(input: EstoquesARecontarInput): EstoqueARecontar[] {
  const agoraMs = input.agora.getTime();

  return input.estoques
    .flatMap((estoque) => {
      // Nunca recontado conta a partir do cadastro: quem cadastrou ontem informou o número olhando
      // a caixa, e perguntar hoje seria pedir de novo o que acabou de ser respondido.
      const referencia = estoque.ultimaRecontagem ?? estoque.referencia;
      const diasSemConferir = Math.floor((agoraMs - new Date(referencia).getTime()) / DIA_EM_MS);
      if (diasSemConferir < DIAS_ENTRE_CONFERENCIAS) return [];

      return [
        {
          inventoryItemId: estoque.inventoryItemId,
          medicationId: estoque.medicationId,
          medicationName: estoque.medicationName,
          diasSemConferir,
        },
      ];
    })
    // O mais antigo primeiro: é aquele cujo número tem mais chance de ter escorregado.
    .sort((a, b) => b.diasSemConferir - a.diasSemConferir);
}
