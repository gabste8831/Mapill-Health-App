import { Text, View } from "react-native";

import type { ReminderMode } from "@/domain/entities/prescription";
import { Accordion, BottomSheet, Button, OptionGroup, type OptionGroupOption } from "@/ui";
import { styles } from "./CadastroDeMedicamento.styles";

const MODE_OPTIONS: OptionGroupOption<ReminderMode>[] = [
  {
    value: "alarm",
    label: "Alarme",
    hint: "Toca como despertador, mesmo com o telefone no silencioso. Para dose que não pode passar.",
  },
  {
    value: "notification",
    label: "Notificação",
    hint: "Aparece na barra, discreta, e respeita o silencioso do aparelho.",
  },
  {
    value: "both",
    label: "Os dois",
    hint: "O alarme te interrompe na hora; a notificação fica na barra depois, caso você desligue e esqueça.",
  },
  {
    value: "none",
    label: "Nenhum aviso",
    hint: "A dose continua na sua lista do dia, mas o Mapill não te procura.",
  },
];

type ConfiguracaoDeLembreteProps = {
  visible: boolean;
  /** `null` = nada escolhido ainda. Modo pré-marcado seria o app decidindo se vai te acordar. */
  value: ReminderMode | null;
  onChange: (mode: ReminderMode) => void;
  onClose: () => void;
};

/**
 * Escolha do lembrete em popup, e não no corpo do formulário. É a única decisão do cadastro que
 * depende de permissão do sistema e que muda como o aparelho se comporta fora do app — dar a ela
 * uma tela própria é o que permite explicar cada modo antes de escolher, em vez de oferecer três
 * palavras num select.
 */
export function ConfiguracaoDeLembrete({
  visible,
  value,
  onChange,
  onClose,
}: ConfiguracaoDeLembreteProps) {
  const dependeDePermissao = value !== null && value !== "none";

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Como quer ser lembrado?">
      <View style={styles.sheetBody}>
        <OptionGroup layout="coluna" value={value} options={MODE_OPTIONS} onChange={onChange} />

        {/* A permissão é do sistema, não do app: dizer isso antes evita que a pessoa culpe o
            Mapill por um aviso que nunca chegou porque o Android recusou. */}
        {dependeDePermissao ? (
          <View style={styles.avisoDePermissao}>
            <Text style={styles.avisoDePermissaoTitulo}>Precisa da sua permissão</Text>
            <Text style={styles.avisoDePermissaoTexto}>
              Ao salvar, o aparelho vai pedir autorização para enviar avisos. Se você recusar — ou
              se depois desativar nas configurações do celular — nenhum lembrete chega, e o Mapill
              não tem como contornar isso. A dose continua registrada aqui dentro, só não te
              procura.
            </Text>
          </View>
        ) : null}

        <Accordion title="Como funcionam os lembretes" toggleLabel>
          <View style={styles.sheetBody}>
            <Text style={styles.sectionHint}>
              Na hora marcada, o Mapill mostra a dose com os botões de confirmar, adiar 5 minutos
              ou pular. Enquanto você não responde, ela continua pendente na sua lista do dia —
              nenhuma dose some sozinha.
            </Text>
            <Text style={styles.sectionHint}>
              O alarme insiste com som mesmo no silencioso; a notificação respeita o modo do
              aparelho. Nos dois casos, adiar reagenda uma única vez, para o app não virar
              despertador infinito.
            </Text>
          </View>
        </Accordion>

        <Button label="Pronto" onPress={onClose} />
      </View>
    </BottomSheet>
  );
}
