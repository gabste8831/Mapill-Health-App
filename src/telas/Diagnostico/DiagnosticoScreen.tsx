import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import {
  diagnosticarAvisos,
  type AvisoAgendado,
  type DiagnosticoDeAvisos,
} from "@/notifications/diagnostico-de-avisos";
import { NotifeeGateway } from "@/notifications/notifee-gateway";
import { reagendarTodosOsAvisos } from "@/notifications/reagendar-avisos";
import { useEstilos } from "@/shared/theme";
import { Button, CenteredLoader, Header } from "@/ui";
import { criarEstilos } from "./DiagnosticoScreen.styles";

export type DiagnosticoScreenProps = {
  onBack: () => void;
};

/** Daqui a quantos segundos o aviso de teste dispara. Tempo de bloquear o aparelho e esperar. */
const SEGUNDOS_DO_TESTE = 30;

function Linha({
  rotulo,
  valor,
  estado,
}: {
  rotulo: string;
  valor: string;
  /** `ok` e `ruim` pintam o valor — é o que se lê de relance ao varrer a tela. */
  estado?: "ok" | "ruim";
}) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.linha}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text
        style={[
          styles.valor,
          estado === "ok" && styles.valorOk,
          estado === "ruim" && styles.valorRuim,
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

function ItemAgendado({
  aviso,
  primeiro,
}: {
  aviso: AvisoAgendado;
  primeiro: boolean;
}) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={[styles.agendado, !primeiro && styles.agendadoComDivisoria]}>
      <Text style={styles.agendadoQuando}>
        {aviso.quando ?? "(sem horário)"}
      </Text>
      {aviso.titulo !== null ? (
        <Text style={styles.agendadoTitulo} numberOfLines={1}>
          {aviso.titulo}
        </Text>
      ) : null}
      <Text style={styles.agendadoId} numberOfLines={1}>
        {aviso.id}
      </Text>
      {aviso.ehAlarme ? (
        <View style={styles.selo}>
          <Text style={styles.seloTexto}>Alarme em tela cheia</Text>
        </View>
      ) : null}
    </View>
  );
}

/**
 * O estado real do subsistema de avisos, e os disparos de teste.
 *
 * ## Por que uma tela, e não logs
 *
 * O alarme é a função central do app e a mais cara de testar: exige esperar o horário, bloquear o
 * aparelho, às vezes reiniciar. Quando não tocava, sobravam meia dúzia de explicações possíveis
 * (não foi agendado, foi para o horário errado, o canal está mudo, falta permissão, o Android matou
 * o processo) e nenhuma forma de distinguir entre elas sem cabo e Metro ligados.
 *
 * Aqui a resposta vem antes da espera: o que está agendado **neste instante**, para quando, em que
 * canal, com quais permissões — e quantos avisos *deveriam* existir. Um alarme que não aparece na
 * lista nunca ia tocar, e isso se descobre em cinco segundos.
 *
 * Os botões disparam pelo **mesmo caminho da produção** (`NotifeeGateway.agendar`). Um atalho que
 * chamasse a biblioteca direto testaria a biblioteca, não o app.
 */
export function DiagnosticoScreen({ onBack }: DiagnosticoScreenProps) {
  const styles = useEstilos(criarEstilos);
  const [dados, setDados] = useState<DiagnosticoDeAvisos | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    setDados(await diagnosticarAvisos());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar]),
  );

  /**
   * Agenda um aviso daqui a 30 s, pelo caminho de produção.
   *
   * `texto` reproduz o que o planejador de verdade escreveria. Não é enfeite: metade do que este
   * teste responde é se a frase **cabe** e se lê bem na barra de avisos — um corpo que o Android
   * trunca no meio da palavra só aparece no aparelho, e um "Teste de notificação" genérico nunca
   * mostraria isso.
   *
   * Os avisos de estoque, receita e compromisso caem às 00:01 do dia, então esperá-los custa uma
   * madrugada. Aqui eles chegam em trinta segundos, no mesmo canal e com o mesmo formato.
   */
  async function dispararTeste(
    modo: "alarm" | "notification",
    texto?: { rotulo: string; titulo: string; corpo: string },
  ) {
    if (ocupado) return;
    setOcupado(true);
    try {
      const quando = new Date(Date.now() + SEGUNDOS_DO_TESTE * 1000);
      await new NotifeeGateway().agendar({
        // Chave própria, com prefixo de teste: o `reagendarTodosOsAvisos` reconstrói a janela a
        // partir do banco e cancela o que não reconhece — sem um prefixo distinto, o aviso de teste
        // sumiria na primeira volta ao app, que é justamente quando se vai testá-lo.
        chave: `teste-${modo}-${quando.getTime()}`,
        quando,
        modo,
        titulo:
          texto?.titulo ??
          (modo === "alarm" ? "Teste de alarme" : "Teste de notificação"),
        corpo:
          texto?.corpo ??
          `Disparado às ${quando.toLocaleTimeString("pt-BR")}. Se você está lendo isto, o agendamento funcionou.`,
        // Vazio: não é aviso de dose, então o toque abre o app em vez da tela de horário — que
        // procuraria doses inexistentes e abriria vazia.
        doseScheduleIds: [],
        semAcoesRapidas: true,
      });
      await carregar();
      Alert.alert(
        `${texto?.rotulo ?? (modo === "alarm" ? "Alarme" : "Notificação")} agendado`,
        `Dispara em ${SEGUNDOS_DO_TESTE} segundos.\n\nBloqueie o aparelho agora, ou abra outro aplicativo, para testar a condição que interessa.`,
      );
    } catch (cause) {
      Alert.alert(
        "Não foi possível agendar",
        cause instanceof Error ? cause.message : "Erro desconhecido.",
      );
    } finally {
      setOcupado(false);
    }
  }

  /**
   * Os quatro avisos que caem às 00:01 e por isso não se testam sem esperar a virada do dia.
   *
   * Os textos são os mesmos dos planejadores (`planejar-avisos-de-estoque` e
   * `planejar-avisos-de-compromisso`), com um remédio de exemplo no lugar do nome real. Se a
   * redação mudar lá e não aqui, este teste deixa de medir o que a pessoa vai receber — vale mais
   * corrigir os dois do que deixar o de teste "genérico o bastante para nunca desatualizar".
   */
  const AVISOS_DE_PLANEJAMENTO = [
    {
      rotulo: "Estoque acabando",
      titulo: "Losartana está acabando",
      corpo:
        "Seu estoque de Losartana dura cerca de 7 dias. Vale repor antes que acabe.",
    },
    {
      rotulo: "Estoque acabou",
      titulo: "Losartana acaba hoje",
      corpo:
        "Hoje é a última dose de Losartana que você tem. Depois disso, o estoque acaba.",
    },
    {
      rotulo: "Receita vencendo",
      titulo: "Receita de Losartana vencendo",
      corpo:
        "Sua receita de Losartana vence em 20 de setembro. Vale marcar a consulta de renovação.",
    },
    {
      rotulo: "Receita vence hoje",
      titulo: "Receita de Losartana vence hoje",
      corpo:
        "Hoje é o último dia de validade da sua receita de Losartana. A partir de amanhã ela não vale mais.",
    },
  ];

  async function refazerJanela() {
    if (ocupado) return;
    setOcupado(true);
    try {
      await reagendarTodosOsAvisos();
      await carregar();
    } finally {
      setOcupado(false);
    }
  }

  if (dados === null) return <CenteredLoader />;

  const totalEsperado =
    dados.esperados.doses +
    dados.esperados.compromissos +
    dados.esperados.receitas +
    dados.esperados.estoques;
  const alarmes = dados.agendados.filter((aviso) => aviso.ehAlarme).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Diagnóstico de avisos" onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.aviso}>
          <Text style={styles.avisoTexto}>
            Ferramenta de teste. Mostra o que o sistema tem agendado agora e
            permite disparar um aviso em {SEGUNDOS_DO_TESTE} segundos, pelo
            mesmo caminho que o app usa de verdade.
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Permissões</Text>
          <View style={styles.cartao}>
            <Linha
              rotulo="Notificações"
              valor={
                dados.permissaoDeNotificar === "concedida"
                  ? "Concedida"
                  : dados.permissaoDeNotificar === "negada"
                    ? "Negada"
                    : "Não pedida"
              }
              estado={
                dados.permissaoDeNotificar === "concedida" ? "ok" : "ruim"
              }
            />
            {/* Sem alarme exato o horário escorrega: o Android agrupa o disparo com outros para
                poupar bateria, e um lembrete de remédio que chega "por volta de" não serve. */}
            <Linha
              rotulo="Alarme exato"
              valor={dados.alarmeExato ? "Permitido" : "Bloqueado"}
              estado={dados.alarmeExato ? "ok" : "ruim"}
            />
            {/* A permissão que faz a tela azul irromper sozinha. Bloqueada, o Android rebaixa todo
                full-screen intent para um aviso no topo — o alarme toca e a tela não sobe, que é o
                sintoma investigado em 12/09. Ver a nota em `diagnostico-de-avisos`. */}
            <Linha
              rotulo="Tela cheia"
              valor={dados.telaCheia ? "Permitida" : "Bloqueada"}
              estado={dados.telaCheia ? "ok" : "ruim"}
            />
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Canais</Text>
          <View style={styles.cartao}>
            {dados.canais.length === 0 ? (
              <Text style={styles.vazio}>Nenhum canal criado ainda.</Text>
            ) : (
              dados.canais.map((canal) => (
                <View key={canal.id} style={styles.agendado}>
                  <Text style={styles.agendadoQuando}>{canal.nome}</Text>
                  {/* Canal sem som é o defeito que passou semanas despercebido: o app agendava, o
                      Android entregava, e nada tocava.

                      **Mudo é quando as duas leituras estão vazias.** `sound` é o nome que pedimos
                      na criação; `soundURI` é o que o Android resolveu e vai tocar. Pedindo
                      `"default"`, alguns aparelhos devolvem `sound` vazio e a URI preenchida — o
                      canal toca, e olhar só a primeira dizia "MUDO" num canal saudável. Julgar pelo
                      campo errado aqui manda consertar o que não está quebrado. */}
                  <Linha
                    rotulo="Som"
                    valor={canal.som ?? canal.somUri ?? "MUDO"}
                    estado={
                      canal.som === null && canal.somUri === null
                        ? "ruim"
                        : "ok"
                    }
                  />
                  {/* A URI aparece à parte quando as duas existem: é ela que prova qual arquivo o
                      sistema vai tocar, e num canal de alarme isso é a diferença entre o som
                      próprio e o padrão de notificação. */}
                  {canal.som !== null && canal.somUri !== null ? (
                    <Linha
                      rotulo="Som resolvido"
                      valor={canal.somUri}
                      estado="ok"
                    />
                  ) : null}
                  {/* Abaixo de 4 o Android não mostra heads-up nem toca. */}
                  <Linha
                    rotulo="Importância"
                    valor={String(canal.importancia)}
                    estado={canal.importancia >= 4 ? "ok" : "ruim"}
                  />
                  {canal.bloqueado ? (
                    <Linha
                      rotulo="Estado"
                      valor="BLOQUEADO PELO USUÁRIO"
                      estado="ruim"
                    />
                  ) : null}
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Agendados agora</Text>
          <View style={styles.cartao}>
            {/* A comparação é o que diagnostica: esperados sem agendados é falha ao agendar;
                agendados sem tocar é falha na entrega. São causas diferentes. */}
            <Linha
              rotulo="No sistema"
              valor={`${dados.agendados.length} (${alarmes} em tela cheia)`}
              estado={
                dados.agendados.length > 0 || totalEsperado === 0
                  ? "ok"
                  : "ruim"
              }
            />
            <Linha
              rotulo="Esperados pelo banco"
              valor={String(totalEsperado)}
            />
            {/* Os quatro tipos separados, e não só o total.

                Quando o agendado não bate com o esperado, saber **qual** tipo falhou é metade do
                diagnóstico: estoque em zero com receita cheia aponta para a previsão ou para a
                trava do aviso; todos em zero apontam para permissão ou para o reagendamento
                inteiro. Um número só obrigaria a descobrir isso por eliminação. */}
            <Linha rotulo="· doses" valor={String(dados.esperados.doses)} />
            <Linha
              rotulo="· compromissos"
              valor={String(dados.esperados.compromissos)}
            />
            <Linha
              rotulo="· receitas"
              valor={String(dados.esperados.receitas)}
            />
            <Linha
              rotulo="· estoques"
              valor={String(dados.esperados.estoques)}
            />
          </View>

          <View style={styles.cartao}>
            {dados.agendados.length === 0 ? (
              <Text style={styles.vazio}>Nada agendado.</Text>
            ) : (
              dados.agendados.map((aviso, indice) => (
                <ItemAgendado
                  key={aviso.id}
                  aviso={aviso}
                  primeiro={indice === 0}
                />
              ))
            )}
          </View>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Disparar teste</Text>
          <View style={styles.acoes}>
            <Button
              label={`Alarme em ${SEGUNDOS_DO_TESTE}s (tela cheia)`}
              onPress={() => void dispararTeste("alarm")}
              disabled={ocupado}
            />
            <Button
              label={`Notificação em ${SEGUNDOS_DO_TESTE}s`}
              variant="outline"
              onPress={() => void dispararTeste("notification")}
              disabled={ocupado}
            />

            {/* Um botão por aviso de planejamento.

                Os quatro caem às 00:01 do dia, então testá-los de verdade custa uma madrugada por
                tentativa — e é justamente o tipo de espera que fez o diagnóstico existir. Aqui
                chegam em trinta segundos, no mesmo canal e com o texto que a pessoa receberia.

                Vale conferir três coisas em cada um: se chega com **som**, se a frase cabe sem
                truncar, e se o que aparece na tela bloqueada é o esperado — o canal de lembrete é
                `PRIVATE`, então o conteúdo fica oculto se o aparelho estiver configurado para
                esconder informação sensível. */}
            <Text style={styles.secaoNota}>
              Os avisos abaixo normalmente chegam às 00:01 do dia. Aqui eles
              usam o mesmo canal e o mesmo texto, só que em {SEGUNDOS_DO_TESTE}{" "}
              segundos.
            </Text>
            {AVISOS_DE_PLANEJAMENTO.map((aviso) => (
              <Button
                key={aviso.rotulo}
                label={`${aviso.rotulo} em ${SEGUNDOS_DO_TESTE}s`}
                variant="outline"
                onPress={() => void dispararTeste("notification", aviso)}
                disabled={ocupado}
              />
            ))}
            <Button
              label="Refazer a janela de avisos"
              variant="outline"
              onPress={() => void refazerJanela()}
              disabled={ocupado}
            />
            <Button
              label="Atualizar"
              variant="text"
              onPress={() => void carregar()}
            />
          </View>
        </View>

        <Text style={styles.avisoTexto}>
          Lido em {dados.geradoEm.toLocaleTimeString("pt-BR")}.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
