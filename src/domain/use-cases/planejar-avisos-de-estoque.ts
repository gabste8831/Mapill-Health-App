import type { AvisoDeDose } from "../ports/notification-gateway";

/**
 * O que este use-case precisa saber sobre cada estoque com aviso pedido.
 *
 * A previsão (`diasRestantes`, `ultimoDia`) vem pronta de `estimateStockDepletion`: a conta de
 * quanto tempo o estoque dura depende da posologia, e refazê-la aqui duplicaria a regra.
 */
export type EstoqueAAvisar = {
  inventoryId: string;
  medicationName: string;
  /** Dias até a última dose que o estoque cobre. Zero = acaba hoje. */
  diasRestantes: number;
  /** `YYYY-MM-DD` do último dia coberto. */
  ultimoDia: string;
  /** Antecedência pedida pela pessoa. `null` = não quer aviso. */
  avisoLeadDays: number | null;
  /**
   * O que já foi avisado para este estoque, para o aviso não se repetir.
   *
   * `null` = nunca avisado. Guarda a quantidade que havia no momento do aviso, e é ela que
   * destrava o próximo: ver `precisaAvisar`.
   */
  quantidadeQuandoAvisou: number | null;
  /** Quanto há na caixa agora — comparado com `quantidadeQuandoAvisou`. */
  quantidadeAtual: number;
};

export type PlanejarAvisosDeEstoqueInput = {
  estoques: EstoqueAAvisar[];
  agora: Date;
  /** Fim da janela de agendamento, igual à das doses. */
  ate: Date;
};

const PREFIXO_ESTOQUE = "estoque-";

/** A mesma hora dos avisos de compromisso e receita — ver `planejar-avisos-de-compromisso`. */
const HORA_DO_AVISO = 0;
const MINUTO_DO_AVISO = 1;

function inicioDoDia(dia: Date): Date {
  return new Date(
    dia.getFullYear(),
    dia.getMonth(),
    dia.getDate(),
    HORA_DO_AVISO,
    MINUTO_DO_AVISO,
    0,
    0,
  );
}

/**
 * Se este estoque ainda deve gerar aviso, ou se já avisou e está calado de propósito.
 *
 * **O problema que isto resolve:** ao contrário da receita, cuja validade é uma data fixa, a
 * previsão de estoque é recalculada a cada dose confirmada e a cada recontagem. Sem trava, um
 * estoque baixo geraria um aviso novo a cada toque em "confirmar" — o caminho mais curto para a
 * pessoa desligar as notificações do app e perder junto os alarmes de dose.
 *
 * **A trava:** avisado uma vez, fica calado enquanto a quantidade não **subir**. Repor a caixa é
 * o único gesto que devolve o estoque ao normal, e é ele que rearma o aviso para a próxima vez
 * que baixar. Consumir mais (confirmar doses) não rearma nada: é a mesma queda já avisada.
 */
function precisaAvisar(estoque: EstoqueAAvisar): boolean {
  if (estoque.quantidadeQuandoAvisou === null) return true;
  return estoque.quantidadeAtual > estoque.quantidadeQuandoAvisou;
}

/**
 * Os avisos de estoque acabando.
 *
 * Dois por estoque, no máximo, e cada um uma vez só:
 *
 * - **entrando na janela** — a previsão diz que o estoque dura menos que a antecedência pedida.
 *   É o aviso que dá tempo de ir à farmácia.
 * - **acabou** — a previsão chegou a zero. Aqui não há mais o que planejar; é constatação, e a
 *   dose de amanhã depende de resolver hoje.
 *
 * O cartão da Home continua sendo o canal garantido: ele não depende de permissão de notificação
 * e mostra o estado atual em vez de um instante passado. Estes avisos são o que alcança quem não
 * abriu o app — e é por isso que o texto do formulário não pode prometer só um dos dois.
 */
export function planejarAvisosDeEstoque(input: PlanejarAvisosDeEstoqueInput): AvisoDeDose[] {
  const avisos: AvisoDeDose[] = [];

  const agendavel = (quando: Date) => quando > input.agora && quando <= input.ate;

  for (const estoque of input.estoques) {
    if (estoque.avisoLeadDays === null) continue;
    if (!precisaAvisar(estoque)) continue;

    /**
     * O dia em que a previsão entra na janela — e não "hoje" nem o dia do fim.
     *
     * Um estoque que dura 20 dias com aviso pedido para 7 tem o seu aviso marcado para daqui a
     * 13 dias. Agendar para hoje seria avisar cedo demais sobre algo que ainda não é problema;
     * agendar para o último dia seria tarde para o que o aviso serve, que é dar tempo de repor.
     */
    const diasAteAJanela = estoque.diasRestantes - estoque.avisoLeadDays;
    const entradaNaJanela = inicioDoDia(
      new Date(input.agora.getFullYear(), input.agora.getMonth(), input.agora.getDate() + diasAteAJanela),
    );

    if (agendavel(entradaNaJanela)) {
      avisos.push({
        chave: `${PREFIXO_ESTOQUE}${estoque.inventoryId}-baixo`,
        quando: entradaNaJanela,
        titulo: `${estoque.medicationName} está acabando`,
        /**
         * O nome do remédio no **título**, e a frase começando por "seu estoque".
         *
         * Antes o título era "Estoque acabando" e o remédio vinha no corpo — que é a parte que o
         * Android trunca primeiro, e a que some quando a tela de bloqueio esconde conteúdo. Quem
         * toma quatro remédios recebia um aviso que não dizia qual, justamente na situação em que
         * ele tem menos espaço para dizer.
         *
         * O número de dias fica: é ele que decide se dá para esperar a próxima ida à farmácia —
         * mais útil que a quantidade, que exigiria fazer a conta da posologia de cabeça.
         */
        corpo: `Seu estoque de ${estoque.medicationName} dura cerca de ${estoque.avisoLeadDays} ${estoque.avisoLeadDays === 1 ? "dia" : "dias"}. Vale repor antes que acabe.`,
        doseScheduleIds: [],
        modo: "notification",
        semAcoesRapidas: true,
      });
    }

    const fim = inicioDoDia(
      new Date(
        input.agora.getFullYear(),
        input.agora.getMonth(),
        input.agora.getDate() + estoque.diasRestantes,
      ),
    );
    /**
     * Só quando o fim não cai no mesmo dia da entrada na janela — pela mesma razão da receita:
     * duas notificações iguais no mesmo minuto leem como defeito, não como ênfase. É o caso de
     * quem pede aviso com antecedência maior do que o estoque que tem.
     */
    if (agendavel(fim) && fim.getTime() !== entradaNaJanela.getTime()) {
      avisos.push({
        chave: `${PREFIXO_ESTOQUE}${estoque.inventoryId}-acabou`,
        quando: fim,
        titulo: `${estoque.medicationName} acaba hoje`,
        // "Depois de hoje não há mais" diz a consequência, que é o que a frase anterior ("é a
        // última dose que o estoque cobre") obrigava a deduzir. Num aviso que a pessoa lê de
        // relance na barra, deduzir é o que não acontece.
        corpo: `Hoje é a última dose de ${estoque.medicationName} que você tem. Depois disso, o estoque acaba.`,
        doseScheduleIds: [],
        modo: "notification",
        semAcoesRapidas: true,
      });
    }
  }

  return avisos.sort((a, b) => a.quando.getTime() - b.quando.getTime());
}
