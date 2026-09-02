import { useRouter } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";

import { escutarAlarmeDeTelaCheia } from "@/notifications/escutar-alarme";
import {
  consultarRespostaDeAbertura,
  escutarRespostas,
} from "@/notifications/escutar-respostas";
import type { DadosDoAviso } from "@/notifications/expo-notification-gateway";
import { reagendarTodosOsAvisos } from "@/notifications/reagendar-avisos";

/**
 * Liga os avisos de dose ao ciclo de vida do app.
 *
 * Faz três coisas, e as três são do mesmo assunto — por isso moram juntas:
 *
 * 1. **Reabastece a janela** a cada volta ao primeiro plano. É o que mantém os sete dias sempre
 *    cheios sem depender de background task, num app que a pessoa abre justamente para confirmar
 *    dose. Também cobre os gatilhos que não passam por tela nenhuma: reboot do aparelho, mudança de
 *    fuso e virada do horário de verão — em todos, o reagendamento recalcula tudo a partir do
 *    relógio atual.
 *
 * 2. **Trata a resposta com o app aberto** — o toque no botão ou no corpo da notificação.
 *
 * 3. **Trata a resposta que abriu o app**, para quem tocou na notificação com ele fechado.
 *
 * Não importa `expo-notifications`: quem fala com o sistema é `src/notifications/`, e aqui só mora
 * a parte de React (efeito, ciclo de vida, navegação).
 */
export function useDoseNotifications(): void {
  const router = useRouter();

  useEffect(() => {
    function abrirHorario(dados: DadosDoAviso) {
      router.push({
        pathname: "/horario/[instante]",
        params: { instante: dados.scheduledFor },
      });
    }

    void reagendarTodosOsAvisos();

    const assinaturaDoEstado = AppState.addEventListener("change", (estado) => {
      if (estado === "active") void reagendarTodosOsAvisos();
    });
    const pararDeEscutar = escutarRespostas(abrirHorario);

    /**
     * O alarme tem handlers próprios (Notifee), separados dos do `expo-notifications`.
     *
     * Além de tratar o "Tomei" da notificação, ele **abre a tela do alarme** quando o aviso chega
     * com o app em primeiro plano. O Android rebaixa a tela cheia para heads-up sempre que a pessoa
     * está usando o celular, e não há como pedir o contrário pela API — mas o app rodando pode
     * navegar, e o resultado é o mesmo: a tela do alarme por cima do que estava aberto.
     */
    const pararDeEscutarAlarme = escutarAlarmeDeTelaCheia((scheduledFor) => {
      router.push({ pathname: "/alarme/[instante]", params: { instante: scheduledFor } });
    });

    void consultarRespostaDeAbertura().then((dados) => {
      if (dados !== null) abrirHorario(dados);
    });

    return () => {
      assinaturaDoEstado.remove();
      pararDeEscutar();
      pararDeEscutarAlarme();
    };
  }, [router]);
}
