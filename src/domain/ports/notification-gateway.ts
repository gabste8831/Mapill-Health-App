/**
 * Contrato do que o app precisa do sistema operacional para avisar na hora da dose.
 *
 * O dominio define, a infraestrutura cumpre: nenhum use-case importa `expo-notifications`. Tambem
 * e o que deixa a regra de quando avisar testavel sem um Android na mesa.
 */

export type NotificationPermission =
  | "concedida"
  | "naoPedida"
  /** No Android o dialogo nao reaparece depois da primeira recusa: so as configuracoes revertem. */
  | "negada";

/**
 * Um aviso a ser entregue num instante futuro.
 *
 * E por horario, e nao por dose: quatro remedios as 08:00 gerariam quatro avisos em sequencia, e o
 * quarto ensina a ignorar o primeiro.
 */
export type AvisoDeDose = {
  /** Deriva do que ela avisa, entao recalcular o mesmo aviso da a mesma chave. */
  chave: string;
  quando: Date;
  titulo: string;
  corpo: string;
  /** Vazio nos avisos que nao sao de dose, e e isso que faz o toque abrir o app. */
  doseScheduleIds: string[];
  /**
   * O instante das doses, que nem sempre e a hora de tocar.
   *
   * Divergem no lembrete adiado e sempre que a dose esta vencida, porque o piso do gatilho empurra
   * o disparo para "agora + 1s". A tela do alarme procura doses numa janela de 60s a partir do que
   * recebe: com a hora de tocar ela sobe vazia, sem nome e sem foto, e "Tomei" nao registra nada.
   */
  instanteDasDoses?: string;
  /**
   * `alarm` atravessa o Nao Perturbe; `notification` respeita o silencioso.
   *
   * Compromisso e receita sao sempre `notification`: interromper como despertador se justifica na
   * dose, que tem hora exata e consequencia clinica.
   */
  modo: "alarm" | "notification";
  /** A dose ja gastou o adiamento, ou o aviso nem e de dose. */
  semAcoesRapidas: boolean;
};

export interface NotificationGateway {
  consultarPermissao(): Promise<NotificationPermission>;
  /** Chamado quando o paciente ativa um lembrete: pedido sem contexto e pedido negado. */
  pedirPermissao(): Promise<NotificationPermission>;
  abrirConfiguracoesDoSistema(): Promise<void>;

  agendar(aviso: AvisoDeDose): Promise<void>;
  /**
   * Apaga tudo e reagenda do zero.
   *
   * Grosseiro de proposito: o pior defeito aqui e o alarme orfao, e idempotencia e a forma barata
   * de garantir que nenhum sobreviva a uma edicao. Poupa o lembrete adiado.
   */
  cancelarTudo(): Promise<void>;
  /** O par do apagamento de dados: leva junto o adiado, que o `cancelarTudo` poupa. */
  cancelarTodosOsAgendamentos(): Promise<void>;
  /** Serve ao diagnostico, nao a regra. */
  contarPendentes(): Promise<number>;
  /**
   * Tira da bandeja um aviso ja exibido.
   *
   * No Android o aviso nao some ao receber toque num botao de acao, e enquanto estiver la cada
   * toque repete a resposta.
   */
  dispensar(chave: string): Promise<void>;
}
