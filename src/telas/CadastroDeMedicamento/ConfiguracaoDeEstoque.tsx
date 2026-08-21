import { Pressable, Text, View } from "react-native";

import {
  BottomSheet,
  Button,
  Checkbox,
  OptionGroup,
  TextField,
  type OptionGroupOption,
} from "@/ui";
import { styles } from "./CadastroDeMedicamento.styles";

const LEAD_DAYS_OPTIONS: OptionGroupOption<string>[] = [
  { value: "3", label: "3 dias" },
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
];

export type EstoqueForm = {
  /** Substantivo da unidade da embalagem, já flexionado ("comprimidos", "ml"). */
  unitNoun: string;
  quantity: string;
  onQuantityChange: (value: string) => void;
  alertEnabled: boolean;
  onAlertEnabledChange: (enabled: boolean) => void;
  /** `null` = ainda não escolhida. Sem antecedência, o alerta não dispara e não é gravado ligado. */
  leadDays: string | null;
  onLeadDaysChange: (days: string) => void;
  storageLocation: string;
  onStorageLocationChange: (value: string) => void;
};

type ConfiguracaoDeEstoqueProps = EstoqueForm & {
  visible: boolean;
  onClose: () => void;
  onDisable: () => void;
};

/**
 * Controle de estoque em popup. No corpo do formulário ele era um checkbox que, ao ser marcado,
 * fazia nascer quatro campos e empurrava a tela inteira para baixo debaixo do dedo de quem
 * acabara de tocar nele. Aqui a decisão de controlar abre um espaço próprio, e a tela por trás
 * não se mexe.
 */
export function ConfiguracaoDeEstoque({
  visible,
  onClose,
  onDisable,
  unitNoun,
  quantity,
  onQuantityChange,
  alertEnabled,
  onAlertEnabledChange,
  leadDays,
  onLeadDaysChange,
  storageLocation,
  onStorageLocationChange,
}: ConfiguracaoDeEstoqueProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Controle de estoque">
      <View style={styles.sheetBody}>
        {/* Contado na unidade da embalagem, não na da dose: é o que está impresso no frasco, e é
            o que faz a conta de "quantos dias ainda dá" fechar. */}
        <TextField
          label={`QUANTOS ${unitNoun.toUpperCase()} VOCÊ TEM`}
          placeholder="Ex: 30"
          value={quantity}
          onChangeText={onQuantityChange}
          keyboardType="decimal-pad"
          maxLength={8}
        />

        <TextField
          label="ONDE VOCÊ GUARDA"
          placeholder="Ex: caixa sobre a geladeira"
          value={storageLocation}
          onChangeText={onStorageLocationChange}
          maxLength={120}
        />

        {/* Alerta é escolha explícita, nunca ligado sozinho (decisão nº1 do projeto). */}
        <Checkbox
          checked={alertEnabled}
          onChange={onAlertEnabledChange}
          label="Me avisar quando estiver acabando"
          accessibilityLabel="Me avisar quando o estoque estiver acabando"
        />

        {alertEnabled ? (
          <OptionGroup
            label="COM QUANTA ANTECEDÊNCIA"
            value={leadDays}
            options={LEAD_DAYS_OPTIONS}
            onChange={onLeadDaysChange}
          />
        ) : null}

        <Button label="Pronto" onPress={onClose} />
        <Pressable onPress={onDisable} accessibilityRole="button">
          <Text style={styles.textoDeSaida}>Não quero controlar o estoque deste remédio</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
