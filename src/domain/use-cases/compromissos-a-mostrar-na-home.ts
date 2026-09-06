/**
 * O que a Home precisa saber de cada compromisso. Menos que a entidade inteira: a regra de mostrar
 * ou não depende só de quando é e do que foi pedido de aviso.
 */
export type CompromissoDaHome = {
  appointmentId: string;
  /** Instante do compromisso, em ISO. */
  scheduledFor: string;
  /** Antecedência do aviso, em dias. `null` = a pessoa não pediu lembrete. */
  reminderLeadDays: number | null;
  /** Avisar também na manhã do próprio dia. */
  reminderOnDay: boolean;
  /** Já respondido ("fui" / "não fui"). */
  jaRespondido: boolean;
};

/** Um compromisso aprovado para a Home, com a distância que a tela mostra. */
export type CompromissoNaHome = {
  appointmentId: string;
  /** Dias inteiros até o compromisso. `0` = hoje. Nunca negativo — passados não entram. */
  emDias: number;
  ehHoje: boolean;
};

export type CompromissosNaHomeInput = {
  compromissos: CompromissoDaHome[];
  agora: Date;
};

/** Meia-noite do dia de `instante`, no fuso do aparelho. */
function inicioDoDia(instante: Date): Date {
  return new Date(instante.getFullYear(), instante.getMonth(), instante.getDate());
}

/** Diferença em dias inteiros de calendário, ignorando a hora. */
function diasDeDiferenca(de: Date, ate: Date): number {
  const umDia = 24 * 60 * 60_000;
  return Math.round((inicioDoDia(ate).getTime() - inicioDoDia(de).getTime()) / umDia);
}

/**
 * Quais compromissos a Home mostra hoje.
 *
 * ## A janela é o lembrete que a pessoa pediu
 *
 * Um compromisso marcado com três meses de antecedência não pode ocupar a Home por três meses — ela
 * é a tela do **dia**, e o que não é acionável hoje vira ruído que empurra as doses para baixo. Mas
 * também não basta mostrar só no próprio dia: quem pede aviso de sete dias está pedindo tempo para
 * se organizar (remarcar o trabalho, arrumar carona), e esse pedido vale tanto para a notificação
 * quanto para a tela.
 *
 * Então a antecedência do aviso **é** a janela do card: `reminderLeadDays: 7` põe o compromisso na
 * Home nos sete dias que antecedem a consulta. A regra fica com um só lugar para ser ajustada, e a
 * notificação e a Home nunca discordam — que era o problema de tê-las com critérios separados.
 *
 * Quem não pediu lembrete nenhum não recebe card **antes** do dia. Não pedir aviso é uma resposta,
 * e ignorá-la seria decidir pela pessoa que ela quer ser avisada com antecedência.
 *
 * O próprio dia é a exceção, e entra sempre. A Home é a tela do que acontece hoje: um compromisso
 * marcado para hoje é do dia de hoje, tenha sido pedido lembrete ou não. Quem não marcou aviso
 * dispensou a *antecedência* — não dispensou ver a própria agenda quando ela chega.
 *
 * ## Por que sai depois da data
 *
 * Passou o compromisso, o card sai da Home mesmo sem resposta. A Home mostra o que **ainda dá para
 * fazer**; registrar que a consulta aconteceu é conversa da listagem de compromissos, onde o
 * histórico vive. Um card de ontem cobrando desfecho competiria com as doses de hoje pelo mesmo
 * espaço, e perderia — vira aquele aviso que se aprende a ignorar.
 *
 * Respondido não entra em nenhuma hipótese: não há o que lembrar.
 */
export function compromissosAMostrarNaHome(input: CompromissosNaHomeInput): CompromissoNaHome[] {
  const { compromissos, agora } = input;

  const naHome: CompromissoNaHome[] = [];

  for (const compromisso of compromissos) {
    if (compromisso.jaRespondido) continue;

    const quando = new Date(compromisso.scheduledFor);
    const emDias = diasDeDiferenca(agora, quando);

    // Já passou o dia: sai da Home. A cobrança do desfecho é da listagem.
    if (emDias < 0) continue;

    /**
     * A janela em dias, sempre incluindo hoje (`0`).
     *
     * `reminderLeadDays` estende para trás a partir do dia; `reminderOnDay` não muda a janela,
     * porque hoje já está dentro dela de qualquer forma — o que ele governa é a **notificação**, que
     * é outro canal. Quem marcou antecedência de 7 dias tem janela de 7; quem não marcou nada tem
     * janela de 0, que é só o próprio dia.
     */
    const janela = Math.max(0, compromisso.reminderLeadDays ?? 0);

    if (emDias > janela) continue;

    naHome.push({
      appointmentId: compromisso.appointmentId,
      emDias,
      ehHoje: emDias === 0,
    });
  }

  // O mais próximo primeiro: é a ordem em que as coisas vão acontecer.
  return naHome.sort((a, b) => a.emDias - b.emDias);
}
