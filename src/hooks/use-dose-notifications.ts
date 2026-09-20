import { useRouter } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";

import { PrescriptionRepository } from "@/data/repositories/prescription-repository";
import { estaBloqueado } from "@/modules/desbloqueio";
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
 * `alarme-em-cena`. Curto de propósito - é tempo de alarme tocando, e meio segundo de atraso na
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
 * Faz três coisas, e as três são do mesmo assunto - por isso moram juntas:
 *
 * 1. **Reabastece a janela** a cada volta ao primeiro plano. É o que mantém os sete dias sempre
 *    cheios sem depender de background task, num app que a pessoa abre justamente para confirmar
 *    dose. Também cobre os gatilhos que não passam por tela nenhuma: reboot do aparelho, mudança de
 *    fuso e virada do horário de verão - em todos, o reagendamento recalcula tudo a partir do
 *    relógio atual.
 *
 * 2. **Trata a resposta com o app aberto** - o toque no botão ou no corpo da notificação.
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
     * num roteador que já não é o desta montagem - o tipo de coisa que aparece como uma tela de
     * alarme fantasma depois de um *fast refresh*, e some ao investigar.
     */
    const esperasDaActivity = new Set<ReturnType<typeof setTimeout>>();

    function abrirHorario(dados: DadosDoAviso) {
      abrirHorarioDe(dados.scheduledFor);
    }

    /**
     * A tela onde a dose se responde, pelo instante.
     *
     * Separada de `abrirHorario` porque quem dispara o alarme tem só o `scheduledFor` - forjar um
     * `DadosDoAviso` com chave vazia e lista vazia para atravessar a assinatura seria inventar
     * dados que ninguém lê.
     */
    /**
     * `navigate`, e não `push`: **duas telas do mesmo horário nunca se empilham.**
     *
     * Pelo mesmo motivo de `abrirTelaDeAlarme`, e pelo defeito visto em aparelho em 15/09: com o app
     * fora dos recentes, a tela de "Hora do remédio" apareceu **duplicada**, uma sobre a outra. No
     * arranque frio dois caminhos pediam a mesma rota - o bootstrap (corrigido em
     * `consultarRespostaDeAbertura`) e o `PRESS` que a MIUI entrega sozinha na tela de bloqueio - e
     * `push` empilha sempre, mesmo com a rota já aberta.
     *
     * A correção do bootstrap tira a causa conhecida; esta é a segunda camada, para o caminho que
     * ninguém previu. Empilhar tela foi o defeito que mais custou nesta semana, e ele não pode
     * depender de uma trava só.
     */
    function abrirHorarioDe(scheduledFor: string) {
      router.navigate({
        pathname: "/horario/[instante]",
        params: { instante: scheduledFor },
      });
    }

    /**
     * O toque num aviso que não é de dose leva **onde se resolve aquilo**.
     *
     * Antes todos caíam na Home, e a pessoa tinha de reencontrar sozinha o assunto que a
     * notificação acabara de nomear - pior justamente no caso que o aviso existe para cobrir,
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
       * `medicationId` - a tradução exige o banco, então acontece aqui e não no listener.
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
     * `push` empilha sempre, mesmo com a rota já aberta - e foi o que fez cada toque na notificação
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
     * pessoa está usando o celular, e não há como pedir o contrário pela API - mas o app rodando
     * pode navegar, e o resultado é o mesmo: a tela do alarme por cima do que estava aberto.
     */
    const pararDeEscutar = escutarAvisos({
      aoAbrirHorario: abrirHorario,
      /**
       * A segunda camada contra empilhar tela de alarme: a guarda de `alarme-em-cena` cobre o caso
       * conhecido, e o `navigate` de `abrirTelaDeAlarme` cobre o que escapar dela.
       */
      aoDispararAlarme: (scheduledFor) => {
        /**
         * **Com o Mapill aberto na frente, o alarme leva à tela do horário.**
         *
         * Era a tela azul até 14/09, e o argumento era que ela é a tela do alarme. Mas ela existe
         * para irromper sobre o bloqueio: com o app na mão e a tela destravada, a pessoa já está
         * olhando - e cair numa tela azul de tela cheia sobre o que ela estava fazendo interrompe
         * sem precisar.
         *
         * A tela do horário tem o que responder a dose exige, é a mesma que o toque na notificação
         * abre, e é a que ela reconhece. Um caminho só para "o celular está em uso", vindo do
         * toque ou do disparo.
         */
        if (AppState.currentState === "active") {
          abrirHorarioDe(scheduledFor);
          return true;
        }

        /**
         * **Fora do primeiro plano, o app espera a Activity nativa - e assume se ela não vier.**
         *
         * Um `return false` seco aqui produzia um padrão estranho: com o celular bloqueado, a tela
         * azul aparecia com o app **fora** dos recentes e não aparecia com ele **nos** recentes. Se
         * fosse permissão negada, seria sempre - o Android não sabe o que está nos recentes. A
         * causa era o app competindo com a própria Activity: com o processo vivo este listener
         * recusava; com ele morto, ninguém recusava e o `fullScreenAction` subia sozinho.
         *
         * **Por que esperar, e não simplesmente abrir:** a guarda antiga protegia um caso real, e
         * ele continua valendo - com o aparelho **desbloqueado** e a pessoa em outro app, navegar
         * monta a tela **atrás** do que está na frente, invisível e com uma segunda fonte de som.
         *
         * A pergunta certa não é "onde o app está?", e sim "a Activity veio?". Esperar um instante
         * e olhar `jaEstaEmCena` responde exatamente isso. `RESPIRO_DA_ACTIVITY_EM_MS` é curto de
         * propósito: é tempo de alarme tocando.
         *
         * Devolve `false` de imediato porque a decisão virou assíncrona - quem chama usa o retorno
         * só para marcar `jaAbertos`, e marcar antes da hora travaria o horário para sempre. Quem
         * marca agora é o próprio caminho tardio, ao abrir de verdade.
         */
        const espera = setTimeout(() => {
          void (async () => {
          esperasDaActivity.delete(espera);
          if (jaEstaEmCena(scheduledFor)) return;

          /**
           * **Com o celular desbloqueado, a tela azul não sobe - e isso é a regra, não um resto.**
           *
           * A tela cheia existe para irromper sobre o bloqueio. Quem está com o aparelho na mão já
           * está olhando para ele: interromper o que a pessoa faz com uma tela que toma tudo é
           * agressivo sem ganho, e ela nem foi o que o Android decidiu mostrar - o sistema rebaixou
           * para heads-up justamente porque o celular está em uso.
           *
           * O aviso na bandeja fica, e tocar nele leva à tela do horário (ver `escutar-avisos`),
           * que é onde a dose se responde. Decisão do Gabriel em 14/09, testando em aparelho.
           *
           * A pergunta é feita ao Android, e não deduzida do `AppState`: o módulo de desbloqueio
           * responde se o bloqueio está na frente, que é exatamente o que decide.
           *
           * `=== false` e não `!`: a resposta tem três estados, e `null` é "não consegui perguntar"
           * - build sem o módulo nativo, que é toda build anterior a esta. Aí vale o comportamento
           * antigo, que abre a tela: sem resposta, errar para o lado de mostrar o alarme é o lado
           * certo de errar.
           */
          if ((await estaBloqueado()) === false) return;
          abrirTelaDeAlarme(scheduledFor);
          marcarAlarmeComoAberto(scheduledFor);
          })();
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
