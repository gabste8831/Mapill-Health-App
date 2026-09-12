import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePermissoesDeAlarme } from "@/hooks/use-permissoes-de-alarme";
import { estadoDePressao, useCores } from "@/shared/theme";
import { Header } from "@/ui";
import { styles } from "./AjudaDeAlertas.styles";

type AjudaDeAlertasScreenProps = {
  onBack: () => void;
  onAbrirTermos: () => void;
};

/**
 * O que o alerta faz na hora da dose — em tela, e não mais dobrado num acordeão dentro do popup.
 *
 * ## Por que saiu de lá
 *
 * A folha "Como quer ser avisado?" é uma pergunta com três respostas. Ela vinha carregando quatro
 * camadas no mesmo nível — a decisão, o painel de permissões, um aviso sobre o aparelho e este
 * texto inteiro —, e quem abria para escolher um modo precisava atravessar tudo para achar a
 * escolha. Explicação empilhada sobre decisão não informa mais: ela adia a decisão.
 *
 * ## O que se ganhou além do espaço
 *
 * Enquanto isto vivia dentro do modal, ler os termos exigia uma máquina de estado inteira no
 * formulário — fechar o popup para navegar (dois modais empilhados travam a tela no Android),
 * lembrar que ele estava aberto, em que ponto a leitura tinha parado, e reabrir tudo no foco
 * seguinte. Como rota irmã dentro do mesmo stack do cadastro, "ler os termos" é um `push` comum e
 * o botão de voltar do Android faz o caminho de volta sozinho.
 *
 * A tela não conhece rota: quem navega é quem a monta (§2.6.1).
 */
export function AjudaDeAlertasScreen({
  onBack,
  onAbrirTermos,
}: AjudaDeAlertasScreenProps) {
  const cores = useCores();
  /**
   * O hook relê as permissões **a cada volta ao primeiro plano**, e é isso que faz esta tela
   * funcionar como página de conferência: a pessoa toca numa linha, vai à tela do sistema, concede,
   * e ao voltar o estado já está atualizado — sem precisar sair e entrar de novo.
   */
  const { itens } = usePermissoesDeAlarme();

  const verificaveis = itens.filter((item) => item.verificavel);
  const naoVerificaveis = itens.filter((item) => !item.verificavel);

  /**
   * As duas seções de autorização, montadas aqui e renderizadas **antes** das explicações.
   *
   * Numa variável porque o JSX delas é longo, e no meio da árvore empurraria as explicações para
   * fora da vista de quem lê o arquivo. A ordem na tela é o que importa, e ela está no `return`.
   */
  const SECOES_DE_PERMISSAO = (
    <>
      <View style={styles.condicoes}>
        <Text style={styles.condicoesTitulo}>
          O app confere estas para você
        </Text>

        {verificaveis.map((permissao) => (
          <Pressable
            key={permissao.chave}
            style={estadoDePressao(
              [styles.linhaDePermissao, permissao.concedida && styles.linhaResolvida],
              { escala: true },
            )}
            onPress={() => void permissao.abrir()}
            accessibilityRole="button"
            accessibilityLabel={`${permissao.titulo}. ${
              permissao.concedida ? "Autorizada." : `Falta autorizar. ${permissao.descricao}`
            } Toque para abrir as configurações.`}>
            <Ionicons
              name={permissao.concedida ? "checkmark-circle" : "close-circle"}
              size={24}
              color={permissao.concedida ? cores.success : cores.error}
            />
            <View style={styles.linhaTexto}>
              <Text style={styles.linhaTitulo}>{permissao.titulo}</Text>
              {/**
               * **Uma linha de estado, e nada mais** — a consequência saiu daqui.
               *
               * A descrição ("sem isto o aviso pode atrasar dezenas de minutos") existe para
               * convencer, e ela já está na Home, no painel que trouxe a pessoa até aqui. Repetida
               * dentro de cada botão, transformava cinco alvos de toque em cinco parágrafos — e foi
               * o que o Gabriel apontou em 12/09: denso demais para se ler como botão.
               *
               * O que fica é o que decide a ação: o nome da permissão e se ela falta.
               */}
              <Text style={permissao.concedida ? styles.linhaOk : styles.linhaPendente}>
                {permissao.concedida ? "Autorizada" : "Toque para autorizar"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={cores.primary} />
          </Pressable>
        ))}
      </View>

      {naoVerificaveis.length > 0 ? (
        <View style={styles.condicoes}>
          <Text style={styles.condicoesTitulo}>
            Você precisa conferir estas
          </Text>
          {/* Uma frase, e curta: o parágrafo de três linhas que estava aqui somava ao peso que o
              Gabriel apontou em 12/09. O essencial é que o app não sabe o estado delas. */}
          <Text style={styles.texto}>
            O Android não deixa o Mapill ver se estão ligadas.
          </Text>

          {naoVerificaveis.map((permissao) => (
            <Pressable
              key={permissao.chave}
              style={estadoDePressao(styles.linhaDePermissao, { escala: true })}
              onPress={() => void permissao.abrir()}
              accessibilityRole="button"
              accessibilityLabel={`${permissao.titulo}. ${permissao.descricao} ${permissao.comoFazer ?? ""} O app não consegue verificar esta. Toque para abrir as configurações.`}>
              {/* Sem verde nem vermelho: um ícone de estado aqui seria afirmar o que o app não
                  sabe, e é justamente o engano que esta seção existe para corrigir. */}
              <Ionicons name="help-circle" size={24} color={cores.onSurfaceVariant} />
              <View style={styles.linhaTexto}>
                <Text style={styles.linhaTitulo}>{permissao.titulo}</Text>
                {/* Aqui o `comoFazer` fica, e a `descricao` sai: a instrução é o que a pessoa
                    precisa na mão ao chegar numa tela do sistema que não explica nada. Nas
                    verificáveis não há instrução, porque a tela de destino já é a resposta. */}
                <Text style={styles.linhaComoFazer}>
                  {permissao.comoFazer ?? "Toque para abrir e conferir"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={cores.primary} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Alertas e permissões" onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/**
         * **As permissões primeiro, a explicação depois** — e essa ordem é a decisão desta tela.
         *
         * Ela nasceu como texto explicativo, e as autorizações entraram no fim. O Gabriel corrigiu
         * em 12/09, e o argumento é de acessibilidade: quem chega aqui está tentando fazer o alarme
         * funcionar, e atravessar quatro seções de texto antes de achar o que resolve é desistir no
         * meio. O público inclui idosos, e permissão de Android é o assunto mais difícil do app.
         *
         * ⚠️ **Não há placar de progresso aqui, e isso é deliberado.**
         *
         * Havia um — "2 de 3 ainda faltam", em vermelho, no topo. Ele contava só as verificáveis,
         * porque são as únicas que o app sabe contar, e por isso mentia sobre o total: quem lia "de
         * 3" concluía que três era o que havia, e que zerar aquele número deixava o app pronto. É
         * exatamente o engano que tirou a lista de permissões da Home no mesmo dia.
         *
         * Qualquer progresso mostrado aqui teria o mesmo defeito, porque o denominador honesto é
         * cinco e o app só conhece três. A frase de abertura de cada seção diz o que ela é, e é isso
         * que substitui o placar.
         */}
        {SECOES_DE_PERMISSAO}

        {/* A explicação vem **depois** das autorizações: quem abre esta tela está tentando fazer o
            alarme funcionar, e o texto é o que se lê depois de resolver, não antes. */}
        <Text style={styles.abertura}>
          O alerta organiza a rotina. Ele avisa, e quem toma é você.
        </Text>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Na hora da dose</Text>
          <Text style={styles.texto}>
            O alerta mostra o horário, o remédio, a quantidade daquele horário e
            a orientação de como tomar, se você tiver anotado alguma.
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Confirmar, adiar ou ignorar</Text>
          <Text style={styles.texto}>
            Você responde dali mesmo, sem abrir o app, e a resposta define o
            status da dose. Confirmou: o estoque desconta, se você estiver
            controlando. Ignorou: fica registrado que a dose não foi tomada. Os
            dois entram no seu histórico.
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Se você adiar</Text>
          <Text style={styles.texto}>
            O alerta volta em 5 minutos, uma vez só, para o app não virar
            despertador infinito. Se você não responder nessa segunda vez, a
            dose fica registrada como não tomada e continua na sua lista do dia
            até você dizer o contrário.
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>O que o Mapill não faz</Text>
          {[
            "Não confirma dose sozinho. Quem responde é você, sempre.",
            "Não decide sua posologia nem substitui quem receitou. Ele auxilia o tratamento, não conduz.",
            "Não controla as regras do seu celular. Com permissão, volume e bateria em ordem, o Mapill trabalha para manter os alertas íntegros; fora disso, o sistema decide.",
          ].map((limite) => (
            <View key={limite} style={styles.limite}>
              {/* O marcador fica fora do fluxo do texto para a segunda linha alinhar sob a
                  primeira, e não sob a bolinha. */}
              <Text style={styles.limiteMarcador}>•</Text>
              <Text style={styles.limiteTexto}>{limite}</Text>
            </View>
          ))}
        </View>

        {/* O texto que era o aviso "Depende do seu aparelho" dentro do popup. Ali ele competia com
            o painel de permissões, que diz a mesma coisa e ainda leva à tela de cada ajuste; aqui
            ele é o que sempre foi — uma condição explicada, não um alerta. */}
        {/**
         * A lista completa das autorizações, **sempre visível** — e é isto que diferencia esta tela
         * do painel da Home.
         *
         * O painel é um alerta: ele aparece quando há algo a fazer e some quando não há. Três das
         * cinco autorizações não expõem estado a nenhuma API (sobrepor apps, início automático,
         * bateria), e para essas o painel marca a **ida** à tela do sistema, não a permissão.
         *
         * O furo que isso abria, apontado pelo Gabriel em 12/09: quem abre a tela do Autostart e sai
         * sem ligar a chave vê a linha desaparecer do painel — e fica sem aviso nenhum, com o app
         * silencioso e nada explicando por quê. O lugar onde ele orientava deixou de existir.
         *
         * Aqui as cinco estão sempre listadas, com o botão que leva à tela de cada uma. Não é um
         * alerta: é a página de consulta de "por que o aviso não chegou?", e ela não pode sumir
         * justamente quando a resposta é necessária.
         */}
        {/**
         * **Duas seções, e a divisão é por quem sabe a resposta** — não por importância.
         *
         * A primeira lista o que o Android responde quando perguntado: o app afirma com certeza, em
         * verde ou vermelho. A segunda lista o que nenhuma API expõe, e onde só a pessoa pode
         * verificar abrindo a tela.
         *
         * Separar foi decisão do Gabriel em 12/09, e resolve o furo que a versão anterior tinha:
         * lá as três não-verificáveis eram marcadas como concedidas ao serem **visitadas**, então
         * quem abria o Autostart e saía sem ligar a chave via a linha desaparecer — e ficava com o
         * app silencioso e nada explicando por quê. Aqui elas nunca desaparecem, porque o app nunca
         * soube se foram atendidas.
         */}
        <Pressable
          style={estadoDePressao(styles.alvoDeLink, { superficie: true })}
          onPress={onAbrirTermos}
          accessibilityRole="link"
        >
          <Text style={styles.linkParaTermos}>
            Ler os Termos de Uso completos
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
