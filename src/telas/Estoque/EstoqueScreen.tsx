import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { recountChange, restockChange } from "@/domain/use-cases/adjust-stock";
import type { StockDepletion } from "@/domain/use-cases/estimate-stock-depletion";
import type { InventoryItem } from "@/domain/entities/inventory-item";
import {
  aplicarMudancaDeEstoque,
  ordenarEstoques,
  salvarAvisoDeEstoqueBaixo,
  useInventoryList,
  type ItemDeEstoque,
  type OrdemDeEstoque,
} from "@/hooks/use-inventory-list";
import { formatDecimalInput, formatIntegerInput, parseDecimalInput } from "@/shared/number-input";
import { formatarNumero, formatarQuantidadeLivre } from "@/shared/rotulos-de-medicamento";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import {
  BottomSheet,
  Button,
  CenteredLoader,
  Checkbox,
  EstadoDeErro,
  EstadoVazio,
  Header,
  OptionGroup,
  SearchField,
  SeletorDeOrdem,
  TextField,
  type OpcaoDeOrdem,
  type OptionGroupOption,
} from "@/ui";
import { criarEstilos } from "./EstoqueScreen.styles";

/**
 * Minúsculas e sem acento, pra "acido folico" achar "Ácido fólico" — a mesma regra da lista de
 * medicações, porque é a mesma pessoa procurando o mesmo remédio.
 */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const MESES_CURTOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** `"2026-09-12"` → `"12 de set"`. Escrito à mão porque `new Date(iso)` leria como UTC. */
function diaEMesDoIso(isoDay: string): string {
  const [, mes, dia] = isoDay.split("-").map(Number);
  return `${dia} de ${MESES_CURTOS[mes - 1]}`;
}

/**
 * A frase que o número de estoque vira. O que interessa não é a quantidade — é quanto tempo ela
 * ainda dá, porque é isso que decide se dá pra esperar a próxima ida à farmácia.
 */
function resumirPrevisao(quantity: number, depletion: StockDepletion | null): string {
  if (quantity === 0) return "Acabou";
  if (depletion === null) return "Sem previsão de término";
  if (depletion.daysRemaining <= 0) return "Acaba hoje";
  if (depletion.daysRemaining === 1) return "Acaba amanhã";
  return `Acaba em ${depletion.daysRemaining} dias · ${diaEMesDoIso(depletion.lastDay)}`;
}

/** Vermelho é pro que já acabou ou acaba hoje; o resto é informação, não alarme. */
function previsaoEhCritica(quantity: number, depletion: StockDepletion | null): boolean {
  return quantity === 0 || (depletion !== null && depletion.daysRemaining <= 0);
}

/**
 * Quando não há prazo configurado: uma semana é o intervalo em que uma ida à farmácia ainda cabe
 * sem pressa.
 */
const DIAS_DE_ALERTA_PADRAO = 7;

/**
 * Acaba nos próximos dias: nem alarme, nem informação neutra.
 *
 * Sem este meio-termo, "acaba em 3 dias" era pintado igual a "acaba em 90" — e a diferença entre os
 * dois é justamente o que a pessoa veio a esta tela descobrir. O vermelho continua reservado ao que
 * já não dá pra resolver a tempo, para não gastar o alarme no que ainda tem solução.
 *
 * A janela é a que **a própria pessoa configurou** no cadastro daquele remédio (`Avisar com N dias
 * de antecedência`), e não um número igual pra todos: quem pediu aviso com 30 dias tem motivo — uma
 * receita que precisa ser renovada, um remédio que a farmácia encomenda —, e pintar de âmbar só no
 * sétimo dia contradiria o que ela mesma definiu como "está acabando".
 */
function previsaoEhAlerta(item: ItemDeEstoque): boolean {
  const { inventory, depletion } = item;
  if (inventory.quantity === 0 || depletion === null) return false;

  const janela =
    inventory.lowStockAlertEnabled && inventory.lowStockAlertLeadDays !== null
      ? inventory.lowStockAlertLeadDays
      : DIAS_DE_ALERTA_PADRAO;

  return depletion.daysRemaining > 0 && depletion.daysRemaining <= janela;
}

/** O estado do aviso em uma frase — o que a linha do card mostra sem precisar abrir o popup. */
function rotuloDoAviso(inventory: InventoryItem): string {
  if (!inventory.lowStockAlertEnabled || inventory.lowStockAlertLeadDays === null) {
    return "Sem aviso de estoque baixo";
  }
  const dias = inventory.lowStockAlertLeadDays;
  return `Avisar ${dias} ${dias === 1 ? "dia" : "dias"} antes de acabar`;
}

/** As mesmas quatro do cadastro (`ConfiguracaoDeEstoque`): é a mesma escolha, nos mesmos termos. */
const LEAD_DAYS_OPTIONS: OptionGroupOption<string>[] = [
  { value: "3", label: "3 dias" },
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
];

/** Urgência primeiro: é a pergunta que traz a pessoa a esta tela. */
const ORDENS_DE_ESTOQUE: OpcaoDeOrdem<OrdemDeEstoque>[] = [
  { value: "urgencia", label: "Acaba primeiro", icon: "alarm-outline" },
  { value: "quantidade", label: "Menos na caixa", icon: "cube-outline" },
  { value: "alfabetica", label: "A–Z", icon: "text-outline" },
];

type ItemDeEstoqueProps = {
  item: ItemDeEstoque;
  onRecontar: () => void;
  onRepor: () => void;
  onConfigurarAviso: () => void;
};

function CartaoDeEstoque({ item, onRecontar, onRepor, onConfigurarAviso }: ItemDeEstoqueProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const { inventory, medication, depletion } = item;
  const critico = previsaoEhCritica(inventory.quantity, depletion);
  const alerta = previsaoEhAlerta(item);

  return (
    <View style={styles.item}>
      {/* O nome ocupa a linha inteira, e abaixo dele um traço separa quem é o remédio do que se
          sabe sobre o estoque dele — a única divisão do cartão, porque os dados abaixo são todos do
          mesmo assunto.

          Antes o nome dividia a largura com a quantidade, que na tipografia de título é larga ("30
          comprimidos"): sobrava pouco para ele, e as três informações quebravam em várias linhas
          cada. */}
      <Text style={styles.name} numberOfLines={1}>
        {medication.name}
      </Text>
      <View style={styles.divisor} />

      {/* Local e estoque na mesma estilização: são dois dados do mesmo tipo — o que se sabe sobre
          aquela caixa —, e dar fundo a um deles fazia o outro parecer secundário.

          O rótulo antes de cada um é o que os torna legíveis sem contexto: "Gaveta da geladeira"
          solto lia como parte do nome do remédio, e o número sozinho não dizia de quê. */}
      <View style={styles.dados}>
        {inventory.storageLocation !== null && inventory.storageLocation.length > 0 ? (
          <Text style={styles.local} numberOfLines={1}>
            <Text style={styles.rotulo}>Local: </Text>
            {inventory.storageLocation}
          </Text>
        ) : null}
        <Text style={[styles.quantidade, critico && styles.quantidadeCritica]} numberOfLines={1}>
          <Text style={styles.rotulo}>Estoque: </Text>
          {formatarQuantidadeLivre(inventory.quantity, inventory.unit)}
        </Text>
      </View>

      {/* O prazo, à parte: quanto resta é um fato contado, quando acaba é uma projeção feita em
          cima do ritmo do tratamento. Junto dos outros dados, a estimativa ganharia o peso de um
          número conferido.

          Três estados, porque a mesma frase pede reações diferentes: cinza enquanto o prazo é
          confortável, âmbar quando entra na janela de reposição, vermelho quando já acabou. */}
      <Text
        style={[
          styles.previsao,
          (alerta || critico) && styles.previsaoEtiqueta,
          alerta && styles.previsaoEmAlerta,
          critico && styles.previsaoCritica,
        ]}>
        {resumirPrevisao(inventory.quantity, depletion)}
      </Text>

      {/* Duas ações porque são duas coisas diferentes no mundo: contar o que já está em casa e
          somar o que acabou de chegar. Uma só, "corrigir", faria a pessoa fazer a conta de cabeça
          toda vez que voltasse da farmácia. */}
      <View style={styles.acoes}>
        <Pressable
          style={estadoDePressao(styles.acao, { escala: true })}
          onPress={onRecontar}
          accessibilityRole="button"
          accessibilityLabel={`Recontar o estoque de ${medication.name}`}>
          <Ionicons name="calculator-outline" size={18} color={cores.onSurface} />
          <Text style={styles.acaoTexto}>Recontar</Text>
        </Pressable>
        <Pressable
          style={estadoDePressao([styles.acao, styles.acaoPrimaria], { escala: true })}
          onPress={onRepor}
          accessibilityRole="button"
          accessibilityLabel={`Repor o estoque de ${medication.name}`}>
          <Ionicons name="add-circle-outline" size={18} color={cores.onPrimaryContainer} />
          <Text style={[styles.acaoTexto, styles.acaoTextoPrimaria]}>Repor</Text>
        </Pressable>
      </View>

      {/* O aviso de estoque baixo, editável aqui e não só no cadastro.

          Quem entra em "Gerenciar estoques" para mudar quando o app avisa procura por isto nesta
          tela — e, sem a linha, não encontrava: o ajuste só existia dentro do formulário do
          medicamento. A tela ainda por cima já mostrava o efeito dele (é o que decide a etiqueta
          âmbar do prazo), o que deixava a pergunta "por que este está âmbar?" sem resposta ao
          alcance.

          Terceira linha e não terceiro botão ao lado dos outros dois: "Recontar" e "Repor" dividem
          a largura em dois, e um terceiro espremeria os rótulos — que já são o que corta primeiro
          com a fonte do sistema ampliada. Aqui ela também tem espaço para dizer o estado atual em
          vez de só oferecer a ação. */}
      <Pressable
        style={estadoDePressao(styles.linhaDeAviso, { superficie: true })}
        onPress={onConfigurarAviso}
        accessibilityRole="button"
        accessibilityLabel={`Configurar o aviso de estoque baixo de ${medication.name}. ${rotuloDoAviso(inventory)}`}>
        <Ionicons
          name={inventory.lowStockAlertEnabled ? "notifications" : "notifications-off-outline"}
          size={16}
          color={cores.onSurfaceVariant}
        />
        <Text style={styles.linhaDeAvisoTexto} numberOfLines={1}>
          {rotuloDoAviso(inventory)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={cores.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}

/** Qual popup está aberto e sobre qual estoque. `null` = nenhum. */
type Edicao = { item: ItemDeEstoque; modo: "recontagem" | "reposicao" };

export function EstoqueScreen() {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const router = useRouter();
  const { items, aRecontar, isLoading, error, reload } = useInventoryList();
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  const [valor, setValor] = useState("");
  const [ordem, setOrdem] = useState<OrdemDeEstoque>("urgencia");
  const [busca, setBusca] = useState("");
  /** Qual estoque está com o aviso aberto, e o que já foi escolhido dentro do popup. */
  const [aviso, setAviso] = useState<{
    item: ItemDeEstoque;
    habilitado: boolean;
    dias: string | null;
  } | null>(null);

  const termo = normalizar(busca.trim());
  // Nome e princípio ativo, como na lista de medicações: é a mesma pessoa procurando o mesmo
  // remédio, e quem tem a caixa na mão às vezes lembra do "losartana" e não do nome comercial.
  const encontrados =
    termo.length === 0
      ? items
      : items.filter(
          (item) =>
            normalizar(item.medication.name).includes(termo) ||
            normalizar(item.medication.activeIngredient).includes(termo),
        );
  const visiveis = ordenarEstoques(encontrados, ordem);

  function abrir(item: ItemDeEstoque, modo: Edicao["modo"]) {
    setEdicao({ item, modo });
    // Nunca pré-preenchido com a quantidade atual: um número já ali é o que quem tem pressa
    // confirma sem ler, e aí a recontagem grava exatamente o que não foi contado.
    setValor("");
  }

  /** Abre o popup do aviso já refletindo o que está gravado para aquele estoque. */
  function abrirAviso(item: ItemDeEstoque) {
    setAviso({
      item,
      habilitado: item.inventory.lowStockAlertEnabled,
      dias:
        item.inventory.lowStockAlertLeadDays === null
          ? null
          : String(item.inventory.lowStockAlertLeadDays),
    });
  }

  async function confirmarAviso() {
    if (aviso === null) return;
    const alvo = aviso;
    setAviso(null);
    try {
      await salvarAvisoDeEstoqueBaixo(alvo.item.inventory.id, {
        habilitado: alvo.habilitado,
        diasDeAntecedencia: alvo.dias === null ? null : Number(alvo.dias),
      });
      await reload();
    } catch (cause) {
      Alert.alert(
        "Não foi possível salvar o aviso",
        cause instanceof Error ? cause.message : "Tente novamente em instantes.",
      );
    }
  }

  function voltarParaMedicacoes() {
    if (router.canGoBack()) router.back();
    else router.replace("/remedios");
  }

  const digitado = valor.trim().length === 0 ? null : parseDecimalInput(valor);
  const mudanca =
    edicao === null || digitado === null
      ? null
      : edicao.modo === "recontagem"
        ? recountChange(edicao.item.inventory.quantity, digitado)
        : restockChange(digitado);

  async function confirmar() {
    if (edicao === null || mudanca === null) return;
    const alvo = edicao;
    setEdicao(null);
    try {
      await aplicarMudancaDeEstoque(alvo.item.inventory.id, mudanca);
      await reload();
    } catch (cause) {
      Alert.alert(
        "Não foi possível atualizar o estoque",
        cause instanceof Error ? cause.message : "Tente novamente em instantes.",
      );
    }
  }

  if (isLoading) return <CenteredLoader />;

  const unidade = edicao?.item.inventory.unit ?? "";
  const aceitaFracao = edicao?.item.aceitaFracao ?? true;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Estoque" onBack={voltarParaMedicacoes} />

      <View style={styles.header}>
        {/* A mesma busca da lista de medicações, pelo mesmo motivo: passado um punhado de itens,
            rolar para achar um remédio específico custa mais que digitar três letras. */}
        {items.length > 0 ? (
          <>
            <SearchField
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome ou princípio ativo"
              style={styles.busca}
            />
            <Text style={styles.contagem}>
              {termo.length > 0
                ? `${visiveis.length} de ${items.length} ${items.length === 1 ? "medicação" : "medicações"}`
                : `${items.length} ${items.length === 1 ? "medicação com estoque" : "medicações com estoque"}`}
            </Text>

            {items.length > 1 ? (
              <SeletorDeOrdem value={ordem} onChange={setOrdem} options={ORDENS_DE_ESTOQUE} />
            ) : null}
          </>
        ) : null}
      </View>

      {error !== null ? (
        <EstadoDeErro mensagem={error} onTentarDeNovo={() => void reload()} />
      ) : (
        <FlatList
          data={visiveis}
          keyExtractor={(item) => item.inventory.id}
          renderItem={({ item }) => (
            <CartaoDeEstoque
              item={item}
              onRecontar={() => abrir(item, "recontagem")}
              onRepor={() => abrir(item, "reposicao")}
              onConfigurarAviso={() => abrirAviso(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          /**
           * As mesmas duas props da lista de medicações, e pela mesma razão: esta tela tem campo de
           * busca mas não é formulário, então não passa pelo `KeyboardAwareScrollView` e ficaria sem
           * saída para o teclado. Arrastar a lista dispensa, e `handled` faz o primeiro toque em
           * "Repor" valer em vez de ser gasto só fechando o teclado.
           */
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          /**
           * O lembrete de conferência, quando há algum estoque parado há mais de um mês.
           *
           * **Aqui e não na Home**, e sem notificação: conferir uma caixa é tarefa que se faz de
           * pé na frente do armário, não algo que justifique interromper o dia. Quem abre esta
           * tela já está pensando em estoque — é o único momento em que a pergunta chega na hora
           * certa. Some sozinho quando não há nada a perguntar, que é o caso comum.
           */
          ListHeaderComponent={
            aRecontar.length > 0 ? (
              <View style={styles.lembrete}>
                <View style={styles.lembreteTopo}>
                  <Ionicons name="help-circle" size={20} color={cores.onWarningSurface} />
                  <Text style={styles.lembreteTitulo}>Vale conferir a caixa</Text>
                </View>
                {/* Uma frase, não três: quem lê isto está de pé na frente do armário. O "por quê"
                    (a estimativa envelhece) cabia no texto longo, mas custava a leitura toda vez —
                    e a ação pedida é a mesma sabendo ou não o motivo. */}
                <Text style={styles.lembreteTexto}>
                  {aRecontar.length === 1
                    ? `${aRecontar[0].medicationName}: ${aRecontar[0].diasSemConferir} dias sem conferir.`
                    : `${aRecontar.length} medicações há mais de um mês sem conferir.`}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            // Busca sem resultado e lista vazia pedem respostas diferentes: uma se resolve mudando
            // o que foi digitado, a outra ligando o controle no cadastro de alguma medicação.
            termo.length > 0 ? (
              <EstadoVazio
                icone="search"
                titulo="Nenhuma medicação encontrada"
                descricao={`Nada com estoque controlado combina com “${busca.trim()}”. Confira a escrita ou busque pelo princípio ativo.`}
              />
            ) : (
              <EstadoVazio
                icone="cube"
                titulo="Nenhum estoque controlado"
                descricao="O controle de estoque é opcional e se liga no cadastro de cada medicação."
              />
            )
          }
          // O rodapé é o único lugar onde um remédio sem controle de estoque aparece — como
          // caminho, não como linha na lista. Listá-lo aqui misturaria o que tem número com o
          // que não tem, e a tela existe justamente pra comparar números.
          //
          // Só o botão: o título e o parágrafo explicavam onde se liga o controle de estoque, mas
          // quem quer isso vai à medicação de qualquer jeito, e o botão já leva lá.
          ListFooterComponent={
            <View style={styles.rodape}>
              <Button
                label="Ver minhas medicações"
                variant="outline"
                onPress={voltarParaMedicacoes}
              />
            </View>
          }
        />
      )}

      <BottomSheet
        visible={edicao !== null}
        onClose={() => setEdicao(null)}
        title={edicao?.modo === "reposicao" ? "Repor estoque" : "Recontar estoque"}>
        <View style={styles.sheetBody}>
          {edicao !== null ? (
            <>
              <Text style={styles.sheetMedicamento}>{edicao.item.medication.name}</Text>
              <Text style={styles.sheetAtual}>
                {`Hoje o app conta ${formatarQuantidadeLivre(edicao.item.inventory.quantity, unidade)}.`}
              </Text>

              <TextField
                label={
                  edicao.modo === "reposicao" ? "QUANTO VOCÊ ADICIONOU" : "QUANTO VOCÊ TEM AGORA"
                }
                placeholder="Ex: 30"
                value={valor}
                onChangeText={(raw) =>
                  setValor(aceitaFracao ? formatDecimalInput(raw) : formatIntegerInput(raw))
                }
                keyboardType={aceitaFracao ? "decimal-pad" : "number-pad"}
                maxLength={8}
              />

              {/* O resultado antes de confirmar. Sem isto, recontar é digitar um número e torcer
                  — e a diferença gravada é justamente o que a pessoa não vê acontecer. */}
              <Text style={styles.sheetPrevia}>{previaDaMudanca(edicao, digitado, unidade)}</Text>

              <Button label="Confirmar" onPress={confirmar} disabled={mudanca === null} />
            </>
          ) : null}
        </View>
      </BottomSheet>

      {/* O aviso de estoque baixo. Mesmas opções e mesma ordem do cadastro (`ConfiguracaoDeEstoque`)
          — é a mesma decisão, e vê-la escrita de dois jeitos diferentes faria duvidar se são a
          mesma coisa. O componente de lá não é reaproveitado inteiro porque ele carrega os campos
          de quantidade e local, que aqui já têm caminho próprio em "Repor" e "Recontar". */}
      <BottomSheet
        visible={aviso !== null}
        onClose={() => setAviso(null)}
        title="Aviso de estoque baixo">
        <View style={styles.sheetBody}>
          {aviso !== null ? (
            <>
              <Text style={styles.sheetMedicamento}>{aviso.item.medication.name}</Text>

              {/* Escolha explícita, nunca ligado sozinho — a mesma regra do cadastro. */}
              <Checkbox
                checked={aviso.habilitado}
                onChange={(habilitado) => setAviso({ ...aviso, habilitado })}
                label="Me avisar quando estiver acabando"
                accessibilityLabel="Me avisar quando o estoque estiver acabando"
              />

              {aviso.habilitado ? (
                <OptionGroup
                  label="COM QUANTA ANTECEDÊNCIA"
                  value={aviso.dias}
                  options={LEAD_DAYS_OPTIONS}
                  onChange={(dias) => setAviso({ ...aviso, dias })}
                />
              ) : null}

              {/* A consequência do que foi escolhido, contra o estoque real de hoje: pedir aviso com
                  30 dias tendo 5 de estoque é um alerta que nunca chega na hora prometida. */}
              {conflitoDeAntecedencia(aviso.item, aviso.habilitado, aviso.dias) ? (
                <Text style={styles.sheetConflito}>
                  {`Seu estoque atual dura cerca de ${aviso.item.depletion?.daysRemaining} ${aviso.item.depletion?.daysRemaining === 1 ? "dia" : "dias"}, então um aviso com essa antecedência chegaria imediatamente.`}
                </Text>
              ) : null}

              <Button
                label="Salvar"
                onPress={confirmarAviso}
                // Ligado sem antecedência não tem quando disparar — é o mesmo bloqueio do cadastro.
                disabled={aviso.habilitado && aviso.dias === null}
              />
            </>
          ) : null}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

/** Antecedência maior que o estoque que resta: o aviso nasceria já vencido. */
function conflitoDeAntecedencia(
  item: ItemDeEstoque,
  habilitado: boolean,
  dias: string | null,
): boolean {
  if (!habilitado || dias === null || item.depletion === null) return false;
  return Number(dias) >= item.depletion.daysRemaining;
}

/**
 * O que vai acontecer, em uma frase. Fica fora do componente porque é decisão de texto e não de
 * layout, e porque são quatro casos que ficariam ilegíveis encadeados dentro do JSX.
 */
function previaDaMudanca(edicao: Edicao, digitado: number | null, unidade: string): string {
  const atual = edicao.item.inventory.quantity;
  if (digitado === null || !Number.isFinite(digitado)) {
    return edicao.modo === "reposicao"
      ? "Informe quanto entrou de novo — o app soma ao que já existe."
      : "Conte o que está em casa e informe o total.";
  }
  if (edicao.modo === "reposicao") {
    if (digitado <= 0) return "Informe uma quantidade maior que zero.";
    return `O estoque passa para ${formatarQuantidadeLivre(atual + digitado, unidade)}.`;
  }
  if (digitado === atual) return "É exatamente o que o app já conta — nada muda.";
  const diferenca = digitado - atual;
  const verbo = diferenca > 0 ? "a mais" : "a menos";
  return `Diferença de ${formatarNumero(Math.abs(diferenca))} ${verbo}, registrada como recontagem.`;
}
