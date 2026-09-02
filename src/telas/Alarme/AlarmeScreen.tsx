import { Ionicons } from "@expo/vector-icons";
import { createAudioPlayer } from "expo-audio";
import { useCallback, useEffect, useState } from "react";
import { Text, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDosesDoAlarme } from "@/hooks/use-doses-do-alarme";
import { dispensarAlarmeAtivo } from "@/notifications/alarme-em-tela-cheia";
import { colors } from "@/shared/theme";
import { Button, CenteredLoader } from "@/ui";
import { styles } from "./AlarmeScreen.styles";

const SOM_DO_ALARME = require("../../../assets/sounds/alarme_de_dose.wav");

/**
 * Quanto tempo o alarme toca antes de silenciar sozinho.
 *
 * Ele **não** para de existir aos cinco minutos: a tela continua aberta e a dose continua pendente.
 * O que acaba é o barulho. Um alarme que toca indefinidamente num aparelho esquecido em cima da mesa
 * vira uma tortura para quem está por perto — e a pessoa que precisa dele já não está ali para
 * ouvir.
 */
const SILENCIA_SOZINHO_EM_MS = 5 * 60_000;

type AlarmeScreenProps = {
  /** ISO do horário que disparou. Vem no `data` da notificação do Notifee. */
  instanteIso: string;
  /** Fecha a tela — no full-screen intent é `notifee.stopForegroundService`/finish da Activity. */
  onFechar: () => void;
};

/**
 * A tela do alarme: ocupa o aparelho inteiro, toca até alguém responder, e sai só com uma resposta.
 *
 * ## Por que ela existe separada da tela de horário
 *
 * As duas mostram as mesmas doses e oferecem as mesmas ações, mas nascem de situações opostas. A
 * `HorarioScreen` é consultada — a pessoa foi até lá. Esta **irrompe**: aparece por cima da tela de
 * bloqueio, com o aparelho no bolso, possivelmente no meio da noite.
 *
 * Isso muda tudo o que importa. Aqui não há cabeçalho, não há voltar, não há navegação — sair
 * exige responder. Os alvos são grandes porque a pessoa acabou de acordar. E o silenciar é a
 * primeira ação, separada das outras, porque parar o barulho é o que ela quer fazer **antes** de
 * conseguir pensar em qualquer outra coisa.
 *
 * ## O som mora aqui, e não na notificação
 *
 * Notificação nenhuma toca em loop — o Android toca uma vez e para, em qualquer biblioteca. O que
 * faz este alarme ser um alarme é esta tela tocar o áudio em `loop` enquanto estiver aberta. A
 * notificação de tela cheia só a traz até aqui.
 */
export function AlarmeScreen({ instanteIso, onFechar }: AlarmeScreenProps) {
  const { doses, isLoading, registrar } = useDosesDoAlarme(instanteIso);
  const [silenciado, setSilenciado] = useState(false);

  /**
   * Toca em loop até ser silenciado.
   *
   * O player é criado **dentro do efeito**, com `createAudioPlayer`, e não pelo `useAudioPlayer`.
   * O hook devolve um objeto que o React Compiler trata como imutável, e ligar o loop exige
   * atribuir `player.loop` — o que ele recusa, com razão: mutar valor de hook é justamente o que
   * quebra a memoização dele.
   *
   * Aqui o player é nosso, criado e destruído por este efeito. A limpeza faz as duas coisas: para
   * o som e libera o recurso nativo, inclusive quando a tela sai por um caminho que não passa pelos
   * botões — o sistema matando a Activity, por exemplo. Alarme que continua tocando depois da tela
   * fechada é o tipo de defeito que faz desinstalar o app.
   */
  useEffect(() => {
    if (silenciado) return;

    const player = createAudioPlayer(SOM_DO_ALARME);
    player.loop = true;
    player.play();

    /**
     * Rede de segurança do loop: se o áudio parar mesmo com `loop` ligado, isto o traz de volta.
     *
     * `loop` é o mecanismo principal e funciona. Mas ele é resolvido do lado nativo, e um alarme de
     * medicação não pode depender de uma única garantia: se o sistema pausar o player por qualquer
     * razão — foco de áudio disputado com outro app, por exemplo —, o alarme emudece sem sinal
     * nenhum, e a pessoa continua dormindo.
     *
     * O intervalo é maior que o arquivo (4,1 s), então em operação normal ele nunca faz nada: só
     * observa que o som está tocando e volta a dormir.
     */
    const vigia = setInterval(() => {
      if (!player.playing) player.play();
    }, 6_000);

    return () => {
      clearInterval(vigia);
      player.pause();
      player.release();
    };
  }, [silenciado]);

  /**
   * Vibra em ciclo enquanto o alarme está tocando.
   *
   * Independente do som, e é isso que a torna útil: se o volume estiver baixo, se o áudio falhar,
   * ou se o aparelho estiver no bolso, a vibração é o que ainda avisa. O padrão longo é o mesmo do
   * canal — vibração curta se confunde com mensagem, e a diferença entre "chegou um WhatsApp" e
   * "está na hora do remédio" precisa ser sentida sem olhar a tela.
   */
  useEffect(() => {
    if (silenciado) return;
    Vibration.vibrate([0, 600, 400, 600, 1200], true);
    return () => Vibration.cancel();
  }, [silenciado]);

  /** Silencia sozinho depois de um tempo — ver `SILENCIA_SOZINHO_EM_MS`. */
  useEffect(() => {
    if (silenciado) return;
    const timer = setTimeout(() => setSilenciado(true), SILENCIA_SOZINHO_EM_MS);
    return () => clearTimeout(timer);
  }, [silenciado]);

  const silenciar = useCallback(() => setSilenciado(true), []);

  /**
   * Responder encerra o alarme inteiro: para o som, tira a notificação da bandeja e fecha a tela.
   *
   * A ordem importa. O som para primeiro porque é o que incomoda; a notificação sai em seguida
   * porque, deixada ali, ela reabriria esta tela ao ser tocada; e a tela fecha por último, quando
   * não há mais nada pendente atrás dela.
   */
  const encerrar = useCallback(async () => {
    setSilenciado(true);
    await dispensarAlarmeAtivo();
    onFechar();
  }, [onFechar]);

  const responderTodas = useCallback(
    async (status: "confirmed" | "skipped") => {
      for (const dose of doses) {
        if (dose.resolvida) continue;
        await registrar(dose, status);
      }
      await encerrar();
    },
    [doses, registrar, encerrar],
  );

  if (isLoading) return <CenteredLoader />;

  const pendentes = doses.filter((dose) => !dose.resolvida);
  const umaSo = pendentes.length === 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.conteudo}>
        <View style={styles.cabecalho}>
          <View style={styles.icone}>
            <Ionicons name="alarm" size={40} color={colors.onPrimary} />
          </View>
          <Text style={styles.titulo}>Hora do seu remédio</Text>
          <Text style={styles.hora}>
            {new Date(instanteIso).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Os remédios, em letra grande: é o que a pessoa precisa ler antes de responder, e ela
            pode estar sem óculos, no escuro, recém-acordada. */}
        <View style={styles.lista}>
          {pendentes.map((dose) => (
            <View key={dose.doseScheduleId} style={styles.item}>
              <Text style={styles.nome}>{dose.medicationName}</Text>
              <Text style={styles.quantidade}>{dose.quantidadeFormatada}</Text>
              {dose.intakeNote !== null && dose.intakeNote.length > 0 ? (
                <Text style={styles.orientacao}>{dose.intakeNote}</Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.acoes}>
          {/* Silenciar vem primeiro e sozinho: parar o barulho é o que se quer fazer antes de
              conseguir decidir qualquer outra coisa. E ele **não** registra desfecho nenhum. */}
          {silenciado ? (
            <Text style={styles.silenciadoAviso}>
              Som desligado. A dose continua esperando sua resposta.
            </Text>
          ) : (
            <Button
              label="Silenciar"
              variant="outline"
              onPress={silenciar}
              accessibilityLabel="Desligar o som do alarme"
            />
          )}

          <Button
            label={umaSo ? "Tomei" : "Tomei todas"}
            onPress={() => void responderTodas("confirmed")}
          />
          <Button
            label={umaSo ? "Pulei" : "Pulei todas"}
            variant="outline"
            onPress={() => void responderTodas("skipped")}
          />

          {/* Sair sem responder é legítimo — a pessoa pode querer conferir a caixa antes. A dose
              continua pendente e reaparece na Home, como qualquer atrasada. */}
          <Button label="Responder depois" variant="text" onPress={() => void encerrar()} />
        </View>
      </View>
    </SafeAreaView>
  );
}
