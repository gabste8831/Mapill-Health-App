/**
 * O que o app precisa do sistema operacional para avisar na hora da dose.
 *
 * O domínio define o contrato e a infraestrutura o cumpre (§2.6.1 — inversão de dependência).
 * Nenhum use-case importa `expo-notifications`; quem o importa é `src/notifications/`, e só.
 *
 * Existe também para deixar o app testável fora do aparelho: a regra de *quando* avisar é
 * aritmética de datas, e verificá-la não pode depender de ter um Android na mesa.
 */

/** Resposta do sistema ao pedido de permissão. */
export type NotificationPermission =
  | "concedida"
  /** Ainda não foi pedida — dá para perguntar. */
  | "naoPedida"
  /**
   * Negada. No Android **o diálogo não aparece de novo** depois da primeira recusa, então este
   * estado é definitivo pela via normal: só as configurações do sistema revertem. Insistir num
   * diálogo que nunca mais abre seria fingir que há saída.
   */
  | "negada";

/**
 * Um aviso a ser entregue num instante futuro.
 *
 * É **por horário**, e não por dose: quem toma quatro remédios às 08:00 receberia quatro avisos
 * idênticos em sequência, e o quarto ensina a ignorar o primeiro. O aviso lista o que há para
 * tomar naquele horário, e as ações rápidas se ajustam à quantidade.
 */
export type AvisoDeDose = {
  /**
   * Identifica o aviso. Deriva do que ele avisa (o instante da dose, o id do compromisso), então
   * recalcular o mesmo aviso produz a mesma chave — o que torna o cancelamento idempotente.
   */
  chave: string;
  /** Quando tocar. */
  quando: Date;
  titulo: string;
  corpo: string;
  /**
   * Ids das doses cobertas por este aviso — é o que a tela do horário abre.
   *
   * **Vazio** nos avisos que não são de dose (compromisso, receita vencendo): eles não apontam
   * para dose nenhuma, e é isso que faz o toque abrir o app em vez da tela de horário.
   */
  doseScheduleIds: string[];
  /**
   * `alarm` toca alto e atravessa o Não Perturbe; `notification` respeita o silencioso. Os dois
   * são heads-up: a diferença está no canal do Android, e ela é real (ver `canais.ts`).
   *
   * Compromisso e receita são **sempre** `notification` (decisão de 24/08): interromper como
   * despertador se justifica na dose, que tem hora exata e consequência clínica imediata; para uma
   * consulta na semana que vem seria só barulho.
   */
  modo: "alarm" | "notification";
  /**
   * Se este aviso **não** deve oferecer as ações rápidas de dose (Tomei / Adiar).
   *
   * Duas situações o ligam, e as duas pelo mesmo motivo — não há o que oferecer: a dose já gastou
   * seu único adiamento, ou o aviso nem é de dose (compromisso, receita). Botão que aparece e não
   * funciona é pior que botão nenhum.
   */
  semAcoesRapidas: boolean;
};

export interface NotificationGateway {
  /** Estado atual, sem pedir nada. Usado para decidir se o app mostra aviso de permissão. */
  consultarPermissao(): Promise<NotificationPermission>;
  /**
   * Pede a permissão. Chamado **no momento em que o paciente ativa** um lembrete, nunca no
   * onboarding: pedido sem contexto é pedido negado, e no Android a negativa não se desfaz.
   */
  pedirPermissao(): Promise<NotificationPermission>;
  /** Abre as configurações do app no sistema — a única saída depois de uma negativa. */
  abrirConfiguracoesDoSistema(): Promise<void>;

  agendar(aviso: AvisoDeDose): Promise<void>;
  /**
   * Apaga **tudo** que o app agendou e reagenda do zero.
   *
   * Parece grosseiro e é deliberado: o pior defeito possível aqui é o alarme órfão — lembrete de
   * um remédio que a pessoa já parou de tomar. Cancelar tudo e reagendar é idempotente, e
   * idempotência é a única forma barata de garantir que nenhum sobreviva a uma edição.
   */
  cancelarTudo(): Promise<void>;
  /** Quantos avisos estão pendentes no sistema. Serve ao diagnóstico, não à regra. */
  contarPendentes(): Promise<number>;
  /**
   * Tira da bandeja um aviso **já exibido**, depois de respondido.
   *
   * Diferente de `cancelarTudo`, que mexe no que ainda vai tocar. No Android um aviso não some ao
   * receber toque num botão de ação, e enquanto ele estiver lá cada toque repete a resposta.
   */
  dispensar(chave: string): Promise<void>;
}
