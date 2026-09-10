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
  type OpcaoDeOrdem,
  SeletorDeOrdem,
} from "@/ui";

import { alturaDaBarra, criarEstilos } from "./AdesaoScreen.styles";

const OPCOES_DE_PERIODO: OpcaoDeOrdem<string>[] = PERIODOS_DE_ADESAO.map((periodo) => ({
  value: String(periodo.dias),
  label: periodo.label,
}));

/** `0.87` → `"87%"`. Arredonda para o inteiro: a precisão decimal aqui é falsa. */
function percentual(taxa: number): string {
  return `${Math.round(taxa * 100)}%`;
}

/**
 * Governa só a cor da taxa. Os cortes vêm da literatura de adesão: 80% é o limiar clássico de
 * tratamento aderente, abaixo de 50% a adesão é tida como pobre.
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

function ColunaDeDia({ item }: { item: AdesaoDeUmDia }) {
  const styles = useEstilos(criarEstilos);
  const quando = dataDoDia(item.dia);

  return (
    <View style={styles.diaColuna}>
      {/* Traço, e não "0%": dia sem dose é ausência do que medir. */}
      {item.taxa === null ? (
        <Text style={styles.diaSemDado}>-</Text>
      ) : (
        <Text style={styles.diaValor} numberOfLines={1}>
          {Math.round(item.taxa * 100)}
          {/* Aninhado para o `%` seguir a mesma linha de base e encolher junto. */}
          <Text style={styles.diaValorUnidade}>%</Text>
        </Text>
      )}

      {/* `justifyContent: flex-end` na coluna faz a barra crescer de baixo para cima. */}
      <View style={styles.diaTrilho}>
        {item.taxa === null ? (
          // Traço fino distingue "não havia dose" do 0%, que é barra rasa.
          <View style={styles.diaBarraVazia} />
        ) : (
          <View
            style={[
              styles.diaBarra,
              item.ehHoje && styles.diaBarraHoje,
              // Mínimo de 3px: 0% precisa aparecer, senão lê como "não havia dose".
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
 * Histórico e taxa de adesão, o que o paciente leva ao médico.
 *
 * A tela não julga: sem "parabéns", sem alerta por adesão baixa, sem meta. Elogiar ou repreender
 * convida a corrigir o registro em vez do tratamento, e é o que destruiria o valor do número.
 */
export function AdesaoScreen() {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const router = useRouter();
  const [periodo, setPeriodo] = useState<PeriodoDeAdesao>(30);
  const { resumo, perdidas, porDia, isLoading, error, reload } = useAdherenceReport(periodo);
  const { gerar, gerando, erro: erroDoPdf, medicamentos, compromissos } = useRelatorioPdf();

  /**
   * Quais medicamentos entram no relatório. **Lista vazia = todos**, e é o padrão: guardada assim,
   * um remédio cadastrado depois entra no relatório sozinho.
   */
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [selecionando, setSelecionando] = useState(false);

  function alternar(id: string) {
    setSelecionados((atual) => {
      // Vazio significa "todos": o primeiro toque materializa a lista completa para tirar um item
      // dela, senão desmarcar um deixaria a lista com um só.
      const base = atual.length === 0 ? medicamentos.map((m) => m.id) : atual;
      const proximo = base.includes(id) ? base.filter((outro) => outro !== id) : [...base, id];

      // Desmarcar o último devolve ao padrão: um PDF sem tratamento nenhum é um beco.
      if (proximo.length === 0) return [];
      // Marcar todos equivale a não filtrar, e precisa ser gravado assim para o cabeçalho do PDF
      // não declarar um recorte que não existe.
      return proximo.length === medicamentos.length ? [] : proximo;
    });
  }

  /**
   * Só "Todos" aparece, porque é o estado implícito: quem nunca abriu o seletor precisa saber que
   * o relatório leva tudo. O resto se descobre abrindo o popup.
   */
  const resumoDaSelecao =
    medicamentos.length === 0
      ? "Nenhum"
      : selecionados.length === 0
        ? "Todos"
        : "";

  /** O mesmo estado por extenso: quem ouve a tela não vê o popup antes de abrir. */
  const selecaoFalada =
    medicamentos.length === 0
      ? "nenhum medicamento cadastrado"
      : selecionados.length === 0
        ? "todos"
        : `${selecionados.length} de ${medicamentos.length}`;

  /**
   * Estado separado de propósito: o app não guarda vínculo entre consulta e medicamento, e a
   * relação existe só na cabeça de quem monta o relatório.
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

  /** Mesma regra da linha de medicamentos, acima. */
  const resumoDosCompromissos =
    compromissos.length === 0
      ? "Nenhum"
      : compromissosEscolhidos.length === 0
        ? "Todos"
        : "";

  const compromissosFalados =
    compromissos.length === 0
      ? "nenhum compromisso cadastrado"
      : compromissosEscolhidos.length === 0
        ? "todos"
        : `${compromissosEscolhidos.length} de ${compromissos.length}`;

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  if (isLoading) return <CenteredLoader />;

  // A tela inteira vira o erro: um seletor de período sobre uma taxa que não carregou ofereceria
  // escolhas que não mudam nada.
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
        <SeletorDeOrdem
          value={String(periodo)}
          onChange={(valor) => setPeriodo(Number(valor) as PeriodoDeAdesao)}
          options={OPCOES_DE_PERIODO}
          descreverOpcao={(label) => `Mostrar os últimos ${label}`}
        />

        {/* Sem dose vencida não há taxa: "0%" seria leitura errada de quem acabou de cadastrar. */}
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
              <Text style={[styles.destaqueTaxa, styles.destaqueTaxaTexto]}>
                {percentual(resumo.taxa)}
              </Text>
              <Text style={styles.destaqueLegenda}>
                {resumo.confirmadas} de {resumo.previstas}{" "}
                {resumo.previstas === 1 ? "dose tomada" : "doses tomadas"}
              </Text>
            </View>

            {/* Nunca somadas: para a taxa contam igual, mas "decidi não tomar" e "esqueci" pedem
                condutas diferentes na consulta. */}
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
                {/* Do pior para o melhor: a lista existe para achar onde o tratamento falha. */}
                {resumo.porMedicamento.map((item) => (
                  <LinhaDeMedicamento key={item.medicationId} item={item} />
                ))}
              </View>
            ) : null}

            {/* Sempre sete dias, mesmo com 30 ou 90 escolhido acima: "qual dia falhou" só se
                responde enquanto a pessoa lembra do dia. A janela é de leitura, não de retenção. */}
            {porDia.some((dia) => dia.previstas > 0) ? (
              <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>Seus últimos sete dias</Text>
                {/* Um cartão com sete colunas: a leitura que interessa é a comparação entre dias. */}
                <View style={styles.diaFaixa}>
                  {porDia.map((dia) => (
                    <ColunaDeDia key={dia.dia} item={dia} />
                  ))}
                </View>
              </View>
            ) : null}

            {/* Dobrada: quem tem adesão baixa é quem tem mais linhas aqui, e aberta a lista
                empurrava a tabela e o botão do PDF para longe. A contagem fica no título. */}
            {perdidas.length > 0 ? (
              <View style={styles.secao}>
                <Accordion
                  // Superfície de cartão: o fundo padrão do acordeão some numa tela de cartões.
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

            {/* Um número que não se explica não serve para decisão clínica. */}
            <Text style={styles.rodape}>
              A adesão considera as doses cujo horário já passou. As de hoje ainda por vir não
              entram na conta.
            </Text>
          </>
        )}

        {/* Fora do `if` da taxa de propósito: um relatório de tratamentos em curso serve na
            consulta mesmo quando nenhuma dose venceu ainda. */}
        <View style={styles.divisorDeEscopo} />

        <View style={styles.secaoDeExportar}>
          <View style={styles.exportarTopo}>
            <Text style={styles.exportarTitulo}>Seu relatório de adesão</Text>
            <Text style={styles.exportarDescricao}>
              Um PDF com seus tratamentos, a adesão do período e os compromissos.
            </Text>
          </View>

          {/* O mesmo estado do seletor do topo: quem rolou até aqui não o vê mais, e o relatório
              sai com o período escolhido. */}
          <View style={styles.periodoDoRelatorio}>
            <Text style={styles.periodoRotulo}>Período do relatório</Text>
            <SeletorDeOrdem
              value={String(periodo)}
              options={OPCOES_DE_PERIODO}
              onChange={(valor) => setPeriodo(Number(valor) as PeriodoDeAdesao)}
              descreverOpcao={(label) => `Relatório dos últimos ${label}`}
            />
          </View>

          <View style={styles.gruposDoRelatorio}>
          {/* Os dois seletores aparecem sempre, mesmo com um item só ou nenhum: sem eles a pessoa
              só descobre o que o documento leva depois de abrir o PDF. */}
          {medicamentos.length > 0 ? (
            <Pressable
              style={estadoDePressao(styles.filtro)}
              onPress={() => setSelecionando(true)}
              accessibilityRole="button"
              accessibilityLabel={`Medicamentos do relatório: ${selecaoFalada}. Toque para escolher.`}
            >
              <View style={styles.filtroTexto}>
                <Text style={styles.filtroRotulo} numberOfLines={1}>
                  Medicamentos no relatório
                </Text>
                <Text style={styles.filtroValor} numberOfLines={1}>
                  {resumoDaSelecao}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={cores.onSurfaceVariant} />
            </Pressable>
          ) : (
            // Sem nada cadastrado a linha continua, mas não abre: não há lista a mostrar.
            <View style={[styles.filtro, styles.filtroVazio]}>
              <View style={styles.filtroTexto}>
                <Text style={styles.filtroRotulo} numberOfLines={1}>
                  Medicamentos no relatório
                </Text>
                <Text style={styles.filtroValor} numberOfLines={1}>
                  {resumoDaSelecao}
                </Text>
              </View>
            </View>
          )}

          {compromissos.length > 0 ? (
            <Pressable
              style={estadoDePressao(styles.filtro)}
              onPress={() => setEscolhendoCompromissos(true)}
              accessibilityRole="button"
              accessibilityLabel={`Compromissos do relatório: ${compromissosFalados}. Toque para escolher.`}
            >
              <View style={styles.filtroTexto}>
                <Text style={styles.filtroRotulo} numberOfLines={1}>
                  Compromissos no relatório
                </Text>
                <Text style={styles.filtroValor} numberOfLines={1}>
                  {resumoDosCompromissos}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={cores.onSurfaceVariant} />
            </Pressable>
          ) : (
            <View style={[styles.filtro, styles.filtroVazio]}>
              <View style={styles.filtroTexto}>
                <Text style={styles.filtroRotulo} numberOfLines={1}>
                  Compromissos no relatório
                </Text>
                <Text style={styles.filtroValor} numberOfLines={1}>
                  {resumoDosCompromissos}
                </Text>
              </View>
            </View>
          )}
          </View>

          <Button
            label="Gerar PDF"
            // O rótulo visível não repete o período: mudaria de largura a cada troca. Quem usa
            // leitor de tela recebe o período aqui.
            accessibilityLabel={`Gerar PDF dos últimos ${periodo} dias`}
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
            {/* Antes da lista: quem desmarcou tudo e está saindo não volta para ler um rodapé. */}
            <Dica>
              Um relatório com parte dos tratamentos não descreve a adesão completa. O documento
              declara o recorte no cabeçalho.
            </Dica>

            {/* Sem o par "limpar": desmarcar tudo produz um relatório sem tratamento nenhum. */}
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
              // Lista vazia = todos, então nada aparece desmarcado no estado padrão.
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

        {/* Sem o aviso de recorte que o outro tem: deixar uma consulta de fora não distorce
            nenhum número, já que a adesão é das doses. */}
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
                    /* A data entra no rótulo: duas consultas com o mesmo título só se distinguem
                       por ela. */
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
