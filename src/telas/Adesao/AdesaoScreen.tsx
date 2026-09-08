import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  PERIODOS_DE_ADESAO,
  useAdherenceReport,
  type PeriodoDeAdesao,
} from "@/hooks/use-adherence-report";
import { dataEHoraPorExtenso, diaEMesCurto } from "@/shared/datas-por-extenso";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import type { AdesaoDeUmDia } from "@/domain/use-cases/adesao-por-dia";
import type { AdesaoPorMedicamento } from "@/domain/use-cases/resumir-adesao";
import { useRelatorioPdf } from "@/hooks/use-relatorio-pdf";
import {
  BottomSheet,
  Accordion,
  Button,
  CenteredLoader,
  Checkbox,
  Dica,
  EstadoDeErro,
  Header,
  OptionGroup,
  type OptionGroupOption,
} from "@/ui";

import { alturaDaBarra, criarEstilos } from "./AdesaoScreen.styles";

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
  const styles = useEstilos(criarEstilos);

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

/** `"2026-09-05"` → `Date`. Monta por partes: `new Date("2026-09-05")` seria lido como UTC. */
function dataDoDia(dia: string): Date {
  const [ano, mes, data] = dia.split("-").map(Number);
  return new Date(ano, mes - 1, data);
}

/** A inicial do dia da semana: `S D S T Q Q S`, como no gráfico da Home. */
function inicialDaSemana(quando: Date): string {
  return quando.toLocaleDateString("pt-BR", { weekday: "short" }).charAt(0).toUpperCase();
}

/**
 * Um dia da faixa: número em cima, barra no meio, sigla e data embaixo.
 *
 * A barra é a mesma do card semanal da Home — mesma altura, mesma cor, mesma opacidade no dia de
 * hoje — e aqui ela vem **com o número**, que é o que faltava lá. Barra sozinha diz "este dia foi
 * pior"; barra com número diz *quanto* pior. A forma se compara de relance entre as sete colunas, o
 * valor se cita ao médico.
 *
 * Manter os dois desenhos idênticos é deliberado: são o mesmo dado, e dois gráficos diferentes para
 * o mesmo número fariam o leitor procurar uma diferença que não existe.
 *
 * O `%` fica em cada célula, e não só no título: "86" sozinho obriga a pessoa a procurar a unidade
 * em outro lugar da tela para saber o que está lendo. Ele vai menor e colado no número — assim cabe
 * na coluna estreita sem encolher o valor, que é o que de fato se lê.
 */
function ColunaDeDia({ item }: { item: AdesaoDeUmDia }) {
  const styles = useEstilos(criarEstilos);
  const quando = dataDoDia(item.dia);

  return (
    <View style={styles.diaColuna}>
      {/* Traço, e não "0%": dia sem dose não é falha, é ausência do que medir. */}
      {item.taxa === null ? (
        <Text style={styles.diaSemDado}>—</Text>
      ) : (
        <Text style={styles.diaValor} numberOfLines={1}>
          {Math.round(item.taxa * 100)}
          {/* Aninhado, e não um segundo `Text` ao lado: assim o `%` acompanha o número na mesma
              linha de base e encolhe junto, em vez de quebrar para baixo na coluna estreita. */}
          <Text style={styles.diaValorUnidade}>%</Text>
        </Text>
      )}

      {/* `justifyContent: flex-end` na coluna faz a barra crescer de baixo para cima. */}
      <View style={styles.diaTrilho}>
        {item.taxa === null ? (
          // Traço fino, e não barra rasa: "não havia dose" precisa se distinguir de "não tomei
          // nenhuma", que é o 0% logo abaixo.
          <View style={styles.diaBarraVazia} />
        ) : (
          <View
            style={[
              styles.diaBarra,
              item.ehHoje && styles.diaBarraHoje,
              // Mínimo de 3px: 0% precisa aparecer como barra rasa em vez de sumir — um dia zerado é
              // informação, e a coluna vazia leria como o traço de "não havia dose".
              { height: Math.max(3, item.taxa * alturaDaBarra) },
            ]}
          />
        )}
      </View>

      <Text style={[styles.diaSigla, item.ehHoje && styles.diaHojeTexto]} numberOfLines={1}>
        {item.ehHoje ? "hoje" : inicialDaSemana(quando)}
      </Text>
      <Text style={styles.diaData} numberOfLines={1}>
        {diaEMesCurto(quando)}
      </Text>
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
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const router = useRouter();
  const [periodo, setPeriodo] = useState<PeriodoDeAdesao>(30);
  const { resumo, perdidas, porDia, isLoading, error, reload } = useAdherenceReport(periodo);
  const { gerar, gerando, erro: erroDoPdf, medicamentos, compromissos } = useRelatorioPdf();

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
    medicamentos.length === 0
      ? "Nenhum cadastrado"
      : selecionados.length === 0
      ? "Todos"
      : selecionados.length === 1
        ? (medicamentos.find((m) => m.id === selecionados[0])?.nome ?? "1 medicamento")
        : `${selecionados.length} de ${medicamentos.length}`;

  /**
   * A mesma mecânica para os compromissos, e um estado separado.
   *
   * Os dois filtros não se conversam de propósito: o app não guarda vínculo entre consulta e
   * medicamento, e a relação existe na cabeça de quem monta o relatório. Quem vai ao cardiologista
   * sabe quais consultas são do coração — o app não tem como saber, e fingir que sabe seria pior
   * que perguntar.
   */
  const [compromissosEscolhidos, setCompromissosEscolhidos] = useState<string[]>([]);
  const [escolhendoCompromissos, setEscolhendoCompromissos] = useState(false);

  function alternarCompromisso(id: string) {
    setCompromissosEscolhidos((atual) => {
      const base = atual.length === 0 ? compromissos.map((c) => c.id) : atual;
      const proximo = base.includes(id)
        ? base.filter((outro) => outro !== id)
        : [...base, id];
      return proximo.length === compromissos.length ? [] : proximo;
    });
  }

  const resumoDosCompromissos =
    // "Nenhum cadastrado", e não "nenhum no período": o seletor lista **todos** os compromissos, sem
    // recorte de data — quem faz o recorte é o documento, pelo período escolhido logo acima.
    compromissos.length === 0
      ? "Nenhum cadastrado"
      : compromissosEscolhidos.length === 0
      ? "Todos do período"
      : compromissosEscolhidos.length === 1
        ? (compromissos.find((c) => c.id === compromissosEscolhidos[0])?.descricao ??
          "1 compromisso")
        : `${compromissosEscolhidos.length} de ${compromissos.length}`;

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

            {/* Sempre os últimos sete dias, mesmo com 30 ou 90 selecionado acima.

                A taxa do topo diz "como tem sido"; esta lista diz "qual dia falhou", e essa segunda
                pergunta só se responde enquanto a pessoa lembra do dia. Noventa linhas para procurar
                12 de julho não é leitura, é arquivo — e para isso existe o calendário, que mostra o
                dia dose por dose em vez de porcentagem.

                Os dados não expiram: a janela é de leitura, não de retenção. */}
            {porDia.some((dia) => dia.previstas > 0) ? (
              <View style={styles.secao}>
                {/* O título diz a **janela**, não a unidade: o `%` voltou para cada célula, e o que
                    sobra de dúvida aqui é "sete dias de quando" — ainda mais porque esta faixa não
                    acompanha o período escolhido acima. */}
                <Text style={styles.secaoTitulo}>Seus últimos sete dias</Text>
                {/* Um cartão com sete colunas, e não sete cartões: a semana é uma coisa só, e a
                    leitura que interessa é a comparação entre os dias. Mesma forma das sete barras
                    do card da Home, de propósito — quem viu lá reconhece aqui. */}
                <View style={styles.diaFaixa}>
                  {porDia.map((dia) => (
                    <ColunaDeDia key={dia.dia} item={dia} />
                  ))}
                </View>
              </View>
            ) : null}

            {/* Dobrada, e não em lista aberta.

                Quem está com a adesão baixa é quem mais precisa desta tela — e é justamente quem
                tem mais linhas aqui. Aberta, a lista empurrava a tabela por medicamento e o botão
                do PDF para longe, e o efeito colateral era desagradável: a tela devolvia um rolo de
                falhas a quem já sabe que falhou.

                O título carrega a contagem, então o número — que é a informação — se lê sem abrir.
                O detalhe de cada dose fica para quem foi procurá-lo. */}
            {perdidas.length > 0 ? (
              <View style={styles.secao}>
                <Accordion
                  // Superfície de cartão: o fundo padrão do acordeão é quase o da tela, e no meio
                  // de uma tela de cartões ele desaparecia — não dava para ver que ali havia algo
                  // a abrir.
                  style={styles.perdidasBloco}
                  title={
                    perdidas.length === 1
                      ? "1 dose não tomada"
                      : `${perdidas.length} doses não tomadas`
                  }
                  toggleLabel>
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
                </Accordion>
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

        {/* Exportar é outro assunto, e o traço diz isso.

            Tudo acima responde "como tenho ido"; daqui para baixo é levar isso para fora do app. Sem
            a separação, o botão do PDF lia como mais uma linha do relatório — e quem veio buscar o
            documento para a consulta precisava caçá-lo no fim da rolagem.

            Fora do `if` da taxa de propósito: um relatório de tratamentos em curso serve na consulta
            mesmo quando nenhuma dose venceu ainda, e é justamente quem acabou de começar o
            tratamento que costuma ter a próxima consulta marcada. */}
        <View style={styles.divisorDeEscopo} />

        <View style={styles.secaoDeExportar}>
          <View style={styles.exportarTopo}>
            <View style={styles.exportarIcone}>
              <Ionicons name="document-text" size={22} color={cores.onPrimaryContainer} />
            </View>
            <View style={styles.linhaTexto}>
              <Text style={styles.exportarTitulo}>Seu relatório de adesão</Text>
              <Text style={styles.exportarDescricao}>
                Um PDF com seus tratamentos, a adesão do período e os compromissos.
              </Text>
            </View>
          </View>

          {/* O período aparece de novo aqui, e não só no topo da tela.

              Quem rolou até aqui para gerar o documento não vê mais o seletor lá em cima, e o
              relatório sai com o período que estiver escolhido — descobrir isso depois de abrir o
              PDF é tarde. É o mesmo estado dos dois lados: mexer aqui muda a tela toda, e é o que
              se espera de dois controles do mesmo dado. */}
          <OptionGroup
            label="PERÍODO DO RELATÓRIO"
            value={String(periodo)}
            options={OPCOES_DE_PERIODO}
            onChange={(valor) => setPeriodo(Number(valor) as PeriodoDeAdesao)}
          />

          {/* Os dois seletores num grupo só: respondem à mesma pergunta — o que entra no documento
              — e ficam mais perto entre si do que do período e do botão. */}
          <View style={styles.gruposDoRelatorio}>
          {/**
             * Os dois seletores aparecem **sempre**, mesmo sem nada cadastrado e mesmo com um item
             * só.
             *
             * Já foram condicionais — medicamentos a partir de dois, compromissos a partir de um —,
             * e o efeito era a pessoa não saber o que o documento leva. Um relatório com um remédio
             * e nenhuma consulta saía sem nenhuma linha de escolha, e quem o gerava descobria o
             * conteúdo depois de abrir o PDF.
             *
             * Com um item só a escolha existe: "levar" e "não levar" são respostas diferentes, e
             * quem vai a uma consulta de cardiologia pode não querer o remédio de alergia no papel.
             * Sem item nenhum a linha vira informação — ela diz que não há o que incluir, que é o
             * que a pessoa precisa saber antes de gerar.
             */}
          {medicamentos.length > 0 ? (
            <Pressable
              // Linha de largura total: escurece sem encolher.
              style={estadoDePressao(styles.filtro)}
              onPress={() => setSelecionando(true)}
              accessibilityRole="button"
              accessibilityLabel={`Medicamentos do relatório: ${resumoDaSelecao}. Toque para escolher.`}
            >
              {/* A seta é o que diz que a linha abre algo. Sem ela, "MEDICAMENTOS NO RELATÓRIO"
                  com um valor embaixo lê como informação, e não como escolha a fazer — e o seletor
                  de período logo acima, esse sim óbvio, reforçava a leitura errada. */}
              <View style={styles.filtroTexto}>
                <Text style={styles.filtroRotulo}>MEDICAMENTOS NO RELATÓRIO</Text>
                <Text style={styles.filtroValor}>{resumoDaSelecao}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={cores.onSurfaceVariant} />
            </Pressable>
          ) : (
            // Sem nada cadastrado a linha continua ali, mas não abre nada: não há lista a mostrar.
            <View style={[styles.filtro, styles.filtroVazio]}>
              <View style={styles.filtroTexto}>
                <Text style={styles.filtroRotulo}>MEDICAMENTOS NO RELATÓRIO</Text>
                <Text style={styles.filtroValor}>{resumoDaSelecao}</Text>
              </View>
            </View>
          )}

          {/* O mesmo seletor, para as consultas. */}
          {compromissos.length > 0 ? (
            <Pressable
              style={estadoDePressao(styles.filtro)}
              onPress={() => setEscolhendoCompromissos(true)}
              accessibilityRole="button"
              accessibilityLabel={`Compromissos do relatório: ${resumoDosCompromissos}. Toque para escolher.`}
            >
              <View style={styles.filtroTexto}>
                <Text style={styles.filtroRotulo}>COMPROMISSOS NO RELATÓRIO</Text>
                <Text style={styles.filtroValor}>{resumoDosCompromissos}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={cores.onSurfaceVariant} />
            </Pressable>
          ) : (
            <View style={[styles.filtro, styles.filtroVazio]}>
              <View style={styles.filtroTexto}>
                <Text style={styles.filtroRotulo}>COMPROMISSOS NO RELATÓRIO</Text>
                <Text style={styles.filtroValor}>{resumoDosCompromissos}</Text>
              </View>
            </View>
          )}
          </View>

          {/* Azul cheio e com ícone: é a ação que a seção existe para oferecer, e o contorno a
              deixava com o mesmo peso do seletor de medicamentos logo acima. */}
          <Button
            label={`Gerar PDF dos últimos ${periodo} dias`}
            icon={<Ionicons name="download-outline" size={20} color={cores.onPrimary} />}
            loading={gerando}
            onPress={() =>
              void gerar(
                periodo,
                selecionados.length > 0 ? selecionados : null,
                compromissosEscolhidos.length > 0 ? compromissosEscolhidos : null,
              )
            }
          />
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
              Um relatório com parte dos tratamentos não descreve a adesão completa. O documento
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

        {/* O seletor de compromissos, com a mesma mecânica do de medicamentos.

            Sem o aviso de recorte que o outro tem: deixar uma consulta de fora não distorce nenhum
            número — a adesão é das doses, e os compromissos entram como registro do que aconteceu.
            O aviso do PDF fala de tratamentos, e continua falando só deles. */}
        <BottomSheet
          visible={escolhendoCompromissos}
          onClose={() => setEscolhendoCompromissos(false)}
          title="Compromissos no relatório"
        >
          <View style={styles.folha}>
            {compromissosEscolhidos.length > 0 ? (
              <View style={styles.folhaAcoes}>
                <View style={styles.folhaAcao}>
                  <Button
                    variant="text"
                    emFolha
                    label="Incluir todos"
                    onPress={() => setCompromissosEscolhidos([])}
                  />
                </View>
              </View>
            ) : null}

            {compromissos.map((compromisso) => {
              const marcado =
                compromissosEscolhidos.length === 0 ||
                compromissosEscolhidos.includes(compromisso.id);
              return (
                <View key={compromisso.id} style={styles.folhaItem}>
                  <Checkbox
                    checked={marcado}
                    onChange={() => alternarCompromisso(compromisso.id)}
                    /* A data entra no rótulo: duas consultas com o mesmo título ("Retorno
                       cardiologista") só se distinguem por ela. */
                    label={`${compromisso.descricao} (${diaEMesCurto(new Date(compromisso.quando))})`}
                    accessibilityLabel={`${compromisso.descricao}, ${dataEHoraPorExtenso(new Date(compromisso.quando))}`}
                  />
                </View>
              );
            })}

            <Button label="Pronto" onPress={() => setEscolhendoCompromissos(false)} />
          </View>
        </BottomSheet>
      </ScrollView>
    </SafeAreaView>
  );
}
