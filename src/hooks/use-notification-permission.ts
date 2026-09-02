import { useCallback, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

import type { NotificationPermission } from "@/domain/ports/notification-gateway";
import { NotifeeGateway } from "@/notifications/notifee-gateway";

const gateway = new NotifeeGateway();

/** No navegador não há permissão de notificação a gerenciar (§5.1 — web é vitrine). */
const temNotificacoes = Platform.OS !== "web";

/**
 * O estado da permissão de avisos, e como pedi-la.
 *
 * Reconsulta a cada volta ao primeiro plano porque a permissão pode ser **revogada nas
 * configurações do sistema** enquanto o app está em segundo plano — e quando isso acontece o app
 * precisa parar de prometer avisos que não vai entregar. Falhar em silêncio aqui é o pior
 * comportamento possível: a pessoa continua confiando num lembrete que não existe mais.
 */
export function useNotificationPermission() {
  const [permissao, setPermissao] = useState<NotificationPermission>(
    temNotificacoes ? "naoPedida" : "negada",
  );

  const consultar = useCallback(async () => {
    if (!temNotificacoes) return;
    setPermissao(await gateway.consultarPermissao());
  }, []);

  useEffect(() => {
    if (!temNotificacoes) return;

    let ativo = true;
    /**
     * Uma função só, e o resultado descartado quando o hook já saiu de cena: o estado da permissão
     * mora no sistema operacional, e este efeito é a assinatura dele. A checagem de `ativo` evita
     * escrever estado em componente desmontado quando a consulta volta depois da saída da tela.
     */
    async function sincronizar() {
      const atual = await gateway.consultarPermissao();
      if (ativo) setPermissao(atual);
    }

    void sincronizar();
    const assinatura = AppState.addEventListener("change", (estado) => {
      if (estado === "active") void sincronizar();
    });

    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, []);

  /**
   * Pede a permissão. Chamado no momento em que a pessoa escolhe ser avisada — nunca no
   * onboarding: pedido sem contexto é pedido negado, e no Android a negativa **não se desfaz** por
   * diálogo. Uma recusa cedo demais custa o recurso central do app para sempre.
   */
  const pedir = useCallback(async (): Promise<NotificationPermission> => {
    if (!temNotificacoes) return "negada";
    const resultado = await gateway.pedirPermissao();
    setPermissao(resultado);
    return resultado;
  }, []);

  const abrirConfiguracoes = useCallback(async () => {
    await gateway.abrirConfiguracoesDoSistema();
  }, []);

  /**
   * Leva à tela do sistema que concede acesso à política do Não Perturbe — a permissão que faz o
   * alarme atravessar o DND. O Android não a pede sozinho, então o app precisa apontar o caminho.
   */
  const abrirAcessoAoNaoPerturbe = useCallback(async () => {
    await gateway.abrirAcessoAoNaoPerturbe();
  }, []);

  return { permissao, pedir, abrirConfiguracoes, abrirAcessoAoNaoPerturbe, consultar };
}
