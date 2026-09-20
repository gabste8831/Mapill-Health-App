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
 * Folga para o Android montar o `fullScreenAction` e o `AlarmeRaiz` se registrar. Nao precisa ser
 * exato: errar para menos abre a rota e a Activity chega por cima, que vence; errar para mais so
 * atrasa a tela.
 */
const RESPIRO_DA_ACTIVITY_EM_MS = 600;

/**
 * Liga os avisos de dose ao ciclo de vida do app.
 *
 * Reabastece a janela a cada volta ao primeiro plano, que e o que mantem os sete dias cheios sem
 * background task e cobre reboot, mudanca de fuso e horario de verao; trata a resposta com o app
 * aberto; e trata a que abriu o app.
 *
 * Aqui mora so a parte de React. Quem fala com o sistema e `src/notifications/`.
 */
export function useDoseNotifications(): void {
  const router = useRouter();

  useEffect(() => {
    // Sem isto um `setTimeout` pendente dispararia depois de o efeito desmontar, navegando num
    // roteador que ja nao e o desta montagem.
    const esperasDaActivity = new Set<ReturnType<typeof setTimeout>>();

    function abrirHorario(dados: DadosDoAviso) {
      abrirHorarioDe(dados.scheduledFor);
    }

    /**
     * A tela onde a dose se responde, pelo instante. Separada de `abrirHorario` porque quem dispara
     * o alarme tem so o `scheduledFor`.
     *
     * `navigate` e nao `push`: com dois caminhos pedindo a mesma rota no arranque frio, `push`
     * empilha mesmo com ela ja aberta, e a tela do horario aparecia duplicada.
     */
    function abrirHorarioDe(scheduledFor: string) {
      router.navigate({
        pathname: "/horario/[instante]",
        params: { instante: scheduledFor },
      });
    }

    /**
     * O toque num aviso que nao e de dose leva onde se resolve aquilo.
     *
     * Funcao unica para os dois caminhos, app aberto e fechado: a regra de para onde ir nao pode
     * divergir conforme o estado do app, e duas copias e como isso aconteceria.
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
      // A chave carrega o `prescriptionId` e a rota espera o `medicationId`: a traducao exige o
      // banco. Falhando, cai na listagem, que e pior que a tela exata e melhor que nada.
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
    // `aoDispararAlarme` existe porque o Android rebaixa a tela cheia para heads-up quando a pessoa
    // esta usando o celular, e nao ha como pedir o contrario pela API. O app rodando pode navegar.
    const pararDeEscutar = escutarAvisos({
      aoAbrirHorario: abrirHorario,
      aoDispararAlarme: (scheduledFor) => {
        // Com o app aberto na frente, o alarme leva a tela do horario: a tela cheia existe para
        // irromper sobre o bloqueio, e quem ja esta olhando nao precisa ser interrompido por ela.
        if (AppState.currentState === "active") {
          abrirHorarioDe(scheduledFor);
          return true;
        }

        /**
         * Fora do primeiro plano, espera a Activity nativa e assume se ela nao vier.
         *
         * A pergunta certa nao e "onde o app esta?", e sim "a Activity veio?": recusar de imediato
         * fazia a tela azul aparecer com o app fora dos recentes e nao aparecer com ele nos
         * recentes, porque com o processo vivo este listener competia com a propria Activity. Mas
         * abrir sem esperar tambem erra: com o aparelho desbloqueado e a pessoa em outro app, a
         * tela monta atras do que esta na frente, invisivel e com uma segunda fonte de som.
         *
         * Devolve `false` de imediato porque a decisao virou assincrona. Quem chama usa o retorno
         * so para marcar `jaAbertos`, e marcar antes da hora travaria o horario para sempre - quem
         * marca e o proprio caminho tardio, ao abrir de verdade.
         */
        const espera = setTimeout(() => {
          void (async () => {
          esperasDaActivity.delete(espera);
          if (jaEstaEmCena(scheduledFor)) return;

          /**
           * Com o celular desbloqueado a tela azul nao sobe: ela existe para irromper sobre o
           * bloqueio, e o aviso na bandeja ja leva a tela do horario.
           *
           * A pergunta e feita ao Android, e nao deduzida do `AppState`. `=== false` e nao `!`
           * porque a resposta tem tres estados, e `null` e "nao consegui perguntar": sem resposta,
           * errar para o lado de mostrar o alarme e o lado certo de errar.
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
