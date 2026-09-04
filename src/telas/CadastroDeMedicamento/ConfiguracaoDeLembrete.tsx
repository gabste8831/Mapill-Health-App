import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { ReminderMode } from "@/domain/entities/prescription";
import { useNotificationPermission } from "@/hooks/use-notification-permission";
import { usePermissoesDeAlarme } from "@/hooks/use-permissoes-de-alarme";
import { useCores, useEstilos } from "@/shared/theme";
import {
  BottomSheet,
  Button,
  OptionGroup,
  PainelDePermissoes,
  type OptionGroupOption,
} from "@/ui";
import { criarEstilos } from "./CadastroDeMedicamento.styles";

/** Um sino que toca, um que avisa, um que faz os dois e um cortado. A família se lê de relance. */
const MODE_ICONS: Record<ReminderMode, keyof typeof MaterialCommunityIcons.glyphMap> = {
  alarm: "alarm",
  notification: "bell",
  both: "bell-ring",
  none: "bell-off",
};

function iconeDoModo(mode: ReminderMode, isSelected: boolean, cores: ReturnType<typeof useCores>) {
  return (
    <MaterialCommunityIcons
      name={MODE_ICONS[mode]}
      size={22}
      color={isSelected ? cores.onPrimary : cores.primary}
    />
  );
}

/**
 * Uma linha por modo, e nem uma a mais. O que cada um faz cabe numa frase; o resto mora no "como
 * funcionam", que fica logo abaixo e não cobra nada de quem só quer escolher e sair.
 *
 * **"Nenhum aviso" não está aqui de propósito.** Ele obrigava a entrar na configuração para dizer
 * que não se quer configurar nada — e recusar já é o que acontece sozinho ao não abrir este popup:
 * `reminderMode` fica em `none` e o cadastro salva igual. A dose continua na Home e no calendário
 * de qualquer forma, então não há nada que a escolha explícita preservasse.
 */
function opcoesDeModo(
  value: ReminderMode | null,
  cores: ReturnType<typeof useCores>,
): OptionGroupOption<ReminderMode>[] {
  return [
    {
      value: "alarm",
      // "Toca alto", e não "toca como despertador". O que o app entrega é uma notificação de
      // prioridade máxima que atravessa o Não Perturbe e vibra num padrão longo — não um
      // despertador de tela cheia com som contínuo até desligar, que exige `USE_FULL_SCREEN_INTENT`
      // (restrita pelo Android 14+ a apps de alarme e chamada) e nem é exposta pelo
      // `expo-notifications`. Descrever o que existe é obrigação num app de medicação: prometer
      // despertador e entregar um "pling" é promessa de segurança falsa.
      label: "Alarme",
      hint: "Toca alto e vibra, mesmo no silencioso.",
      icon: iconeDoModo("alarm", value === "alarm", cores),
    },
    {
      value: "notification",
      label: "Notificação",
      hint: "Aparece na barra e respeita o silencioso.",
      icon: iconeDoModo("notification", value === "notification", cores),
    },
    {
      value: "both",
      label: "Os dois",
      hint: "O alarme na hora, a notificação depois.",
      icon: iconeDoModo("both", value === "both", cores),
    },
  ];
}

type ConfiguracaoDeLembreteProps = {
  visible: boolean;
  /** `null` = nada escolhido ainda. Modo pré-marcado seria o app decidindo se vai te acordar. */
  value: ReminderMode | null;
  onChange: (mode: ReminderMode) => void;
  onClose: () => void;
  /**
   * Abre a tela "Como funcionam os alertas". Quem navega é a tela — este popup não conhece rota.
   *
   * Substituiu `onAbrirTermos` + `ajudaAberta` + `onAjudaToggle`: com a explicação numa rota
   * própria, não há mais estado de leitura para preservar através de uma navegação.
   */
  onAbrirAjuda: () => void;
};

/**
 * Escolha do alerta em popup, e não no corpo do formulário. É a única decisão do cadastro que
 * depende de permissão do sistema e que muda como o aparelho se comporta fora do app — dar a ela
 * uma tela própria é o que permite explicar cada modo antes de escolher, em vez de oferecer três
 * palavras num select.
 *
 * ## O que mora aqui, e o que não
 *
 * A folha guarda **a decisão** — a pergunta do título, as três respostas, e o que o sistema exige
 * para que a resposta valha (o painel de permissões, que é acionável: cada linha abre o ajuste que
 * falta). Isso é o que não se pode adiar sem tornar a escolha vazia.
 *
 * A apresentação do assunto — o que o alerta mostra, como se responde, o que o app não faz — vive
 * em `AjudaDeAlertasScreen`. Ela estava aqui dentro de um acordeão, somando uma quarta camada a uma
 * folha que já tinha três, e empurrando o botão "Pronto" para fora da tela. Explicação empilhada
 * sobre decisão não informa mais; adia a decisão.
 *
 * O texto de lá continua usando as mesmas palavras da seção 3 dos termos, porque duas versões da
 * mesma promessa é como uma delas vira mentira.
 */
export function ConfiguracaoDeLembrete({
  visible,
  value,
  onChange,
  onClose,
  onAbrirAjuda,
}: ConfiguracaoDeLembreteProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const dependeDoAparelho = value !== null && value !== "none";
  const { permissao, pedir } = useNotificationPermission();
  const permissoes = usePermissoesDeAlarme();

  /**
   * A permissão é pedida **aqui**, no toque que escolhe o modo — e não no onboarding.
   *
   * É a única hora em que o diálogo do sistema chega com contexto: a pessoa acabou de dizer que
   * quer ser avisada. Pedir antes, numa tela de boas-vindas, é pedir sem motivo aparente — e no
   * Android a negativa **não se desfaz** por diálogo, então uma recusa cedo demais custaria o
   * recurso central do app para sempre.
   */
  function escolherModo(modo: ReminderMode) {
    onChange(modo);
    if (modo !== "none" && permissao === "naoPedida") void pedir();
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Como quer ser avisado?">
      <View style={styles.sheetBody}>
        {/* Antes das opções, e não depois: o que o alerta é (e o que não é) muda o que se espera
            dele, e ler isso depois de escolher já é tarde. */}
        <Text style={styles.sectionHint}>
          O alerta organiza a rotina. Ele avisa, e quem toma é você.
        </Text>

        {/* "Os dois" fecha a grade ocupando a linha inteira: ele é a soma dos dois de cima, e ler
            na largura toda logo abaixo deles é o que mostra isso sem precisar dizer. */}
        <OptionGroup
          layout="grade"
          alto
          ultimaOcupaLinha
          value={value}
          options={opcoesDeModo(value, cores)}
          onChange={escolherModo}
        />

        {/* Negada, o app **não insiste**: no Android o diálogo não abre de novo, e um botão que
            promete pedir outra vez não faria nada. O caminho real é as configurações do sistema, e
            é isso que a tela oferece — em vez de deixar a pessoa achando que o lembrete está
            configurado quando ele nunca vai chegar. */}
        {/**
          * O que falta para este lembrete funcionar, num painel só.
          *
          * Antes havia dois blocos escritos à mão aqui — um para a permissão de notificação, outro
          * para o Não Perturbe — e cada um cobria metade do problema. Faltavam o alarme exato do
          * Android 12+ e a economia de bateria, que são justamente as duas causas de "o aviso não
          * chegou" que ninguém consegue diagnosticar sozinho.
          *
          * O painel lista as três, diz o que cada uma muda, leva à tela certa de cada uma e — nas duas em
 * que a tela do sistema não se explica sozinha — diz o que procurar depois de chegar lá.
          */}
        {dependeDoAparelho && permissoes.temPendencia ? (
          <PainelDePermissoes
            itens={permissoes.itens}
            vaiTocar={permissoes.vaiTocar}
            onPedirTudo={permissao === "naoPedida" ? () => void permissoes.pedir() : undefined}
          />
        ) : null}

        {/**
         * A explicação saiu daqui e virou tela (`cadastro/ajuda-de-alertas`).
         *
         * O aviso "Depende do seu aparelho" saiu junto: quando falta alguma autorização, o painel
         * acima já diz o mesmo **e** leva à tela de cada ajuste; quando não falta nada, ele
         * anunciava um risco sem nada a fazer a respeito. O texto continua existindo, na tela de
         * ajuda, onde é condição explicada em vez de ressalva no meio de uma decisão.
         *
         * Link e não acordeão: dobrado aqui dentro, o conteúdo empurrava o botão "Pronto" para
         * fora da tela e obrigava quem só queria escolher um modo a rolar por tudo.
         */}
        {/* Botão de contorno, e não link de texto: ele abre uma tela inteira, que é o que os dois
            botões desta folha fazem — tratá-lo como texto sublinhado o fazia parecer nota de rodapé
            do "Pronto". `outline` para não competir com o primário, que é quem fecha a decisão. */}
        <Button label="Como funcionam os alertas" variant="outline" onPress={onAbrirAjuda} />

        <Button label="Pronto" onPress={onClose} />
      </View>
    </BottomSheet>
  );
}
