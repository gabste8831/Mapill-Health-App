import { useRouter } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";

import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { jaEstaEmCena } from "@/notifications/alarme-em-cena";
import {
  consultarRespostaDeAbertura,
  escutarAvisos,
  marcarAlarmeComoAberto,
} from "@/notifications/escutar-avisos";
import type { DestinoDoAviso } from "@/notifications/destino-do-aviso";
import type { DadosDoAviso } from "@/notifications/notifee-gateway";
import { reagendarTodosOsAvisos } from "@/notifications/reagendar-avisos";

/**
 * Quanto o app espera pela Activity do alarme antes de assumir a tela ele mesmo.
 *
 * É a folga para o Android montar o `fullScreenAction` e o `AlarmeRaiz` se registrar em
 * `alarme-em-cena`. Curto de propósito — é tempo de alarme tocando, e meio segundo de atraso na
 * tela não se percebe; um segundo inteiro, sim.
 *
 * Não precisa ser exato: errar para menos abre a rota e a Activity chega por cima (ela vence, ver
 * `entrouEmCena`); errar para muito só atrasa a tela. O custo do erro é baixo dos dois lados, que é
 * o que torna a espera uma solução aceitável em vez de um palpite frágil.
 */
const RESPIRO_DA_ACTIVITY_EM_MS = 600;

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
    /**
     * As esperas pela Activity que ainda não venceram, para a limpeza poder cancelá-las.
     *
     * Sem isto, um `setTimeout` pendente dispararia depois de o efeito ser desmontado e navegaria
     * num roteador que já não é o desta montagem — o tipo de coisa que aparece como uma tela de
     * alarme fantasma depois de um *fast refresh*, e some ao investigar.
     */
    const esperasDaActivity = new Set<ReturnType<typeof setTimeout>>();

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

    /**
     * `navigate`, e não `push`: **duas telas de alarme nunca se empilham.**
     *
     * `push` empilha sempre, mesmo com a rota já aberta — e foi o que fez cada toque na notificação
     * abrir mais uma tela azul (visto em 10/09, passo 14.5.2). `navigate` reaproveita a rota quando
     * os parâmetros são os mesmos, então o mesmo horário nunca vira duas telas.
     */
    function abrirTelaDeAlarme(scheduledFor: string) {
      router.navigate({ pathname: "/alarme/[instante]", params: { instante: scheduledFor } });
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
         * **Com o app em primeiro plano, a tela sobe na hora.** É o caso simples: a pessoa está
         * olhando para o Mapill, o Android rebaixou a tela cheia para um aviso no topo, e navegar
         * põe a tela do alarme por cima do que ela estava vendo.
         */
        if (AppState.currentState === "active") {
          abrirTelaDeAlarme(scheduledFor);
          return true;
        }

        /**
         * **Fora do primeiro plano, o app espera a Activity nativa — e assume se ela não vier.**
         *
         * ## O defeito que isto corrige
         *
         * Aqui havia um `return false` seco, e ele produzia o padrão que o Gabriel isolou em 12/09:
         * com o celular **bloqueado**, a tela azul aparecia quando o Mapill estava fora dos
         * recentes, e **não** aparecia quando estava nos recentes.
         *
         * O raciocínio dele é o que fecha o caso, e é mais forte que a hipótese que eu perseguia: se
         * a permissão de tela cheia estivesse negada, ela estaria negada **sempre** — o Android não
         * sabe o que está na lista de recentes. A causa só podia ser o app, e era: com o processo
         * vivo, este listener recebe o `DELIVERED` e recusava; com o processo morto, ninguém
         * recusava nada e o `fullScreenAction` subia sozinho. O app estava competindo com a própria
         * Activity e ganhando a corrida para não fazer nada.
         *
         * ## Por que esperar, em vez de simplesmente abrir
         *
         * Porque a guarda antiga protegia um caso real, e ele continua valendo: com o aparelho
         * **desbloqueado** e a pessoa em outro app, navegar monta a tela **atrás** do que está na
         * frente — invisível, com o `expo-audio` dela virando uma segunda fonte de som sem rosto
         * (defeito de 10/09). Abrir sempre traria isso de volta.
         *
         * O que separa os dois casos não é o `AppState`, que diz `background` nos dois. É **quem
         * assume o alarme**: com a tela bloqueada o Android monta a Activity do full-screen intent;
         * com a pessoa usando outro app, ele rebaixa para heads-up e não monta nada.
         *
         * Então a pergunta certa não é "onde o app está?", e sim "a Activity veio?". Esperar um
         * instante e olhar `jaEstaEmCena` responde exatamente isso, sem precisar de API de keyguard
         * (que esta biblioteca não expõe) nem de código nativo novo.
         *
         * `RESPIRO_DA_ACTIVITY_EM_MS` é a folga para ela montar e se registrar. Curto de propósito:
         * é tempo de alarme tocando, e o `AlarmeRaiz` registra a si mesmo assim que monta.
         *
         * ## O que acontece em cada caso
         *
         * - **Bloqueado, Activity subiu:** `jaEstaEmCena` responde `true` e o app não faz nada — a
         *   tela que a pessoa vê é a nativa, com uma fonte de som só.
         * - **Bloqueado, Activity não subiu** (o caso do Gabriel): ninguém está em cena, e o app
         *   abre a rota. A tela azul aparece, que é o que o alarme promete.
         * - **Desbloqueado, em outro app:** a Activity não sobe, mas a notificação com `loopSound`
         *   está na bandeja se lendo e tocando — e é ela que o `AlarmeScreen` dispensaria se a tela
         *   montasse escondida. Ver a guarda de visibilidade abaixo.
         *
         * Devolve `false` de imediato porque a decisão virou assíncrona: quem chama usa o retorno só
         * para marcar `jaAbertos`, e marcar antes da hora é o defeito que travava o horário para
         * sempre. Quem marca agora é o próprio caminho tardio, ao abrir de verdade.
         */
        const espera = setTimeout(() => {
          esperasDaActivity.delete(espera);
          if (jaEstaEmCena(scheduledFor)) return;
          /**
           * **Só se a pessoa não estiver usando outro app.**
           *
           * Este é o resto da guarda de 10/09, e ele fica. `active` aqui significaria que o app
           * voltou ao primeiro plano no meio da espera — e aí o caminho de cima já teria agido.
           * O que interessa é o contrário: seguir em `background` **sem** Activity em cena é o
           * aparelho bloqueado, porque um app em uso à frente teria mantido o Mapill em background
           * com a tela cheia rebaixada e a notificação na bandeja como único aviso.
           *
           * A distinção não é perfeita — ela erra para o lado de abrir a tela, e esse é o lado
           * certo de errar num despertador de remédio: uma tela a mais se fecha com um toque, um
           * alarme que não aparece se perde inteiro.
           */
          abrirTelaDeAlarme(scheduledFor);
          marcarAlarmeComoAberto(scheduledFor);
        }, RESPIRO_DA_ACTIVITY_EM_MS);
        esperasDaActivity.add(espera);

        return false;
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
      for (const espera of esperasDaActivity) clearTimeout(espera);
      esperasDaActivity.clear();
    };
  }, [router]);
}
