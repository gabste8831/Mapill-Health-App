import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { excluirMedicamento } from "@/hooks/use-medication-registration";
import {
  ordenarRemedios,
  useMedicationList,
  type ItemDaListaDeRemedios,
  type OrdemDeRemedios,
} from "@/hooks/use-medication-list";
import {
  formatarQuantidadeLivre,
  horariosComDose,
  horariosDaPosologia,
  resumirDose,
  resumirFrequencia,
} from "@/shared/rotulos-de-medicamento";
import { estadoDePressao, useCores, useEstilos } from "@/shared/theme";
import {
  BottomSheet,
  Button,
  CenteredLoader,
  EstadoDeErro,
  EstadoVazio,
  Fab,
  FotoLocal,
  Header,
  SearchField,
  SeletorDeOrdem,
  VisualizadorDeMidia,
  type OpcaoDeOrdem,
} from "@/ui";
import { criarEstilos } from "./RemediosScreen.styles";

/** Alfabética primeiro por ser a que não muda sozinha: a lista fica onde a pessoa deixou. */
const ORDENS_DE_REMEDIO: OpcaoDeOrdem<OrdemDeRemedios>[] = [
  { value: "alfabetica", label: "A–Z", icon: "text-outline" },
  { value: "cadastro", label: "Mais recentes", icon: "time-outline" },
  { value: "estoque", label: "Acabando", icon: "cube-outline" },
];

type ItemDeRemedioProps = {
  item: ItemDaListaDeRemedios;
  onAbrirDetalhe: () => void;
  /** Ausente quando não há tratamento pra editar — o botão fica inerte. */
  onEdit?: () => void;
  onDelete: () => void;
  /** Amplia a foto da caixa. Só chamado quando existe foto. */
  onVerFoto: (uri: string, nome: string) => void;
};

function ItemDeRemedio({ item, onAbrirDetalhe, onEdit, onDelete, onVerFoto }: ItemDeRemedioProps) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const { medication, prescription, inventory } = item;
  const horarios = prescription === null ? [] : horariosDaPosologia(prescription.schedule);

  return (
    <View style={styles.item}>
      {/* O card inteiro (menos a faixa de ações abaixo) abre o detalhe completo — é onde cabe o
          que a lista não tem espaço para mostrar por extenso. */}
      <Pressable
        onPress={onAbrirDetalhe}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhes de ${medication.name}`}>
        <View style={styles.itemHeader}>
          {/**
           * Sem foto, um marcador neutro ocupa o lugar — e **não** iniciais, que repetiriam o nome
           * ao lado.
           *
           * Antes não entrava nada, e a consequência era a lista desalinhar: numa tela onde a
           * maioria não tem foto, o item que tem é que ficava deslocado. O marcador mantém a
           * coluna do nome no mesmo lugar em todos os itens, e o azul claro dá à lista a cor que
           * faltava sem inventar superfície nova.
           */}
          {medication.photoUri !== null ? (
            /* A foto da caixa existe para responder "é este o remédio?", e numa miniatura de 56px
               essa pergunta às vezes não se responde — caixas da mesma família são quase iguais.
               Ampliar é um toque próprio, dentro do card que abre o detalhe: o `Pressable` de
               dentro vence o de fora, então tocar a foto amplia e tocar o resto abre o detalhe. */
            <Pressable
              style={estadoDePressao(undefined, { escala: true })}
              onPress={() => onVerFoto(medication.photoUri ?? "", medication.name)}
              accessibilityRole="button"
              accessibilityLabel={`Ver a foto de ${medication.name}`}>
              <FotoLocal uri={medication.photoUri} style={styles.photo} />
            </Pressable>
          ) : (
            <View style={[styles.photo, styles.photoVazia]}>
              <Ionicons name="medkit-outline" size={24} color={cores.primary} />
            </View>
          )}

          <View style={styles.itemHeaderText}>
            <Text style={styles.name} numberOfLines={1}>
              {medication.name}
            </Text>
            {/* Quando, não quanto: no lugar do princípio ativo, que não diz nada sobre a rotina do
                dia a dia — é dado de identificação, não de uso, e já está no popup de detalhe. A
                dose por tomada ("1 comprimido") também não entra aqui: ao lado do estoque no
                rodapé, ela lia como "quanto tenho guardado". */}
            {prescription !== null ? (
              <Text style={styles.posology} numberOfLines={1}>
                {resumirFrequencia(prescription.schedule)}
                {horarios.length > 0 ? ` · ${horarios.join(", ")}` : ""}
              </Text>
            ) : (
              <Text style={styles.activeIngredient}>Sem tratamento cadastrado.</Text>
            )}
          </View>
        </View>

        {/* O card mostra cinco coisas e só elas: foto (ou o marcador), nome, frequência com os
            horários, estoque, e as duas ações. Onde o remédio está guardado saiu daqui — é dado de
            quem já foi buscar a caixa, não de quem está percorrendo a lista, e continua no popup de
            detalhe junto do resto. */}
        {inventory !== null ? (
          <View style={styles.footerRow}>
            {/* Sem estoque é o único caso em que o número vira aviso: o remédio acabou. */}
            <Text style={[styles.stock, inventory.quantity === 0 && styles.stockLow]}>
              {inventory.quantity === 0
                ? "Estoque zerado"
                : `Estoque: ${formatarQuantidadeLivre(inventory.quantity, inventory.unit)}`}
            </Text>
          </View>
        ) : null}
      </Pressable>

      {/* Editar/excluir dividindo a largura ao meio, separadas do toque em "ver detalhe" para as
          duas ações continuarem explícitas (nunca escondidas atrás de um gesto), sem competir
          mais pela largura do nome. */}
      <View style={styles.acoes}>
        {onEdit ? (
          <Pressable
            style={styles.acaoBotao}
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`Editar ${medication.name}`}
            hitSlop={6}>
            <Ionicons name="pencil-outline" size={16} color={cores.corDeDestaque} />
            <Text style={styles.acaoTexto}>Editar</Text>
          </Pressable>
        ) : null}
        {onEdit ? <View style={styles.acaoDivisor} /> : null}
        <Pressable
          style={styles.acaoBotao}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${medication.name}`}
          hitSlop={6}>
          <Ionicons name="trash-outline" size={16} color={cores.error} />
          <Text style={[styles.acaoTexto, styles.acaoTextoDestrutivo]}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

type LinhaDeDetalheProps = {
  rotulo: string;
  valor: string;
};

function LinhaDeDetalhe({ rotulo, valor }: LinhaDeDetalheProps) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.detalheLinha}>
      <Text style={styles.detalheRotulo}>{rotulo}</Text>
      <Text style={styles.detalheValor}>{valor}</Text>
    </View>
  );
}

/** Popup com tudo que o card não tem espaço para mostrar por extenso. */
function DetalheDoRemedio({ item }: { item: ItemDaListaDeRemedios }) {
  const styles = useEstilos(criarEstilos);
  const { medication, prescription, inventory } = item;
  const horarios =
    prescription === null
      ? []
      : horariosComDose(prescription.schedule, prescription.doseAmount, prescription.doseUnit);

  return (
    <View style={styles.detalheBloco}>
      {medication.activeIngredient.length > 0 ? (
        <LinhaDeDetalhe rotulo="Princípio ativo" valor={medication.activeIngredient} />
      ) : null}
      {prescription !== null ? (
        <>
          <LinhaDeDetalhe
            rotulo="Dose"
            valor={resumirDose(prescription.doseAmount, prescription.doseUnit, prescription.schedule)}
          />
          <LinhaDeDetalhe rotulo="Frequência" valor={resumirFrequencia(prescription.schedule)} />
          {horarios.length > 0 ? (
            <LinhaDeDetalhe rotulo="Horários" valor={horarios.join(" · ")} />
          ) : null}
        </>
      ) : (
        <LinhaDeDetalhe rotulo="Tratamento" valor="Sem tratamento cadastrado." />
      )}
      {inventory !== null ? (
        <LinhaDeDetalhe
          rotulo="Estoque"
          valor={
            inventory.quantity === 0
              ? "Zerado"
              : formatarQuantidadeLivre(inventory.quantity, inventory.unit)
          }
        />
      ) : null}
      {inventory?.storageLocation != null ? (
        <LinhaDeDetalhe rotulo="Guardado em" valor={inventory.storageLocation} />
      ) : null}
    </View>
  );
}

/**
 * Minúsculas e sem acento, pra "acido folico" achar "Ácido fólico". Quem procura um remédio
 * digita apressado e no teclado do celular, onde o acento custa dois toques.
 */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function RemediosScreen() {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();

  const router = useRouter();
  const { items, isLoading, error, reload } = useMedicationList();
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<OrdemDeRemedios>("alfabetica");
  /** A foto da caixa ampliada sobre a lista — o título é o nome do remédio. */
  const [midiaAberta, setMidiaAberta] = useState<{ uri: string; titulo: string } | null>(null);
  const [detalheAberto, setDetalheAberto] = useState<ItemDaListaDeRemedios | null>(null);

  // Sobre `items`, e não sobre `visiveis`: o acesso ao estoque não pode sumir porque a busca em
  // curso não casou com nenhum remédio controlado.
  const temEstoque = items.some((item) => item.inventory !== null);

  const termo = normalizar(busca.trim());
  // O princípio ativo entra na busca junto do nome: quem tem a caixa na mão às vezes lembra do
  // "losartana" e não do nome comercial.
  const encontrados =
    termo.length === 0
      ? items
      : items.filter(
          (item) =>
            normalizar(item.medication.name).includes(termo) ||
            normalizar(item.medication.activeIngredient).includes(termo),
        );
  const visiveis = ordenarRemedios(encontrados, ordem);

  function confirmarExclusao(item: ItemDaListaDeRemedios) {
    Alert.alert(
      `Excluir ${item.medication.name}?`,
      // Dizer o que sobrevive é o que separa "excluir" de "apagar tudo": quem tem receio de
      // perder o histórico precisa saber, antes de confirmar, que ele fica.
      "Os horários futuros deixam de existir e o remédio sai da sua lista. O histórico de doses já registradas é mantido.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await excluirMedicamento({
                medicationId: item.medication.id,
                prescriptionId: item.prescription?.id ?? null,
              });
              await reload();
            } catch (cause) {
              Alert.alert(
                "Não foi possível excluir",
                cause instanceof Error ? cause.message : "Tente novamente em instantes.",
              );
            }
          },
        },
      ],
    );
  }

  if (isLoading) return <CenteredLoader />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* O ícone de estoque saiu daqui: no teste em aparelho ele passou despercebido, e atalho que
          ninguém encontra não é atalho. Virou botão no corpo da tela, logo abaixo. */}
      <Header
        title="Medicações"
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      />

      <View style={styles.header}>
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
                : `${items.length} ${items.length === 1 ? "medicação cadastrada" : "medicações cadastradas"}`}
            </Text>

            {/* Só com mais de um: ordenar uma lista de um item é oferecer uma escolha sem efeito. */}
            {items.length > 1 ? (
              <SeletorDeOrdem
                value={ordem}
                onChange={setOrdem}
                options={ORDENS_DE_REMEDIO}
              />
            ) : null}
          </>
        ) : null}
      </View>

      {error !== null ? (
        <EstadoDeErro mensagem={error} onTentarDeNovo={() => void reload()} />
      ) : (
        <FlatList
          data={visiveis}
          keyExtractor={(item) => item.medication.id}
          /**
           * As mesmas duas props do `KeyboardAwareScrollView`, aqui à mão: esta tela tem campo de
           * busca mas não é formulário, então não passa por aquele componente — e ficava sem saída
           * nenhuma para o teclado. Arrastar a lista dispensa (o gesto de quem quer ver o que está
           * embaixo), e `handled` faz o primeiro toque num remédio valer em vez de ser gasto só
           * fechando o teclado.
           */
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ItemDeRemedio
              item={item}
              onVerFoto={(uri, nome) => setMidiaAberta({ uri, titulo: nome })}
              onAbrirDetalhe={() => setDetalheAberto(item)}
              onEdit={
                item.prescription === null
                  ? undefined
                  : () =>
                      router.push({
                        pathname: "/cadastro/editar/[id]",
                        params: { id: item.medication.id },
                      })
              }
              onDelete={() => confirmarExclusao(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // O texto explicativo rola junto com a lista, e só a busca fica fixa: parado no topo ele
          // custava três linhas de altura em toda rolagem, para dizer algo que se lê uma vez.
          // Só existe quando há estoque cadastrado: o botão leva a uma tela que, sem isso, abriria
          // vazia — e oferecer caminho para o vazio é pior que não oferecer.
          //
          // `null` e não um `View` vazio: o `gap` da lista conta o header como item, então um
          // contêiner sem conteúdo ainda abria um vão antes do primeiro card.
          ListHeaderComponent={
            temEstoque ? (
              <View style={styles.listHeader}>
                <Button
                  label="Gerenciar estoques"
                  variant="outline"
                  icon={<Ionicons name="cube-outline" size={20} color={cores.primary} />}
                  onPress={() => router.push("/estoque")}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            // Busca sem resultado e lista vazia pedem respostas diferentes: uma se resolve
            // mudando o que foi digitado, a outra cadastrando algo.
            termo.length > 0 ? (
              <EstadoVazio
                icone="search"
                titulo="Nenhuma medicação encontrada"
                descricao={`Nada por aqui combina com “${busca.trim()}”. Confira a escrita ou busque pelo princípio ativo.`}
              />
            ) : (
              <EstadoVazio
                icone="medkit"
                titulo="Nenhum remédio por aqui ainda"
                descricao="Toque no + para cadastrar seu primeiro medicamento."
              />
            )
          }
        />
      )}

      {/* Vai direto para "escanear ou manual": quem está na lista de remédios já respondeu, ao
          estar aqui, que o que vai cadastrar é um remédio — passar pela pergunta "medicação ou
          compromisso?" seria pedir de novo o que a tela já diz. */}
      <Fab
        accessibilityLabel="Cadastrar medicação"
        onPress={() => router.push("/cadastro/medicamento")}
      />

      <VisualizadorDeMidia
        uri={midiaAberta?.uri ?? null}
        titulo={midiaAberta?.titulo ?? ""}
        onClose={() => setMidiaAberta(null)}
      />

      <BottomSheet
        visible={detalheAberto !== null}
        onClose={() => setDetalheAberto(null)}
        title={detalheAberto?.medication.name ?? ""}>
        {detalheAberto !== null ? <DetalheDoRemedio item={detalheAberto} /> : null}
      </BottomSheet>
    </SafeAreaView>
  );
}
