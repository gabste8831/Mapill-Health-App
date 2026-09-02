import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { recountChange, restockChange } from "@/domain/use-cases/adjust-stock";
import type { StockDepletion } from "@/domain/use-cases/estimate-stock-depletion";
import {
  aplicarMudancaDeEstoque,
  ordenarEstoques,
  useInventoryList,
  type ItemDeEstoque,
  type OrdemDeEstoque,
} from "@/hooks/use-inventory-list";
import { formatDecimalInput, formatIntegerInput, parseDecimalInput } from "@/shared/number-input";
import { formatarNumero, formatarQuantidadeLivre } from "@/shared/rotulos-de-medicamento";
import { colors, estadoDePressao } from "@/shared/theme";
import {
  BottomSheet,
  Button,
  CenteredLoader,
  EstadoDeErro,
  Header,
  SeletorDeOrdem,
  TextField,
  type OpcaoDeOrdem,
} from "@/ui";
import { styles } from "./EstoqueScreen.styles";

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
};

function CartaoDeEstoque({ item, onRecontar, onRepor }: ItemDeEstoqueProps) {
  const { inventory, medication, depletion } = item;
  const critico = previsaoEhCritica(inventory.quantity, depletion);

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={styles.itemHeaderText}>
          <Text style={styles.name}>{medication.name}</Text>
          {inventory.storageLocation !== null && inventory.storageLocation.length > 0 ? (
            <Text style={styles.local}>{inventory.storageLocation}</Text>
          ) : null}
        </View>
        <Text style={[styles.quantidade, critico && styles.quantidadeCritica]}>
          {formatarQuantidadeLivre(inventory.quantity, inventory.unit)}
        </Text>
      </View>

      <Text style={[styles.previsao, critico && styles.previsaoCritica]}>
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
          <Ionicons name="calculator-outline" size={18} color={colors.onSurface} />
          <Text style={styles.acaoTexto}>Recontar</Text>
        </Pressable>
        <Pressable
          style={estadoDePressao([styles.acao, styles.acaoPrimaria], { escala: true })}
          onPress={onRepor}
          accessibilityRole="button"
          accessibilityLabel={`Repor o estoque de ${medication.name}`}>
          <Ionicons name="add-circle-outline" size={18} color={colors.onSecondaryContainer} />
          <Text style={[styles.acaoTexto, styles.acaoTextoPrimaria]}>Repor</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Qual popup está aberto e sobre qual estoque. `null` = nenhum. */
type Edicao = { item: ItemDeEstoque; modo: "recontagem" | "reposicao" };

export function EstoqueScreen() {
  const router = useRouter();
  const { items, aRecontar, isLoading, error, reload } = useInventoryList();
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  const [valor, setValor] = useState("");
  const [ordem, setOrdem] = useState<OrdemDeEstoque>("urgencia");

  const visiveis = ordenarEstoques(items, ordem);

  function abrir(item: ItemDeEstoque, modo: Edicao["modo"]) {
    setEdicao({ item, modo });
    // Nunca pré-preenchido com a quantidade atual: um número já ali é o que quem tem pressa
    // confirma sem ler, e aí a recontagem grava exatamente o que não foi contado.
    setValor("");
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
        <Text style={styles.subtitle}>
          Quanto ainda resta de cada medicação e quando ela deve acabar, no ritmo do seu tratamento.
          A quantidade cai sozinha a cada dose confirmada.
        </Text>

        {items.length > 1 ? (
          <SeletorDeOrdem value={ordem} onChange={setOrdem} options={ORDENS_DE_ESTOQUE} />
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
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
                  <Ionicons name="help-circle" size={20} color={colors.onWarningSurface} />
                  <Text style={styles.lembreteTitulo}>Vale conferir a caixa</Text>
                </View>
                <Text style={styles.lembreteTexto}>
                  {aRecontar.length === 1
                    ? `${aRecontar[0].medicationName} está há ${aRecontar[0].diasSemConferir} dias sem conferência. O número aqui é uma estimativa — abrir a caixa e recontar deixa a previsão de término confiável.`
                    : `${aRecontar.length} medicações estão há mais de um mês sem conferência. O número aqui é uma estimativa — recontar deixa a previsão de término confiável.`}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>Nenhum estoque controlado</Text>
              <Text style={styles.emptyDescription}>
                O controle de estoque é opcional e se liga no cadastro de cada medicação.
              </Text>
            </View>
          }
          // O rodapé é o único lugar onde um remédio sem controle de estoque aparece — como
          // caminho, não como linha na lista. Listá-lo aqui misturaria o que tem número com o
          // que não tem, e a tela existe justamente pra comparar números.
          ListFooterComponent={
            <View style={styles.rodape}>
              <Text style={styles.rodapeTitulo}>Falta alguma medicação nesta lista?</Text>
              <Text style={styles.rodapeTexto}>
                Só aparecem aqui as medicações com controle de estoque ativado. Para ativar em
                alguma que você já cadastrou, abra o cadastro dela e preencha o controle de estoque.
              </Text>
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
    </SafeAreaView>
  );
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
