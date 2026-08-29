import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { ReminderMode } from "@/domain/entities/prescription";
import { colors } from "@/shared/theme";
import { Accordion, BottomSheet, Button, OptionGroup, type OptionGroupOption } from "@/ui";
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
      label: "Alarme",
      hint: "Toca como despertador, mesmo no silencioso.",
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
          onChange={onChange}
        />

        {/* Condição, não ressalva. Dizer o que precisa estar em ordem dá o que fazer; dizer que
            "não garantimos" só transfere a insegurança sem dar saída. */}
        {dependeDoAparelho ? (
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
