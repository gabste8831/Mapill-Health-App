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
  /** Dias inteiros até o compromisso. `0` = hoje. Nunca negativo - passados não entram. */
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
 * A antecedencia do aviso e a janela do card: `reminderLeadDays: 7` poe o compromisso na Home nos
 * sete dias que antecedem a consulta. Assim a regra tem um lugar so, e a notificacao e a Home nunca
 * discordam.
 *
 * Quem nao pediu lembrete nao recebe card antes do dia, porque nao pedir aviso e uma resposta. O
 * proprio dia e a excecao e entra sempre: quem nao marcou aviso dispensou a antecedencia, nao
 * dispensou ver a agenda quando ela chega.
 *
 * Passada a data, o card sai mesmo sem resposta: a Home mostra o que ainda da para fazer, e
 * registrar o desfecho e conversa da listagem. Respondido nao entra em hipotese nenhuma.
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
     * porque hoje já está dentro dela de qualquer forma - o que ele governa é a **notificação**, que
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
