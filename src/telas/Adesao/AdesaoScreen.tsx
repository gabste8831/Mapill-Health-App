import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  PERIODOS_DE_ADESAO,
  useAdherenceReport,
  type PeriodoDeAdesao,
} from "@/hooks/use-adherence-report";
import { dataEHoraPorExtenso } from "@/shared/datas-por-extenso";
import { estadoDePressao } from "@/shared/theme";
import type { AdesaoPorMedicamento } from "@/domain/use-cases/resumir-adesao";
import { useRelatorioPdf } from "@/hooks/use-relatorio-pdf";
import {
  BottomSheet,
  Button,
  CenteredLoader,
  Checkbox,
  Dica,
  EstadoDeErro,
  Header,
  OptionGroup,
  type OptionGroupOption,
} from "@/ui";
import { styles } from "./AdesaoScreen.styles";

/**
 * `OptionGroup` e não `SeletorDeOrdem`: período não é ordenação. O seletor de ordem exige um ícone
 * por opção, e "7 dias" não tem ícone que signifique algo — três fichas com o número são o que a
 * pessoa lê de relance.
 */
const OPCOES_DE_PERIODO: OptionGroupOption<string>[] = PERIODOS_DE_ADESAO.map((periodo) => ({
  value: String(periodo.dias),
  label: periodo.label,
}));

/** `0.87` → `"87%"`. Arredonda para o inteiro: a precisão decimal aqui é falsa. */
function percentual(taxa: number): string {
  return `${Math.round(taxa * 100)}%`;
}

/**
 * A faixa em que a taxa cai. Governa só a cor — o número é o mesmo, e nenhuma faixa é apresentada
 * como nota ou julgamento.
 *
 * Os cortes vêm da literatura de adesão que o artigo cita: 80% é o limiar clássico a partir do
 * qual um tratamento é considerado aderente, e abaixo de 50% a adesão é tida como pobre. Não são
 * números escolhidos por estética.
 */
function faixaDaTaxa(taxa: number): "boa" | "media" | "baixa" {
  if (taxa >= 0.8) return "boa";
  if (taxa >= 0.5) return "media";
  return "baixa";
}

function LinhaDeMedicamento({ item }: { item: AdesaoPorMedicamento }) {
  return (
    <View style={styles.linha}>
      <View style={styles.linhaTexto}>
        <Text style={styles.linhaNome}>{item.medicationName}</Text>
        <Text style={styles.linhaDetalhe}>
          {item.confirmadas} de {item.previstas}
          {item.puladas > 0 ? ` · ${item.puladas} pulada${item.puladas > 1 ? "s" : ""}` : ""}
          {item.semResposta > 0 ? ` · ${item.semResposta} sem resposta` : ""}
        </Text>
      </View>

      {item.taxa !== null ? (
        <Text style={[styles.linhaTaxa, styles[`taxa_${faixaDaTaxa(item.taxa)}`]]}>
          {percentual(item.taxa)}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Histórico e taxa de adesão — o que o paciente leva ao médico.
 *
 * É a tela que transforma o app de lembrete em **registro clínico** (§2.3.3): sem ela, todo o dado
 * de ingestão que o Mapill acumula fica invisível para quem tomaria decisão a partir dele.
 *
 * O que a tela **não** faz: julgar. Não há "parabéns", não há alerta vermelho por adesão baixa, não
 * há meta. A taxa é um dado a ser levado para a consulta, e um app que elogia ou repreende o
 * paciente pela própria adesão convida a corrigir o registro em vez de corrigir o tratamento — que
 * é exatamente o que destruiria o valor deste número.
 */
export function AdesaoScreen() {
  const router = useRouter();
  const [periodo, setPeriodo] = useState<PeriodoDeAdesao>(30);
  const { resumo, perdidas, isLoading, error, reload } = useAdherenceReport(periodo);
  const { gerar, gerando, erro: erroDoPdf, medicamentos } = useRelatorioPdf();

  /**
   * Quais medicamentos entram no relatório. **Lista vazia = todos**, e é o padrão.
   *
   * Guardar a ausência de filtro como lista vazia, em vez de "todos os ids marcados", é o que faz
   * um remédio cadastrado depois entrar no relatório sozinho — com a lista cheia, ele nasceria
   * fora e ninguém entenderia por quê.
   */
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [selecionando, setSelecionando] = useState(false);

  function alternar(id: string) {
    setSelecionados((atual) => {
      // Vazio significa "todos", então o primeiro toque materializa a lista completa para poder
      // tirar um item dela — senão desmarcar um deixaria a lista com um só, que é o oposto.
      const base = atual.length === 0 ? medicamentos.map((m) => m.id) : atual;
      const proximo = base.includes(id) ? base.filter((outro) => outro !== id) : [...base, id];

      // Desmarcar o último devolve ao padrão em vez de produzir um relatório sem tratamento
      // nenhum: um PDF vazio não é uma escolha que alguém queira fazer, é um beco.
      if (proximo.length === 0) return [];
      // Marcar todos de volta é a mesma coisa que não filtrar, e precisa ser gravado assim para o
      // cabeçalho do PDF não declarar um recorte que não existe.
      return proximo.length === medicamentos.length ? [] : proximo;
    });
  }

  const resumoDaSelecao =
    selecionados.length === 0
      ? "Todos"
      : selecionados.length === 1
        ? (medicamentos.find((m) => m.id === selecionados[0])?.nome ?? "1 medicamento")
        : `${selecionados.length} de ${medicamentos.length}`;

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  if (isLoading) return <CenteredLoader />;

  // Falhou a leitura: a tela inteira vira o erro, com saída. Mostrar o seletor de período sobre uma
  // taxa que não carregou ofereceria escolhas que não mudam nada.
  if (error !== null) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Header title="Minha adesão" onBack={voltar} />
        <EstadoDeErro mensagem={error} onTentarDeNovo={() => void reload()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Minha adesão" onBack={voltar} />

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <OptionGroup
          value={String(periodo)}
          onChange={(valor) => setPeriodo(Number(valor) as PeriodoDeAdesao)}
          options={OPCOES_DE_PERIODO}
        />

        {/* Sem dose vencida não há taxa a mostrar, e um "0%" seria a leitura errada de quem acabou
            de cadastrar o primeiro remédio. */}
        {resumo.taxa === null ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioTitulo}>Ainda não há o que medir</Text>
            <Text style={styles.vazioTexto}>
              Quando as primeiras doses vencerem, a adesão aparece aqui.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.destaque}>
              {/* Branco sobre o azul: as faixas de cor seguem valendo na lista por medicamento,
                  que está sobre fundo claro e tem contraste para elas. */}
              <Text style={[styles.destaqueTaxa, styles.destaqueTaxaTexto]}>
                {percentual(resumo.taxa)}
              </Text>
              <Text style={styles.destaqueLegenda}>
                {resumo.confirmadas} de {resumo.previstas}{" "}
                {resumo.previstas === 1 ? "dose tomada" : "doses tomadas"}
              </Text>
            </View>

            {/* Puladas e sem resposta lado a lado, e nunca somadas: para a taxa elas contam igual,
                mas para a conversa com o médico são opostas — "decidi não tomar" e "esqueci"
                pedem condutas diferentes. */}
            <View style={styles.contagens}>
              <View style={styles.contagem}>
                <Text style={styles.contagemValor}>{resumo.puladas}</Text>
                <Text style={styles.contagemRotulo}>
                  {resumo.puladas === 1 ? "pulada" : "puladas"}
                </Text>
                <Text style={styles.contagemDica}>você decidiu não tomar</Text>
              </View>
              <View style={styles.contagem}>
                <Text style={styles.contagemValor}>{resumo.semResposta}</Text>
                <Text style={styles.contagemRotulo}>sem resposta</Text>
                <Text style={styles.contagemDica}>o horário passou em branco</Text>
              </View>
            </View>

            {resumo.porMedicamento.length > 1 ? (
              <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>Por medicamento</Text>
                {/* Do pior para o melhor: a lista existe para achar onde o tratamento está
                    falhando, e quem está em 100% não precisa ser lido. */}
                {resumo.porMedicamento.map((item) => (
                  <LinhaDeMedicamento key={item.medicationId} item={item} />
                ))}
              </View>
            ) : null}

            {perdidas.length > 0 ? (
              <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>Doses não tomadas</Text>
                {perdidas.map((dose) => (
                  <View key={dose.doseScheduleId} style={styles.perdida}>
                    <View style={styles.linhaTexto}>
                      <Text style={styles.perdidaNome}>{dose.medicationName}</Text>
                      <Text style={styles.linhaDetalhe}>
                        {dataEHoraPorExtenso(new Date(dose.scheduledFor))}
                      </Text>
                    </View>
                    <Text style={styles.perdidaSelo}>
                      {dose.status === "skipped" ? "Pulada" : "Sem resposta"}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Diz como o número foi feito. Sem isso, quem leva a tela ao médico não sabe se a dose
                de hoje à noite já está contando contra ela — e um número que não se explica não
                serve para decisão clínica. */}
            <Text style={styles.rodape}>
              A adesão considera as doses cujo horário já passou. As de hoje ainda por vir não
              entram na conta.
            </Text>
          </>
        )}

        {/* Fora do `if` da taxa de propósito: um relatório de tratamentos em curso serve na consulta
            mesmo quando nenhuma dose venceu ainda, e é justamente quem acabou de começar o
            tratamento que costuma ter a próxima consulta marcada. */}
        <View style={styles.secao}>
          {/* Só aparece com mais de um medicamento: escolher entre um item é uma decisão que não
              existe, e a linha a mais só empurraria o botão para baixo. */}
          {medicamentos.length > 1 ? (
            <Pressable
              // Linha de largura total: escurece sem encolher.
              style={estadoDePressao(styles.filtro)}
              onPress={() => setSelecionando(true)}
              accessibilityRole="button"
              accessibilityLabel={`Medicamentos do relatório: ${resumoDaSelecao}. Toque para escolher.`}
            >
              <Text style={styles.filtroRotulo}>MEDICAMENTOS NO RELATÓRIO</Text>
              <Text style={styles.filtroValor}>{resumoDaSelecao}</Text>
            </Pressable>
          ) : null}

          <Button
            variant="outline"
            label="Gerar relatório em PDF"
            loading={gerando}
            onPress={() => void gerar(periodo, selecionados.length > 0 ? selecionados : null)}
          />
          <Text style={styles.rodape}>
            Um resumo dos últimos {periodo} dias para levar à consulta: tratamentos em curso,
            adesão e compromissos.
          </Text>
          {erroDoPdf !== null ? <Dica>{erroDoPdf}</Dica> : null}
        </View>

        <BottomSheet
          visible={selecionando}
          onClose={() => setSelecionando(false)}
          title="Medicamentos no relatório"
        >
          <View style={styles.folha}>
            {/* O aviso vem antes da lista, e não depois: quem já desmarcou tudo e está saindo do
                popup não volta para ler um rodapé. Um relatório parcial afirma menos do que
                parece, e é o cabeçalho do PDF que vai dizer isso ao médico. */}
            <Dica>
              Um relatório com parte dos tratamentos não descreve a adesão completa — o documento
              declara o recorte no cabeçalho.
            </Dica>

            {/* Um atalho só, e não o par "todos / limpar": desmarcar tudo produz um relatório sem
                nenhum tratamento, que não é um estado que alguém queira alcançar de propósito. */}
            {selecionados.length > 0 ? (
              <View style={styles.folhaAcoes}>
                <View style={styles.folhaAcao}>
                  <Button
                    variant="text"
                    emFolha
                    label="Incluir todos"
                    onPress={() => setSelecionados([])}
                  />
                </View>
              </View>
            ) : null}

            {medicamentos.map((medicamento) => {
              // Lista vazia = todos, então nenhum item aparece desmarcado no estado padrão. É o que
              // faz "todos" e "cada um marcado à mão" serem a mesma coisa na tela e coisas
              // diferentes no cabeçalho do PDF.
              const marcado =
                selecionados.length === 0 || selecionados.includes(medicamento.id);
              return (
                <View key={medicamento.id} style={styles.folhaItem}>
                  <Checkbox
                    checked={marcado}
                    onChange={() => alternar(medicamento.id)}
                    label={medicamento.nome}
                    accessibilityLabel={medicamento.nome}
                  />
                </View>
              );
            })}

            <Button label="Pronto" onPress={() => setSelecionando(false)} />
          </View>
        </BottomSheet>
      </ScrollView>
    </SafeAreaView>
  );
}
