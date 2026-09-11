import { useRouter } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";

import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import {
  consultarRespostaDeAbertura,
  escutarAvisos,
} from "@/notifications/escutar-avisos";
import type { DestinoDoAviso } from "@/notifications/destino-do-aviso";
import type { DadosDoAviso } from "@/notifications/notifee-gateway";
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

    /**
     * O toque num aviso que não é de dose leva **onde se resolve aquilo**.
     *
     * Antes todos caíam na Home, e a pessoa tinha de reencontrar sozinha o assunto que a
     * notificação acabara de nomear — pior justamente no caso que o aviso existe para cobrir,
     * quem abriu o celular por causa dele e não estava no app.
     *
     * Função única para os dois caminhos (app aberto e app fechado): a regra de para onde ir não
     * pode divergir conforme o estado do app, e duas cópias são como isso aconteceria.
     */
    function abrirDestino(destino: DestinoDoAviso) {
      if (destino.tela === "estoque") {
        router.push("/estoque");
        return;
      }
      if (destino.tela === "compromissos") {
        router.push({ pathname: "/compromissos", params: { detalhe: destino.appointmentId } });
        return;
      }
      /**
       * A receita: a chave carrega o `prescriptionId`, e a rota de edição espera o
       * `medicationId` — a tradução exige o banco, então acontece aqui e não no listener.
       *
       * Falhar em traduzir não pode deixar o toque sem efeito: cair na listagem de remédios é
       * pior que a tela exata, e melhor que nada acontecer.
       */
      void new PrescriptionRepository()
        .findById(destino.prescriptionId)
        .then((prescription) => {
          if (prescription === null) {
            router.push("/remedios");
            return;
          }
          router.push({
            pathname: "/cadastro/editar/[id]",
            params: { id: prescription.medicationId },
          });
        })
        .catch(() => router.push("/remedios"));
    }

    void reagendarTodosOsAvisos();

    const assinaturaDoEstado = AppState.addEventListener("change", (estado) => {
      if (estado === "active") void reagendarTodosOsAvisos();
    });
    /**
     * Um listener só, para os dois modos.
     *
     * `aoDispararAlarme` existe porque o Android rebaixa a tela cheia para heads-up sempre que a
     * pessoa está usando o celular, e não há como pedir o contrário pela API — mas o app rodando
     * pode navegar, e o resultado é o mesmo: a tela do alarme por cima do que estava aberto.
     */
    const pararDeEscutar = escutarAvisos({
      aoAbrirHorario: abrirHorario,
      /**
       * `navigate`, e não `push`: **duas telas de alarme nunca se empilham.**
       *
       * `push` empilha sempre, mesmo com a rota já aberta — e foi o que fez cada toque na
       * notificação abrir mais uma tela azul (visto em 10/09, passo 14.5.2). `navigate` reaproveita
       * a rota quando os parâmetros são os mesmos, então o mesmo horário nunca vira duas telas.
       *
       * A guarda de `alarme-em-cena` já evita o caso conhecido; esta é a segunda camada, para o
       * disparo que escape por um caminho que ninguém previu. Empilhar tela de alarme é o defeito
       * que mais custou nesta semana, e ele não pode depender de uma trava só.
       */
      aoDispararAlarme: (scheduledFor) => {
        /**
         * **Tela de alarme só com o app na frente da pessoa.**
         *
         * Este é o defeito relatado em 10/09, e o pior do bloco: com o celular desbloqueado e a
         * pessoa em outro app, o alarme tocava sem nada na tela dizendo de onde vinha o som nem
         * como pará-lo. O Android rebaixa a tela cheia para heads-up quando o aparelho está em uso,
         * e o app — vivo no mesmo processo — navegava assim mesmo: a tela azul montava **atrás** do
         * app aberto, invisível, e o `expo-audio` dela virava uma segunda fonte de som sem rosto.
         *
         * `active` é o que distingue "a tela montou" de "a pessoa está vendo a tela". Sem isto, a
         * tela escondida ainda dispensava a notificação (ver `AlarmeScreen`), apagando o único
         * aviso visível e deixando som sem origem — trocando o problema barulhento pelo mudo.
         *
         * Em segundo plano quem avisa é a notificação, que é o caminho certo: ela se lê, diz que é
         * do Mapill, toca em loop e responde ao toque. Ao tocar nela o app volta a `active`, e daí
         * a tela abre por cima — visível, com uma fonte de som só.
         */
        if (AppState.currentState !== "active") return false;

        router.navigate({ pathname: "/alarme/[instante]", params: { instante: scheduledFor } });
        return true;
      },
      aoAbrirDestino: abrirDestino,
    });

    void consultarRespostaDeAbertura().then((abertura) => {
      if (abertura === null) return;
      if (abertura.tipo === "destino") abrirDestino(abertura.destino);
      else abrirHorario(abertura.dados);
    });

    return () => {
      assinaturaDoEstado.remove();
      pararDeEscutar();
    };
  }, [router]);
}
