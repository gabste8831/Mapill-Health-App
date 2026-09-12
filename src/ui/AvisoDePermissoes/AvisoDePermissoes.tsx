import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import { criarEstilos } from "./AvisoDePermissoes.styles";

type AvisoDePermissoesProps = {
  /**
   * O que se perde sem as autorizações, na voz da tela que mostra o aviso.
   *
   * "seus alarmes" na Home, "este lembrete" no cadastro, "o aviso de estoque" no estoque. É o que
   * transforma um alerta genérico numa frase sobre a coisa que a pessoa está configurando agora —
   * e é ela que faz alguém interromper o que está fazendo para ir às configurações.
   */
  oQueNaoFunciona: string;
  onAbrir: () => void;
};

/**
 * O aviso de que as autorizações do aparelho precisam ser conferidas — compacto, e em toda tela que
 * configura algo que depende delas.
 *
 * ## Por que existe separado do `PainelDePermissoes`
 *
 * O painel é a lista: ele enumera o que falta e leva a cada tela do sistema, e só aparece quando o
 * app **consegue verificar** que há pendência. Isto é o contrário — um aviso curto, para as três
 * autorizações que nenhuma API expõe (sobrepor apps, início automático, economia de bateria).
 *
 * Sobre essas o app não pode afirmar nada: nem que faltam, nem que estão atendidas. O que ele pode
 * fazer é não deixar a pessoa configurar um lembrete achando que basta — e foi o que aconteceu em
 * 11/09, quando o Autostart desligado impediu todos os avisos de chegarem num Xiaomi, com o app
 * mostrando tudo agendado e nada explicando o silêncio.
 *
 * ## Por que em cinco telas, e não só na Home
 *
 * Decisão do Gabriel em 12/09. O momento em que alguém liga um lembrete é o momento em que ele
 * acredita que vai ser avisado — é ali que a informação muda uma decisão, não na Home dias depois.
 * Aparece no cadastro de medicação, na folha de lembrete, na validade da receita, no aviso de
 * estoque e no cadastro de compromisso.
 *
 * ## Por que ele nunca desaparece
 *
 * Não há o que ele espere: o app não consegue saber se as três foram atendidas. Ele é discreto de
 * propósito — uma linha, sem ícone de erro, sem cor de alarme —, porque um aviso permanente com
 * peso de erro ensina a ignorar todos os outros. O que ele carrega é o caminho.
 */
export function AvisoDePermissoes({
  oQueNaoFunciona,
  onAbrir,
}: AvisoDePermissoesProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <Pressable
      style={estadoDePressao(styles.aviso, { superficie: true })}
      onPress={onAbrir}
      accessibilityRole="button"
      accessibilityLabel={`Confira as permissões do aparelho. Sem elas ${oQueNaoFunciona} não funciona. Toque para ver quais são.`}
    >
      <Ionicons
        name="shield-checkmark"
        size={20}
        color={cores.onPrimarySurface}
      />
      <View style={styles.texto}>
        <Text style={styles.titulo}>Confira as permissões</Text>
        <Text style={styles.descricao}>
          Sem elas {oQueNaoFunciona} não funciona.
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={cores.onPrimarySurface}
      />
    </Pressable>
  );
}
