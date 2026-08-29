import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { styles } from "./OptionGroup.styles";

export type OptionGroupOption<TValue extends string> = {
  value: TValue;
  label: string;
  /** Linha de apoio. Não cabe em `layout="linha"`, onde a opção tem a largura do texto. */
  hint?: string;
  /**
   * Ícone acima do rótulo, em `grade` e `coluna`. Serve pra escolha que se faz de relance depois
   * da primeira vez — a forma do sino é reconhecida antes de a palavra ser lida.
   */
  icon?: ReactNode;
};

export type OptionGroupProps<TValue extends string> = {
  /** Vazio omite a linha de label, igual ao `TextField`. */
  label?: string;
  value: TValue | null;
  options: OptionGroupOption<TValue>[];
  onChange: (value: TValue) => void;
  /**
   * `linha` embrulha opções curtas lado a lado; `grade` fixa duas colunas, pra rótulo médio não
   * virar quatro linhas empilhadas; `coluna` empilha e dá espaço pro `hint`.
   */
  layout?: "linha" | "grade" | "coluna";
  /** Deixa a grade crescer em altura pra caber ícone e apoio, em vez de duas fichas rasas. */
  alto?: boolean;
  /**
   * Em `grade` com número ímpar de opções, deixa a **última ocupar a linha inteira** em vez de
   * ficar meia-largura ao lado de um vazio.
   *
   * Só vale quando a última opção for mesmo a que resume as outras — "Os dois" depois de "Alarme"
   * e "Notificação". Aí a largura maior não é sobra de espaço: ela diz que aquela opção contém as
   * de cima. Fora desse caso o vazio é melhor, porque uma ficha maior sem motivo lê como a opção
   * recomendada.
   */
  ultimaOcupaLinha?: boolean;
  /**
   * Entra no fim da fileira, junto das opções. Existe pro caso "as opções cobrem o comum, e o
   * resto se digita" — a alternativa era um botão "Mais" que revela um campo em outra linha, e
   * gastar dois toques e duas linhas pra dizer um número.
   */
  trailing?: ReactNode;
};

const CONTAINER_STYLE = {
  linha: "row",
  grade: "grid",
  coluna: "column",
} as const;

const OPTION_STYLE = {
  linha: "optionInline",
  grade: "optionGrid",
  coluna: "optionStacked",
} as const;

/**
 * Escolha única resolvida em um toque, com as opções à vista. Existe ao lado do `SelectField`
 * porque os dois resolvem problemas diferentes: o select esconde a lista pra caber (tipo
 * sanguíneo, 8 opções), este mostra tudo quando são poucas e a comparação entre elas é a
 * decisão — "contínuo ou com prazo" se responde vendo as duas juntas, não abrindo um popup.
 */
export function OptionGroup<TValue extends string>({
  label,
  value,
  options,
  onChange,
  layout = "linha",
  alto = false,
  ultimaOcupaLinha = false,
  trailing,
}: OptionGroupProps<TValue>) {
  const impar = options.length % 2 === 1;
  const indiceDaLinhaInteira =
    layout === "grade" && ultimaOcupaLinha && impar ? options.length - 1 : -1;

  return (
    <View style={styles.fieldGroup}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles[CONTAINER_STYLE[layout]]}>
        {options.map((option, index) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                styles[OPTION_STYLE[layout]],
                alto && styles.optionAlto,
                index === indiceDaLinhaInteira && styles.optionLinhaInteira,
                isSelected && styles.optionSelected,
              ]}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}>
              {option.icon}
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {option.label}
              </Text>
              {option.hint && layout !== "linha" ? (
                <Text style={[styles.optionHint, isSelected && styles.optionHintSelected]}>
                  {option.hint}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
        {/* Sem ele, uma grade com número ímpar de opções esticaria a última na largura toda, que
            lê como defeito e não como grade. Some quando esticar é justamente o que se quer. */}
        {layout === "grade" && impar && !ultimaOcupaLinha ? (
          <View style={styles.espacoDaGrade} />
        ) : null}
        {trailing}
      </View>
    </View>
  );
}
