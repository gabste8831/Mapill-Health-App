import type { AvisoDeDose } from "../ports/notification-gateway";
import type { ReminderMode } from "../entities/prescription";

/** Menos que a entidade `DoseSchedule` de proposito: a regra aqui nao depende de mais que isto. */
export type DoseAAvisar = {
  doseScheduleId: string;
  scheduledFor: string;
  medicationName: string;
  /**
   * O texto pronto da quantidade, ja flexionado.
   *
   * Quem sabe pluralizar e `formatarQuantidade`, em `shared/`, que importa do dominio: importa-lo
   * de volta inverteria a direcao da dependencia, e reimplementar criaria um segundo lugar onde o
   * plural pode divergir.
   */
  quantidadeFormatada: string;
  reminderMode: ReminderMode;
  jaResolvida: boolean;
  jaAdiada: boolean;
};

export type PlanejarAvisosInput = {
  doses: DoseAAvisar[];
  agora: Date;
  /**
   * Ate quando agendar.
   *
   * A janela existe porque "3x ao dia por 6 meses" sao 540 avisos para uma prescricao, e um
   * paciente polimedicado passaria de 2.500, acima do que o sistema aceita manter pendente.
   */
  ate: Date;
};

/**
 * Tolerancia para o aviso que acabou de passar.
 *
 * Sem ela, reabrir o app as 08:00:30 cancelaria e nao reagendaria o aviso das 08:00, e a dose
 * ficaria sem lembrete justamente no minuto em que ele importa.
 */
const TOLERANCIA_DE_ATRASO_EM_MINUTOS = 2;

/**
 * Chave estavel do horario: mesmo instante, mesma chave.
 *
 * Exportada porque a tela do alarme precisa nomear o aviso daquele horario para dispensa-lo.
 * Reescrever o formato la criaria um segundo lugar onde a chave e construida, e a dispensa erraria
 * o alvo em silencio no dia em que um mudasse.
 */
export function chaveDoHorario(scheduledFor: string): string {
  return `dose-${scheduledFor}`;
}


/**
 * O canal que o horario dispara, um so.
 *
 * Duas doses no mesmo minuto, uma como alarme e outra como notificacao, nao viram dois avisos: o
 * horario sobe para o alarme, porque rebaixar silenciaria um lembrete que a pessoa pediu alto.
 */
function modoDoHorario(modos: ReminderMode[]): "alarm" | "notification" | null {
  // `both` conta como alarme: a opção saiu da tela (ver abaixo), e o modo mais forte é o que ela
  // buscava. Um valor gravado antes da remoção continua avisando, e no modo certo.
  if (modos.some((modo) => modo === "alarm" || modo === "both")) return "alarm";
  if (modos.some((modo) => modo === "notification")) return "notification";
  return null;
}

/**
 * Transforma as doses agendadas nos avisos que o sistema operacional deve conhecer.
 *
 * Um aviso por horario, e nao por dose: quatro remedios as 08:00 gerariam quatro notificacoes
 * identicas, e a quarta ensina a ignorar a primeira.
 *
 * Regra pura, com o `agora` injetado: e o que permite provar o agendamento em Node, sem aparelho.
 */
export function planejarAvisosDeDose(input: PlanejarAvisosInput): AvisoDeDose[] {
  const limiteInferior = new Date(
    input.agora.getTime() - TOLERANCIA_DE_ATRASO_EM_MINUTOS * 60_000,
  );

  const porHorario = new Map<string, DoseAAvisar[]>();
  for (const dose of input.doses) {
    // Já respondida não tem o que lembrar, e `none` é uma recusa explícita de ser avisado.
    if (dose.jaResolvida) continue;
    if (dose.reminderMode === "none") continue;

    const quando = new Date(dose.scheduledFor);
    if (quando < limiteInferior) continue;
    if (quando > input.ate) continue;

    const existentes = porHorario.get(dose.scheduledFor);
    if (existentes === undefined) porHorario.set(dose.scheduledFor, [dose]);
    else existentes.push(dose);
  }

  const avisos: AvisoDeDose[] = [];
  for (const [scheduledFor, doses] of porHorario) {
    const modo = modoDoHorario(doses.map((dose) => dose.reminderMode));
    if (modo === null) continue;

    /**
     * O instante do aviso nunca e no passado, mesmo quando a dose ja venceu.
     *
     * A tolerancia acima deixa passar a dose recem-vencida, mas o instante cru dela ja passou, e o
     * Notifee recusa gatilho no passado com uma excecao que derrubava o reagendamento inteiro.
     *
     * Um segundo e nao zero, porque o instante gasta milissegundos entre ser calculado e chegar ao
     * agendador.
     */
    const instanteDaDose = new Date(scheduledFor);
    const pisoDoGatilho = new Date(input.agora.getTime() + 1_000);
    const quando = instanteDaDose < pisoDoGatilho ? pisoDoGatilho : instanteDaDose;

    // Ordem estável dentro do aviso: o mesmo horário sempre lista os remédios na mesma sequência,
    // e uma lista que se reordena sozinha entre um dia e outro obriga a reler o que já se sabia.
    const ordenadas = [...doses].sort((a, b) => a.medicationName.localeCompare(b.medicationName));

    // Dois pontos e nao travessao: em fonte pequena, na barra de notificacao, ele se confunde com
    // hifen de palavra composta e some no meio do texto.
    const linhas = ordenadas.map((dose) => `${dose.medicationName}: ${dose.quantidadeFormatada}`);

    /**
     * O alarme diz como se desliga; a notificacao comum nao precisa.
     *
     * A resposta do alarme mora na tela cheia, que nem sempre irrompe: com o aparelho em uso resta
     * so esta notificacao, e quem a recebe ve o remedio e nada que diga onde parar o som. A
     * notificacao comum ja tem os botoes, e o caminho nela e visivel.
     */
    const linhasDoAviso =
      modo === "alarm" ? [...linhas, "Toque para responder e desligar o alarme."] : linhas;

    avisos.push({
      chave: chaveDoHorario(scheduledFor),
      quando,
      /**
       * O instante da dose, que nem sempre e o de tocar: confundir os dois esvaziava a tela.
       *
       * Com o piso agindo, os dois divergem por milissegundos, e a tela do alarme, que busca doses
       * numa janela de 60s a partir do que a notificacao carrega, comecava a procurar depois da
       * dose que a originou. So aparece em teste de intervalo curto: com a dose daqui a horas os
       * dois coincidem e nada denuncia.
       */
      instanteDasDoses: scheduledFor,
      /**
       * O titulo diz o que e, e o corpo diz o que tomar.
       *
       * `08:00 - Losartana` repetia o que o sistema ja mostra: a hora no canto da notificacao e o
       * nome na linha de baixo. Com mais de um remedio a contagem entra, porque ela diz quantas
       * respostas faltam antes de a pessoa tocar.
       */
      titulo:
        ordenadas.length === 1
          ? "Hora do seu remédio"
          : `Hora dos seus remédios (${ordenadas.length})`,
      corpo: linhasDoAviso.join("\n"),
      doseScheduleIds: ordenadas.map((dose) => dose.doseScheduleId),
      modo,
      // Basta uma dose já adiada para o horário ter gasto seu adiamento: a trava é do aviso, que
      // é o que a pessoa adiou, e não de cada dose que ele carrega.
      semAcoesRapidas: ordenadas.some((dose) => dose.jaAdiada),
    });
  }

  // Cronológica: quem inspeciona os pendentes (e o log do spike) lê na ordem em que vão tocar.
  return avisos.sort((a, b) => a.quando.getTime() - b.quando.getTime());
}
