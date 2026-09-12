import { Pressable, Text, View } from "react-native";

import {
  AvisoDePermissoes,
  BottomSheet,
  Button,
  Checkbox,
  OptionGroup,
  TextField,
  type OptionGroupOption,
} from "@/ui";
import { formatDecimalInput, formatIntegerInput } from "@/shared/number-input";
import { estadoDePressao, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./CadastroDeMedicamento.styles";

const LEAD_DAYS_OPTIONS: OptionGroupOption<string>[] = [
  { value: "3", label: "3 dias" },
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
];

export type EstoqueForm = {
  /** Embalagem de gota se conta em ml (fracionável); cartela, em comprimidos inteiros. */
  aceitaFracao: boolean;
  /** Quanto tempo o estoque dura, já em texto. `null` quando não há como estimar. */
  aviso: string | null;
  /** Cor de atenção em vez de apoio: a antecedência escolhida não cabe no estoque de hoje. */
  avisoEhConflito: boolean;
  /** Pergunta pronta ("Quantos ml você tem") — a concordância é da tela, que conhece a unidade. */
  quantityLabel: string;
  quantity: string;
  onQuantityChange: (value: string) => void;
  alertEnabled: boolean;
  onAlertEnabledChange: (enabled: boolean) => void;
  /** `null` = sem prazo. O aviso continua existindo, e chega no dia em que o estoque acabar. */
  leadDays: string | null;
  /** `null` quando a pessoa toca na opção já escolhida, voltando ao aviso só no dia do fim. */
  onLeadDaysChange: (days: string | null) => void;
  storageLocation: string;
  onStorageLocationChange: (value: string) => void;
};

type ConfiguracaoDeEstoqueProps = EstoqueForm & {
  visible: boolean;
  onClose: () => void;
  onDisable: () => void;
  /**
   * Abre a ajuda de alertas. Opcional porque o aviso de permissões só aparece com o alerta marcado,
   * e quem monta a folha sem passar isto simplesmente não o mostra.
   */
  onAbrirAjudaDeAlertas?: () => void;
  /** `true` quando o app comprova pendência — a folha não consulta o hook, quem monta já sabe. */
  avisoDePermissoesUrgente?: boolean;
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
  onAbrirAjudaDeAlertas,
  avisoDePermissoesUrgente = false,
  aceitaFracao,
  aviso,
  avisoEhConflito,
  quantityLabel,
  quantity,
  onQuantityChange,
  alertEnabled,
  onAlertEnabledChange,
  leadDays,
  onLeadDaysChange,
  storageLocation,
  onStorageLocationChange,
}: ConfiguracaoDeEstoqueProps) {
  const styles = useEstilos(criarEstilos);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Controle de estoque">
      <View style={styles.sheetBody}>
        {/* Contado na unidade da embalagem, não na da dose: é o que está impresso no frasco, e é
            o que faz a conta de "quantos dias ainda dá" fechar. */}
        <TextField
          label={quantityLabel}
          placeholder="Ex: 30"
          value={quantity}
          onChangeText={(raw) =>
            onQuantityChange(aceitaFracao ? formatDecimalInput(raw) : formatIntegerInput(raw))
          }
          keyboardType={aceitaFracao ? "decimal-pad" : "number-pad"}
          maxLength={8}
        />

        <TextField
          label="Onde você guarda"
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
          <>
            <OptionGroup
              label="Avisar antes também (opcional)"
              value={leadDays}
              options={LEAD_DAYS_OPTIONS}
              // Tocar na opção já marcada desmarca — a mesma regra dos outros dois seletores de
              // antecedência (receita, e este mesmo aviso na tela de estoque). Onde o vazio é um
              // estado válido, ele precisa ser alcançável pelo mesmo gesto que o abandonou.
              onChange={(dias) => onLeadDaysChange(dias === leadDays ? null : dias)}
            />
            {/* **Onde o aviso aparece**, e não só que ele existe.

                O rótulo dizia "me avisar quando estiver acabando" e calava sobre o canal. Quem
                marcava esperava notificação — e até 08/09 o app só mostrava o cartão da tela
                inicial, uma promessa que o agendador não cumpria.

                Agora cumpre, mas a notificação depende de permissão que pode estar negada, e a
                estimativa depende de horários fixos. A tela inicial é o único canal que não
                depende de nada, então é ela que a frase garante — o resto vem como acréscimo.

                A frase muda com o prazo escolhido, porque a promessa muda: sem prazo é um aviso,
                com prazo são dois. */}
            <Text style={styles.sectionHint}>
              {leadDays === null
                ? "O aviso aparece na tela inicial e, se as notificações estiverem ativas, também chega no celular no dia em que o estoque acabar. Escolha um prazo acima para ser avisado antes."
                : `O aviso aparece na tela inicial e, se as notificações estiverem ativas, também chega no celular: uma vez quando faltarem ${leadDays} dias e outra quando o estoque acabar.`}
            </Text>
          </>
        ) : null}

        {/* A consequência do que foi digitado, em dias e data. Sem isto, "30 dias de
            antecedência" com cinco dias de estoque é aceito calado. */}
        {aviso !== null ? (
          <Text style={avisoEhConflito ? styles.avisoDeConflito : styles.sectionHintDestaque}>
            {aviso}
          </Text>
        ) : null}

        {/* Só com o aviso marcado: sem ele nada aqui depende de autorização do aparelho, e o
            alerta seria ruído numa folha que trata de contar comprimidos. */}
        {alertEnabled && onAbrirAjudaDeAlertas !== undefined ? (
          <AvisoDePermissoes
            oQueNaoFunciona="o aviso de estoque"
            urgente={avisoDePermissoesUrgente}
            onAbrir={onAbrirAjudaDeAlertas}
          />
        ) : null}

        <Button label="Pronto" onPress={onClose} />
        <Pressable
          style={estadoDePressao(styles.alvoDeLink, { superficie: true })}
          onPress={onDisable}
          accessibilityRole="button">
          <Text style={styles.textoDeSaida}>Não quero controlar o estoque deste remédio</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
