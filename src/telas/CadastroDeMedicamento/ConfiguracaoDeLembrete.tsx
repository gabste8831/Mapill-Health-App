import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { ReminderMode } from "@/domain/entities/prescription";
import { useNotificationPermission } from "@/hooks/use-notification-permission";
import { usePermissoesDeAlarme } from "@/hooks/use-permissoes-de-alarme";
import { colors } from "@/shared/theme";
import {
  Accordion,
  BottomSheet,
  Button,
  OptionGroup,
  PainelDePermissoes,
  type OptionGroupOption,
} from "@/ui";
import { styles } from "./CadastroDeMedicamento.styles";

/** Um sino que toca, um que avisa, um que faz os dois e um cortado. A família se lê de relance. */
const MODE_ICONS: Record<ReminderMode, keyof typeof MaterialCommunityIcons.glyphMap> = {
  alarm: "alarm",
  notification: "bell",
  both: "bell-ring",
  none: "bell-off",
};

function iconeDoModo(mode: ReminderMode, isSelected: boolean) {
  return (
    <MaterialCommunityIcons
      name={MODE_ICONS[mode]}
      size={22}
      color={isSelected ? colors.onPrimary : colors.primary}
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
function opcoesDeModo(value: ReminderMode | null): OptionGroupOption<ReminderMode>[] {
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
      icon: iconeDoModo("alarm", value === "alarm"),
    },
    {
      value: "notification",
      label: "Notificação",
      hint: "Aparece na barra e respeita o silencioso.",
      icon: iconeDoModo("notification", value === "notification"),
    },
    {
      value: "both",
      label: "Os dois",
      hint: "O alarme na hora, a notificação depois.",
      icon: iconeDoModo("both", value === "both"),
    },
  ];
}

type ConfiguracaoDeLembreteProps = {
  visible: boolean;
  /** `null` = nada escolhido ainda. Modo pré-marcado seria o app decidindo se vai te acordar. */
  value: ReminderMode | null;
  onChange: (mode: ReminderMode) => void;
  onClose: () => void;
  /** Abre os Termos de Uso. Quem navega é a tela — este popup não conhece rota. */
  onAbrirTermos: () => void;
  /**
   * Se a ajuda está aberta. Vive na tela, e não aqui, porque este componente desmonta quando se
   * navega para os termos — e é justamente daí que a pessoa precisa voltar para o mesmo lugar.
   */
  ajudaAberta: boolean;
  onAjudaToggle: (aberta: boolean) => void;
};

/**
 * Escolha do alerta em popup, e não no corpo do formulário. É a única decisão do cadastro que
 * depende de permissão do sistema e que muda como o aparelho se comporta fora do app — dar a ela
 * uma tela própria é o que permite explicar cada modo antes de escolher, em vez de oferecer três
 * palavras num select.
 *
 * É também onde a pessoa é **apresentada** ao assunto: o que o app faz na hora da dose, o que ele
 * precisa do aparelho e o que ele não faz. Apresentação, não manual; a versão completa continua
 * nos termos de uso, e o texto daqui usa as mesmas palavras da seção 3 de lá, porque duas versões
 * da mesma promessa é como uma delas vira mentira.
 */
export function ConfiguracaoDeLembrete({
  visible,
  value,
  onChange,
  onClose,
  onAbrirTermos,
  ajudaAberta,
  onAjudaToggle,
}: ConfiguracaoDeLembreteProps) {
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

  const permissaoNegada = dependeDoAparelho && permissao === "negada";

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
          options={opcoesDeModo(value)}
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
          * O painel lista as quatro, diz o que cada uma muda e leva à tela certa de cada uma.
          */}
        {dependeDoAparelho && permissoes.temPendencia ? (
          <PainelDePermissoes
            itens={permissoes.itens}
            vaiTocar={permissoes.vaiTocar}
            onPedirTudo={permissao === "naoPedida" ? () => void permissoes.pedir() : undefined}
          />
        ) : null}

        {/* Condição, não ressalva. Dizer o que precisa estar em ordem dá o que fazer; dizer que
            "não garantimos" só transfere a insegurança sem dar saída.

            Some quando a permissão está negada: ali o bloco acima já diz o que fazer, e os dois
            juntos dariam dois conselhos diferentes para o mesmo problema. */}
        {dependeDoAparelho && !permissaoNegada ? (
          <View style={styles.avisoDePermissao}>
            <Text style={styles.avisoDePermissaoTitulo}>Depende do seu aparelho</Text>
            <Text style={styles.avisoDePermissaoTexto}>
              Com a permissão de avisos ativa, volume ligado e o Mapill fora da economia de
              bateria, os alertas chegam na hora marcada.
            </Text>
          </View>
        ) : null}

        <Accordion
          title="Como funcionam os alertas"
          toggleLabel
          defaultExpanded={ajudaAberta}
          onToggle={onAjudaToggle}>
          <View style={styles.blocoDeAjuda}>
            <View style={styles.assuntoDeAjuda}>
              <Text style={styles.assuntoDeAjudaTitulo}>Na hora da dose</Text>
              <Text style={styles.assuntoDeAjudaTexto}>
                O alerta mostra o horário, o remédio, a quantidade daquele horário e a orientação
                de como tomar, se você tiver anotado alguma.
              </Text>
            </View>

            <View style={styles.assuntoDeAjuda}>
              <Text style={styles.assuntoDeAjudaTitulo}>Confirmar, adiar ou ignorar</Text>
              <Text style={styles.assuntoDeAjudaTexto}>
                Você responde dali mesmo, sem abrir o app, e a resposta define o status da dose.
                Confirmou: o estoque desconta, se você estiver controlando. Ignorou: fica
                registrado que a dose não foi tomada. Os dois entram no seu histórico.
              </Text>
            </View>

            <View style={styles.assuntoDeAjuda}>
              <Text style={styles.assuntoDeAjudaTitulo}>Se você adiar</Text>
              <Text style={styles.assuntoDeAjudaTexto}>
                O alerta volta em 5 minutos, uma vez só, para o app não virar despertador
                infinito. Se você não responder nessa segunda vez, a dose fica registrada como não
                tomada e continua na sua lista do dia até você dizer o contrário.
              </Text>
            </View>

            <View style={styles.assuntoDeAjuda}>
              <Text style={styles.assuntoDeAjudaTitulo}>O que o Mapill não faz</Text>
              <Text style={styles.assuntoDeAjudaTexto}>
                • Não confirma dose sozinho. Quem responde é você, sempre.
              </Text>
              <Text style={styles.assuntoDeAjudaTexto}>
                • Não decide sua posologia nem substitui quem receitou. Ele auxilia o tratamento,
                não conduz.
              </Text>
              <Text style={styles.assuntoDeAjudaTexto}>
                • Não controla as regras do seu celular. Com permissão, volume e bateria em ordem,
                o Mapill trabalha para manter os alertas íntegros; fora disso, o sistema decide.
              </Text>
            </View>

            {/* Link, e não instrução de navegação: o texto anterior mandava procurar numa "aba
                Perfil" que nem existe com esse nome, e quem está no meio de um cadastro não vai
                sair caçando. Abre os termos e volta pra cá com o cadastro intacto. */}
            <Pressable onPress={onAbrirTermos} accessibilityRole="link">
              <Text style={styles.linkParaTermos}>Ler os Termos de Uso completos</Text>
            </Pressable>
          </View>
        </Accordion>

        <Button label="Pronto" onPress={onClose} />
      </View>
    </BottomSheet>
  );
}
