import * as Notifications from "expo-notifications";

import type { DadosDoAviso } from "./expo-notification-gateway";
import { tratarRespostaAoAviso, type RespostaAoAviso } from "./responder-aviso";

/**
 * Como a notificação se comporta com o app **aberto**.
 *
 * Continua aparecendo, e isso é decisão de produto: o padrão do sistema é esconder o aviso quando
 * o app está em primeiro plano, mas "aberto" inclui estar lendo a bula em outra aba do Mapill — e
 * ali a hora da dose é exatamente o que precisa interromper.
 *
 * Fica no topo do módulo porque é configuração global, aplicada uma vez por execução.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Lê os dados que viajaram com a notificação, defensivamente.
 *
 * O conteúdo vem do sistema operacional e pode ser de uma versão antiga do app — uma notificação
 * agendada semana passada sobrevive a uma atualização. Confiar no formato levaria a um crash na
 * abertura, que é o pior momento possível.
 */
function lerDados(response: Notifications.NotificationResponse): DadosDoAviso | null {
  const dados = response.notification.request.content.data as Partial<DadosDoAviso> | undefined;
  if (dados === undefined) return null;
  if (typeof dados.scheduledFor !== "string") return null;
  if (!Array.isArray(dados.doseScheduleIds)) return null;
  return {
    chave: typeof dados.chave === "string" ? dados.chave : "",
    doseScheduleIds: dados.doseScheduleIds,
    scheduledFor: dados.scheduledFor,
  };
}

async function processar(
  response: Notifications.NotificationResponse,
): Promise<RespostaAoAviso | null> {
  const dados = lerDados(response);
  if (dados === null) return null;
  return tratarRespostaAoAviso(response.actionIdentifier, dados);
}

/**
 * Assina as respostas às notificações — o toque no botão ou no corpo.
 *
 * `aoAbrirHorario` só é chamado quando a resposta pede navegação; os botões resolvem em segundo
 * plano e não levam a lugar nenhum. Quem navega é a camada de cima: este módulo não conhece rota.
 */
export function escutarRespostas(
  aoAbrirHorario: (dados: DadosDoAviso) => void,
): () => void {
  const assinatura = Notifications.addNotificationResponseReceivedListener((response) => {
    void processar(response).then((resultado) => {
      if (resultado?.tipo === "abrirHorario") aoAbrirHorario(resultado.dados);
    });
  });

  return () => assinatura.remove();
}

/**
 * A resposta que **abriu** o app, quando ele estava fechado.
 *
 * Ela aconteceu antes de qualquer listener existir, e só esta consulta a recupera. Sem ela, tocar
 * numa notificação com o app fechado levaria à Home — e a pessoa teria que procurar o que já
 * estava na mão.
 */
export async function consultarRespostaDeAbertura(): Promise<DadosDoAviso | null> {
  const response = await Notifications.getLastNotificationResponseAsync();
  if (response === null) return null;
  const resultado = await processar(response);
  return resultado?.tipo === "abrirHorario" ? resultado.dados : null;
}
