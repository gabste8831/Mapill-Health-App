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
  /**
   * Esconde a linha da consequência, para quem já a diz logo acima.
   *
   * É o caso da Home, onde a seção tem uma frase própria. Nas telas de cadastro fica visível: ali
   * este bloco é o único lugar que explica por que o lembrete recém-configurado pode não chegar.
   */
  semDescricao?: boolean;
  /**
   * `true` quando o app **comprova** que falta alguma autorização, e aí o bloco fica vermelho.
   *
   * É o mesmo estado que faz o painel "Seus alarmes não vão funcionar" aparecer na Home: alguma das
   * três verificáveis está negada. Decisão do Gabriel em 12/09 — enquanto houver pendência provada,
   * o aviso precisa ter a urgência de um erro, e não a neutralidade de uma informação.
   *
   * Volta ao azul quando as verificáveis estão atendidas. Aí não há nada provado a cobrar: as três
   * restantes o app não consegue ler, e pintar de vermelho o que ele não sabe seria afirmar um
   * estado inexistente — o mesmo erro do placar e da lista que saíram da Home no mesmo dia.
   */
  urgente?: boolean;
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
  semDescricao = false,
  urgente = false,
  onAbrir,
}: AvisoDePermissoesProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  return (
    <Pressable
      style={estadoDePressao([styles.aviso, urgente && styles.avisoUrgente], {
        superficie: true,
      })}
      onPress={onAbrir}
      accessibilityRole="button"
      accessibilityLabel={`${
        urgente ? "Falta autorizar permissões. " : ""
      }Confira as permissões do aparelho. Sem elas ${oQueNaoFunciona} não funciona. Toque para ver quais são.`}>
      {/**
       * O ícone dentro de um selo redondo, como o da tela de Conta e dados.
       *
       * Pedido do Gabriel em 12/09, e o padrão é o mesmo `introIcone` de lá: círculo de 40dp com o
       * azul a 12%, e o `shield-checkmark` em `corDeDestaque`. Solto, o ícone flutuava ao lado do
       * texto; no selo ele ganha peso de marca visual e o bloco passa a ler como uma peça, não como
       * uma linha de lista com um símbolo à esquerda.
       *
       * No estado urgente o escudo vira triângulo de alerta: cor sozinha não distingue nada para
       * quem não a percebe, e o ícone é o segundo sinal que a WCAG 1.4.1 pede.
       */}
      <View style={[styles.selo, urgente && styles.seloUrgente]}>
        <Ionicons
          name={urgente ? "warning" : "shield-checkmark"}
          size={22}
          color={urgente ? cores.error : cores.corDeDestaque}
        />
      </View>
      <View style={styles.texto}>
        <Text style={[styles.titulo, urgente && styles.tituloUrgente]}>
          {urgente ? "Falta autorizar permissões" : "Confira as permissões"}
        </Text>
        {/**
         * A consequência só quando não há texto acima dizendo a mesma coisa.
         *
         * Na Home a seção tem uma frase própria ("se algum alarme não chegou como devia..."), e
         * repeti-la dentro do bloco daria a mesma informação duas vezes em duas linhas seguidas.
         * Nas telas de cadastro não há essa frase, e aqui é o único lugar que explica por que o
         * lembrete que a pessoa acabou de configurar pode não chegar.
         */}
        {semDescricao ? null : (
          <Text style={[styles.descricao, urgente && styles.descricaoUrgente]}>
            Sem elas {oQueNaoFunciona} não funciona.
          </Text>
        )}
      </View>
      {/* A seta acompanha o fundo: `onPrimarySurface` é azul escuro, e sobre a superfície vermelha
          do estado urgente ela ficaria fora da paleta do bloco. */}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={urgente ? cores.onErrorSurface : cores.onPrimarySurface}
      />
    </Pressable>
  );
}
