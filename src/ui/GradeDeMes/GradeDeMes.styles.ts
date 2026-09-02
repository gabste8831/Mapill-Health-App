import { StyleSheet } from "react-native";

import { colors, radius, spacing, typography, withOpacity } from "@/shared/theme";

export const styles = StyleSheet.create({
  /** Faixa colorida, como o topo de Ajustes: separa o calendário da lista sem precisar de borda. */
  container: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  navegacao: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    textTransform: "capitalize",
  },
  semana: {
    flexDirection: "row",
    paddingBottom: spacing.xs,
  },
  /** 11 porque sete rotulos precisam caber na largura da tela; abaixo do `caption` de proposito. */
  rotuloDaSemana: {
    ...typography.label,
    // Menor que o resto: é legenda de coluna, lida uma vez e depois ignorada.
    fontSize: 11,
    flex: 1,
    textAlign: "center",
    color: withOpacity(colors.onPrimary, 0.7),
  },
  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  /** Sete colunas exatas. `14.2857%` é 100/7 — porcentagem em vez de largura fixa para a grade
   *  acompanhar telas estreitas sem estourar para uma oitava coluna. */
  celula: {
    width: "14.2857%",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  numeroCirculo: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
  },
  /** Hoje é contorno, e não preenchimento: ele situa, mas quem manda na tela é o dia selecionado. */
  numeroHoje: {
    borderWidth: 1,
    borderColor: colors.onPrimary,
  },
  numeroSelecionado: {
    backgroundColor: colors.onPrimary,
  },
  numero: {
    ...typography.bodyMd,
    color: colors.onPrimary,
  },
  numeroTextoSelecionado: {
    color: colors.primary,
  },
  pontos: {
    flexDirection: "row",
    gap: 3,
    height: 6,
    marginTop: 2,
  },
  ponto: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
  },
  /** Branco para o compromisso: é o que a pessoa marcou, e o que ela procura no mês. */
  pontoDeCompromisso: {
    backgroundColor: colors.onPrimary,
  },
  /** A dose é rotina, então fica mais discreta — senão o mês inteiro vira uma parede de pontos. */
  pontoDeDose: {
    backgroundColor: withOpacity(colors.onPrimary, 0.45),
  },
});
