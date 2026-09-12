import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { ReminderMode } from "@/domain/entities/prescription";
import { useNotificationPermission } from "@/hooks/use-notification-permission";
import { usePermissoesDeAlarme } from "@/hooks/use-permissoes-de-alarme";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import {
  BottomSheet,
  Button,
  OptionGroup,
  AvisoDePermissoes,
  PainelDePermissoes,
  type OptionGroupOption,
} from "@/ui";
import { criarEstilos } from "./CadastroDeMedicamento.styles";

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
 * "Nenhum aviso" fica fora de propósito: não abrir este popup já deixa `reminderMode` em `none`.
 */
function opcoesDeModo(
  value: ReminderMode | null,
  cores: ReturnType<typeof useCores>,
): OptionGroupOption<ReminderMode>[] {
  return [
    {
      value: "alarm",
      // Não prometer despertador: o que existe é notificação de prioridade máxima. Tela cheia
      // exigiria USE_FULL_SCREEN_INTENT, restrita no Android 14+ e não exposta pelo expo-notifications.
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
  ];
}

type ConfiguracaoDeLembreteProps = {
  visible: boolean;
  /** `null` = nada escolhido ainda. Modo pré-marcado seria o app decidindo se vai te acordar. */
  value: ReminderMode | null;
  onChange: (mode: ReminderMode) => void;
  onClose: () => void;
  /** Abre a tela "Como funcionam os alertas". Quem navega é a tela, este popup não conhece rota. */
  onAbrirAjuda: () => void;
  /** Desliga o lembrete. É o único caminho de volta na edição, já que "Nenhum aviso" não é opção. */
  onRemover: () => void;
};

/**
 * A folha guarda só a decisão e as permissões que ela exige. A explicação do assunto vive em
 * `AjudaDeAlertasScreen`, com as mesmas palavras da seção 3 dos termos.
 */
export function ConfiguracaoDeLembrete({
  visible,
  value,
  onChange,
  onClose,
  onAbrirAjuda,
  onRemover,
}: ConfiguracaoDeLembreteProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const dependeDoAparelho = value !== null && value !== "none";
  const { permissao, pedir } = useNotificationPermission();
  const permissoes = usePermissoesDeAlarme();

  /**
   * A permissão é pedida no toque que escolhe o modo, não no onboarding: no Android a negativa não
   * se desfaz por diálogo, e uma recusa cedo demais custaria o recurso para sempre.
   */
  function escolherModo(modo: ReminderMode) {
    onChange(modo);
    if (modo !== "none" && permissao === "naoPedida") void pedir();
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Como quer ser avisado?">
      <View style={styles.sheetBody}>
        <Text style={styles.sectionHint}>
          O alerta organiza a rotina. Ele avisa, e quem toma é você.
        </Text>

        <OptionGroup
          layout="grade"
          alto
          ultimaOcupaLinha
          value={value}
          options={opcoesDeModo(value, cores)}
          onChange={escolherModo}
        />

        {/* Negada, o app não insiste: no Android o diálogo não abre de novo, então o painel leva
            às configurações do sistema.

            Só as verificáveis, pelo mesmo motivo da Home: as outras três o app não sabe se foram
            atendidas, e com elas aqui o painel nunca sairia desta folha. */}
        {dependeDoAparelho ? (
          <PainelDePermissoes
            itens={permissoes.itens.filter((item) => item.verificavel)}
            vaiTocar={permissoes.vaiTocar}
            onAbrirDetalhes={onAbrirAjuda}
          />
        ) : null}

        {/**
         * O aviso das três que o app não verifica — **no momento em que a pessoa liga o lembrete**.
         *
         * É aqui que ela acredita que vai ser avisada, e é aqui que a informação muda uma decisão.
         * Foi o pedido do Gabriel em 12/09: o aviso precisa estar onde se configura algo que
         * depende dele, e não só na Home dias depois.
         *
         * Só quando o modo escolhido depende do aparelho: para quem escolheu "nenhum aviso" as
         * autorizações não mudam nada, e cobrar ali é o alerta que ensina a ignorar alertas.
         */}
        {dependeDoAparelho ? (
          <AvisoDePermissoes oQueNaoFunciona="este lembrete" onAbrir={onAbrirAjuda} />
        ) : null}

        {/* `emFolha` porque o `outline` usa a mesma superfície do `BottomSheet`: sem ele o botão
            fica branco sobre branco. */}
        <Button
          label="Como funcionam os alertas"
          variant="outline"
          emFolha
          onPress={onAbrirAjuda}
        />

        <Button label="Pronto" onPress={onClose} />

        {value !== null && value !== "none" ? (
          <Pressable
            style={estadoDePressao(styles.alvoDeLink)}
            onPress={onRemover}
            accessibilityRole="button"
            accessibilityLabel="Não quero ser avisado das doses deste remédio">
            <Text style={styles.textoDeSaida}>Não quero ser avisado deste remédio</Text>
          </Pressable>
        ) : null}
      </View>
    </BottomSheet>
  );
}
